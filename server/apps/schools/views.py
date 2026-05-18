from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdminOrUser

from apps.schools.models import Campus, School, UserSchoolMapping
from apps.schools.serializers import (
    SchoolSerializer, SchoolCreateSerializer,
    UserSchoolMappingSerializer, UserSchoolMappingCreateSerializer,
    CampusSerializer, CampusCreateSerializer
)
from apps.schools.utils import get_user_school_ids
from apps.accounts.permissions import IsMaster, IsMasterOrSuperAdmin, IsAnyRole
from config.pagination import StandardPagination


class CampusListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsMaster]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CampusCreateSerializer
        return CampusSerializer

    def get_queryset(self):
        return Campus.objects.all().order_by('name')


class CampusDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsMaster]
    queryset           = Campus.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CampusCreateSerializer
        return CampusSerializer

    def destroy(self, request, *args, **kwargs):
        campus           = self.get_object()
        campus.is_active = False
        campus.save()
        return Response({'detail': 'Campus deactivated'})


class CampusSchoolsView(generics.ListAPIView):
    """All schools belonging to a specific campus"""
    permission_classes = [IsMaster]
    serializer_class   = SchoolSerializer
    pagination_class   = StandardPagination

    def get_queryset(self):
        return School.objects.filter(campus_id=self.kwargs['pk'], is_active=True)


class CampusUsersView(generics.ListAPIView):
    """All users belonging to a specific campus"""
    permission_classes = [IsMaster]
    pagination_class   = StandardPagination

    def get_serializer_class(self):
        from apps.accounts.serializers import UserSerializer
        return UserSerializer

    def get_queryset(self):
        from apps.accounts.models import User
        return User.objects.filter(campus_id=self.kwargs['pk'], is_active=True)


class SchoolListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsMasterOrSuperAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SchoolCreateSerializer
        return SchoolSerializer

    def get_queryset(self):
        user = self.request.user
        qs   = School.objects.filter(is_active=True).order_by('name')

        # master sees all schools
        if user.role == 'master':
            return qs

        # super_admin sees only their campus schools
        if user.role == 'super_admin':
            if user.campus_id:
                return qs.filter(campus_id=user.campus_id)
            return qs.none()

        return qs


class SchoolDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsMaster]
    queryset = School.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return SchoolCreateSerializer
        return SchoolSerializer

    def destroy(self, request, *args, **kwargs):
        school = self.get_object()
        school.is_active = False
        school.save()
        return Response({'detail': 'School deactivated successfully'})


class UserSchoolMappingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsMaster]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserSchoolMappingCreateSerializer
        return UserSchoolMappingSerializer

    def get_queryset(self):
        return UserSchoolMapping.objects.select_related(
            'user', 'school', 'assigned_by'
        ).order_by('-assigned_at')


class UserSchoolMappingDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsMaster]
    queryset = UserSchoolMapping.objects.all()
    serializer_class = UserSchoolMappingSerializer


class MySchoolsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class   = SchoolSerializer
    pagination_class   = StandardPagination

    def get_queryset(self):
        user       = self.request.user
        school_ids = get_user_school_ids(user)
        return School.objects.filter(id__in=school_ids, is_active=True)


class SchoolFacultyView(generics.ListAPIView):
    permission_classes = [IsAdminOrUser]
    pagination_class   = StandardPagination

    def get_serializer_class(self):
        from apps.accounts.serializers import UserSerializer
        return UserSerializer

    def get_queryset(self):
        from apps.accounts.models import User
        school_ids  = get_user_school_ids(self.request.user)
        faculty_ids = UserSchoolMapping.objects.filter(
                          school_id__in=school_ids
                      ).values_list('user_id', flat=True)
        return User.objects.filter(
            id__in=faculty_ids,
            role='user',
            is_active=True
        )