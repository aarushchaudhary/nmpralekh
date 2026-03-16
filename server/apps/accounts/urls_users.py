from django.urls import path
from . import views

urlpatterns = [
    path('',          views.UserListCreateView.as_view(),    name='user_list_create'),
    path('<int:pk>/',  views.UserDetailView.as_view(),        name='user_detail'),
]