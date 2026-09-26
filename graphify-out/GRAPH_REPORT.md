# Graph Report - nmpralekh  (2026-09-26)

## Corpus Check
- Large corpus: 242 files · ~563,621 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2337 nodes · 6085 edges · 147 communities (82 shown, 65 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 800 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Android API Service Layer
- Django Records Models
- React Frontend Pages
- Android Record Fragments
- Django Records Views
- Django Accounts Models
- Android ApiService Interface
- React Auth & Routing
- React Component Library
- Django School Models
- Django Export Views
- Django Audit Models
- React Dashboard Pages
- Django Records Serializers
- React Admin Pages
- Android Login & Auth Activity
- Django Service Models
- Django Records Tests
- React Hooks & Context
- Android Fragment Navigation
- Django Accounts Tests
- Django Celery Tasks
- Django Export Serializers
- Django Accounts Permissions
- Django School Views
- React API Client Layer
- Django Audit Views
- Django Records Model Tests
- Android Activity Stack
- Android Dashboard Fragment
- Django Permission Classes
- Django Service Bug Reports
- Android Base Fragment Form Builder
- React Master Admin Pages
- Android Home Dashboard
- Android Faculty Autocomplete
- Django User Model Tests
- Django App Config Registry
- Django Certification Tests
- Android Record Fragment Base
- Android Admin Activity
- Android API Client Setup
- React Package Configuration
- Django Service Admin Permissions
- Django Rate Throttling
- Django Error Occurrence Model
- Android Auth & Cookie Management
- Django Audit Index Tests
- Android Patents Fragment
- React Error Boundary & Reporting
- Django URL Configuration
- Django Redis Cache
- Django Audit Model Tests
- Django Service Tests
- Android Test Suite
- Android Record Adapter
- App Branding & Icons
- React Dev Dependencies
- Django Auth Views
- Django Backup Config
- Android Session Manager
- Android Campus Users Fragment
- Android Faculties Fragment
- Android MIS Data Fragment
- React Multi-Person Picker
- React Delete Auth Dashboard
- Django School Tests
- Django Error Fingerprint
- Android Clubs Fragment
- Celery DB Backup Task
- Django Audit Pagination Tests
- Django Export Permission Tests
- Django User-School Mapping Tests
- Django Error Serializer Tests
- Django Settings Configuration
- Django Admin Registration
- Django IsAdmin Permission Tests
- Django Audit Approve Tests
- Django Audit Reject Tests
- Django Export Model Tests
- Module Cluster 80
- Module Cluster 81
- Module Cluster 82
- Module Cluster 83
- Module Cluster 84
- Module Cluster 85
- Module Cluster 86
- Module Cluster 87
- Module Cluster 88
- Module Cluster 89
- Module Cluster 90
- Module Cluster 91
- Module Cluster 92
- Module Cluster 93
- Module Cluster 94
- Module Cluster 95
- Module Cluster 96
- Module Cluster 97
- Module Cluster 98
- Module Cluster 99
- Module Cluster 100
- Module Cluster 101
- Module Cluster 102
- Module Cluster 103
- Module Cluster 104
- Module Cluster 105
- Module Cluster 106
- Module Cluster 107
- Module Cluster 108
- Module Cluster 109
- Module Cluster 110
- Module Cluster 111
- Module Cluster 112
- Module Cluster 113
- Module Cluster 114
- Module Cluster 115
- Module Cluster 116
- Module Cluster 117
- Module Cluster 118
- Module Cluster 119
- Module Cluster 120
- Module Cluster 121
- Module Cluster 122
- Module Cluster 123
- Module Cluster 125
- Module Cluster 126
- Module Cluster 127
- Module Cluster 128
- Module Cluster 129
- Module Cluster 130
- Module Cluster 131
- Module Cluster 133
- Module Cluster 134
- Module Cluster 139

## God Nodes (most connected - your core abstractions)
1. `ApiService` - 67 edges
2. `react` - 59 edges
3. `User` - 59 edges
4. `BaseRecordFragment` - 56 edges
5. `School` - 53 edges
6. `Campus` - 50 edges
7. `api` - 49 edges
8. `RecordTestMixin` - 40 edges
9. `useAuth()` - 37 edges
10. `get_user_school_ids()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `NMPralekh MIS Portal Shield Crest Logo (Web Public Asset)` --semantically_similar_to--> `NMPralekh MIS Portal Shield Crest Logo (Android Drawable)`  [INFERRED] [semantically similar]
  client/public/nmpralekh.png → android-client/app/src/main/res/drawable/nmpralekh.png
- `Multi-Tier Web and Service Architecture` --references--> `Celery 5.6.2`  [INFERRED]
  README.md → server/requirements.txt
- `Multi-Tier Web and Service Architecture` --references--> `Django 6.0.3 Dependency`  [INFERRED]
  README.md → server/requirements.txt
- `Multi-Tier Web and Service Architecture` --references--> `Django REST Framework 3.16.1`  [INFERRED]
  README.md → server/requirements.txt
- `Multi-Tier Web and Service Architecture` --references--> `Gunicorn 25.1.0`  [INFERRED]
  README.md → server/requirements.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Three-Tier Backend Serving and Connection Pipeline** — readme_nginx_reverse_proxy, readme_gunicorn_wsgi_config, readme_pgbouncer_pooling [EXTRACTED 1.00]
- **Audit-Gated Data Modification Workflow** — readme_role_based_access_control, readme_mis_record_modules, readme_audit_workflow [EXTRACTED 1.00]
- **Core Django REST Framework and Async Stack** — server_requirements_django, server_requirements_drf, server_requirements_celery [EXTRACTED 1.00]
- **Android Launcher Icon Multi-Density Asset Suite** — android_client_app_src_main_res_mipmap_mdpi_ic_launcher_icon, android_client_app_src_main_res_mipmap_hdpi_ic_launcher_icon, android_client_app_src_main_res_mipmap_xhdpi_ic_launcher_icon, android_client_app_src_main_res_mipmap_xxhdpi_ic_launcher_icon, android_client_app_src_main_res_mipmap_xxxhdpi_ic_launcher_icon [EXTRACTED 1.00]
- **Android Round Launcher Icon Multi-Density Asset Suite** — android_client_app_src_main_res_mipmap_mdpi_ic_launcher_round_icon, android_client_app_src_main_res_mipmap_hdpi_ic_launcher_round_icon, android_client_app_src_main_res_mipmap_xhdpi_ic_launcher_round_icon, android_client_app_src_main_res_mipmap_xxhdpi_ic_launcher_round_icon, android_client_app_src_main_res_mipmap_xxxhdpi_ic_launcher_round_icon [EXTRACTED 1.00]
- **NMPralekh Portal Institutional Crest Branding Assets** — android_client_app_src_main_res_drawable_nmpralekh_logo, client_public_nmpralekh_logo [EXTRACTED 1.00]

## Communities (147 total, 65 thin omitted)

### Community 0 - "Android API Service Layer"
Cohesion: 0.05
Nodes (22): HttpUser, locust.sh script, random, AdminUser, BaseMISUser, ChronicleMasterUser, DeleteAuthUser, FacultyUser (+14 more)

### Community 1 - "Django Records Models"
Cohesion: 0.08
Nodes (49): AbstractBaseUser, django_celery_beat_models, PermissionsMixin, Meta, User, _append_styled_headers(), build_campus_workbook(), Write a bold + blue header row in write-only mode. (+41 more)

### Community 2 - "React Frontend Pages"
Cohesion: 0.05
Nodes (50): celery_result, django_core_cache, django_http, json, openpyxl, openpyxl_cell, openpyxl_styles, rest_framework_exceptions (+42 more)

### Community 3 - "Android Record Fragments"
Cohesion: 0.10
Nodes (10): ApiService, com.google.gson.JsonObject, DELETE, GET, JsonArray, okhttp3.ResponseBody, POST, PUT (+2 more)

### Community 4 - "Django Records Views"
Cohesion: 0.06
Nodes (40): BasePermission, django_db_models, django_filters_rest_framework, django_ratelimit_decorators, django_utils_decorators, django_views_decorators_csrf, PageNumberPagination, rest_framework (+32 more)

### Community 5 - "Django Accounts Models"
Cohesion: 0.08
Nodes (11): FacultyActivity, Override, CertificationsFragment, Override, FDPFragment, Override, Override, PlacementsFragment (+3 more)

### Community 6 - "Android ApiService Interface"
Cohesion: 0.15
Nodes (30): Badge(), colors, Button(), sizes, variants, ConfirmDialog(), EmptyState(), FormInput() (+22 more)

### Community 7 - "React Auth & Routing"
Cohesion: 0.12
Nodes (35): RoleRedirect(), BugReportButton(), Layout(), roleNavLinks, Sidebar(), ProtectedRoute(), authApi, AuthContext (+27 more)

### Community 8 - "React Component Library"
Cohesion: 0.05
Nodes (11): CampusUsersViewTests, ChronicleMasterManagementViewTests, LoginViewTests, LogoutViewTests, MeViewTests, APITestCase, override_settings, SchoolFacultiesViewTests (+3 more)

### Community 9 - "Django School Models"
Cohesion: 0.08
Nodes (26): IsMaster, Only master login can access (excluding service admin), School, CampusCreateSerializer, CampusSerializer, Meta, Full read — includes nested user and school objects, Write — accepts just IDs (+18 more)

### Community 10 - "Django Export Views"
Cohesion: 0.07
Nodes (25): GeneratedExport, GeneratedExportSerializer, Meta, MISDataRequestSerializer, MISReportSerializer, ensure_export_dir(), export_single_campus(), generate_manual_export() (+17 more)

### Community 11 - "Django Audit Models"
Cohesion: 0.07
Nodes (10): BugReportCreateViewTests, BugReportDetailViewTests, BugReportListViewTests, ErrorTicketDetailViewTests, ErrorTicketListViewTests, ErrorTicketStatusViewTests, APITestCase, override_settings (+2 more)

### Community 12 - "React Dashboard Pages"
Cohesion: 0.06
Nodes (22): django_contrib_auth, django_contrib_auth_models, django_db, django_test, django_utils, hashlib, re, rest_framework_test (+14 more)

### Community 13 - "Django Records Serializers"
Cohesion: 0.08
Nodes (21): ChangePasswordSerializer, ChronicleAccumulatorSerializer, Meta, Used for Admin/SuperAdmin user-visibility views — shows school codes, Used by master to create new users, Used for reading user data — password never included, Used by master to edit existing users, UserCreateSerializer (+13 more)

### Community 14 - "React Admin Pages"
Cohesion: 0.07
Nodes (10): Admin sees all faculty users assigned to their school(s), SchoolFacultiesView, PatentApplicantListCreateView, PublicationAuthorListCreateView, UserSchoolMapping, GetUserSchoolIdsTests, Comprehensive tests for the schools app. Covers: Models, Serializers, Views…, SchoolFacultyViewTests (+2 more)

### Community 15 - "Android Login & Auth Activity"
Cohesion: 0.11
Nodes (13): api, RequestDataModal(), SchoolFacultiesPage(), modules, ApiStatus(), ServiceDashboard(), DashboardHome(), formatBytes() (+5 more)

### Community 16 - "Django Service Models"
Cohesion: 0.17
Nodes (28): adapterview, alertdialog, android.widget.ArrayAdapter, android.widget.CheckBox, android.widget.Filterable, android.widget.ProgressBar, android.widget.Spinner, androidx.recyclerview.widget.RecyclerView (+20 more)

### Community 17 - "Django Records Tests"
Cohesion: 0.11
Nodes (16): ExportHelperFunctionTests, AccumulatorExportView, append_styled_headers(), build_apply_filters(), apply_filters(), ChronicleExportView, CoordinatorExportView, get_scoped_queryset() (+8 more)

### Community 18 - "React Hooks & Context"
Cohesion: 0.12
Nodes (14): IsChronicleMaster, IsMISCoordinatorReadOnly, MIS Coordinator — read-only (GET, HEAD, OPTIONS), Only chronicle master can access, IsAdminOrUserOrSuperAdminOrCoordinatorTests, IsAdminOrUserPermissionTests, IsChronicleMasterPermissionTests, IsDeleteAuthPermissionTests (+6 more)

### Community 19 - "Android Fragment Navigation"
Cohesion: 0.09
Nodes (11): CertificationDetailView, create_audit_request(), FDPDetailView, PatentDetailView, PlacementDetailView, PublicationDetailView, Helper — snapshots old data and creates a pending audit request. Called on…, Mixin that scopes all querysets to the user's assigned schools and excludes… (+3 more)

### Community 20 - "Django Accounts Tests"
Cohesion: 0.10
Nodes (16): Adapter, AuditAdapter, AuditViewHolder, Override, OnAuditActionListener, Override, ViewHolder, FacultyAutoCompleteAdapter (+8 more)

### Community 21 - "Django Celery Tasks"
Cohesion: 0.08
Nodes (17): django_conf, django_db_models_deletion, Migration, Migration, Migration, Migration, Migration, Migration (+9 more)

### Community 22 - "Django Export Serializers"
Cohesion: 0.09
Nodes (11): BackupConfigAPITests, CertificationAPITests, DashboardCountsAPITests, FDPAPITests, PatentAPITests, PlacementAPITests, PublicationAPITests, APITestCase (+3 more)

### Community 23 - "Django Accounts Permissions"
Cohesion: 0.07
Nodes (4): CampusModelTests, TestCase, SchoolModelTests, UserSchoolMappingModelTests

### Community 24 - "Django School Views"
Cohesion: 0.09
Nodes (13): ErrorTicket, One row per unique error. Uniqueness is determined by the fingerprint field,…, ErrorTicketDetailSerializer, ErrorTicketListSerializer, Lightweight serializer used in the ticket list view., Full serializer used in the ticket detail view — includes occurrences., ErrorTicketModelTests, ErrorTicketSerializerTests (+5 more)

### Community 25 - "React API Client Layer"
Cohesion: 0.14
Nodes (16): AISummarizerPage(), PageHeader(), useChronicleExport(), useCoordinatorExport(), DashboardHome(), ExportPage(), FinalizeMISPage(), ReceivedDataPage() (+8 more)

### Community 26 - "Django Audit Views"
Cohesion: 0.08
Nodes (28): Client HTML Document Entry, DOM Root Mount Node, Vite Fast Refresh Plugins, React Vite Template, Native Android Client, Multi-Tier Web and Service Architecture, Audit and Delete Approval Workflow, Automated Test Suite (390 Tests) (+20 more)

### Community 27 - "Django Records Model Tests"
Cohesion: 0.08
Nodes (8): FDPWorkshopGLModelTests, PatentApplicantIndexTests, PatentApplicantTests, PublicationAuthorIndexTests, TestCase, PublicationAuthor must have user and publication indices., PatentApplicant must have user and patent indices., StudentActivityModelTests

### Community 28 - "Android Activity Stack"
Cohesion: 0.22
Nodes (13): RecordAdapter, SessionManager, android.content.SharedPreferences, android.view.MenuItem, androidx.appcompat.app.ActionBarDrawerToggle, androidx.appcompat.app.AppCompatActivity, androidx.fragment.app.Fragment, gravitycompat (+5 more)

### Community 29 - "Android Dashboard Fragment"
Cohesion: 0.18
Nodes (12): DashboardFragment, Override, DeleteAuthDashboardFragment, Override, OnViewAllClickListener, DeleteAuthHistoryFragment, Override, android.os.Bundle (+4 more)

### Community 30 - "Django Permission Classes"
Cohesion: 0.14
Nodes (11): IsAdminOrUser, IsAdminOrUserOrSuperAdminOrCoordinator, Admin, faculty, super admin, or MIS coordinator (read-only) — for record viewing, Admin or faculty user — for record entry endpoints, CertificationListCreateView, FDPListCreateView, InvalidateDashboardCacheMixin, PlacementListCreateView (+3 more)

### Community 31 - "Django Service Bug Reports"
Cohesion: 0.10
Nodes (9): BugReport, Manual report submitted by a user via the "Report a Bug" form. Optionally…, BugReportListSerializer, Meta, BugReportModelTests, BugReportDetailView, BugReportListView, GET /api/service/bug-reports/ (+1 more)

### Community 33 - "React Master Admin Pages"
Cohesion: 0.11
Nodes (16): SearchableSelect(), Assignments(), BackupSettings(), DAYS_OF_WEEK, Campuses(), MasterDashboard(), DashboardHome(), ExportHistory() (+8 more)

### Community 34 - "Android Home Dashboard"
Cohesion: 0.17
Nodes (8): HomeDashboardFragment, Override, OnModuleClickListener, Override, SuperAdminActivity, com.aarushchaudhary.nmpralekh.databinding.ActivitySuperadminBinding, com.aarushchaudhary.nmpralekh.databinding.FragmentHomeDashboardBinding, OnNavigationItemSelectedListener

### Community 35 - "Android Faculty Autocomplete"
Cohesion: 0.16
Nodes (4): FacultyAutoCompleteAdapter, Override, PublicationsFragment, android.widget.Filter

### Community 37 - "Django App Config Registry"
Cohesion: 0.11
Nodes (13): django_apps, AccountsConfig, AppConfig, AuditConfig, AppConfig, ExportConfig, AppConfig, AppConfig (+5 more)

### Community 38 - "Django Certification Tests"
Cohesion: 0.11
Nodes (6): CertificationModelTests, PlacementActivityModelTests, Common setUp for record tests: campus, school, master, admin, faculty, mappings., RecordTestMixin, SchoolActivityModelTests, StudentActivityCollaborationTests

### Community 40 - "Android Admin Activity"
Cohesion: 0.20
Nodes (5): AdminActivity, Override, Override, SchoolActivitiesFragment, com.aarushchaudhary.nmpralekh.databinding.ActivityAdminBinding

### Community 41 - "Android API Client Setup"
Cohesion: 0.12
Nodes (15): ApiClient, cardview, cookiejar, gravity, gridlayout, gsonconverterfactory, hashset, httplogginginterceptor (+7 more)

### Community 42 - "React Package Configuration"
Cohesion: 0.14
Nodes (16): name, private, type, version, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks (+8 more)

### Community 43 - "Django Service Admin Permissions"
Cohesion: 0.14
Nodes (12): IsServiceAdmin, Only service admin can access, IsServiceAdminPermissionTests, TicketStatusUpdateSerializer, ApiStatusView, extract_urls(), ErrorTicketStatusView, APIView (+4 more)

### Community 44 - "Django Rate Throttling"
Cohesion: 0.12
Nodes (12): BaseThrottle, AnonRateThrottle, DashboardThrottle, ExportRateThrottle, FixedWindowThrottle, Seconds until the current fixed window resets., 60 requests / minute for unauthenticated clients, keyed by IP. Protects public…, 30 requests / minute per IP — matches the existing ratelimit decorator on… (+4 more)

### Community 45 - "Django Error Occurrence Model"
Cohesion: 0.14
Nodes (6): ErrorOccurrence, Meta, One row per individual occurrence of an ErrorTicket. Used to build the timeline…, ErrorOccurrenceSerializer, ErrorOccurrenceModelTests, ErrorOccurrenceSerializerTests

### Community 46 - "Android Auth & Cookie Management"
Cohesion: 0.22
Nodes (5): DeleteAuthActivity, Override, DeleteAuthPendingFragment, Override, com.aarushchaudhary.nmpralekh.databinding.ActivityDeleteauthBinding

### Community 47 - "Django Audit Index Tests"
Cohesion: 0.18
Nodes (8): AuditRequestIndexTests, TestCase, AuditRequest.Meta must define the two new composite indices., Index for AuditRequestListView query pattern must be present., Index for AuditHistoryView query pattern must be present., The superseded (status, school) index must no longer exist., The (school, status, requested_at) index must list fields in the correct order…, The (school, status, reviewed_at) index must list fields in the correct order.

### Community 49 - "React Error Boundary & Reporting"
Cohesion: 0.28
Nodes (9): App(), _makeKey(), reportApiError(), _reported, reportError(), _safeSend(), useErrorReporter(), client_src_index (+1 more)

### Community 51 - "Django Redis Cache"
Cohesion: 0.17
Nodes (12): logging, redis, rest_framework_throttling, CoordinatorExportThrottle, _get_redis(), _incr_fixed_window(), apps/accounts/throttles.py Atomic fixed-window rate limiting backed by a single…, 300 requests / minute for authenticated users, keyed by user PK. Covers normal… (+4 more)

### Community 53 - "Django Service Tests"
Cohesion: 0.15
Nodes (6): Tests for the error reporting and deduplication endpoint., Same error reported twice should create 1 ticket with 2 occurrences., Each unique user increments affected_users_count only once., A closed ticket should reopen when same error recurs., ReportErrorView swallows validation errors., ReportErrorViewTests

### Community 54 - "Android Test Suite"
Cohesion: 0.24
Nodes (8): ExampleInstrumentedTest, ExampleUnitTest, androidx.test.ext.junit.runners.AndroidJUnit4, assert, context, instrumentationregistry, org.junit.runner.RunWith, org.junit.Test

### Community 56 - "App Branding & Icons"
Cohesion: 0.23
Nodes (12): NMPralekh MIS Portal Shield Crest Logo (Android Drawable), Android Default Launcher Icon (hdpi), Android Default Round Launcher Icon (hdpi), Android Default Launcher Icon (mdpi), Android Default Round Launcher Icon (mdpi), Android Default Launcher Icon (xhdpi), Android Default Round Launcher Icon (xhdpi), Android Default Launcher Icon (xxhdpi) (+4 more)

### Community 57 - "React Dev Dependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+4 more)

### Community 58 - "Django Auth Views"
Cohesion: 0.26
Nodes (7): LoginView, LogoutView, MeView, APIView, method_decorator, Called automatically when access token expires. Rotates the refresh token on…, RefreshTokenView

### Community 59 - "Django Backup Config"
Cohesion: 0.24
Nodes (6): BackupConfigurationSerializer, BackupConfigurationView, DashboardCountsView, APIView, Sync the BackupConfiguration fields to a django-celery-beat PeriodicTask so…, TriggerManualBackupView

### Community 60 - "Android Session Manager"
Cohesion: 0.24
Nodes (3): Override, LoginActivity, com.aarushchaudhary.nmpralekh.databinding.ActivityLoginBinding

### Community 64 - "React Multi-Person Picker"
Cohesion: 0.22
Nodes (9): emptyPerson, FacultySearchInput(), MultiPersonPicker(), typeOptions, useDebounce(), applicantTypeOptions, empty, statusColor (+1 more)

### Community 65 - "React Delete Auth Dashboard"
Cohesion: 0.24
Nodes (5): DeleteAuthDashboard(), DashboardHome(), History(), statusColor, PendingRequests()

### Community 66 - "Django School Tests"
Cohesion: 0.22
Nodes (5): CampusSchoolsViewTests, CampusUsersSchoolViewTests, APITestCase, override_settings, SchoolReactivateViewTests

### Community 69 - "Celery DB Backup Task"
Cohesion: 0.22
Nodes (7): datetime, os, perform_db_backup(), shared_task, Perform a PostgreSQL backup. scope: 'full' or 'date_range' date_from / date_to:…, subprocess, tempfile

### Community 70 - "Django Audit Pagination Tests"
Cohesion: 0.20
Nodes (4): AuditListPaginationTests, AuditRequestListView must return paginated envelope., count must reflect only pending requests, not approved/rejected., Requests from a different campus must not appear in results. delete_auth is…

### Community 71 - "Django Export Permission Tests"
Cohesion: 0.22
Nodes (4): CoordinatorExportViewTests, ExportHistoryViewTests, APITestCase, override_settings

### Community 72 - "Django User-School Mapping Tests"
Cohesion: 0.20
Nodes (3): Only admin, user, mis_coordinator can be assigned., User and school must be in same campus., UserSchoolMappingViewTests

### Community 73 - "Django Error Serializer Tests"
Cohesion: 0.31
Nodes (5): Incoming payload from the frontend error capture. Handles both JS runtime…, ReportErrorSerializer, ReportErrorSerializerTests, POST /api/service/report-error/ Receives automatic error reports from the React…, ReportErrorView

### Community 74 - "Django Settings Configuration"
Cohesion: 0.22
Nodes (7): celery_schedules, decouple, pathlib, main(), Django's command-line utility for administrative tasks., Run administrative tasks., sys

### Community 76 - "Django IsAdmin Permission Tests"
Cohesion: 0.31
Nodes (4): IsAdmin, Only admin (dean, program chair) can access, IsAdminPermissionTests, ClubListCreateView

### Community 77 - "Django Audit Approve Tests"
Cohesion: 0.22
Nodes (3): AuditApproveViewTests, Approving a DELETE audit should set is_deleted=True on the record., Approving an UPDATE should apply new_data fields to the record.

### Community 78 - "Django Audit Reject Tests"
Cohesion: 0.25
Nodes (4): AuditRejectViewTests, AuditRequestListViewTests, APITestCase, override_settings

### Community 81 - "Module Cluster 81"
Cohesion: 0.25
Nodes (6): Override, MainActivity, edgetoedge, insets, viewcompat, windowinsetscompat

### Community 82 - "Module Cluster 82"
Cohesion: 0.25
Nodes (8): dependencies, axios, @heroicons/react, react, react-dom, react-router-dom, @tanstack/react-query, @vitejs/plugin-react

### Community 83 - "Module Cluster 83"
Cohesion: 0.25
Nodes (6): django_middleware_csrf, drf_spectacular_extensions, OpenApiAuthenticationExtension, rest_framework_simplejwt_authentication, rest_framework_simplejwt_exceptions, CookieJWTAuthenticationScheme

### Community 84 - "Module Cluster 84"
Cohesion: 0.25
Nodes (3): AuditHistoryPaginationTests, AuditHistoryView must return paginated envelope and exclude pending., Pending requests must not appear in history count.

### Community 89 - "Module Cluster 89"
Cohesion: 0.29
Nodes (4): BugReportCreateSerializer, BugReportCreateSerializerTests, BugReportCreateView, POST /api/service/bug-reports/ Any logged-in user can submit a bug report.

### Community 90 - "Module Cluster 90"
Cohesion: 0.43
Nodes (3): IsMasterOrSuperAdmin, Master or super admin, IsMasterOrSuperAdminPermissionTests

### Community 93 - "Module Cluster 93"
Cohesion: 0.29
Nodes (3): CertificationListPaginationTests, Faculty (role='user') should only see certifications they created., CertificationListCreateView must return paginated envelope.

### Community 95 - "Module Cluster 95"
Cohesion: 0.29
Nodes (3): CoApplicantVisibilityTests, Faculty linked via PatentApplicant.user should see the patent., A faculty member NOT linked as a co-applicant must NOT see the patent.

### Community 96 - "Module Cluster 96"
Cohesion: 0.29
Nodes (3): CoAuthorVisibilityTests, Faculty linked via PublicationAuthor.user should see the publication., A faculty member NOT linked as a co-author must NOT see the publication.

### Community 98 - "Module Cluster 98"
Cohesion: 0.29
Nodes (3): SchoolActivityListCreateView must return paginated envelope., Soft-deleted records must NOT appear in the paginated count., SchoolActivityListPaginationTests

### Community 100 - "Module Cluster 100"
Cohesion: 0.47
Nodes (3): IsSuperAdmin, Only super admin can access, IsSuperAdminPermissionTests

### Community 101 - "Module Cluster 101"
Cohesion: 0.47
Nodes (3): IsUser, Only faculty user can access, IsUserPermissionTests

### Community 107 - "Module Cluster 107"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 116 - "Module Cluster 116"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 118 - "Module Cluster 118"
Cohesion: 0.50
Nodes (3): api, axios, axios

### Community 119 - "Module Cluster 119"
Cohesion: 0.50
Nodes (3): ref_fs, vite, @vitejs/plugin-react

## Knowledge Gaps
- **129 isolated node(s):** `client.sh script`, `name`, `private`, `version`, `type` (+124 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 829 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Campus` connect `Django Export Views` to `Django Records Models`, `React Frontend Pages`, `React Component Library`, `Django School Models`, `Django Audit Models`, `React Dashboard Pages`, `Django Records Serializers`, `React Admin Pages`, `React Hooks & Context`, `Django Accounts Permissions`, `Django User Model Tests`, `Django Certification Tests`, `Django School Tests`, `Django Audit Pagination Tests`, `Django User-School Mapping Tests`, `Module Cluster 85`, `Module Cluster 99`, `Module Cluster 106`, `Module Cluster 114`, `Module Cluster 115`, `Module Cluster 126`, `Module Cluster 127`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `School` connect `Django School Models` to `Django Records Models`, `React Frontend Pages`, `Django School Tests`, `Django Records Views`, `Django Audit Pagination Tests`, `Django Certification Tests`, `React Component Library`, `Django User-School Mapping Tests`, `Django Export Views`, `Module Cluster 106`, `React Dashboard Pages`, `Django Records Serializers`, `React Admin Pages`, `Module Cluster 115`, `Django Audit Model Tests`, `Module Cluster 85`, `Django Accounts Permissions`, `Module Cluster 127`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `User` connect `Django Records Models` to `Module Cluster 96`, `Module Cluster 97`, `React Frontend Pages`, `Django Records Views`, `Module Cluster 122`, `Django Certification Tests`, `Django School Models`, `Django Export Views`, `React Dashboard Pages`, `Django Records Serializers`, `React Admin Pages`, `Django Error Occurrence Model`, `Module Cluster 80`, `Django School Views`, `Django Auth Views`, `Module Cluster 123`, `Django Service Bug Reports`, `Module Cluster 95`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `client.sh script`, `name`, `private` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Android API Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.051329622758194186 - nodes in this community are weakly interconnected._
- **Should `Django Records Models` be split into smaller, more focused modules?**
  _Cohesion score 0.07544463568559955 - nodes in this community are weakly interconnected._
- **Should `React Frontend Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.04955570745044429 - nodes in this community are weakly interconnected._