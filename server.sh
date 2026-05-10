#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Go to server directory
cd server

# Run Gunicorn instead of the Django dev server
# -c points to your configuration file
gunicorn -c gunicorn.conf.py config.wsgi:application