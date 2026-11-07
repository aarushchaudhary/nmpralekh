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


def scope_to_faculty(qs, user):
    """Faculty only see their own publications, patents and certifications —
    the same rule the record list views apply."""
    from django.db.models import Q
    from apps.records.models import (
        FacultyPublication, Patent, Certification, PublicationAuthor, PatentApplicant
    )
    if user is None or user.role != 'user':
        return qs
    if qs.model is FacultyPublication:
        co_authored = PublicationAuthor.objects.filter(user=user).values('publication_id')
        return qs.filter(Q(created_by=user) | Q(id__in=co_authored))
    if qs.model is Patent:
        co_applied = PatentApplicant.objects.filter(user=user).values('patent_id')
        return qs.filter(Q(created_by=user) | Q(id__in=co_applied))
    if qs.model is Certification:
        return qs.filter(created_by=user)
    return qs
