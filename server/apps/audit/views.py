from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from django.apps import apps

from apps.audit.models import AuditRequest
from apps.audit.serializers import AuditRequestSerializer
from apps.accounts.permissions import IsDeleteAuth, IsMasterOrSuperAdmin
from apps.accounts.throttles import AuditThrottle
from apps.schools.utils import get_user_school_ids
from apps.records.cache_utils import invalidate_dashboard_cache
from config.pagination import StandardPagination


class AuditRequestListView(generics.ListAPIView):
    serializer_class   = AuditRequestSerializer
    permission_classes = [IsDeleteAuth]
    pagination_class   = StandardPagination

    def get_queryset(self):
        user = self.request.user
        school_ids = get_user_school_ids(user)
        qs = AuditRequest.objects.filter(status='pending')
        # Only scope if user is not a superadmin (or decide if superadmin sees all)
        # get_user_school_ids correctly returns all if superadmin, so we just filter
        return qs.filter(school_id__in=school_ids).select_related(
            'requested_by__campus',
            'reviewed_by__campus',
        )


class AuditRequestDetailView(generics.RetrieveAPIView):
    serializer_class   = AuditRequestSerializer
    permission_classes = [IsDeleteAuth]

    def get_queryset(self):
        school_ids = get_user_school_ids(self.request.user)
        return AuditRequest.objects.filter(school_id__in=school_ids).select_related(
            'requested_by__campus',
            'reviewed_by__campus',
        )


class AuditApproveView(APIView):
    permission_classes = [IsDeleteAuth]
    throttle_classes   = [AuditThrottle]  # 60/min per user — well above human review speed
    serializer_class = serializers.Serializer

    def post(self, request, pk):
        school_ids = get_user_school_ids(request.user)
        try:
            audit = AuditRequest.objects.get(
                pk=pk,
                status='pending',
                school_id__in=school_ids,
            )
        except AuditRequest.DoesNotExist:
            return Response(
                {'detail': 'Audit request not found or already reviewed'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            with transaction.atomic():
                # map table name to Django model
                table_model_map = {
                    'school_activities':     ('records', 'SchoolActivity'),
                    'student_activities':    ('records', 'StudentActivity'),
                    'faculty_fdp_workshop_gl': ('records', 'FacultyFDPWorkshopGL'),
                    'faculty_publications':  ('records', 'FacultyPublication'),
                    'patents':               ('records', 'Patent'),
                    'certifications':        ('records', 'Certification'),
                    'placement_activities':  ('records', 'PlacementActivity'),
                }

                if audit.table_name not in table_model_map:
                    return Response(
                        {'detail': f'Approval not supported for table: {audit.table_name}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                app_label, model_name = table_model_map[audit.table_name]
                Model  = apps.get_model(app_label, model_name)
                record = Model.objects.get(pk=audit.record_id)

                if audit.action == 'DELETE':
                    record.is_deleted    = True
                    record.pending_audit = None
                    record.save()

                elif audit.action == 'UPDATE':
                    new_data = audit.new_data

                    ALLOWED_FIELDS = {
                        'school_activities': ['name', 'date', 'details', 'is_school_wide'],
                        'student_activities': ['name', 'date', 'details', 'club', 'club_name',
                                               'conducted_by', 'activity_type'],
                        'faculty_fdp_workshop_gl': ['faculty_name', 'date_start', 'date_end',
                                                    'name', 'details', 'type', 'organizing_body'],
                        'faculty_publications': ['author_name', 'author_type', 'title_of_paper',
                                                 'journal_or_conference_name', 'date', 'venue',
                                                 'publication', 'doi_or_link', 'is_own_work'],
                        'patents': ['applicant_name', 'applicant_type', 'title_of_patent', 'details',
                                    'date_of_publication', 'journal_number', 'patent_status',
                                    'doi_or_link', 'is_own_work'],
                        'certifications': ['date', 'name', 'title_of_course', 'details', 'agency',
                                           'credly_or_proof_link', 'person_type'],
                        'placement_activities': ['name', 'date', 'details', 'company_name',
                                                 'placecom_name'],
                    }

                    allowed = ALLOWED_FIELDS.get(audit.table_name, [])
                    for field in allowed:
                        if field in new_data:
                            value = new_data[field]
                            try:
                                model_field = Model._meta.get_field(field)
                                if model_field.is_relation and model_field.many_to_one:
                                    # FK field — set via _id to avoid descriptor ValueError
                                    setattr(record, f'{field}_id', value)
                                else:
                                    setattr(record, field, value)
                            except Exception:
                                setattr(record, field, value)

                    if audit.table_name == 'student_activities' and 'club' in new_data and 'club_name' not in new_data:
                        if getattr(record, 'club', None):
                            record.club_name = record.club.name
                        else:
                            record.club_name = None

                    record.pending_audit = None
                    record.save()

                # mark audit request as approved
                audit.status      = 'approved'
                audit.reviewed_by = request.user
                audit.reviewed_at = timezone.now()
                audit.save()

        except Exception as e:
            return Response(
                {'detail': f'Approval failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # outside transaction — best effort, Redis failure is non-critical
        try:
            if hasattr(record, 'school_id'):
                invalidate_dashboard_cache([record.school_id])
        except Exception:
            pass

        return Response({'detail': 'Request approved and changes applied'})


class AuditRejectView(APIView):
    permission_classes = [IsDeleteAuth]
    throttle_classes   = [AuditThrottle]  # 60/min per user — well above human review speed
    serializer_class = serializers.Serializer

    def post(self, request, pk):
        school_ids = get_user_school_ids(request.user)
        try:
            audit = AuditRequest.objects.get(
                pk=pk,
                status='pending',
                school_id__in=school_ids,
            )
        except AuditRequest.DoesNotExist:
            return Response(
                {'detail': 'Audit request not found or already reviewed'},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            # clear the pending flag on the record
            table_model_map = {
                'school_activities':       ('records', 'SchoolActivity'),
                'student_activities':      ('records', 'StudentActivity'),
                'faculty_fdp_workshop_gl': ('records', 'FacultyFDPWorkshopGL'),
                'faculty_publications':    ('records', 'FacultyPublication'),
                'patents':                 ('records', 'Patent'),
                'certifications':          ('records', 'Certification'),
                'placement_activities':    ('records', 'PlacementActivity'),
            }

            if audit.table_name in table_model_map:
                try:
                    app_label, model_name = table_model_map[audit.table_name]
                    Model  = apps.get_model(app_label, model_name)
                    record = Model.objects.get(pk=audit.record_id)
                    record.pending_audit = None
                    record.save()
                except Model.DoesNotExist:
                    pass

            audit.status      = 'rejected'
            audit.reviewed_by = request.user
            audit.reviewed_at = timezone.now()
            audit.save()

        return Response({'detail': 'Request rejected — record unchanged'})


class AuditHistoryView(generics.ListAPIView):
    serializer_class   = AuditRequestSerializer
    permission_classes = [IsMasterOrSuperAdmin | IsDeleteAuth]
    pagination_class   = StandardPagination  # server-side pagination — history can grow to thousands of rows

    def get_queryset(self):
        user = self.request.user
        school_ids = get_user_school_ids(user)
        return AuditRequest.objects.filter(
            school_id__in=school_ids
        ).exclude(
            status='pending'
        ).select_related(
            'requested_by__campus',
            'reviewed_by__campus',
        ).order_by('-reviewed_at')