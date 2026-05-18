from apps.schools.models import UserSchoolMapping, School


def get_user_school_ids(user):
    cache_attr = '_cached_school_ids'

    # Check if we've already fetched the IDs during this request
    if hasattr(user, cache_attr):
        return getattr(user, cache_attr)

    if user.role == 'master':
        result = School.objects.all().values_list('id', flat=True)
    elif user.role in ['super_admin', 'delete_auth']:
        if user.campus_id:
            result = School.objects.filter(
                campus_id=user.campus_id,
                is_active=True
            ).values_list('id', flat=True)
        else:
            result = School.objects.none().values_list('id', flat=True)
    else:
        # admin, user, mis_coordinator — scoped via UserSchoolMapping
        result = UserSchoolMapping.objects.filter(
            user=user
        ).values_list('school_id', flat=True)

    # Force query evaluation (cast to list) and cache it on the user object
    setattr(user, cache_attr, list(result))
    return getattr(user, cache_attr)