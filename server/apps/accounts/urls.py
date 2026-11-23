from django.urls import path
from .views import LoginView, LogoutView, MeView, RefreshTokenView, ChangePasswordView

urlpatterns = [
    path('login/',   LoginView.as_view(),   name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('logout/',  LogoutView.as_view(),  name='logout'),
    path('me/',      MeView.as_view(),      name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]