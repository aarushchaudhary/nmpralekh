from rest_framework.permissions import BasePermission, SAFE_METHODS

def RolePermission(allowed_roles, read_only_roles=None, exclude_service_admin=False):
    class Perm(BasePermission):
        def has_permission(self, request, view):
            user = request.user
            if not (user and user.is_authenticated):
                return False
            if exclude_service_admin and getattr(user, 'is_service_admin', False):
                return False
            if 'service_admin' in allowed_roles and getattr(user, 'is_service_admin', False):
                return True
            if 'chronicle_master' in allowed_roles and getattr(user, 'is_chronicle_master', False):
                return True
            if user.role in allowed_roles:
                return True
            if read_only_roles and user.role in read_only_roles:
                return request.method in SAFE_METHODS
            return False
    return Perm


def confirm_own_password(request):
    """Risky actions (reactivating a user, campus or school; resetting someone's password)
    ask the signed-in user to type their own password again, sent as "password".
    Raises 403 when it is missing or wrong.
    Views calling this are rate-limited per user, so it can't be used to guess the password."""
    from django.conf import settings
    from rest_framework.exceptions import PermissionDenied, Throttled
    from apps.accounts.throttles import redis_available, local_one_per_second

    if settings.RATELIMIT_ENABLE and not redis_available() \
            and not local_one_per_second(f'reauth:{request.user.pk}'):
        raise Throttled(detail='Too many attempts. Please wait a second and try again.')
    if not request.user.check_password(request.data.get('password') or ''):
        raise PermissionDenied('Incorrect password.')


# roles a campus super admin looks after (everyone in the campus below them)
_CAMPUS_STAFF = {'admin', 'delete_auth', 'mis_accumulator', 'mis_coordinator', 'user'}


def can_reset_password(actor, target):
    """The person one level above sets a one-time password; nobody resets their own.
    master -> super admins (and the chronicle master / service user it manages);
    super admin -> everyone below in their campus; admin -> faculty and MIS coordinators in their schools."""
    if actor.pk == target.pk or actor.is_service_admin:
        return False
    if actor.role == 'master':
        return target.role in ('super_admin', 'chronicle_master', 'service_admin') \
            or target.is_chronicle_master or target.is_service_admin
    if actor.role == 'super_admin':
        return bool(actor.campus_id) and target.campus_id == actor.campus_id \
            and target.role in _CAMPUS_STAFF
    if actor.role == 'admin':
        from apps.schools.models import UserSchoolMapping
        from apps.schools.utils import get_user_school_ids
        return target.role in ('user', 'mis_coordinator') and UserSchoolMapping.objects.filter(
            user=target, school_id__in=get_user_school_ids(actor)).exists()
    return False
