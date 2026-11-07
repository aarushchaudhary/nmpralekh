import time

from django.core.cache import cache
from django.db.models import Count

from apps.records.models import (
    SchoolActivity, StudentActivity,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity
)
from apps.schools.utils import scope_to_faculty

DASHBOARD_CACHE_VERSION = 'v2'

MODULES = {
    'school_activities':  SchoolActivity,
    'student_activities': StudentActivity,
    'fdp':                FacultyFDPWorkshopGL,
    'publications':       FacultyPublication,
    'patents':            Patent,
    'certifications':     Certification,
    'placements':         PlacementActivity,
}


def _stamp_key(school_id):
    return f'dashboard:{DASHBOARD_CACHE_VERSION}:stamp:{school_id}'


def _counts_key(school_id, stamp, user):
    # faculty counts are per user (they only see their own pubs/patents/certs)
    who = f'user:{user.id}' if user.role == 'user' else user.role
    return f'dashboard:{DASHBOARD_CACHE_VERSION}:{school_id}:{stamp}:{who}'


def get_dashboard_counts(school_ids, user):
    stamps = cache.get_many([_stamp_key(s) for s in school_ids])
    keys   = {s: _counts_key(s, stamps.get(_stamp_key(s), 0), user) for s in school_ids}
    cached = cache.get_many(list(keys.values()))

    per_school = {s: cached[k] for s, k in keys.items() if k in cached}
    missing    = [s for s in school_ids if s not in per_school]
    if missing:
        # one grouped query per module for all missing schools, not 7 per school
        fresh = {s: dict.fromkeys(MODULES, 0) for s in missing}
        for name, model in MODULES.items():
            qs = scope_to_faculty(
                model.objects.filter(school_id__in=missing, is_deleted=False), user
            )
            for school_id, n in qs.order_by().values_list('school_id').annotate(n=Count('id')):
                fresh[school_id][name] = n
        cache.set_many({keys[s]: fresh[s] for s in missing}, timeout=60)
        per_school.update(fresh)

    return {name: sum(c[name] for c in per_school.values()) for name in MODULES}


def invalidate_dashboard_cache(school_ids):
    # A new stamp makes every cached count for these schools (all roles and users) unreachable
    stamp = time.time_ns()
    cache.set_many({_stamp_key(s): stamp for s in school_ids}, timeout=None)
