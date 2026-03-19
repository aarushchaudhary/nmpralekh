import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdminOrUserOrSuperAdmin
from apps.schools.utils import get_user_school_ids
from apps.records.models import (
    ExamsConducted, SchoolActivity, StudentActivity,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity,
    StudentMarks,
)
from apps.academics.models import (
    Course, AcademicYear, Semester, Subject,
    ClassGroup, ExamGroup, Club,
)


def style_header_row(ws, headers):
    """Applies bold + blue background to header row"""
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num, value=header)
        cell.font      = Font(bold=True, color='FFFFFF')
        cell.fill      = PatternFill('solid', fgColor='1F4E79')
        cell.alignment = Alignment(horizontal='center')


def get_scoped_queryset(model, user):
    school_ids = get_user_school_ids(user)
    return model.objects.filter(
        school_id__in=school_ids,
        is_deleted=False
    ).select_related('school')


class ExportExamsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Exams Conducted'

        headers = ['School', 'Course', 'Examination', 'Date', 'Expected Graduation Year']
        style_header_row(ws, headers)

        for exam in apply_filters(get_scoped_queryset(ExamsConducted, request.user)):
            ws.append([
                exam.school.name,
                exam.course,
                exam.examination,
                str(exam.date),
                exam.expected_graduation_year,
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=exams_conducted.xlsx'
        wb.save(response)
        return response


class ExportSchoolActivitiesView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'School Activity'

        headers = ['School', 'Name', 'Date', 'Details', 'School Wide']
        style_header_row(ws, headers)

        for act in apply_filters(get_scoped_queryset(SchoolActivity, request.user)):
            ws.append([
                act.school.name,
                act.name,
                str(act.date),
                act.details,
                'Yes' if act.is_school_wide else 'No',
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=school_activities.xlsx'
        wb.save(response)
        return response


class ExportStudentActivitiesView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Student Activity'

        headers = ['School', 'Name', 'Date', 'Details', 'Conducted By', 'Type']
        style_header_row(ws, headers)

        for act in apply_filters(get_scoped_queryset(StudentActivity, request.user)):
            ws.append([
                act.school.name,
                act.name,
                str(act.date),
                act.details,
                act.conducted_by,
                act.activity_type,
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=student_activities.xlsx'
        wb.save(response)
        return response


class ExportFDPView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Faculty FDP, Workshop, GL'

        headers = ['School', 'Faculty Name', 'Date Start', 'Date End', 'Name', 'Details', 'Type', 'Organizing Body']
        style_header_row(ws, headers)

        for fdp in apply_filters(get_scoped_queryset(FacultyFDPWorkshopGL, request.user)):
            ws.append([
                fdp.school.name,
                fdp.faculty_name,
                str(fdp.date_start),
                str(fdp.date_end) if fdp.date_end else '',
                fdp.name,
                fdp.details,
                fdp.type,
                fdp.organizing_body or '',
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=faculty_fdp.xlsx'
        wb.save(response)
        return response


class ExportPublicationsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Faculty Publication'

        headers = ['School', 'Author Name', 'Author Type', 'Title of Paper',
                   'Journal/Conference', 'Date', 'Venue', 'Publication', 'DOI/Link']
        style_header_row(ws, headers)

        for pub in apply_filters(get_scoped_queryset(FacultyPublication, request.user)):
            ws.append([
                pub.school.name,
                pub.author_name,
                pub.author_type,
                pub.title_of_paper,
                pub.journal_or_conference_name,
                str(pub.date),
                pub.venue or '',
                pub.publication or '',
                pub.doi_or_link or '',
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=publications.xlsx'
        wb.save(response)
        return response


class ExportPatentsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'PATENT'

        headers = ['School', 'Applicant Name', 'Applicant Type', 'Title of Patent',
                   'Details', 'Date of Publication', 'Journal Number', 'Status']
        style_header_row(ws, headers)

        for patent in apply_filters(get_scoped_queryset(Patent, request.user)):
            ws.append([
                patent.school.name,
                patent.applicant_name,
                patent.applicant_type,
                patent.title_of_patent,
                patent.details or '',
                str(patent.date_of_publication),
                patent.journal_number,
                patent.patent_status,
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=patents.xlsx'
        wb.save(response)
        return response


class ExportCertificationsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'CERTIFICATES'

        headers = ['School', 'Date', 'Name', 'Title of Course',
                   'Details', 'Agency', 'Proof Link', 'Person Type']
        style_header_row(ws, headers)

        for cert in apply_filters(get_scoped_queryset(Certification, request.user)):
            ws.append([
                cert.school.name,
                str(cert.date),
                cert.name,
                cert.title_of_course,
                cert.details or '',
                cert.agency,
                cert.credly_or_proof_link or '',
                cert.person_type,
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=certifications.xlsx'
        wb.save(response)
        return response


class ExportPlacementsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Placement Activities'

        headers = ['School', 'Name', 'Date', 'Details', 'Company Name']
        style_header_row(ws, headers)

        for placement in apply_filters(get_scoped_queryset(PlacementActivity, request.user)):
            ws.append([
                placement.school.name,
                placement.name,
                str(placement.date),
                placement.details,
                placement.company_name or '',
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=placements.xlsx'
        wb.save(response)
        return response


from .tasks import generate_export_task

class ExportAllView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):
        school_ids = list(get_user_school_ids(request.user))

        # start background task
        task = generate_export_task.delay(
            school_ids=school_ids,
            export_type='all',
            filters=dict(request.query_params)
        )

        from rest_framework.response import Response
        # return task ID immediately — don't wait
        return Response({
            'task_id': task.id,
            'status':  'processing',
            'message': 'Your export is being generated. Poll /api/export/status/{task_id}/ to check.'
        }, status=202)


class ExportStatusView(APIView):
    """Frontend polls this every 2 seconds until ready"""
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request, task_id):
        from celery.result import AsyncResult
        from django.core.cache import cache
        from django.http import HttpResponse
        from rest_framework.response import Response
        
        result    = AsyncResult(task_id)
        cache_key = f'export_{task_id}'
        file_data = cache.get(cache_key)

        if file_data:
            # file is ready — send it
            response = HttpResponse(
                file_data,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename=MIS_Dashboard.xlsx'
            return response

        if result.failed():
            return Response({'status': 'failed'}, status=500)

        return Response({'status': 'processing'})


def get_scoped_academics(model, user, school_field='school_id'):
    school_ids = get_user_school_ids(user)
    return model.objects.filter(
        **{f'{school_field}__in': school_ids}
    ).select_related()


class ExportCoursesView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Courses'
        headers = ['School', 'Course Name', 'Code', 'Status']
        style_header_row(ws, headers)
        for obj in apply_filters(get_scoped_academics(Course, request.user)):
            ws.append([
                obj.school.name, obj.name, obj.code,
                'Active' if obj.is_active else 'Inactive'
            ])
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=courses.xlsx'
        wb.save(response)
        return response


class ExportAcademicYearsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Academic Years'
        headers = ['School', 'Course', 'Course Code', 'Year Number', 'Graduation Year']
        style_header_row(ws, headers)
        qs = AcademicYear.objects.filter(
            school_id__in=get_user_school_ids(request.user)
        ).select_related('school', 'course')
        for obj in apply_filters(qs):
            ws.append([
                obj.school.name, obj.course.name,
                obj.course.code, obj.year_number, obj.graduation_year
            ])
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=academic_years.xlsx'
        wb.save(response)
        return response


class ExportSemestersView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Semesters'
        headers = ['School', 'Course', 'Year', 'Graduation Year',
                   'Semester', 'Start Date', 'End Date']
        style_header_row(ws, headers)
        qs = Semester.objects.filter(
            academic_year__school_id__in=get_user_school_ids(request.user)
        ).select_related(
            'academic_year', 'academic_year__school', 'academic_year__course'
        )
        for obj in apply_filters(qs):
            ws.append([
                obj.academic_year.school.name,
                obj.academic_year.course.name,
                obj.academic_year.year_number,
                obj.academic_year.graduation_year,
                obj.semester_number,
                str(obj.start_date) if obj.start_date else '',
                str(obj.end_date)   if obj.end_date   else '',
            ])
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=semesters.xlsx'
        wb.save(response)
        return response


class ExportSubjectsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Subjects'
        headers = ['School', 'Subject Name', 'Code', 'Course',
                   'Year', 'Semester', 'Status']
        style_header_row(ws, headers)
        qs = Subject.objects.filter(
            school_id__in=get_user_school_ids(request.user)
        ).select_related(
            'school', 'semester',
            'semester__academic_year',
            'semester__academic_year__course'
        )
        for obj in apply_filters(qs):
            ws.append([
                obj.school.name,
                obj.name,
                obj.code,
                obj.semester.academic_year.course.name,
                obj.semester.academic_year.year_number,
                obj.semester.semester_number,
                'Active' if obj.is_active else 'Inactive',
            ])
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=subjects.xlsx'
        wb.save(response)
        return response


class ExportClassGroupsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Class Groups'
        headers = ['School', 'Class Group', 'Course', 'Course Code', 'Status']
        style_header_row(ws, headers)
        qs = ClassGroup.objects.filter(
            school_id__in=get_user_school_ids(request.user)
        ).select_related('school', 'course')
        for obj in apply_filters(qs):
            ws.append([
                obj.school.name, obj.name,
                obj.course.name, obj.course.code,
                'Active' if obj.is_active else 'Inactive',
            ])
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=class_groups.xlsx'
        wb.save(response)
        return response


class ExportExamGroupsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Exam Groups'
        headers = ['School', 'Exam Group', 'Course', 'Year', 'Semester', 'Graduation Year']
        style_header_row(ws, headers)
        qs = ExamGroup.objects.filter(
            school_id__in=get_user_school_ids(request.user)
        ).select_related(
            'school', 'semester',
            'semester__academic_year',
            'semester__academic_year__course'
        )
        for obj in apply_filters(qs):
            ws.append([
                obj.school.name,
                obj.name,
                obj.semester.academic_year.course.name,
                obj.semester.academic_year.year_number,
                obj.semester.semester_number,
                obj.semester.academic_year.graduation_year,
            ])
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=exam_groups.xlsx'
        wb.save(response)
        return response


class ExportClubsView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Clubs and Committees'
        headers = ['School', 'Name', 'Type', 'Status']
        style_header_row(ws, headers)
        for obj in apply_filters(get_scoped_academics(Club, request.user)):
            ws.append([
                obj.school.name, obj.name, obj.type,
                'Active' if obj.is_active else 'Inactive',
            ])
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=clubs.xlsx'
        wb.save(response)
        return response


class ExportStudentMarksView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Student Marks'
        headers = [
            'School', 'Exam Group', 'Subject', 'Subject Code',
            'Class Group', 'Date', 'Student Name', 'Roll Number',
            'Marks Obtained', 'Max Marks', 'Absent'
        ]
        style_header_row(ws, headers)
        qs = StudentMarks.objects.filter(
            exam__school_id__in=get_user_school_ids(request.user)
        ).select_related(
            'exam', 'exam__school',
            'exam__exam_group',
            'exam__subject',
            'exam__class_group',
        )
        for obj in apply_filters(qs):
            ws.append([
                obj.exam.school.name,
                obj.exam.exam_group.name  if obj.exam.exam_group  else '',
                obj.exam.subject.name     if obj.exam.subject     else '',
                obj.exam.subject.code     if obj.exam.subject     else '',
                obj.exam.class_group.name if obj.exam.class_group else '',
                str(obj.exam.date),
                obj.student_name,
                obj.roll_number,
                float(obj.marks_obtained),
                float(obj.max_marks),
                'Yes' if obj.is_absent else 'No',
            ])
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=student_marks.xlsx'
        wb.save(response)
        return response


class ExportAcademicsAllView(APIView):
    """Single download with all academics sheets"""
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):

        # optional filters
        school_id = request.query_params.get('school_id')
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')

        def apply_filters(qs):
            from django.core.exceptions import FieldError
            try:
                if school_id: qs = qs.filter(school_id=school_id)
                # Not all models have a 'date' field, e.g. AcademicYear
                if date_from: qs = qs.filter(date__gte=date_from)
                if date_to:   qs = qs.filter(date__lte=date_to)
            except FieldError:
                pass
            
            # Additional logic for models using date_start or date_of_publication
            try:
                if date_from: qs = qs.filter(date_start__gte=date_from)
                if date_to:   qs = qs.filter(date_start__lte=date_to)
            except FieldError: pass
            
            try:
                if date_from: qs = qs.filter(date_of_publication__gte=date_from)
                if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
            except FieldError: pass
            
            return qs[:5000]   # hard safety cap

        wb   = openpyxl.Workbook()
        user = request.user
        wb.remove(wb.active)

        school_ids = get_user_school_ids(user)

        # Courses sheet
        ws = wb.create_sheet('Courses')
        style_header_row(ws, ['School', 'Course Name', 'Code', 'Status'])
        for obj in apply_filters(Course.objects.filter(school_id__in=school_ids).select_related('school')):
            ws.append([obj.school.name, obj.name, obj.code,
                       'Active' if obj.is_active else 'Inactive'])

        # Academic Years sheet
        ws = wb.create_sheet('Academic Years')
        style_header_row(ws, ['School', 'Course', 'Year', 'Graduation Year'])
        for obj in apply_filters(AcademicYear.objects.filter(
            school_id__in=school_ids
        ).select_related('school', 'course')):
            ws.append([obj.school.name, obj.course.name,
                       obj.year_number, obj.graduation_year])

        # Semesters sheet
        ws = wb.create_sheet('Semesters')
        style_header_row(ws, ['School', 'Course', 'Year', 'Semester',
                               'Start Date', 'End Date'])
        for obj in apply_filters(Semester.objects.filter(
            academic_year__school_id__in=school_ids
        ).select_related('academic_year', 'academic_year__school',
                          'academic_year__course')):
            ws.append([
                obj.academic_year.school.name,
                obj.academic_year.course.name,
                obj.academic_year.year_number,
                obj.semester_number,
                str(obj.start_date) if obj.start_date else '',
                str(obj.end_date)   if obj.end_date   else '',
            ])

        # Subjects sheet
        ws = wb.create_sheet('Subjects')
        style_header_row(ws, ['School', 'Subject', 'Code', 'Course',
                               'Year', 'Semester', 'Status'])
        for obj in apply_filters(Subject.objects.filter(
            school_id__in=school_ids
        ).select_related('school', 'semester',
                          'semester__academic_year',
                          'semester__academic_year__course')):
            ws.append([
                obj.school.name, obj.name, obj.code,
                obj.semester.academic_year.course.name,
                obj.semester.academic_year.year_number,
                obj.semester.semester_number,
                'Active' if obj.is_active else 'Inactive',
            ])

        # Class Groups sheet
        ws = wb.create_sheet('Class Groups')
        style_header_row(ws, ['School', 'Class Group', 'Course', 'Status'])
        for obj in apply_filters(ClassGroup.objects.filter(
            school_id__in=school_ids
        ).select_related('school', 'course')):
            ws.append([obj.school.name, obj.name, obj.course.name,
                       'Active' if obj.is_active else 'Inactive'])

        # Exam Groups sheet
        ws = wb.create_sheet('Exam Groups')
        style_header_row(ws, ['School', 'Exam Group', 'Course', 'Year', 'Semester'])
        for obj in apply_filters(ExamGroup.objects.filter(
            school_id__in=school_ids
        ).select_related('school', 'semester',
                          'semester__academic_year',
                          'semester__academic_year__course')):
            ws.append([
                obj.school.name, obj.name,
                obj.semester.academic_year.course.name,
                obj.semester.academic_year.year_number,
                obj.semester.semester_number,
            ])

        # Clubs sheet
        ws = wb.create_sheet('Clubs and Committees')
        style_header_row(ws, ['School', 'Name', 'Type', 'Status'])
        for obj in apply_filters(Club.objects.filter(
            school_id__in=school_ids
        ).select_related('school')):
            ws.append([obj.school.name, obj.name, obj.type,
                       'Active' if obj.is_active else 'Inactive'])

        # Student Marks sheet
        ws = wb.create_sheet('Student Marks')
        style_header_row(ws, ['School', 'Exam Group', 'Subject',
                               'Class Group', 'Date', 'Student Name',
                               'Roll Number', 'Marks', 'Max Marks', 'Absent'])
        for obj in apply_filters(StudentMarks.objects.filter(
            exam__school_id__in=school_ids
        ).select_related('exam', 'exam__school', 'exam__exam_group',
                          'exam__subject', 'exam__class_group')):
            ws.append([
                obj.exam.school.name,
                obj.exam.exam_group.name  if obj.exam.exam_group  else '',
                obj.exam.subject.name     if obj.exam.subject     else '',
                obj.exam.class_group.name if obj.exam.class_group else '',
                str(obj.exam.date),
                obj.student_name,
                obj.roll_number,
                float(obj.marks_obtained),
                float(obj.max_marks),
                'Yes' if obj.is_absent else 'No',
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=academics_all.xlsx'
        wb.save(response)
        return response
