"""
apps/accounts/throttles.py

Atomic fixed-window rate limiting backed by a single Redis INCR+EXPIRE
Lua script. One Redis round-trip per request, no race conditions, O(1)
memory per user.

Drop-in replacement for DRF's built-in throttle classes.
Works alongside the existing django-ratelimit decorators already on
LoginView, RefreshTokenView, and the export views — the two layers are
independent and additive.
"""

import time
import logging

import redis
from django.conf import settings
from rest_framework.throttling import BaseThrottle

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lua script: atomically increment a counter and set its TTL on first touch.
# Returns the new count. Executes as a single Redis command — no race window.
# ---------------------------------------------------------------------------
_LUA_FIXED_WINDOW = """
local key    = KEYS[1]
local window = tonumber(ARGV[1])
local count  = redis.call('INCR', key)
if count == 1 then
    redis.call('EXPIRE', key, window)
end
return count
"""

# ---------------------------------------------------------------------------
# Redis client — bypasses Django's cache serialisation layer entirely.
# One shared connection pool; socket timeouts prevent hung workers.
# ---------------------------------------------------------------------------
_redis_client: "redis.Redis | None" = None
_lua_sha: "str | None" = None   # EVALSHA cache; invalidated on NoScriptError


def _get_redis() -> "redis.Redis":
    global _redis_client
    if _redis_client is None:
        # settings.REDIS_URL is set in config/settings.py
        _redis_client = redis.Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=1,
            socket_timeout=1,
            retry_on_timeout=False,
        )
    return _redis_client


def _incr_fixed_window(key: str, window_seconds: int) -> int:
    """
    Atomically increment `key` and return the new count.
    The key expires after `window_seconds` from its first creation.
    Returns 0 on any Redis error (fail-open: don't block users if Redis is down).
    """
    global _lua_sha
    r = _get_redis()
    try:
        if _lua_sha is None:
            _lua_sha = r.script_load(_LUA_FIXED_WINDOW)
        return int(r.evalsha(_lua_sha, 1, key, window_seconds))
    except redis.exceptions.NoScriptError:
        # Redis was restarted / SCRIPT FLUSH was called — reload and retry once
        _lua_sha = r.script_load(_LUA_FIXED_WINDOW)
        return int(r.evalsha(_lua_sha, 1, key, window_seconds))
    except redis.exceptions.RedisError as exc:
        logger.warning("Rate-limit Redis error (fail-open): %s", exc)
        return 0  # fail open — availability > enforcement when cache is down


# ---------------------------------------------------------------------------
# Base throttle
# ---------------------------------------------------------------------------

class FixedWindowThrottle(BaseThrottle):
    """
    Subclass and set `scope`, `limit` (max requests), and `window` (seconds).

    Key format:  throttle:<scope>:<user|ip>:<bucket>
    The bucket integer changes every `window` seconds, creating a new counter
    automatically — no manual cleanup required.
    """
    scope: str = "default"
    limit: int = 300
    window: int = 60

    def _build_key(self, request, view) -> str:
        if request.user and request.user.is_authenticated:
            ident = f"user:{request.user.pk}"
        else:
            ident = f"ip:{self.get_ident(request)}"
        bucket = int(time.time()) // self.window
        return f"throttle:{self.scope}:{ident}:{bucket}"

    def allow_request(self, request, view) -> bool:
        key = self._build_key(request, view)
        self._count = _incr_fixed_window(key, self.window)
        return self._count <= self.limit

    def wait(self) -> float:
        """Seconds until the current fixed window resets."""
        now = time.time()
        return ((int(now) // self.window) + 1) * self.window - now


# ---------------------------------------------------------------------------
# Global defaults (applied via DEFAULT_THROTTLE_CLASSES in settings.py)
# ---------------------------------------------------------------------------

class AnonRateThrottle(FixedWindowThrottle):
    """
    60 requests / minute for unauthenticated clients, keyed by IP.
    Protects public endpoints (login page, token refresh) before any
    user session exists. Works alongside django-ratelimit decorators.
    """
    scope = "anon"
    limit = 60
    window = 60

    def _build_key(self, request, view) -> str:
        bucket = int(time.time()) // self.window
        return f"throttle:anon:ip:{self.get_ident(request)}:{bucket}"


class UserRateThrottle(FixedWindowThrottle):
    """
    300 requests / minute for authenticated users, keyed by user PK.
    Covers normal faculty / admin / coordinator browsing without ever
    hitting the cap under typical usage patterns.
    """
    scope = "user"
    limit = 300
    window = 60


# ---------------------------------------------------------------------------
# Endpoint-specific throttles — apply via throttle_classes = [...] on views.
# The global AnonRateThrottle / UserRateThrottle still apply UNLESS the view
# sets throttle_classes explicitly, in which case only those classes run.
# ---------------------------------------------------------------------------

class LoginThrottle(FixedWindowThrottle):
    """
    10 attempts / minute per IP — matches the existing django-ratelimit
    decorator on LoginView ('10/m'). This class is provided for completeness
    so the same limit can be enforced at the DRF layer too if the ratelimit
    decorator is ever removed. Currently both layers coexist harmlessly.
    """
    scope = "login"
    limit = 10
    window = 60

    def _build_key(self, request, view) -> str:
        # Always key by IP — user is not authenticated at login
        bucket = int(time.time()) // self.window
        return f"throttle:login:ip:{self.get_ident(request)}:{bucket}"


class TokenRefreshThrottle(FixedWindowThrottle):
    """
    30 requests / minute per IP — matches the existing ratelimit decorator
    on RefreshTokenView ('30/m'). Axios auto-refresh fires on every 401;
    generous enough not to interrupt normal use.
    """
    scope = "token_refresh"
    limit = 30
    window = 60

    def _build_key(self, request, view) -> str:
        bucket = int(time.time()) // self.window
        return f"throttle:token_refresh:ip:{self.get_ident(request)}:{bucket}"


class ExportRateThrottle(FixedWindowThrottle):
    """
    10 exports / hour per authenticated user.
    Excel generation is CPU + DB heavy; this prevents a single user from
    hammering the export endpoints and starving Celery workers.
    The existing django-ratelimit decorator ('10/m') is the per-minute guard;
    this adds the hourly cap as a second, longer-horizon limit.
    """
    scope = "export"
    limit = 10
    window = 3600


class CoordinatorExportThrottle(FixedWindowThrottle):
    """
    5 exports / minute per user — matches the existing ratelimit decorator
    on CoordinatorExportView ('5/m'). Heaviest endpoint in the system.
    """
    scope = "coordinator_export"
    limit = 5
    window = 60


class DashboardThrottle(FixedWindowThrottle):
    """
    120 requests / minute per user.
    Dashboard counts are Redis-cached (60 s TTL), so this only fires on
    cache misses. 120/min is deliberately generous for polling dashboards.
    """
    scope = "dashboard"
    limit = 120
    window = 60


class AuditThrottle(FixedWindowThrottle):
    """
    60 approve/reject actions / minute per user.
    The delete_auth reviewer is the only role hitting this endpoint;
    60/min comfortably exceeds any human review speed.
    """
    scope = "audit"
    limit = 60
    window = 60
