from django.urls import path
from . import views

urlpatterns = [
    # Courses
    path('courses/',                    views.CourseListCreateView.as_view(),       name='course_list_create'),
    path('courses/<int:pk>/',           views.CourseDetailView.as_view(),           name='course_detail'),

    # Academic Years
    path('years/',                      views.AcademicYearListCreateView.as_view(), name='year_list_create'),
    path('years/<int:pk>/',             views.AcademicYearDetailView.as_view(),     name='year_detail'),

    # Semesters
    path('semesters/',                  views.SemesterListCreateView.as_view(),     name='semester_list_create'),
    path('semesters/<int:pk>/',         views.SemesterDetailView.as_view(),         name='semester_detail'),

    # Subjects
    path('subjects/',                   views.SubjectListCreateView.as_view(),      name='subject_list_create'),
    path('subjects/<int:pk>/',          views.SubjectDetailView.as_view(),          name='subject_detail'),

    # Class Groups
    path('class-groups/',               views.ClassGroupListCreateView.as_view(),   name='classgroup_list_create'),
    path('class-groups/<int:pk>/',      views.ClassGroupDetailView.as_view(),       name='classgroup_detail'),

    # Exam Groups
    path('exam-groups/',                views.ExamGroupListCreateView.as_view(),    name='examgroup_list_create'),
    path('exam-groups/<int:pk>/',       views.ExamGroupDetailView.as_view(),        name='examgroup_detail'),

    # Clubs and Committees
    path('clubs/',                      views.ClubListCreateView.as_view(),         name='club_list_create'),
    path('clubs/<int:pk>/',             views.ClubDetailView.as_view(),             name='club_detail'),

    # Faculty Teaching Assignments
    path('assignments/',                  views.FacultyTeachingAssignmentListCreateView.as_view(),  name='assignment_list_create'),
    path('assignments/<int:pk>/',         views.FacultyTeachingAssignmentDetailView.as_view(),      name='assignment_detail'),
    path('assignments/<int:pk>/approve/', views.FacultyAssignmentApproveView.as_view(),             name='assignment_approve'),
    path('assignments/<int:pk>/reject/',  views.FacultyAssignmentRejectView.as_view(),              name='assignment_reject'),
    path('my-assignments/',               views.MyTeachingAssignmentsView.as_view(),                name='my_assignments'),
]