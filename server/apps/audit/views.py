from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.apps import apps

from apps.audit.models import AuditRequest
from apps.audit.serializers import AuditRequestSerializer
from apps.accounts.permissions import IsDeleteAuth, IsMasterOrSuperAdmin
from apps.schools.utils import get_user_school_ids


class AuditRequestListView(generics.ListAPIView):
    serializer_class   = AuditRequestSerializer
    permission_classes = [IsDeleteAuth]

    def get_queryset(self):
        user = self.request.user
        school_ids = get_user_school_ids(user)
        qs = AuditRequest.objects.filter(status='pending')
        # Only scope if user is not a superadmin (or decide if superadmin sees all)
        # get_user_school_ids correctly returns all if superadmin, so we just filter
        return qs.filter(school_id__in=school_ids).select_related('requested_by', 'reviewed_by')


class AuditRequestDetailView(generics.RetrieveAPIView):
    serializer_class   = AuditRequestSerializer
    permission_classes = [IsDeleteAuth]
    queryset           = AuditRequest.objects.all()


class AuditApproveView(APIView):
    permission_classes = [IsDeleteAuth]

    def post(self, request, pk):
        try:
            audit = AuditRequest.objects.get(pk=pk, status='pending')
        except AuditRequest.DoesNotExist:
            return Response(
                {'detail': 'Audit request not found or already reviewed'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            with transaction.atomic():
                # map table name to Django model
                table_model_map = {
                    'exams_conducted':       ('records', 'ExamsConducted'),
                    'school_activities':     ('records', 'SchoolActivity'),
                    'student_activities':    ('records', 'StudentActivity'),
                    'faculty_fdp_workshop_gl': ('records', 'FacultyFDPWorkshopGL'),
                    'faculty_publications':  ('records', 'FacultyPublication'),
                    'patents':               ('records', 'Patent'),
                    'certifications':        ('records', 'Certification'),
                    'placement_activities':  ('records', 'PlacementActivity'),
                    'courses':               ('academics', 'Course'),
                    'academic_years':        ('academics', 'AcademicYear'),
                    'semesters':             ('academics', 'Semester'),
                    'subjects':              ('academics', 'Subject'),
                    'class_groups':          ('academics', 'ClassGroup'),
                    'exam_groups':           ('academics', 'ExamGroup'),
                    'clubs':                 ('academics', 'Club'),
                }

                app_label, model_name = table_model_map[audit.table_name]
                Model  = apps.get_model(app_label, model_name)
                record = Model.objects.get(pk=audit.record_id)

                if audit.action == 'DELETE':
                    record.is_deleted    = True
                    record.pending_audit = None
                    record.save()

                elif audit.action == 'UPDATE':
                    new_data = audit.new_data
                    for field, value in new_data.items():
                        if hasattr(record, field) and field not in [
                            'id', 'created_by', 'created_at',
                            'is_deleted', 'pending_audit'
                        ]:
                            setattr(record, field, value)
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

        return Response({'detail': 'Request approved and changes applied'})


class AuditRejectView(APIView):
    permission_classes = [IsDeleteAuth]

    def post(self, request, pk):
        try:
            audit = AuditRequest.objects.get(pk=pk, status='pending')
        except AuditRequest.DoesNotExist:
            return Response(
                {'detail': 'Audit request not found or already reviewed'},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            # clear the pending flag on the record
            table_model_map = {
                'exams_conducted':         ('records', 'ExamsConducted'),
                'school_activities':       ('records', 'SchoolActivity'),
                'student_activities':      ('records', 'StudentActivity'),
                'faculty_fdp_workshop_gl': ('records', 'FacultyFDPWorkshopGL'),
                'faculty_publications':    ('records', 'FacultyPublication'),
                'patents':                 ('records', 'Patent'),
                'certifications':          ('records', 'Certification'),
                'placement_activities':    ('records', 'PlacementActivity'),
                'courses':                 ('academics', 'Course'),
                'academic_years':          ('academics', 'AcademicYear'),
                'semesters':               ('academics', 'Semester'),
                'subjects':                ('academics', 'Subject'),
                'class_groups':            ('academics', 'ClassGroup'),
                'exam_groups':             ('academics', 'ExamGroup'),
                'clubs':                   ('academics', 'Club'),
            }

            try:
                app_label, model_name = table_model_map[audit.table_name]
                Model  = apps.get_model(app_label, model_name)
                record = Model.objects.get(pk=audit.record_id)
                record.pending_audit = None
                record.save()
            except Exception:
                pass

            audit.status      = 'rejected'
            audit.reviewed_by = request.user
            audit.reviewed_at = timezone.now()
            audit.save()

        return Response({'detail': 'Request rejected — record unchanged'})


class AuditHistoryView(generics.ListAPIView):
    serializer_class   = AuditRequestSerializer
    permission_classes = [IsMasterOrSuperAdmin | IsDeleteAuth]

    def get_queryset(self):
        user = self.request.user
        school_ids = get_user_school_ids(user)
        return AuditRequest.objects.filter(
            school_id__in=school_ids
        ).exclude(
            status='pending'
        ).select_related('requested_by', 'reviewed_by').order_by('-reviewed_at')