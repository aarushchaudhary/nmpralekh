from django.db import transaction
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from apps.records.models import (
    Club,
    SchoolActivity, SchoolActivityCollaboration,
    StudentActivity, StudentActivityCollaboration,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity,
    PublicationAuthor, PatentApplicant, BackupConfiguration
)


def replace_people(parent, model, parent_field, rows):
    """Swap a record's whole co-author / co-applicant list for validated rows.
    Callers run it inside a transaction so a failure never leaves half a list."""
    model.objects.filter(**{parent_field: parent}).delete()
    model.objects.bulk_create([model(**row, **{parent_field: parent}) for row in rows])


class ClubSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = Club
        # the database rule only covers live clubs (a deleted club's name can be reused),
        # and DRF doesn't derive a check from it: check here so a duplicate is a 400, not a 500
        validators = [UniqueTogetherValidator(queryset=Club.objects.filter(is_deleted=False),
                                              fields=['name', 'school', 'type'])]
        fields = [
            'id', 'name', 'type', 'school', 'school_name',
            'is_active', 'pending_audit', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['pending_audit', 'created_by', 'created_at', 'updated_at']

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
    created_by_is_active = serializers.BooleanField(source='created_by.is_active', read_only=True)

    class Meta:
        model  = SchoolActivity
        fields = [
            'id', 'school', 'school_name', 'name', 'date',
            'details', 'is_school_wide', 'collaborations',
            'pending_audit', 'created_by', 'created_by_is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['pending_audit', 'created_by', 'created_at', 'updated_at']

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
    created_by_is_active = serializers.BooleanField(source='created_by.is_active', read_only=True)

    class Meta:
        model  = StudentActivity
        fields = [
            'id', 'school', 'school_name', 'name', 'date', 'details',
            'club', 'club_name', 'conducted_by', 'activity_type',
            'collaborations', 'pending_audit', 'created_by', 'created_by_is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['pending_audit', 'created_by', 'created_at', 'updated_at']

    def validate(self, data):
        club   = data.get('club')
        school = data.get('school') or getattr(self.instance, 'school', None)
        if club and school and club.school_id != school.id:
            raise serializers.ValidationError({'club': 'Club must belong to the same school.'})
        return data

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
    def validate(self, data):
        start = data.get('date_start', getattr(self.instance, 'date_start', None))
        end = data.get('date_end', getattr(self.instance, 'date_end', None))
        if start and end and end < start:
            raise serializers.ValidationError({'date_end': 'End date cannot be before the start date.'})
        return data

    school_name = serializers.CharField(source='school.name', read_only=True)
    created_by_is_active = serializers.BooleanField(source='created_by.is_active', read_only=True)

    class Meta:
        model  = FacultyFDPWorkshopGL
        fields = [
            'id', 'school', 'school_name', 'faculty_name',
            'date_start', 'date_end', 'name', 'details',
            'type', 'organizing_body',
            'pending_audit', 'created_by', 'created_by_is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['pending_audit', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PublicationAuthorSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model  = PublicationAuthor
        fields = ['id', 'name', 'author_type', 'user', 'user_full_name', 'order']


class FacultyPublicationSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    # writable on create; on an existing publication it rides in the audited edit
    authors     = PublicationAuthorSerializer(many=True, required=False)
    created_by_is_active = serializers.BooleanField(source='created_by.is_active', read_only=True)
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
            'pending_audit', 'created_by', 'created_by_name', 'created_by_is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['pending_audit', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        authors = validated_data.pop('authors', [])
        validated_data['created_by'] = self.context['request'].user
        with transaction.atomic():
            publication = super().create(validated_data)
            replace_people(publication, PublicationAuthor, 'publication', authors)
        return publication


class PatentApplicantSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model  = PatentApplicant
        fields = ['id', 'name', 'applicant_type', 'user', 'user_full_name']


class PatentSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    # writable on create; on an existing patent it rides in the audited edit
    applicants  = PatentApplicantSerializer(many=True, required=False)
    created_by_is_active = serializers.BooleanField(source='created_by.is_active', read_only=True)
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
            'pending_audit', 'created_by', 'created_by_name', 'created_by_is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['pending_audit', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        applicants = validated_data.pop('applicants', [])
        validated_data['created_by'] = self.context['request'].user
        with transaction.atomic():
            patent = super().create(validated_data)
            replace_people(patent, PatentApplicant, 'patent', applicants)
        return patent


class CertificationSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    created_by_is_active = serializers.BooleanField(source='created_by.is_active', read_only=True)
    created_by_name = serializers.CharField(
                          source='created_by.full_name', read_only=True
                      )

    class Meta:
        model  = Certification
        fields = [
            'id', 'school', 'school_name', 'date', 'name',
            'title_of_course', 'details', 'agency',
            'credly_or_proof_link', 'person_type',
            'pending_audit', 'created_by', 'created_by_name', 'created_by_is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['pending_audit', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PlacementActivitySerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    created_by_is_active = serializers.BooleanField(source='created_by.is_active', read_only=True)

    class Meta:
        model  = PlacementActivity
        fields = [
            'id', 'school', 'school_name', 'name', 'date',
            'details', 'company_name', 'placecom_name',
            'pending_audit', 'created_by', 'created_by_is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['pending_audit', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BackupConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupConfiguration
        fields = '__all__'
        read_only_fields = ('last_run', 'updated_by', 'updated_at')