# Graph Report - nmpralekh  (2026-11-23)

## Corpus Check
- 232 files · ~102,252 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .xml 33, (none) 6, .properties 3)

## Summary
- 2737 nodes · 7796 edges · 136 communities (47 shown, 89 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 799 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `38ccb0c7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Android API Service Layer
- Club
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
- ErrorTicketStatusView
- android.view.View
- AuditRequest
- APITestCase
- SchoolModelTests
- RecordBinder
- TestCase
- Django Audit Views
- BackgroundExportAllTests
- SessionManager
- Override
- BugReport
- .jsonStr
- AuditAdapter
- DetailQueryCountTests
- Override
- Django User Model Tests
- Django App Config Registry
- .onResponse
- BaseRecordFragment
- CertificationsFragment
- ClubListPaginationTests
- package.json
- ErrorOccurrence
- Override
- ClubModelTests
- django_conf
- AuditRequestIndexTests
- Override
- CertificationListPaginationTests
- PublicationAuthorTests
- django_db_models_deletion
- CoApplicantVisibilityTests
- AccountIntegrityTests
- CoAuthorVisibilityTests
- FDPListPaginationTests
- SchoolActivityAPITests
- TestCase
- BackupConfigurationView
- ApiClient.java
- Android Campus Users Fragment
- Android Faculties Fragment
- ReceivedMISDataFragment
- ErrorTicketListViewTests
- SchoolActivityListPaginationTests
- UserSchoolMappingViewTests
- Django Error Fingerprint
- Override
- TrustBoundaryTests
- ReportErrorSerializer
- ExportTestMixin
- BugReportCreateSerializer
- ServiceUserManagementViewTests
- Django Settings Configuration
- SchoolActivityCollaborationTests
- DashboardCountsCacheTests
- PlacementListPaginationTests
- User
- Module Cluster 83
- SchoolActivitiesFragment
- LoginDuringRedisOutageTests
- ReportErrorViewTests
- FDPFragment
- MISReportSerializer
- CoPeopleApprovalTests
- MISDataRequestSerializer
- ClubAPITests
- GeneratedExportModelTests
- ._setup_base
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
- PublicationAuthorIndexTests
- CampusDetailViewTests
- CampusReactivateViewTests
- SchoolDetailViewTests
- SchoolFacultyViewTests
- override_settings
- APITestCase
- MySchoolsViewTests
- SchoolReactivateViewTests
- export/migrations/0001_initial.py
- 0003_misreport.py
- records/migrations/0001_initial.py
- 0009_club_audit.py

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

## Communities (136 total, 89 thin omitted)

### Community 0 - "Android API Service Layer"
Cohesion: 0.05
Nodes (12): locust.sh script, AdminUser, BaseMISUser, ChronicleMasterUser, DeleteAuthUser, FacultyUser, MasterUser, MISAccumulatorUser (+4 more)

### Community 1 - "Club"
Cohesion: 0.09
Nodes (14): Club, Meta, ClubSerializer, Meta, PublicationAuthorSerializer, Meta, StudentActivitySerializer, Meta (+6 more)

### Community 2 - "export/views.py"
Cohesion: 0.04
Nodes (37): ChronicleDataRequest, Meta, GeneratedExport, Meta, MISDataRequest, Meta, MISReport, Meta (+29 more)

### Community 4 - "FanOutWriteTests"
Cohesion: 0.33
Nodes (3): FanOutWriteTests, add_campuses(), _queries()

### Community 5 - "FDPFragment"
Cohesion: 0.09
Nodes (7): AdminActivity, BaseAuthActivity, DeleteAuthActivity, FacultyActivity, HomeDashboardFragment, OnModuleClickListener, SuperAdminActivity

### Community 6 - "records/views.py"
Cohesion: 0.04
Nodes (66): _append_styled_headers(), build_campus_workbook(), ensure_export_dir(), export_all_for_user(), export_single_campus(), generate_manual_export(), generate_nightly_exports(), _gather_coordinator_data() (+58 more)

### Community 7 - "PageHeader"
Cohesion: 0.05
Nodes (155): api, apiErrors(), App(), RoleRedirect(), BugReportButton(), ErrorBoundary, Layout(), roleNavLinks (+147 more)

### Community 9 - "records/tests.py"
Cohesion: 0.05
Nodes (35): ChronicleAccumulatorSerializer, Meta, UserSerializer, Meta, UserSerializerTests, AuditTestMixin, Campus, Meta (+27 more)

### Community 11 - "Django Audit Models"
Cohesion: 0.08
Nodes (7): BugReportCreateViewTests, BugReportDetailViewTests, BugReportListViewTests, ErrorTicketDetailViewTests, ErrorTicketStatusViewTests, ServiceDashboardStatsViewTests, ServiceTestMixin

### Community 12 - "django_db"
Cohesion: 0.05
Nodes (19): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+11 more)

### Community 13 - "Override"
Cohesion: 0.23
Nodes (4): Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 14 - "get_user_school_ids"
Cohesion: 0.09
Nodes (10): FixedWindowThrottle, _apply_people(), AuditApproveView, AuditRejectView, _lock_pending_audit(), _not_found(), DashboardCountsView, PublicationAuthorListCreateView (+2 more)

### Community 15 - "service/views.py"
Cohesion: 0.12
Nodes (9): ErrorTicket, Meta, ErrorTicketDetailSerializer, Meta, ErrorTicketListSerializer, Meta, ErrorTicketSerializerTests, ErrorTicketDetailView (+1 more)

### Community 17 - "append_safe_row"
Cohesion: 0.08
Nodes (15): append_safe_row(), ExportHelperFunctionTests, AccumulatorExportView, append_styled_headers(), build_apply_filters(), apply_filters(), ChronicleExportView, CoordinatorExportView (+7 more)

### Community 18 - "RolePermission"
Cohesion: 0.08
Nodes (16): RolePermission(), IsAdminOrUserOrSuperAdminOrCoordinatorTests, IsAdminOrUserPermissionTests, IsAdminPermissionTests, IsChronicleMasterPermissionTests, IsDeleteAuthPermissionTests, IsMasterOrSuperAdminPermissionTests, IsMasterPermissionTests (+8 more)

### Community 19 - "ErrorTicketStatusView"
Cohesion: 0.18
Nodes (5): TicketStatusUpdateSerializer, ApiStatusView, extract_urls(), ErrorTicketStatusView, ServiceDashboardStatsView

### Community 21 - "AuditRequest"
Cohesion: 0.03
Nodes (17): AuditRequest, Meta, AuditRequestSerializer, Meta, AuditApproveViewTests, AuditHistoryPaginationTests, AuditHistoryViewTests, AuditListPaginationTests (+9 more)

### Community 22 - "APITestCase"
Cohesion: 0.07
Nodes (11): BackupConfigAPITests, CertificationAPITests, DashboardCountsAPITests, FDPAPITests, FDPDateRangeTests, PatentAPITests, PatentListPaginationTests, PlacementAPITests (+3 more)

### Community 23 - "SchoolModelTests"
Cohesion: 0.07
Nodes (3): CampusModelTests, SchoolModelTests, UserSchoolMappingModelTests

### Community 25 - "TestCase"
Cohesion: 0.09
Nodes (4): CertificationModelTests, FDPWorkshopGLModelTests, SchoolActivityModelTests, StudentActivityCollaborationTests

### Community 26 - "Django Audit Views"
Cohesion: 0.09
Nodes (26): Client HTML Document Entry, DOM Root Mount Node, Native Android Client, Multi-Tier Web and Service Architecture, Audit and Delete Approval Workflow, Automated Test Suite (390 Tests), Gunicorn WSGI Concurrency Configuration, Locust Multi-Role Load Testing (+18 more)

### Community 29 - "Override"
Cohesion: 0.20
Nodes (5): Callback<JsonObject>, Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 31 - "BugReport"
Cohesion: 0.09
Nodes (7): BugReport, Meta, BugReportListSerializer, Meta, BugReportModelTests, BugReportDetailView, BugReportListView

### Community 32 - ".jsonStr"
Cohesion: 0.14
Nodes (4): StudentActivitiesFragment, AdapterView.OnItemSelectedListener, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 33 - "AuditAdapter"
Cohesion: 0.12
Nodes (6): AuditAdapter, AuditViewHolder, OnAuditActionListener, ViewHolder, DeleteAuthDashboardFragment, OnViewAllClickListener

### Community 34 - "DetailQueryCountTests"
Cohesion: 0.12
Nodes (11): SchoolActivityCollaboration, Meta, StudentActivityCollaboration, Meta, SchoolActivityCollaborationSerializer, Meta, StudentActivityCollaborationSerializer, Meta (+3 more)

### Community 35 - "Override"
Cohesion: 0.12
Nodes (5): FacultyAutoCompleteAdapter, Filter, PublicationsFragment, RecordAdapter.RecordBinder, android.text.TextWatcher

### Community 37 - "Django App Config Registry"
Cohesion: 0.11
Nodes (6): AccountsConfig, AuditConfig, ExportConfig, RecordsConfig, SchoolsConfig, ServiceConfig

### Community 39 - "BaseRecordFragment"
Cohesion: 0.08
Nodes (8): BaseRecordFragment, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<List<JsonObject>>, RecordAdapter.OnRecordActionListener, Callback<JsonObject>, Callback<JsonObject>

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
Cohesion: 0.24
Nodes (3): Callback<JsonObject>, Callback<JsonElement>, Callback<List<JsonObject>>

### Community 46 - "django_conf"
Cohesion: 0.13
Nodes (7): Migration, Migration, Migration, Migration, Migration, Migration, Migration

### Community 48 - "Override"
Cohesion: 0.12
Nodes (5): FacultyAutoCompleteAdapter, Filter, PatentsFragment, RecordAdapter.RecordBinder, android.text.TextWatcher

### Community 52 - "django_db_models_deletion"
Cohesion: 0.13
Nodes (7): Migration, Migration, Migration, Migration, Migration, Migration, Migration

### Community 58 - "TestCase"
Cohesion: 0.07
Nodes (6): BackupConfigurationModelTests, PatentApplicantIndexTests, PatentApplicantTests, PlacementActivityModelTests, PublicationModelTests, StudentActivityModelTests

### Community 59 - "BackupConfigurationView"
Cohesion: 0.27
Nodes (4): BackupConfigurationSerializer, Meta, BackupConfigurationView, TriggerManualBackupView

### Community 60 - "ApiClient.java"
Cohesion: 0.08
Nodes (3): ApiClient, CookieJar, TokenUsed

### Community 62 - "Android Faculties Fragment"
Cohesion: 0.12
Nodes (7): BadgeStyle, DARK, GRAY, OUTLINE, RED, FacultiesFragment, RecordAdapter.RecordBinder

### Community 68 - "Override"
Cohesion: 0.14
Nodes (5): ClubsFragment, Callback<JsonObject>, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 70 - "ReportErrorSerializer"
Cohesion: 0.31
Nodes (3): ReportErrorSerializer, ReportErrorSerializerTests, ReportErrorView

### Community 71 - "ExportTestMixin"
Cohesion: 0.14
Nodes (5): CoordinatorExportViewTests, ExportHistoryViewTests, ExportSchoolActivitiesViewTests, ExportTestMixin, MISDataRequestViewTests

### Community 72 - "BugReportCreateSerializer"
Cohesion: 0.25
Nodes (4): BugReportCreateSerializer, Meta, BugReportCreateSerializerTests, BugReportCreateView

### Community 82 - "User"
Cohesion: 0.03
Nodes (42): User, Meta, can_reset_password(), confirm_own_password(), LoginSerializer, UserCreateSerializer, Meta, UserUpdateSerializer (+34 more)

### Community 96 - "MISReportSerializer"
Cohesion: 0.18
Nodes (4): check_date_order(), MISReportSerializer, Meta, MISReportSerializerTests

### Community 99 - "MISDataRequestSerializer"
Cohesion: 0.17
Nodes (4): MISDataRequestSerializer, Meta, MISDataRequestModelTests, MISDataRequestSerializerTests

## Knowledge Gaps
- **22 isolated node(s):** `DARK`, `OUTLINE`, `RED`, `GRAY`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 923 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **89 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Campus` connect `records/tests.py` to `export/views.py`, `CampusListCreateViewTests`, `FanOutWriteTests`, `APITestCase`, `records/views.py`, `Django Audit Models`, `get_user_school_ids`, `RolePermission`, `ChronicleDashboardTests`, `AuditRequest`, `APITestCase`, `SchoolModelTests`, `SchoolListCreateViewTests`, `CampusDetailViewTests`, `CampusReactivateViewTests`, `SchoolDetailViewTests`, `SchoolFacultyViewTests`, `override_settings`, `APITestCase`, `MySchoolsViewTests`, `Django User Model Tests`, `ErrorOccurrence`, `AccountIntegrityTests`, `UserSchoolMappingViewTests`, `ExportTestMixin`, `User`, `NewExportEndpointsTests`, `ResetPasswordTests`, `override_settings`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `DARK`, `OUTLINE`, `RED` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Android API Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.05304982817869416 - nodes in this community are weakly interconnected._
- **Why does `School` connect `records/tests.py` to `Club`, `export/views.py`, `APITestCase`, `records/views.py`, `get_user_school_ids`, `AuditRequest`, `APITestCase`, `SchoolModelTests`, `SchoolListCreateViewTests`, `SchoolDetailViewTests`, `SchoolFacultyViewTests`, `override_settings`, `MySchoolsViewTests`, `DetailQueryCountTests`, `SchoolReactivateViewTests`, `AccountIntegrityTests`, `UserSchoolMappingViewTests`, `ExportTestMixin`, `DashboardCountsCacheTests`, `User`, `ResetPasswordTests`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `Club` be split into smaller, more focused modules?**
  _Cohesion score 0.08669354838709678 - nodes in this community are weakly interconnected._
- **Why does `User` connect `User` to `Club`, `export/views.py`, `CoPeopleApprovalTests`, `DetailQueryCountTests`, `records/views.py`, `records/tests.py`, `ErrorOccurrence`, `django_db`, `service/views.py`, `PublicationAuthorTests`, `AuditRequest`, `CoApplicantVisibilityTests`, `CoAuthorVisibilityTests`, `APITestCase`, `SchoolActivityAPITests`, `BugReport`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `export/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.04104938271604938 - nodes in this community are weakly interconnected._