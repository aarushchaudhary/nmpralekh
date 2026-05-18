from django.core.cache import cache
from apps.records.models import (
    SchoolActivity, StudentActivity,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity
)

DASHBOARD_CACHE_VERSION = 'v1'

def get_cache_key(school_ids, role):
    school_key = '-'.join(str(s) for s in sorted(school_ids))
    return f'dashboard:{DASHBOARD_CACHE_VERSION}:{role}:{school_key}'

def get_dashboard_counts(school_ids, role):
    cache_key = get_cache_key(school_ids, role)
    counts = cache.get(cache_key)

    if counts is None:
        filters = {'school_id__in': school_ids, 'is_deleted': False}
        counts = {
            'school_activities':   SchoolActivity.objects.filter(**filters).count(),
            'student_activities':  StudentActivity.objects.filter(**filters).count(),
            'fdp':                 FacultyFDPWorkshopGL.objects.filter(**filters).count(),
            'publications':        FacultyPublication.objects.filter(**filters).count(),
            'patents':             Patent.objects.filter(**filters).count(),
            'certifications':      Certification.objects.filter(**filters).count(),
            'placements':          PlacementActivity.objects.filter(**filters).count(),
        }
        cache.set(cache_key, counts, timeout=60)

    return counts

def invalidate_dashboard_cache(school_ids, role=None):
    # explicit key deletion, no wildcard scan
    roles = [role] if role else ['admin', 'user', 'super_admin', 'mis_coordinator']
    keys = [get_cache_key(school_ids, r) for r in roles]
    cache.delete_many(keys)
