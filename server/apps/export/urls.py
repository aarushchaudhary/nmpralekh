from django.urls import path
from . import views

urlpatterns = [
    # record exports
    path('school-activities/',    views.ExportSchoolActivitiesView.as_view(),  name='export_sact'),
    path('student-activities/',   views.ExportStudentActivitiesView.as_view(), name='export_stact'),
    path('fdp/',                  views.ExportFDPView.as_view(),               name='export_fdp'),
    path('publications/',         views.ExportPublicationsView.as_view(),      name='export_pub'),
    path('patents/',              views.ExportPatentsView.as_view(),           name='export_patents'),
    path('certifications/',       views.ExportCertificationsView.as_view(),    name='export_cert'),
    path('placements/',           views.ExportPlacementsView.as_view(),        name='export_placements'),
    path('all/',                  views.ExportAllView.as_view(),               name='export_all'),

    # coordinator export
    path('coordinator/',          views.CoordinatorExportView.as_view(),       name='export_coordinator'),

    # export management
    path('history/',              views.ExportHistoryView.as_view(),          name='export_history'),
    path('download/<int:pk>/',    views.ExportDownloadView.as_view(),         name='export_download'),
    path('manual/',               views.TriggerManualExportView.as_view(),    name='manual_export'),
    path('nightly/trigger/',      views.TriggerNightlyExportView.as_view(),   name='trigger_nightly'),
    path('status/<str:task_id>/', views.ExportTaskStatusView.as_view(),       name='export_status'),
]