from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/',          admin.site.urls),
    path('api/auth/',       include('apps.accounts.urls')),
    path('api/users/',      include('apps.accounts.urls_users')),
    path('api/schools/',    include('apps.schools.urls')),
    path('api/academics/',  include('apps.academics.urls')),
    path('api/records/',    include('apps.records.urls')),
    path('api/audit/',      include('apps.audit.urls')),
    path('api/export/',     include('apps.export.urls')),
]