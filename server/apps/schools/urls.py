from django.urls import path
from . import views

urlpatterns = [
    # Campuses
    path('campuses/',                   views.CampusListCreateView.as_view(),  name='campus_list_create'),
    path('campuses/<int:pk>/',           views.CampusDetailView.as_view(),      name='campus_detail'),
    path('campuses/<int:pk>/schools/',   views.CampusSchoolsView.as_view(),     name='campus_schools'),
    path('campuses/<int:pk>/users/',     views.CampusUsersView.as_view(),       name='campus_users'),

    # Schools
    path('',                             views.SchoolListCreateView.as_view(),           name='school_list_create'),
    path('<int:pk>/',                    views.SchoolDetailView.as_view(),               name='school_detail'),
    path('assign/',                      views.UserSchoolMappingListCreateView.as_view(), name='assign_list_create'),
    path('assign/<int:pk>/',             views.UserSchoolMappingDetailView.as_view(),     name='assign_detail'),
    path('my-schools/',                  views.MySchoolsView.as_view(),                  name='my_schools'),
    path('faculty/',                     views.SchoolFacultyView.as_view(),              name='school_faculty'),
]