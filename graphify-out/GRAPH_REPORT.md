# Graph Report - nmpralekh  (2026-11-09)

## Corpus Check
- 226 files · ~97,383 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .xml 33, (none) 6, .properties 3)

## Summary
- 2630 nodes · 7448 edges · 101 communities (48 shown, 53 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 763 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0cb4f276`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Android API Service Layer
- records/views.py
- export/views.py
- Android Record Fragments
- audit/views.py
- AdminActivity.java
- export/tasks.py
- PageHeader
- APITestCase
- Django School Models
- export/serializers.py
- Django Audit Models
- django_db
- School
- get_user_school_ids
- ErrorTicket
- BaseRecordFragment.java
- append_safe_row
- RolePermission
- accounts/views.py
- RecordAdapter
- DeleteAuthActivity.java
- ._setup_base
- SchoolModelTests
- ErrorOccurrence
- ._setup_base
- Django Audit Views
- BackgroundExportAllTests
- SessionManager
- Override
- Patent
- service/views.py
- .jsonStr
- Override
- Override
- Override
- Django User Model Tests
- Django App Config Registry
- RecordBinder
- BaseRecordFragment
- .getSelectedSchoolId
- ClubListPaginationTests
- package.json
- DeleteAuthDashboardFragment.java
- PublicationAuthorTests
- records/tests.py
- ErrorOccurrenceModelTests
- AuditRequestIndexTests
- Override
- CertificationListPaginationTests
- ClubAPITests
- CoApplicantVisibilityTests
- Django Service Tests
- AccountIntegrityTests
- Override
- CoAuthorVisibilityTests
- SchoolActivityAPITests
- accounts/tests.py
- BackupConfiguration
- ApiClient.java
- Android Campus Users Fragment
- Android Faculties Fragment
- ReceivedMISDataFragment
- BugReportModelTests
- SchoolActivityListPaginationTests
- APITestCase
- Django Error Fingerprint
- Override
- TrustBoundaryTests
- .onResponse
- ExportTestMixin
- Django User-School Mapping Tests
- StudentActivityModelTests
- Django Settings Configuration
- FDPListPaginationTests
- DashboardCountsCacheTests
- AuditListPaginationTests
- PatentApplicantTests
- TestCase
- PlacementListPaginationTests
- PublicationListPaginationTests
- Module Cluster 83
- ClubModelTests
- PublicationAuthorIndexTests
- SchoolActivityModelTests
- GeneratedExport
- Module Cluster 132

## God Nodes (most connected - your core abstractions)
1. `PageHeader()` - 83 edges
2. `Button()` - 74 edges
3. `ApiService` - 66 edges
4. `Badge()` - 64 edges
5. `FormError()` - 61 edges
6. `User` - 61 edges
7. `BaseRecordFragment` - 59 edges
8. `react` - 58 edges
9. `School` - 55 edges
10. `Campus` - 52 edges

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

## Communities (101 total, 53 thin omitted)

### Community 0 - "Android API Service Layer"
Cohesion: 0.05
Nodes (12): locust.sh script, AdminUser, BaseMISUser, ChronicleMasterUser, DeleteAuthUser, FacultyUser, MasterUser, MISAccumulatorUser (+4 more)

### Community 1 - "records/views.py"
Cohesion: 0.06
Nodes (27): CertificationSerializer, Meta, FacultyPublicationSerializer, Meta, PatentSerializer, Meta, AuditedDetailMixin, CertificationDetailView (+19 more)

### Community 2 - "export/views.py"
Cohesion: 0.05
Nodes (31): MISDataRequest, Meta, MISReport, Meta, AccumulatorBulkRequestView, AccumulatorDashboardView, ChronicleDashboardView, ChronicleDataRequestListCreateView (+23 more)

### Community 4 - "audit/views.py"
Cohesion: 0.12
Nodes (7): FixedWindowThrottle, _get_redis(), _incr_fixed_window(), AuditApproveView, AuditRejectView, _lock_pending_audit(), _not_found()

### Community 5 - "AdminActivity.java"
Cohesion: 0.10
Nodes (10): AdminActivity, FacultyActivity, CertificationsFragment, FDPFragment, HomeDashboardFragment, OnModuleClickListener, PlacementsFragment, SchoolActivitiesFragment (+2 more)

### Community 6 - "export/tasks.py"
Cohesion: 0.09
Nodes (12): GeneratedExport, Meta, _append_styled_headers(), build_campus_workbook(), ensure_export_dir(), export_all_for_user(), export_single_campus(), generate_manual_export() (+4 more)

### Community 7 - "PageHeader"
Cohesion: 0.06
Nodes (145): api, apiErrors(), App(), RoleRedirect(), BugReportButton(), ErrorBoundary, Layout(), roleNavLinks (+137 more)

### Community 8 - "APITestCase"
Cohesion: 0.04
Nodes (10): CampusUsersViewTests, ChronicleMasterManagementViewTests, LoginDuringRedisOutageTests, LoginViewTests, LogoutViewTests, MeViewTests, SchoolFacultiesViewTests, ServiceUserManagementViewTests (+2 more)

### Community 9 - "Django School Models"
Cohesion: 0.06
Nodes (27): Campus, Meta, UserSchoolMapping, Meta, CampusCreateSerializer, Meta, CampusSerializer, Meta (+19 more)

### Community 10 - "export/serializers.py"
Cohesion: 0.08
Nodes (12): ChronicleDataRequest, Meta, check_date_order(), ChronicleDataRequestSerializer, Meta, MISDataRequestSerializer, Meta, MISReportSerializer (+4 more)

### Community 11 - "Django Audit Models"
Cohesion: 0.07
Nodes (8): BugReportCreateViewTests, BugReportDetailViewTests, BugReportListViewTests, ErrorTicketDetailViewTests, ErrorTicketListViewTests, ErrorTicketStatusViewTests, ServiceDashboardStatsViewTests, ServiceTestMixin

### Community 12 - "django_db"
Cohesion: 0.03
Nodes (34): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+26 more)

### Community 13 - "School"
Cohesion: 0.13
Nodes (5): ExportHelperFunctionTests, TriggerManualExportView, validate_export_params(), School, Meta

### Community 14 - "get_user_school_ids"
Cohesion: 0.09
Nodes (8): SchoolFacultiesView, AuditHistoryView, AuditRequestListView, DashboardCountsView, FacultyUserSearchView, TriggerManualBackupView, GetUserSchoolIdsTests, get_user_school_ids()

### Community 15 - "ErrorTicket"
Cohesion: 0.07
Nodes (13): ErrorTicket, Meta, ErrorTicketDetailSerializer, Meta, ErrorTicketListSerializer, Meta, ReportErrorSerializer, ErrorTicketModelTests (+5 more)

### Community 17 - "append_safe_row"
Cohesion: 0.15
Nodes (8): append_safe_row(), AccumulatorExportView, append_styled_headers(), build_apply_filters(), apply_filters(), ChronicleExportView, CoordinatorExportView, get_scoped_queryset()

### Community 18 - "RolePermission"
Cohesion: 0.09
Nodes (15): RolePermission(), IsAdminOrUserOrSuperAdminOrCoordinatorTests, IsAdminOrUserPermissionTests, IsAdminPermissionTests, IsChronicleMasterPermissionTests, IsDeleteAuthPermissionTests, IsMasterOrSuperAdminPermissionTests, IsMasterPermissionTests (+7 more)

### Community 19 - "accounts/views.py"
Cohesion: 0.08
Nodes (11): LoginSerializer, LoginSerializerTests, local_one_per_second(), redis_available(), ChronicleMasterManagementView, LoginView, LogoutView, MeView (+3 more)

### Community 20 - "RecordAdapter"
Cohesion: 0.11
Nodes (4): AuditAdapter, AuditViewHolder, OnAuditActionListener, ViewHolder

### Community 21 - "DeleteAuthActivity.java"
Cohesion: 0.23
Nodes (3): DeleteAuthActivity, DeleteAuthDashboardFragment, OnViewAllClickListener

### Community 22 - "._setup_base"
Cohesion: 0.07
Nodes (11): BackupConfigAPITests, CertificationAPITests, DashboardCountsAPITests, FDPAPITests, FDPDateRangeTests, PatentAPITests, PatentListPaginationTests, PlacementAPITests (+3 more)

### Community 23 - "SchoolModelTests"
Cohesion: 0.07
Nodes (3): CampusModelTests, SchoolModelTests, UserSchoolMappingModelTests

### Community 24 - "ErrorOccurrence"
Cohesion: 0.21
Nodes (5): ErrorOccurrence, Meta, ErrorOccurrenceSerializer, Meta, ErrorOccurrenceSerializerTests

### Community 25 - "._setup_base"
Cohesion: 0.11
Nodes (4): BackupConfigurationModelTests, PlacementActivityModelTests, PublicationModelTests, StudentActivityCollaborationTests

### Community 26 - "Django Audit Views"
Cohesion: 0.09
Nodes (26): Client HTML Document Entry, DOM Root Mount Node, Native Android Client, Multi-Tier Web and Service Architecture, Audit and Delete Approval Workflow, Automated Test Suite (390 Tests), Gunicorn WSGI Concurrency Configuration, Locust Multi-Role Load Testing (+18 more)

### Community 28 - "SessionManager"
Cohesion: 0.12
Nodes (3): SessionManager, BaseAuthActivity, LoginActivity

### Community 29 - "Override"
Cohesion: 0.20
Nodes (5): Callback<JsonObject>, Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 30 - "Patent"
Cohesion: 0.12
Nodes (15): _counts_key(), get_dashboard_counts(), invalidate_dashboard_cache(), _stamp_key(), Certification, Meta, Patent, Meta (+7 more)

### Community 31 - "service/views.py"
Cohesion: 0.07
Nodes (17): BugReport, Meta, BugReportAdminUpdateSerializer, Meta, BugReportCreateSerializer, Meta, BugReportListSerializer, Meta (+9 more)

### Community 32 - ".jsonStr"
Cohesion: 0.11
Nodes (4): RecordAdapter.RecordBinder, AdapterView.OnItemSelectedListener, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 33 - "Override"
Cohesion: 0.23
Nodes (4): Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 34 - "Override"
Cohesion: 0.20
Nodes (3): Callback<JsonObject>, Callback<JsonElement>, Callback<List<JsonObject>>

### Community 35 - "Override"
Cohesion: 0.09
Nodes (8): FacultyAutoCompleteAdapter, Filter, PublicationsFragment, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>, android.text.TextWatcher, Callback<JsonObject>

### Community 36 - "Django User Model Tests"
Cohesion: 0.07
Nodes (5): UserCreateSerializer, Meta, UserCreateSerializerTests, UserModelTests, UserListCreateView

### Community 37 - "Django App Config Registry"
Cohesion: 0.11
Nodes (6): AccountsConfig, AuditConfig, ExportConfig, RecordsConfig, SchoolsConfig, ServiceConfig

### Community 38 - "RecordBinder"
Cohesion: 0.10
Nodes (8): BadgeStyle, DARK, GRAY, OUTLINE, RED, OnRecordActionListener, RecordBinder, RecordAdapter.RecordBinder

### Community 39 - "BaseRecordFragment"
Cohesion: 0.08
Nodes (7): BaseRecordFragment, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<List<JsonObject>>, RecordAdapter.OnRecordActionListener, Callback<JsonObject>

### Community 42 - "package.json"
Cohesion: 0.05
Nodes (44): author, dependencies, axios, @heroicons/react, react, react-dom, react-router-dom, devDependencies (+36 more)

### Community 45 - "records/tests.py"
Cohesion: 0.04
Nodes (43): User, Meta, ChronicleAccumulatorsView, _gather_coordinator_data(), Club, Meta, FacultyFDPWorkshopGL, Meta (+35 more)

### Community 48 - "Override"
Cohesion: 0.09
Nodes (8): FacultyAutoCompleteAdapter, Filter, PatentsFragment, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>, android.text.TextWatcher, Callback<JsonObject>

### Community 58 - "accounts/tests.py"
Cohesion: 0.06
Nodes (15): UserManager, ChronicleAccumulatorSerializer, Meta, UserSerializer, Meta, UserUpdateSerializer, Meta, UserVisibilitySerializer (+7 more)

### Community 59 - "BackupConfiguration"
Cohesion: 0.16
Nodes (6): BackupConfiguration, Meta, BackupConfigurationSerializer, Meta, perform_db_backup(), BackupConfigurationView

### Community 60 - "ApiClient.java"
Cohesion: 0.09
Nodes (3): ApiClient, CookieJar, TokenUsed

### Community 66 - "APITestCase"
Cohesion: 0.05
Nodes (10): CampusDetailViewTests, CampusListCreateViewTests, CampusReactivateViewTests, CampusSchoolsViewTests, CampusUsersSchoolViewTests, MySchoolsViewTests, SchoolDetailViewTests, SchoolFacultyViewTests (+2 more)

### Community 68 - "Override"
Cohesion: 0.14
Nodes (5): ClubsFragment, Callback<JsonObject>, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 71 - "ExportTestMixin"
Cohesion: 0.05
Nodes (10): AccumulatorDashboardTests, CoordinatorExportViewTests, ExportHistoryViewTests, ExportSchoolActivitiesViewTests, ExportTestMixin, IntegrityRuleTests, MISDataRequestModelTests, MISDataRequestViewTests (+2 more)

### Community 78 - "AuditListPaginationTests"
Cohesion: 0.04
Nodes (15): AuditRequest, Meta, AuditRequestSerializer, Meta, AuditApproveViewTests, AuditHistoryPaginationTests, AuditHistoryViewTests, AuditListPaginationTests (+7 more)

### Community 80 - "TestCase"
Cohesion: 0.08
Nodes (5): CertificationModelTests, FDPWorkshopGLModelTests, PatentApplicantIndexTests, PatentModelTests, SchoolActivityCollaborationTests

## Knowledge Gaps
- **22 isolated node(s):** `DARK`, `OUTLINE`, `RED`, `GRAY`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 882 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Campus` connect `Django School Models` to `export/views.py`, `APITestCase`, `Django User Model Tests`, `export/tasks.py`, `ExportTestMixin`, `APITestCase`, `Django User-School Mapping Tests`, `export/serializers.py`, `Django Audit Models`, `School`, `AuditListPaginationTests`, `records/tests.py`, `get_user_school_ids`, `RolePermission`, `SchoolModelTests`, `AccountIntegrityTests`, `._setup_base`, `accounts/tests.py`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `DARK`, `OUTLINE`, `RED` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Android API Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.05304982817869416 - nodes in this community are weakly interconnected._
- **Why does `User` connect `records/tests.py` to `records/views.py`, `export/views.py`, `export/tasks.py`, `Django School Models`, `School`, `get_user_school_ids`, `ErrorTicket`, `accounts/views.py`, `._setup_base`, `ErrorOccurrence`, `Patent`, `service/views.py`, `Django User Model Tests`, `PublicationAuthorTests`, `CoApplicantVisibilityTests`, `CoAuthorVisibilityTests`, `SchoolActivityAPITests`, `accounts/tests.py`, `BackupConfiguration`, `AuditListPaginationTests`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `records/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06174863387978142 - nodes in this community are weakly interconnected._
- **Why does `School` connect `School` to `export/views.py`, `APITestCase`, `export/tasks.py`, `ExportTestMixin`, `APITestCase`, `Django School Models`, `Django User-School Mapping Tests`, `records/tests.py`, `AuditListPaginationTests`, `DashboardCountsCacheTests`, `get_user_school_ids`, `SchoolModelTests`, `AccountIntegrityTests`, `._setup_base`, `accounts/tests.py`, `Patent`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `export/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.04603580562659847 - nodes in this community are weakly interconnected._