from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdminOrUser, IsAdminOrUserOrSuperAdmin
from apps.schools.utils import get_user_school_ids
from apps.records.cache_utils import get_dashboard_counts
from apps.audit.models import AuditRequest
from apps.records.models import (
    ExamsConducted, SchoolActivity, SchoolActivityCollaboration,
    StudentActivity, StudentActivityCollaboration,
    FacultyFDPWorkshopGL, FacultyPublication, PublicationAuthor,
    Patent, PatentApplicant, Certification, PlacementActivity, StudentMarks
)
from apps.records.serializers import (
    ExamsConductedSerializer, SchoolActivitySerializer,
    StudentActivitySerializer, FacultyFDPWorkshopGLSerializer,
    FacultyPublicationSerializer, PublicationAuthorSerializer,
    PatentSerializer, PatentApplicantSerializer,
    CertificationSerializer, PlacementActivitySerializer,
    StudentMarksSerializer
)
import json


def create_audit_request(user, table_name, record, action, new_data=None):
    """
    Helper — snapshots old data and creates a pending audit request.
    Called on every UPDATE and DELETE instead of saving directly.
    """
    # serialize current record to JSON for snapshot
    old_data = {}
    for field in record._meta.fields:
        value = getattr(record, field.name)
        old_data[field.name] = str(value) if value is not None else None

    audit = AuditRequest.objects.create(
        table_name   = table_name,
        record_id    = record.id,
        action       = action,
        old_data     = old_data,
        new_data     = new_data,
        requested_by = user,
        school       = getattr(record, 'school', None),
        status       = 'pending'
    )

    # mark the record as having a pending change
    record.pending_audit = audit
    record.save()

    return audit


# ─────────────────────────────────────────────
# BASE MIXIN — shared logic for all 8 modules
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
        )


# ─────────────────────────────────────────────
# EXAMS CONDUCTED
# ─────────────────────────────────────────────
class ExamsListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = ExamsConductedSerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        qs = self.get_base_queryset(ExamsConducted)
        return qs.select_related(
            'school', 'exam_group', 'subject',
            'class_group', 'faculty', 'created_by'
        )

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrUser()]
        return [IsAdminOrUserOrSuperAdmin()]


class ExamsDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ExamsConductedSerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        return self.get_base_queryset(ExamsConducted)

    def update(self, request, *args, **kwargs):
        record   = self.get_object()
        new_data = request.data
        audit    = create_audit_request(request.user, 'exams_conducted', record, 'UPDATE', new_data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'exams_conducted', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# SCHOOL ACTIVITIES
# ─────────────────────────────────────────────
class SchoolActivityListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = SchoolActivitySerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        qs = self.get_base_queryset(SchoolActivity)
        return qs.select_related(
            'school', 'created_by'
        ).prefetch_related('collaborations')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrUser()]
        return [IsAdminOrUserOrSuperAdmin()]


class SchoolActivityDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SchoolActivitySerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        return self.get_base_queryset(SchoolActivity)

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'school_activities', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'school_activities', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# STUDENT ACTIVITIES
# ─────────────────────────────────────────────
class StudentActivityListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = StudentActivitySerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        qs = self.get_base_queryset(StudentActivity)
        return qs.select_related(
            'school', 'club', 'created_by'
        ).prefetch_related('collaborations')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrUser()]
        return [IsAdminOrUserOrSuperAdmin()]


class StudentActivityDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = StudentActivitySerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        return self.get_base_queryset(StudentActivity)

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'student_activities', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'student_activities', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# FACULTY FDP / WORKSHOP / GL
# ─────────────────────────────────────────────
class FDPListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = FacultyFDPWorkshopGLSerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        qs = self.get_base_queryset(FacultyFDPWorkshopGL)
        return qs.select_related('school', 'created_by')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrUser()]
        return [IsAdminOrUserOrSuperAdmin()]


class FDPDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = FacultyFDPWorkshopGLSerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        return self.get_base_queryset(FacultyFDPWorkshopGL)

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'faculty_fdp_workshop_gl', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'faculty_fdp_workshop_gl', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# FACULTY PUBLICATIONS
# ─────────────────────────────────────────────
class PublicationAuthorListCreateView(generics.ListCreateAPIView):
    serializer_class   = PublicationAuthorSerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        publication_id = self.kwargs['publication_id']
        return PublicationAuthor.objects.filter(
            publication_id=publication_id
        )

    def perform_create(self, serializer):
        publication_id = self.kwargs['publication_id']
        serializer.save(publication_id=publication_id)


class PublicationAuthorDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PublicationAuthorSerializer
    permission_classes = [IsAdminOrUser]
    queryset           = PublicationAuthor.objects.all()


class PublicationListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = FacultyPublicationSerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        user       = self.request.user
        school_ids = get_user_school_ids(user)
        qs         = FacultyPublication.objects.filter(
                         school_id__in=school_ids,
                         is_deleted=False
                     ).select_related(
                         'school', 'created_by'
                     ).prefetch_related('authors')
        if user.role == 'user':
            qs = qs.filter(created_by=user)
        return qs

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrUser()]
        return [IsAdminOrUserOrSuperAdmin()]


class PublicationDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = FacultyPublicationSerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        return self.get_base_queryset(FacultyPublication)

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'faculty_publications', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'faculty_publications', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# PATENTS
# ─────────────────────────────────────────────
class PatentApplicantListCreateView(generics.ListCreateAPIView):
    serializer_class   = PatentApplicantSerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        patent_id = self.kwargs['patent_id']
        return PatentApplicant.objects.filter(patent_id=patent_id)

    def perform_create(self, serializer):
        patent_id = self.kwargs['patent_id']
        serializer.save(patent_id=patent_id)


class PatentApplicantDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PatentApplicantSerializer
    permission_classes = [IsAdminOrUser]
    queryset           = PatentApplicant.objects.all()


class PatentListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = PatentSerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        user       = self.request.user
        school_ids = get_user_school_ids(user)
        qs         = Patent.objects.filter(
                         school_id__in=school_ids,
                         is_deleted=False
                     ).select_related(
                         'school', 'created_by'
                     ).prefetch_related('applicants')
        if user.role == 'user':
            qs = qs.filter(created_by=user)
        return qs

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrUser()]
        return [IsAdminOrUserOrSuperAdmin()]


class PatentDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PatentSerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        return self.get_base_queryset(Patent)

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'patents', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'patents', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# CERTIFICATIONS
# ─────────────────────────────────────────────
class CertificationListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = CertificationSerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        user       = self.request.user
        school_ids = get_user_school_ids(user)
        qs         = Certification.objects.filter(
                         school_id__in=school_ids,
                         is_deleted=False
                     ).select_related('school', 'created_by')
        if user.role == 'user':
            qs = qs.filter(created_by=user)
        return qs

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrUser()]
        return [IsAdminOrUserOrSuperAdmin()]


class CertificationDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CertificationSerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        return self.get_base_queryset(Certification)

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'certifications', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'certifications', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# PLACEMENT ACTIVITIES
# ─────────────────────────────────────────────
class PlacementListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = PlacementActivitySerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        qs = self.get_base_queryset(PlacementActivity)
        return qs.select_related('school', 'placecom', 'created_by')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrUser()]
        return [IsAdminOrUserOrSuperAdmin()]


class PlacementDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PlacementActivitySerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        return self.get_base_queryset(PlacementActivity)

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'placement_activities', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'placement_activities', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# STUDENT MARKS
# ─────────────────────────────────────────────
class StudentMarksListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = StudentMarksSerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        school_ids = get_user_school_ids(self.request.user)
        qs         = StudentMarks.objects.filter(
                         exam__school_id__in=school_ids
                     ).select_related(
                         'exam', 'exam__school', 'exam__exam_group',
                         'exam__subject', 'exam__class_group', 'created_by'
                     )
        exam_id = self.request.query_params.get('exam_id')
        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        return qs


class StudentMarksDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = StudentMarksSerializer
    permission_classes = [IsAdminOrUser]

    def get_queryset(self):
        school_ids = get_user_school_ids(self.request.user)
        return StudentMarks.objects.filter(
            exam__school_id__in=school_ids
        )


from rest_framework.views import APIView

class DashboardCountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        school_ids = list(get_user_school_ids(request.user))
        counts     = get_dashboard_counts(school_ids, request.user.role)
        return Response(counts)


# ─────────────────────────────────────────────
# DATABASE BACKUP
# ─────────────────────────────────────────────
from apps.accounts.permissions import IsMaster
from .models import BackupConfiguration
from .serializers import BackupConfigurationSerializer
from .tasks import perform_db_backup


class BackupConfigurationView(APIView):
    permission_classes = [IsMaster]

    def get(self, request):
        config, created = BackupConfiguration.objects.get_or_create(id=1)
        serializer = BackupConfigurationSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        config, created = BackupConfiguration.objects.get_or_create(id=1)
        serializer = BackupConfigurationSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            # Logic to dynamically update django-celery-beat schedule goes here
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TriggerManualBackupView(APIView):
    permission_classes = [IsMaster]

    def post(self, request):
        scope = request.data.get('backup_scope', 'full')
        date_from = request.data.get('date_from')
        date_to = request.data.get('date_to')
        perform_db_backup.delay(scope=scope, date_from=date_from, date_to=date_to)
        return Response({"message": "Backup task has been added to the queue."})