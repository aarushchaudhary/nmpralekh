from rest_framework import serializers
from apps.accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    """Used for reading user data — password never included"""
    campus_name = serializers.CharField(source='campus.name', read_only=True)

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'email', 'full_name',
            'role', 'is_active', 'campus', 'campus_name',
            'created_at', 'last_login'
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    """Used by master to create new users"""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'email', 'password',
            'full_name', 'role', 'is_active', 'campus'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        user = User.objects.create_user(
            username   = validated_data['username'],
            email      = validated_data['email'],
            password   = validated_data['password'],
            full_name  = validated_data['full_name'],
            role       = validated_data['role'],
            is_active  = validated_data.get('is_active', True),
            campus     = validated_data.get('campus', None),
            created_by = request.user if request else None
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Used by master to edit existing users"""
    class Meta:
        model  = User
        fields = ['full_name', 'role', 'is_active', 'email']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)