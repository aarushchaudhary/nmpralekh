from rest_framework import serializers
from apps.records.models import (
    Club,
    SchoolActivity, SchoolActivityCollaboration,
    StudentActivity, StudentActivityCollaboration,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity,
    PublicationAuthor, PatentApplicant, BackupConfiguration
)


class ClubSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = Club
        fields = [
            'id', 'name', 'type', 'school', 'school_name',
            'is_active', 'created_by', 'created_at', 'updated_at'
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
            'pending_audit', 'created_by', 'created_at', 'updated_at'
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
    school_name    = serializers.CharField(source='school.name',       read_only=True)
    collaborations = StudentActivityCollaborationSerializer(many=True,  read_only=True)

    class Meta:
        model  = StudentActivity
        fields = [
            'id', 'school', 'school_name', 'name', 'date', 'details',
            'club', 'club_name', 'conducted_by', 'activity_type',
            'collaborations', 'pending_audit', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Auto-fill club_name from club FK if provided
        club = validated_data.get('club')
        if club and not validated_data.get('club_name'):
            validated_data['club_name'] = club.name
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        club = validated_data.get('club')
        if club and not validated_data.get('club_name'):
            validated_data['club_name'] = club.name
        return super().update(instance, validated_data)


class FacultyFDPWorkshopGLSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = FacultyFDPWorkshopGL
        fields = [
            'id', 'school', 'school_name', 'faculty_name',
            'date_start', 'date_end', 'name', 'details',
            'type', 'organizing_body',
            'pending_audit', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PublicationAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PublicationAuthor
        fields = ['id', 'name', 'author_type', 'is_primary', 'order']


class FacultyPublicationSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    authors     = PublicationAuthorSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
                          source='created_by.full_name', read_only=True
                      )

    class Meta:
        model  = FacultyPublication
        fields = [
            'id', 'school', 'school_name',
            'author_name', 'author_type',
            'title_of_paper', 'journal_or_conference_name',
            'date', 'venue', 'publication', 'doi_or_link',
            'is_own_work', 'authors',
            'pending_audit', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PatentApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PatentApplicant
        fields = ['id', 'name', 'applicant_type', 'is_primary']


class PatentSerializer(serializers.ModelSerializer):
    school_name    = serializers.CharField(source='school.name', read_only=True)
    applicants     = PatentApplicantSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
                          source='created_by.full_name', read_only=True
                      )

    class Meta:
        model  = Patent
        fields = [
            'id', 'school', 'school_name',
            'applicant_name', 'applicant_type',
            'title_of_patent', 'details',
            'date_of_publication', 'journal_number', 'patent_status',
            'doi_or_link',
            'is_own_work', 'applicants',
            'pending_audit', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class CertificationSerializer(serializers.ModelSerializer):
    school_name     = serializers.CharField(source='school.name', read_only=True)
    created_by_name = serializers.CharField(
                          source='created_by.full_name', read_only=True
                      )

    class Meta:
        model  = Certification
        fields = [
            'id', 'school', 'school_name', 'date', 'name',
            'title_of_course', 'details', 'agency',
            'credly_or_proof_link', 'person_type',
            'pending_audit', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PlacementActivitySerializer(serializers.ModelSerializer):
    school_name   = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = PlacementActivity
        fields = [
            'id', 'school', 'school_name', 'name', 'date',
            'details', 'company_name', 'placecom_name',
            'pending_audit', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BackupConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupConfiguration
        fields = '__all__'
        read_only_fields = ('last_run', 'updated_by', 'updated_at')