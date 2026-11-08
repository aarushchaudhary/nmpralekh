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
            'created_at', 'last_login', 'is_service_admin',
            'is_chronicle_master'
        ]


class UserVisibilitySerializer(serializers.ModelSerializer):
    """Used for Admin/SuperAdmin user-visibility views — shows school codes"""
    school_code = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'email', 'full_name',
            'role', 'is_active', 'school_code',
        ]

    def get_school_code(self, obj):
        # Use prefetched data to avoid N+1 DB queries per user
        mappings = obj.school_mappings.all()
        codes = [m.school.code for m in mappings if m.school]
        return ', '.join(codes) if codes else ''

class ChronicleAccumulatorSerializer(serializers.ModelSerializer):
    coordinator_count = serializers.IntegerField(read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name',
            'role', 'is_active', 'campus', 'campus_name',
            'coordinator_count'
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
        fields = ['full_name', 'role', 'is_active', 'email', 'campus']

    def validate_campus(self, campus):
        # school assignments must stay in the user's campus (same rule as UserSchoolMappingCreateSerializer)
        user = self.instance
        if user and campus and user.campus_id != campus.id \
                and user.school_mappings.exclude(school__campus=campus).exists():
            raise serializers.ValidationError(
                "This user is still assigned to schools in their current campus. "
                "Remove those school assignments before moving them to another campus."
            )
        return campus


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)