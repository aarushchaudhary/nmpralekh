from pathlib import Path
from decouple import config
from datetime import timedelta

# -----------------------------------------------------------------------------
# BASE
# -----------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: replace with a long random string in production.
# Generate one with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')

# SECURITY WARNING: keep DEBUG=False in production.
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    # 'api.yourdomain.com',     # add your production backend domain here
]


# -----------------------------------------------------------------------------
# APPS
# -----------------------------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'sslserver',

    # Local
    'apps.accounts',
    'apps.schools',
    'apps.records',
    'apps.audit',
    'apps.export',

    'django_ratelimit',
    'django_celery_beat',
]

# Rate limit settings
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_ENABLE    = True


# -----------------------------------------------------------------------------
# MIDDLEWARE
# -----------------------------------------------------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# -----------------------------------------------------------------------------
# URLS & WSGI
# -----------------------------------------------------------------------------
ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'


# -----------------------------------------------------------------------------
# TEMPLATES
# -----------------------------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# -----------------------------------------------------------------------------
# DATABASE — PostgreSQL
# Copy these keys to your .env file and fill in your credentials.
# -----------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     config('DB_NAME',     default='your_db_name'),
        'USER':     config('DB_USER',     default='your_db_user'),
        'PASSWORD': config('DB_PASSWORD', default='your_db_password'),
        'HOST':     config('DB_HOST',     default='127.0.0.1'),
        'PORT':     config('DB_PORT', default='6432'),   # 6432 = pgBouncer; use 5432 for direct Postgres
        # Set CONN_MAX_AGE=0 when using pgBouncer in transaction pooling mode.
        'CONN_MAX_AGE': 0,
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}


# -----------------------------------------------------------------------------
# CACHES — Redis
# -----------------------------------------------------------------------------
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}


# -----------------------------------------------------------------------------
# CUSTOM USER MODEL — must match accounts app
# -----------------------------------------------------------------------------
AUTH_USER_MODEL = 'accounts.User'


# -----------------------------------------------------------------------------
# PASSWORD VALIDATORS
# -----------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# -----------------------------------------------------------------------------
# DJANGO REST FRAMEWORK
# -----------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'apps.accounts.authentication.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'config.pagination.StandardPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '300/minute',
    }
}


# -----------------------------------------------------------------------------
# JWT — SimpleJWT
# -----------------------------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':    timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME':   timedelta(days=7),
    'ROTATE_REFRESH_TOKENS':    True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN':        True,
    'AUTH_HEADER_TYPES':        ('Bearer',),
}

SESSION_COOKIE_SAMESITE  = 'None'
SESSION_COOKIE_SECURE    = True
CSRF_COOKIE_SAMESITE     = 'None'
CSRF_COOKIE_SECURE       = True


# -----------------------------------------------------------------------------
# CORS — allow your frontend origin with credentials
# -----------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    'https://localhost:5173',   # local dev (Vite default)
    # 'https://mis.yourdomain.com',  # add your production frontend here
]

CORS_ALLOW_CREDENTIALS = True


# -----------------------------------------------------------------------------
# INTERNATIONALISATION
# -----------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = config('TIME_ZONE', default='Asia/Kolkata')
USE_I18N      = True
USE_TZ        = True


# -----------------------------------------------------------------------------
# STATIC FILES
# -----------------------------------------------------------------------------
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'


# -----------------------------------------------------------------------------
# DEFAULT PRIMARY KEY
# -----------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -----------------------------------------------------------------------------
# CELERY
# -----------------------------------------------------------------------------
CELERY_BROKER_URL     = config('REDIS_URL', default='redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://127.0.0.1:6379/0')
CELERY_RESULT_EXPIRES           = 3600   # task results expire after 1 hour
CELERY_TASK_SERIALIZER          = 'json'
CELERY_RESULT_SERIALIZER        = 'json'
CELERY_ACCEPT_CONTENT           = ['json']
CELERY_TASK_TRACK_STARTED       = True
CELERY_WORKER_MAX_TASKS_PER_CHILD = 200  # recycle workers to prevent memory leaks
CELERY_WORKER_PREFETCH_MULTIPLIER = 1    # don't prefetch; better for long-running tasks

# -----------------------------------------------------------------------------
# CELERY BEAT
# -----------------------------------------------------------------------------
from celery.schedules import crontab

CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

CELERY_BEAT_SCHEDULE = {
    'nightly-campus-export': {
        'task':     'apps.export.tasks.generate_nightly_exports',
        'schedule': crontab(hour=0, minute=0),   # 12:00 AM every day
    },
}

CELERY_TIMEZONE = 'Asia/Kolkata'

# -----------------------------------------------------------------------------
# SECURITY HEADERS
# -----------------------------------------------------------------------------
SECURE_BROWSER_XSS_FILTER   = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS             = 'DENY'

# Force HTTPS redirect in production (don't force it in local development)
SECURE_SSL_REDIRECT = not DEBUG

# HSTS settings (1 year = 31536000 seconds)
if not DEBUG:
    SECURE_HSTS_SECONDS            = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD            = True
