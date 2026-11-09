# Graph Report - nmpralekh  (2026-11-09)

## Corpus Check
- 226 files · ~98,305 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .xml 33, (none) 6, .properties 3)

## Summary
- 2667 nodes · 7541 edges · 107 communities (49 shown, 58 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 785 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `361f7b70`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Android API Service Layer
- records/views.py
- export/views.py
- Android Record Fragments
- FanOutWriteTests
- AdminActivity.java
- export/tasks.py
- PageHeader
- APITestCase
- Django School Models
- ErrorTicket
- Django Audit Models
- django_db
- AuditRequestModelTests
- get_user_school_ids
- ErrorTicketDetailSerializer
- BaseRecordFragment.java
- append_safe_row
- RolePermission
- accounts/views.py
- RecordAdapter
- accounts/tests.py
- ._setup_base
- SchoolModelTests
- PatentApplicantListCreateView
- TestCase
- Django Audit Views
- BackgroundExportAllTests
- SessionManager
- retrofit2.Response
- BaseRecordFragment.java
- BugReport
- .jsonStr
- ErrorTicketStatusView
- Override
- Override
- Django User Model Tests
- Django App Config Registry
- Override
- BaseRecordFragment
- .getSelectedSchoolId
- ClubListPaginationTests
- package.json
- ErrorOccurrence
- PublicationAuthorTests
- records/tests.py
- Override
- AuditRequestIndexTests
- Override
- CertificationListPaginationTests
- ._setup_base
- CoApplicantVisibilityTests
- Django Service Tests
- AccountIntegrityTests
- UserSchoolMappingViewTests
- CoAuthorVisibilityTests
- SchoolActivityAPITests
- User
- BackupConfiguration
- ApiClient.java
- Android Campus Users Fragment
- Android Faculties Fragment
- ReceivedMISDataFragment
- CoPeopleReplaceTests
- SchoolActivityListPaginationTests
- APITestCase
- Django Error Fingerprint
- Override
- TrustBoundaryTests
- ReportErrorSerializer
- ExportTestMixin
- BugReportCreateSerializer
- ServiceUserManagementViewTests
- Django Settings Configuration
- AccumulatorDashboardTests
- ViewHolder
- DashboardCountsCacheTests
- AuditListPaginationTests
- PatentApplicantTests
- SchoolActivityCollaborationTests
- PlacementListPaginationTests
- PublicationListPaginationTests
- Module Cluster 83
- SchoolActivityModelTests
- FacultyAutoCompleteAdapter
- FacultyAutoCompleteAdapter
- LoginDuringRedisOutageTests
- ClubModelTests
- LogoutViewTests
- FDPWorkshopGLModelTests
- PatentModelTests
- GeneratedExportModelTests
- Module Cluster 132

## God Nodes (most connected - your core abstractions)
1. `PageHeader()` - 83 edges
2. `Button()` - 74 edges
3. `ApiService` - 66 edges
4. `Badge()` - 64 edges
5. `User` - 63 edges
6. `FormError()` - 61 edges
7. `BaseRecordFragment` - 59 edges
8. `react` - 58 edges
9. `School` - 56 edges
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

## Communities (107 total, 58 thin omitted)

### Community 0 - "Android API Service Layer"
Cohesion: 0.05
Nodes (12): locust.sh script, AdminUser, BaseMISUser, ChronicleMasterUser, DeleteAuthUser, FacultyUser, MasterUser, MISAccumulatorUser (+4 more)

### Community 1 - "records/views.py"
Cohesion: 0.04
Nodes (58): _gather_coordinator_data(), _counts_key(), get_dashboard_counts(), invalidate_dashboard_cache(), _stamp_key(), Certification, Meta, FacultyFDPWorkshopGL (+50 more)

### Community 2 - "export/views.py"
Cohesion: 0.03
Nodes (41): ChronicleDataRequest, Meta, MISDataRequest, Meta, MISReport, Meta, check_date_order(), ChronicleDataRequestSerializer (+33 more)

### Community 3 - "Android Record Fragments"
Cohesion: 0.05
Nodes (4): ApiService, Callback<JsonObject>, Callback<JsonElement>, Callback<List<JsonObject>>

### Community 4 - "FanOutWriteTests"
Cohesion: 0.19
Nodes (4): ChronicleDashboardTests, FanOutWriteTests, add_campuses(), _queries()

### Community 5 - "AdminActivity.java"
Cohesion: 0.08
Nodes (13): AdminActivity, BaseAuthActivity, FacultyActivity, CertificationsFragment, FDPFragment, HomeDashboardFragment, OnModuleClickListener, PatentsFragment (+5 more)

### Community 6 - "export/tasks.py"
Cohesion: 0.09
Nodes (10): GeneratedExport, Meta, _append_styled_headers(), build_campus_workbook(), ensure_export_dir(), export_all_for_user(), export_single_campus(), generate_manual_export() (+2 more)

### Community 7 - "PageHeader"
Cohesion: 0.06
Nodes (145): api, apiErrors(), App(), RoleRedirect(), BugReportButton(), ErrorBoundary, Layout(), roleNavLinks (+137 more)

### Community 8 - "APITestCase"
Cohesion: 0.06
Nodes (7): CampusUsersViewTests, ChronicleMasterManagementViewTests, LoginViewTests, MeViewTests, SchoolFacultiesViewTests, UserDetailViewTests, UserListCreateViewTests

### Community 9 - "Django School Models"
Cohesion: 0.06
Nodes (28): RecordTestMixin, School, Meta, UserSchoolMapping, Meta, CampusCreateSerializer, Meta, CampusSerializer (+20 more)

### Community 10 - "ErrorTicket"
Cohesion: 0.15
Nodes (4): ErrorTicket, Meta, ErrorTicketModelTests, ErrorTicketDetailView

### Community 11 - "Django Audit Models"
Cohesion: 0.07
Nodes (8): BugReportCreateViewTests, BugReportDetailViewTests, BugReportListViewTests, ErrorTicketDetailViewTests, ErrorTicketListViewTests, ErrorTicketStatusViewTests, ServiceDashboardStatsViewTests, ServiceTestMixin

### Community 12 - "django_db"
Cohesion: 0.03
Nodes (42): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+34 more)

### Community 14 - "get_user_school_ids"
Cohesion: 0.10
Nodes (13): AuditRequest, Meta, AuditRequestSerializer, Meta, AuditApproveView, AuditHistoryView, AuditRejectView, AuditRequestDetailView (+5 more)

### Community 15 - "ErrorTicketDetailSerializer"
Cohesion: 0.12
Nodes (6): ErrorTicketDetailSerializer, Meta, ErrorTicketListSerializer, Meta, ErrorTicketSerializerTests, ErrorTicketListView

### Community 17 - "append_safe_row"
Cohesion: 0.09
Nodes (12): append_safe_row(), ExportHelperFunctionTests, AccumulatorExportView, append_styled_headers(), build_apply_filters(), apply_filters(), ChronicleExportView, CoordinatorExportView (+4 more)

### Community 18 - "RolePermission"
Cohesion: 0.09
Nodes (15): RolePermission(), IsAdminOrUserOrSuperAdminOrCoordinatorTests, IsAdminOrUserPermissionTests, IsAdminPermissionTests, IsChronicleMasterPermissionTests, IsDeleteAuthPermissionTests, IsMasterOrSuperAdminPermissionTests, IsMasterPermissionTests (+7 more)

### Community 19 - "accounts/views.py"
Cohesion: 0.06
Nodes (18): LoginSerializer, UserSerializer, Meta, LoginSerializerTests, UserSerializerTests, FixedWindowThrottle, _get_redis(), _incr_fixed_window() (+10 more)

### Community 20 - "RecordAdapter"
Cohesion: 0.11
Nodes (7): AuditAdapter, AuditViewHolder, OnAuditActionListener, DeleteAuthActivity, OnViewAllClickListener, DeleteAuthHistoryFragment, DeleteAuthPendingFragment

### Community 21 - "accounts/tests.py"
Cohesion: 0.21
Nodes (4): UserManager, UserCreateSerializer, Meta, UserCreateSerializerTests

### Community 22 - "._setup_base"
Cohesion: 0.06
Nodes (10): BackupConfigAPITests, CertificationAPITests, DashboardCountsAPITests, FDPAPITests, FDPDateRangeTests, PatentAPITests, PatentListPaginationTests, PlacementAPITests (+2 more)

### Community 23 - "SchoolModelTests"
Cohesion: 0.07
Nodes (3): CampusModelTests, SchoolModelTests, UserSchoolMappingModelTests

### Community 24 - "PatentApplicantListCreateView"
Cohesion: 0.26
Nodes (3): PatentApplicantListCreateView, PublicationAuthorListCreateView, replace_people()

### Community 25 - "TestCase"
Cohesion: 0.06
Nodes (7): BackupConfigurationModelTests, PatentApplicantIndexTests, PlacementActivityModelTests, PublicationAuthorIndexTests, PublicationModelTests, StudentActivityCollaborationTests, StudentActivityModelTests

### Community 26 - "Django Audit Views"
Cohesion: 0.09
Nodes (26): Client HTML Document Entry, DOM Root Mount Node, Native Android Client, Multi-Tier Web and Service Architecture, Audit and Delete Approval Workflow, Automated Test Suite (390 Tests), Gunicorn WSGI Concurrency Configuration, Locust Multi-Role Load Testing (+18 more)

### Community 29 - "retrofit2.Response"
Cohesion: 0.09
Nodes (10): Callback<JsonObject>, Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, AuditAdapter.OnAuditActionListener (+2 more)

### Community 31 - "BugReport"
Cohesion: 0.09
Nodes (7): BugReport, Meta, BugReportListSerializer, Meta, BugReportModelTests, BugReportDetailView, BugReportListView

### Community 32 - ".jsonStr"
Cohesion: 0.14
Nodes (3): AdapterView.OnItemSelectedListener, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 33 - "ErrorTicketStatusView"
Cohesion: 0.18
Nodes (5): TicketStatusUpdateSerializer, ApiStatusView, extract_urls(), ErrorTicketStatusView, ServiceDashboardStatsView

### Community 35 - "Override"
Cohesion: 0.10
Nodes (6): Filter, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonElement>, android.text.TextWatcher, Callback<JsonObject>

### Community 37 - "Django App Config Registry"
Cohesion: 0.11
Nodes (6): AccountsConfig, AuditConfig, ExportConfig, RecordsConfig, SchoolsConfig, ServiceConfig

### Community 39 - "BaseRecordFragment"
Cohesion: 0.08
Nodes (7): BaseRecordFragment, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<List<JsonObject>>, RecordAdapter.OnRecordActionListener, Callback<JsonObject>

### Community 42 - "package.json"
Cohesion: 0.05
Nodes (44): author, dependencies, axios, @heroicons/react, react, react-dom, react-router-dom, devDependencies (+36 more)

### Community 43 - "ErrorOccurrence"
Cohesion: 0.13
Nodes (6): ErrorOccurrence, Meta, ErrorOccurrenceSerializer, Meta, ErrorOccurrenceModelTests, ErrorOccurrenceSerializerTests

### Community 45 - "records/tests.py"
Cohesion: 0.06
Nodes (23): Club, Meta, SchoolActivityCollaboration, Meta, StudentActivityCollaboration, Meta, ClubSerializer, Meta (+15 more)

### Community 48 - "Override"
Cohesion: 0.10
Nodes (6): Filter, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonElement>, android.text.TextWatcher, Callback<JsonObject>

### Community 51 - "._setup_base"
Cohesion: 0.10
Nodes (3): CertificationModelTests, ClubAPITests, FDPListPaginationTests

### Community 58 - "User"
Cohesion: 0.07
Nodes (12): User, Meta, UserVisibilitySerializer, Meta, UserVisibilitySerializerTests, AccumulatorCoordinatorsView, CampusUsersView, SchoolFacultiesView (+4 more)

### Community 59 - "BackupConfiguration"
Cohesion: 0.17
Nodes (7): BackupConfiguration, Meta, BackupConfigurationSerializer, Meta, BackupConfigurationView, DashboardCountsView, TriggerManualBackupView

### Community 60 - "ApiClient.java"
Cohesion: 0.08
Nodes (4): ApiClient, CookieJar, TokenUsed, retrofit2.Callback<com.google.gson.JsonObject>

### Community 61 - "Android Campus Users Fragment"
Cohesion: 0.13
Nodes (4): OnRecordActionListener, RecordBinder, CampusUsersFragment, RecordAdapter.RecordBinder

### Community 62 - "Android Faculties Fragment"
Cohesion: 0.12
Nodes (7): BadgeStyle, DARK, GRAY, OUTLINE, RED, FacultiesFragment, RecordAdapter.RecordBinder

### Community 66 - "APITestCase"
Cohesion: 0.05
Nodes (12): Campus, Meta, CampusDetailViewTests, CampusListCreateViewTests, CampusReactivateViewTests, CampusSchoolsViewTests, CampusUsersSchoolViewTests, MySchoolsViewTests (+4 more)

### Community 68 - "Override"
Cohesion: 0.11
Nodes (5): ClubsFragment, Callback<JsonObject>, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 70 - "ReportErrorSerializer"
Cohesion: 0.31
Nodes (3): ReportErrorSerializer, ReportErrorSerializerTests, ReportErrorView

### Community 71 - "ExportTestMixin"
Cohesion: 0.06
Nodes (9): CoordinatorExportViewTests, ExportHistoryViewTests, ExportSchoolActivitiesViewTests, ExportTestMixin, IntegrityRuleTests, MISDataRequestSerializerTests, MISDataRequestViewTests, MISReportViewTests (+1 more)

### Community 72 - "BugReportCreateSerializer"
Cohesion: 0.25
Nodes (4): BugReportCreateSerializer, Meta, BugReportCreateSerializerTests, BugReportCreateView

### Community 78 - "AuditListPaginationTests"
Cohesion: 0.05
Nodes (9): AuditApproveViewTests, AuditHistoryPaginationTests, AuditHistoryViewTests, AuditListPaginationTests, AuditRejectViewTests, AuditRequestListViewTests, AuditRequestSerializerTests, AuditRowLockTests (+1 more)

### Community 125 - "GeneratedExportModelTests"
Cohesion: 0.08
Nodes (4): GeneratedExportModelTests, MISDataRequestModelTests, MISReportModelTests, MISReportSerializerTests

## Knowledge Gaps
- **22 isolated node(s):** `DARK`, `OUTLINE`, `RED`, `GRAY`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 887 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **58 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Campus` connect `APITestCase` to `export/views.py`, `Django User Model Tests`, `FanOutWriteTests`, `export/tasks.py`, `ExportTestMixin`, `APITestCase`, `Django School Models`, `Django Audit Models`, `records/tests.py`, `AuditListPaginationTests`, `get_user_school_ids`, `RolePermission`, `accounts/views.py`, `accounts/tests.py`, `AccountIntegrityTests`, `SchoolModelTests`, `UserSchoolMappingViewTests`, `User`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `DARK`, `OUTLINE`, `RED` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Android API Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.05304982817869416 - nodes in this community are weakly interconnected._
- **Why does `User` connect `User` to `records/views.py`, `export/views.py`, `export/tasks.py`, `Django School Models`, `ErrorTicket`, `django_db`, `get_user_school_ids`, `accounts/views.py`, `accounts/tests.py`, `BugReport`, `ErrorOccurrence`, `PublicationAuthorTests`, `records/tests.py`, `CoApplicantVisibilityTests`, `CoAuthorVisibilityTests`, `SchoolActivityAPITests`, `BackupConfiguration`, `CoPeopleReplaceTests`, `APITestCase`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `records/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.042643560992184845 - nodes in this community are weakly interconnected._
- **Why does `School` connect `Django School Models` to `records/views.py`, `APITestCase`, `export/views.py`, `export/tasks.py`, `ExportTestMixin`, `APITestCase`, `AuditRequestModelTests`, `get_user_school_ids`, `AuditListPaginationTests`, `records/tests.py`, `DashboardCountsCacheTests`, `accounts/tests.py`, `AccountIntegrityTests`, `SchoolModelTests`, `UserSchoolMappingViewTests`, `User`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `export/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.03464912280701754 - nodes in this community are weakly interconnected._