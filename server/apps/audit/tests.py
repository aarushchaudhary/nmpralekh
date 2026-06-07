"""
Comprehensive tests for the audit app.
Covers: AuditRequest model, AuditRequestSerializer, all views (list, detail, approve, reject, history).
"""
from datetime import date
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from apps.schools.models import Campus, School, UserSchoolMapping
from apps.audit.models import AuditRequest
from apps.records.models import SchoolActivity, StudentActivity, FacultyPublication

User = get_user_model()


# ═══════════════════════════════════════════════════════════════════════════════
# TEST HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

class AuditTestMixin:
    def _setup_base(self):
        self.campus = Campus.objects.create(name="Audit Campus", code="AUD", city="X")
        self.school = School.objects.create(campus=self.campus, name="Audit School", code="AS")
        self.master = User.objects.create_user(
            username="audmaster", email="am@t.com", password="p",
            full_name="Master", role="master",
        )
        self.delete_auth = User.objects.create_user(
            username="delauth", email="da@t.com", password="p",
            full_name="Delete Auth", role="delete_auth", campus=self.campus,
        )
        self.admin_user = User.objects.create_user(
            username="aadmin", email="aa@t.com", password="p",
            full_name="Admin", role="admin", campus=self.campus,
        )
        self.faculty = User.objects.create_user(
            username="afaculty", email="af@t.com", password="p",
            full_name="Faculty", role="user", campus=self.campus,
        )
        self.super_admin = User.objects.create_user(
            username="asuperadmin", email="asa@t.com", password="p",
            full_name="Super Admin", role="super_admin", campus=self.campus,
        )
        UserSchoolMapping.objects.create(user=self.admin_user, school=self.school, assigned_by=self.master)
        UserSchoolMapping.objects.create(user=self.faculty, school=self.school, assigned_by=self.master)


# ═══════════════════════════════════════════════════════════════════════════════
# MODEL TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class AuditRequestModelTests(AuditTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create_audit_request(self):
        ar = AuditRequest.objects.create(
            table_name="school_activities", record_id=1,
            action="UPDATE", old_data={"name": "Old"}, new_data={"name": "New"},
            school=self.school, requested_by=self.admin_user,
        )
        self.assertEqual(ar.status, "pending")
        self.assertIsNone(ar.reviewed_by)
        self.assertIsNone(ar.reviewed_at)
        self.assertIsNotNone(ar.requested_at)

    def test_str(self):
        ar = AuditRequest.objects.create(
            table_name="student_activities", record_id=42,
            action="DELETE", old_data={"name": "Act"},
            school=self.school, requested_by=self.admin_user,
        )
        self.assertEqual(str(ar), "DELETE on student_activities (record 42) — pending")

    def test_default_status_pending(self):
        ar = AuditRequest.objects.create(
            table_name="clubs", record_id=1,
            action="UPDATE", old_data={},
            requested_by=self.admin_user,
        )
        self.assertEqual(ar.status, "pending")

    def test_action_choices(self):
        for action in ['UPDATE', 'DELETE']:
            ar = AuditRequest(
                table_name="school_activities", record_id=1,
                action=action, old_data={}, requested_by=self.admin_user,
            )
            ar.full_clean()

    def test_table_name_choices(self):
        valid_tables = [
            'exams_conducted', 'school_activities', 'student_activities',
            'faculty_fdp_workshop_gl', 'faculty_publications', 'patents',
            'certifications', 'placement_activities', 'courses', 'academic_years',
            'semesters', 'subjects', 'class_groups', 'exam_groups', 'clubs',
        ]
        for t in valid_tables:
            ar = AuditRequest(
                table_name=t, record_id=1, action="UPDATE", old_data={},
                requested_by=self.admin_user,
            )
            ar.full_clean()

    def test_new_data_nullable(self):
        ar = AuditRequest.objects.create(
            table_name="school_activities", record_id=1,
            action="DELETE", old_data={"name": "X"},
            requested_by=self.admin_user,
        )
        self.assertIsNone(ar.new_data)

    def test_school_nullable(self):
        ar = AuditRequest.objects.create(
            table_name="clubs", record_id=1,
            action="UPDATE", old_data={},
            requested_by=self.admin_user,
        )
        self.assertIsNone(ar.school)

    def test_school_cascade_delete(self):
        school2 = School.objects.create(name="Del School", code="DLS")
        ar = AuditRequest.objects.create(
            table_name="clubs", record_id=1, action="UPDATE", old_data={},
            school=school2, requested_by=self.admin_user,
        )
        school2.delete()
        self.assertFalse(AuditRequest.objects.filter(pk=ar.pk).exists())

    def test_requested_by_restrict(self):
        from django.db.models import RestrictedError
        requester = User.objects.create_user(
            username="restr", email="restr@t.com", password="p",
            full_name="Restrict", role="user",
        )
        AuditRequest.objects.create(
            table_name="clubs", record_id=1, action="UPDATE", old_data={},
            requested_by=requester,
        )
        with self.assertRaises(RestrictedError):
            requester.delete()

    def test_reviewed_by_set_null(self):
        reviewer = User.objects.create_user(
            username="reviewer", email="rev@t.com", password="p",
            full_name="Reviewer", role="delete_auth",
        )
        ar = AuditRequest.objects.create(
            table_name="clubs", record_id=1, action="UPDATE", old_data={},
            requested_by=self.admin_user, reviewed_by=reviewer,
            status="approved", reviewed_at=timezone.now(),
        )
        reviewer.delete()
        ar.refresh_from_db()
        self.assertIsNone(ar.reviewed_by)

    def test_ordering_by_requested_at_desc(self):
        ar1 = AuditRequest.objects.create(
            table_name="clubs", record_id=1, action="UPDATE", old_data={},
            requested_by=self.admin_user,
        )
        ar2 = AuditRequest.objects.create(
            table_name="clubs", record_id=2, action="DELETE", old_data={},
            requested_by=self.admin_user,
        )
        audits = list(AuditRequest.objects.all())
        self.assertEqual(audits[0], ar2)

    def test_db_table(self):
        self.assertEqual(AuditRequest._meta.db_table, 'audit_requests')


# ═══════════════════════════════════════════════════════════════════════════════
# SERIALIZER TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class AuditRequestSerializerTests(AuditTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_serialization(self):
        from apps.audit.serializers import AuditRequestSerializer
        ar = AuditRequest.objects.create(
            table_name="school_activities", record_id=1,
            action="UPDATE", old_data={"name": "Old"},
            new_data={"name": "New"}, school=self.school,
            requested_by=self.admin_user,
        )
        ar = AuditRequest.objects.select_related(
            'requested_by__campus', 'reviewed_by__campus',
        ).get(pk=ar.pk)
        data = AuditRequestSerializer(ar).data
        self.assertEqual(data['action'], 'UPDATE')
        self.assertEqual(data['table_name'], 'school_activities')
        self.assertIn('requested_by_detail', data)
        self.assertEqual(data['requested_by_detail']['username'], 'aadmin')
        self.assertIn('old_data', data)
        self.assertIn('new_data', data)


# ═══════════════════════════════════════════════════════════════════════════════
# VIEW / API TESTS
# ═══════════════════════════════════════════════════════════════════════════════

@override_settings(RATELIMIT_ENABLE=False)
class AuditRequestListViewTests(AuditTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()
        self.url = '/api/audit/'

    def test_list_pending_audits(self):
        AuditRequest.objects.create(
            table_name="school_activities", record_id=1,
            action="UPDATE", old_data={}, school=self.school,
            requested_by=self.admin_user,
        )
        AuditRequest.objects.create(
            table_name="school_activities", record_id=2,
            action="DELETE", old_data={}, school=self.school,
            requested_by=self.admin_user, status="approved",
        )
        self.client.force_authenticate(user=self.delete_auth)
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Only pending audits should be returned
        self.assertEqual(resp.data['count'], 1)

    def test_non_delete_auth_denied(self):
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_denied(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(RATELIMIT_ENABLE=False)
class AuditApproveViewTests(AuditTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_approve_delete_action(self):
        """Approving a DELETE audit should set is_deleted=True on the record."""
        activity = SchoolActivity.objects.create(
            school=self.school, name="To Delete", date=date(2025, 1, 1),
            details="d", created_by=self.admin_user,
        )
        ar = AuditRequest.objects.create(
            table_name="school_activities", record_id=activity.pk,
            action="DELETE", old_data={"name": "To Delete"},
            school=self.school, requested_by=self.admin_user,
        )
        activity.pending_audit = ar
        activity.save()

        self.client.force_authenticate(user=self.delete_auth)
        resp = self.client.post(f'/api/audit/{ar.pk}/approve/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        activity.refresh_from_db()
        self.assertTrue(activity.is_deleted)
        self.assertIsNone(activity.pending_audit)

        ar.refresh_from_db()
        self.assertEqual(ar.status, 'approved')
        self.assertEqual(ar.reviewed_by, self.delete_auth)
        self.assertIsNotNone(ar.reviewed_at)

    def test_approve_update_action(self):
        """Approving an UPDATE should apply new_data fields to the record."""
        activity = SchoolActivity.objects.create(
            school=self.school, name="Old Name", date=date(2025, 1, 1),
            details="old details", created_by=self.admin_user,
        )
        ar = AuditRequest.objects.create(
            table_name="school_activities", record_id=activity.pk,
            action="UPDATE", old_data={"name": "Old Name"},
            new_data={"name": "New Name", "details": "new details"},
            school=self.school, requested_by=self.admin_user,
        )
        activity.pending_audit = ar
        activity.save()

        self.client.force_authenticate(user=self.delete_auth)
        resp = self.client.post(f'/api/audit/{ar.pk}/approve/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        activity.refresh_from_db()
        self.assertEqual(activity.name, "New Name")
        self.assertEqual(activity.details, "new details")

    def test_approve_already_reviewed_404(self):
        ar = AuditRequest.objects.create(
            table_name="school_activities", record_id=999,
            action="DELETE", old_data={}, school=self.school,
            requested_by=self.admin_user, status="approved",
        )
        self.client.force_authenticate(user=self.delete_auth)
        resp = self.client.post(f'/api/audit/{ar.pk}/approve/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_approve_unsupported_table_400(self):
        ar = AuditRequest.objects.create(
            table_name="exams_conducted", record_id=1,
            action="DELETE", old_data={}, school=self.school,
            requested_by=self.admin_user,
        )
        self.client.force_authenticate(user=self.delete_auth)
        resp = self.client.post(f'/api/audit/{ar.pk}/approve/')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_delete_auth_denied(self):
        ar = AuditRequest.objects.create(
            table_name="school_activities", record_id=1,
            action="DELETE", old_data={}, school=self.school,
            requested_by=self.admin_user,
        )
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.post(f'/api/audit/{ar.pk}/approve/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class AuditRejectViewTests(AuditTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_reject_clears_pending_audit(self):
        activity = SchoolActivity.objects.create(
            school=self.school, name="To Reject", date=date(2025, 1, 1),
            details="d", created_by=self.admin_user,
        )
        ar = AuditRequest.objects.create(
            table_name="school_activities", record_id=activity.pk,
            action="UPDATE", old_data={"name": "To Reject"},
            school=self.school, requested_by=self.admin_user,
        )
        activity.pending_audit = ar
        activity.save()

        self.client.force_authenticate(user=self.delete_auth)
        resp = self.client.post(f'/api/audit/{ar.pk}/reject/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        activity.refresh_from_db()
        self.assertIsNone(activity.pending_audit)
        self.assertEqual(activity.name, "To Reject")  # Unchanged

        ar.refresh_from_db()
        self.assertEqual(ar.status, 'rejected')


@override_settings(RATELIMIT_ENABLE=False)
class AuditHistoryViewTests(AuditTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_excludes_pending(self):
        AuditRequest.objects.create(
            table_name="school_activities", record_id=1,
            action="UPDATE", old_data={}, school=self.school,
            requested_by=self.admin_user, status="pending",
        )
        AuditRequest.objects.create(
            table_name="school_activities", record_id=2,
            action="DELETE", old_data={}, school=self.school,
            requested_by=self.admin_user, status="approved",
            reviewed_by=self.delete_auth, reviewed_at=timezone.now(),
        )
        self.client.force_authenticate(user=self.delete_auth)
        resp = self.client.get('/api/audit/history/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)

    def test_master_can_access(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get('/api/audit/history/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_super_admin_can_access(self):
        self.client.force_authenticate(user=self.super_admin)
        resp = self.client.get('/api/audit/history/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_admin_denied(self):
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.get('/api/audit/history/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
