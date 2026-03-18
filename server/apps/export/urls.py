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
    path('all/',                  views.ExportAllView.as_view(),               name='export_all'),

    # Academics exports
    path('academics/courses/',      views.ExportCoursesView.as_view(),        name='export_courses'),
    path('academics/years/',        views.ExportAcademicYearsView.as_view(),  name='export_years'),
    path('academics/semesters/',    views.ExportSemestersView.as_view(),      name='export_semesters'),
    path('academics/subjects/',     views.ExportSubjectsView.as_view(),       name='export_subjects'),
    path('academics/class-groups/', views.ExportClassGroupsView.as_view(),    name='export_classgroups'),
    path('academics/exam-groups/',  views.ExportExamGroupsView.as_view(),     name='export_examgroups'),
    path('academics/clubs/',        views.ExportClubsView.as_view(),          name='export_clubs'),
    path('academics/marks/',        views.ExportStudentMarksView.as_view(),   name='export_marks'),
    path('academics/all/',          views.ExportAcademicsAllView.as_view(),   name='export_academics_all'),
]