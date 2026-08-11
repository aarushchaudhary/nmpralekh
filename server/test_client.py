import django
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()
from django.test import Client
from apps.accounts.models import User
from rest_framework_simplejwt.tokens import AccessToken

faculty = User.objects.filter(role='user').first()
token = str(AccessToken.for_user(faculty))

client = Client()
# We need to set the cookie for CookieJWTAuthentication
client.cookies['access_token'] = token

response = client.get('/api/records/dashboard-counts/')
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print(f"Data: {response.json()}")
else:
    print(f"Error: {response.content}")
