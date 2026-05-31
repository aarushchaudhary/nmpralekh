from django.db import models
from apps.schools.models import Campus


class GeneratedExport(models.Model):
    TYPE_CHOICES = [
        ('nightly', 'Nightly Automated'),
        ('manual',  'Manual'),
    ]

    campus          = models.ForeignKey(
                          Campus,
                          on_delete=models.CASCADE,
                          related_name='exports',
                          null=True, blank=True
                      )
    export_type     = models.CharField(max_length=10, choices=TYPE_CHOICES)
    filename        = models.CharField(max_length=500)
    filepath        = models.CharField(max_length=1000)
    generated_by    = models.ForeignKey(
                          'accounts.User',
                          on_delete=models.SET_NULL,
                          null=True, blank=True,
                          related_name='exports_generated'
                      )
    generated_at    = models.DateTimeField(auto_now_add=True)
    file_size_kb    = models.PositiveIntegerField(default=0)
    date_range_from = models.DateField(null=True, blank=True)
    date_range_to   = models.DateField(null=True, blank=True)
    record_count    = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'generated_exports'
        ordering = ['-generated_at']

    def __str__(self):
        return (
            f'{self.campus.name if self.campus else "All"} '
            f'— {self.filename}'
        )

class MISDataRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]

    accumulator = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='mis_requests_sent'
    )
    coordinator = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='mis_requests_received'
    )
    date_from = models.DateField()
    date_to = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'mis_data_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"Request from {self.accumulator.username} to {self.coordinator.username}"

class MISReport(models.Model):
    created_by = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='created_mis_reports'
    )
    name = models.CharField(max_length=255, blank=True, null=True)
    data_content = models.TextField()
    date_from = models.DateField()
    date_to = models.DateField()
    
    sent_to_admin = models.BooleanField(default=False)
    sent_to_admin_at = models.DateTimeField(null=True, blank=True)
    
    sent_to_accumulator = models.BooleanField(default=False)
    sent_to_accumulator_at = models.DateTimeField(null=True, blank=True)
    
    sent_to_super_admin = models.BooleanField(default=False)
    sent_to_super_admin_at = models.DateTimeField(null=True, blank=True)
    
    sent_to_chronicle_master = models.BooleanField(default=False)
    sent_to_chronicle_master_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mis_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"Report by {self.created_by.username} ({self.date_from} to {self.date_to})"
