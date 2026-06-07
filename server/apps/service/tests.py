"""
Comprehensive tests for the service app.
Covers: ErrorTicket, ErrorOccurrence, BugReport models, fingerprint deduplication,
serializers, and all view endpoints.
"""
import hashlib
import re
from datetime import date
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from apps.schools.models import Campus
from apps.service.models import ErrorTicket, ErrorOccurrence, BugReport

User = get_user_model()


# ═══════════════════════════════════════════════════════════════════════════════
# TEST HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

class ServiceTestMixin:
    def _setup_base(self):
        self.campus = Campus.objects.create(name="Svc Campus", code="SVC", city="X")
        self.service_admin = User.objects.create_user(
            username="svcadmin", email="svc@t.com", password="p",
            full_name="Service Admin", role="service_admin",
            is_service_admin=True,
        )
        self.regular_user = User.objects.create_user(
            username="svcuser", email="su@t.com", password="p",
            full_name="Regular User", role="user", campus=self.campus,
        )
        self.another_user = User.objects.create_user(
            username="svcuser2", email="su2@t.com", password="p",
            full_name="Another User", role="admin", campus=self.campus,
        )


# ═══════════════════════════════════════════════════════════════════════════════
# MODEL TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class ErrorTicketModelTests(ServiceTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create_ticket(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="abc123", title="Test Error",
            error_message="Something went wrong",
        )
        self.assertEqual(ticket.status, 'open')
        self.assertEqual(ticket.source, 'frontend_js')
        self.assertEqual(ticket.occurrence_count, 1)
        self.assertEqual(ticket.affected_users_count, 0)
        self.assertIsNotNone(ticket.first_seen)
        self.assertIsNotNone(ticket.last_seen)
        self.assertIsNone(ticket.resolved_by)
        self.assertIsNone(ticket.resolved_at)

    def test_str(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="str123", title="Display Error",
            error_message="msg", status="open",
        )
        self.assertEqual(str(ticket), "[OPEN] Display Error")

    def test_str_long_title_truncated(self):
        long_title = "X" * 100
        ticket = ErrorTicket.objects.create(
            fingerprint="long123", title=long_title,
            error_message="msg",
        )
        self.assertEqual(str(ticket), f"[OPEN] {long_title[:80]}")

    def test_fingerprint_unique(self):
        ErrorTicket.objects.create(
            fingerprint="unique123", title="E1", error_message="m",
        )
        with self.assertRaises(Exception):
            ErrorTicket.objects.create(
                fingerprint="unique123", title="E2", error_message="m",
            )

    def test_status_choices(self):
        for s in ['open', 'planning', 'fixing', 'testing', 'closed']:
            t = ErrorTicket(
                fingerprint=f"sc_{s}", title="T", error_message="m", status=s,
            )
            t.full_clean()

    def test_source_choices(self):
        for src in ['frontend_js', 'api_error', 'manual']:
            t = ErrorTicket(
                fingerprint=f"src_{src}", title="T", error_message="m", source=src,
            )
            t.full_clean()

    def test_resolved_by_set_null(self):
        resolver = User.objects.create_user(
            username="resolver", email="res@t.com", password="p",
            full_name="Resolver", role="service_admin", is_service_admin=True,
        )
        ticket = ErrorTicket.objects.create(
            fingerprint="res123", title="Resolved", error_message="m",
            resolved_by=resolver, status="closed",
        )
        resolver.delete()
        ticket.refresh_from_db()
        self.assertIsNone(ticket.resolved_by)

    def test_db_table(self):
        self.assertEqual(ErrorTicket._meta.db_table, 'service_error_tickets')


class MakeFingerprintTests(TestCase):
    def test_basic_fingerprint(self):
        fp = ErrorTicket.make_fingerprint("TypeError", "Cannot read undefined", "/dashboard")
        self.assertEqual(len(fp), 64)  # SHA256 hex digest

    def test_normalizes_digits(self):
        fp1 = ErrorTicket.make_fingerprint("Error", "Failed at line 123", "/page")
        fp2 = ErrorTicket.make_fingerprint("Error", "Failed at line 456", "/page")
        self.assertEqual(fp1, fp2)

    def test_normalizes_hex_addresses(self):
        fp1 = ErrorTicket.make_fingerprint("Error", "at 0xDEADBEEF", "/page")
        fp2 = ErrorTicket.make_fingerprint("Error", "at 0xCAFEBABE", "/page")
        self.assertEqual(fp1, fp2)

    def test_different_error_types_different_fingerprints(self):
        fp1 = ErrorTicket.make_fingerprint("TypeError", "msg", "/page")
        fp2 = ErrorTicket.make_fingerprint("ReferenceError", "msg", "/page")
        self.assertNotEqual(fp1, fp2)

    def test_different_urls_different_fingerprints(self):
        fp1 = ErrorTicket.make_fingerprint("Error", "msg", "/page1")
        fp2 = ErrorTicket.make_fingerprint("Error", "msg", "/page2")
        self.assertNotEqual(fp1, fp2)

    def test_long_message_truncated_at_200(self):
        long_msg = "x" * 300
        clean = re.sub(r'\d+', 'N', long_msg)
        clean = re.sub(r'0x[0-9a-fA-F]+', '0xADDR', clean)
        raw = f"Error|{clean[:200]}|/page"
        expected = hashlib.sha256(raw.encode()).hexdigest()
        fp = ErrorTicket.make_fingerprint("Error", long_msg, "/page")
        self.assertEqual(fp, expected)

    def test_empty_message(self):
        fp = ErrorTicket.make_fingerprint("Error", "", "/page")
        self.assertEqual(len(fp), 64)

    def test_none_message(self):
        fp = ErrorTicket.make_fingerprint("Error", None, "/page")
        self.assertEqual(len(fp), 64)


class ErrorOccurrenceModelTests(ServiceTestMixin, TestCase):
    def setUp(self):
        self._setup_base()
        self.ticket = ErrorTicket.objects.create(
            fingerprint="occ123", title="Occ Test", error_message="m",
        )

    def test_create(self):
        occ = ErrorOccurrence.objects.create(
            ticket=self.ticket, user=self.regular_user,
            url_path="/dashboard", user_agent="Mozilla/5.0",
        )
        self.assertIsNotNone(occ.occurred_at)
        self.assertEqual(occ.ticket, self.ticket)

    def test_str(self):
        occ = ErrorOccurrence.objects.create(ticket=self.ticket)
        expected = f"{self.ticket.title[:50]} @ {occ.occurred_at}"
        self.assertEqual(str(occ), expected)

    def test_cascade_on_ticket_delete(self):
        occ = ErrorOccurrence.objects.create(ticket=self.ticket)
        self.ticket.delete()
        self.assertFalse(ErrorOccurrence.objects.filter(pk=occ.pk).exists())

    def test_user_set_null(self):
        user = User.objects.create_user(
            username="delocc", email="do@t.com", password="p",
            full_name="Del", role="user",
        )
        occ = ErrorOccurrence.objects.create(ticket=self.ticket, user=user)
        user.delete()
        occ.refresh_from_db()
        self.assertIsNone(occ.user)

    def test_extra_json_field(self):
        occ = ErrorOccurrence.objects.create(
            ticket=self.ticket, extra={"browser": "Chrome", "version": 120},
        )
        occ.refresh_from_db()
        self.assertEqual(occ.extra['browser'], 'Chrome')

    def test_reverse_relation(self):
        ErrorOccurrence.objects.create(ticket=self.ticket)
        ErrorOccurrence.objects.create(ticket=self.ticket)
        self.assertEqual(self.ticket.occurrences.count(), 2)


class BugReportModelTests(ServiceTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        report = BugReport.objects.create(
            user=self.regular_user, title="Bug Report",
            description="Something is broken", severity="high",
        )
        self.assertEqual(report.status, 'open')
        self.assertEqual(report.severity, 'high')
        self.assertIsNotNone(report.submitted_at)
        self.assertIsNone(report.linked_ticket)
        self.assertIsNone(report.admin_note)

    def test_str(self):
        report = BugReport.objects.create(
            user=self.regular_user, title="UI Bug",
            description="d", severity="critical",
        )
        self.assertEqual(str(report), "[CRITICAL] UI Bug")

    def test_severity_choices(self):
        for s in ['low', 'medium', 'high', 'critical']:
            b = BugReport(
                user=self.regular_user, title="T", description="d", severity=s,
            )
            b.full_clean()

    def test_default_severity(self):
        report = BugReport.objects.create(
            user=self.regular_user, title="T", description="d",
        )
        self.assertEqual(report.severity, 'medium')

    def test_linked_ticket(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="link123", title="Linked", error_message="m",
        )
        report = BugReport.objects.create(
            user=self.regular_user, title="T", description="d",
            linked_ticket=ticket,
        )
        self.assertEqual(report.linked_ticket, ticket)
        self.assertIn(report, ticket.bug_reports.all())

    def test_linked_ticket_set_null(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="dlink", title="Del Link", error_message="m",
        )
        report = BugReport.objects.create(
            user=self.regular_user, title="T", description="d",
            linked_ticket=ticket,
        )
        ticket.delete()
        report.refresh_from_db()
        self.assertIsNone(report.linked_ticket)

    def test_db_table(self):
        self.assertEqual(BugReport._meta.db_table, 'service_bug_reports')


# ═══════════════════════════════════════════════════════════════════════════════
# SERIALIZER TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class ErrorOccurrenceSerializerTests(ServiceTestMixin, TestCase):
    def setUp(self):
        self._setup_base()
        self.ticket = ErrorTicket.objects.create(
            fingerprint="ser123", title="Ser Test", error_message="m",
        )

    def test_user_name_with_user(self):
        from apps.service.serializers import ErrorOccurrenceSerializer
        occ = ErrorOccurrence.objects.create(
            ticket=self.ticket, user=self.regular_user,
        )
        occ = ErrorOccurrence.objects.select_related('user').get(pk=occ.pk)
        data = ErrorOccurrenceSerializer(occ).data
        self.assertEqual(data['user_name'], 'Regular User')

    def test_user_name_anonymous(self):
        from apps.service.serializers import ErrorOccurrenceSerializer
        occ = ErrorOccurrence.objects.create(ticket=self.ticket)
        data = ErrorOccurrenceSerializer(occ).data
        self.assertEqual(data['user_name'], 'Anonymous')


class ErrorTicketSerializerTests(ServiceTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_list_serializer(self):
        from apps.service.serializers import ErrorTicketListSerializer
        ticket = ErrorTicket.objects.create(
            fingerprint="list123", title="List Test", error_message="m",
            resolved_by=self.service_admin,
        )
        ticket = ErrorTicket.objects.select_related('resolved_by').get(pk=ticket.pk)
        data = ErrorTicketListSerializer(ticket).data
        self.assertEqual(data['resolved_by_name'], 'Service Admin')

    def test_detail_serializer_recent_occurrences(self):
        from apps.service.serializers import ErrorTicketDetailSerializer
        ticket = ErrorTicket.objects.create(
            fingerprint="det123", title="Detail Test", error_message="m",
        )
        for i in range(25):
            ErrorOccurrence.objects.create(ticket=ticket)
        ticket = ErrorTicket.objects.select_related('resolved_by').get(pk=ticket.pk)
        data = ErrorTicketDetailSerializer(ticket).data
        # Should show at most 20 recent occurrences
        self.assertEqual(len(data['recent_occurrences']), 20)
        self.assertEqual(data['bug_report_count'], 0)


class ReportErrorSerializerTests(TestCase):
    def test_valid_data(self):
        from apps.service.serializers import ReportErrorSerializer
        data = {
            'error_type': 'TypeError', 'error_message': 'Cannot read property',
            'url_path': '/dashboard', 'source': 'frontend_js',
        }
        serializer = ReportErrorSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_defaults(self):
        from apps.service.serializers import ReportErrorSerializer
        data = {'error_message': 'Something broke'}
        serializer = ReportErrorSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['error_type'], 'Error')
        self.assertEqual(serializer.validated_data['source'], 'frontend_js')

    def test_invalid_source(self):
        from apps.service.serializers import ReportErrorSerializer
        data = {'error_message': 'msg', 'source': 'invalid'}
        serializer = ReportErrorSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('source', serializer.errors)

    def test_missing_error_message(self):
        from apps.service.serializers import ReportErrorSerializer
        serializer = ReportErrorSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('error_message', serializer.errors)


class BugReportCreateSerializerTests(ServiceTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_creates_with_request_user(self):
        from apps.service.serializers import BugReportCreateSerializer
        from unittest.mock import Mock
        request = Mock()
        request.user = self.regular_user
        data = {'title': 'Bug', 'description': 'Broken', 'severity': 'high'}
        serializer = BugReportCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        obj = serializer.save()
        self.assertEqual(obj.user, self.regular_user)


# ═══════════════════════════════════════════════════════════════════════════════
# VIEW / API TESTS
# ═══════════════════════════════════════════════════════════════════════════════

@override_settings(RATELIMIT_ENABLE=False)
class ReportErrorViewTests(ServiceTestMixin, APITestCase):
    """Tests for the error reporting and deduplication endpoint."""

    def setUp(self):
        self._setup_base()
        self.url = '/api/service/report-error/'

    def test_report_new_error(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {
            'error_type': 'TypeError',
            'error_message': 'Cannot read property of undefined',
            'url_path': '/dashboard',
            'source': 'frontend_js',
        }
        resp = self.client.post(self.url, data)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['ok'])
        self.assertIn('ticket_id', resp.data)
        self.assertEqual(ErrorTicket.objects.count(), 1)
        self.assertEqual(ErrorOccurrence.objects.count(), 1)

    def test_deduplication_same_error(self):
        """Same error reported twice should create 1 ticket with 2 occurrences."""
        self.client.force_authenticate(user=self.regular_user)
        data = {
            'error_type': 'TypeError',
            'error_message': 'Cannot read property of undefined',
            'url_path': '/dashboard',
        }
        self.client.post(self.url, data)
        self.client.post(self.url, data)
        self.assertEqual(ErrorTicket.objects.count(), 1)
        self.assertEqual(ErrorOccurrence.objects.count(), 2)
        ticket = ErrorTicket.objects.first()
        self.assertEqual(ticket.occurrence_count, 2)

    def test_affected_users_count(self):
        """Each unique user increments affected_users_count only once."""
        data = {
            'error_type': 'Error', 'error_message': 'Same error',
            'url_path': '/page',
        }
        self.client.force_authenticate(user=self.regular_user)
        self.client.post(self.url, data)
        self.client.post(self.url, data)  # Same user again

        self.client.force_authenticate(user=self.another_user)
        self.client.post(self.url, data)

        ticket = ErrorTicket.objects.first()
        self.assertEqual(ticket.affected_users_count, 2)

    def test_reopens_closed_ticket(self):
        """A closed ticket should reopen when same error recurs."""
        fp = ErrorTicket.make_fingerprint('Error', 'Recurring error', '/page')
        ticket = ErrorTicket.objects.create(
            fingerprint=fp, title='Error: Recurring error',
            error_message='Recurring error', status='closed',
            resolved_by=self.service_admin, resolved_at=timezone.now(),
        )
        self.client.force_authenticate(user=self.regular_user)
        data = {
            'error_type': 'Error', 'error_message': 'Recurring error',
            'url_path': '/page',
        }
        resp = self.client.post(self.url, data)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'open')

    def test_invalid_payload_returns_ok_false(self):
        """ReportErrorView swallows validation errors."""
        self.client.force_authenticate(user=self.regular_user)
        resp = self.client.post(self.url, {})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data['ok'])

    def test_unauthenticated_denied(self):
        resp = self.client.post(self.url, {'error_message': 'x'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(RATELIMIT_ENABLE=False)
class BugReportCreateViewTests(ServiceTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()
        self.url = '/api/service/bug-reports/submit/'

    def test_create_bug_report(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {
            'title': 'Button broken', 'description': 'Submit does nothing',
            'severity': 'high',
        }
        resp = self.client.post(self.url, data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(resp.data['ok'])
        report = BugReport.objects.get()
        self.assertEqual(report.user, self.regular_user)

    def test_unauthenticated_denied(self):
        resp = self.client.post(self.url, {'title': 'x', 'description': 'd'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(RATELIMIT_ENABLE=False)
class ErrorTicketListViewTests(ServiceTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()
        self.url = '/api/service/tickets/'

    def test_service_admin_access(self):
        ErrorTicket.objects.create(
            fingerprint="list1", title="Ticket 1", error_message="m",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)

    def test_non_service_admin_denied(self):
        self.client.force_authenticate(user=self.regular_user)
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_by_status(self):
        ErrorTicket.objects.create(
            fingerprint="f1", title="T1", error_message="m", status="open",
        )
        ErrorTicket.objects.create(
            fingerprint="f2", title="T2", error_message="m", status="closed",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get(self.url, {'status': 'open'})
        self.assertEqual(resp.data['count'], 1)

    def test_filter_by_source(self):
        ErrorTicket.objects.create(
            fingerprint="s1", title="T1", error_message="m", source="frontend_js",
        )
        ErrorTicket.objects.create(
            fingerprint="s2", title="T2", error_message="m", source="api_error",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get(self.url, {'source': 'api_error'})
        self.assertEqual(resp.data['count'], 1)

    def test_search_by_title(self):
        ErrorTicket.objects.create(
            fingerprint="se1", title="Authentication Error", error_message="m",
        )
        ErrorTicket.objects.create(
            fingerprint="se2", title="Database Error", error_message="m",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get(self.url, {'search': 'Auth'})
        self.assertEqual(resp.data['count'], 1)

    def test_sort_by_occurrence_count(self):
        ErrorTicket.objects.create(
            fingerprint="so1", title="T1", error_message="m", occurrence_count=5,
        )
        ErrorTicket.objects.create(
            fingerprint="so2", title="T2", error_message="m", occurrence_count=50,
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get(self.url, {'sort': '-occurrence_count'})
        self.assertEqual(resp.data['results'][0]['title'], 'T2')


@override_settings(RATELIMIT_ENABLE=False)
class ErrorTicketDetailViewTests(ServiceTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_retrieve_ticket(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="det1", title="Detail", error_message="msg",
            stack_trace="Traceback...",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get(f'/api/service/tickets/{ticket.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['title'], 'Detail')
        self.assertIn('stack_trace', resp.data)
        self.assertIn('recent_occurrences', resp.data)
        self.assertIn('bug_report_count', resp.data)


@override_settings(RATELIMIT_ENABLE=False)
class ErrorTicketStatusViewTests(ServiceTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_update_status_to_planning(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="st1", title="T", error_message="m",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.post(
            f'/api/service/tickets/{ticket.pk}/status/',
            {'status': 'planning'},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'planning')
        self.assertIsNone(ticket.resolved_by)

    def test_close_sets_resolved_by(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="st2", title="T", error_message="m",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.post(
            f'/api/service/tickets/{ticket.pk}/status/',
            {'status': 'closed', 'resolution_note': 'Fixed in v2'},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'closed')
        self.assertEqual(ticket.resolved_by, self.service_admin)
        self.assertIsNotNone(ticket.resolved_at)
        self.assertEqual(ticket.resolution_note, 'Fixed in v2')

    def test_reopen_clears_resolved(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="st3", title="T", error_message="m",
            status="closed", resolved_by=self.service_admin,
            resolved_at=timezone.now(),
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.post(
            f'/api/service/tickets/{ticket.pk}/status/',
            {'status': 'open'},
        )
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'open')
        self.assertIsNone(ticket.resolved_by)
        self.assertIsNone(ticket.resolved_at)

    def test_nonexistent_ticket_404(self):
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.post(
            '/api/service/tickets/99999/status/', {'status': 'open'},
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_non_service_admin_denied(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="st4", title="T", error_message="m",
        )
        self.client.force_authenticate(user=self.regular_user)
        resp = self.client.post(
            f'/api/service/tickets/{ticket.pk}/status/', {'status': 'open'},
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class BugReportListViewTests(ServiceTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_list_as_service_admin(self):
        BugReport.objects.create(
            user=self.regular_user, title="Bug", description="d",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get('/api/service/bug-reports/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)

    def test_filter_by_severity(self):
        BugReport.objects.create(
            user=self.regular_user, title="Low", description="d", severity="low",
        )
        BugReport.objects.create(
            user=self.regular_user, title="High", description="d", severity="high",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get('/api/service/bug-reports/', {'severity': 'high'})
        self.assertEqual(resp.data['count'], 1)

    def test_non_service_admin_denied(self):
        self.client.force_authenticate(user=self.regular_user)
        resp = self.client.get('/api/service/bug-reports/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class BugReportDetailViewTests(ServiceTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_retrieve(self):
        report = BugReport.objects.create(
            user=self.regular_user, title="Detail Bug", description="d",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get(f'/api/service/bug-reports/{report.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_admin_update(self):
        report = BugReport.objects.create(
            user=self.regular_user, title="Update Bug", description="d",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.patch(
            f'/api/service/bug-reports/{report.pk}/',
            {'status': 'fixing', 'admin_note': 'Looking into it'},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertEqual(report.status, 'fixing')
        self.assertEqual(report.admin_note, 'Looking into it')

    def test_link_bug_to_ticket(self):
        ticket = ErrorTicket.objects.create(
            fingerprint="linkbug", title="Linked", error_message="m",
        )
        report = BugReport.objects.create(
            user=self.regular_user, title="Linkable", description="d",
        )
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.patch(
            f'/api/service/bug-reports/{report.pk}/',
            {'linked_ticket': ticket.pk},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertEqual(report.linked_ticket, ticket)


@override_settings(RATELIMIT_ENABLE=False)
class ServiceDashboardStatsViewTests(ServiceTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_service_admin_access(self):
        self.client.force_authenticate(user=self.service_admin)
        resp = self.client.get('/api/service/stats/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('total_tickets', resp.data)
        self.assertIn('open_tickets', resp.data)

    def test_non_service_admin_denied(self):
        self.client.force_authenticate(user=self.regular_user)
        resp = self.client.get('/api/service/stats/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
