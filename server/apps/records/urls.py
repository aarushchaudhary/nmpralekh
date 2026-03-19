from django.urls import path
from . import views

urlpatterns = [
    # Exams
    path('exams/',                          views.ExamsListCreateView.as_view(),             name='exams_list_create'),
    path('exams/<int:pk>/',                  views.ExamsDetailView.as_view(),                 name='exams_detail'),

    # School Activities
    path('school-activities/',              views.SchoolActivityListCreateView.as_view(),    name='sact_list_create'),
    path('school-activities/<int:pk>/',      views.SchoolActivityDetailView.as_view(),        name='sact_detail'),

    # Student Activities
    path('student-activities/',             views.StudentActivityListCreateView.as_view(),   name='stact_list_create'),
    path('student-activities/<int:pk>/',     views.StudentActivityDetailView.as_view(),       name='stact_detail'),

    # FDP / Workshop / GL
    path('fdp/',                            views.FDPListCreateView.as_view(),               name='fdp_list_create'),
    path('fdp/<int:pk>/',                    views.FDPDetailView.as_view(),                   name='fdp_detail'),

    # Publications
    path('publications/',                   views.PublicationListCreateView.as_view(),       name='pub_list_create'),
    path('publications/<int:pk>/',           views.PublicationDetailView.as_view(),           name='pub_detail'),
    path('publications/<int:publication_id>/authors/', views.PublicationAuthorListCreateView.as_view(), name='publication_authors'),
    path('publications/<int:publication_id>/authors/<int:pk>/', views.PublicationAuthorDetailView.as_view(), name='publication_author_detail'),

    # Patents
    path('patents/',                        views.PatentListCreateView.as_view(),            name='patent_list_create'),
    path('patents/<int:pk>/',                views.PatentDetailView.as_view(),                name='patent_detail'),
    path('patents/<int:patent_id>/applicants/', views.PatentApplicantListCreateView.as_view(), name='patent_applicants'),
    path('patents/<int:patent_id>/applicants/<int:pk>/', views.PatentApplicantDetailView.as_view(), name='patent_applicant_detail'),

    # Certifications
    path('certifications/',                 views.CertificationListCreateView.as_view(),     name='cert_list_create'),
    path('certifications/<int:pk>/',         views.CertificationDetailView.as_view(),         name='cert_detail'),

    # Placements
    path('placements/',                     views.PlacementListCreateView.as_view(),         name='placement_list_create'),
    path('placements/<int:pk>/',             views.PlacementDetailView.as_view(),             name='placement_detail'),

    # Student Marks
    path('marks/',          views.StudentMarksListCreateView.as_view(),  name='marks_list_create'),
    path('marks/<int:pk>/', views.StudentMarksDetailView.as_view(),       name='marks_detail'),
]