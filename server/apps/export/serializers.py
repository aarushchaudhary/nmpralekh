from rest_framework import serializers
from .models import MISDataRequest, ChronicleDataRequest
from apps.accounts.serializers import UserVisibilitySerializer


def check_date_order(serializer, data):
    """date_to must not be before date_from (also enforced by a database rule)."""
    instance = serializer.instance
    start = data.get('date_from', getattr(instance, 'date_from', None))
    end = data.get('date_to', getattr(instance, 'date_to', None))
    if start and end and end < start:
        raise serializers.ValidationError({'date_to': 'End date cannot be before the start date.'})
    return data

class MISDataRequestSerializer(serializers.ModelSerializer):
    accumulator_name = serializers.CharField(source='accumulator.full_name', read_only=True)
    coordinator_name = serializers.CharField(source='coordinator.full_name', read_only=True)
    
    class Meta:
        model = MISDataRequest
        fields = [
            'id', 'accumulator', 'accumulator_name', 
            'coordinator', 'coordinator_name', 
            'date_from', 'date_to', 'status', 
            'chronicle_request',
            'created_at', 'completed_at'
        ]
        read_only_fields = ['accumulator', 'status', 'completed_at', 'chronicle_request']

    def validate(self, data):
        return check_date_order(self, data)

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['accumulator'] = request.user
        return super().create(validated_data)

from .models import MISReport

class MISReportSerializer(serializers.ModelSerializer):
    # derived from the *_at times (model properties), kept so the API shape doesn't change
    sent_to_admin = serializers.BooleanField(read_only=True)
    sent_to_accumulator = serializers.BooleanField(read_only=True)
    sent_to_super_admin = serializers.BooleanField(read_only=True)
    sent_to_chronicle_master = serializers.BooleanField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    created_by_school_name = serializers.SerializerMethodField()

    class Meta:
        model = MISReport
        fields = [
            'id', 'created_by', 'created_by_name', 'created_by_school_name', 
            'name', 'data_content', 'date_from', 'date_to',
            'sent_to_admin', 'sent_to_admin_at',
            'sent_to_accumulator', 'sent_to_accumulator_at',
            'sent_to_super_admin', 'sent_to_super_admin_at',
            'sent_to_chronicle_master', 'sent_to_chronicle_master_at',
            'created_at'
        ]
        read_only_fields = [
            'id', 'created_by_name', 'created_by_school_name',
            'created_by', 'sent_to_admin', 'sent_to_admin_at',
            'sent_to_accumulator', 'sent_to_accumulator_at',
            'sent_to_super_admin', 'sent_to_super_admin_at',
            'sent_to_chronicle_master', 'sent_to_chronicle_master_at',
            'created_at'
        ]

    def get_created_by_school_name(self, obj):
        if obj.created_by.role == 'mis_accumulator' and obj.created_by.campus:
            return obj.created_by.campus.name
        mappings = obj.created_by.school_mappings.all()
        names = [m.school.name for m in mappings if m.school]
        return ', '.join(names) if names else 'Unknown School'

    def validate(self, data):
        return check_date_order(self, data)

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)


class ChronicleDataRequestSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = ChronicleDataRequest
        fields = [
            'id', 'created_by', 'created_by_name',
            'date_from', 'date_to', 'message',
            'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at']

    def validate(self, data):
        return check_date_order(self, data)

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)

