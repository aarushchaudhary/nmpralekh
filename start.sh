#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Redis..."
sudo systemctl start redis

echo "Starting pgBouncer..."
sudo systemctl start pgbouncer

echo "Starting Django with Gunicorn..."
source "$PROJECT_ROOT/venv/bin/activate"
cd "$PROJECT_ROOT/server"
# Changed from 'python manage.py runserver' to Gunicorn with your config
gunicorn -c gunicorn.conf.py config.wsgi:application &
GUNICORN_PID=$!

echo "Starting Celery..."
# Note: Celery directory and activation handled here
celery -A config worker --loglevel=info --concurrency=4 &
CELERY_PID=$!

echo "Starting React..."
cd "$PROJECT_ROOT/client"
npm run dev &
REACT_PID=$!

echo ""
echo "All services started"
echo "Frontend  → http://localhost:5173"
echo "Backend   → http://localhost:8000 (Gunicorn)"
echo "Database  → PostgreSQL via pgBouncer :6432"
echo ""

# Updated trap to kill GUNICORN_PID
trap "echo 'Stopping...'; kill $GUNICORN_PID $CELERY_PID $REACT_PID; sudo systemctl stop pgbouncer; sudo systemctl stop redis; exit 0" SIGINT SIGTERM

wait