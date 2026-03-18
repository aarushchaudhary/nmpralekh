#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Go to server directory
cd server

# Run Django server
python manage.py runserver
