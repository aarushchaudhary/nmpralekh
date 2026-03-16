from rest_framework import serializers
from apps.records.models import (
    ExamsConducted, SchoolActivity, SchoolActivityCollaboration,
    StudentActivity, StudentActivityCollaboration,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity
)


class ExamsConductedSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = ExamsConducted
        fields = [
            'id', 'school', 'school_name', 'course', 'examination',
            'date', 'expected_graduation_year',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class SchoolActivityCollaborationSerializer(serializers.ModelSerializer):
    collaborating_school_name = serializers.CharField(
        source='collaborating_school.name', read_only=True
    )

    class Meta:
        model  = SchoolActivityCollaboration
        fields = ['id', 'collaborating_school', 'collaborating_school_name', 'notes']


class SchoolActivitySerializer(serializers.ModelSerializer):
    school_name    = serializers.CharField(source='school.name', read_only=True)
    collaborations = SchoolActivityCollaborationSerializer(many=True, read_only=True)

    class Meta:
        model  = SchoolActivity
        fields = [
            'id', 'school', 'school_name', 'name', 'date',
            'details', 'is_school_wide', 'collaborations',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class StudentActivityCollaborationSerializer(serializers.ModelSerializer):
    collaborating_school_name = serializers.CharField(
        source='collaborating_school.name', read_only=True
    )

    class Meta:
        model  = StudentActivityCollaboration
        fields = [
            'id', 'collaborating_club_or_committee',
            'collaborating_school', 'collaborating_school_name'
        ]


class StudentActivitySerializer(serializers.ModelSerializer):
    school_name    = serializers.CharField(source='school.name', read_only=True)
    collaborations = StudentActivityCollaborationSerializer(many=True, read_only=True)

    class Meta:
        model  = StudentActivity
        fields = [
            'id', 'school', 'school_name', 'name', 'date', 'details',
            'conducted_by', 'activity_type', 'collaborations',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FacultyFDPWorkshopGLSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = FacultyFDPWorkshopGL
        fields = [
            'id', 'school', 'school_name', 'faculty_name',
            'date_start', 'date_end', 'name', 'details',
            'type', 'organizing_body',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FacultyPublicationSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = FacultyPublication
        fields = [
            'id', 'school', 'school_name', 'author_name', 'author_type',
            'title_of_paper', 'journal_or_conference_name',
            'date', 'venue', 'publication', 'doi_or_link',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PatentSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = Patent
        fields = [
            'id', 'school', 'school_name', 'applicant_name', 'applicant_type',
            'title_of_patent', 'details', 'date_of_publication',
            'journal_number', 'patent_status',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class CertificationSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = Certification
        fields = [
            'id', 'school', 'school_name', 'date', 'name',
            'title_of_course', 'details', 'agency',
            'credly_or_proof_link', 'person_type',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PlacementActivitySerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = PlacementActivity
        fields = [
            'id', 'school', 'school_name', 'name', 'date',
            'details', 'company_name',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)