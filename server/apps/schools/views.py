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


class CampusSchoolsView(APIView):
    """All schools belonging to a specific campus"""
    permission_classes = [IsMaster]

    def get(self, request, pk):
        schools = School.objects.filter(campus_id=pk, is_active=True)
        return Response(SchoolSerializer(schools, many=True).data)


class CampusUsersView(APIView):
    """All users belonging to a specific campus"""
    permission_classes = [IsMaster]

    def get(self, request, pk):
        from apps.accounts.models import User
        from apps.accounts.serializers import UserSerializer
        users = User.objects.filter(campus_id=pk, is_active=True)
        return Response(UserSerializer(users, many=True).data)


class SchoolListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsMasterOrSuperAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SchoolCreateSerializer
        return SchoolSerializer

    def get_queryset(self):
        return School.objects.filter(is_active=True).order_by('name')


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


class MySchoolsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        school_ids = get_user_school_ids(request.user)
        schools = School.objects.filter(id__in=school_ids, is_active=True)
        return Response(SchoolSerializer(schools, many=True).data)


class SchoolFacultyView(APIView):
    permission_classes = [IsAdminOrUser]

    def get(self, request):
        school_ids   = get_user_school_ids(request.user)
        faculty_ids  = UserSchoolMapping.objects.filter(
                           school_id__in=school_ids
                       ).values_list('user_id', flat=True)
        from apps.accounts.models import User
        from apps.accounts.serializers import UserSerializer
        faculty      = User.objects.filter(
                           id__in=faculty_ids,
                           role='user',
                           is_active=True
                       )
        return Response(UserSerializer(faculty, many=True).data)