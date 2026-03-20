#!/bin/bash

echo "Starting Redis..."
sudo systemctl start redis

echo "Starting pgBouncer..."
sudo systemctl start pgbouncer