
from rest_framework.permissions import BasePermission


class IsMaster(BasePermission):
    """Only master login can access"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'master'
        )


class IsSuperAdmin(BasePermission):
    """Only super admin can access"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'super_admin'
        )


class IsAdmin(BasePermission):
    """Only admin (dean, program chair) can access"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsUser(BasePermission):
    """Only faculty user can access"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'user'
        )


class IsDeleteAuth(BasePermission):
    """Only delete_auth role can access"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'delete_auth'
        )


class IsMasterOrSuperAdmin(BasePermission):
    """Master or super admin"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['master', 'super_admin']
        )


class IsAdminOrUser(BasePermission):
    """Admin or faculty user — for record entry endpoints"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['admin', 'user']
        )


class IsAdminOrUserOrSuperAdmin(BasePermission):
    """Admin, faculty, or super admin — for record viewing endpoints"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['admin', 'user', 'super_admin']
        )


class IsAnyRole(BasePermission):
    """Any authenticated user regardless of role"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated
        )


class IsMISCoordinator(BasePermission):
    """Only MIS Coordinator can access"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'mis_coordinator'
        )


class IsMISCoordinatorReadOnly(BasePermission):
    """MIS Coordinator — read-only (GET, HEAD, OPTIONS)"""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role != 'mis_coordinator':
            return False
        return request.method in ('GET', 'HEAD', 'OPTIONS')


class IsAdminOrUserOrSuperAdminOrCoordinator(BasePermission):
    """Admin, faculty, super admin, or MIS coordinator (read-only) — for record viewing"""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role in ['admin', 'user', 'super_admin']:
            return True
        # coordinator gets read-only access
        if request.user.role == 'mis_coordinator':
            return request.method in ('GET', 'HEAD', 'OPTIONS')
        return False