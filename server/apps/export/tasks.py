from celery import shared_task
from django.core.cache import cache
import openpyxl
import io
from openpyxl.styles import Font, PatternFill, Alignment

from apps.records.models import (
    ExamsConducted, SchoolActivity, StudentActivity,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity
)


def style_header_row(ws, headers):
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num, value=header)
        cell.font      = Font(bold=True, color='FFFFFF')
        cell.fill      = PatternFill('solid', fgColor='1F4E79')
        cell.alignment = Alignment(horizontal='center')

def apply_filters(qs, filters):
    from django.core.exceptions import FieldError
    
    school_id = filters.get('school_id')
    date_from = filters.get('date_from')
    date_to   = filters.get('date_to')
    
    if isinstance(school_id, list) and school_id: school_id = school_id[0]
    if isinstance(date_from, list) and date_from: date_from = date_from[0]
    if isinstance(date_to, list) and date_to:     date_to   = date_to[0]

    try:
        if school_id: qs = qs.filter(school_id=school_id)
        if date_from: qs = qs.filter(date__gte=date_from)
        if date_to:   qs = qs.filter(date__lte=date_to)
    except FieldError:
        pass
    
    try:
        if date_from: qs = qs.filter(date_start__gte=date_from)
        if date_to:   qs = qs.filter(date_start__lte=date_to)
    except FieldError: pass
    
    try:
        if date_from: qs = qs.filter(date_of_publication__gte=date_from)
        if date_to:   qs = qs.filter(date_of_publication__lte=date_to)
    except FieldError: pass
    
    return qs[:5000]

@shared_task
def generate_export_task(school_ids, export_type, filters={}):
    """
    Runs in background — does not block web workers
    Stores result in Redis for 10 minutes
    """
    wb = openpyxl.Workbook()
    wb.remove(wb.active)

    def get_scoped(model):
        return model.objects.filter(school_id__in=school_ids, is_deleted=False).select_related('school')

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
        for record in apply_filters(get_scoped(Model), filters):
            ws.append(row_fn(record))

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    # store in Redis with 10 minute expiry
    task_id    = generate_export_task.request.id
    cache_key  = f'export_{task_id}'
    cache.set(cache_key, buffer.getvalue(), timeout=600)

    return task_id
