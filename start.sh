#!/bin/bash

echo "Starting Redis..."
sudo systemctl start redis

echo "Starting Django..."
cd ~/nmpralekh/server
source ~/nmpralekh/venv/bin/activate
python manage.py runserver &

echo "Starting Celery..."
celery -A config worker --loglevel=info --concurrency=4 &

echo "Starting React..."
cd ~/nmpralekh/client
npm run dev &

echo ""
echo "All services started"
echo "Frontend  → http://localhost:5173"
echo "Backend   → http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"
wait
