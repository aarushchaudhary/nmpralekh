
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