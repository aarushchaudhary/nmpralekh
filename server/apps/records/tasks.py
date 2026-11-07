import os
import subprocess
import tempfile
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from .models import BackupConfiguration


@shared_task
def perform_db_backup(scope=None, **_ignored):
    """
    Perform a full PostgreSQL backup (pg_dump cannot dump by date range).
    scope=None means an automated run, which respects BackupConfiguration.is_active.
    _ignored: date_from/date_to still sent by older queued or scheduled tasks.
    """
    config = BackupConfiguration.objects.first()

    # For automated runs, check if active
    if scope is None and (not config or not config.is_active):
        return "Automated backups disabled."

    # Create backup directory
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    os.makedirs(backup_dir, exist_ok=True)

    timestamp = timezone.localtime().strftime('%Y%m%d_%H%M%S')
    filename = f"nmpralekh_backup_full_{timestamp}.dump"
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
        fd = os.open(pgpass_path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, 'w') as f:
            f.write(pgpass_line)

        env = os.environ.copy()
        env.pop('PGPASSWORD', None)          # ensure legacy variable is absent
        env['PGPASSFILE'] = pgpass_path

        # check=True raises on failure so Celery marks the task FAILED instead of SUCCESS
        subprocess.run(command, env=env, check=True)

        # Update last run timestamp
        if config:
            config.last_run = timezone.now()
            config.save()
        return f"Backup created successfully: {filename}"

    finally:
        # Always remove the temporary directory and credentials file from disk
        import shutil
        shutil.rmtree(private_tmp, ignore_errors=True)
