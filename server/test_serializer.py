import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.export.serializers import MISDataRequestSerializer
from rest_framework.request import Request
from django.test.client import RequestFactory

acc = User.objects.filter(role='mis_accumulator').first()
coord = User.objects.filter(role='mis_coordinator').first()

if not acc or not coord:
    print("Missing users")
    exit(1)

factory = RequestFactory()
req = factory.post('/api/exports/data-requests/')
req.user = acc

# Create a proper DRF request
from rest_framework.parsers import JSONParser
from rest_framework.request import Request
drf_request = Request(req, parsers=[JSONParser()])

data = {
    'coordinator': coord.id,
    'date_from': '2026-05-30',
    'date_to': '2026-05-30'
}

serializer = MISDataRequestSerializer(data=data, context={'request': drf_request})
if serializer.is_valid():
    try:
        serializer.save()
        print("Success!")
    except Exception as e:
        print("Error saving:", e)
else:
    print("Validation Error:", serializer.errors)
