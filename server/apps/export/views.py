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
    Patent, Certification, PlacementActivity
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
