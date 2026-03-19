from django.db import models
from apps.accounts.models import User


class Campus(models.Model):
    name       = models.CharField(max_length=255, unique=True)
    code       = models.CharField(max_length=20,  unique=True)
    city       = models.CharField(max_length=100)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'campuses'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.code})'


class School(models.Model):
    campus     = models.ForeignKey(
                     Campus,
                     on_delete=models.RESTRICT,
                     related_name='schools',
                     null=True, blank=True   # nullable for existing data
                 )
    name       = models.CharField(max_length=255, unique=True)
    code       = models.CharField(max_length=20, unique=True)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'schools'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.code})'


class UserSchoolMapping(models.Model):
    user        = models.ForeignKey(
                    User,
                    on_delete=models.CASCADE,
                    related_name='school_mappings'
                  )
    school      = models.ForeignKey(
                    School,
                    on_delete=models.CASCADE,
                    related_name='user_mappings'
                  )
    assigned_by = models.ForeignKey(
                    User,
                    on_delete=models.RESTRICT,
                    related_name='assigned_mappings'
                  )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_school_mapping'
        unique_together = ('user', 'school')
        ordering = ['-assigned_at']

    def __str__(self):
        return f'{self.user.username} → {self.school.name}'