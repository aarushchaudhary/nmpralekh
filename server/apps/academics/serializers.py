from rest_framework import serializers
from apps.academics.models import Course, AcademicYear, Semester, Subject, ClassGroup, ExamGroup, Club, FacultyTeachingAssignment
from apps.accounts.serializers import UserSerializer


class CourseSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = Course
        fields = ['id', 'school', 'school_name', 'name', 'code', 'is_active', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AcademicYearSerializer(serializers.ModelSerializer):
    course_name   = serializers.CharField(source='course.name',   read_only=True)
    course_code   = serializers.CharField(source='course.code',   read_only=True)
    school_name   = serializers.CharField(source='school.name',   read_only=True)

    class Meta:
        model  = AcademicYear
        fields = [
            'id', 'school', 'school_name', 'course', 'course_name',
            'course_code', 'year_number', 'graduation_year', 'created_at'
        ]
        read_only_fields = ['created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class SemesterSerializer(serializers.ModelSerializer):
    academic_year_detail = serializers.SerializerMethodField()

    class Meta:
        model  = Semester
        fields = [
            'id', 'academic_year', 'academic_year_detail',
            'semester_number', 'start_date', 'end_date', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_academic_year_detail(self, obj):
        return {
            'id':              obj.academic_year.id,
            'year_number':     obj.academic_year.year_number,
            'graduation_year': obj.academic_year.graduation_year,
            'course_name':     obj.academic_year.course.name,
            'course_code':     obj.academic_year.course.code,
        }

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class SubjectSerializer(serializers.ModelSerializer):
    school_name      = serializers.CharField(source='school.name',           read_only=True)
    semester_detail  = serializers.SerializerMethodField()

    class Meta:
        model  = Subject
        fields = [
            'id', 'school', 'school_name', 'semester', 'semester_detail',
            'name', 'code', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_semester_detail(self, obj):
        return {
            'id':              obj.semester.id,
            'semester_number': obj.semester.semester_number,
            'year_number':     obj.semester.academic_year.year_number,
            'graduation_year': obj.semester.academic_year.graduation_year,
            'course_name':     obj.semester.academic_year.course.name,
            'course_code':     obj.semester.academic_year.course.code,
        }

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ClassGroupSerializer(serializers.ModelSerializer):
    school_name  = serializers.CharField(source='school.name',  read_only=True)
    course_name  = serializers.CharField(source='course.name',  read_only=True)
    course_code  = serializers.CharField(source='course.code',  read_only=True)

    class Meta:
        model  = ClassGroup
        fields = [
            'id', 'school', 'school_name', 'course', 'course_name',
            'course_code', 'name', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ExamGroupSerializer(serializers.ModelSerializer):
    school_name      = serializers.CharField(source='school.name',     read_only=True)
    semester_detail  = serializers.SerializerMethodField()
    class_group_ids  = serializers.PrimaryKeyRelatedField(
                           source='class_groups',
                           queryset=ClassGroup.objects.all(),
                           many=True, required=False
                       )
    class_group_names = serializers.SerializerMethodField()

    class Meta:
        model  = ExamGroup
        fields = [
            'id', 'school', 'school_name', 'semester', 'semester_detail',
            'name', 'class_group_ids', 'class_group_names', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_semester_detail(self, obj):
        return {
            'id':              obj.semester.id,
            'semester_number': obj.semester.semester_number,
            'year_number':     obj.semester.academic_year.year_number,
            'graduation_year': obj.semester.academic_year.graduation_year,
            'course_name':     obj.semester.academic_year.course.name,
            'course_code':     obj.semester.academic_year.course.code,
        }

    def get_class_group_names(self, obj):
        return [cg.name for cg in obj.class_groups.all()]

    def create(self, validated_data):
        class_groups = validated_data.pop('class_groups', [])
        validated_data['created_by'] = self.context['request'].user
        instance = super().create(validated_data)
        instance.class_groups.set(class_groups)
        return instance

    def update(self, instance, validated_data):
        class_groups = validated_data.pop('class_groups', None)
        instance = super().update(instance, validated_data)
        if class_groups is not None:
            instance.class_groups.set(class_groups)
        return instance


class ClubSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model  = Club
        fields = [
            'id', 'school', 'school_name', 'name',
            'type', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FacultyTeachingAssignmentSerializer(serializers.ModelSerializer):
    faculty_name    = serializers.CharField(source='faculty.full_name',    read_only=True)
    subject_name    = serializers.CharField(source='subject.name',         read_only=True)
    subject_code    = serializers.CharField(source='subject.code',         read_only=True)
    class_group_name = serializers.CharField(source='class_group.name',   read_only=True)
    school_name     = serializers.CharField(source='school.name',          read_only=True)
    semester_detail = serializers.SerializerMethodField()
    reviewed_by_name = serializers.CharField(
                           source='reviewed_by.full_name', read_only=True
                       )

    class Meta:
        model  = FacultyTeachingAssignment
        fields = [
            'id', 'faculty', 'faculty_name',
            'school', 'school_name',
            'subject', 'subject_name', 'subject_code',
            'class_group', 'class_group_name',
            'semester', 'semester_detail',
            'status', 'requested_at',
            'reviewed_by', 'reviewed_by_name',
            'reviewed_at', 'notes'
        ]
        read_only_fields = [
            'faculty', 'status', 'requested_at',
            'reviewed_by', 'reviewed_at'
        ]

    def get_semester_detail(self, obj):
        return {
            'id':              obj.semester.id,
            'semester_number': obj.semester.semester_number,
            'year_number':     obj.semester.academic_year.year_number,
            'graduation_year': obj.semester.academic_year.graduation_year,
            'course_name':     obj.semester.academic_year.course.name,
            'course_code':     obj.semester.academic_year.course.code,
        }

    def create(self, validated_data):
        validated_data['faculty'] = self.context['request'].user
        return super().create(validated_data)