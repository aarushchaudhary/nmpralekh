import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()

from apps.accounts.models import User
from apps.schools.models import School, UserSchoolMapping
from apps.records.models import SchoolActivity

print(f"Users: {User.objects.count()}")
print(f"Schools: {School.objects.count()}")
print(f"UserSchoolMappings: {UserSchoolMapping.objects.count()}")
print(f"SchoolActivities: {SchoolActivity.objects.count()}")

faculty = User.objects.filter(role='user').first()
if faculty:
    print(f"First Faculty: {faculty.username}")
    mappings = UserSchoolMapping.objects.filter(user=faculty)
    print(f"Mapped schools for faculty: {list(mappings.values_list('school__name', flat=True))}")
else:
    print("No faculty found")
