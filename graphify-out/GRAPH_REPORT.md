# Graph Report - nmpralekh  (2026-11-23)

## Corpus Check
- 228 files · ~98,433 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .xml 33, (none) 6, .properties 3)

## Summary
- 2695 nodes · 7628 edges · 117 communities (51 shown, 66 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 792 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4d74da1a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Android API Service Layer
- records/tests.py
- export/views.py
- Android Record Fragments
- FanOutWriteTests
- FDPFragment
- export/tasks.py
- PageHeader
- LoginViewTests
- records/tests.py
- ErrorTicket
- Django Audit Models
- django_db
- AuditRequestModelTests
- get_user_school_ids
- service/views.py
- AdminActivity.java
- append_safe_row
- RolePermission
- accounts/urls.py
- AuditAdapter.java
- Override
- APITestCase
- SchoolModelTests
- RecordBinder
- TestCase
- Django Audit Views
- BackgroundExportAllTests
- SessionManager
- Override
- DeleteAuthDashboardFragment.java
- BugReport
- .jsonStr
- AuditAdapter
- ErrorTicketStatusView
- Override
- Django User Model Tests
- Django App Config Registry
- records/views.py
- BaseRecordFragment
- CertificationsFragment
- ClubListPaginationTests
- package.json
- ErrorOccurrence
- com.google.gson.JsonElement
- StudentActivitySerializer
- validate_export_params
- AuditRequestIndexTests
- Override
- CertificationListPaginationTests
- PublicationAuthorTests
- ClubModelTests
- CoApplicantVisibilityTests
- AccountIntegrityTests
- CoAuthorVisibilityTests
- FDPListPaginationTests
- SchoolActivityAPITests
- PatentApplicantTests
- BackupConfigurationView
- ApiClient.java
- Android Campus Users Fragment
- Android Faculties Fragment
- ReceivedMISDataFragment
- CoPeopleReplaceTests
- SchoolActivityListPaginationTests
- Campus
- Django Error Fingerprint
- Override
- TrustBoundaryTests
- ReportErrorSerializer
- export/tests.py
- ErrorOccurrenceModelTests
- ServiceUserManagementViewTests
- Django Settings Configuration
- MISReport
- SchoolActivityCollaborationTests
- DashboardCountsCacheTests
- AuditListPaginationTests
- FDPWorkshopGLModelTests
- FacultyUserSearchView
- PlacementListPaginationTests
- accounts/tests.py
- Module Cluster 83
- CampusUsersView
- .onNavigationItemSelected
- ChronicleAccumulatorsView
- LoginDuringRedisOutageTests
- UserCreateSerializer
- throttles.py
- MISDataRequest
- ClubAPITests
- ._setup_base
- FixedWindowThrottle
- PatentListPaginationTests
- UserDetailViewTests
- UserListCreateViewTests
- override_settings
- ChronicleMasterManagementViewTests
- LogoutViewTests
- Module Cluster 132
- APITestCase
- StudentActivityListPaginationTests

## God Nodes (most connected - your core abstractions)
1. `PageHeader()` - 81 edges
2. `Button()` - 72 edges
3. `ApiService` - 66 edges
4. `User` - 63 edges
5. `FormError()` - 61 edges
6. `BaseRecordFragment` - 60 edges
7. `Badge()` - 60 edges
8. `react` - 58 edges
9. `School` - 58 edges
10. `Campus` - 54 edges

## Surprising Connections (you probably didn't know these)
- `Multi-Tier Web and Service Architecture` --references--> `Client HTML Document Entry`  [INFERRED]
  README.md → client/index.html
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
- **Audit-Gated Data Modification Workflow** — readme_role_based_access_control, readme_mis_record_modules, readme_audit_workflow [EXTRACTED 1.00]
- **Core Django REST Framework and Async Stack** — server_requirements_django, server_requirements_drf, server_requirements_celery [EXTRACTED 1.00]
- **Three-Tier Backend Serving and Connection Pipeline** — readme_nginx_reverse_proxy, readme_gunicorn_wsgi_config, readme_pgbouncer_pooling [EXTRACTED 1.00]

## Communities (117 total, 66 thin omitted)

### Community 0 - "Android API Service Layer"
Cohesion: 0.05
Nodes (12): locust.sh script, AdminUser, BaseMISUser, ChronicleMasterUser, DeleteAuthUser, FacultyUser, MasterUser, MISAccumulatorUser (+4 more)

### Community 1 - "records/tests.py"
Cohesion: 0.05
Nodes (46): User, Meta, AuditRequest, Meta, AuditRequestSerializer, Meta, AuditRequestSerializerTests, AuditHistoryView (+38 more)

### Community 2 - "export/views.py"
Cohesion: 0.05
Nodes (27): AccumulatorBulkRequestView, _date_param(), ExportAllView, ExportCertificationsView, ExportDownloadView, ExportFDPView, ExportHistorySerializer, Meta (+19 more)

### Community 4 - "FanOutWriteTests"
Cohesion: 0.19
Nodes (4): ChronicleDashboardTests, FanOutWriteTests, add_campuses(), _queries()

### Community 5 - "FDPFragment"
Cohesion: 0.08
Nodes (9): AdminActivity, BaseAuthActivity, FacultyActivity, FDPFragment, HomeDashboardFragment, OnModuleClickListener, PlacementsFragment, SchoolActivitiesFragment (+1 more)

### Community 6 - "export/tasks.py"
Cohesion: 0.09
Nodes (11): GeneratedExport, Meta, _append_styled_headers(), build_campus_workbook(), ensure_export_dir(), export_all_for_user(), export_single_campus(), generate_manual_export() (+3 more)

### Community 7 - "PageHeader"
Cohesion: 0.05
Nodes (148): api, apiErrors(), App(), RoleRedirect(), BugReportButton(), ErrorBoundary, Layout(), roleNavLinks (+140 more)

### Community 9 - "records/tests.py"
Cohesion: 0.06
Nodes (25): UserSchoolMapping, Meta, CampusCreateSerializer, Meta, CampusSerializer, Meta, SchoolCreateSerializer, Meta (+17 more)

### Community 11 - "Django Audit Models"
Cohesion: 0.05
Nodes (9): BugReportCreateViewTests, BugReportDetailViewTests, BugReportListViewTests, ErrorTicketDetailViewTests, ErrorTicketListViewTests, ErrorTicketStatusViewTests, ReportErrorViewTests, ServiceDashboardStatsViewTests (+1 more)

### Community 12 - "django_db"
Cohesion: 0.04
Nodes (35): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+27 more)

### Community 14 - "get_user_school_ids"
Cohesion: 0.09
Nodes (10): SchoolFacultiesView, PatentApplicantSerializer, Meta, PatentApplicantDetailView, PatentApplicantListCreateView, PublicationAuthorDetailView, PublicationAuthorListCreateView, replace_people() (+2 more)

### Community 15 - "service/views.py"
Cohesion: 0.10
Nodes (13): ErrorTicket, Meta, BugReportAdminUpdateSerializer, Meta, ErrorTicketDetailSerializer, Meta, ErrorTicketListSerializer, Meta (+5 more)

### Community 17 - "append_safe_row"
Cohesion: 0.15
Nodes (8): append_safe_row(), AccumulatorExportView, append_styled_headers(), build_apply_filters(), apply_filters(), ChronicleExportView, CoordinatorExportView, get_scoped_queryset()

### Community 18 - "RolePermission"
Cohesion: 0.08
Nodes (16): RolePermission(), IsAdminOrUserOrSuperAdminOrCoordinatorTests, IsAdminOrUserPermissionTests, IsAdminPermissionTests, IsChronicleMasterPermissionTests, IsDeleteAuthPermissionTests, IsMasterOrSuperAdminPermissionTests, IsMasterPermissionTests (+8 more)

### Community 19 - "accounts/urls.py"
Cohesion: 0.10
Nodes (6): AccumulatorCoordinatorsView, ChronicleMasterManagementView, LogoutView, MeView, RefreshTokenView, ServiceUserManagementView

### Community 21 - "Override"
Cohesion: 0.23
Nodes (4): Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 22 - "APITestCase"
Cohesion: 0.08
Nodes (10): BackupConfigAPITests, CertificationAPITests, DashboardCountsAPITests, FDPAPITests, FDPDateRangeTests, PatentAPITests, PlacementAPITests, PublicationAPITests (+2 more)

### Community 23 - "SchoolModelTests"
Cohesion: 0.07
Nodes (3): CampusModelTests, SchoolModelTests, UserSchoolMappingModelTests

### Community 24 - "RecordBinder"
Cohesion: 0.12
Nodes (8): BadgeStyle, DARK, GRAY, OUTLINE, RED, OnRecordActionListener, RecordBinder, RecordAdapter.RecordBinder

### Community 25 - "TestCase"
Cohesion: 0.07
Nodes (6): PatentApplicantIndexTests, PatentModelTests, PublicationAuthorIndexTests, PublicationModelTests, SchoolActivityModelTests, StudentActivityCollaborationTests

### Community 26 - "Django Audit Views"
Cohesion: 0.09
Nodes (26): Client HTML Document Entry, DOM Root Mount Node, Native Android Client, Multi-Tier Web and Service Architecture, Audit and Delete Approval Workflow, Automated Test Suite (390 Tests), Gunicorn WSGI Concurrency Configuration, Locust Multi-Role Load Testing (+18 more)

### Community 29 - "Override"
Cohesion: 0.20
Nodes (5): Callback<JsonObject>, Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 30 - "DeleteAuthDashboardFragment.java"
Cohesion: 0.18
Nodes (3): DeleteAuthDashboardFragment, DeleteAuthHistoryFragment, DeleteAuthPendingFragment

### Community 31 - "BugReport"
Cohesion: 0.09
Nodes (7): BugReport, Meta, BugReportListSerializer, Meta, BugReportModelTests, BugReportDetailView, BugReportListView

### Community 32 - ".jsonStr"
Cohesion: 0.13
Nodes (5): RecordAdapter.RecordBinder, StudentActivitiesFragment, AdapterView.OnItemSelectedListener, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 33 - "AuditAdapter"
Cohesion: 0.19
Nodes (4): AuditAdapter, AuditViewHolder, OnAuditActionListener, OnViewAllClickListener

### Community 34 - "ErrorTicketStatusView"
Cohesion: 0.25
Nodes (3): ApiStatusView, extract_urls(), ServiceDashboardStatsView

### Community 35 - "Override"
Cohesion: 0.08
Nodes (8): FacultyAutoCompleteAdapter, Filter, PublicationsFragment, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonElement>, android.text.TextWatcher, Callback<JsonObject>

### Community 37 - "Django App Config Registry"
Cohesion: 0.11
Nodes (6): AccountsConfig, AuditConfig, ExportConfig, RecordsConfig, SchoolsConfig, ServiceConfig

### Community 38 - "records/views.py"
Cohesion: 0.05
Nodes (35): ExportHistoryView, CertificationSerializer, Meta, FacultyFDPWorkshopGLSerializer, Meta, FacultyPublicationSerializer, Meta, PatentSerializer (+27 more)

### Community 39 - "BaseRecordFragment"
Cohesion: 0.08
Nodes (7): BaseRecordFragment, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<List<JsonObject>>, RecordAdapter.OnRecordActionListener, Callback<JsonObject>

### Community 40 - "CertificationsFragment"
Cohesion: 0.10
Nodes (3): CertificationsFragment, RecordAdapter.RecordBinder, RecordAdapter.RecordBinder

### Community 42 - "package.json"
Cohesion: 0.05
Nodes (44): author, dependencies, axios, @heroicons/react, react, react-dom, react-router-dom, devDependencies (+36 more)

### Community 43 - "ErrorOccurrence"
Cohesion: 0.24
Nodes (5): ErrorOccurrence, Meta, ErrorOccurrenceSerializer, Meta, ErrorOccurrenceSerializerTests

### Community 44 - "com.google.gson.JsonElement"
Cohesion: 0.20
Nodes (3): Callback<JsonObject>, Callback<JsonElement>, Callback<List<JsonObject>>

### Community 45 - "StudentActivitySerializer"
Cohesion: 0.18
Nodes (7): ClubSerializer, Meta, PublicationAuthorSerializer, Meta, StudentActivitySerializer, Meta, RecordSerializerTests

### Community 48 - "Override"
Cohesion: 0.08
Nodes (8): FacultyAutoCompleteAdapter, Filter, PatentsFragment, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonElement>, android.text.TextWatcher, Callback<JsonObject>

### Community 59 - "BackupConfigurationView"
Cohesion: 0.10
Nodes (13): AuditApproveView, AuditRejectView, _lock_pending_audit(), _not_found(), _counts_key(), get_dashboard_counts(), invalidate_dashboard_cache(), _stamp_key() (+5 more)

### Community 60 - "ApiClient.java"
Cohesion: 0.09
Nodes (3): ApiClient, CookieJar, TokenUsed

### Community 66 - "Campus"
Cohesion: 0.05
Nodes (13): Campus, Meta, CampusDetailViewTests, CampusListCreateViewTests, CampusReactivateViewTests, CampusSchoolsViewTests, CampusUsersSchoolViewTests, MySchoolsViewTests (+5 more)

### Community 68 - "Override"
Cohesion: 0.14
Nodes (5): ClubsFragment, Callback<JsonObject>, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 70 - "ReportErrorSerializer"
Cohesion: 0.31
Nodes (3): ReportErrorSerializer, ReportErrorSerializerTests, ReportErrorView

### Community 71 - "export/tests.py"
Cohesion: 0.04
Nodes (12): CoordinatorExportViewTests, ExportHistoryViewTests, ExportSchoolActivitiesViewTests, ExportTestMixin, GeneratedExportModelTests, IntegrityRuleTests, MISDataRequestSerializerTests, MISDataRequestViewTests (+4 more)

### Community 72 - "ErrorOccurrenceModelTests"
Cohesion: 0.12
Nodes (5): BugReportCreateSerializer, Meta, BugReportCreateSerializerTests, ErrorOccurrenceModelTests, BugReportCreateView

### Community 75 - "MISReport"
Cohesion: 0.13
Nodes (7): ChronicleDataRequest, Meta, MISReport, Meta, AccumulatorDashboardTests, AccumulatorDashboardView, ChronicleDashboardView

### Community 78 - "AuditListPaginationTests"
Cohesion: 0.05
Nodes (9): AuditApproveViewTests, AuditHistoryPaginationTests, AuditHistoryViewTests, AuditListPaginationTests, AuditRejectViewTests, AuditRequestListViewTests, AuditRowLockTests, AuditTestMixin (+1 more)

### Community 82 - "accounts/tests.py"
Cohesion: 0.06
Nodes (14): UserManager, ChronicleAccumulatorSerializer, Meta, UserSerializer, Meta, UserUpdateSerializer, Meta, UserVisibilitySerializer (+6 more)

### Community 88 - "UserCreateSerializer"
Cohesion: 0.19
Nodes (6): LoginSerializer, UserCreateSerializer, Meta, LoginSerializerTests, UserCreateSerializerTests, UserListCreateView

### Community 92 - "throttles.py"
Cohesion: 0.22
Nodes (6): _get_redis(), _incr_fixed_window(), local_one_per_second(), redis_available(), LoginView, _too_fast()

### Community 99 - "MISDataRequest"
Cohesion: 0.07
Nodes (12): MISDataRequest, Meta, check_date_order(), ChronicleDataRequestSerializer, Meta, MISDataRequestSerializer, Meta, MISReportSerializer (+4 more)

### Community 104 - "._setup_base"
Cohesion: 0.09
Nodes (4): BackupConfigurationModelTests, CertificationModelTests, PlacementActivityModelTests, StudentActivityModelTests

## Knowledge Gaps
- **22 isolated node(s):** `DARK`, `OUTLINE`, `RED`, `GRAY`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 895 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **66 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Campus` connect `Campus` to `records/tests.py`, `export/views.py`, `Django User Model Tests`, `APITestCase`, `export/tasks.py`, `export/tests.py`, `FanOutWriteTests`, `records/tests.py`, `Django Audit Models`, `AuditListPaginationTests`, `get_user_school_ids`, `accounts/tests.py`, `RolePermission`, `SchoolModelTests`, `AccountIntegrityTests`, `APITestCase`, `override_settings`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `DARK`, `OUTLINE`, `RED` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Android API Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.05304982817869416 - nodes in this community are weakly interconnected._
- **Why does `User` connect `records/tests.py` to `export/views.py`, `export/tasks.py`, `records/tests.py`, `get_user_school_ids`, `service/views.py`, `accounts/urls.py`, `APITestCase`, `BugReport`, `records/views.py`, `ErrorOccurrence`, `PublicationAuthorTests`, `CoApplicantVisibilityTests`, `CoAuthorVisibilityTests`, `SchoolActivityAPITests`, `CoPeopleReplaceTests`, `export/tests.py`, `MISReport`, `FacultyUserSearchView`, `accounts/tests.py`, `CampusUsersView`, `ChronicleAccumulatorsView`, `UserCreateSerializer`, `MISDataRequest`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `records/tests.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05236091631603553 - nodes in this community are weakly interconnected._
- **Why does `School` connect `records/tests.py` to `export/views.py`, `Campus`, `export/tasks.py`, `export/tests.py`, `records/views.py`, `records/tests.py`, `AuditRequestModelTests`, `AuditListPaginationTests`, `DashboardCountsCacheTests`, `get_user_school_ids`, `accounts/tests.py`, `SchoolModelTests`, `AccountIntegrityTests`, `APITestCase`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `export/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.046536224219989424 - nodes in this community are weakly interconnected._