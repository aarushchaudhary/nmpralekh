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

    # MIS Data Requests
    path('data-requests/',        views.MISDataRequestListCreateView.as_view(), name='data_requests_list_create'),
    path('data-requests/<int:pk>/', views.MISDataRequestDetailView.as_view(),   name='data_requests_detail'),

    # MIS Reports
    path('reports/',              views.MISReportListCreateView.as_view(),      name='reports_list_create'),
    path('reports/<int:pk>/send-admin/', views.MISReportSendAdminView.as_view(), name='reports_send_admin'),
    path('reports/<int:pk>/send-accumulator/', views.MISReportSendAccumulatorView.as_view(), name='reports_send_accumulator'),
    path('reports/<int:pk>/send-superadmin/', views.MISReportSendSuperAdminView.as_view(), name='reports_send_superadmin'),
    path('reports/<int:pk>/send-chronicle/', views.MISReportSendChronicleMasterView.as_view(), name='reports_send_chronicle'),
    path('reports/received/',     views.ReceivedMISReportsView.as_view(),       name='reports_received'),
]