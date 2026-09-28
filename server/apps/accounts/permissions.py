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

class IsAnyRole(BasePermission):
    """Any authenticated user regardless of role"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated
        )
