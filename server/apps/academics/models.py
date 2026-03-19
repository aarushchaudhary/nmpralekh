from django.db import models
from apps.accounts.models import User
from apps.schools.models import School


class Course(models.Model):
    school      = models.ForeignKey(School, on_delete=models.RESTRICT,
                                    related_name='courses')
    name        = models.CharField(max_length=255)
    code        = models.CharField(max_length=50)
    created_by  = models.ForeignKey(User, on_delete=models.RESTRICT,
                                    related_name='courses_created')
    created_at  = models.DateTimeField(auto_now_add=True)
    is_active   = models.BooleanField(default=True)
    is_deleted  = models.BooleanField(default=False)
    pending_audit = models.ForeignKey('audit.AuditRequest', null=True, blank=True,
                                      on_delete=models.SET_NULL,
                                      related_name='courses_pending')

    class Meta:
        db_table        = 'courses'
        unique_together = ('school', 'code')
        ordering        = ['name']

    def __str__(self):
        return f'{self.code} — {self.name}'


class AcademicYear(models.Model):
    school           = models.ForeignKey(School, on_delete=models.RESTRICT,
                                         related_name='academic_years')
    course           = models.ForeignKey(Course, on_delete=models.RESTRICT,
                                         related_name='academic_years')
    year_number      = models.PositiveSmallIntegerField(
                           help_text='e.g. 1 for first year, 2 for second year'
                       )
    graduation_year  = models.PositiveSmallIntegerField(
                           help_text='e.g. 2027'
                       )
    created_by       = models.ForeignKey(User, on_delete=models.RESTRICT,
                                         related_name='academic_years_created')
    created_at       = models.DateTimeField(auto_now_add=True)
    is_deleted       = models.BooleanField(default=False)
    pending_audit    = models.ForeignKey('audit.AuditRequest', null=True, blank=True,
                                         on_delete=models.SET_NULL,
                                         related_name='academic_years_pending')

    class Meta:
        db_table        = 'academic_years'
        unique_together = ('course', 'year_number', 'graduation_year')
        ordering        = ['course', 'year_number']

    def __str__(self):
        return f'{self.course.code} — Year {self.year_number} ({self.graduation_year})'


class Semester(models.Model):
    academic_year     = models.ForeignKey(AcademicYear, on_delete=models.RESTRICT,
                                          related_name='semesters')
    semester_number   = models.PositiveSmallIntegerField(
                            help_text='e.g. 1 through 8'
                        )
    start_date        = models.DateField(null=True, blank=True)
    end_date          = models.DateField(null=True, blank=True)
    created_by        = models.ForeignKey(User, on_delete=models.RESTRICT,
                                          related_name='semesters_created')
    created_at        = models.DateTimeField(auto_now_add=True)
    is_deleted        = models.BooleanField(default=False)
    pending_audit     = models.ForeignKey('audit.AuditRequest', null=True, blank=True,
                                          on_delete=models.SET_NULL,
                                          related_name='semesters_pending')

    class Meta:
        db_table        = 'semesters'
        unique_together = ('academic_year', 'semester_number')
        ordering        = ['academic_year', 'semester_number']

    def __str__(self):
        return (
            f'{self.academic_year.course.code} — '
            f'Year {self.academic_year.year_number} '
            f'Sem {self.semester_number}'
        )


class Subject(models.Model):
    school      = models.ForeignKey(School, on_delete=models.RESTRICT,
                                    related_name='subjects')
    semester    = models.ForeignKey(Semester, on_delete=models.RESTRICT,
                                    related_name='subjects')
    name        = models.CharField(max_length=255)
    code        = models.CharField(max_length=50)
    created_by  = models.ForeignKey(User, on_delete=models.RESTRICT,
                                    related_name='subjects_created')
    created_at  = models.DateTimeField(auto_now_add=True)
    is_active   = models.BooleanField(default=True)
    is_deleted  = models.BooleanField(default=False)
    pending_audit = models.ForeignKey('audit.AuditRequest', null=True, blank=True,
                                      on_delete=models.SET_NULL,
                                      related_name='subjects_pending')

    class Meta:
        db_table        = 'subjects'
        unique_together = ('semester', 'code')
        ordering        = ['semester', 'name']

    def __str__(self):
        return f'{self.code} — {self.name} ({self.semester})'


class ClassGroup(models.Model):
    school      = models.ForeignKey(School, on_delete=models.RESTRICT,
                                    related_name='class_groups')
    course      = models.ForeignKey(Course, on_delete=models.RESTRICT,
                                    related_name='class_groups')
    name        = models.CharField(max_length=100,
                                   help_text='e.g. CSDS-A, CSE-B, CE-A')
    created_by  = models.ForeignKey(User, on_delete=models.RESTRICT,
                                    related_name='class_groups_created')
    created_at  = models.DateTimeField(auto_now_add=True)
    is_active   = models.BooleanField(default=True)
    is_deleted  = models.BooleanField(default=False)
    pending_audit = models.ForeignKey('audit.AuditRequest', null=True, blank=True,
                                      on_delete=models.SET_NULL,
                                      related_name='class_groups_pending')

    class Meta:
        db_table        = 'class_groups'
        unique_together = ('school', 'name')
        ordering        = ['course', 'name']

    def __str__(self):
        return f'{self.name} ({self.course.code})'


class ExamGroup(models.Model):
    school        = models.ForeignKey(School, on_delete=models.RESTRICT,
                                      related_name='exam_groups')
    semester      = models.ForeignKey(Semester, on_delete=models.RESTRICT,
                                      related_name='exam_groups')
    name          = models.CharField(max_length=255)
    class_groups  = models.ManyToManyField(
                        ClassGroup,
                        related_name='exam_groups',
                        blank=True,
                        help_text='Class groups included in this exam group'
                    )
    created_by    = models.ForeignKey(User, on_delete=models.RESTRICT,
                                      related_name='exam_groups_created')
    created_at    = models.DateTimeField(auto_now_add=True)
    is_deleted    = models.BooleanField(default=False)
    pending_audit = models.ForeignKey('audit.AuditRequest', null=True, blank=True,
                                      on_delete=models.SET_NULL,
                                      related_name='exam_groups_pending')

    class Meta:
        db_table        = 'exam_groups'
        unique_together = ('semester', 'name')
        ordering        = ['semester', 'name']

    def __str__(self):
        return f'{self.name} — {self.semester}'


class Club(models.Model):
    TYPE_CHOICES = [
        ('club',      'Club'),
        ('committee', 'Committee'),
        ('placecom',  'Placement Committee'),
    ]

    school      = models.ForeignKey(School, on_delete=models.RESTRICT,
                                    related_name='clubs')
    name        = models.CharField(max_length=255)
    type        = models.CharField(max_length=20, choices=TYPE_CHOICES,
                                   default='club')
    created_by  = models.ForeignKey(User, on_delete=models.RESTRICT,
                                    related_name='clubs_created')
    created_at  = models.DateTimeField(auto_now_add=True)
    is_active   = models.BooleanField(default=True)
    is_deleted  = models.BooleanField(default=False)
    pending_audit = models.ForeignKey('audit.AuditRequest', null=True, blank=True,
                                      on_delete=models.SET_NULL,
                                      related_name='clubs_pending')

    class Meta:
        db_table        = 'clubs'
        unique_together = ('school', 'name')
        ordering        = ['type', 'name']

    def __str__(self):
        return f'{self.name} ({self.type})'


class FacultyTeachingAssignment(models.Model):
    """
    Links a faculty member to the subjects and class groups they teach.
    Created by faculty, approved by admin.
    """
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    faculty         = models.ForeignKey(
                          User, on_delete=models.CASCADE,
                          related_name='teaching_assignments',
                          limit_choices_to={'role': 'user'}
                      )
    school          = models.ForeignKey(School, on_delete=models.RESTRICT,
                                        related_name='teaching_assignments')
    subject         = models.ForeignKey(Subject, on_delete=models.RESTRICT,
                                        related_name='teaching_assignments')
    class_group     = models.ForeignKey(ClassGroup, on_delete=models.RESTRICT,
                                        related_name='teaching_assignments')
    semester        = models.ForeignKey(Semester, on_delete=models.RESTRICT,
                                        related_name='teaching_assignments')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES,
                                       default='pending')
    requested_at    = models.DateTimeField(auto_now_add=True)
    reviewed_by     = models.ForeignKey(
                          User, on_delete=models.SET_NULL,
                          null=True, blank=True,
                          related_name='assignments_reviewed'
                      )
    reviewed_at     = models.DateTimeField(null=True, blank=True)
    notes           = models.TextField(null=True, blank=True,
                                       help_text='Admin notes on approval/rejection')

    class Meta:
        db_table        = 'faculty_teaching_assignments'
        unique_together = ('faculty', 'subject', 'class_group')
        ordering        = ['-requested_at']
        indexes         = [
            models.Index(fields=['faculty', 'status']),
            models.Index(fields=['school', 'status']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return (
            f'{self.faculty.full_name} — '
            f'{self.subject.name} — '
            f'{self.class_group.name} ({self.status})'
        )