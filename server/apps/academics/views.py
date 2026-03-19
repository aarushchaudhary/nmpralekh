from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from django.utils import timezone

from apps.academics.models import (
    Course, AcademicYear, Semester, Subject,
    ClassGroup, ExamGroup, Club, FacultyTeachingAssignment
)
from apps.academics.serializers import (
    CourseSerializer, AcademicYearSerializer, SemesterSerializer,
    SubjectSerializer, ClassGroupSerializer, ExamGroupSerializer,
    ClubSerializer, FacultyTeachingAssignmentSerializer
)
from apps.accounts.permissions import IsAdmin, IsUser, IsAdminOrUser, IsMasterOrSuperAdmin
from apps.schools.utils import get_user_school_ids
from apps.audit.models import AuditRequest

def create_audit_request(user, table_name, record, action, new_data=None):
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

    record.pending_audit = audit
    record.save()
    return audit


# ─────────────────────────────────────────────
# BASE MIXIN — scopes all queries to user's schools
# ─────────────────────────────────────────────
class SchoolScopedMixin:
    def get_school_ids(self):
        return get_user_school_ids(self.request.user)


# ─────────────────────────────────────────────
# COURSES
# ─────────────────────────────────────────────
class CourseListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class   = CourseSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrUser()]

    def get_queryset(self):
        qs        = Course.objects.filter(school_id__in=self.get_school_ids(), is_deleted=False)
        is_active = self.request.query_params.get('is_active')
        school_id = self.request.query_params.get('school_id')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        if school_id:
            qs = qs.filter(school_id=school_id)
        return qs.select_related('school')


class CourseDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CourseSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Course.objects.filter(school_id__in=self.get_school_ids(), is_deleted=False)

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'courses', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'courses', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# ACADEMIC YEARS
# ─────────────────────────────────────────────
class AcademicYearListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class = AcademicYearSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrUser()]

    def get_queryset(self):
        qs        = AcademicYear.objects.filter(
                        school_id__in=self.get_school_ids(),
                        is_deleted=False
                    ).select_related('school', 'course')
        course_id = self.request.query_params.get('course_id')
        school_id = self.request.query_params.get('school_id')
        if course_id:
            qs = qs.filter(course_id=course_id)
        if school_id:
            qs = qs.filter(school_id=school_id)
        return qs


class AcademicYearDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = AcademicYearSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return AcademicYear.objects.filter(
            school_id__in=self.get_school_ids(),
            is_deleted=False
        ).select_related('school', 'course')

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'academic_years', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'academic_years', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# SEMESTERS
# ─────────────────────────────────────────────
class SemesterListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class = SemesterSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrUser()]

    def get_queryset(self):
        school_ids      = self.get_school_ids()
        qs              = Semester.objects.filter(
                              academic_year__school_id__in=school_ids,
                              is_deleted=False
                          ).select_related(
                              'academic_year',
                              'academic_year__course',
                              'academic_year__school'
                          )
        academic_year_id = self.request.query_params.get('academic_year_id')
        course_id        = self.request.query_params.get('course_id')
        school_id        = self.request.query_params.get('school_id')

        if academic_year_id:
            qs = qs.filter(academic_year_id=academic_year_id)
        if course_id:
            qs = qs.filter(academic_year__course_id=course_id)
        if school_id:
            qs = qs.filter(academic_year__school_id=school_id)
        return qs


class SemesterDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SemesterSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        school_ids = self.get_school_ids()
        return Semester.objects.filter(
            academic_year__school_id__in=school_ids,
            is_deleted=False
        ).select_related('academic_year', 'academic_year__course')

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'semesters', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'semesters', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# SUBJECTS
# ─────────────────────────────────────────────
class SubjectListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrUser()]

    def get_queryset(self):
        qs          = Subject.objects.filter(
                          school_id__in=self.get_school_ids(),
                          is_deleted=False
                      ).select_related(
                          'school',
                          'semester',
                          'semester__academic_year',
                          'semester__academic_year__course'
                      )
        semester_id = self.request.query_params.get('semester_id')
        course_id   = self.request.query_params.get('course_id')
        school_id   = self.request.query_params.get('school_id')
        is_active   = self.request.query_params.get('is_active')

        if semester_id:
            qs = qs.filter(semester_id=semester_id)
        if course_id:
            qs = qs.filter(semester__academic_year__course_id=course_id)
        if school_id:
            qs = qs.filter(school_id=school_id)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs


class SubjectDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SubjectSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Subject.objects.filter(
            school_id__in=self.get_school_ids(),
            is_deleted=False
        ).select_related(
            'school', 'semester',
            'semester__academic_year',
            'semester__academic_year__course'
        )

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'subjects', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'subjects', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# CLASS GROUPS
# ─────────────────────────────────────────────
class ClassGroupListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class = ClassGroupSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrUser()]

    def get_queryset(self):
        qs        = ClassGroup.objects.filter(
                        school_id__in=self.get_school_ids(),
                        is_deleted=False
                    ).select_related('school', 'course')
        course_id = self.request.query_params.get('course_id')
        school_id = self.request.query_params.get('school_id')
        is_active = self.request.query_params.get('is_active')

        if course_id:
            qs = qs.filter(course_id=course_id)
        if school_id:
            qs = qs.filter(school_id=school_id)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs


class ClassGroupDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ClassGroupSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return ClassGroup.objects.filter(
            school_id__in=self.get_school_ids(),
            is_deleted=False
        ).select_related('school', 'course')

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'class_groups', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'class_groups', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# EXAM GROUPS
# ─────────────────────────────────────────────
class ExamGroupListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class = ExamGroupSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrUser()]

    def get_queryset(self):
        qs          = ExamGroup.objects.filter(
                          school_id__in=self.get_school_ids(),
                          is_deleted=False
                      ).select_related(
                          'school',
                          'semester',
                          'semester__academic_year',
                          'semester__academic_year__course'
                      )
        semester_id = self.request.query_params.get('semester_id')
        school_id   = self.request.query_params.get('school_id')

        if semester_id:
            qs = qs.filter(semester_id=semester_id)
        if school_id:
            qs = qs.filter(school_id=school_id)
        return qs


class ExamGroupDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ExamGroupSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return ExamGroup.objects.filter(
            school_id__in=self.get_school_ids(),
            is_deleted=False
        ).select_related(
            'school', 'semester',
            'semester__academic_year',
            'semester__academic_year__course'
        )

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'exam_groups', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'exam_groups', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# CLUBS
# ─────────────────────────────────────────────
class ClubListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class = ClubSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAdminOrUser()]

    def get_queryset(self):
        qs        = Club.objects.filter(
                        school_id__in=self.get_school_ids(),
                        is_deleted=False
                    ).select_related('school')
        club_type = self.request.query_params.get('type')
        school_id = self.request.query_params.get('school_id')
        is_active = self.request.query_params.get('is_active')

        if club_type:
            qs = qs.filter(type=club_type)
        if school_id:
            qs = qs.filter(school_id=school_id)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs


class ClubDetailView(SchoolScopedMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ClubSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Club.objects.filter(
            school_id__in=self.get_school_ids(),
            is_deleted=False
        ).select_related('school')

    def update(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'clubs', record, 'UPDATE', request.data)
        return Response({
            'detail': 'Update request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        audit  = create_audit_request(request.user, 'clubs', record, 'DELETE')
        return Response({
            'detail': 'Delete request submitted and pending approval',
            'audit_id': audit.id
        }, status=status.HTTP_202_ACCEPTED)


# ─────────────────────────────────────────────
# FACULTY TEACHING ASSIGNMENTS
# ─────────────────────────────────────────────
class FacultyTeachingAssignmentListCreateView(SchoolScopedMixin, generics.ListCreateAPIView):
    serializer_class = FacultyTeachingAssignmentSerializer

    def get_permissions(self):
        return [IsAdminOrUser()]

    def get_queryset(self):
        user      = self.request.user
        school_ids = self.get_school_ids()

        qs = FacultyTeachingAssignment.objects.filter(
            school_id__in=school_ids
        ).select_related(
            'faculty', 'school', 'subject', 'class_group',
            'semester', 'semester__academic_year',
            'semester__academic_year__course', 'reviewed_by'
        )

        # faculty only sees their own assignments
        if user.role == 'user':
            qs = qs.filter(faculty=user)

        # filter params
        status    = self.request.query_params.get('status')
        faculty_id = self.request.query_params.get('faculty_id')
        subject_id = self.request.query_params.get('subject_id')

        if status:
            qs = qs.filter(status=status)
        if faculty_id:
            qs = qs.filter(faculty_id=faculty_id)
        if subject_id:
            qs = qs.filter(subject_id=subject_id)

        return qs


class FacultyTeachingAssignmentDetailView(SchoolScopedMixin,
                                           generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FacultyTeachingAssignmentSerializer

    def get_permissions(self):
        return [IsAdminOrUser()]

    def get_queryset(self):
        user       = self.request.user
        school_ids = self.get_school_ids()
        qs         = FacultyTeachingAssignment.objects.filter(
                         school_id__in=school_ids
                     )
        if user.role == 'user':
            qs = qs.filter(faculty=user)
        return qs


class FacultyAssignmentApproveView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            assignment = FacultyTeachingAssignment.objects.get(pk=pk)
        except FacultyTeachingAssignment.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)

        assignment.status      = 'approved'
        assignment.reviewed_by = request.user
        assignment.reviewed_at = timezone.now()
        assignment.notes       = request.data.get('notes', '')
        assignment.save()
        return Response({'detail': 'Assignment approved'})


class FacultyAssignmentRejectView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            assignment = FacultyTeachingAssignment.objects.get(pk=pk)
        except FacultyTeachingAssignment.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)

        assignment.status      = 'rejected'
        assignment.reviewed_by = request.user
        assignment.reviewed_at = timezone.now()
        assignment.notes       = request.data.get('notes', '')
        assignment.save()
        return Response({'detail': 'Assignment rejected'})


class MyTeachingAssignmentsView(APIView):
    """
    Faculty-only endpoint.
    Returns only approved assignments for the logged-in faculty.
    Used to populate dropdowns in exam and marks pages.
    """
    permission_classes = [IsAdminOrUser]

    def get(self, request):
        school_ids = get_user_school_ids(request.user)

        if request.user.role == 'user':
            assignments = FacultyTeachingAssignment.objects.filter(
                faculty    = request.user,
                status     = 'approved',
                school_id__in = school_ids
            ).select_related(
                'subject', 'class_group', 'semester',
                'semester__academic_year',
                'semester__academic_year__course', 'school'
            )
        else:
            # admins can see all approved assignments
            assignments = FacultyTeachingAssignment.objects.filter(
                status     = 'approved',
                school_id__in = school_ids
            ).select_related(
                'faculty', 'subject', 'class_group', 'semester',
                'semester__academic_year',
                'semester__academic_year__course', 'school'
            )

        return Response(
            FacultyTeachingAssignmentSerializer(assignments, many=True).data
        )