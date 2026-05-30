from django.conf import settings
from django.db.models import Prefetch, Count, Q
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from apps.accounts.models import User
from apps.accounts.serializers import (
    UserSerializer, UserVisibilitySerializer,
    UserCreateSerializer, UserUpdateSerializer, LoginSerializer,
    ChronicleAccumulatorSerializer
)
from apps.accounts.permissions import IsMaster, IsAdmin, IsSuperAdmin, IsAnyRole, IsMISAccumulator, IsChronicleMaster
from config.pagination import StandardPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = LoginSerializer
    # throttle_classes omitted — django-ratelimit handles IP throttling at 10/m
    # (stricter than AnonRateThrottle's default 60/m, so AnonRateThrottle was a no-op)

    @method_decorator(ratelimit(key='ip', rate='10/m', method='POST', block=True))
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if not user:
            return Response(
                {'detail': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'detail': 'Your account has been deactivated'},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh  = RefreshToken.for_user(user)
        response = Response({'user': UserSerializer(user).data})

        # SameSite=None cookies MUST have Secure=True per browser spec.
        # Browsers silently drop SameSite=None cookies that lack the Secure flag,
        # causing instant logout. The Vite dev server runs HTTPS so this is safe.
        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            max_age  = 60 * 30,          # 30 minutes — matches ACCESS_TOKEN_LIFETIME
            httponly = True,
            secure   = True,
            samesite = 'None',
        )
        response.set_cookie(
            'refresh_token',
            str(refresh),
            max_age  = 60 * 60 * 6,      # 6 hours — matches REFRESH_TOKEN_LIFETIME
            httponly = True,
            secure   = True,
            samesite = 'None',
        )
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.Serializer

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass

        response = Response({'detail': 'Logged out successfully'})
        response.delete_cookie('access_token',  samesite='None')
        response.delete_cookie('refresh_token', samesite='None')
        return response


class RefreshTokenView(APIView):
    """Called automatically when access token expires. Rotates the refresh token
    on every use: the old token is blacklisted and a fresh one is issued, so a
    stolen refresh token can only be used once before becoming invalid.
    """
    authentication_classes = []
    permission_classes     = []
    throttle_classes       = []
    serializer_class = serializers.Serializer

    @method_decorator(ratelimit(key='ip', rate='30/m', method='POST', block=True))
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(
                {'detail': 'No refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            old_refresh = RefreshToken(refresh_token)

            # Generate new access token from the existing refresh token.
            new_access = str(old_refresh.access_token)

            # Rotate: blacklist the old refresh token, then issue a new one.
            # This enforces ROTATE_REFRESH_TOKENS / BLACKLIST_AFTER_ROTATION
            # which only apply automatically to simplejwt's built-in view.
            old_refresh.blacklist()
            user_id = old_refresh.payload.get('user_id')
            user    = User.objects.get(pk=user_id)
            if not user.is_active:
                return Response(
                    {'detail': 'Account has been deactivated'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            new_refresh = RefreshToken.for_user(user)

            response = Response({'detail': 'Token refreshed'})

            # SameSite=None requires Secure=True — see LoginView for explanation.
            response.set_cookie(
                'access_token',
                new_access,
                max_age  = 60 * 30,          # 30 minutes — matches ACCESS_TOKEN_LIFETIME
                httponly = True,
                secure   = True,
                samesite = 'None',
            )
            # Replace the old refresh-token cookie with the newly rotated token.
            response.set_cookie(
                'refresh_token',
                str(new_refresh),
                max_age  = 60 * 60 * 6,      # 6 hours — matches REFRESH_TOKEN_LIFETIME
                httponly = True,
                secure   = True,
                samesite = 'None',
            )
            return response
        except Exception:
            return Response(
                {'detail': 'Invalid refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsMaster]
    queryset = User.objects.all().select_related('campus').order_by('-id')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsMaster]
    queryset = User.objects.all().select_related('campus')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        # never hard delete — just deactivate
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'detail': 'User deactivated successfully'})


class SchoolFacultiesView(generics.ListAPIView):
    """Admin sees all faculty users assigned to their school(s)"""
    serializer_class   = UserVisibilitySerializer
    permission_classes = [IsAdmin]
    pagination_class   = StandardPagination
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    search_fields      = ['full_name', 'username', 'email']
    filterset_fields   = ['role']

    def get_queryset(self):
        from apps.schools.models import UserSchoolMapping
        from apps.schools.utils import get_user_school_ids
        
        if getattr(self, "swagger_fake_view", False):
            return User.objects.none()

        school_ids = get_user_school_ids(self.request.user)
        faculty_user_ids = UserSchoolMapping.objects.filter(
            school_id__in=school_ids
        ).values_list('user_id', flat=True)

        qs = User.objects.filter(
            id__in=faculty_user_ids,
            role='user',
            is_active=True
        ).order_by('full_name').prefetch_related(
            Prefetch(
                'school_mappings',
                queryset=UserSchoolMapping.objects.select_related('school')
            )
        )

        # Custom school_code filter
        school_code = self.request.query_params.get('school_code')
        if school_code:
            matching_ids = UserSchoolMapping.objects.filter(
                school__code__iexact=school_code
            ).values_list('user_id', flat=True)
            qs = qs.filter(id__in=matching_ids)

        return qs


class CampusUsersView(generics.ListAPIView):
    """Super Admin sees all users in their campus"""
    serializer_class   = UserVisibilitySerializer
    permission_classes = [IsSuperAdmin]
    pagination_class   = StandardPagination
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    search_fields      = ['full_name', 'username', 'email']
    filterset_fields   = ['role']

    def get_queryset(self):
        from apps.schools.models import UserSchoolMapping
        
        if getattr(self, "swagger_fake_view", False):
            return User.objects.none()

        campus_id = self.request.user.campus_id
        if not campus_id:
            return User.objects.none()

        qs = User.objects.filter(
            campus_id=campus_id,
            is_active=True
        ).exclude(
            role='master'
        ).order_by('role', 'full_name').prefetch_related(
            Prefetch(
                'school_mappings',
                queryset=UserSchoolMapping.objects.select_related('school')
            )
        )

        # Custom school_code filter
        school_code = self.request.query_params.get('school_code')
        if school_code:
            matching_ids = UserSchoolMapping.objects.filter(
                school__code__iexact=school_code
            ).values_list('user_id', flat=True)
            qs = qs.filter(id__in=matching_ids)

        return qs

class AccumulatorCoordinatorsView(generics.ListAPIView):
    """MIS Accumulator sees all MIS Coordinators in their campus"""
    serializer_class   = UserVisibilitySerializer
    permission_classes = [IsMISAccumulator]
    pagination_class   = StandardPagination
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    search_fields      = ['full_name', 'username', 'email']

    def get_queryset(self):
        from apps.schools.models import UserSchoolMapping
        
        campus_id = self.request.user.campus_id
        if not campus_id:
            return User.objects.none()

        return User.objects.filter(
            campus_id=campus_id,
            role='mis_coordinator',
            is_active=True
        ).order_by('full_name').prefetch_related(
            Prefetch(
                'school_mappings',
                queryset=UserSchoolMapping.objects.select_related('school')
            )
        )

class ChronicleAccumulatorsView(generics.ListAPIView):
    """Chronicle Master sees all MIS Accumulators and their coordinator counts"""
    serializer_class   = ChronicleAccumulatorSerializer
    permission_classes = [IsChronicleMaster]
    pagination_class   = StandardPagination
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    search_fields      = ['full_name', 'username', 'email']

    def get_queryset(self):
        return User.objects.filter(
            role='mis_accumulator',
            is_active=True
        ).annotate(
            coordinator_count=Count(
                'campus__users',
                filter=Q(campus__users__role='mis_coordinator', campus__users__is_active=True)
            )
        ).select_related('campus').order_by('full_name')

class ServiceUserManagementView(APIView):
    permission_classes = [IsMaster]
    serializer_class = serializers.Serializer

    def get(self, request):
        exists = User.objects.filter(is_service_admin=True).exists()
        return Response({"exists": exists})

    def post(self, request):
        if User.objects.filter(is_service_admin=True).exists():
            return Response({"detail": "Service user already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password", "").strip()
        
        if not username or not email or not password:
            return Response({"detail": "Username, email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            full_name="Service Admin",
            role="service_admin",
            is_service_admin=True
        )
        return Response({"detail": "Service user created successfully."}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        password = request.data.get("password", "").strip()
        if not password:
            return Response({"detail": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(is_service_admin=True)
            user.set_password(password)
            user.save()
            return Response({"detail": "Password updated successfully."})
        except User.DoesNotExist:
            return Response({"detail": "Service user does not exist."}, status=status.HTTP_404_NOT_FOUND)

class ChronicleMasterManagementView(APIView):
    permission_classes = [IsMaster]
    serializer_class = serializers.Serializer

    def get(self, request):
        exists = User.objects.filter(is_chronicle_master=True).exists()
        return Response({"exists": exists})

    def post(self, request):
        if User.objects.filter(is_chronicle_master=True).exists():
            return Response({"detail": "Chronicle Master already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password", "").strip()
        
        if not username or not email or not password:
            return Response({"detail": "Username, email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            full_name="Chronicle Master",
            role="chronicle_master",
            is_chronicle_master=True
        )
        return Response({"detail": "Chronicle Master created successfully."}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        password = request.data.get("password", "").strip()
        if not password:
            return Response({"detail": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(is_chronicle_master=True)
            user.set_password(password)
            user.save()
            return Response({"detail": "Password updated successfully."})
        except User.DoesNotExist:
            return Response({"detail": "Chronicle Master does not exist."}, status=status.HTTP_404_NOT_FOUND)