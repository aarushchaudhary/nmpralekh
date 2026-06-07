"""
Comprehensive tests for the export app.
Covers: GeneratedExport, MISDataRequest, MISReport models, serializers, and views.
"""
from datetime import date
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from apps.schools.models import Campus, School, UserSchoolMapping
from apps.export.models import GeneratedExport, MISDataRequest, MISReport

User = get_user_model()


# ═══════════════════════════════════════════════════════════════════════════════
# TEST HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

class ExportTestMixin:
    def _setup_base(self):
        self.campus = Campus.objects.create(name="Export Campus", code="EXP", city="X")
        self.school = School.objects.create(campus=self.campus, name="Exp School", code="ES")
        self.master = User.objects.create_user(
            username="expmaster", email="em@t.com", password="p",
            full_name="Master", role="master",
        )
        self.admin_user = User.objects.create_user(
            username="expadmin", email="ea@t.com", password="p",
            full_name="Admin", role="admin", campus=self.campus,
        )
        self.faculty = User.objects.create_user(
            username="expfac", email="ef@t.com", password="p",
            full_name="Faculty", role="user", campus=self.campus,
        )
        self.coordinator = User.objects.create_user(
            username="expcoord", email="eco@t.com", password="p",
            full_name="Coordinator", role="mis_coordinator", campus=self.campus,
        )
        self.accumulator = User.objects.create_user(
            username="expacc", email="eac@t.com", password="p",
            full_name="Accumulator", role="mis_accumulator", campus=self.campus,
        )
        UserSchoolMapping.objects.create(user=self.admin_user, school=self.school, assigned_by=self.master)
        UserSchoolMapping.objects.create(user=self.faculty, school=self.school, assigned_by=self.master)
        UserSchoolMapping.objects.create(user=self.coordinator, school=self.school, assigned_by=self.master)


# ═══════════════════════════════════════════════════════════════════════════════
# MODEL TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class GeneratedExportModelTests(ExportTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        exp = GeneratedExport.objects.create(
            campus=self.campus, export_type='nightly',
            filename='export.xlsx', filepath='/exports/export.xlsx',
            generated_by=self.master, file_size_kb=100, record_count=500,
        )
        self.assertIsNotNone(exp.generated_at)
        self.assertEqual(exp.file_size_kb, 100)
        self.assertEqual(exp.record_count, 500)

    def test_str_with_campus(self):
        exp = GeneratedExport.objects.create(
            campus=self.campus, export_type='nightly',
            filename='test.xlsx', filepath='/x',
        )
        self.assertEqual(str(exp), "Export Campus — test.xlsx")

    def test_str_without_campus(self):
        exp = GeneratedExport.objects.create(
            export_type='manual', filename='all.xlsx', filepath='/x',
        )
        self.assertEqual(str(exp), "All — all.xlsx")

    def test_defaults(self):
        exp = GeneratedExport.objects.create(
            export_type='nightly', filename='f.xlsx', filepath='/x',
        )
        self.assertEqual(exp.file_size_kb, 0)
        self.assertEqual(exp.record_count, 0)
        self.assertIsNone(exp.campus)
        self.assertIsNone(exp.generated_by)

    def test_type_choices(self):
        for t in ['nightly', 'manual']:
            e = GeneratedExport(
                export_type=t, filename='f', filepath='/x',
            )
            e.full_clean()

    def test_generated_by_set_null(self):
        user = User.objects.create_user(
            username="delgen", email="dg@t.com", password="p",
            full_name="Del", role="user",
        )
        exp = GeneratedExport.objects.create(
            export_type='manual', filename='f', filepath='/x',
            generated_by=user,
        )
        user.delete()
        exp.refresh_from_db()
        self.assertIsNone(exp.generated_by)

    def test_ordering(self):
        exp1 = GeneratedExport.objects.create(
            export_type='nightly', filename='first.xlsx', filepath='/x',
        )
        exp2 = GeneratedExport.objects.create(
            export_type='nightly', filename='second.xlsx', filepath='/x',
        )
        exports = list(GeneratedExport.objects.all())
        self.assertEqual(exports[0], exp2)  # Most recent first

    def test_db_table(self):
        self.assertEqual(GeneratedExport._meta.db_table, 'generated_exports')


class MISDataRequestModelTests(ExportTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        req = MISDataRequest.objects.create(
            accumulator=self.accumulator, coordinator=self.coordinator,
            date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
        )
        self.assertEqual(req.status, 'pending')
        self.assertIsNone(req.completed_at)
        self.assertIsNotNone(req.created_at)

    def test_str(self):
        req = MISDataRequest.objects.create(
            accumulator=self.accumulator, coordinator=self.coordinator,
            date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
        )
        self.assertEqual(
            str(req), f"Request from {self.accumulator.username} to {self.coordinator.username}"
        )

    def test_status_choices(self):
        for s in ['pending', 'completed']:
            r = MISDataRequest(
                accumulator=self.accumulator, coordinator=self.coordinator,
                date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
                status=s,
            )
            r.full_clean()

    def test_cascade_on_user_delete(self):
        acc = User.objects.create_user(
            username="delacc", email="delacc@t.com", password="p",
            full_name="Del", role="mis_accumulator",
        )
        req = MISDataRequest.objects.create(
            accumulator=acc, coordinator=self.coordinator,
            date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
        )
        acc.delete()
        self.assertFalse(MISDataRequest.objects.filter(pk=req.pk).exists())


class MISReportModelTests(ExportTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        report = MISReport.objects.create(
            created_by=self.coordinator, name="Q1 Report",
            data_content="Some data", date_from=date(2025, 1, 1),
            date_to=date(2025, 3, 31),
        )
        self.assertFalse(report.sent_to_admin)
        self.assertFalse(report.sent_to_accumulator)
        self.assertFalse(report.sent_to_super_admin)
        self.assertFalse(report.sent_to_chronicle_master)
        self.assertIsNone(report.sent_to_admin_at)

    def test_str(self):
        report = MISReport.objects.create(
            created_by=self.coordinator, data_content="D",
            date_from=date(2025, 1, 1), date_to=date(2025, 3, 31),
        )
        self.assertEqual(
            str(report),
            f"Report by {self.coordinator.username} (2025-01-01 to 2025-03-31)"
        )

    def test_all_sent_flags_default_false(self):
        report = MISReport.objects.create(
            created_by=self.coordinator, data_content="D",
            date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
        )
        self.assertFalse(report.sent_to_admin)
        self.assertFalse(report.sent_to_accumulator)
        self.assertFalse(report.sent_to_super_admin)
        self.assertFalse(report.sent_to_chronicle_master)


# ═══════════════════════════════════════════════════════════════════════════════
# SERIALIZER TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class GeneratedExportSerializerTests(ExportTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_serialization(self):
        from apps.export.serializers import GeneratedExportSerializer
        exp = GeneratedExport.objects.create(
            campus=self.campus, export_type='nightly',
            filename='test.xlsx', filepath='/x',
            generated_by=self.master,
        )
        exp = GeneratedExport.objects.select_related('campus', 'generated_by').get(pk=exp.pk)
        data = GeneratedExportSerializer(exp).data
        self.assertEqual(data['campus_name'], 'Export Campus')
        self.assertEqual(data['generated_by_name'], 'Master')
        self.assertEqual(data['filename'], 'test.xlsx')


class MISDataRequestSerializerTests(ExportTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_creates_with_request_user(self):
        from apps.export.serializers import MISDataRequestSerializer
        from unittest.mock import Mock
        request = Mock()
        request.user = self.accumulator
        data = {
            'coordinator': self.coordinator.pk,
            'date_from': '2025-01-01', 'date_to': '2025-06-30',
        }
        serializer = MISDataRequestSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        obj = serializer.save()
        self.assertEqual(obj.accumulator, self.accumulator)


class MISReportSerializerTests(ExportTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_creates_with_request_user(self):
        from apps.export.serializers import MISReportSerializer
        from unittest.mock import Mock
        request = Mock()
        request.user = self.coordinator
        data = {
            'data_content': 'test data',
            'date_from': '2025-01-01', 'date_to': '2025-06-30',
        }
        serializer = MISReportSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        obj = serializer.save()
        self.assertEqual(obj.created_by, self.coordinator)


# ═══════════════════════════════════════════════════════════════════════════════
# VIEW / API TESTS
# ═══════════════════════════════════════════════════════════════════════════════

@override_settings(RATELIMIT_ENABLE=False)
class ExportHistoryViewTests(ExportTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_master_access(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get('/api/export/history/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_non_master_denied(self):
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.get('/api/export/history/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class ExportSchoolActivitiesViewTests(ExportTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_admin_access(self):
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.get('/api/export/school-activities/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_faculty_access(self):
        self.client.force_authenticate(user=self.faculty)
        resp = self.client.get('/api/export/school-activities/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_unauthenticated_denied(self):
        resp = self.client.get('/api/export/school-activities/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(RATELIMIT_ENABLE=False)
class MISDataRequestViewTests(ExportTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_accumulator_creates_request(self):
        self.client.force_authenticate(user=self.accumulator)
        data = {
            'coordinator': self.coordinator.pk,
            'date_from': '2025-01-01', 'date_to': '2025-06-30',
        }
        resp = self.client.post('/api/export/data-requests/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        req = MISDataRequest.objects.get()
        self.assertEqual(req.accumulator, self.accumulator)

    def test_coordinator_creates_request(self):
        self.client.force_authenticate(user=self.coordinator)
        data = {
            'coordinator': self.coordinator.pk,
            'date_from': '2025-01-01', 'date_to': '2025-06-30',
        }
        resp = self.client.post('/api/export/data-requests/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


@override_settings(RATELIMIT_ENABLE=False)
class MISReportViewTests(ExportTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_coordinator_creates_report(self):
        self.client.force_authenticate(user=self.coordinator)
        data = {
            'data_content': 'report data',
            'date_from': '2025-01-01', 'date_to': '2025-06-30',
        }
        resp = self.client.post('/api/export/reports/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        report = MISReport.objects.get()
        self.assertEqual(report.created_by, self.coordinator)

    def test_send_to_admin(self):
        report = MISReport.objects.create(
            created_by=self.coordinator, data_content="D",
            date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
        )
        self.client.force_authenticate(user=self.coordinator)
        resp = self.client.post(f'/api/export/reports/{report.pk}/send-admin/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertTrue(report.sent_to_admin)
        self.assertIsNotNone(report.sent_to_admin_at)

    def test_send_to_accumulator(self):
        report = MISReport.objects.create(
            created_by=self.coordinator, data_content="D",
            date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
        )
        self.client.force_authenticate(user=self.coordinator)
        resp = self.client.post(f'/api/export/reports/{report.pk}/send-accumulator/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertTrue(report.sent_to_accumulator)

    def test_send_to_super_admin(self):
        report = MISReport.objects.create(
            created_by=self.accumulator, data_content="D",
            date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
        )
        self.client.force_authenticate(user=self.accumulator)
        resp = self.client.post(f'/api/export/reports/{report.pk}/send-superadmin/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertTrue(report.sent_to_super_admin)

    def test_send_to_chronicle(self):
        report = MISReport.objects.create(
            created_by=self.accumulator, data_content="D",
            date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
        )
        self.client.force_authenticate(user=self.accumulator)
        resp = self.client.post(f'/api/export/reports/{report.pk}/send-chronicle/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertTrue(report.sent_to_chronicle_master)

    def test_non_coordinator_send_admin_denied(self):
        report = MISReport.objects.create(
            created_by=self.coordinator, data_content="D",
            date_from=date(2025, 1, 1), date_to=date(2025, 6, 30),
        )
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.post(f'/api/export/reports/{report.pk}/send-admin/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class CoordinatorExportViewTests(ExportTestMixin, APITestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self._setup_base()

    def test_coordinator_access(self):
        self.client.force_authenticate(user=self.coordinator)
        resp = self.client.get(
            '/api/export/coordinator/',
            {'date_from': '2025-01-01', 'date_to': '2025-06-30'},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_non_coordinator_denied(self):
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.get(
            '/api/export/coordinator/',
            {'date_from': '2025-01-01', 'date_to': '2025-06-30'},
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class ExportHelperFunctionTests(TestCase):
    def test_validate_export_params_valid(self):
        from apps.export.views import validate_export_params
        result = validate_export_params('1', '2025-01-01', '2025-06-30')
        self.assertIsNone(result)

    def test_validate_export_params_invalid_school_id(self):
        from apps.export.views import validate_export_params
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            validate_export_params('abc', '2025-01-01', '2025-06-30')

    def test_validate_export_params_invalid_date(self):
        from apps.export.views import validate_export_params
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            validate_export_params('1', 'not-a-date', '2025-06-30')

    def test_validate_export_params_empty(self):
        from apps.export.views import validate_export_params
        result = validate_export_params(None, None, None)
        self.assertIsNone(result)
