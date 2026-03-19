from django.db import models
from apps.accounts.models import User
from apps.schools.models import School


class ExamsConducted(models.Model):
    school          = models.ForeignKey(School, on_delete=models.RESTRICT,
                                        related_name='exams')
    exam_group      = models.ForeignKey('academics.ExamGroup',
                                        on_delete=models.RESTRICT,
                                        related_name='exams',
                                        null=True, blank=True)
    subject         = models.ForeignKey('academics.Subject',
                                        on_delete=models.RESTRICT,
                                        related_name='exams',
                                        null=True, blank=True)
    class_group     = models.ForeignKey('academics.ClassGroup',
                                        on_delete=models.RESTRICT,
                                        related_name='exams',
                                        null=True, blank=True)
    faculty         = models.ForeignKey(User, on_delete=models.RESTRICT,
                                        related_name='exams_conducted',
                                        null=True, blank=True)
    date            = models.DateField()
    created_by      = models.ForeignKey(User, on_delete=models.RESTRICT,
                                        related_name='exams_created')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)
    is_deleted      = models.BooleanField(default=False)
    pending_audit   = models.ForeignKey('audit.AuditRequest', null=True,
                                        blank=True, on_delete=models.SET_NULL,
                                        related_name='exams_pending')

    class Meta:
        db_table = 'exams_conducted'
        ordering = ['-date']

    def __str__(self):
        return (
            f'{self.exam_group.name if self.exam_group else "No Group"} — '
            f'{self.subject.name if self.subject else "No Subject"} — '
            f'{self.class_group.name if self.class_group else "No Class"}'
        )


class SchoolActivity(models.Model):
    school         = models.ForeignKey(School, on_delete=models.RESTRICT, related_name='school_activities')
    name           = models.CharField(max_length=500)
    date           = models.DateField()
    details        = models.TextField()
    is_school_wide = models.BooleanField(default=False)
    created_by     = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='school_activities_created')
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)
    is_deleted     = models.BooleanField(default=False)
    pending_audit  = models.ForeignKey('audit.AuditRequest', null=True, blank=True, on_delete=models.SET_NULL, related_name='school_activities_pending')

    class Meta:
        db_table = 'school_activities'
        ordering = ['-date']

    def __str__(self):
        return f'{self.name} ({self.school.name})'


class SchoolActivityCollaboration(models.Model):
    activity             = models.ForeignKey(SchoolActivity, on_delete=models.CASCADE, related_name='collaborations')
    collaborating_school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='activity_collaborations')
    notes                = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'school_activity_collaborations'
        unique_together = ('activity', 'collaborating_school')

    def __str__(self):
        return f'{self.activity.name} ↔ {self.collaborating_school.name}'


class StudentActivity(models.Model):
    TYPE_CHOICES = [
        ('club',      'Club'),
        ('committee', 'Committee'),
        ('other',     'Other'),
    ]

    school          = models.ForeignKey(School, on_delete=models.RESTRICT,
                                        related_name='student_activities')
    name            = models.CharField(max_length=500)
    date            = models.DateField()
    details         = models.TextField()
    club            = models.ForeignKey('academics.Club', null=True, blank=True,
                                        on_delete=models.SET_NULL,
                                        related_name='student_activities')
    conducted_by    = models.CharField(max_length=255, null=True, blank=True,
                                       help_text='Free text if club not in list')
    activity_type   = models.CharField(max_length=20, choices=TYPE_CHOICES,
                                       default='club')
    created_by      = models.ForeignKey(User, on_delete=models.RESTRICT,
                                        related_name='student_activities_created')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)
    is_deleted      = models.BooleanField(default=False)
    pending_audit   = models.ForeignKey('audit.AuditRequest', null=True,
                                        blank=True, on_delete=models.SET_NULL,
                                        related_name='student_activities_pending')

    class Meta:
        db_table = 'student_activities'
        ordering = ['-date']

    def __str__(self):
        return f'{self.name} by {self.club or self.conducted_by}'


class StudentActivityCollaboration(models.Model):
    activity                    = models.ForeignKey(StudentActivity, on_delete=models.CASCADE, related_name='collaborations')
    collaborating_club_or_committee = models.CharField(max_length=255, null=True, blank=True)
    collaborating_school        = models.ForeignKey(School, null=True, blank=True, on_delete=models.SET_NULL, related_name='student_activity_collaborations')

    class Meta:
        db_table = 'student_activity_collaborations'

    def __str__(self):
        return f'{self.activity.name} collaboration'


class FacultyFDPWorkshopGL(models.Model):
    TYPE_CHOICES = [
        ('FDP',           'FDP'),
        ('Workshop',      'Workshop'),
        ('Guest_Lecture', 'Guest Lecture'),
    ]

    school          = models.ForeignKey(School, on_delete=models.RESTRICT, related_name='fdp_activities')
    faculty_name    = models.CharField(max_length=255)
    date_start      = models.DateField()
    date_end        = models.DateField(null=True, blank=True)
    name            = models.CharField(max_length=500)
    details         = models.TextField()
    type            = models.CharField(max_length=20, choices=TYPE_CHOICES)
    organizing_body = models.CharField(max_length=255, null=True, blank=True)
    created_by      = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='fdp_created')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)
    is_deleted      = models.BooleanField(default=False)
    pending_audit   = models.ForeignKey('audit.AuditRequest', null=True, blank=True, on_delete=models.SET_NULL, related_name='fdp_pending')

    class Meta:
        db_table = 'faculty_fdp_workshop_gl'
        ordering = ['-date_start']

    def __str__(self):
        return f'{self.type} - {self.name} ({self.faculty_name})'


class FacultyPublication(models.Model):
    AUTHOR_TYPE_CHOICES = [
        ('faculty', 'Faculty'),
        ('student', 'Student'),
    ]

    school                      = models.ForeignKey(School, on_delete=models.RESTRICT, related_name='publications')
    author_name                 = models.CharField(max_length=255)
    author_type                 = models.CharField(max_length=10, choices=AUTHOR_TYPE_CHOICES, default='faculty')
    title_of_paper              = models.CharField(max_length=1000)
    journal_or_conference_name  = models.CharField(max_length=500)
    date                        = models.DateField()
    venue                       = models.CharField(max_length=500, null=True, blank=True)
    publication                 = models.CharField(max_length=255, null=True, blank=True)
    doi_or_link                 = models.CharField(max_length=500, null=True, blank=True)
    created_by                  = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='publications_created')
    created_at                  = models.DateTimeField(auto_now_add=True)
    updated_at                  = models.DateTimeField(auto_now=True)
    is_deleted                  = models.BooleanField(default=False)
    pending_audit               = models.ForeignKey('audit.AuditRequest', null=True, blank=True, on_delete=models.SET_NULL, related_name='publications_pending')
    is_own_work                 = models.BooleanField(default=True, help_text='Faculty marking this as their own publication')

    class Meta:
        db_table = 'faculty_publications'
        ordering = ['-date']

    def __str__(self):
        return f'{self.title_of_paper} by {self.author_name}'


class Patent(models.Model):
    APPLICANT_TYPE_CHOICES = [
        ('faculty', 'Faculty'),
        ('student', 'Student'),
    ]

    STATUS_CHOICES = [
        ('filed',     'Filed'),
        ('published', 'Published'),
        ('granted',   'Granted'),
    ]

    school               = models.ForeignKey(School, on_delete=models.RESTRICT, related_name='patents')
    applicant_name       = models.CharField(max_length=255)
    applicant_type       = models.CharField(max_length=10, choices=APPLICANT_TYPE_CHOICES, default='faculty')
    title_of_patent      = models.CharField(max_length=1000)
    details              = models.TextField(null=True, blank=True)
    date_of_publication  = models.DateField()
    journal_number       = models.CharField(max_length=100)
    patent_status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='filed')
    created_by           = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='patents_created')
    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)
    is_deleted           = models.BooleanField(default=False)
    pending_audit        = models.ForeignKey('audit.AuditRequest', null=True, blank=True, on_delete=models.SET_NULL, related_name='patents_pending')
    is_own_work          = models.BooleanField(default=True, help_text='Faculty marking this as their own patent')

    class Meta:
        db_table = 'patents'
        ordering = ['-date_of_publication']

    def __str__(self):
        return f'{self.title_of_patent} ({self.applicant_name})'


class Certification(models.Model):
    PERSON_TYPE_CHOICES = [
        ('faculty', 'Faculty'),
        ('student', 'Student'),
    ]

    school               = models.ForeignKey(School, on_delete=models.RESTRICT, related_name='certifications')
    date                 = models.DateField()
    name                 = models.CharField(max_length=255)
    title_of_course      = models.CharField(max_length=500)
    details              = models.TextField(null=True, blank=True)
    agency               = models.CharField(max_length=255)
    credly_or_proof_link = models.CharField(max_length=500, null=True, blank=True)
    person_type          = models.CharField(max_length=10, choices=PERSON_TYPE_CHOICES, default='faculty')
    created_by           = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='certifications_created')
    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)
    is_deleted           = models.BooleanField(default=False)
    pending_audit        = models.ForeignKey('audit.AuditRequest', null=True, blank=True, on_delete=models.SET_NULL, related_name='certifications_pending')

    class Meta:
        db_table = 'certifications'
        ordering = ['-date']

    def __str__(self):
        return f'{self.title_of_course} - {self.name}'


class PlacementActivity(models.Model):
    school          = models.ForeignKey(School, on_delete=models.RESTRICT,
                                        related_name='placements')
    name            = models.CharField(max_length=500)
    date            = models.DateField()
    details         = models.TextField()
    company_name    = models.CharField(max_length=255, null=True, blank=True)
    placecom        = models.ForeignKey('academics.Club', null=True, blank=True,
                                        on_delete=models.SET_NULL,
                                        related_name='placement_activities',
                                        limit_choices_to={'type': 'placecom'})
    created_by      = models.ForeignKey(User, on_delete=models.RESTRICT,
                                        related_name='placements_created')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)
    is_deleted      = models.BooleanField(default=False)
    pending_audit   = models.ForeignKey('audit.AuditRequest', null=True,
                                        blank=True, on_delete=models.SET_NULL,
                                        related_name='placements_pending')

    class Meta:
        db_table = 'placement_activities'
        ordering = ['-date']

    def __str__(self):
        return f'{self.name} ({self.school.name})'

class StudentMarks(models.Model):
    exam            = models.ForeignKey(ExamsConducted, on_delete=models.CASCADE,
                                        related_name='marks')
    student_name    = models.CharField(max_length=255)
    roll_number     = models.CharField(max_length=50)
    marks_obtained  = models.DecimalField(max_digits=6, decimal_places=2)
    max_marks       = models.DecimalField(max_digits=6, decimal_places=2)
    is_absent       = models.BooleanField(default=False)
    created_by      = models.ForeignKey(User, on_delete=models.RESTRICT,
                                        related_name='marks_entered')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table        = 'student_marks'
        unique_together = ('exam', 'roll_number')
        ordering        = ['roll_number']

    def __str__(self):
        return (
            f'{self.student_name} ({self.roll_number}) — '
            f'{self.marks_obtained}/{self.max_marks}'
        )


class PublicationAuthor(models.Model):
    """Links multiple faculty/students to a single publication"""
    publication = models.ForeignKey(
                      'FacultyPublication',
                      on_delete=models.CASCADE,
                      related_name='authors'
                  )
    name        = models.CharField(max_length=255)
    author_type = models.CharField(
                      max_length=10,
                      choices=[('faculty', 'Faculty'), ('student', 'Student')],
                      default='faculty'
                  )
    is_primary  = models.BooleanField(default=False,
                      help_text='Primary/corresponding author')
    order       = models.PositiveSmallIntegerField(default=1,
                      help_text='Author order in publication')

    class Meta:
        db_table = 'publication_authors'
        ordering = ['order']

    def __str__(self):
        return f'{self.name} → {self.publication.title_of_paper[:50]}'


class PatentApplicant(models.Model):
    """Links multiple faculty/students to a single patent"""
    patent          = models.ForeignKey(
                          'Patent',
                          on_delete=models.CASCADE,
                          related_name='applicants'
                      )
    name            = models.CharField(max_length=255)
    applicant_type  = models.CharField(
                          max_length=10,
                          choices=[('faculty', 'Faculty'), ('student', 'Student')],
                          default='faculty'
                      )
    is_primary      = models.BooleanField(default=False)

    class Meta:
        db_table = 'patent_applicants'
        ordering = ['id']

    def __str__(self):
        return f'{self.name} → {self.patent.title_of_patent[:50]}'