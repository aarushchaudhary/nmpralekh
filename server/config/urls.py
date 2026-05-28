from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView # Add this import

urlpatterns = [
    path('admin/',          admin.site.urls),
    path('api/auth/',       include('apps.accounts.urls')),
    path('api/users/',      include('apps.accounts.urls_users')),
    path('api/schools/',    include('apps.schools.urls')),
    path('api/records/',    include('apps.records.urls')),
    path('api/audit/',      include('apps.audit.urls')),
    path('api/export/',     include('apps.export.urls')),
    
    # Swagger Documentation URLs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]