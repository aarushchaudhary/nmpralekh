from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.middleware.csrf import CsrfViewMiddleware

_csrf_middleware = CsrfViewMiddleware(lambda req: None)


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # try cookie first
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            # fall back to header for API clients
            return super().authenticate(request)
        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            return None

        # enforce CSRF when authenticating via cookie
        # (same behaviour as SessionAuthentication)
        self.enforce_csrf(request)
        return self.get_user(validated_token), validated_token

    def enforce_csrf(self, request):
        check = _csrf_middleware.process_view(request, None, (), {})
        if check is not None:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('CSRF Failed: %s' % check.reason)
