from django.urls import path
from . import views

urlpatterns = [
    path('',                    views.AuditRequestListView.as_view(),   name='audit_list'),
    path('<int:pk>/',            views.AuditRequestDetailView.as_view(), name='audit_detail'),
    path('<int:pk>/approve/',    views.AuditApproveView.as_view(),       name='audit_approve'),
    path('<int:pk>/reject/',     views.AuditRejectView.as_view(),        name='audit_reject'),
    path('history/',             views.AuditHistoryView.as_view(),       name='audit_history'),
]