from rest_framework import serializers
from .models import GeneratedExport, MISDataRequest
from apps.accounts.serializers import UserVisibilitySerializer

class GeneratedExportSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.full_name', read_only=True)

    class Meta:
        model = GeneratedExport
        fields = [
            'id', 'export_type', 'campus_name', 'filename',
            'generated_by_name', 'generated_at', 'file_size_kb',
            'date_range_from', 'date_range_to', 'record_count'
        ]

class MISDataRequestSerializer(serializers.ModelSerializer):
    accumulator_name = serializers.CharField(source='accumulator.full_name', read_only=True)
    coordinator_name = serializers.CharField(source='coordinator.full_name', read_only=True)
    
    class Meta:
        model = MISDataRequest
        fields = [
            'id', 'accumulator', 'accumulator_name', 
            'coordinator', 'coordinator_name', 
            'date_from', 'date_to', 'status', 
            'created_at', 'completed_at'
        ]
        read_only_fields = ['accumulator', 'status', 'completed_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['accumulator'] = request.user
        return super().create(validated_data)

from .models import MISReport

class MISReportSerializer(serializers.ModelSerializer):
    coordinator_name = serializers.CharField(source='coordinator.full_name', read_only=True)
    coordinator_school_name = serializers.SerializerMethodField()

    class Meta:
        model = MISReport
        fields = [
            'id', 'coordinator', 'coordinator_name', 'coordinator_school_name', 
            'name', 'data_content', 'date_from', 'date_to',
            'sent_to_admin', 'sent_to_admin_at',
            'sent_to_accumulator', 'sent_to_accumulator_at',
            'created_at'
        ]
        read_only_fields = [
            'coordinator', 'sent_to_admin', 'sent_to_admin_at',
            'sent_to_accumulator', 'sent_to_accumulator_at', 'created_at'
        ]

    def get_coordinator_school_name(self, obj):
        mappings = obj.coordinator.school_mappings.all()
        names = [m.school.name for m in mappings if m.school]
        return ', '.join(names) if names else 'Unknown School'

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['coordinator'] = request.user
        return super().create(validated_data)
