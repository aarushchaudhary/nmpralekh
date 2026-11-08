# Graph Report - nmpralekh  (2026-11-09)

## Corpus Check
- 226 files · ~97,002 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .xml 33, (none) 6, .properties 3)

## Summary
- 2617 nodes · 7410 edges · 120 communities (49 shown, 71 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 751 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `22c2f1c7`
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
- ServiceUserManagementViewTests
- Django School Models
- MISDataRequest
- Django Audit Models
- django_db
- export/tests.py
- get_user_school_ids
- ErrorTicket
- append_safe_row
- RolePermission
- MISReport
- RecordAdapter
- DeleteAuthActivity.java
- ._setup_base
- SchoolModelTests
- ErrorTicketDetailSerializer
- RecordTestMixin
- Django Audit Views
- BackgroundExportAllTests
- SessionManager
- Override
- HomeDashboardFragment
- Django Service Bug Reports
- .jsonStr
- Override
- Override
- Override
- Django User Model Tests
- Django App Config Registry
- Override
- BaseRecordFragment
- .getSelectedSchoolId
- ClubListPaginationTests
- package.json
- ErrorTicketStatusView
- ErrorTicketListViewTests
- RecordSerializerTests
- ErrorOccurrenceModelTests
- AuditRequestModelTests
- Override
- CertificationListPaginationTests
- ClubAPITests
- CoApplicantVisibilityTests
- Django Service Tests
- AccountIntegrityTests
- RecordBinder
- CoAuthorVisibilityTests
- SchoolActivityAPITests
- User
- Django Backup Config
- ApiClient.java
- Android Campus Users Fragment
- Android Faculties Fragment
- ReceivedMISDataFragment
- SchoolFacultyViewTests
- SchoolActivityListPaginationTests
- Django School Tests
- Django Error Fingerprint
- Override
- TrustBoundaryTests
- LoginViewTests
- ExportTestMixin
- Django User-School Mapping Tests
- Django Error Serializer Tests
- Django Settings Configuration
- UserDetailViewTests
- UserListCreateViewTests
- DashboardCountsCacheTests
- AuditListPaginationTests
- PatentApplicantTests
- TestCase
- PlacementListPaginationTests
- PublicationListPaginationTests
- Module Cluster 83
- FacultyAutoCompleteAdapter
- override_settings
- ChronicleMasterManagementViewTests
- LoginDuringRedisOutageTests
- ClubModelTests
- Module Cluster 89
- LogoutViewTests
- APITestCase
- FDPWorkshopGLModelTests
- PatentModelTests
- PublicationAuthorIndexTests
- StudentActivityListPaginationTests
- SchoolActivityModelTests
- SchoolFacultiesViewTests
- MySchoolsViewTests
- Module Cluster 99
- Module Cluster 105
- Module Cluster 106
- Module Cluster 114
- Module Cluster 115
- GeneratedExport
- CampusReactivateViewTests
- Module Cluster 132

## God Nodes (most connected - your core abstractions)
1. `PageHeader()` - 83 edges
2. `Button()` - 74 edges
3. `ApiService` - 66 edges
4. `Badge()` - 64 edges
5. `FormError()` - 61 edges
6. `User` - 60 edges
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

## Communities (120 total, 71 thin omitted)

### Community 0 - "Android API Service Layer"
Cohesion: 0.05
Nodes (12): locust.sh script, AdminUser, BaseMISUser, ChronicleMasterUser, DeleteAuthUser, FacultyUser, MasterUser, MISAccumulatorUser (+4 more)

### Community 1 - "records/views.py"
Cohesion: 0.03
Nodes (71): _gather_coordinator_data(), _counts_key(), get_dashboard_counts(), invalidate_dashboard_cache(), _stamp_key(), Certification, Meta, FacultyFDPWorkshopGL (+63 more)

### Community 2 - "export/views.py"
Cohesion: 0.06
Nodes (21): AccumulatorBulkRequestView, AccumulatorDashboardView, ExportAllView, ExportCertificationsView, ExportDownloadView, ExportFDPView, ExportJobDownloadView, ExportJobView (+13 more)

### Community 4 - "audit/views.py"
Cohesion: 0.09
Nodes (16): FixedWindowThrottle, _get_redis(), _incr_fixed_window(), AuditRequest, Meta, AuditRequestSerializer, Meta, AuditRequestSerializerTests (+8 more)

### Community 5 - "AdminActivity.java"
Cohesion: 0.10
Nodes (11): AdminActivity, BaseAuthActivity, FacultyActivity, CertificationsFragment, FDPFragment, OnModuleClickListener, PatentsFragment, PlacementsFragment (+3 more)

### Community 6 - "export/tasks.py"
Cohesion: 0.10
Nodes (10): _append_styled_headers(), build_campus_workbook(), ensure_export_dir(), export_all_for_user(), export_single_campus(), generate_manual_export(), generate_nightly_exports(), BackupConfiguration (+2 more)

### Community 7 - "PageHeader"
Cohesion: 0.06
Nodes (145): api, apiErrors(), App(), RoleRedirect(), BugReportButton(), ErrorBoundary, Layout(), roleNavLinks (+137 more)

### Community 9 - "Django School Models"
Cohesion: 0.06
Nodes (29): AuditTestMixin, Campus, Meta, School, Meta, UserSchoolMapping, Meta, CampusCreateSerializer (+21 more)

### Community 10 - "MISDataRequest"
Cohesion: 0.07
Nodes (15): ChronicleDataRequest, Meta, MISDataRequest, Meta, check_date_order(), ChronicleDataRequestSerializer, Meta, MISDataRequestSerializer (+7 more)

### Community 11 - "Django Audit Models"
Cohesion: 0.09
Nodes (7): BugReportCreateViewTests, BugReportDetailViewTests, BugReportListViewTests, ErrorTicketDetailViewTests, ErrorTicketStatusViewTests, ServiceDashboardStatsViewTests, ServiceTestMixin

### Community 12 - "django_db"
Cohesion: 0.03
Nodes (39): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+31 more)

### Community 13 - "export/tests.py"
Cohesion: 0.12
Nodes (6): MISReportSerializer, Meta, ExportHelperFunctionTests, MISReportModelTests, MISReportSerializerTests, validate_export_params()

### Community 14 - "get_user_school_ids"
Cohesion: 0.07
Nodes (10): Club, Meta, check_school(), ClubDetailView, ClubListCreateView, PatentApplicantListCreateView, PublicationAuthorListCreateView, GetUserSchoolIdsTests (+2 more)

### Community 15 - "ErrorTicket"
Cohesion: 0.12
Nodes (5): ErrorTicket, Meta, ErrorTicketModelTests, ErrorTicketDetailView, ErrorTicketListView

### Community 17 - "append_safe_row"
Cohesion: 0.26
Nodes (6): append_safe_row(), append_styled_headers(), build_apply_filters(), apply_filters(), CoordinatorExportView, get_scoped_queryset()

### Community 18 - "RolePermission"
Cohesion: 0.09
Nodes (15): RolePermission(), IsAdminOrUserOrSuperAdminOrCoordinatorTests, IsAdminOrUserPermissionTests, IsAdminPermissionTests, IsChronicleMasterPermissionTests, IsDeleteAuthPermissionTests, IsMasterOrSuperAdminPermissionTests, IsMasterPermissionTests (+7 more)

### Community 19 - "MISReport"
Cohesion: 0.14
Nodes (7): MISReport, Meta, AccumulatorExportView, ChronicleExportView, MISReportListCreateView, ReceivedMISReportsView, _with_author()

### Community 20 - "RecordAdapter"
Cohesion: 0.10
Nodes (5): AuditAdapter, AuditViewHolder, OnAuditActionListener, RecordAdapter, ViewHolder

### Community 21 - "DeleteAuthActivity.java"
Cohesion: 0.24
Nodes (5): DeleteAuthActivity, DeleteAuthDashboardFragment, OnViewAllClickListener, DeleteAuthHistoryFragment, DeleteAuthPendingFragment

### Community 22 - "._setup_base"
Cohesion: 0.07
Nodes (10): BackupConfigAPITests, CertificationAPITests, DashboardCountsAPITests, FDPAPITests, FDPDateRangeTests, FDPListPaginationTests, PatentAPITests, PatentListPaginationTests (+2 more)

### Community 23 - "SchoolModelTests"
Cohesion: 0.07
Nodes (3): CampusModelTests, SchoolModelTests, UserSchoolMappingModelTests

### Community 24 - "ErrorTicketDetailSerializer"
Cohesion: 0.11
Nodes (8): ErrorOccurrenceSerializer, Meta, ErrorTicketDetailSerializer, Meta, ErrorTicketListSerializer, Meta, ErrorOccurrenceSerializerTests, ErrorTicketSerializerTests

### Community 25 - "RecordTestMixin"
Cohesion: 0.12
Nodes (4): PlacementActivityModelTests, RecordTestMixin, StudentActivityCollaborationTests, StudentActivityModelTests

### Community 26 - "Django Audit Views"
Cohesion: 0.09
Nodes (26): Client HTML Document Entry, DOM Root Mount Node, Native Android Client, Multi-Tier Web and Service Architecture, Audit and Delete Approval Workflow, Automated Test Suite (390 Tests), Gunicorn WSGI Concurrency Configuration, Locust Multi-Role Load Testing (+18 more)

### Community 29 - "Override"
Cohesion: 0.20
Nodes (5): Callback<JsonObject>, Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 31 - "Django Service Bug Reports"
Cohesion: 0.09
Nodes (7): BugReport, Meta, BugReportListSerializer, Meta, BugReportModelTests, BugReportDetailView, BugReportListView

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

### Community 37 - "Django App Config Registry"
Cohesion: 0.11
Nodes (6): AccountsConfig, AuditConfig, ExportConfig, RecordsConfig, SchoolsConfig, ServiceConfig

### Community 39 - "BaseRecordFragment"
Cohesion: 0.08
Nodes (7): BaseRecordFragment, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<List<JsonObject>>, RecordAdapter.OnRecordActionListener, Callback<JsonObject>

### Community 42 - "package.json"
Cohesion: 0.05
Nodes (44): author, dependencies, axios, @heroicons/react, react, react-dom, react-router-dom, devDependencies (+36 more)

### Community 43 - "ErrorTicketStatusView"
Cohesion: 0.18
Nodes (5): TicketStatusUpdateSerializer, ApiStatusView, extract_urls(), ErrorTicketStatusView, ServiceDashboardStatsView

### Community 45 - "RecordSerializerTests"
Cohesion: 0.33
Nodes (3): ClubSerializer, Meta, RecordSerializerTests

### Community 48 - "Override"
Cohesion: 0.10
Nodes (6): Filter, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>, android.text.TextWatcher, Callback<JsonObject>

### Community 55 - "RecordBinder"
Cohesion: 0.14
Nodes (3): OnRecordActionListener, RecordBinder, RecordAdapter.RecordBinder

### Community 58 - "User"
Cohesion: 0.04
Nodes (34): User, Meta, ChronicleAccumulatorSerializer, Meta, LoginSerializer, UserCreateSerializer, Meta, UserSerializer (+26 more)

### Community 59 - "Django Backup Config"
Cohesion: 0.27
Nodes (4): BackupConfigurationSerializer, Meta, BackupConfigurationView, TriggerManualBackupView

### Community 60 - "ApiClient.java"
Cohesion: 0.08
Nodes (4): ApiClient, CookieJar, TokenUsed, retrofit2.Callback<com.google.gson.JsonObject>

### Community 62 - "Android Faculties Fragment"
Cohesion: 0.12
Nodes (7): BadgeStyle, DARK, GRAY, OUTLINE, RED, FacultiesFragment, RecordAdapter.RecordBinder

### Community 66 - "Django School Tests"
Cohesion: 0.22
Nodes (3): CampusSchoolsViewTests, CampusUsersSchoolViewTests, SchoolReactivateViewTests

### Community 68 - "Override"
Cohesion: 0.14
Nodes (5): ClubsFragment, Callback<JsonObject>, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 71 - "ExportTestMixin"
Cohesion: 0.06
Nodes (8): CoordinatorExportViewTests, ExportHistoryViewTests, ExportSchoolActivitiesViewTests, ExportTestMixin, IntegrityRuleTests, MISDataRequestViewTests, MISReportViewTests, NewExportEndpointsTests

### Community 73 - "Django Error Serializer Tests"
Cohesion: 0.31
Nodes (3): ReportErrorSerializer, ReportErrorSerializerTests, ReportErrorView

### Community 78 - "AuditListPaginationTests"
Cohesion: 0.04
Nodes (7): AuditApproveViewTests, AuditHistoryPaginationTests, AuditHistoryViewTests, AuditListPaginationTests, AuditRejectViewTests, AuditRequestListViewTests, AuditRowLockTests

### Community 80 - "TestCase"
Cohesion: 0.08
Nodes (5): BackupConfigurationModelTests, CertificationModelTests, PatentApplicantIndexTests, PublicationAuthorTests, PublicationModelTests

### Community 89 - "Module Cluster 89"
Cohesion: 0.25
Nodes (4): BugReportCreateSerializer, Meta, BugReportCreateSerializerTests, BugReportCreateView

### Community 125 - "GeneratedExport"
Cohesion: 0.12
Nodes (6): GeneratedExport, Meta, GeneratedExportModelTests, ExportHistorySerializer, Meta, ExportHistoryView

## Knowledge Gaps
- **22 isolated node(s):** `@types/react`, `@types/react-dom`, `autoprefixer`, `postcss`, `tailwindcss` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 880 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **71 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Campus` connect `Django School Models` to `export/views.py`, `export/tasks.py`, `MISDataRequest`, `Django Audit Models`, `export/tests.py`, `get_user_school_ids`, `RolePermission`, `SchoolModelTests`, `RecordTestMixin`, `Django User Model Tests`, `AccountIntegrityTests`, `User`, `SchoolFacultyViewTests`, `Django School Tests`, `ExportTestMixin`, `Django User-School Mapping Tests`, `AuditListPaginationTests`, `override_settings`, `APITestCase`, `SchoolFacultiesViewTests`, `MySchoolsViewTests`, `Module Cluster 99`, `Module Cluster 106`, `Module Cluster 114`, `Module Cluster 115`, `GeneratedExport`, `CampusReactivateViewTests`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **What connects `@types/react`, `@types/react-dom`, `autoprefixer` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Android API Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.05304982817869416 - nodes in this community are weakly interconnected._
- **Why does `User` connect `User` to `records/views.py`, `export/views.py`, `audit/views.py`, `export/tasks.py`, `Django School Models`, `MISDataRequest`, `django_db`, `get_user_school_ids`, `ErrorTicket`, `TestCase`, `CoApplicantVisibilityTests`, `CoAuthorVisibilityTests`, `RecordTestMixin`, `Django Service Bug Reports`, `SchoolActivityAPITests`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `records/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.03494335122242099 - nodes in this community are weakly interconnected._
- **Why does `School` connect `Django School Models` to `records/views.py`, `export/views.py`, `audit/views.py`, `export/tasks.py`, `export/tests.py`, `get_user_school_ids`, `SchoolModelTests`, `RecordTestMixin`, `AuditRequestModelTests`, `AccountIntegrityTests`, `User`, `SchoolFacultyViewTests`, `Django School Tests`, `ExportTestMixin`, `Django User-School Mapping Tests`, `DashboardCountsCacheTests`, `AuditListPaginationTests`, `SchoolFacultiesViewTests`, `MySchoolsViewTests`, `Module Cluster 106`, `Module Cluster 115`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `export/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05568627450980392 - nodes in this community are weakly interconnected._