from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdminOrUser, IsAdminOrUserOrSuperAdmin
from apps.schools.utils import get_user_school_ids
from apps.audit.models import AuditRequest
from apps.records.models import (
    ExamsConducted, SchoolActivity, SchoolActivityCollaboration,
    StudentActivity, StudentActivityCollaboration,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity
)
from apps.records.serializers import (
    ExamsConductedSerializer, SchoolActivitySerializer,
    StudentActivitySerializer, FacultyFDPWorkshopGLSerializer,
    FacultyPublicationSerializer, PatentSerializer,
    CertificationSerializer, PlacementActivitySerializer
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
        school_id = self.request.query_params.get('school_id')
        year      = self.request.query_params.get('year')
        if school_id:
            qs = qs.filter(school_id=school_id)
        if year:
            qs = qs.filter(expected_graduation_year=year)
        return qs

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
        qs        = self.get_base_queryset(SchoolActivity)
        school_id = self.request.query_params.get('school_id')
        date_from = self.request.query_params.get('date_from')
        date_to   = self.request.query_params.get('date_to')
        if school_id:
            qs = qs.filter(school_id=school_id)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

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
        qs        = self.get_base_queryset(StudentActivity)
        school_id = self.request.query_params.get('school_id')
        date_from = self.request.query_params.get('date_from')
        date_to   = self.request.query_params.get('date_to')
        if school_id:
            qs = qs.filter(school_id=school_id)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

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
        qs        = self.get_base_queryset(FacultyFDPWorkshopGL)
        school_id = self.request.query_params.get('school_id')
        fdp_type  = self.request.query_params.get('type')
        date_from = self.request.query_params.get('date_from')
        date_to   = self.request.query_params.get('date_to')
        if school_id:
            qs = qs.filter(school_id=school_id)
        if fdp_type:
            qs = qs.filter(type=fdp_type)
        if date_from:
            qs = qs.filter(date_start__gte=date_from)
        if date_to:
            qs = qs.filter(date_start__lte=date_to)
        return qs

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
class PublicationListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = FacultyPublicationSerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        qs          = self.get_base_queryset(FacultyPublication)
        school_id   = self.request.query_params.get('school_id')
        author_type = self.request.query_params.get('author_type')
        date_from   = self.request.query_params.get('date_from')
        date_to     = self.request.query_params.get('date_to')
        if school_id:
            qs = qs.filter(school_id=school_id)
        if author_type:
            qs = qs.filter(author_type=author_type)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
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
class PatentListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = PatentSerializer
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get_queryset(self):
        qs             = self.get_base_queryset(Patent)
        school_id      = self.request.query_params.get('school_id')
        patent_status  = self.request.query_params.get('status')
        applicant_type = self.request.query_params.get('applicant_type')
        if school_id:
            qs = qs.filter(school_id=school_id)
        if patent_status:
            qs = qs.filter(patent_status=patent_status)
        if applicant_type:
            qs = qs.filter(applicant_type=applicant_type)
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
        qs          = self.get_base_queryset(Certification)
        school_id   = self.request.query_params.get('school_id')
        person_type = self.request.query_params.get('person_type')
        agency      = self.request.query_params.get('agency')
        date_from   = self.request.query_params.get('date_from')
        date_to     = self.request.query_params.get('date_to')
        if school_id:
            qs = qs.filter(school_id=school_id)
        if person_type:
            qs = qs.filter(person_type=person_type)
        if agency:
            qs = qs.filter(agency__icontains=agency)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
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
        qs           = self.get_base_queryset(PlacementActivity)
        school_id    = self.request.query_params.get('school_id')
        company_name = self.request.query_params.get('company_name')
        date_from    = self.request.query_params.get('date_from')
        date_to      = self.request.query_params.get('date_to')
        if school_id:
            qs = qs.filter(school_id=school_id)
        if company_name:
            qs = qs.filter(company_name__icontains=company_name)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

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