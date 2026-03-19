#!/bin/bash

# Navigate to project directory
cd ~/nmpralekh/server || {
    echo "Failed to change directory"
    exit 1
}

# Activate virtual environment
source ~/nmpralekh/venv/bin/activate || {
    echo "Failed to activate virtual environment"
    exit 1
}

# Start Celery worker
celery -A config worker --loglevel=info --concurrency=4
