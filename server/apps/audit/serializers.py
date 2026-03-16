from rest_framework import serializers
from apps.audit.models import AuditRequest
from apps.accounts.serializers import UserSerializer


class AuditRequestSerializer(serializers.ModelSerializer):
    requested_by_detail = UserSerializer(source='requested_by', read_only=True)
    reviewed_by_detail  = UserSerializer(source='reviewed_by',  read_only=True)

    class Meta:
        model  = AuditRequest
        fields = [
            'id', 'table_name', 'record_id', 'action',
            'old_data', 'new_data', 'status',
            'requested_by', 'requested_by_detail',
            'requested_at',
            'reviewed_by', 'reviewed_by_detail',
            'reviewed_at'
        ]
        read_only_fields = [
            'requested_by', 'requested_at',
            'reviewed_by', 'reviewed_at',
            'status'
        ]