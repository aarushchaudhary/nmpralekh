from django.conf import settings
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/',          admin.site.urls),
    path('api/auth/',       include('apps.accounts.urls')),
    path('api/users/',      include('apps.accounts.urls_users')),
    path('api/schools/',    include('apps.schools.urls')),
    path('api/records/',    include('apps.records.urls')),
    path('api/audit/',      include('apps.audit.urls')),
    path('api/export/',     include('apps.export.urls')),
]

# Only expose interactive API docs in development.
# In production these endpoints would disclose every URL, request/response
# schema, field name, and authentication method to unauthenticated callers.
if settings.DEBUG:
    from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    ]