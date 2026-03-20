import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from datetime import date, datetime
from celery import shared_task
from django.conf import settings

EXPORT_DIR = os.path.join(settings.BASE_DIR, 'exports')


def ensure_export_dir():
    os.makedirs(EXPORT_DIR, exist_ok=True)


def style_header(ws, headers):
    for col_num, header in enumerate(headers, 1):
        cell            = ws.cell(row=1, column=col_num, value=header)
        cell.font       = Font(bold=True, color='FFFFFF')
        cell.fill       = PatternFill('solid', fgColor='1F4E79')
        cell.alignment  = Alignment(horizontal='center')


def build_campus_workbook(school_ids):
    """Builds a complete workbook for given school IDs"""
    from apps.records.models import (
        ExamsConducted, SchoolActivity, StudentActivity,
        FacultyFDPWorkshopGL, FacultyPublication,
        Patent, Certification, PlacementActivity, StudentMarks
    )

    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    total_records = 0

    sheets = [
        (
            'Exams Conducted',
            ExamsConducted.objects.filter(
                school_id__in=school_ids, is_deleted=False
            ).select_related(
                'school', 'exam_group', 'subject', 'class_group'
            ),
            ['School', 'Exam Group', 'Subject', 'Class Group', 'Date'],
            lambda r: [
                r.school.name,
                r.exam_group.name  if r.exam_group  else '',
                r.subject.name     if r.subject     else '',
                r.class_group.name if r.class_group else '',
                str(r.date),
            ]
        ),
        (
            'School Activities',
            SchoolActivity.objects.filter(
                school_id__in=school_ids, is_deleted=False
            ).select_related('school'),
            ['School', 'Name', 'Date', 'Details', 'School Wide'],
            lambda r: [
                r.school.name, r.name, str(r.date),
                r.details, 'Yes' if r.is_school_wide else 'No',
            ]
        ),
        (
            'Student Activities',
            StudentActivity.objects.filter(
                school_id__in=school_ids, is_deleted=False
            ).select_related('school', 'club'),
            ['School', 'Name', 'Date', 'Details', 'Conducted By', 'Type'],
            lambda r: [
                r.school.name, r.name, str(r.date), r.details,
                r.club.name if r.club else r.conducted_by or '',
                r.activity_type,
            ]
        ),
        (
            'FDP Workshop GL',
            FacultyFDPWorkshopGL.objects.filter(
                school_id__in=school_ids, is_deleted=False
            ).select_related('school'),
            ['School', 'Faculty', 'Name', 'Type',
             'Date Start', 'Date End', 'Organizing Body'],
            lambda r: [
                r.school.name, r.faculty_name, r.name, r.type,
                str(r.date_start),
                str(r.date_end) if r.date_end else '',
                r.organizing_body or '',
            ]
        ),
        (
            'Publications',
            FacultyPublication.objects.filter(
                school_id__in=school_ids, is_deleted=False
            ).select_related('school'),
            ['School', 'Author', 'Title', 'Journal',
             'Date', 'Venue', 'Publication'],
            lambda r: [
                r.school.name, r.author_name, r.title_of_paper,
                r.journal_or_conference_name, str(r.date),
                r.venue or '', r.publication or '',
            ]
        ),
        (
            'Patents',
            Patent.objects.filter(
                school_id__in=school_ids, is_deleted=False
            ).select_related('school'),
            ['School', 'Applicant', 'Title', 'Date',
             'Journal No', 'Status'],
            lambda r: [
                r.school.name, r.applicant_name, r.title_of_patent,
                str(r.date_of_publication),
                r.journal_number, r.patent_status,
            ]
        ),
        (
            'Certifications',
            Certification.objects.filter(
                school_id__in=school_ids, is_deleted=False
            ).select_related('school'),
            ['School', 'Name', 'Course', 'Agency', 'Date', 'Link'],
            lambda r: [
                r.school.name, r.name, r.title_of_course,
                r.agency, str(r.date),
                r.credly_or_proof_link or '',
            ]
        ),
        (
            'Placements',
            PlacementActivity.objects.filter(
                school_id__in=school_ids, is_deleted=False
            ).select_related('school'),
            ['School', 'Name', 'Date', 'Details', 'Company'],
            lambda r: [
                r.school.name, r.name, str(r.date),
                r.details, r.company_name or '',
            ]
        ),
        (
            'Student Marks',
            StudentMarks.objects.filter(
                exam__school_id__in=school_ids
            ).select_related(
                'exam', 'exam__school', 'exam__exam_group',
                'exam__subject', 'exam__class_group'
            ),
            ['School', 'Exam Group', 'Subject', 'Class Group',
             'Student', 'Roll No', 'Marks', 'Max Marks', 'Absent'],
            lambda r: [
                r.exam.school.name,
                r.exam.exam_group.name  if r.exam.exam_group  else '',
                r.exam.subject.name     if r.exam.subject     else '',
                r.exam.class_group.name if r.exam.class_group else '',
                r.student_name, r.roll_number,
                float(r.marks_obtained), float(r.max_marks),
                'Yes' if r.is_absent else 'No',
            ]
        ),
    ]

    for sheet_title, queryset, headers, row_fn in sheets:
        ws = wb.create_sheet(title=sheet_title)
        style_header(ws, headers)
        count = 0
        for record in queryset:
            try:
                ws.append(row_fn(record))
                count += 1
            except Exception:
                continue
        total_records += count

    return wb, total_records


@shared_task(name='apps.export.tasks.generate_nightly_exports')
def generate_nightly_exports():
    """
    Runs every night at 12:00 AM IST.
    Generates one Excel file per active campus.
    """
    from apps.schools.models import Campus, School
    from apps.export.models import GeneratedExport

    ensure_export_dir()
    today     = date.today().strftime('%Y-%m-%d')
    generated = []

    campuses = Campus.objects.filter(is_active=True)

    for campus in campuses:
        school_ids = list(
            School.objects.filter(
                campus=campus, is_active=True
            ).values_list('id', flat=True)
        )

        if not school_ids:
            continue

        try:
            wb, total_records = build_campus_workbook(school_ids)

            filename = f'{campus.code}_MIS_Export_{today}.xlsx'
            filepath = os.path.join(EXPORT_DIR, filename)
            wb.save(filepath)

            file_size_kb = os.path.getsize(filepath) // 1024

            # save record to database
            export = GeneratedExport.objects.create(
                campus       = campus,
                export_type  = 'nightly',
                filename     = filename,
                filepath     = filepath,
                file_size_kb = file_size_kb,
                record_count = total_records,
            )

            generated.append(export.id)

        except Exception as e:
            print(f'Export failed for {campus.name}: {e}')
            continue

    return f'Generated {len(generated)} campus exports for {today}'


@shared_task(name='apps.export.tasks.generate_manual_export')
def generate_manual_export(campus_id, school_ids,
                            filters={}, user_id=None):
    """
    Triggered manually by master admin from the portal.
    """
    from apps.schools.models import Campus
    from apps.export.models import GeneratedExport
    from apps.accounts.models import User

    ensure_export_dir()

    campus   = Campus.objects.get(pk=campus_id)
    today    = date.today().strftime('%Y-%m-%d')
    now      = datetime.now().strftime('%H%M%S')

    wb, total_records = build_campus_workbook(school_ids)

    filename = f'{campus.code}_Manual_Export_{today}_{now}.xlsx'
    filepath = os.path.join(EXPORT_DIR, filename)
    wb.save(filepath)

    file_size_kb = os.path.getsize(filepath) // 1024

    user = User.objects.get(pk=user_id) if user_id else None

    export = GeneratedExport.objects.create(
        campus          = campus,
        export_type     = 'manual',
        filename        = filename,
        filepath        = filepath,
        generated_by    = user,
        file_size_kb    = file_size_kb,
        record_count    = total_records,
        date_range_from = filters.get('date_from') or None,
        date_range_to   = filters.get('date_to')   or None,
    )

    return {
        'export_id': export.id,
        'filename':  filename,
        'campus':    campus.name,
        'records':   total_records,
    }
