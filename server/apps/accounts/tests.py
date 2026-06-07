"""
Comprehensive tests for the accounts app.
Covers: Models, UserManager, Serializers, Permissions, Views (API), Authentication.
"""
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from apps.accounts.models import UserManager
from apps.accounts.serializers import (
    UserSerializer, UserVisibilitySerializer, UserCreateSerializer,
    UserUpdateSerializer, LoginSerializer, ChangePasswordSerializer,
    ChronicleAccumulatorSerializer,
)
from apps.accounts.permissions import (
    IsMaster, IsSuperAdmin, IsAdmin, IsUser, IsDeleteAuth,
    IsMasterOrSuperAdmin, IsAdminOrUser, IsAdminOrUserOrSuperAdmin,
    IsAnyRole, IsMISCoordinator, IsMISAccumulator, IsServiceAdmin,
    IsChronicleMaster, IsMISCoordinatorReadOnly,
    IsAdminOrUserOrSuperAdminOrCoordinator,
)
from apps.schools.models import Campus, School, UserSchoolMapping

User = get_user_model()


# ═══════════════════════════════════════════════════════════════════════════════
# MODEL TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class UserModelTests(TestCase):
    """Tests for the custom User model."""

    def setUp(self):
        self.campus = Campus.objects.create(name="Test Campus", code="TC", city="TestCity")

    def test_create_user(self):
        user = User.objects.create_user(
            username="testuser", email="test@example.com",
            password="securepass123", full_name="Test User", role="user",
        )
        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.full_name, "Test User")
        self.assertEqual(user.role, "user")
        self.assertTrue(user.check_password("securepass123"))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_service_admin)
        self.assertFalse(user.is_chronicle_master)
        self.assertIsNone(user.created_by)
        self.assertIsNotNone(user.created_at)

    def test_create_user_normalizes_email(self):
        user = User.objects.create_user(
            username="emailtest", email="Test@EXAMPLE.COM",
            password="pass1234", full_name="Email Test", role="user",
        )
        self.assertEqual(user.email, "Test@example.com")

    def test_create_user_with_campus(self):
        user = User.objects.create_user(
            username="campususer", email="campus@test.com",
            password="pass1234", full_name="Campus User", role="admin",
            campus=self.campus,
        )
        self.assertEqual(user.campus, self.campus)
        self.assertIn(user, self.campus.users.all())

    def test_create_superuser(self):
        su = User.objects.create_superuser(
            username="admin", email="admin@test.com", password="superpass",
        )
        self.assertEqual(su.role, "master")
        self.assertTrue(su.is_staff)
        self.assertTrue(su.is_superuser)
        self.assertEqual(su.full_name, "Master Administrator")

    def test_create_superuser_custom_role(self):
        su = User.objects.create_superuser(
            username="admin2", email="admin2@test.com", password="pass",
            role="master",
        )
        self.assertEqual(su.role, "master")

    def test_str_representation(self):
        user = User.objects.create_user(
            username="strtest", email="str@test.com",
            password="pass1234", full_name="Str Test", role="admin",
        )
        self.assertEqual(str(user), "strtest (admin)")

    def test_username_unique(self):
        User.objects.create_user(
            username="unique", email="u1@test.com",
            password="pass1234", full_name="U1", role="user",
        )
        with self.assertRaises(Exception):
            User.objects.create_user(
                username="unique", email="u2@test.com",
                password="pass1234", full_name="U2", role="user",
            )

    def test_email_unique(self):
        User.objects.create_user(
            username="eu1", email="same@test.com",
            password="pass1234", full_name="U1", role="user",
        )
        with self.assertRaises(Exception):
            User.objects.create_user(
                username="eu2", email="same@test.com",
                password="pass1234", full_name="U2", role="user",
            )

    def test_created_by_relationship(self):
        admin = User.objects.create_superuser("a", "a@t.com", "p")
        child = User.objects.create_user(
            username="child", email="c@t.com", password="p",
            full_name="Child", role="user", created_by=admin,
        )
        self.assertEqual(child.created_by, admin)
        self.assertIn(child, admin.created_users.all())

    def test_created_by_set_null_on_delete(self):
        creator = User.objects.create_user(
            username="creator", email="cr@t.com", password="p",
            full_name="Creator", role="admin",
        )
        child = User.objects.create_user(
            username="child2", email="c2@t.com", password="p",
            full_name="Child2", role="user", created_by=creator,
        )
        creator.delete()
        child.refresh_from_db()
        self.assertIsNone(child.created_by)

    def test_campus_set_null_on_delete(self):
        campus2 = Campus.objects.create(name="Del Campus", code="DC", city="Del")
        user = User.objects.create_user(
            username="delcamp", email="dc@t.com", password="p",
            full_name="Del", role="user", campus=campus2,
        )
        campus2.delete()
        user.refresh_from_db()
        self.assertIsNone(user.campus)

    def test_all_roles(self):
        roles = [r[0] for r in User.ROLES]
        expected = [
            'master', 'super_admin', 'admin', 'user', 'delete_auth',
            'mis_coordinator', 'mis_accumulator', 'chronicle_master', 'service_admin',
        ]
        self.assertEqual(roles, expected)

    def test_username_field(self):
        self.assertEqual(User.USERNAME_FIELD, 'username')

    def test_required_fields(self):
        self.assertEqual(User.REQUIRED_FIELDS, ['email'])

    def test_default_is_active_true(self):
        user = User.objects.create_user(
            username="active", email="act@t.com", password="p",
            full_name="Active", role="user",
        )
        self.assertTrue(user.is_active)

    def test_default_is_staff_false(self):
        user = User.objects.create_user(
            username="staff", email="st@t.com", password="p",
            full_name="Staff", role="user",
        )
        self.assertFalse(user.is_staff)

    def test_db_table_name(self):
        self.assertEqual(User._meta.db_table, 'users')


# ═══════════════════════════════════════════════════════════════════════════════
# PERMISSION TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class PermissionTestBase(TestCase):
    """Base class with helper to create mock request objects."""

    def setUp(self):
        self.campus = Campus.objects.create(name="Perm Campus", code="PC", city="PC")

    def _make_user(self, role, **kwargs):
        import uuid
        uid = uuid.uuid4().hex[:8]
        return User.objects.create_user(
            username=f"u_{uid}", email=f"{uid}@t.com",
            password="p", full_name="Test", role=role, **kwargs,
        )

    def _mock_request(self, user=None):
        from unittest.mock import Mock
        req = Mock()
        req.user = user
        return req


class IsMasterPermissionTests(PermissionTestBase):
    def test_master_allowed(self):
        user = self._make_user("master")
        req = self._mock_request(user)
        self.assertTrue(IsMaster().has_permission(req, None))

    def test_service_admin_with_master_role_denied(self):
        user = self._make_user("master", is_service_admin=True)
        req = self._mock_request(user)
        self.assertFalse(IsMaster().has_permission(req, None))

    def test_non_master_denied(self):
        for role in ['admin', 'user', 'super_admin', 'delete_auth']:
            user = self._make_user(role)
            req = self._mock_request(user)
            self.assertFalse(IsMaster().has_permission(req, None))


class IsSuperAdminPermissionTests(PermissionTestBase):
    def test_super_admin_allowed(self):
        user = self._make_user("super_admin")
        req = self._mock_request(user)
        self.assertTrue(IsSuperAdmin().has_permission(req, None))

    def test_non_super_admin_denied(self):
        user = self._make_user("admin")
        req = self._mock_request(user)
        self.assertFalse(IsSuperAdmin().has_permission(req, None))


class IsAdminPermissionTests(PermissionTestBase):
    def test_admin_allowed(self):
        user = self._make_user("admin")
        req = self._mock_request(user)
        self.assertTrue(IsAdmin().has_permission(req, None))

    def test_non_admin_denied(self):
        user = self._make_user("user")
        req = self._mock_request(user)
        self.assertFalse(IsAdmin().has_permission(req, None))


class IsUserPermissionTests(PermissionTestBase):
    def test_user_allowed(self):
        user = self._make_user("user")
        req = self._mock_request(user)
        self.assertTrue(IsUser().has_permission(req, None))

    def test_admin_denied(self):
        user = self._make_user("admin")
        req = self._mock_request(user)
        self.assertFalse(IsUser().has_permission(req, None))


class IsDeleteAuthPermissionTests(PermissionTestBase):
    def test_delete_auth_allowed(self):
        user = self._make_user("delete_auth")
        req = self._mock_request(user)
        self.assertTrue(IsDeleteAuth().has_permission(req, None))


class IsMasterOrSuperAdminPermissionTests(PermissionTestBase):
    def test_master_allowed(self):
        user = self._make_user("master")
        req = self._mock_request(user)
        self.assertTrue(IsMasterOrSuperAdmin().has_permission(req, None))

    def test_super_admin_allowed(self):
        user = self._make_user("super_admin")
        req = self._mock_request(user)
        self.assertTrue(IsMasterOrSuperAdmin().has_permission(req, None))

    def test_service_admin_denied(self):
        user = self._make_user("master", is_service_admin=True)
        req = self._mock_request(user)
        self.assertFalse(IsMasterOrSuperAdmin().has_permission(req, None))


class IsAdminOrUserPermissionTests(PermissionTestBase):
    def test_admin_allowed(self):
        user = self._make_user("admin")
        req = self._mock_request(user)
        self.assertTrue(IsAdminOrUser().has_permission(req, None))

    def test_user_allowed(self):
        user = self._make_user("user")
        req = self._mock_request(user)
        self.assertTrue(IsAdminOrUser().has_permission(req, None))

    def test_master_denied(self):
        user = self._make_user("master")
        req = self._mock_request(user)
        self.assertFalse(IsAdminOrUser().has_permission(req, None))


class IsServiceAdminPermissionTests(PermissionTestBase):
    def test_service_admin_allowed(self):
        user = self._make_user("service_admin", is_service_admin=True)
        req = self._mock_request(user)
        self.assertTrue(IsServiceAdmin().has_permission(req, None))

    def test_non_service_admin_denied(self):
        user = self._make_user("master")
        req = self._mock_request(user)
        self.assertFalse(IsServiceAdmin().has_permission(req, None))


class IsChronicleMasterPermissionTests(PermissionTestBase):
    def test_chronicle_master_allowed(self):
        user = self._make_user("chronicle_master", is_chronicle_master=True)
        req = self._mock_request(user)
        self.assertTrue(IsChronicleMaster().has_permission(req, None))

    def test_non_chronicle_denied(self):
        user = self._make_user("master")
        req = self._mock_request(user)
        self.assertFalse(IsChronicleMaster().has_permission(req, None))


class IsMISCoordinatorPermissionTests(PermissionTestBase):
    def test_coordinator_allowed(self):
        user = self._make_user("mis_coordinator")
        req = self._mock_request(user)
        self.assertTrue(IsMISCoordinator().has_permission(req, None))


class IsMISAccumulatorPermissionTests(PermissionTestBase):
    def test_accumulator_allowed(self):
        user = self._make_user("mis_accumulator")
        req = self._mock_request(user)
        self.assertTrue(IsMISAccumulator().has_permission(req, None))


class IsMISCoordinatorReadOnlyTests(PermissionTestBase):
    def test_get_allowed(self):
        user = self._make_user("mis_coordinator")
        req = self._mock_request(user)
        req.method = 'GET'
        self.assertTrue(IsMISCoordinatorReadOnly().has_permission(req, None))

    def test_post_denied(self):
        user = self._make_user("mis_coordinator")
        req = self._mock_request(user)
        req.method = 'POST'
        self.assertFalse(IsMISCoordinatorReadOnly().has_permission(req, None))


class IsAdminOrUserOrSuperAdminOrCoordinatorTests(PermissionTestBase):
    def test_admin_full_access(self):
        user = self._make_user("admin")
        req = self._mock_request(user)
        req.method = 'POST'
        self.assertTrue(IsAdminOrUserOrSuperAdminOrCoordinator().has_permission(req, None))

    def test_coordinator_read_only(self):
        user = self._make_user("mis_coordinator")
        req = self._mock_request(user)
        req.method = 'GET'
        self.assertTrue(IsAdminOrUserOrSuperAdminOrCoordinator().has_permission(req, None))
        req.method = 'POST'
        self.assertFalse(IsAdminOrUserOrSuperAdminOrCoordinator().has_permission(req, None))


# ═══════════════════════════════════════════════════════════════════════════════
# SERIALIZER TESTS
# ═══════════════════════════════════════════════════════════════════════════════

class UserSerializerTests(TestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="Ser Campus", code="SC", city="SC")
        self.user = User.objects.create_user(
            username="sertest", email="ser@t.com", password="p",
            full_name="Ser Test", role="admin", campus=self.campus,
        )

    def test_serialized_fields(self):
        data = UserSerializer(self.user).data
        self.assertEqual(data['username'], "sertest")
        self.assertEqual(data['campus_name'], "Ser Campus")
        self.assertNotIn('password', data)
        self.assertIn('id', data)
        self.assertIn('is_service_admin', data)
        self.assertIn('is_chronicle_master', data)

    def test_campus_name_none_when_no_campus(self):
        user = User.objects.create_user(
            username="nocamp", email="nc@t.com", password="p",
            full_name="No Camp", role="user",
        )
        data = UserSerializer(user).data
        self.assertIsNone(data.get('campus_name'))


class UserVisibilitySerializerTests(TestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="Vis Campus", code="VC", city="VC")
        self.school = School.objects.create(campus=self.campus, name="Vis School", code="VS")
        self.master = User.objects.create_superuser("vm", "vm@t.com", "p")
        self.user = User.objects.create_user(
            username="vuser", email="vu@t.com", password="p",
            full_name="Vis User", role="user", campus=self.campus,
        )
        UserSchoolMapping.objects.create(user=self.user, school=self.school, assigned_by=self.master)

    def test_school_code_populated(self):
        # Prefetch to match how the serializer is used in views
        from django.db.models import Prefetch
        user = User.objects.prefetch_related(
            Prefetch('school_mappings', queryset=UserSchoolMapping.objects.select_related('school'))
        ).get(pk=self.user.pk)
        data = UserVisibilitySerializer(user).data
        self.assertEqual(data['school_code'], "VS")

    def test_school_code_empty_when_no_mappings(self):
        user2 = User.objects.create_user(
            username="nomap", email="nm@t.com", password="p",
            full_name="No Map", role="user",
        )
        from django.db.models import Prefetch
        user2 = User.objects.prefetch_related(
            Prefetch('school_mappings', queryset=UserSchoolMapping.objects.select_related('school'))
        ).get(pk=user2.pk)
        data = UserVisibilitySerializer(user2).data
        self.assertEqual(data['school_code'], '')


class UserCreateSerializerTests(TestCase):
    def test_password_min_length(self):
        data = {
            'username': 'shortpw', 'email': 'sp@t.com', 'password': '1234567',
            'full_name': 'Short PW', 'role': 'user',
        }
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)


class LoginSerializerTests(TestCase):
    def test_valid_data(self):
        data = {'username': 'test', 'password': 'secret'}
        serializer = LoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_missing_fields(self):
        serializer = LoginSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
        self.assertIn('password', serializer.errors)


class ChangePasswordSerializerTests(TestCase):
    def test_old_password_validation(self):
        user = User.objects.create_user(
            username="cptest", email="cp@t.com", password="correctpass",
            full_name="CP", role="user",
        )
        from unittest.mock import Mock
        request = Mock()
        request.user = user
        data = {'old_password': 'wrongpass', 'new_password': 'newsecure123'}
        serializer = ChangePasswordSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('old_password', serializer.errors)

    def test_valid_old_password(self):
        user = User.objects.create_user(
            username="cptest2", email="cp2@t.com", password="correctpass",
            full_name="CP", role="user",
        )
        from unittest.mock import Mock
        request = Mock()
        request.user = user
        data = {'old_password': 'correctpass', 'new_password': 'newsecure123'}
        serializer = ChangePasswordSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())


# ═══════════════════════════════════════════════════════════════════════════════
# VIEW / API TESTS
# ═══════════════════════════════════════════════════════════════════════════════

@override_settings(RATELIMIT_ENABLE=False)
class LoginViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="loginuser", email="login@t.com",
            password="testpass123", full_name="Login User", role="user",
        )
        self.url = '/api/auth/login/'

    def test_login_success(self):
        resp = self.client.post(self.url, {'username': 'loginuser', 'password': 'testpass123'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('user', resp.data)
        self.assertEqual(resp.data['user']['username'], 'loginuser')
        self.assertIn('access_token', resp.cookies)
        self.assertIn('refresh_token', resp.cookies)

    def test_login_invalid_credentials(self):
        resp = self.client.post(self.url, {'username': 'loginuser', 'password': 'wrong'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_deactivated_user(self):
        self.user.is_active = False
        self.user.save()
        resp = self.client.post(self.url, {'username': 'loginuser', 'password': 'testpass123'})
        # Django's authenticate returns None for inactive users by default
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_login_missing_fields(self):
        resp = self.client.post(self.url, {})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(RATELIMIT_ENABLE=False)
class LogoutViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="logoutuser", email="logout@t.com",
            password="testpass123", full_name="Logout User", role="user",
        )
        self.url = '/api/auth/logout/'

    def test_logout_authenticated(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.post(self.url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('detail', resp.data)

    def test_logout_unauthenticated(self):
        resp = self.client.post(self.url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(RATELIMIT_ENABLE=False)
class MeViewTests(APITestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="Me Campus", code="ME", city="Me")
        self.user = User.objects.create_user(
            username="meuser", email="me@t.com", password="p",
            full_name="Me User", role="admin", campus=self.campus,
        )

    def test_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['username'], 'meuser')
        self.assertEqual(resp.data['campus_name'], 'Me Campus')

    def test_me_unauthenticated(self):
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(RATELIMIT_ENABLE=False)
class UserListCreateViewTests(APITestCase):
    def setUp(self):
        self.master = User.objects.create_user(
            username="master", email="m@t.com", password="p",
            full_name="Master", role="master",
        )
        self.admin = User.objects.create_user(
            username="admin", email="a@t.com", password="p",
            full_name="Admin", role="admin",
        )

    def test_list_users_as_master(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get('/api/users/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_list_users_as_admin_denied(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get('/api/users/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_user_as_master(self):
        self.client.force_authenticate(user=self.master)
        data = {
            'username': 'newuser', 'email': 'new@t.com',
            'password': 'secure1234', 'full_name': 'New User',
            'role': 'user',
        }
        resp = self.client.post('/api/users/', data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        new_user = User.objects.get(username='newuser')
        self.assertEqual(new_user.created_by, self.master)

    def test_create_user_short_password_rejected(self):
        self.client.force_authenticate(user=self.master)
        data = {
            'username': 'shortpw', 'email': 'sp@t.com',
            'password': 'short', 'full_name': 'Short PW', 'role': 'user',
        }
        resp = self.client.post('/api/users/', data)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(RATELIMIT_ENABLE=False)
class UserDetailViewTests(APITestCase):
    def setUp(self):
        self.master = User.objects.create_user(
            username="master2", email="m2@t.com", password="p",
            full_name="Master", role="master",
        )
        self.target = User.objects.create_user(
            username="target", email="tgt@t.com", password="p",
            full_name="Target", role="user",
        )

    def test_retrieve_user(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get(f'/api/users/{self.target.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['username'], 'target')

    def test_update_user(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.patch(f'/api/users/{self.target.pk}/', {'full_name': 'Updated'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.target.refresh_from_db()
        self.assertEqual(self.target.full_name, 'Updated')

    def test_destroy_soft_deactivates(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.delete(f'/api/users/{self.target.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.target.refresh_from_db()
        self.assertFalse(self.target.is_active)

    def test_cannot_deactivate_self(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.delete(f'/api/users/{self.master.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.master.refresh_from_db()
        self.assertTrue(self.master.is_active)


@override_settings(RATELIMIT_ENABLE=False)
class ServiceUserManagementViewTests(APITestCase):
    def setUp(self):
        self.master = User.objects.create_user(
            username="svcmaster", email="sm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.url = '/api/users/master/service-user/'

    def test_check_service_user_not_exists(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data['exists'])

    def test_create_service_user(self):
        self.client.force_authenticate(user=self.master)
        data = {'username': 'svcadmin', 'email': 'svc@t.com', 'password': 'svcpass123'}
        resp = self.client.post(self.url, data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        svc = User.objects.get(username='svcadmin')
        self.assertTrue(svc.is_service_admin)
        self.assertEqual(svc.role, 'service_admin')

    def test_cannot_create_duplicate_service_user(self):
        self.client.force_authenticate(user=self.master)
        data = {'username': 'svc1', 'email': 'svc1@t.com', 'password': 'svcpass123'}
        self.client.post(self.url, data)
        data2 = {'username': 'svc2', 'email': 'svc2@t.com', 'password': 'svcpass123'}
        resp = self.client.post(self.url, data2)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_service_user_missing_fields(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.post(self.url, {'username': 'x'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_service_user_password(self):
        self.client.force_authenticate(user=self.master)
        User.objects.create_user(
            username="existsvc", email="esvc@t.com", password="old",
            full_name="Service Admin", role="service_admin", is_service_admin=True,
        )
        resp = self.client.patch(self.url, {'password': 'newpass123'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_patch_nonexistent_service_user(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.patch(self.url, {'password': 'newpass123'})
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


@override_settings(RATELIMIT_ENABLE=False)
class ChronicleMasterManagementViewTests(APITestCase):
    def setUp(self):
        self.master = User.objects.create_user(
            username="cmmaster", email="cmm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.url = '/api/users/master/chronicle-master/'

    def test_check_chronicle_not_exists(self):
        self.client.force_authenticate(user=self.master)
        resp = self.client.get(self.url)
        self.assertFalse(resp.data['exists'])

    def test_create_chronicle_master(self):
        self.client.force_authenticate(user=self.master)
        data = {'username': 'chrmaster', 'email': 'chr@t.com', 'password': 'chrpass123'}
        resp = self.client.post(self.url, data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        cm = User.objects.get(username='chrmaster')
        self.assertTrue(cm.is_chronicle_master)
        self.assertEqual(cm.role, 'chronicle_master')

    def test_cannot_create_duplicate_chronicle(self):
        self.client.force_authenticate(user=self.master)
        self.client.post(self.url, {'username': 'c1', 'email': 'c1@t.com', 'password': 'pass1234'})
        resp = self.client.post(self.url, {'username': 'c2', 'email': 'c2@t.com', 'password': 'pass1234'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(RATELIMIT_ENABLE=False)
class SchoolFacultiesViewTests(APITestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="SF Campus", code="SF", city="SF")
        self.school = School.objects.create(campus=self.campus, name="SF School", code="SFS")
        self.master = User.objects.create_user(
            username="sfmaster", email="sfm@t.com", password="p",
            full_name="Master", role="master",
        )
        self.admin = User.objects.create_user(
            username="sfadmin", email="sfa@t.com", password="p",
            full_name="Admin", role="admin", campus=self.campus,
        )
        self.faculty = User.objects.create_user(
            username="sffaculty", email="sff@t.com", password="p",
            full_name="Faculty", role="user", campus=self.campus,
        )
        UserSchoolMapping.objects.create(user=self.admin, school=self.school, assigned_by=self.master)
        UserSchoolMapping.objects.create(user=self.faculty, school=self.school, assigned_by=self.master)

    def test_admin_sees_faculty(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get('/api/users/school-faculties/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_non_admin_denied(self):
        self.client.force_authenticate(user=self.faculty)
        resp = self.client.get('/api/users/school-faculties/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(RATELIMIT_ENABLE=False)
class CampusUsersViewTests(APITestCase):
    def setUp(self):
        self.campus = Campus.objects.create(name="CU Campus", code="CU", city="CU")
        self.super_admin = User.objects.create_user(
            username="cusuper", email="cus@t.com", password="p",
            full_name="Super", role="super_admin", campus=self.campus,
        )
        self.admin = User.objects.create_user(
            username="cuadmin", email="cua@t.com", password="p",
            full_name="Admin", role="admin", campus=self.campus,
        )

    def test_super_admin_sees_campus_users(self):
        self.client.force_authenticate(user=self.super_admin)
        resp = self.client.get('/api/users/campus-users/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_admin_denied(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get('/api/users/campus-users/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
