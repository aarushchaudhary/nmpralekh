from django.core.cache import cache
from apps.records.models import (
    SchoolActivity, StudentActivity,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity
)

DASHBOARD_CACHE_VERSION = 'v1'

def get_cache_key(school_id, role):
    # per-school key, not per-set-of-schools
    return f'dashboard:{DASHBOARD_CACHE_VERSION}:{role}:{school_id}'

def get_dashboard_counts(school_ids, role):
    counts = {
        'school_activities':  0,
        'student_activities': 0,
        'fdp':                0,
        'publications':       0,
        'patents':            0,
        'certifications':     0,
        'placements':         0,
    }
    for school_id in school_ids:
        cache_key    = get_cache_key(school_id, role)
        school_counts = cache.get(cache_key)
        if school_counts is None:
            filters = {'school_id': school_id, 'is_deleted': False}
            school_counts = {
                'school_activities':  SchoolActivity.objects.filter(**filters).count(),
                'student_activities': StudentActivity.objects.filter(**filters).count(),
                'fdp':                FacultyFDPWorkshopGL.objects.filter(**filters).count(),
                'publications':       FacultyPublication.objects.filter(**filters).count(),
                'patents':            Patent.objects.filter(**filters).count(),
                'certifications':     Certification.objects.filter(**filters).count(),
                'placements':         PlacementActivity.objects.filter(**filters).count(),
            }
            cache.set(cache_key, school_counts, timeout=60)
        for k in counts:
            counts[k] += school_counts.get(k, 0)
    return counts

def invalidate_dashboard_cache(school_ids, role=None):
    # now works correctly — school_ids can be a single-element list
    # and it correctly invalidates only that school's cached counts
    roles = [role] if role else ['admin', 'user', 'super_admin', 'mis_coordinator']
    keys  = [get_cache_key(sid, r) for sid in school_ids for r in roles]
    cache.delete_many(keys)
