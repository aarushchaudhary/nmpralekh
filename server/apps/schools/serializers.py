from rest_framework import serializers
from apps.schools.models import Campus, School, UserSchoolMapping
from apps.accounts.serializers import UserSerializer


class CampusSerializer(serializers.ModelSerializer):
    school_count = serializers.IntegerField(read_only=True)
    user_count   = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Campus
        fields = [
            'id', 'name', 'code', 'city',
            'is_active', 'created_at',
            'school_count', 'user_count'
        ]


class CampusCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Campus
        fields = ['name', 'code', 'city', 'is_active']


class SchoolSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    campus_code = serializers.CharField(source='campus.code', read_only=True)

    class Meta:
        model  = School
        fields = [
            'id', 'campus', 'campus_name', 'campus_code',
            'name', 'code', 'is_active', 'created_at'
        ]


class SchoolCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = School
        fields = ['campus', 'name', 'code', 'is_active']


class UserSchoolMappingSerializer(serializers.ModelSerializer):
    """Full read — includes nested user and school objects"""
    user   = UserSerializer(read_only=True)
    school = SchoolSerializer(read_only=True)

    class Meta:
        model  = UserSchoolMapping
        fields = ['id', 'user', 'school', 'assigned_at']


class UserSchoolMappingCreateSerializer(serializers.ModelSerializer):
    """Write — accepts just IDs"""
    class Meta:
        model  = UserSchoolMapping
        fields = ['user', 'school']

    def validate(self, data):
        # only admin, faculty (user), and mis_coordinator roles can be assigned to schools
        if data['user'].role not in ('admin', 'user', 'mis_coordinator'):
            raise serializers.ValidationError(
                'Only Admin, Faculty, and MIS Coordinator users can be assigned to schools'
            )
        # prevent duplicate assignments
        if UserSchoolMapping.objects.filter(
            user=data['user'], school=data['school']
        ).exists():
            raise serializers.ValidationError(
                'This user is already assigned to this school'
            )
        # verify user and school belong to the same campus
        if (data['user'].campus_id and
                data['school'].campus_id and
                data['user'].campus_id != data['school'].campus_id):
            raise serializers.ValidationError(
                'User and school must belong to the same campus'
            )
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        return UserSchoolMapping.objects.create(
            **validated_data,
            assigned_by=request.user
        )