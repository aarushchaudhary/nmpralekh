import os
import stat
import subprocess
import tempfile
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

    command = [
        'pg_dump',
        '-h', db['HOST'],
        '-p', str(db['PORT']),
        '-U', db['USER'],
        '-d', db['NAME'],
        '-F', 'c',  # Custom compressed format
        '-f', filepath
    ]

    # Build a secure .pgpass file so the password is never exposed via
    # /proc/<pid>/environ (the PGPASSWORD risk on Linux).
    private_tmp = tempfile.mkdtemp()
    os.chmod(private_tmp, 0o700)
    pgpass_path = os.path.join(private_tmp, '.pgpass')

    try:
        # Write hostname:port:database:username:password
        pgpass_line = (
            f"{db['HOST']}:{db['PORT']}:{db['NAME']}:{db['USER']}:{db['PASSWORD']}\n"
        )
        with open(pgpass_path, 'w') as f:
            os.chmod(pgpass_path, 0o600)
            f.write(pgpass_line)

        env = os.environ.copy()
        env.pop('PGPASSWORD', None)          # ensure legacy variable is absent
        env['PGPASSFILE'] = pgpass_path

        subprocess.run(command, env=env, check=True)

        # Update last run timestamp
        if config:
            config.last_run = datetime.now()
            config.save()
        return f"Backup created successfully: {filename}"

    except subprocess.CalledProcessError as e:
        return f"Backup failed: {str(e)}"

    finally:
        # Always remove the temporary directory and credentials file from disk
        import shutil
        shutil.rmtree(private_tmp, ignore_errors=True)
