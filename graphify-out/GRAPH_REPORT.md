# Graph Report - nmpralekh  (2026-11-23)

## Corpus Check
- 235 files · ~103,450 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .xml 33, (none) 6, .properties 3)

## Summary
- 2785 nodes · 7911 edges · 140 communities (51 shown, 89 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 799 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b31c2cbb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Android API Service Layer
- ApiClientTest.java
- export/views.py
- Android Record Fragments
- FanOutWriteTests
- FDPFragment
- records/views.py
- PageHeader
- LoginViewTests
- records/tests.py
- ErrorTicket
- Django Audit Models
- django_db
- Override
- get_user_school_ids
- service/views.py
- AdminActivity.java
- append_safe_row
- RolePermission
- SchoolActivitiesFragment
- BaseRecordFragment.java
- AuditRequestListViewTests
- APITestCase
- SchoolModelTests
- RecordBinder
- .post
- Django Audit Views
- BackgroundExportAllTests
- SessionManager
- Override
- DeleteAuthDashboardFragment.java
- service/views.py
- .jsonStr
- AuditAdapter
- PublicationAuthorTests
- Override
- Django User Model Tests
- Django App Config Registry
- APIView
- BaseRecordFragment
- CertificationsFragment
- ClubListPaginationTests
- package.json
- ErrorOccurrence
- Override
- throttles.py
- AuditRequestIndexTests
- Override
- CertificationListPaginationTests
- AuditRequestModelTests
- ChronicleMasterManagementView
- CoApplicantVisibilityTests
- AccountIntegrityTests
- confirm_own_password
- FDPListPaginationTests
- SchoolActivityAPITests
- records/views.py
- BackupConfigurationView
- ApiClient.java
- Android Campus Users Fragment
- Android Faculties Fragment
- ReceivedMISDataFragment
- AuditListPaginationTests
- SchoolActivityListPaginationTests
- UserSchoolMappingViewTests
- Django Error Fingerprint
- Override
- TrustBoundaryTests
- ReportErrorSerializer
- ExportTestMixin
- BugReportModelTests
- ServiceUserManagementViewTests
- Django Settings Configuration
- AuditApproveViewTests
- TestCase
- DashboardCountsCacheTests
- AuditHistoryPaginationTests
- ClubModelTests
- ClubAuditFlowTests
- PlacementListPaginationTests
- accounts/views.py
- Module Cluster 83
- PublicationListPaginationTests
- CoAuthorVisibilityTests
- LoginDuringRedisOutageTests
- AuditHistoryViewTests
- PatentApplicantTests
- ViewHolder
- FDPWorkshopGLModelTests
- PublicationAuthorIndexTests
- ReportErrorViewTests
- FDPFragment
- SchoolActivityModelTests
- .test_query_count_does_not_grow_with_children
- CoPeopleApprovalTests
- ExportTestMixin
- ._setup_base
- GeneratedExportModelTests
- IntegrityRuleTests
- ChangePasswordTests
- UserReactivateTests
- AccumulatorDashboardTests
- MISReportViewTests
- NewExportEndpointsTests
- UserDetailViewTests
- UserListCreateViewTests
- ErrorOccurrenceModelTests
- ResetPasswordTests
- override_settings
- ChronicleMasterManagementViewTests
- LogoutViewTests
- CampusListCreateViewTests
- Module Cluster 132
- APITestCase
- ChronicleDashboardTests
- SchoolListCreateViewTests
- CampusDetailViewTests
- CampusReactivateViewTests
- SchoolDetailViewTests
- override_settings
- APITestCase
- MySchoolsViewTests
- SchoolReactivateViewTests
- export/tasks.py

## God Nodes (most connected - your core abstractions)
1. `Button()` - 82 edges
2. `PageHeader()` - 81 edges
3. `FormError()` - 67 edges
4. `ApiService` - 66 edges
5. `User` - 65 edges
6. `BaseRecordFragment` - 61 edges
7. `react` - 61 edges
8. `Badge()` - 60 edges
9. `School` - 59 edges
10. `Campus` - 55 edges

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

## Communities (140 total, 89 thin omitted)

### Community 0 - "Android API Service Layer"
Cohesion: 0.05
Nodes (12): locust.sh script, AdminUser, BaseMISUser, ChronicleMasterUser, DeleteAuthUser, FacultyUser, MasterUser, MISAccumulatorUser (+4 more)

### Community 1 - "ApiClientTest.java"
Cohesion: 0.08
Nodes (3): ApiClientTest, Dispatcher, ErrorMessageTest

### Community 2 - "export/views.py"
Cohesion: 0.04
Nodes (35): ChronicleDataRequest, Meta, MISDataRequest, Meta, MISReport, Meta, check_date_order(), ChronicleDataRequestSerializer (+27 more)

### Community 4 - "FanOutWriteTests"
Cohesion: 0.33
Nodes (3): FanOutWriteTests, add_campuses(), _queries()

### Community 5 - "FDPFragment"
Cohesion: 0.08
Nodes (7): AdminActivity, BaseAuthActivity, retrofit2.Callback<com.google.gson.JsonObject>, FacultyActivity, HomeDashboardFragment, OnModuleClickListener, SuperAdminActivity

### Community 6 - "records/views.py"
Cohesion: 0.05
Nodes (24): ExportHistoryView, FacultyFDPWorkshopGLSerializer, Meta, AuditedDetailMixin, CertificationDetailView, CertificationListCreateView, check_school(), ClubDetailView (+16 more)

### Community 7 - "PageHeader"
Cohesion: 0.05
Nodes (155): api, apiErrors(), App(), RoleRedirect(), BugReportButton(), ErrorBoundary, Layout(), roleNavLinks (+147 more)

### Community 9 - "records/tests.py"
Cohesion: 0.05
Nodes (33): AuditRejectViewTests, AuditRowLockTests, AuditTestMixin, TriggerManualExportView, Campus, Meta, School, Meta (+25 more)

### Community 10 - "ErrorTicket"
Cohesion: 0.18
Nodes (3): ErrorTicket, Meta, ErrorTicketModelTests

### Community 11 - "Django Audit Models"
Cohesion: 0.07
Nodes (8): BugReportCreateViewTests, BugReportDetailViewTests, BugReportListViewTests, ErrorTicketDetailViewTests, ErrorTicketListViewTests, ErrorTicketStatusViewTests, ServiceDashboardStatsViewTests, ServiceTestMixin

### Community 12 - "django_db"
Cohesion: 0.04
Nodes (36): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+28 more)

### Community 13 - "Override"
Cohesion: 0.23
Nodes (4): Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 14 - "get_user_school_ids"
Cohesion: 0.09
Nodes (7): SchoolFacultiesView, DashboardCountsView, PatentApplicantListCreateView, PublicationAuthorListCreateView, GetUserSchoolIdsTests, get_user_school_ids(), SchoolFacultyView

### Community 15 - "service/views.py"
Cohesion: 0.12
Nodes (7): ErrorTicketDetailSerializer, Meta, ErrorTicketListSerializer, Meta, ErrorTicketSerializerTests, ErrorTicketDetailView, ErrorTicketListView

### Community 17 - "append_safe_row"
Cohesion: 0.08
Nodes (15): append_safe_row(), ExportHelperFunctionTests, AccumulatorExportView, append_styled_headers(), build_apply_filters(), apply_filters(), ChronicleExportView, CoordinatorExportView (+7 more)

### Community 18 - "RolePermission"
Cohesion: 0.09
Nodes (15): RolePermission(), IsAdminOrUserOrSuperAdminOrCoordinatorTests, IsAdminOrUserPermissionTests, IsAdminPermissionTests, IsChronicleMasterPermissionTests, IsDeleteAuthPermissionTests, IsMasterOrSuperAdminPermissionTests, IsMasterPermissionTests (+7 more)

### Community 20 - "BaseRecordFragment.java"
Cohesion: 0.15
Nodes (3): DeleteAuthHistoryFragment, Callback<JsonObject>, DeleteAuthPendingFragment

### Community 22 - "APITestCase"
Cohesion: 0.07
Nodes (11): BackupConfigAPITests, CertificationAPITests, DashboardCountsAPITests, FDPAPITests, FDPDateRangeTests, PatentAPITests, PatentListPaginationTests, PlacementAPITests (+3 more)

### Community 23 - "SchoolModelTests"
Cohesion: 0.07
Nodes (3): CampusModelTests, SchoolModelTests, UserSchoolMappingModelTests

### Community 25 - ".post"
Cohesion: 0.44
Nodes (5): local_one_per_second(), redis_available(), LoginView, set_auth_cookies(), _too_fast()

### Community 26 - "Django Audit Views"
Cohesion: 0.09
Nodes (26): Client HTML Document Entry, DOM Root Mount Node, Native Android Client, Multi-Tier Web and Service Architecture, Audit and Delete Approval Workflow, Automated Test Suite (390 Tests), Gunicorn WSGI Concurrency Configuration, Locust Multi-Role Load Testing (+18 more)

### Community 29 - "Override"
Cohesion: 0.20
Nodes (5): Callback<JsonObject>, Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 30 - "DeleteAuthDashboardFragment.java"
Cohesion: 0.23
Nodes (3): DeleteAuthActivity, DeleteAuthDashboardFragment, OnViewAllClickListener

### Community 31 - "service/views.py"
Cohesion: 0.09
Nodes (13): BugReport, Meta, BugReportAdminUpdateSerializer, Meta, BugReportListSerializer, Meta, TicketStatusUpdateSerializer, ApiStatusView (+5 more)

### Community 32 - ".jsonStr"
Cohesion: 0.12
Nodes (5): StudentActivitiesFragment, AdapterView.OnItemSelectedListener, RecordAdapter.RecordBinder, Callback<JsonObject>, JsonHelpersTest

### Community 33 - "AuditAdapter"
Cohesion: 0.20
Nodes (3): AuditAdapter, AuditViewHolder, OnAuditActionListener

### Community 35 - "Override"
Cohesion: 0.12
Nodes (5): FacultyAutoCompleteAdapter, Filter, PublicationsFragment, RecordAdapter.RecordBinder, android.text.TextWatcher

### Community 37 - "Django App Config Registry"
Cohesion: 0.11
Nodes (6): AccountsConfig, AuditConfig, ExportConfig, RecordsConfig, SchoolsConfig, ServiceConfig

### Community 38 - "APIView"
Cohesion: 0.27
Nodes (4): ChangePasswordView, LogoutView, MeView, RefreshTokenView

### Community 39 - "BaseRecordFragment"
Cohesion: 0.09
Nodes (7): BaseRecordFragment, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<List<JsonObject>>, RecordAdapter.OnRecordActionListener, Callback<JsonObject>

### Community 40 - "CertificationsFragment"
Cohesion: 0.09
Nodes (4): CertificationsFragment, RecordAdapter.RecordBinder, PlacementsFragment, RecordAdapter.RecordBinder

### Community 42 - "package.json"
Cohesion: 0.05
Nodes (44): author, dependencies, axios, @heroicons/react, react, react-dom, react-router-dom, devDependencies (+36 more)

### Community 43 - "ErrorOccurrence"
Cohesion: 0.22
Nodes (5): ErrorOccurrence, Meta, ErrorOccurrenceSerializer, Meta, ErrorOccurrenceSerializerTests

### Community 44 - "Override"
Cohesion: 0.22
Nodes (3): Callback<JsonObject>, Callback<JsonElement>, Callback<List<JsonObject>>

### Community 45 - "throttles.py"
Cohesion: 0.13
Nodes (7): FixedWindowThrottle, _get_redis(), _incr_fixed_window(), _apply_people(), AuditApproveView, AuditRejectView, _not_found()

### Community 48 - "Override"
Cohesion: 0.12
Nodes (5): FacultyAutoCompleteAdapter, Filter, PatentsFragment, RecordAdapter.RecordBinder, android.text.TextWatcher

### Community 52 - "ChronicleMasterManagementView"
Cohesion: 0.18
Nodes (4): ChronicleMasterManagementView, ResetPasswordView, set_temporary_password(), sign_out_everywhere()

### Community 55 - "confirm_own_password"
Cohesion: 0.18
Nodes (3): confirm_own_password(), ServiceUserManagementView, UserReactivateView

### Community 58 - "records/views.py"
Cohesion: 0.04
Nodes (71): User, Meta, AuditRequest, Meta, AuditRequestSerializer, Meta, AuditRequestSerializerTests, AuditHistoryView (+63 more)

### Community 59 - "BackupConfigurationView"
Cohesion: 0.27
Nodes (4): BackupConfigurationSerializer, Meta, BackupConfigurationView, TriggerManualBackupView

### Community 60 - "ApiClient.java"
Cohesion: 0.10
Nodes (3): ApiClient, CookieJar, TokenUsed

### Community 61 - "Android Campus Users Fragment"
Cohesion: 0.12
Nodes (7): BadgeStyle, DARK, GRAY, OUTLINE, RED, CampusUsersFragment, RecordAdapter.RecordBinder

### Community 68 - "Override"
Cohesion: 0.14
Nodes (5): ClubsFragment, Callback<JsonObject>, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 70 - "ReportErrorSerializer"
Cohesion: 0.31
Nodes (3): ReportErrorSerializer, ReportErrorSerializerTests, ReportErrorView

### Community 71 - "ExportTestMixin"
Cohesion: 0.12
Nodes (4): CoordinatorExportViewTests, ExportHistoryViewTests, ExportSchoolActivitiesViewTests, MISDataRequestViewTests

### Community 72 - "BugReportModelTests"
Cohesion: 0.12
Nodes (5): BugReportCreateSerializer, Meta, BugReportCreateSerializerTests, BugReportModelTests, BugReportCreateView

### Community 76 - "TestCase"
Cohesion: 0.07
Nodes (6): BackupConfigurationModelTests, PatentApplicantIndexTests, PlacementActivityModelTests, PublicationModelTests, SchoolActivityCollaborationTests, StudentActivityModelTests

### Community 82 - "accounts/views.py"
Cohesion: 0.04
Nodes (23): UserManager, can_reset_password(), ChronicleAccumulatorSerializer, Meta, LoginSerializer, UserCreateSerializer, Meta, UserSerializer (+15 more)

### Community 99 - "ExportTestMixin"
Cohesion: 0.11
Nodes (7): MISReportSerializer, Meta, ExportTestMixin, MISDataRequestModelTests, MISDataRequestSerializerTests, MISReportModelTests, MISReportSerializerTests

### Community 101 - "._setup_base"
Cohesion: 0.11
Nodes (3): CertificationModelTests, ClubAPITests, StudentActivityCollaborationTests

### Community 163 - "export/tasks.py"
Cohesion: 0.08
Nodes (12): GeneratedExport, Meta, _append_styled_headers(), build_campus_workbook(), ensure_export_dir(), export_all_for_user(), export_single_campus(), generate_manual_export() (+4 more)

## Knowledge Gaps
- **22 isolated node(s):** `DARK`, `OUTLINE`, `RED`, `GRAY`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 933 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **89 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Campus` connect `records/tests.py` to `export/views.py`, `CampusListCreateViewTests`, `FanOutWriteTests`, `APITestCase`, `Django Audit Models`, `get_user_school_ids`, `RolePermission`, `ChronicleDashboardTests`, `APITestCase`, `SchoolModelTests`, `SchoolListCreateViewTests`, `CampusDetailViewTests`, `CampusReactivateViewTests`, `SchoolDetailViewTests`, `override_settings`, `APITestCase`, `MySchoolsViewTests`, `export/tasks.py`, `Django User Model Tests`, `ErrorOccurrence`, `AccountIntegrityTests`, `records/views.py`, `AuditListPaginationTests`, `UserSchoolMappingViewTests`, `accounts/views.py`, `ExportTestMixin`, `NewExportEndpointsTests`, `ResetPasswordTests`, `override_settings`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **What connects `DARK`, `OUTLINE`, `RED` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Android API Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.05304982817869416 - nodes in this community are weakly interconnected._
- **Why does `User` connect `records/views.py` to `CoPeopleApprovalTests`, `export/views.py`, `export/tasks.py`, `PublicationAuthorTests`, `APIView`, `records/views.py`, `records/tests.py`, `ErrorTicket`, `ErrorOccurrence`, `get_user_school_ids`, `accounts/views.py`, `ChronicleMasterManagementView`, `CoApplicantVisibilityTests`, `CoAuthorVisibilityTests`, `confirm_own_password`, `APITestCase`, `SchoolActivityAPITests`, `service/views.py`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `ApiClientTest.java` be split into smaller, more focused modules?**
  _Cohesion score 0.08456659619450317 - nodes in this community are weakly interconnected._
- **Why does `School` connect `records/tests.py` to `export/views.py`, `records/views.py`, `get_user_school_ids`, `APITestCase`, `SchoolModelTests`, `SchoolListCreateViewTests`, `SchoolDetailViewTests`, `override_settings`, `MySchoolsViewTests`, `SchoolReactivateViewTests`, `export/tasks.py`, `AuditRequestModelTests`, `AccountIntegrityTests`, `records/views.py`, `AuditListPaginationTests`, `UserSchoolMappingViewTests`, `DashboardCountsCacheTests`, `accounts/views.py`, `ExportTestMixin`, `ResetPasswordTests`, `override_settings`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `export/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.04095152062631737 - nodes in this community are weakly interconnected._