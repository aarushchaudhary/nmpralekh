from django.db import transaction
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers

from apps.accounts.permissions import RolePermission
from apps.schools.utils import get_user_school_ids, scope_to_faculty
from apps.records.cache_utils import get_dashboard_counts, invalidate_dashboard_cache
from config.pagination import StandardPagination
from apps.audit.models import AuditRequest
from apps.records.models import (
    Club,
    SchoolActivity, SchoolActivityCollaboration,
    StudentActivity, StudentActivityCollaboration,
    FacultyFDPWorkshopGL, FacultyPublication, PublicationAuthor,
    Patent, PatentApplicant, Certification, PlacementActivity
)
from apps.records.serializers import (
    ClubSerializer,
    SchoolActivitySerializer,
    StudentActivitySerializer, FacultyFDPWorkshopGLSerializer,
    FacultyPublicationSerializer, PublicationAuthorSerializer,
    PatentSerializer, PatentApplicantSerializer,
    CertificationSerializer, PlacementActivitySerializer,
)
import json


def create_audit_request(user, table_name, record, action, new_data=None):
    """
    Helper — snapshots old data and creates a pending audit request.
    Called on every UPDATE and DELETE instead of saving directly.

    Race-condition note: the double-submission guard MUST run inside
    transaction.atomic() after a select_for_update() re-fetch.  Checking
    record.pending_audit_id on the already-fetched object (TOCTOU) lets two
    concurrent requests both read None, both pass, and both create an
    AuditRequest — orphaning the first one.  select_for_update() acquires a
    DB-level row lock so the second request blocks until the first transaction
    commits, then re-reads the now-populated pending_audit_id and raises.
    """
    # Explicitly cast to plain dict — request.data can be a QueryDict (form-encoded)
    # which stores multiple values per key; JSONField needs a plain dict.
    safe_new_data = dict(new_data) if new_data is not None else None

    with transaction.atomic():
        # Re-fetch with a row-level lock.  A concurrent request that reaches
        # this line will block until our transaction commits, then read the
        # updated pending_audit_id and raise ValidationError below.
        locked_record = type(record).objects.select_for_update().get(
            pk=record.pk
        )

        if locked_record.pending_audit_id is not None:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                'A change request is already pending for this record. '
                'Please wait for it to be reviewed before submitting another.'
            )

        # Compute old_data from the locked record (guaranteed-fresh DB version).
        # Using the pre-fetched `record` object would risk a stale snapshot if a
        # concurrent operation modified the row between get_object() and the lock.
        old_data = {}
        for field in locked_record._meta.fields:
            value = getattr(locked_record, field.name)
            old_data[field.name] = str(value) if value is not None else None

        audit = AuditRequest.objects.create(
            table_name   = table_name,
            record_id    = locked_record.id,
            action       = action,
            old_data     = old_data,
            new_data     = safe_new_data,
            requested_by = user,
            school       = getattr(locked_record, 'school', None),
            status       = 'pending'
        )

        # mark the record as having a pending change
        locked_record.pending_audit = audit
        locked_record.save()

    return audit


def check_school(user, school):
    if school.id not in get_user_school_ids(user):
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied('You can only add records to your own schools.')


# ─────────────────────────────────────────────
# BASE MIXIN — shared logic for all modules
# ─────────────────────────────────────────────
class SchoolScopedMixin:
    """
    Mixin that scopes all querysets to the user's assigned schools
    and excludes soft-deleted records.
    Inherit this in all record views.
    """
    def get_base_queryset(self, model):
        school_ids = get_user_school_ids(self.request.user)
        return model.objects.filter(
            school_id__in=school_ids,
            is_deleted=False
        ).select_related('school', 'created_by')

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            if hasattr(obj, 'created_by') and obj.created_by and not getattr(obj.created_by, 'is_active', True):
                if request.user.role != 'super_admin':
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("Records created by deactivated users can only be modified or deleted by a super admin.")


class AuditedDetailMixin(SchoolScopedMixin):
    """
    Detail views never write directly: every UPDATE/DELETE becomes a pending
    audit request. The model's db_table is the audit table_name.
    """
    def validated_new_data(self, record):
        # Validate the edit now, not at approval time; store raw values for validated keys only
        serializer = self.get_serializer(record, data=self.request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        return {k: self.request.data[k] for k in serializer.validated_data}

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, record._meta.db_table, record, 'UPDATE', self.validated_new_data(record))
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, record._meta.db_table, record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


class InvalidateDashboardCacheMixin:
    """
    Mixin to invalidate the dashboard cache whenever a new record is created.
    """
    def perform_create(self, serializer):
        check_school(self.request.user, serializer.validated_data['school'])
        instance = serializer.save()
        if hasattr(instance, 'school_id'):
            invalidate_dashboard_cache([instance.school_id])


# ─────────────────────────────────────────────
# CLUBS & COMMITTEES
# ─────────────────────────────────────────────
from apps.accounts.permissions import RolePermission


class ClubListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = ClubSerializer
    permission_classes = [RolePermission(['admin', 'user'])]
    pagination_class   = StandardPagination

    def get_queryset(self):
        school_ids = get_user_school_ids(self.request.user)
        qs = Club.objects.filter(
            school_id__in=school_ids
        ).select_related('school', 'created_by')
        # optional query params for filtering
        school = self.request.query_params.get('school')
        if school:
            if not str(school).isdigit():
                return Club.objects.none()
            qs = qs.filter(school_id=school)
        club_type = self.request.query_params.get('type')
        if club_type:
            qs = qs.filter(type=club_type)
        active = self.request.query_params.get('is_active')
        if active is not None:
            qs = qs.filter(is_active=active.lower() == 'true')
        return qs

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['admin'])()]
        return [RolePermission(['admin', 'user'])()]

    def perform_create(self, serializer):
        check_school(self.request.user, serializer.validated_data['school'])
        serializer.save()


class ClubDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ClubSerializer
    permission_classes = [RolePermission(['admin'])]

    def get_queryset(self):
        school_ids = get_user_school_ids(self.request.user)
        return Club.objects.filter(school_id__in=school_ids).select_related('school', 'created_by')

    def perform_update(self, serializer):
        if 'school' in serializer.validated_data:
            check_school(self.request.user, serializer.validated_data['school'])
        serializer.save()


# ─────────────────────────────────────────────
# SCHOOL ACTIVITIES
# ─────────────────────────────────────────────
class SchoolActivityListCreateView(InvalidateDashboardCacheMixin, SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = SchoolActivitySerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])]
    pagination_class   = StandardPagination

    def get_queryset(self):
        qs = self.get_base_queryset(SchoolActivity)
        return qs.select_related(
            'school', 'created_by'
        ).prefetch_related('collaborations__collaborating_school')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['admin', 'user'])()]
        return [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])()]


class SchoolActivityDetailView(AuditedDetailMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SchoolActivitySerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'])]

    def get_queryset(self):
        return self.get_base_queryset(SchoolActivity)


# ─────────────────────────────────────────────
# STUDENT ACTIVITIES
# ─────────────────────────────────────────────
class StudentActivityListCreateView(InvalidateDashboardCacheMixin, SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = StudentActivitySerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])]
    pagination_class   = StandardPagination

    def get_queryset(self):
        qs = self.get_base_queryset(StudentActivity)
        return qs.select_related(
            'school', 'created_by'
        ).prefetch_related('collaborations__collaborating_school')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['admin', 'user'])()]
        return [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])()]


class StudentActivityDetailView(AuditedDetailMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = StudentActivitySerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'])]

    def get_queryset(self):
        return self.get_base_queryset(StudentActivity)


# ─────────────────────────────────────────────
# FACULTY FDP / WORKSHOP / GL
# ─────────────────────────────────────────────
class FDPListCreateView(InvalidateDashboardCacheMixin, SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = FacultyFDPWorkshopGLSerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])]
    pagination_class   = StandardPagination

    def get_queryset(self):
        qs = self.get_base_queryset(FacultyFDPWorkshopGL)
        return qs.select_related('school', 'created_by')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['admin', 'user'])()]
        return [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])()]


class FDPDetailView(AuditedDetailMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = FacultyFDPWorkshopGLSerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'])]

    def get_queryset(self):
        return self.get_base_queryset(FacultyFDPWorkshopGL)


# ─────────────────────────────────────────────
# FACULTY PUBLICATIONS
# ─────────────────────────────────────────────
class PublicationAuthorListCreateView(generics.ListCreateAPIView):
    serializer_class   = PublicationAuthorSerializer
    permission_classes = [RolePermission(['admin', 'user'])]

    def get_publication(self):
        from rest_framework.exceptions import NotFound
        school_ids     = get_user_school_ids(self.request.user)
        publication_id = self.kwargs['publication_id']
        try:
            qs = FacultyPublication.objects.filter(
                pk=publication_id,
                school_id__in=school_ids,
                is_deleted=False
            )
            # faculty can only manage authors on their own publications
            if self.request.user.role == 'user':
                qs = qs.filter(created_by=self.request.user)
            return qs.get()
        except FacultyPublication.DoesNotExist:
            raise NotFound('Publication not found')

    def get_queryset(self):
        pub = self.get_publication()
        return PublicationAuthor.objects.filter(publication=pub)

    def perform_create(self, serializer):
        pub = self.get_publication()
        serializer.save(publication=pub)


class PublicationAuthorDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PublicationAuthorSerializer
    permission_classes = [RolePermission(['admin', 'user'])]

    def get_queryset(self):
        school_ids     = get_user_school_ids(self.request.user)
        publication_id = self.kwargs['publication_id']
        valid_pub_ids  = FacultyPublication.objects.filter(
            school_id__in=school_ids,
            is_deleted=False
        )
        # faculty can only manage authors on their own publications
        if self.request.user.role == 'user':
            valid_pub_ids = valid_pub_ids.filter(created_by=self.request.user)
        valid_pub_ids = valid_pub_ids.values_list('id', flat=True)
        return PublicationAuthor.objects.filter(
            publication_id__in=valid_pub_ids,
            publication_id=publication_id
        )


class PublicationListCreateView(InvalidateDashboardCacheMixin, SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = FacultyPublicationSerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])]
    pagination_class   = StandardPagination

    def get_queryset(self):
        user       = self.request.user
        school_ids = get_user_school_ids(user)
        qs         = FacultyPublication.objects.filter(
                         school_id__in=school_ids,
                         is_deleted=False
                     ).select_related(
                         'school', 'created_by'
                     ).prefetch_related('authors__user')
        return scope_to_faculty(qs, user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['admin', 'user'])()]
        return [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])()]


class PublicationDetailView(AuditedDetailMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = FacultyPublicationSerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'])]

    def get_queryset(self):
        qs = self.get_base_queryset(FacultyPublication)
        if self.request.user.role == 'user':
            qs = qs.filter(created_by=self.request.user)
        return qs


# ─────────────────────────────────────────────
# PATENTS
# ─────────────────────────────────────────────
class PatentApplicantListCreateView(generics.ListCreateAPIView):
    serializer_class   = PatentApplicantSerializer
    permission_classes = [RolePermission(['admin', 'user'])]

    def get_patent(self):
        from rest_framework.exceptions import NotFound
        school_ids = get_user_school_ids(self.request.user)
        patent_id  = self.kwargs['patent_id']
        try:
            qs = Patent.objects.filter(
                pk=patent_id,
                school_id__in=school_ids,
                is_deleted=False
            )
            # faculty can only manage applicants on their own patents
            if self.request.user.role == 'user':
                qs = qs.filter(created_by=self.request.user)
            return qs.get()
        except Patent.DoesNotExist:
            raise NotFound('Patent not found')

    def get_queryset(self):
        patent = self.get_patent()
        return PatentApplicant.objects.filter(patent=patent)

    def perform_create(self, serializer):
        patent = self.get_patent()
        serializer.save(patent=patent)


class PatentApplicantDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PatentApplicantSerializer
    permission_classes = [RolePermission(['admin', 'user'])]

    def get_queryset(self):
        school_ids = get_user_school_ids(self.request.user)
        patent_id  = self.kwargs['patent_id']
        valid_patent_ids = Patent.objects.filter(
            school_id__in=school_ids,
            is_deleted=False
        )
        # faculty can only manage applicants on their own patents
        if self.request.user.role == 'user':
            valid_patent_ids = valid_patent_ids.filter(created_by=self.request.user)
        valid_patent_ids = valid_patent_ids.values_list('id', flat=True)
        return PatentApplicant.objects.filter(
            patent_id__in=valid_patent_ids,
            patent_id=patent_id
        )


class PatentListCreateView(InvalidateDashboardCacheMixin, SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = PatentSerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])]
    pagination_class   = StandardPagination

    def get_queryset(self):
        user       = self.request.user
        school_ids = get_user_school_ids(user)
        qs         = Patent.objects.filter(
                         school_id__in=school_ids,
                         is_deleted=False
                     ).select_related(
                         'school', 'created_by'
                     ).prefetch_related('applicants__user')
        return scope_to_faculty(qs, user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['admin', 'user'])()]
        return [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])()]


class PatentDetailView(AuditedDetailMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PatentSerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'])]

    def get_queryset(self):
        qs = self.get_base_queryset(Patent)
        if self.request.user.role == 'user':
            qs = qs.filter(created_by=self.request.user)
        return qs


# ─────────────────────────────────────────────
# CERTIFICATIONS
# ─────────────────────────────────────────────
class CertificationListCreateView(InvalidateDashboardCacheMixin, SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = CertificationSerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])]
    pagination_class   = StandardPagination

    def get_queryset(self):
        user       = self.request.user
        school_ids = get_user_school_ids(user)
        qs         = Certification.objects.filter(
                         school_id__in=school_ids,
                         is_deleted=False
                     ).select_related('school', 'created_by')
        return scope_to_faculty(qs, user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['admin', 'user'])()]
        return [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])()]


class CertificationDetailView(AuditedDetailMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CertificationSerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'])]

    def get_queryset(self):
        qs = self.get_base_queryset(Certification)
        if self.request.user.role == 'user':
            qs = qs.filter(created_by=self.request.user)
        return qs


# ─────────────────────────────────────────────
# PLACEMENT ACTIVITIES
# ─────────────────────────────────────────────
class PlacementListCreateView(InvalidateDashboardCacheMixin, SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = PlacementActivitySerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])]
    pagination_class   = StandardPagination

    def get_queryset(self):
        qs = self.get_base_queryset(PlacementActivity)
        return qs.select_related('school', 'created_by')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [RolePermission(['admin', 'user'])()]
        return [RolePermission(['admin', 'user', 'super_admin'], read_only_roles=['mis_coordinator'])()]


class PlacementDetailView(AuditedDetailMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PlacementActivitySerializer
    permission_classes = [RolePermission(['admin', 'user', 'super_admin'])]

    def get_queryset(self):
        return self.get_base_queryset(PlacementActivity)


from rest_framework.views import APIView
from apps.accounts.throttles import FixedWindowThrottle

class DashboardCountsView(APIView):
    permission_classes  = [IsAuthenticated]
    throttle_classes    = [FixedWindowThrottle]
    throttle_scope      = "dashboard"  # 120/min — Redis-cached endpoint, cache misses only
    serializer_class    = serializers.Serializer

    def get(self, request):
        school_ids = list(get_user_school_ids(request.user))
        counts     = get_dashboard_counts(school_ids, request.user)
        return Response(counts)



# ─────────────────────────────────────────────
# DATABASE BACKUP
# ─────────────────────────────────────────────
import json
from django.conf import settings as django_settings
from django_celery_beat.models import CrontabSchedule, PeriodicTask
from apps.accounts.permissions import RolePermission
from .models import BackupConfiguration
from .serializers import BackupConfigurationSerializer
from .tasks import perform_db_backup


class BackupConfigurationView(APIView):
    permission_classes = [RolePermission(['master'], exclude_service_admin=True)]
    serializer_class = BackupConfigurationSerializer

    def _get_or_create_config(self):
        config = BackupConfiguration.objects.first()
        if not config:
            config = BackupConfiguration.objects.create()
        return config

    def get(self, request):
        config     = self._get_or_create_config()
        serializer = BackupConfigurationSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        config     = self._get_or_create_config()
        serializer = BackupConfigurationSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            self._update_beat_schedule(serializer.instance)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _update_beat_schedule(self, config):
        """Sync the BackupConfiguration fields to a django-celery-beat
        PeriodicTask so Celery Beat picks up the schedule immediately."""
        TASK_NAME = 'automated-database-backup'
        TASK_PATH = 'apps.records.tasks.perform_db_backup'

        if not config.is_active:
            # Disable without deleting so the schedule survives a re-enable.
            PeriodicTask.objects.filter(name=TASK_NAME).update(enabled=False)
            return

        if config.schedule_type == 'weekly':
            # Model stores 0=Monday; Celery crontab uses 0=Sunday.
            # Shift right by 1 with wrap-around: Monday(0)->1, …, Sunday(6)->0
            day_of_week = str((config.schedule_day + 1) % 7) if config.schedule_day is not None else '1'
            schedule, _ = CrontabSchedule.objects.get_or_create(
                minute='0',
                hour='2',
                day_of_week=day_of_week,
                day_of_month='*',
                month_of_year='*',
                timezone=django_settings.TIME_ZONE,
            )
        else:
            # Monthly — run on the 1st of each month at 2 AM.
            schedule, _ = CrontabSchedule.objects.get_or_create(
                minute='0',
                hour='2',
                day_of_week='*',
                day_of_month='1',
                month_of_year='*',
                timezone=django_settings.TIME_ZONE,
            )

        PeriodicTask.objects.update_or_create(
            name=TASK_NAME,
            defaults={
                'crontab':  schedule,
                'task':     TASK_PATH,
                'args':     json.dumps([]),
                'kwargs':   json.dumps({'scope': 'full'}),
                'enabled':  True,
            },
        )


class TriggerManualBackupView(APIView):
    permission_classes = [RolePermission(['master'], exclude_service_admin=True)]
    serializer_class = serializers.Serializer

    def post(self, request):
        perform_db_backup.delay(scope='full')
        return Response({"message": "Backup task has been added to the queue."})


# ─────────────────────────────────────────────
# FACULTY / STAFF USER SEARCH
# Used by co-author / co-applicant picker in Publications & Patents
# ─────────────────────────────────────────────
from apps.accounts.models import User as AccountUser
from apps.accounts.serializers import UserVisibilitySerializer
from rest_framework.filters import SearchFilter as DRFSearchFilter


class FacultyUserSearchView(generics.ListAPIView):
    """
    Returns a lightweight list of faculty / admin / super_admin users
    that can be linked as co-authors or co-applicants.
    Accessible by any authenticated user.
    Supports ?search= query param (matches full_name, username, email).
    """
    permission_classes = [IsAuthenticated]
    filter_backends    = [DRFSearchFilter]
    search_fields      = ['full_name', 'username', 'email']
    serializer_class = UserVisibilitySerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return AccountUser.objects.none()
        return AccountUser.objects.filter(
            is_active=True,
            role__in=['user', 'admin', 'super_admin']
        ).order_by('full_name').only('id', 'full_name', 'username', 'role')

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        # Limit to 20 results — this is a live-search, not a full list
        qs = qs[:20]
        data = [
            {
                'id':        u.id,
                'full_name': u.full_name,
                'username':  u.username,
                'role':      u.role,
            }
            for u in qs
        ]
        return Response(data)