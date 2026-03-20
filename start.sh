#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Redis..."
sudo systemctl start redis

echo "Starting pgBouncer..."
sudo systemctl start pgbouncer

echo "Starting Django..."
source "$PROJECT_ROOT/venv/bin/activate"
cd "$PROJECT_ROOT/server"
python manage.py runserver &
DJANGO_PID=$!

echo "Starting Celery..."
cd "$PROJECT_ROOT/server"
source "$PROJECT_ROOT/venv/bin/activate"
celery -A config worker --loglevel=info --concurrency=4 &
CELERY_PID=$!

echo "Starting React..."
cd "$PROJECT_ROOT/client"
npm run dev &
REACT_PID=$!

echo ""
echo "All services started"
echo "Frontend  → http://localhost:5173"
echo "Backend   → http://localhost:8000"
echo "Database  → PostgreSQL via pgBouncer :6432"
echo ""

trap "echo 'Stopping...'; kill $DJANGO_PID $CELERY_PID $REACT_PID; sudo systemctl stop pgbouncer; sudo systemctl stop redis; exit 0" SIGINT SIGTERM

wait