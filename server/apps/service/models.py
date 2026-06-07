import hashlib
from django.db import models
from apps.accounts.models import User


class ErrorTicket(models.Model):
    """
    One row per unique error. Uniqueness is determined by the fingerprint field,
    which is a hash of error_type + error_message + url_path.

    When two users hit the same crash at the same location, only one ticket
    is created — the occurrence_count and affected_users_count are incremented
    instead.
    """
    STATUS_CHOICES = [
        ('open',     'Open'),
        ('planning', 'Planning'),
        ('fixing',   'Fixing'),
        ('testing',  'Testing'),
        ('closed',   'Closed'),
    ]

    SOURCE_CHOICES = [
        ('frontend_js',  'Frontend JS Error'),
        ('api_error',    'API / Network Error'),
        ('manual',       'Manually Reported'),
    ]

    # ── Identity ──────────────────────────────────────────────────────────────
    fingerprint     = models.CharField(max_length=64, unique=True, db_index=True)
    title           = models.CharField(max_length=500)
    source          = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='frontend_js')

    # ── Error details ─────────────────────────────────────────────────────────
    error_type      = models.CharField(max_length=255, blank=True)
    error_message   = models.TextField()
    stack_trace     = models.TextField(blank=True, null=True)
    component_stack = models.TextField(blank=True, null=True)  # React component tree
    url_path        = models.CharField(max_length=1000, blank=True)

    # ── API-specific (only for source=api_error) ──────────────────────────────
    http_status     = models.PositiveSmallIntegerField(null=True, blank=True)
    api_endpoint    = models.CharField(max_length=500, blank=True, null=True)

    # ── Statistics ────────────────────────────────────────────────────────────
    occurrence_count     = models.PositiveIntegerField(default=1)
    affected_users_count = models.PositiveIntegerField(default=0)

    # ── Timeline ──────────────────────────────────────────────────────────────
    first_seen      = models.DateTimeField(auto_now_add=True)
    last_seen       = models.DateTimeField(auto_now=True)

    # ── Resolution ────────────────────────────────────────────────────────────
    status          = models.CharField(max_length=15, choices=STATUS_CHOICES, default='open')
    resolved_by     = models.ForeignKey(
                          User, null=True, blank=True,
                          on_delete=models.SET_NULL,
                          related_name='resolved_tickets'
                      )
    resolved_at     = models.DateTimeField(null=True, blank=True)
    resolution_note = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'service_error_tickets'
        ordering = ['-last_seen']
        indexes  = [
            models.Index(fields=['status']),
            models.Index(fields=['source']),
            models.Index(fields=['first_seen']),
            models.Index(fields=['occurrence_count']),
        ]

    def __str__(self):
        return f'[{self.status.upper()}] {self.title[:80]}'

    @staticmethod
    def make_fingerprint(error_type: str, error_message: str, url_path: str) -> str:
        """
        Generates a stable 64-char hex fingerprint for deduplication.
        We normalise the message to strip line numbers and memory addresses
        so that the same logical crash always maps to the same fingerprint
        regardless of minification or hot-reload churn.
        """
        import re
        # strip volatile parts: line:col numbers, hex addresses, UUIDs
        clean_msg  = re.sub(r'0x[0-9a-fA-F]+', 'HEXADDR', error_message or '')
        clean_msg  = re.sub(r'\d+', 'N', clean_msg)
        raw        = f'{error_type}|{clean_msg[:200]}|{url_path}'
        return hashlib.sha256(raw.encode()).hexdigest()


class ErrorOccurrence(models.Model):
    """
    One row per individual occurrence of an ErrorTicket.
    Used to build the timeline / per-user breadcrumbs shown in the ticket detail.
    Kept lightweight — no full stack trace copy here (that lives on the ticket).
    """
    ticket       = models.ForeignKey(
                       ErrorTicket, on_delete=models.CASCADE,
                       related_name='occurrences'
                   )
    user         = models.ForeignKey(
                       User, null=True, blank=True,
                       on_delete=models.SET_NULL,
                       related_name='error_occurrences'
                   )
    occurred_at  = models.DateTimeField(auto_now_add=True)
    url_path     = models.CharField(max_length=1000, blank=True)
    user_agent   = models.CharField(max_length=500, blank=True, null=True)
    extra        = models.JSONField(null=True, blank=True)  # any additional context

    class Meta:
        db_table = 'service_error_occurrences'
        ordering = ['-occurred_at']
        indexes  = [
            models.Index(fields=['ticket', 'occurred_at']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'{self.ticket.title[:50]} @ {self.occurred_at}'


class BugReport(models.Model):
    """
    Manual report submitted by a user via the "Report a Bug" form.
    Optionally linked to an auto-detected ErrorTicket after triage.
    """
    SEVERITY_CHOICES = [
        ('low',      'Low — Minor inconvenience'),
        ('medium',   'Medium — Feature is broken'),
        ('high',     'High — Cannot complete my work'),
        ('critical', 'Critical — Data loss / security issue'),
    ]

    STATUS_CHOICES = [
        ('open',     'Open'),
        ('planning', 'Planning'),
        ('fixing',   'Fixing'),
        ('testing',  'Testing'),
        ('closed',   'Closed'),
    ]

    user         = models.ForeignKey(
                       User, on_delete=models.SET_NULL,
                       null=True, related_name='bug_reports'
                   )
    title        = models.CharField(max_length=500)
    description  = models.TextField()
    url_path     = models.CharField(max_length=1000, blank=True)
    severity     = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='medium')
    status       = models.CharField(max_length=15, choices=STATUS_CHOICES, default='open')
    screenshot   = models.TextField(blank=True, null=True)  # base64 data URL (optional)

    # Link to auto-detected error ticket if applicable
    linked_ticket = models.ForeignKey(
                        ErrorTicket, null=True, blank=True,
                        on_delete=models.SET_NULL,
                        related_name='bug_reports'
                    )

    submitted_at  = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)
    admin_note    = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'service_bug_reports'
        ordering = ['-submitted_at']
        indexes  = [
            models.Index(fields=['status']),
            models.Index(fields=['severity']),
            models.Index(fields=['submitted_at']),
        ]

    def __str__(self):
        return f'[{self.severity.upper()}] {self.title[:80]}'