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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Exams Conducted'

        headers = ['School', 'Course', 'Examination', 'Date', 'Expected Graduation Year']
        style_header_row(ws, headers)

        for exam in get_scoped_queryset(ExamsConducted, request.user):
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'School Activity'

        headers = ['School', 'Name', 'Date', 'Details', 'School Wide']
        style_header_row(ws, headers)

        for act in get_scoped_queryset(SchoolActivity, request.user):
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Student Activity'

        headers = ['School', 'Name', 'Date', 'Details', 'Conducted By', 'Type']
        style_header_row(ws, headers)

        for act in get_scoped_queryset(StudentActivity, request.user):
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Faculty FDP, Workshop, GL'

        headers = ['School', 'Faculty Name', 'Date Start', 'Date End', 'Name', 'Details', 'Type', 'Organizing Body']
        style_header_row(ws, headers)

        for fdp in get_scoped_queryset(FacultyFDPWorkshopGL, request.user):
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Faculty Publication'

        headers = ['School', 'Author Name', 'Author Type', 'Title of Paper',
                   'Journal/Conference', 'Date', 'Venue', 'Publication', 'DOI/Link']
        style_header_row(ws, headers)

        for pub in get_scoped_queryset(FacultyPublication, request.user):
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'PATENT'

        headers = ['School', 'Applicant Name', 'Applicant Type', 'Title of Patent',
                   'Details', 'Date of Publication', 'Journal Number', 'Status']
        style_header_row(ws, headers)

        for patent in get_scoped_queryset(Patent, request.user):
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'CERTIFICATES'

        headers = ['School', 'Date', 'Name', 'Title of Course',
                   'Details', 'Agency', 'Proof Link', 'Person Type']
        style_header_row(ws, headers)

        for cert in get_scoped_queryset(Certification, request.user):
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Placement Activities'

        headers = ['School', 'Name', 'Date', 'Details', 'Company Name']
        style_header_row(ws, headers)

        for placement in get_scoped_queryset(PlacementActivity, request.user):
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


class ExportAllView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):
        wb   = openpyxl.Workbook()
        user = request.user

        # remove default empty sheet
        wb.remove(wb.active)

        sheets = [
            ('Exams Conducted',       ExamsConducted,      ['School', 'Course', 'Examination', 'Date', 'Graduation Year'],
             lambda r: [r.school.name, r.course, r.examination, str(r.date), r.expected_graduation_year]),

            ('School Activity',       SchoolActivity,      ['School', 'Name', 'Date', 'Details', 'School Wide'],
             lambda r: [r.school.name, r.name, str(r.date), r.details, 'Yes' if r.is_school_wide else 'No']),

            ('Student Activity',      StudentActivity,     ['School', 'Name', 'Date', 'Details', 'Conducted By', 'Type'],
             lambda r: [r.school.name, r.name, str(r.date), r.details, r.conducted_by, r.activity_type]),

            ('Faculty FDP',           FacultyFDPWorkshopGL,['School', 'Faculty', 'Date Start', 'Date End', 'Name', 'Type'],
             lambda r: [r.school.name, r.faculty_name, str(r.date_start), str(r.date_end or ''), r.name, r.type]),

            ('Faculty Publication',   FacultyPublication,  ['School', 'Author', 'Title', 'Journal', 'Date', 'Publication'],
             lambda r: [r.school.name, r.author_name, r.title_of_paper, r.journal_or_conference_name, str(r.date), r.publication or '']),

            ('PATENT',                Patent,              ['School', 'Applicant', 'Title', 'Date', 'Journal No', 'Status'],
             lambda r: [r.school.name, r.applicant_name, r.title_of_patent, str(r.date_of_publication), r.journal_number, r.patent_status]),

            ('CERTIFICATES',          Certification,       ['School', 'Date', 'Name', 'Course', 'Agency', 'Link'],
             lambda r: [r.school.name, str(r.date), r.name, r.title_of_course, r.agency, r.credly_or_proof_link or '']),

            ('Placement Activities',  PlacementActivity,   ['School', 'Name', 'Date', 'Details', 'Company'],
             lambda r: [r.school.name, r.name, str(r.date), r.details, r.company_name or '']),
        ]

        for sheet_title, Model, headers, row_fn in sheets:
            ws = wb.create_sheet(title=sheet_title)
            style_header_row(ws, headers)
            for record in get_scoped_queryset(Model, user):
                ws.append(row_fn(record))

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=MIS_Dashboard.xlsx'
        wb.save(response)
        return response


def get_scoped_academics(model, user, school_field='school_id'):
    school_ids = get_user_school_ids(user)
    return model.objects.filter(
        **{f'{school_field}__in': school_ids}
    ).select_related()


class ExportCoursesView(APIView):
    permission_classes = [IsAdminOrUserOrSuperAdmin]

    def get(self, request):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Courses'
        headers = ['School', 'Course Name', 'Code', 'Status']
        style_header_row(ws, headers)
        for obj in get_scoped_academics(Course, request.user):
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Academic Years'
        headers = ['School', 'Course', 'Course Code', 'Year Number', 'Graduation Year']
        style_header_row(ws, headers)
        qs = AcademicYear.objects.filter(
            school_id__in=get_user_school_ids(request.user)
        ).select_related('school', 'course')
        for obj in qs:
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
        for obj in qs:
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
        for obj in qs:
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Class Groups'
        headers = ['School', 'Class Group', 'Course', 'Course Code', 'Status']
        style_header_row(ws, headers)
        qs = ClassGroup.objects.filter(
            school_id__in=get_user_school_ids(request.user)
        ).select_related('school', 'course')
        for obj in qs:
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
        for obj in qs:
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
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Clubs and Committees'
        headers = ['School', 'Name', 'Type', 'Status']
        style_header_row(ws, headers)
        for obj in get_scoped_academics(Club, request.user):
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
        for obj in qs:
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
        wb   = openpyxl.Workbook()
        user = request.user
        wb.remove(wb.active)

        school_ids = get_user_school_ids(user)

        # Courses sheet
        ws = wb.create_sheet('Courses')
        style_header_row(ws, ['School', 'Course Name', 'Code', 'Status'])
        for obj in Course.objects.filter(school_id__in=school_ids).select_related('school'):
            ws.append([obj.school.name, obj.name, obj.code,
                       'Active' if obj.is_active else 'Inactive'])

        # Academic Years sheet
        ws = wb.create_sheet('Academic Years')
        style_header_row(ws, ['School', 'Course', 'Year', 'Graduation Year'])
        for obj in AcademicYear.objects.filter(
            school_id__in=school_ids
        ).select_related('school', 'course'):
            ws.append([obj.school.name, obj.course.name,
                       obj.year_number, obj.graduation_year])

        # Semesters sheet
        ws = wb.create_sheet('Semesters')
        style_header_row(ws, ['School', 'Course', 'Year', 'Semester',
                               'Start Date', 'End Date'])
        for obj in Semester.objects.filter(
            academic_year__school_id__in=school_ids
        ).select_related('academic_year', 'academic_year__school',
                          'academic_year__course'):
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
        for obj in Subject.objects.filter(
            school_id__in=school_ids
        ).select_related('school', 'semester',
                          'semester__academic_year',
                          'semester__academic_year__course'):
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
        for obj in ClassGroup.objects.filter(
            school_id__in=school_ids
        ).select_related('school', 'course'):
            ws.append([obj.school.name, obj.name, obj.course.name,
                       'Active' if obj.is_active else 'Inactive'])

        # Exam Groups sheet
        ws = wb.create_sheet('Exam Groups')
        style_header_row(ws, ['School', 'Exam Group', 'Course', 'Year', 'Semester'])
        for obj in ExamGroup.objects.filter(
            school_id__in=school_ids
        ).select_related('school', 'semester',
                          'semester__academic_year',
                          'semester__academic_year__course'):
            ws.append([
                obj.school.name, obj.name,
                obj.semester.academic_year.course.name,
                obj.semester.academic_year.year_number,
                obj.semester.semester_number,
            ])

        # Clubs sheet
        ws = wb.create_sheet('Clubs and Committees')
        style_header_row(ws, ['School', 'Name', 'Type', 'Status'])
        for obj in Club.objects.filter(
            school_id__in=school_ids
        ).select_related('school'):
            ws.append([obj.school.name, obj.name, obj.type,
                       'Active' if obj.is_active else 'Inactive'])

        # Student Marks sheet
        ws = wb.create_sheet('Student Marks')
        style_header_row(ws, ['School', 'Exam Group', 'Subject',
                               'Class Group', 'Date', 'Student Name',
                               'Roll Number', 'Marks', 'Max Marks', 'Absent'])
        for obj in StudentMarks.objects.filter(
            exam__school_id__in=school_ids
        ).select_related('exam', 'exam__school', 'exam__exam_group',
                          'exam__subject', 'exam__class_group'):
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
