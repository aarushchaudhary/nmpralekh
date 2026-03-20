#!/bin/bash

cd ~/nmpralekh/server || {
    echo "Failed to change directory"
    exit 1
}

source ~/nmpralekh/venv/bin/activate || {
    echo "Failed to activate virtual environment"
    exit 1
}

# Start Celery worker in background
celery -A config worker --loglevel=info --concurrency=4 &
WORKER_PID=$!

# Start Celery Beat scheduler
celery -A config beat \
    --loglevel=info \
    --scheduler django_celery_beat.schedulers:DatabaseScheduler &
BEAT_PID=$!

echo "Celery worker PID: $WORKER_PID"
echo "Celery beat PID:   $BEAT_PID"

wait