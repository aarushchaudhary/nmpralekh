from django.urls import path
from . import views

urlpatterns = [
    # Stats dashboard
    path('stats/',                      views.ServiceDashboardStatsView.as_view(),  name='service_stats'),

    # Error tickets (admin)
    path('tickets/',                    views.ErrorTicketListView.as_view(),        name='ticket_list'),
    path('tickets/<int:pk>/',           views.ErrorTicketDetailView.as_view(),      name='ticket_detail'),
    path('tickets/<int:pk>/status/',    views.ErrorTicketStatusView.as_view(),      name='ticket_status'),

    # Bug reports (create = any user, list/detail = admin)
    path('bug-reports/',                views.BugReportListView.as_view(),          name='bug_report_list'),
    path('bug-reports/submit/',         views.BugReportCreateView.as_view(),        name='bug_report_create'),
    path('bug-reports/<int:pk>/',       views.BugReportDetailView.as_view(),        name='bug_report_detail'),

    # Error ingestion (any authenticated user, called silently by frontend)
    path('report-error/',               views.ReportErrorView.as_view(),            name='report_error'),
]