"""
Comprehensive tests for the schools app.
Covers: Models, Serializers, Views (API), Utilities.
"""
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.test import APITestCase
from rest_framework import status

from apps.schools.models import Campus, School, UserSchoolMapping
from apps.schools.utils import get_user_school_ids

User = get_user_model()


# ═══════════════════════════════════════════════════════════════════════════════
# MODEL TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class CampusModelTests(TestCase):
    def test_create_campus(self):
        c = Campus.objects.create(name="Main", code="MN", city="CityA")
        self.assertEqual(c.name, "Main")
        self.assertEqual(c.code, "MN")
        self.assertEqual(c.city, "CityA")
        self.assertTrue(c.is_active)
        self.assertIsNotNone(c.created_at)

    def test_str(self):
        c = Campus.objects.create(name="Alpha", code="AL", city="X")
        self.assertEqual(str(c), "Alpha (AL)")

    def test_name_unique(self):
        Campus.objects.create(name="Unique", code="U1", city="X")
        with self.assertRaises(IntegrityError):
            Campus.objects.create(name="Unique", code="U2", city="X")

    def test_code_unique(self):
        Campus.objects.create(name="C1", code="SAME", city="X")
        with self.assertRaises(IntegrityError):
            Campus.objects.create(name="C2", code="SAME", city="X")

    def test_default_is_active_true(self):
        c = Campus.objects.create(name="Active", code="AC", city="X")
        self.assertTrue(c.is_active)

    def test_ordering(self):
        Campus.objects.create(name="Bravo", code="BR", city="X")
        Campus.objects.create(name="Alpha", code="AL", city="X")
        names = list(Campus.objects.values_list('name', flat=True))
        self.assertEqual(names, ["Alpha", "Bravo"])

    def test_db_table(self):
        self.assertEqual(Campus._meta.db_table, 'campuses')


class SchoolModelTests(TestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="S Campus", code="SC", city="X")

    def test_create_school(self):
        s = School.objects.create(campus=self.campus, name="Engineering", code="ENG")
        self.assertEqual(s.campus, self.campus)
        self.assertEqual(s.name, "Engineering")
        self.assertTrue(s.is_active)

    def test_str(self):
        s = School.objects.create(campus=self.campus, name="Science", code="SCI")
        self.assertEqual(str(s), "Science (SCI)")

    def test_school_name_unique(self):
        School.objects.create(campus=self.campus, name="Dup", code="D1")
        with self.assertRaises(IntegrityError):
            School.objects.create(campus=self.campus, name="Dup", code="D2")

    def test_school_code_unique(self):
        School.objects.create(campus=self.campus, name="S1", code="SAME")
        with self.assertRaises(IntegrityError):
            School.objects.create(campus=self.campus, name="S2", code="SAME")

    def test_campus_restrict_delete(self):
        campus2 = Campus.objects.create(name="Restrict", code="RS", city="X")
        School.objects.create(campus=campus2, name="Blocked", code="BL")
        from django.db.models import RestrictedError
        with self.assertRaises(RestrictedError):
            campus2.delete()

    def test_campus_nullable(self):
        s = School.objects.create(name="No Campus", code="NC")
        self.assertIsNone(s.campus)

    def test_reverse_relation(self):
        s = School.objects.create(campus=self.campus, name="Reverse", code="RV")
        self.assertIn(s, self.campus.schools.all())

    def test_ordering(self):
        School.objects.create(campus=self.campus, name="Zeta", code="Z1")
        School.objects.create(campus=self.campus, name="Alpha", code="A1")
        names = list(School.objects.values_list('name', flat=True))
        self.assertEqual(names, ["Alpha", "Zeta"])

    def test_db_table(self):
        self.assertEqual(School._meta.db_table, 'schools')


class UserSchoolMappingModelTests(TestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="M Campus", code="MC", city="X")
        self.school = School.objects.create(campus=self.campus, name="Map School", code="MS")
        self.master = User.objects.create_superuser("mapmaster", "mm@t.com", "p")
        self.user = User.objects.create_user(
            username="mapuser", email="mu@t.com", password="p",
            full_name="Map User", role="user", campus=self.campus,
        )

    def test_create_mapping(self):
        m = UserSchoolMapping.objects.create(
            user=self.user, school=self.school, assigned_by=self.master,
        )
        self.assertEqual(m.user, self.user)
        self.assertEqual(m.school, self.school)
        self.assertEqual(m.assigned_by, self.master)
        self.assertIsNotNone(m.assigned_at)

    def test_str(self):
        m = UserSchoolMapping.objects.create(
            user=self.user, school=self.school, assigned_by=self.master,
        )
        self.assertEqual(str(m), f"mapuser → Map School")

    def test_unique_together(self):
        UserSchoolMapping.objects.create(
            user=self.user, school=self.school, assigned_by=self.master,
        )
        with self.assertRaises(IntegrityError):
            UserSchoolMapping.objects.create(
                user=self.user, school=self.school, assigned_by=self.master,
            )

    def test_user_cascade_delete(self):
        m = UserSchoolMapping.objects.create(
            user=self.user, school=self.school, assigned_by=self.master,
        )
        self.user.delete()
        self.assertFalse(UserSchoolMapping.objects.filter(pk=m.pk).exists())

    def test_school_cascade_delete(self):
        school2 = School.objects.create(name="Del School", code="DS")
        m = UserSchoolMapping.objects.create(
            user=self.user, school=school2, assigned_by=self.master,
        )
        school2.delete()
        self.assertFalse(UserSchoolMapping.objects.filter(pk=m.pk).exists())

    def test_assigned_by_restrict(self):
        assigner = User.objects.create_user(
            username="assigner", email="as@t.com", password="p",
            full_name="Assigner", role="master",
        )
        UserSchoolMapping.objects.create(
            user=self.user, school=self.school, assigned_by=assigner,
        )
        from django.db.models import RestrictedError
        with self.assertRaises(RestrictedError):
            assigner.delete()

    def test_reverse_relations(self):
        m = UserSchoolMapping.objects.create(
            user=self.user, school=self.school, assigned_by=self.master,
        )
        self.assertIn(m, self.user.school_mappings.all())
        self.assertIn(m, self.school.user_mappings.all())
        self.assertIn(m, self.master.assigned_mappings.all())

    def test_db_table(self):
        self.assertEqual(UserSchoolMapping._meta.db_table, 'user_school_mapping')


# ═══════════════════════════════════════════════════════════════════════════════
# UTILITY TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class GetUserSchoolIdsTests(TestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="Util Campus", code="UC", city="X")
        self.school1 = School.objects.create(campus=self.campus, name="Util S1", code="US1")
        self.school2 = School.objects.create(campus=self.campus, name="Util S2", code="US2")
        self.inactive_school = School.objects.create(
            campus=self.campus, name="Inactive", code="IN", is_active=False,
        )
        self.master = User.objects.create_superuser("utilmaster", "um@t.com", "p")

    def test_master_sees_all_schools(self):
        ids = get_user_school_ids(self.master)
        all_ids = list(School.objects.values_list('id', flat=True))
        self.assertEqual(sorted(ids), sorted(all_ids))

    def test_super_admin_sees_campus_active_schools(self):
        sa = User.objects.create_user(
            username="utilsa", email="usa@t.com", password="p",
            full_name="SA", role="super_admin", campus=self.campus,
        )
        ids = get_user_school_ids(sa)
        self.assertIn(self.school1.id, ids)
        self.assertIn(self.school2.id, ids)
        self.assertNotIn(self.inactive_school.id, ids)

    def test_delete_auth_sees_campus_active_schools(self):
        da = User.objects.create_user(
            username="utilda", email="uda@t.com", password="p",
            full_name="DA", role="delete_auth", campus=self.campus,
        )
        ids = get_user_school_ids(da)
        self.assertIn(self.school1.id, ids)
        self.assertNotIn(self.inactive_school.id, ids)

    def test_super_admin_no_campus_empty(self):
        sa = User.objects.create_user(
            username="nocamp_sa", email="ncsa@t.com", password="p",
            full_name="No Camp SA", role="super_admin",
        )
        ids = get_user_school_ids(sa)
        self.assertEqual(ids, [])

    def test_regular_user_via_mapping(self):
        user = User.objects.create_user(
            username="utiluser", email="uu@t.com", password="p",
            full_name="User", role="user", campus=self.campus,
        )
        UserSchoolMapping.objects.create(
            user=user, school=self.school1, assigned_by=self.master,
        )
        ids = get_user_school_ids(user)
        self.assertIn(self.school1.id, ids)
        self.assertNotIn(self.school2.id, ids)

    def test_caching_on_user_object(self):
        ids1 = get_user_school_ids(self.master)
        ids2 = get_user_school_ids(self.master)
        self.assertEqual(ids1, ids2)
        self.assertTrue(hasattr(self.master, '_cached_school_ids'))


# ═══════════════════════════════════════════════════════════════════════════════
# VIEW / API TESTS
# ═══════════════════════════════════════════════════════════════════════════════

@override_settings(RATELIMIT_ENABLE=False)
class CampusListCreateViewTests(APITestCase):
    def setUp(self):
        self.master = User.objects.create_user(
            username="cmaster", email="cm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.admin = User.objects.create_user(
            username="cadmin", email="ca@t.com", password="p",
            full_name="Admin", role="admin",
        )

    def test_list_as_master(self):
        Campus.objects.create(name="List Campus", code="LC", city="X")
        self.client.force_authenticate(user=self.master)
        resp = self.client.get('/api/schools/campuses/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)

    def test_list_denied_for_admin(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get('/api/schools/campuses/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_campus(self):
        self.client.force_authenticate(user=self.master)
        data = {'name': 'New Campus', 'code': 'NC', 'city': 'NewCity'}
        resp = self.client.post('/api/schools/campuses/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Campus.objects.filter(code='NC').exists())

    def test_create_duplicate_code_rejected(self):
        Campus.objects.create(name="Existing", code="EX", city="X")
        self.client.force_authenticate(user=self.master)
        data = {'name': 'Other', 'code': 'EX', 'city': 'Y'}
        resp = self.client.post('/api/schools/campuses/', data)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_denied(self):
        resp = self.client.get('/api/schools/campuses/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(RATELIMIT_ENABLE=False)
class CampusDetailViewTests(APITestCase):
    def setUp(self):
        self.master = User.objects.create_user(
            username="cdmaster", email="cdm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.campus = Campus.objects.create(name="Detail Campus", code="DC", city="X")

    def test_retrieve(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get(f'/api/schools/campuses/{self.campus.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Detail Campus')

    def test_update(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.patch(
            f'/api/schools/campuses/{self.campus.pk}/', {'city': 'UpdatedCity'}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.campus.refresh_from_db()
        self.assertEqual(self.campus.city, 'UpdatedCity')

    def test_destroy_soft_deactivates(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.delete(f'/api/schools/campuses/{self.campus.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.campus.refresh_from_db()
        self.assertFalse(self.campus.is_active)
        self.assertIn('deactivated', resp.data['detail'].lower())


@override_settings(RATELIMIT_ENABLE=False)
class CampusReactivateViewTests(APITestCase):
    def setUp(self):
        self.master = User.objects.create_user(
            username="crmaster", email="crm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.campus = Campus.objects.create(
            name="Reactivate Campus", code="RC", city="X", is_active=False,
        )

    def test_reactivate(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.post(f'/api/schools/campuses/{self.campus.pk}/reactivate/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.campus.refresh_from_db()
        self.assertTrue(self.campus.is_active)

    def test_reactivate_nonexistent(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.post('/api/schools/campuses/99999/reactivate/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


@override_settings(RATELIMIT_ENABLE=False)
class SchoolListCreateViewTests(APITestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="SLC Campus", code="SLC", city="X")
        self.master = User.objects.create_user(
            username="slcmaster", email="slcm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.super_admin = User.objects.create_user(
            username="slcsa", email="slcsa@t.com", password="p",
            full_name="SA", role="super_admin", campus=self.campus,
        )

    def test_master_sees_all_schools(self):
        School.objects.create(campus=self.campus, name="Active School", code="AS")
        School.objects.create(campus=self.campus, name="Inactive School", code="IS", is_active=False)
        self.client.force_authenticate(user=self.master)
        resp = self.client.get('/api/schools/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Master sees all including inactive
        self.assertEqual(resp.data['count'], 2)

    def test_super_admin_sees_only_campus_active(self):
        School.objects.create(campus=self.campus, name="SA Active", code="SAA")
        School.objects.create(campus=self.campus, name="SA Inactive", code="SAI", is_active=False)
        campus2 = Campus.objects.create(name="Other Campus", code="OC", city="Y")
        School.objects.create(campus=campus2, name="Other School", code="OS")
        self.client.force_authenticate(user=self.super_admin)
        resp = self.client.get('/api/schools/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # SA sees only active schools in their campus
        self.assertEqual(resp.data['count'], 1)

    def test_create_school(self):
        self.client.force_authenticate(user=self.master)
        data = {'campus': self.campus.pk, 'name': 'New School', 'code': 'NS'}
        resp = self.client.post('/api/schools/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_user_denied(self):
        user = User.objects.create_user(
            username="slcuser", email="slcu@t.com", password="p",
            full_name="User", role="user",
        )
        self.client.force_authenticate(user=user)
        resp = self.client.get('/api/schools/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class SchoolDetailViewTests(APITestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="SD Campus", code="SD", city="X")
        self.master = User.objects.create_user(
            username="sdmaster", email="sdm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.school = School.objects.create(campus=self.campus, name="Detail School", code="DS")

    def test_retrieve(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get(f'/api/schools/{self.school.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Detail School')

    def test_update(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.patch(f'/api/schools/{self.school.pk}/', {'name': 'Updated School'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.school.refresh_from_db()
        self.assertEqual(self.school.name, 'Updated School')

    def test_destroy_soft_deactivates(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.delete(f'/api/schools/{self.school.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.school.refresh_from_db()
        self.assertFalse(self.school.is_active)


@override_settings(RATELIMIT_ENABLE=False)
class SchoolReactivateViewTests(APITestCase):
    def setUp(self):
        self.master = User.objects.create_user(
            username="srmaster", email="srm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.school = School.objects.create(name="React School", code="RS", is_active=False)

    def test_reactivate(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.post(f'/api/schools/{self.school.pk}/reactivate/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.school.refresh_from_db()
        self.assertTrue(self.school.is_active)


@override_settings(RATELIMIT_ENABLE=False)
class UserSchoolMappingViewTests(APITestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="USM Campus", code="USM", city="X")
        self.school = School.objects.create(campus=self.campus, name="USM School", code="USMS")
        self.master = User.objects.create_user(
            username="usmmaster", email="usmm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.admin = User.objects.create_user(
            username="usmadmin", email="usma@t.com", password="p",
            full_name="Admin", role="admin", campus=self.campus,
        )

    def test_list_mappings(self):
        UserSchoolMapping.objects.create(
            user=self.admin, school=self.school, assigned_by=self.master,
        )
        self.client.force_authenticate(user=self.master)
        resp = self.client.get('/api/schools/assign/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)

    def test_create_mapping(self):
        self.client.force_authenticate(user=self.master)
        data = {'user': self.admin.pk, 'school': self.school.pk}
        resp = self.client.post('/api/schools/assign/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(UserSchoolMapping.objects.filter(
            user=self.admin, school=self.school,
        ).exists())

    def test_duplicate_mapping_rejected(self):
        UserSchoolMapping.objects.create(
            user=self.admin, school=self.school, assigned_by=self.master,
        )
        self.client.force_authenticate(user=self.master)
        data = {'user': self.admin.pk, 'school': self.school.pk}
        resp = self.client.post('/api/schools/assign/', data)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_role_rejected(self):
        """Only admin, user, mis_coordinator can be assigned."""
        sa = User.objects.create_user(
            username="usmsa", email="usmsa@t.com", password="p",
            full_name="SA", role="super_admin", campus=self.campus,
        )
        self.client.force_authenticate(user=self.master)
        data = {'user': sa.pk, 'school': self.school.pk}
        resp = self.client.post('/api/schools/assign/', data)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cross_campus_rejected(self):
        """User and school must be in same campus."""
        campus2 = Campus.objects.create(name="Other C", code="OC", city="Y")
        user2 = User.objects.create_user(
            username="otheruser", email="ou@t.com", password="p",
            full_name="Other", role="user", campus=campus2,
        )
        self.client.force_authenticate(user=self.master)
        data = {'user': user2.pk, 'school': self.school.pk}
        resp = self.client.post('/api/schools/assign/', data)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_mapping(self):
        m = UserSchoolMapping.objects.create(
            user=self.admin, school=self.school, assigned_by=self.master,
        )
        self.client.force_authenticate(user=self.master)
        resp = self.client.delete(f'/api/schools/assign/{m.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UserSchoolMapping.objects.filter(pk=m.pk).exists())


@override_settings(RATELIMIT_ENABLE=False)
class MySchoolsViewTests(APITestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="My Campus", code="MY", city="X")
        self.school = School.objects.create(campus=self.campus, name="My School", code="MYS")
        self.master = User.objects.create_superuser("mymaster", "mym@t.com", "p")
        self.user = User.objects.create_user(
            username="myuser", email="myu@t.com", password="p",
            full_name="My User", role="user", campus=self.campus,
        )
        UserSchoolMapping.objects.create(
            user=self.user, school=self.school, assigned_by=self.master,
        )

    def test_returns_user_schools_no_pagination(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/schools/my-schools/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # No pagination envelope — should be a flat list
        self.assertIsInstance(resp.data, list)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['name'], 'My School')

    def test_unauthenticated_denied(self):
        resp = self.client.get('/api/schools/my-schools/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(RATELIMIT_ENABLE=False)
class CampusSchoolsViewTests(APITestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="CS Campus", code="CS", city="X")
        self.master = User.objects.create_user(
            username="csmaster", email="csm@t.com", password="p",
            full_name="Master", role="master",
        )
        School.objects.create(campus=self.campus, name="CS School 1", code="CSS1")
        School.objects.create(campus=self.campus, name="CS School 2", code="CSS2")
        School.objects.create(campus=self.campus, name="Inactive", code="IN", is_active=False)

    def test_returns_active_schools(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get(f'/api/schools/campuses/{self.campus.pk}/schools/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 2)


@override_settings(RATELIMIT_ENABLE=False)
class CampusUsersSchoolViewTests(APITestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.campus = Campus.objects.create(name="CUS Campus", code="CUS", city="X")
        self.master = User.objects.create_user(
            username="cusmaster", email="cusm@t.com", password="p",
            full_name="Master", role="master",
        )
        User.objects.create_user(
            username="cususer", email="cusu@t.com", password="p",
            full_name="User", role="user", campus=self.campus,
        )

    def test_returns_campus_users(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get(f'/api/schools/campuses/{self.campus.pk}/users/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)


@override_settings(RATELIMIT_ENABLE=False)
class SchoolFacultyViewTests(APITestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.campus = Campus.objects.create(name="Fac Campus", code="FC", city="X")
        self.school = School.objects.create(campus=self.campus, name="Fac School", code="FS")
        self.master = User.objects.create_superuser("facmaster", "fm@t.com", "p")
        self.admin = User.objects.create_user(
            username="facadmin", email="fa@t.com", password="p",
            full_name="Admin", role="admin", campus=self.campus,
        )
        self.faculty = User.objects.create_user(
            username="faculty", email="fac@t.com", password="p",
            full_name="Faculty Member", role="user", campus=self.campus,
        )
        UserSchoolMapping.objects.create(
            user=self.admin, school=self.school, assigned_by=self.master,
        )
        UserSchoolMapping.objects.create(
            user=self.faculty, school=self.school, assigned_by=self.master,
        )

    def test_admin_sees_faculty(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get('/api/schools/faculty/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_user_sees_faculty(self):
        self.client.force_authenticate(user=self.faculty)
        resp = self.client.get('/api/schools/faculty/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_master_denied(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get('/api/schools/faculty/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
