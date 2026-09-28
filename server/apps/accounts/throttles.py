import time
import logging

import redis
from django.conf import settings
from rest_framework.throttling import BaseThrottle

logger = logging.getLogger(__name__)

_LUA_FIXED_WINDOW = """
local key    = KEYS[1]
local window = tonumber(ARGV[1])
local count  = redis.call('INCR', key)
if count == 1 then
    redis.call('EXPIRE', key, window)
end
return count
"""

_redis_client: "redis.Redis | None" = None
_lua_sha: "str | None" = None


def _get_redis() -> "redis.Redis":
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=1,
            socket_timeout=1,
            retry_on_timeout=False,
        )
    return _redis_client


def _incr_fixed_window(key: str, window_seconds: int) -> int:
    global _lua_sha
    r = _get_redis()
    try:
        if _lua_sha is None:
            _lua_sha = r.script_load(_LUA_FIXED_WINDOW)
        return int(r.evalsha(_lua_sha, 1, key, window_seconds))
    except redis.exceptions.NoScriptError:
        _lua_sha = r.script_load(_LUA_FIXED_WINDOW)
        return int(r.evalsha(_lua_sha, 1, key, window_seconds))
    except redis.exceptions.RedisError as exc:
        logger.warning("Rate-limit Redis error (fail-open): %s", exc)
        return 0


class FixedWindowThrottle(BaseThrottle):
    def get_rate(self):
        try:
            return settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'][self.scope]
        except (KeyError, AttributeError, TypeError):
            return None

    def parse_rate(self, rate):
        if rate is None:
            return (None, None)
        num, period = rate.split('/')
        num_requests = int(num)
        duration = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}[period[0]]
        return (num_requests, duration)

    def _build_key(self, request, view, window) -> str:
        if request.user and request.user.is_authenticated:
            ident = f"user:{request.user.pk}"
        else:
            ident = f"ip:{self.get_ident(request)}"
        bucket = int(time.time()) // window
        return f"throttle:{self.scope}:{ident}:{bucket}"

    def allow_request(self, request, view) -> bool:
        if hasattr(view, 'throttle_scope'):
            self.scope = view.throttle_scope
        else:
            self.scope = 'user' if request.user and request.user.is_authenticated else 'anon'

        rate = self.get_rate()
        if rate is None:
            return True

        self.limit, self.window = self.parse_rate(rate)

        key = self._build_key(request, view, self.window)
        self._count = _incr_fixed_window(key, self.window)
        return self._count <= self.limit

    def wait(self) -> float:
        now = time.time()
        return ((int(now) // getattr(self, 'window', 60)) + 1) * getattr(self, 'window', 60) - now

