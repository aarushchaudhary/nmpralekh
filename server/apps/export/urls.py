from django.urls import path
from . import views

urlpatterns = [
    path('exams/',                views.ExportExamsView.as_view(),            name='export_exams'),
    path('school-activities/',    views.ExportSchoolActivitiesView.as_view(), name='export_sact'),
    path('student-activities/',   views.ExportStudentActivitiesView.as_view(),name='export_stact'),
    path('fdp/',                  views.ExportFDPView.as_view(),              name='export_fdp'),
    path('publications/',         views.ExportPublicationsView.as_view(),     name='export_pub'),
    path('patents/',              views.ExportPatentsView.as_view(),          name='export_patents'),
    path('certifications/',       views.ExportCertificationsView.as_view(),   name='export_cert'),
    path('placements/',           views.ExportPlacementsView.as_view(),       name='export_placements'),
    path('all/',                  views.ExportAllView.as_view(),              name='export_all'),
]