from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # try cookie first
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            # fall back to header for API clients
            return super().authenticate(request)
        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except InvalidToken:
            return None
