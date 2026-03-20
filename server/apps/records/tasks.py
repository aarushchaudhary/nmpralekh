import os
import subprocess
from datetime import datetime
from celery import shared_task
from django.conf import settings
from .models import BackupConfiguration


@shared_task
def perform_db_backup(scope=None, date_from=None, date_to=None):
    """
    Perform a PostgreSQL backup.
    scope: 'full' or 'date_range'
    date_from / date_to: used when scope='date_range' (YYYY-MM-DD strings)
    """
    config = BackupConfiguration.objects.first()

    # For automated runs, check if active
    if scope is None:
        if not config or not config.is_active:
            return "Automated backups disabled."
        scope = 'full'

    # Create backup directory
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    os.makedirs(backup_dir, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    scope_label = scope
    if scope == 'date_range' and date_from and date_to:
        scope_label = f"range_{date_from}_to_{date_to}"

    filename = f"nmpralekh_backup_{scope_label}_{timestamp}.dump"
    filepath = os.path.join(backup_dir, filename)

    # Database connection details
    db = settings.DATABASES['default']

    env = os.environ.copy()
    env['PGPASSWORD'] = db['PASSWORD']

    command = [
        'pg_dump',
        '-h', db['HOST'],
        '-p', str(db['PORT']),
        '-U', db['USER'],
        '-d', db['NAME'],
        '-F', 'c',  # Custom compressed format
        '-f', filepath
    ]

    try:
        subprocess.run(command, env=env, check=True)

        # Update last run timestamp
        if config:
            config.last_run = datetime.now()
            config.save()
        return f"Backup created successfully: {filename}"

    except subprocess.CalledProcessError as e:
        return f"Backup failed: {str(e)}"
