from django.db import models
from apps.accounts.models import User


class AuditRequest(models.Model):
    ACTION_CHOICES = [
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ]

    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    TABLE_CHOICES = [
        ('exams_conducted',                'Exams Conducted'),
        ('school_activities',              'School Activities'),
        ('student_activities',             'Student Activities'),
        ('faculty_fdp_workshop_gl',        'Faculty FDP / Workshop / GL'),
        ('faculty_publications',           'Faculty Publications'),
        ('patents',                        'Patents'),
        ('certifications',                 'Certifications'),
        ('placement_activities',           'Placement Activities'),
    ]

    table_name   = models.CharField(max_length=100, choices=TABLE_CHOICES)
    record_id    = models.PositiveIntegerField()
    action       = models.CharField(max_length=10, choices=ACTION_CHOICES)
    old_data     = models.JSONField()
    new_data     = models.JSONField(null=True, blank=True)
    requested_by = models.ForeignKey(
                        User,
                        on_delete=models.RESTRICT,
                        related_name='audit_requests_made'
                    )
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_by  = models.ForeignKey(
                        User,
                        null=True,
                        blank=True,
                        on_delete=models.SET_NULL,
                        related_name='audit_requests_reviewed'
                    )
    reviewed_at  = models.DateTimeField(null=True, blank=True)
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    class Meta:
        db_table = 'audit_requests'
        ordering = ['-requested_at']

    def __str__(self):
        return f'{self.action} on {self.table_name} (record {self.record_id}) — {self.status}'
