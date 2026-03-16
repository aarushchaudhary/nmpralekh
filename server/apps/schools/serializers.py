from rest_framework import serializers
from apps.schools.models import School, UserSchoolMapping
from apps.accounts.serializers import UserSerializer


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model  = School
        fields = ['id', 'name', 'code', 'is_active', 'created_at']


class SchoolCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = School
        fields = ['name', 'code', 'is_active']


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
        # prevent duplicate assignments
        if UserSchoolMapping.objects.filter(
            user=data['user'], school=data['school']
        ).exists():
            raise serializers.ValidationError(
                'This user is already assigned to this school'
            )
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        return UserSchoolMapping.objects.create(
            **validated_data,
            assigned_by=request.user
        )