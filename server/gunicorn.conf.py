import multiprocessing

# Number of workers — (2 x CPU) + 1
# On a 4-core server, this equals 9 workers
workers = multiprocessing.cpu_count() * 2 + 1

# Worker type
worker_class = 'gthread'

# THREADS — CORRECTED
# Lowered from 8 to 2 to stay within pgBouncer's 20-connection pool.
# (9 workers * 2 threads = 18 total DB connections, leaving a buffer of 2).
threads = 2

# Connection settings
bind = '0.0.0.0:8000'
timeout = 120
keepalive = 5

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Memory Management
max_requests = 1000
max_requests_jitter = 100
worker_tmp_dir = '/dev/shm'

# Preload app for faster worker spawning
preload_app = True

# NEW: Graceful shutdown and security limits
# Allows current requests 30s to finish before killing the worker
graceful_timeout = 30
# Security hardening for large headers/requests
limit_request_line = 4096
limit_request_fields = 100