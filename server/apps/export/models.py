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
