from django.urls import path
from . import views

urlpatterns = [
    path('school-faculties/', views.SchoolFacultiesView.as_view(), name='school_faculties'),
    path('campus-users/',     views.CampusUsersView.as_view(),     name='campus_users'),
    path('',                  views.UserListCreateView.as_view(),  name='user_list_create'),
    path('<int:pk>/',         views.UserDetailView.as_view(),      name='user_detail'),
]