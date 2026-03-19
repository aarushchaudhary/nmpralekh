from django.conf import settings
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from apps.accounts.models import User
from apps.accounts.serializers import (
    UserSerializer, UserCreateSerializer,
    UserUpdateSerializer, LoginSerializer
)
from apps.accounts.permissions import IsMaster, IsAnyRole
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit


class LoginView(APIView):
    permission_classes = []
    throttle_classes   = [AnonRateThrottle]

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

        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            max_age  = 60 * 30,
            httponly = True,
            secure   = True,
            samesite = 'None',
        )
        response.set_cookie(
            'refresh_token',
            str(refresh),
            max_age  = 60 * 60 * 24 * 7,
            httponly = True,
            secure   = True,
            samesite = 'None',
        )
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

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
    """Called automatically when access token expires"""
    permission_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(
                {'detail': 'No refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            refresh  = RefreshToken(refresh_token)
            response = Response({'detail': 'Token refreshed'})
            response.set_cookie(
                'access_token',
                str(refresh.access_token),
                max_age  = 60 * 30,
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

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsMaster]
    queryset = User.objects.all().order_by('-id')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsMaster]
    queryset = User.objects.all()

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