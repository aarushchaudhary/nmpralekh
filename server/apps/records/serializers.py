from rest_framework import serializers
from apps.records.models import (
    ExamsConducted, SchoolActivity, SchoolActivityCollaboration,
    StudentActivity, StudentActivityCollaboration,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity, StudentMarks,
    PublicationAuthor, PatentApplicant
)


class ExamsConductedSerializer(serializers.ModelSerializer):
    school_name      = serializers.CharField(source='school.name',           read_only=True)
    exam_group_name  = serializers.CharField(source='exam_group.name',       read_only=True)
    subject_name     = serializers.CharField(source='subject.name',          read_only=True)
    subject_code     = serializers.CharField(source='subject.code',          read_only=True)
    class_group_name = serializers.CharField(source='class_group.name',      read_only=True)
    faculty_name     = serializers.CharField(source='faculty.full_name',     read_only=True)
    semester_number  = serializers.SerializerMethodField()
    course_name      = serializers.SerializerMethodField()

    class Meta:
        model  = ExamsConducted
        fields = [
            'id', 'school', 'school_name',
            'exam_group', 'exam_group_name',
            'subject', 'subject_name', 'subject_code',
            'class_group', 'class_group_name',
            'faculty', 'faculty_name',
            'semester_number', 'course_name',
            'date', 'pending_audit', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_semester_number(self, obj):
        if obj.subject and obj.subject.semester:
            return obj.subject.semester.semester_number
        return None

    def get_course_name(self, obj):
        if obj.subject and obj.subject.semester and obj.subject.semester.academic_year:
            return obj.subject.semester.academic_year.course.name
        return None

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class StudentMarksSerializer(serializers.ModelSerializer):
    exam_detail = serializers.SerializerMethodField()

    class Meta:
        model  = StudentMarks
        fields = [
            'id', 'exam', 'exam_detail', 'student_name', 'roll_number',
            'marks_obtained', 'max_marks', 'is_absent',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_exam_detail(self, obj):
        return {
            'exam_group':  obj.exam.exam_group.name  if obj.exam.exam_group  else None,
            'subject':     obj.exam.subject.name     if obj.exam.subject     else None,
            'class_group': obj.exam.class_group.name if obj.exam.class_group else None,
        }

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
    club_name      = serializers.CharField(source='club.name',         read_only=True)
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
    school_name   = serializers.CharField(source='school.name',        read_only=True)
    placecom_name = serializers.CharField(source='placecom.name',      read_only=True)

    class Meta:
        model  = PlacementActivity
        fields = [
            'id', 'school', 'school_name', 'name', 'date',
            'details', 'company_name', 'placecom', 'placecom_name',
            'pending_audit', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)