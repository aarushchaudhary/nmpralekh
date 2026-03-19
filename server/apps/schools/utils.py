from apps.schools.models import UserSchoolMapping, School


def get_user_school_ids(user):
    if user.role == 'master':
        return School.objects.all().values_list('id', flat=True)

    if user.role in ['super_admin', 'delete_auth']:
        if user.campus_id:
            return School.objects.filter(
                campus_id=user.campus_id,
                is_active=True
            ).values_list('id', flat=True)
        return School.objects.none().values_list('id', flat=True)

    return UserSchoolMapping.objects.filter(
        user=user
    ).values_list('school_id', flat=True)