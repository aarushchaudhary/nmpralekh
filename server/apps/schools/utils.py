from apps.schools.models import UserSchoolMapping, School, Campus


def get_user_school_ids(user):
    """
    Returns school IDs the user can access.
    Super admins get all schools in their campus.
    Master gets everything.
    Everyone else gets only their assigned schools.
    """
    if user.role == 'master':
        return School.objects.values_list('id', flat=True)

    if user.role == 'super_admin':
        # super admin sees all schools in their campus
        if user.campus_id:
            return School.objects.filter(
                campus_id=user.campus_id,
                is_active=True
            ).values_list('id', flat=True)
        return School.objects.values_list('id', flat=True)

    return UserSchoolMapping.objects.filter(
        user=user
    ).values_list('school_id', flat=True)


def get_user_campus_id(user):
    """Returns the campus ID for the user"""
    return user.campus_id