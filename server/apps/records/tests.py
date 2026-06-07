"""
Comprehensive tests for the records app.
Covers: All 13 models, Serializers, Views (API), Audit integration, and soft-delete.
"""
from datetime import date
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.test import APITestCase
from rest_framework import status

from apps.schools.models import Campus, School, UserSchoolMapping
from apps.records.models import (
    Club, SchoolActivity, SchoolActivityCollaboration,
    StudentActivity, StudentActivityCollaboration,
    FacultyFDPWorkshopGL, FacultyPublication,
    Patent, Certification, PlacementActivity,
    PublicationAuthor, PatentApplicant, BackupConfiguration,
)

User = get_user_model()


# ═══════════════════════════════════════════════════════════════════════════════
# TEST HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

class RecordTestMixin:
    """Common setUp for record tests: campus, school, master, admin, faculty, mappings."""

    def _setup_base(self):
        self.campus = Campus.objects.create(name="Rec Campus", code="REC", city="X")
        self.school = School.objects.create(campus=self.campus, name="Rec School", code="RS")
        self.school2 = School.objects.create(campus=self.campus, name="Rec School 2", code="RS2")
        self.master = User.objects.create_user(
            username="recmaster", email="rm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.admin_user = User.objects.create_user(
            username="recadmin", email="ra@t.com", password="p",
            full_name="Admin", role="admin", campus=self.campus,
        )
        self.faculty = User.objects.create_user(
            username="recfaculty", email="rf@t.com", password="p",
            full_name="Faculty", role="user", campus=self.campus,
        )
        UserSchoolMapping.objects.create(
            user=self.admin_user, school=self.school, assigned_by=self.master,
        )
        UserSchoolMapping.objects.create(
            user=self.faculty, school=self.school, assigned_by=self.master,
        )


# ═══════════════════════════════════════════════════════════════════════════════
# CLUB MODEL TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class ClubModelTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create_club(self):
        club = Club.objects.create(
            name="Coding Club", type="club", school=self.school,
            created_by=self.admin_user,
        )
        self.assertEqual(club.name, "Coding Club")
        self.assertEqual(club.type, "club")
        self.assertTrue(club.is_active)
        self.assertIsNotNone(club.created_at)
        self.assertIsNotNone(club.updated_at)

    def test_str(self):
        club = Club.objects.create(
            name="Drama", type="committee", school=self.school,
            created_by=self.admin_user,
        )
        self.assertEqual(str(club), "Drama (Committee) — Rec School")

    def test_unique_together(self):
        Club.objects.create(
            name="UniClub", type="club", school=self.school,
            created_by=self.admin_user,
        )
        with self.assertRaises(IntegrityError):
            Club.objects.create(
                name="UniClub", type="club", school=self.school,
                created_by=self.admin_user,
            )

    def test_same_name_different_type_allowed(self):
        Club.objects.create(
            name="Arts", type="club", school=self.school,
            created_by=self.admin_user,
        )
        c = Club.objects.create(
            name="Arts", type="committee", school=self.school,
            created_by=self.admin_user,
        )
        self.assertIsNotNone(c.pk)

    def test_type_choices(self):
        valid_types = ['club', 'committee', 'placecom']
        for t in valid_types:
            c = Club(name=f"T_{t}", type=t, school=self.school, created_by=self.admin_user)
            c.full_clean()  # Should not raise

    def test_ordering(self):
        Club.objects.create(name="Zeta", type="club", school=self.school, created_by=self.admin_user)
        Club.objects.create(name="Alpha", type="club", school=self.school2, created_by=self.admin_user)
        names = list(Club.objects.values_list('name', flat=True))
        self.assertEqual(names, ["Alpha", "Zeta"])


# ═══════════════════════════════════════════════════════════════════════════════
# SCHOOL ACTIVITY TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class SchoolActivityModelTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        sa = SchoolActivity.objects.create(
            school=self.school, name="Annual Day", date=date(2025, 3, 15),
            details="Annual celebration", created_by=self.admin_user,
        )
        self.assertEqual(sa.name, "Annual Day")
        self.assertFalse(sa.is_school_wide)
        self.assertFalse(sa.is_deleted)
        self.assertIsNone(sa.pending_audit)

    def test_str(self):
        sa = SchoolActivity.objects.create(
            school=self.school, name="Sports Day", date=date(2025, 1, 1),
            details="d", created_by=self.admin_user,
        )
        self.assertEqual(str(sa), "Sports Day (Rec School)")

    def test_is_deleted_default_false(self):
        sa = SchoolActivity.objects.create(
            school=self.school, name="Test", date=date(2025, 1, 1),
            details="d", created_by=self.admin_user,
        )
        self.assertFalse(sa.is_deleted)


class SchoolActivityCollaborationTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()
        self.activity = SchoolActivity.objects.create(
            school=self.school, name="Collab Event", date=date(2025, 2, 1),
            details="d", created_by=self.admin_user,
        )

    def test_create(self):
        collab = SchoolActivityCollaboration.objects.create(
            activity=self.activity, collaborating_school=self.school2,
            notes="Joint event",
        )
        self.assertEqual(collab.activity, self.activity)
        self.assertEqual(collab.notes, "Joint event")

    def test_str(self):
        collab = SchoolActivityCollaboration.objects.create(
            activity=self.activity, collaborating_school=self.school2,
        )
        self.assertEqual(str(collab), "Collab Event ↔ Rec School 2")

    def test_unique_together(self):
        SchoolActivityCollaboration.objects.create(
            activity=self.activity, collaborating_school=self.school2,
        )
        with self.assertRaises(IntegrityError):
            SchoolActivityCollaboration.objects.create(
                activity=self.activity, collaborating_school=self.school2,
            )

    def test_cascade_on_activity_delete(self):
        collab = SchoolActivityCollaboration.objects.create(
            activity=self.activity, collaborating_school=self.school2,
        )
        self.activity.delete()
        self.assertFalse(SchoolActivityCollaboration.objects.filter(pk=collab.pk).exists())


# ═══════════════════════════════════════════════════════════════════════════════
# STUDENT ACTIVITY TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class StudentActivityModelTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()
        self.club = Club.objects.create(
            name="TestClub", type="club", school=self.school,
            created_by=self.admin_user,
        )

    def test_create_with_club(self):
        sa = StudentActivity.objects.create(
            school=self.school, name="Hackathon", date=date(2025, 4, 1),
            details="d", club=self.club, club_name="TestClub",
            created_by=self.admin_user,
        )
        self.assertEqual(sa.club, self.club)
        self.assertEqual(sa.club_name, "TestClub")

    def test_str_with_club(self):
        sa = StudentActivity.objects.create(
            school=self.school, name="Workshop", date=date(2025, 4, 1),
            details="d", club_name="Science Club", created_by=self.admin_user,
        )
        self.assertEqual(str(sa), "Workshop by Science Club")

    def test_str_with_conducted_by(self):
        sa = StudentActivity.objects.create(
            school=self.school, name="Talk", date=date(2025, 4, 1),
            details="d", conducted_by="Dr. Smith", created_by=self.admin_user,
        )
        self.assertEqual(str(sa), "Talk by Dr. Smith")

    def test_activity_type_choices(self):
        for t in ['club', 'committee', 'other']:
            sa = StudentActivity(
                school=self.school, name=f"A_{t}", date=date(2025, 1, 1),
                details="d", activity_type=t, created_by=self.admin_user,
            )
            sa.full_clean()


class StudentActivityCollaborationTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()
        self.activity = StudentActivity.objects.create(
            school=self.school, name="StCollab", date=date(2025, 5, 1),
            details="d", created_by=self.admin_user,
        )

    def test_create(self):
        collab = StudentActivityCollaboration.objects.create(
            activity=self.activity, collaborating_club_or_committee="Science Club",
            collaborating_school=self.school2,
        )
        self.assertEqual(collab.collaborating_club_or_committee, "Science Club")

    def test_str(self):
        collab = StudentActivityCollaboration.objects.create(
            activity=self.activity, collaborating_club_or_committee="X",
        )
        self.assertEqual(str(collab), "StCollab collaboration")


# ═══════════════════════════════════════════════════════════════════════════════
# FDP / WORKSHOP / GL TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class FDPWorkshopGLModelTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        fdp = FacultyFDPWorkshopGL.objects.create(
            school=self.school, faculty_name="Dr. Jane",
            date_start=date(2025, 6, 1), name="AI Workshop",
            details="d", type="Workshop", created_by=self.faculty,
        )
        self.assertIsNone(fdp.date_end)
        self.assertIsNone(fdp.organizing_body)
        self.assertFalse(fdp.is_deleted)

    def test_str(self):
        fdp = FacultyFDPWorkshopGL.objects.create(
            school=self.school, faculty_name="Prof. X",
            date_start=date(2025, 6, 1), name="ML Workshop",
            details="d", type="FDP", created_by=self.faculty,
        )
        self.assertEqual(str(fdp), "FDP - ML Workshop (Prof. X)")

    def test_type_choices(self):
        for t in ['FDP', 'Workshop', 'Guest_Lecture']:
            f = FacultyFDPWorkshopGL(
                school=self.school, faculty_name="Test",
                date_start=date(2025, 1, 1), name="N", details="d",
                type=t, created_by=self.faculty,
            )
            f.full_clean()


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLICATION TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class PublicationModelTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        pub = FacultyPublication.objects.create(
            school=self.school, author_name="Dr. Alice",
            title_of_paper="Deep Learning", journal_or_conference_name="IEEE",
            date=date(2025, 7, 1), created_by=self.faculty,
        )
        self.assertEqual(pub.author_type, 'faculty')
        self.assertEqual(pub.doi_or_link, '')
        self.assertTrue(pub.is_own_work)
        self.assertFalse(pub.is_deleted)

    def test_str(self):
        pub = FacultyPublication.objects.create(
            school=self.school, author_name="Dr. Bob",
            title_of_paper="NLP Study", journal_or_conference_name="ACM",
            date=date(2025, 7, 1), created_by=self.faculty,
        )
        self.assertEqual(str(pub), "NLP Study by Dr. Bob")


class PublicationAuthorTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()
        self.pub = FacultyPublication.objects.create(
            school=self.school, author_name="Dr. Main",
            title_of_paper="A Very Important Paper About Something",
            journal_or_conference_name="Nature", date=date(2025, 1, 1),
            created_by=self.faculty,
        )

    def test_create_author(self):
        author = PublicationAuthor.objects.create(
            publication=self.pub, name="Dr. Co-Author",
            author_type="faculty", is_primary=True, order=1,
        )
        self.assertTrue(author.is_primary)
        self.assertEqual(author.order, 1)

    def test_author_linked_to_user(self):
        author = PublicationAuthor.objects.create(
            publication=self.pub, name="Faculty Author",
            user=self.faculty, author_type="faculty",
        )
        self.assertEqual(author.user, self.faculty)

    def test_str(self):
        author = PublicationAuthor.objects.create(
            publication=self.pub, name="Short Name",
        )
        self.assertEqual(str(author), f"Short Name → {self.pub.title_of_paper[:50]}")

    def test_cascade_on_pub_delete(self):
        author = PublicationAuthor.objects.create(
            publication=self.pub, name="Del Author",
        )
        self.pub.delete()
        self.assertFalse(PublicationAuthor.objects.filter(pk=author.pk).exists())

    def test_user_set_null(self):
        author = PublicationAuthor.objects.create(
            publication=self.pub, name="User Author",
            user=self.faculty,
        )
        self.faculty.delete()
        author.refresh_from_db()
        self.assertIsNone(author.user)

    def test_ordering(self):
        PublicationAuthor.objects.create(publication=self.pub, name="B", order=2)
        PublicationAuthor.objects.create(publication=self.pub, name="A", order=1)
        names = list(PublicationAuthor.objects.values_list('name', flat=True))
        self.assertEqual(names, ["A", "B"])

    def test_reverse_relation(self):
        PublicationAuthor.objects.create(publication=self.pub, name="Auth1")
        PublicationAuthor.objects.create(publication=self.pub, name="Auth2")
        self.assertEqual(self.pub.authors.count(), 2)


# ═══════════════════════════════════════════════════════════════════════════════
# PATENT TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class PatentModelTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        pat = Patent.objects.create(
            school=self.school, applicant_name="Dr. Inventor",
            title_of_patent="Smart Device", date_of_publication=date(2025, 8, 1),
            journal_number="J-123", created_by=self.faculty,
        )
        self.assertEqual(pat.patent_status, 'filed')
        self.assertTrue(pat.is_own_work)
        self.assertEqual(pat.doi_or_link, '')

    def test_str(self):
        pat = Patent.objects.create(
            school=self.school, applicant_name="Inventor X",
            title_of_patent="Widget", date_of_publication=date(2025, 8, 1),
            journal_number="J-1", created_by=self.faculty,
        )
        self.assertEqual(str(pat), "Widget (Inventor X)")

    def test_patent_status_choices(self):
        for s in ['filed', 'published', 'granted']:
            p = Patent(
                school=self.school, applicant_name="A",
                title_of_patent="P", date_of_publication=date(2025, 1, 1),
                journal_number="J", patent_status=s, created_by=self.faculty,
            )
            p.full_clean()


class PatentApplicantTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()
        self.patent = Patent.objects.create(
            school=self.school, applicant_name="Main Applicant",
            title_of_patent="Big Invention That Changes Everything",
            date_of_publication=date(2025, 1, 1), journal_number="J-X",
            created_by=self.faculty,
        )

    def test_create(self):
        app = PatentApplicant.objects.create(
            patent=self.patent, name="Co-Applicant", is_primary=False,
        )
        self.assertFalse(app.is_primary)

    def test_str(self):
        app = PatentApplicant.objects.create(
            patent=self.patent, name="App Name",
        )
        self.assertEqual(str(app), f"App Name → {self.patent.title_of_patent[:50]}")

    def test_cascade_on_patent_delete(self):
        app = PatentApplicant.objects.create(patent=self.patent, name="Del")
        self.patent.delete()
        self.assertFalse(PatentApplicant.objects.filter(pk=app.pk).exists())

    def test_reverse_relation(self):
        PatentApplicant.objects.create(patent=self.patent, name="A1")
        PatentApplicant.objects.create(patent=self.patent, name="A2")
        self.assertEqual(self.patent.applicants.count(), 2)


# ═══════════════════════════════════════════════════════════════════════════════
# CERTIFICATION TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class CertificationModelTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        cert = Certification.objects.create(
            school=self.school, date=date(2025, 9, 1), name="John Doe",
            title_of_course="AWS Cloud Practitioner", agency="AWS",
            created_by=self.faculty,
        )
        self.assertEqual(cert.person_type, 'faculty')
        self.assertEqual(cert.credly_or_proof_link, '')
        self.assertFalse(cert.is_deleted)

    def test_str(self):
        cert = Certification.objects.create(
            school=self.school, date=date(2025, 9, 1), name="Jane",
            title_of_course="Azure Fundamentals", agency="Microsoft",
            created_by=self.faculty,
        )
        self.assertEqual(str(cert), "Azure Fundamentals - Jane")


# ═══════════════════════════════════════════════════════════════════════════════
# PLACEMENT ACTIVITY TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class PlacementActivityModelTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        pa = PlacementActivity.objects.create(
            school=self.school, name="Google Hiring", date=date(2025, 10, 1),
            details="d", company_name="Google", created_by=self.admin_user,
        )
        self.assertIsNotNone(pa.pk)
        self.assertFalse(pa.is_deleted)

    def test_str(self):
        pa = PlacementActivity.objects.create(
            school=self.school, name="Amazon Drive", date=date(2025, 10, 1),
            details="d", created_by=self.admin_user,
        )
        self.assertEqual(str(pa), "Amazon Drive (Rec School)")


# ═══════════════════════════════════════════════════════════════════════════════
# BACKUP CONFIGURATION TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class BackupConfigurationModelTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_create(self):
        bc = BackupConfiguration.objects.create(updated_by=self.master)
        self.assertTrue(bc.is_active)
        self.assertEqual(bc.schedule_type, 'weekly')
        self.assertEqual(bc.backup_scope, 'full')
        self.assertIsNone(bc.last_run)
        self.assertIsNone(bc.schedule_day)

    def test_str(self):
        bc = BackupConfiguration.objects.create(
            schedule_type='monthly', backup_scope='date_range',
            updated_by=self.master,
        )
        self.assertEqual(str(bc), "Backup Config (Monthly, Scope: Date Range)")


# ═══════════════════════════════════════════════════════════════════════════════
# SERIALIZER TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class RecordSerializerTests(RecordTestMixin, TestCase):
    def setUp(self):
        self._setup_base()

    def test_club_serializer_school_name(self):
        from apps.records.serializers import ClubSerializer
        club = Club.objects.create(
            name="SerClub", type="club", school=self.school,
            created_by=self.admin_user,
        )
        club = Club.objects.select_related('school').get(pk=club.pk)
        data = ClubSerializer(club).data
        self.assertEqual(data['school_name'], "Rec School")

    def test_student_activity_serializer_auto_club_name(self):
        from apps.records.serializers import StudentActivitySerializer
        club = Club.objects.create(
            name="AutoClub", type="club", school=self.school,
            created_by=self.admin_user,
        )
        from unittest.mock import Mock
        request = Mock()
        request.user = self.faculty
        data = {
            'school': self.school.pk, 'name': 'Evt', 'date': '2025-01-01',
            'details': 'd', 'club': club.pk,
        }
        serializer = StudentActivitySerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        obj = serializer.save()
        self.assertEqual(obj.club_name, "AutoClub")

    def test_publication_author_serializer(self):
        from apps.records.serializers import PublicationAuthorSerializer
        pub = FacultyPublication.objects.create(
            school=self.school, author_name="A", title_of_paper="P",
            journal_or_conference_name="J", date=date(2025, 1, 1),
            created_by=self.faculty,
        )
        author = PublicationAuthor.objects.create(
            publication=pub, name="Author", user=self.faculty,
        )
        author = PublicationAuthor.objects.select_related('user').get(pk=author.pk)
        data = PublicationAuthorSerializer(author).data
        self.assertEqual(data['user_full_name'], "Faculty")


# ═══════════════════════════════════════════════════════════════════════════════
# VIEW / API TESTS
# ═══════════════════════════════════════════════════════════════════════════════

@override_settings(RATELIMIT_ENABLE=False)
class ClubAPITests(RecordTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_list_clubs_as_admin(self):
        Club.objects.create(
            name="API Club", type="club", school=self.school,
            created_by=self.admin_user,
        )
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.get('/api/records/clubs/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_club_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'name': 'New Club', 'type': 'club', 'school': self.school.pk}
        resp = self.client.post('/api/records/clubs/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        club = Club.objects.get(name='New Club')
        self.assertEqual(club.created_by, self.admin_user)

    def test_create_club_as_faculty_denied(self):
        self.client.force_authenticate(user=self.faculty)
        data = {'name': 'Fac Club', 'type': 'club', 'school': self.school.pk}
        resp = self.client.post('/api/records/clubs/', data)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_clubs_as_faculty_allowed(self):
        self.client.force_authenticate(user=self.faculty)
        resp = self.client.get('/api/records/clubs/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_unauthenticated_denied(self):
        resp = self.client.get('/api/records/clubs/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(RATELIMIT_ENABLE=False)
class SchoolActivityAPITests(RecordTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_create_school_activity(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'school': self.school.pk, 'name': 'API Event',
            'date': '2025-03-15', 'details': 'Test event',
        }
        resp = self.client.post('/api/records/school-activities/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        sa = SchoolActivity.objects.get(name='API Event')
        self.assertEqual(sa.created_by, self.admin_user)

    def test_list_activities_super_admin_readonly_coordinator(self):
        SchoolActivity.objects.create(
            school=self.school, name="List Act", date=date(2025, 1, 1),
            details="d", created_by=self.admin_user,
        )
        coordinator = User.objects.create_user(
            username="coord", email="co@t.com", password="p",
            full_name="Coordinator", role="mis_coordinator", campus=self.campus,
        )
        UserSchoolMapping.objects.create(
            user=coordinator, school=self.school, assigned_by=self.master,
        )
        self.client.force_authenticate(user=coordinator)
        resp = self.client.get('/api/records/school-activities/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_update_returns_202_audit(self):
        """Detail views create an audit request instead of directly modifying."""
        sa = SchoolActivity.objects.create(
            school=self.school, name="Audit Test", date=date(2025, 1, 1),
            details="d", created_by=self.admin_user,
        )
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.patch(
            f'/api/records/school-activities/{sa.pk}/',
            {'name': 'Updated Name'},
        )
        # Should return 202 with audit_id
        self.assertEqual(resp.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('audit_id', resp.data)

    def test_delete_returns_202_audit(self):
        sa = SchoolActivity.objects.create(
            school=self.school, name="Del Test", date=date(2025, 1, 1),
            details="d", created_by=self.admin_user,
        )
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.delete(f'/api/records/school-activities/{sa.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_202_ACCEPTED)
        # Record should NOT be hard-deleted
        self.assertTrue(SchoolActivity.objects.filter(pk=sa.pk).exists())


@override_settings(RATELIMIT_ENABLE=False)
class PublicationAPITests(RecordTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_create_publication(self):
        self.client.force_authenticate(user=self.faculty)
        data = {
            'school': self.school.pk, 'author_name': 'Dr. API',
            'title_of_paper': 'API Testing', 'journal_or_conference_name': 'TestConf',
            'date': '2025-07-01',
        }
        resp = self.client.post('/api/records/publications/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_master_denied(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get('/api/records/publications/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class PatentAPITests(RecordTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_create_patent(self):
        self.client.force_authenticate(user=self.faculty)
        data = {
            'school': self.school.pk, 'applicant_name': 'Inv',
            'title_of_patent': 'New Invention', 'date_of_publication': '2025-08-01',
            'journal_number': 'J-001',
        }
        resp = self.client.post('/api/records/patents/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


@override_settings(RATELIMIT_ENABLE=False)
class CertificationAPITests(RecordTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_create_certification(self):
        self.client.force_authenticate(user=self.faculty)
        data = {
            'school': self.school.pk, 'date': '2025-09-01',
            'name': 'Jane Doe', 'title_of_course': 'AWS',
            'agency': 'Amazon',
        }
        resp = self.client.post('/api/records/certifications/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


@override_settings(RATELIMIT_ENABLE=False)
class PlacementAPITests(RecordTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_create_placement(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'school': self.school.pk, 'name': 'TCS Drive',
            'date': '2025-10-01', 'details': 'Campus placement',
            'company_name': 'TCS',
        }
        resp = self.client.post('/api/records/placements/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


@override_settings(RATELIMIT_ENABLE=False)
class FDPAPITests(RecordTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_create_fdp(self):
        self.client.force_authenticate(user=self.faculty)
        data = {
            'school': self.school.pk, 'faculty_name': 'Dr. FDP',
            'date_start': '2025-06-01', 'name': 'AI FDP',
            'details': 'FDP details', 'type': 'FDP',
        }
        resp = self.client.post('/api/records/fdp/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


@override_settings(RATELIMIT_ENABLE=False)
class BackupConfigAPITests(RecordTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_master_can_access_backup_config(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get('/api/records/backup-config/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_admin_denied(self):
        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.get('/api/records/backup-config/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class DashboardCountsAPITests(RecordTestMixin, APITestCase):
    def setUp(self):
        self._setup_base()

    def test_authenticated_user_access(self):
        self.client.force_authenticate(user=self.faculty)
        resp = self.client.get('/api/records/dashboard-counts/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_unauthenticated_denied(self):
        resp = self.client.get('/api/records/dashboard-counts/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
