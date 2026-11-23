from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.middleware.csrf import CsrfViewMiddleware

_csrf_middleware = CsrfViewMiddleware(lambda req: None)


# while a reset (one-time) password is in place, the user may only see who they are
# and change it; login, refresh and logout don't authenticate, so they keep working
PASSWORD_CHANGE_ALLOWED = {'me', 'change_password'}


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = self._authenticate_token(request)
        if result and result[0].must_change_password:
            match = getattr(request._request, 'resolver_match', None)
            if not match or match.url_name not in PASSWORD_CHANGE_ALLOWED:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Change your temporary password before continuing.',
                                       code='password_change_required')
        return result

    def _authenticate_token(self, request):
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
            # Django 4+ returns a plain HttpResponseForbidden for origin
            # mismatches, which has no .reason attribute; CsrfFailure
            # subclasses do.  Use getattr to handle both cases.
            reason = getattr(check, 'reason', check.content.decode(errors='replace'))
            raise PermissionDenied('CSRF Failed: %s' % reason)

try:
    from drf_spectacular.extensions import OpenApiAuthenticationExtension

    class CookieJWTAuthenticationScheme(OpenApiAuthenticationExtension):
        target_class = 'apps.accounts.authentication.CookieJWTAuthentication'
        name = 'cookieAuth'

        def get_security_definition(self, auto_schema):
            return {
                'type': 'apiKey',
                'in': 'cookie',
                'name': 'access_token',
            }
except ImportError:
    pass
