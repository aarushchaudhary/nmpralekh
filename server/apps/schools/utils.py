from apps.schools.models import UserSchoolMapping, School


def get_user_school_ids(user):
    """
    Returns a queryset of school IDs the user is allowed to access.
    Super admins get all schools.
    Everyone else gets only their assigned schools.
    """
    if user.role in ['master', 'super_admin']:
        return School.objects.values_list('id', flat=True)
    return UserSchoolMapping.objects.filter(
        user=user
    ).values_list('school_id', flat=True)