#!/bin/bash
set -e

echo "Starting system services (Redis, pgBouncer)..."
sudo systemctl start redis
sudo systemctl start pgbouncer

echo "Activating virtual environment..."
cd server
source venv/bin/activate

echo "Running celery migrations..."
python manage.py migrate django_celery_beat

echo "Starting Celery worker and beat in background..."
celery -A config worker --loglevel=info --concurrency=4 &
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler &

echo "Starting Gunicorn server..."
exec gunicorn -c gunicorn.conf.py config.wsgi:application