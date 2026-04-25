from django.core.cache import cache
from apps.records.models import (
    SchoolActivity, StudentActivity,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity
)


def get_dashboard_counts(school_ids, role):
    """
    Returns record counts for dashboard.
    Cached per school set and role for 60 seconds.
    """
    cache_key = f'dashboard_counts_{role}_{hash(tuple(sorted(school_ids)))}'
    counts    = cache.get(cache_key)

    if counts is None:
        filters = {'school_id__in': school_ids, 'is_deleted': False}
        counts  = {
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


def invalidate_dashboard_cache(school_id):
    """Call this whenever a record is created or deleted"""
    cache.delete_many(cache.keys(f'dashboard_counts_*'))
