from django.urls import path
from . import views

urlpatterns = [
    path('school-faculties/', views.SchoolFacultiesView.as_view(), name='school_faculties'),
    path('campus-users/',     views.CampusUsersView.as_view(),     name='campus_users'),
    path('accumulator-coordinators/', views.AccumulatorCoordinatorsView.as_view(), name='accumulator_coordinators'),
    path('',                  views.UserListCreateView.as_view(),  name='user_list_create'),
    path('<int:pk>/',         views.UserDetailView.as_view(),      name='user_detail'),
    path('master/service-user/', views.ServiceUserManagementView.as_view(), name='service_user_management'),
]