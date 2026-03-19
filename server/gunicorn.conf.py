import multiprocessing

# Number of workers — (2 x CPU) + 1
workers     = multiprocessing.cpu_count() * 2 + 1

# Use gthread for better concurrency
worker_class = 'gthread'
threads      = 8

# Connection settings
bind         = '0.0.0.0:8000'
timeout      = 120
keepalive    = 5

# Logging
accesslog    = '-'
errorlog     = '-'
loglevel     = 'info'

# Restart workers after this many requests to prevent memory leaks
max_requests          = 1000
max_requests_jitter   = 100

# Preload app for faster worker spawning
preload_app  = True

# Worker memory limit — auto-restart if a worker leaks memory
worker_tmp_dir = '/dev/shm'
