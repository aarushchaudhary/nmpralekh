from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, username, email, password, full_name, role, **extra):
        email = self.normalize_email(email)
        user = self.model(
            username=username,
            email=email,
            full_name=full_name,
            role=role,
            **extra
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password, **extra):
        extra.setdefault('role', 'master')
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        return self.create_user(
            username, email, password,
            full_name='Master Administrator',
            **extra
        )


class User(AbstractBaseUser, PermissionsMixin):
    ROLES = [
        ('master',      'Master'),
        ('super_admin', 'Super Admin'),
        ('admin',       'Admin'),
        ('user',        'User'),
        ('delete_auth', 'Delete Auth'),
    ]

    username    = models.CharField(max_length=100, unique=True)
    email       = models.EmailField(unique=True)
    full_name   = models.CharField(max_length=255)
    role        = models.CharField(max_length=20, choices=ROLES)
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    created_by  = models.ForeignKey(
                    'self',
                    null=True,
                    blank=True,
                    on_delete=models.SET_NULL,
                    related_name='created_users'
                  )
    created_at  = models.DateTimeField(auto_now_add=True)
    last_login  = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD  = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.username} ({self.role})'