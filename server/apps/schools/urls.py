from django.urls import path
from . import views

urlpatterns = [
    path('',                  views.SchoolListCreateView.as_view(),           name='school_list_create'),
    path('<int:pk>/',          views.SchoolDetailView.as_view(),               name='school_detail'),
    path('assign/',            views.UserSchoolMappingListCreateView.as_view(), name='assign_list_create'),
    path('assign/<int:pk>/',   views.UserSchoolMappingDetailView.as_view(),     name='assign_detail'),
    path('my-schools/',        views.MySchoolsView.as_view(),                  name='my_schools'),
]