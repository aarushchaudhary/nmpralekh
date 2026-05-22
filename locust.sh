#!/bin/bash

cd server

source venv/bin/activate

locust -f locustfile.py --host=http://127.0.0.1:8000