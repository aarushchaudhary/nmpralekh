from rest_framework import serializers
from apps.service.models import ErrorTicket, ErrorOccurrence, BugReport
from apps.accounts.serializers import UserSerializer


class ErrorOccurrenceSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model  = ErrorOccurrence
        fields = [
            'id', 'user_name', 'occurred_at',
            'url_path', 'user_agent', 'extra',
        ]

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.full_name
        return 'Anonymous'


class ErrorTicketListSerializer(serializers.ModelSerializer):
    """Lightweight serializer used in the ticket list view."""
    resolved_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = ErrorTicket
        fields = [
            'id', 'fingerprint', 'title', 'source',
            'error_type', 'url_path', 'http_status', 'api_endpoint',
            'occurrence_count', 'affected_users_count',
            'first_seen', 'last_seen',
            'status', 'resolved_by_name', 'resolved_at',
        ]

    def get_resolved_by_name(self, obj):
        if obj.resolved_by:
            return obj.resolved_by.full_name
        return None


class ErrorTicketDetailSerializer(serializers.ModelSerializer):
    """Full serializer used in the ticket detail view — includes occurrences."""
    resolved_by_name = serializers.SerializerMethodField()
    recent_occurrences = serializers.SerializerMethodField()
    bug_report_count = serializers.SerializerMethodField()

    class Meta:
        model  = ErrorTicket
        fields = [
            'id', 'fingerprint', 'title', 'source',
            'error_type', 'error_message', 'stack_trace', 'component_stack',
            'url_path', 'http_status', 'api_endpoint',
            'occurrence_count', 'affected_users_count',
            'first_seen', 'last_seen',
            'status', 'resolved_by_name', 'resolved_at', 'resolution_note',
            'recent_occurrences', 'bug_report_count',
        ]

    def get_resolved_by_name(self, obj):
        if obj.resolved_by:
            return obj.resolved_by.full_name
        return None

    def get_recent_occurrences(self, obj):
        qs = obj.occurrences.select_related('user').order_by('-occurred_at')[:20]
        return ErrorOccurrenceSerializer(qs, many=True).data

    def get_bug_report_count(self, obj):
        return obj.bug_reports.count()


class ReportErrorSerializer(serializers.Serializer):
    """
    Incoming payload from the frontend error capture.
    Handles both JS runtime errors and API errors.
    """
    error_type      = serializers.CharField(max_length=255, default='Error')
    error_message   = serializers.CharField()
    stack_trace     = serializers.CharField(required=False, allow_blank=True)
    component_stack = serializers.CharField(required=False, allow_blank=True)
    url_path        = serializers.CharField(max_length=1000, default='')
    source          = serializers.ChoiceField(
                          choices=['frontend_js', 'api_error'],
                          default='frontend_js'
                      )
    http_status     = serializers.IntegerField(required=False, allow_null=True)
    api_endpoint    = serializers.CharField(max_length=500, required=False, allow_blank=True)
    user_agent      = serializers.CharField(max_length=500, required=False, allow_blank=True)
    extra           = serializers.JSONField(required=False, allow_null=True)


class BugReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = BugReport
        fields = ['title', 'description', 'url_path', 'severity', 'screenshot']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BugReportListSerializer(serializers.ModelSerializer):
    user_name    = serializers.SerializerMethodField()
    linked_ticket_title = serializers.SerializerMethodField()

    class Meta:
        model  = BugReport
        fields = [
            'id', 'user_name', 'title', 'description',
            'url_path', 'severity', 'status',
            'submitted_at', 'updated_at',
            'linked_ticket', 'linked_ticket_title', 'admin_note',
        ]

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.full_name
        return 'Unknown'

    def get_linked_ticket_title(self, obj):
        if obj.linked_ticket:
            return obj.linked_ticket.title
        return None


class TicketStatusUpdateSerializer(serializers.Serializer):
    status          = serializers.ChoiceField(choices=['open', 'investigating', 'resolved', 'wontfix'])
    resolution_note = serializers.CharField(required=False, allow_blank=True)


class BugReportAdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = BugReport
        fields = ['status', 'admin_note', 'linked_ticket']