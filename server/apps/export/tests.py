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
        self.chronicle_master = User.objects.create_user(
            username="expchron", email="ec@t.com", password="p",
            full_name="Chronicle Master", role="chronicle_master",
            is_chronicle_master=True,
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

@override_settings(RATELIMIT_ENABLE=False)
class NewExportEndpointsTests(ExportTestMixin, APITestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self._setup_base()

    def test_accumulator_export_access(self):
        self.client.force_authenticate(user=self.accumulator)
        resp = self.client.get(
            '/api/export/accumulator/export/',
            {'format': 'json', 'export_type': 'campus_data'}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        
    def test_accumulator_dashboard_access(self):
        self.client.force_authenticate(user=self.accumulator)
        resp = self.client.get('/api/export/accumulator/dashboard/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_chronicle_export_access(self):
        self.client.force_authenticate(user=self.chronicle_master)
        resp = self.client.get(
            '/api/export/chronicle/export/',
            {'format': 'json'}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        
    def test_chronicle_dashboard_access(self):
        self.client.force_authenticate(user=self.chronicle_master)
        resp = self.client.get('/api/export/chronicle/dashboard/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        
    def test_chronicle_data_requests(self):
        self.client.force_authenticate(user=self.chronicle_master)
        resp = self.client.get('/api/export/chronicle/data-requests/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        
        # Test creation
        resp = self.client.post('/api/export/chronicle/data-requests/', {
            'date_from': '2025-01-01',
            'date_to': '2025-06-30',
            'message': 'Please submit Q1/Q2 MIS data'
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_chronicle_fan_out_stays_within_each_campus(self):
        other_campus = Campus.objects.create(name="Other", code="OTH", city="Y")
        User.objects.create_user(
            username="othcoord", email="oc@t.com", password="p",
            full_name="Other Coord", role="mis_coordinator", campus=other_campus,
        )
        self.client.force_authenticate(user=self.chronicle_master)
        resp = self.client.post('/api/export/chronicle/data-requests/', {
            'date_from': '2025-01-01', 'date_to': '2025-06-30',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        pairs = list(MISDataRequest.objects.values_list('accumulator', 'coordinator'))
        # the other campus has no accumulator, so its coordinator gets nothing
        self.assertEqual(pairs, [(self.accumulator.pk, self.coordinator.pk)])


@override_settings(RATELIMIT_ENABLE=False)
class IntegrityRuleTests(ExportTestMixin, APITestCase):
    """Fixes 5, 6 and 9: valid date ranges, no duplicate pending requests, all-or-nothing send."""
    def setUp(self):
        self._setup_base()

    def test_report_with_backwards_dates_is_rejected(self):
        self.client.force_authenticate(user=self.coordinator)
        resp = self.client.post('/api/export/reports/', {
            'name': 'R', 'data_content': 'x', 'date_from': '2025-06-30', 'date_to': '2025-06-01'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date_to', resp.data)

    def test_database_refuses_backwards_dates_even_without_the_api(self):
        from django.db import IntegrityError, transaction
        with self.assertRaises(IntegrityError), transaction.atomic():
            MISReport.objects.create(created_by=self.coordinator, data_content='x',
                                     date_from=date(2025, 6, 30), date_to=date(2025, 6, 1))

    def test_double_clicked_request_all_creates_one_request(self):
        self.client.force_authenticate(user=self.accumulator)
        body = {'date_from': '2025-01-01', 'date_to': '2025-03-31'}
        first = self.client.post('/api/export/accumulator/request-all/', body, format='json')
        second = self.client.post('/api/export/accumulator/request-all/', body, format='json')
        self.assertEqual((first.data['created'], second.data['created'], second.data['skipped']), (1, 0, 1))
        self.assertEqual(MISDataRequest.objects.count(), 1)

    def test_database_refuses_a_second_identical_pending_request(self):
        # the race the view can't see: two parallel inserts both past the "already pending?" check
        from django.db import IntegrityError, transaction
        kw = dict(accumulator=self.accumulator, coordinator=self.coordinator,
                  date_from=date(2025, 1, 1), date_to=date(2025, 3, 31))
        MISDataRequest.objects.create(**kw)
        with self.assertRaises(IntegrityError), transaction.atomic():
            MISDataRequest.objects.create(**kw)
        MISDataRequest.objects.create(**kw, status='completed')  # completed history is fine

    def test_chronicle_fan_out_skips_identical_pending_requests(self):
        MISDataRequest.objects.create(accumulator=self.accumulator, coordinator=self.coordinator,
                                      date_from=date(2025, 1, 1), date_to=date(2025, 6, 30))
        self.client.force_authenticate(user=self.chronicle_master)
        resp = self.client.post('/api/export/chronicle/data-requests/',
                                {'date_from': '2025-01-01', 'date_to': '2025-06-30'})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MISDataRequest.objects.count(), 1)

    def test_send_to_accumulator_is_all_or_nothing(self):
        from unittest.mock import patch
        from django.db import DatabaseError
        req = MISDataRequest.objects.create(accumulator=self.accumulator, coordinator=self.coordinator,
                                            date_from=date(2025, 1, 1), date_to=date(2025, 3, 31))
        report = MISReport.objects.create(created_by=self.coordinator, data_content='x',
                                          date_from=date(2025, 1, 1), date_to=date(2025, 3, 31))
        self.client.force_authenticate(user=self.coordinator)
        url = f'/api/export/reports/{report.pk}/send-accumulator/'
        with patch('django.db.models.query.QuerySet.update', side_effect=DatabaseError('boom')):
            with self.assertRaises(DatabaseError):
                self.client.post(url)
        report.refresh_from_db(); req.refresh_from_db()
        self.assertFalse(report.sent_to_accumulator)   # rolled back with the failed request update
        self.assertEqual(req.status, 'pending')

        self.assertEqual(self.client.post(url).status_code, status.HTTP_200_OK)
        report.refresh_from_db(); req.refresh_from_db()
        self.assertTrue(report.sent_to_accumulator)
        self.assertEqual(req.status, 'completed')


class BackgroundExportAllTests(ExportTestMixin, APITestCase):
    """"Export all" runs in Celery: start → poll → download, only by the user who started it."""

    def setUp(self):
        import tempfile
        from unittest import mock
        self._setup_base()
        self.tmp = tempfile.mkdtemp()
        for target in ('apps.export.tasks.USER_EXPORT_DIR', 'apps.export.views.USER_EXPORT_DIR'):
            patcher = mock.patch(target, self.tmp)
            patcher.start()
            self.addCleanup(patcher.stop)
        self.mock = mock

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp, ignore_errors=True)

    def _finished(self, result):
        job = self.mock.Mock(result=result)
        job.successful.return_value = True
        job.failed.return_value = False
        return self.mock.patch('apps.export.views.AsyncResult', return_value=job)

    def test_start_queues_job(self):
        self.client.force_authenticate(user=self.faculty)
        with self.mock.patch('apps.export.views.export_all_for_user.delay') as delay:
            delay.return_value.id = 'abc'
            res = self.client.post('/api/export/all/')
        self.assertEqual(res.status_code, 202)
        self.assertEqual(res.data, {'task_id': 'abc'})
        delay.assert_called_once_with(self.faculty.id)

    def test_job_builds_file_and_owner_downloads_it(self):
        from apps.export.tasks import export_all_for_user
        result = export_all_for_user(self.faculty.id)
        self.assertTrue(result['path'].startswith(self.tmp))

        self.client.force_authenticate(user=self.faculty)
        with self._finished(result):
            self.assertEqual(self.client.get('/api/export/jobs/abc/').data, {'status': 'ready'})
            res = self.client.get('/api/export/jobs/abc/download/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('MIS_Dashboard.xlsx', res['Content-Disposition'])
        self.assertTrue(b''.join(res.streaming_content).startswith(b'PK'))  # a real .xlsx (zip)

    def test_other_user_cannot_see_or_download(self):
        from apps.export.tasks import export_all_for_user
        result = export_all_for_user(self.faculty.id)
        self.client.force_authenticate(user=self.admin_user)
        with self._finished(result):
            self.assertEqual(self.client.get('/api/export/jobs/abc/').status_code, 404)
            self.assertEqual(self.client.get('/api/export/jobs/abc/download/').status_code, 404)

    def test_path_outside_export_dir_is_refused(self):
        self.client.force_authenticate(user=self.faculty)
        with self._finished({'user_id': self.faculty.id, 'path': '/etc/passwd'}):
            self.assertEqual(self.client.get('/api/export/jobs/abc/download/').status_code, 404)

    def test_unfinished_job_reports_processing(self):
        job = self.mock.Mock()
        job.successful.return_value = False
        job.failed.return_value = False
        self.client.force_authenticate(user=self.faculty)
        with self.mock.patch('apps.export.views.AsyncResult', return_value=job):
            self.assertEqual(self.client.get('/api/export/jobs/abc/').data, {'status': 'processing'})


class AccumulatorDashboardTests(ExportTestMixin, APITestCase):
    """The dashboard reports each coordinator's status with a fixed number of queries."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self._setup_base()
        self.client.force_authenticate(user=self.accumulator)

    def _add_coordinator(self, i, submitted, pending):
        from django.utils import timezone
        from datetime import timedelta
        coord = User.objects.create_user(username=f'dc{i}', email=f'dc{i}@t.com', password='p',
                                         full_name=f'Coord {i}', role='mis_coordinator', campus=self.campus)
        UserSchoolMapping.objects.create(user=coord, school=self.school, assigned_by=self.master)
        for d in range(submitted):  # the later one must be reported as latest
            MISReport.objects.create(created_by=coord, name=f'r{i}-{d}', data_content='x',
                                     date_from=date(2026, 1, 1), date_to=date(2026, 1, 1),
                                     sent_to_accumulator_at=timezone.now() + timedelta(minutes=d))
        for d in range(pending):
            MISDataRequest.objects.create(accumulator=self.accumulator, coordinator=coord,
                                          date_from=date(2026, 1, 1), date_to=date(2026, 1, 1 + d))
        return coord

    def _get(self):
        from django.db import connection
        from django.test.utils import CaptureQueriesContext
        with CaptureQueriesContext(connection) as ctx:
            resp = self.client.get('/api/export/accumulator/dashboard/')
        self.assertEqual(resp.status_code, 200)
        return resp.data, len(ctx)

    def test_status_per_coordinator(self):
        done = self._add_coordinator(1, submitted=2, pending=0)
        waiting = self._add_coordinator(2, submitted=0, pending=3)
        data, _ = self._get()
        rows = {c['id']: c for c in data['coordinators']}
        self.assertTrue(rows[done.id]['has_submitted'])
        self.assertEqual(rows[done.id]['latest_report_name'], 'r1-1')
        self.assertEqual(rows[done.id]['pending_requests'], 0)
        self.assertFalse(rows[waiting.id]['has_submitted'])
        self.assertIsNone(rows[waiting.id]['latest_report_date'])
        self.assertEqual(rows[waiting.id]['pending_requests'], 3)

    def test_query_count_does_not_grow_with_coordinators(self):
        for i in range(2):
            self._add_coordinator(i, submitted=1, pending=1)
        _, few = self._get()
        for i in range(2, 10):
            self._add_coordinator(i, submitted=1, pending=1)
        _, many = self._get()
        self.assertEqual(many, few)


def _queries(client, method, url, data=None):
    from django.db import connection
    from django.test.utils import CaptureQueriesContext
    with CaptureQueriesContext(connection) as ctx:
        resp = getattr(client, method)(url, data, format='json')
    return resp, len(ctx)


class ChronicleDashboardTests(ExportTestMixin, APITestCase):
    """Per-accumulator status, computed with a fixed number of queries."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self._setup_base()
        self.client.force_authenticate(user=self.chronicle_master)
        self.k = 0

    def _add_campus(self, coordinators=2, completed=1, reports=1):
        from django.utils import timezone
        from datetime import timedelta
        self.k += 1
        c = Campus.objects.create(name=f'Campus {self.k}', code=f'CP{self.k}', city='X')
        acc = User.objects.create_user(username=f'acc{self.k}', email=f'acc{self.k}@t.com', password='p',
                                       full_name=f'Acc {self.k}', role='mis_accumulator', campus=c)
        coords = [User.objects.create_user(username=f'co{self.k}_{i}', email=f'co{self.k}_{i}@t.com',
                                           password='p', full_name='C', role='mis_coordinator', campus=c)
                  for i in range(coordinators)]
        for coord in coords[:completed]:
            MISDataRequest.objects.create(accumulator=acc, coordinator=coord, date_from=date(2026, 1, 1),
                                          date_to=date(2026, 1, 31), status='completed')
        for d in range(reports):
            MISReport.objects.create(created_by=acc, name=f'r{d}', data_content='x', date_from=date(2026, 1, 1),
                                     date_to=date(2026, 1, 31),
                                     sent_to_chronicle_master_at=timezone.now() + timedelta(hours=d))
        return acc

    def test_status_per_accumulator(self):
        done = self._add_campus(coordinators=3, completed=2, reports=2)
        idle = self._add_campus(coordinators=1, completed=0, reports=0)
        resp = self.client.get('/api/export/chronicle/dashboard/')
        rows = {r['id']: r for r in resp.data}
        self.assertEqual((rows[done.id]['total_coordinators'], rows[done.id]['coordinators_submitted'],
                          rows[done.id]['coordinators_pending']), (3, 2, 1))
        self.assertTrue(rows[done.id]['has_submitted'])
        latest = MISReport.objects.filter(created_by=done).order_by('-sent_to_chronicle_master_at').first()
        self.assertEqual(rows[done.id]['submitted_at'], latest.sent_to_chronicle_master_at)
        self.assertFalse(rows[idle.id]['has_submitted'])
        self.assertIsNone(rows[idle.id]['submitted_at'])
        self.assertEqual(rows[idle.id]['coordinators_pending'], 1)

    def test_query_count_does_not_grow_with_accumulators(self):
        for _ in range(2):
            self._add_campus()
        _, few = _queries(self.client, 'get', '/api/export/chronicle/dashboard/')
        for _ in range(6):
            self._add_campus()
        _, many = _queries(self.client, 'get', '/api/export/chronicle/dashboard/')
        self.assertEqual(many, few)


@override_settings(RATELIMIT_ENABLE=False)
class FanOutWriteTests(ExportTestMixin, APITestCase):
    """Request-all and the chronicle fan-out insert in bulk, with exact created / skipped counts."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self._setup_base()
        self.k = 0

    def _coordinators(self, n, campus=None):
        out = []
        for _ in range(n):
            self.k += 1
            out.append(User.objects.create_user(username=f'fc{self.k}', email=f'fc{self.k}@t.com', password='p',
                                                full_name='C', role='mis_coordinator',
                                                campus=campus or self.campus))
        return out

    def test_request_all_skips_coordinators_already_pending(self):
        extra = self._coordinators(2)
        MISDataRequest.objects.create(accumulator=self.accumulator, coordinator=extra[0],
                                      date_from=date(2026, 1, 10), date_to=date(2026, 1, 20))
        self.client.force_authenticate(user=self.accumulator)
        resp = self.client.post('/api/export/accumulator/request-all/',
                                {'date_from': '2026-01-01', 'date_to': '2026-01-31'}, format='json')
        self.assertEqual((resp.data['created'], resp.data['skipped']), (2, 1))  # self.coordinator + extra[1]
        self.assertEqual(MISDataRequest.objects.filter(coordinator=extra[0]).count(), 1)

    def test_request_all_cost_does_not_grow_with_coordinators(self):
        self.client.force_authenticate(user=self.accumulator)
        self._coordinators(1)
        _, few = _queries(self.client, 'post', '/api/export/accumulator/request-all/',
                          {'date_from': '2026-01-01', 'date_to': '2026-01-31'})
        self._coordinators(8)
        resp, many = _queries(self.client, 'post', '/api/export/accumulator/request-all/',
                              {'date_from': '2026-02-01', 'date_to': '2026-02-28'})
        self.assertEqual(resp.data['created'], 10)
        self.assertEqual(many, few)

    def test_chronicle_fan_out_cost_does_not_grow_with_campuses(self):
        def add_campuses(n):
            for _ in range(n):
                self.k += 1
                c = Campus.objects.create(name=f'F{self.k}', code=f'F{self.k}', city='X')
                User.objects.create_user(username=f'fa{self.k}', email=f'fa{self.k}@t.com', password='p',
                                         full_name='A', role='mis_accumulator', campus=c)
                self._coordinators(2, campus=c)
        self.client.force_authenticate(user=self.chronicle_master)
        add_campuses(1)
        _, few = _queries(self.client, 'post', '/api/export/chronicle/data-requests/',
                          {'date_from': '2026-01-01', 'date_to': '2026-01-31'})
        add_campuses(6)
        resp, many = _queries(self.client, 'post', '/api/export/chronicle/data-requests/',
                              {'date_from': '2026-02-01', 'date_to': '2026-02-28'})
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(many, few)
        # every accumulator asked exactly its own campus's coordinators
        for req in MISDataRequest.objects.filter(date_from=date(2026, 2, 1)).select_related('accumulator',
                                                                                            'coordinator'):
            self.assertEqual(req.accumulator.campus_id, req.coordinator.campus_id)
