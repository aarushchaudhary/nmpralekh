"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/

Production deployment notes
----------------------------
- Point your WSGI server (Gunicorn, uWSGI, mod_wsgi, etc.) at this file.
- Example Gunicorn command:
      gunicorn config.wsgi:application --bind 0.0.0.0:8000
- Make sure the DJANGO_SETTINGS_MODULE env var is set correctly before
  starting the server.  The default below works for most setups; override
  it in your process manager (systemd, supervisor, Docker, etc.) if you
  use a split settings layout (e.g. config.settings.production).
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()
