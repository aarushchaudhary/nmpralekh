# Graph Report - nmpralekh  (2026-11-09)

## Corpus Check
- 226 files · ~87,440 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 47 file(s) not represented in the graph (top: .xml 31, (none) 5, .properties 3)

## Summary
- 2615 nodes · 7408 edges · 110 communities (54 shown, 56 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 751 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e8fa8cd4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Android API Service Layer
- records/views.py
- export/views.py
- Android Record Fragments
- FixedWindowThrottle
- HomeDashboardFragment
- UserVisibilitySerializer
- PageHeader
- React Component Library
- Django School Models
- ChronicleDataRequestSerializer
- Django Audit Models
- React Dashboard Pages
- accounts/tests.py
- get_user_school_ids
- ErrorTicket
- BaseRecordFragment.java
- Django Records Tests
- RolePermission
- django_conf
- AuditAdapter
- django_db_models_deletion
- records/tests.py
- SchoolModelTests
- ErrorTicketDetailSerializer
- BugReportListSerializer
- Django Audit Views
- BackgroundExportAllTests
- Android Activity Stack
- Override
- UserSchoolMappingModelTests
- Django Service Bug Reports
- .jsonStr
- CampusModelTests
- retrofit2.Response
- FacultyAutoCompleteAdapter
- Django User Model Tests
- Django App Config Registry
- Override
- BaseRecordFragment
- StudentActivitiesFragment
- AuditRequestSerializer
- package.json
- ErrorTicketStatusView
- IntegrityRuleTests
- service/tests.py
- ErrorOccurrenceModelTests
- AuditRequestIndexTests
- Override
- .onResponse
- UserUpdateSerializer
- Django Audit Model Tests
- Django Service Tests
- AccountIntegrityTests
- RecordBinder
- ErrorTicketStatusViewTests
- ViewHolder
- accounts/views.py
- Django Backup Config
- ApiClient.java
- Android Campus Users Fragment
- Android Faculties Fragment
- ReceivedMISDataFragment
- SchoolFacultyViewTests
- export/migrations/0001_initial.py
- Django School Tests
- Django Error Fingerprint
- Override
- TrustBoundaryTests
- Django Audit Pagination Tests
- Django Export Permission Tests
- Django User-School Mapping Tests
- Django Error Serializer Tests
- Django Settings Configuration
- 0003_misreport.py
- Django Audit Approve Tests
- audit/tests.py
- schools/migrations/0001_initial.py
- PublicationAuthor
- Module Cluster 83
- Module Cluster 84
- ._setup_base
- Club
- Module Cluster 89
- Module Cluster 91
- Module Cluster 92
- Module Cluster 99
- Module Cluster 105
- Module Cluster 106
- Module Cluster 109
- Module Cluster 114
- Module Cluster 115
- ._setup_base
- schools/tests.py
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

## Communities (110 total, 56 thin omitted)

### Community 0 - "Android API Service Layer"
Cohesion: 0.05
Nodes (12): locust.sh script, AdminUser, BaseMISUser, ChronicleMasterUser, DeleteAuthUser, FacultyUser, MasterUser, MISAccumulatorUser (+4 more)

### Community 1 - "records/views.py"
Cohesion: 0.04
Nodes (63): AuditHistoryView, AuditRequestListView, _gather_coordinator_data(), _counts_key(), get_dashboard_counts(), invalidate_dashboard_cache(), _stamp_key(), Certification (+55 more)

### Community 2 - "export/views.py"
Cohesion: 0.02
Nodes (56): ChronicleDataRequest, Meta, GeneratedExport, Meta, MISDataRequest, Meta, MISReport, Meta (+48 more)

### Community 4 - "FixedWindowThrottle"
Cohesion: 0.19
Nodes (5): FixedWindowThrottle, AuditApproveView, AuditRejectView, _lock_pending_audit(), _not_found()

### Community 5 - "HomeDashboardFragment"
Cohesion: 0.06
Nodes (12): AdminActivity, BaseAuthActivity, DeleteAuthActivity, FacultyActivity, CertificationsFragment, OnViewAllClickListener, FDPFragment, HomeDashboardFragment (+4 more)

### Community 6 - "UserVisibilitySerializer"
Cohesion: 0.13
Nodes (6): UserVisibilitySerializer, Meta, UserVisibilitySerializerTests, AccumulatorCoordinatorsView, CampusUsersView, FacultyUserSearchView

### Community 7 - "PageHeader"
Cohesion: 0.06
Nodes (145): api, apiErrors(), App(), RoleRedirect(), BugReportButton(), ErrorBoundary, Layout(), roleNavLinks (+137 more)

### Community 8 - "React Component Library"
Cohesion: 0.04
Nodes (10): CampusUsersViewTests, ChronicleMasterManagementViewTests, LoginDuringRedisOutageTests, LoginViewTests, LogoutViewTests, MeViewTests, SchoolFacultiesViewTests, ServiceUserManagementViewTests (+2 more)

### Community 9 - "Django School Models"
Cohesion: 0.05
Nodes (31): User, Meta, SchoolFacultiesView, School, Meta, UserSchoolMapping, Meta, CampusCreateSerializer (+23 more)

### Community 10 - "ChronicleDataRequestSerializer"
Cohesion: 0.25
Nodes (3): check_date_order(), ChronicleDataRequestSerializer, Meta

### Community 11 - "Django Audit Models"
Cohesion: 0.08
Nodes (7): BugReportCreateViewTests, BugReportDetailViewTests, BugReportListViewTests, ErrorTicketDetailViewTests, ErrorTicketListViewTests, ServiceDashboardStatsViewTests, ServiceTestMixin

### Community 12 - "React Dashboard Pages"
Cohesion: 0.06
Nodes (17): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+9 more)

### Community 13 - "accounts/tests.py"
Cohesion: 0.09
Nodes (13): UserManager, ChronicleAccumulatorSerializer, Meta, LoginSerializer, UserCreateSerializer, Meta, UserSerializer, Meta (+5 more)

### Community 14 - "get_user_school_ids"
Cohesion: 0.11
Nodes (6): check_school(), ClubDetailView, DashboardCountsView, PatentApplicantListCreateView, GetUserSchoolIdsTests, get_user_school_ids()

### Community 15 - "ErrorTicket"
Cohesion: 0.14
Nodes (4): ErrorTicket, Meta, ErrorTicketModelTests, ErrorTicketListView

### Community 16 - "BaseRecordFragment.java"
Cohesion: 0.11
Nodes (3): DeleteAuthDashboardFragment, DeleteAuthHistoryFragment, DeleteAuthPendingFragment

### Community 17 - "Django Records Tests"
Cohesion: 0.09
Nodes (12): append_safe_row(), ExportHelperFunctionTests, AccumulatorExportView, append_styled_headers(), build_apply_filters(), apply_filters(), ChronicleExportView, CoordinatorExportView (+4 more)

### Community 18 - "RolePermission"
Cohesion: 0.09
Nodes (15): RolePermission(), IsAdminOrUserOrSuperAdminOrCoordinatorTests, IsAdminOrUserPermissionTests, IsAdminPermissionTests, IsChronicleMasterPermissionTests, IsDeleteAuthPermissionTests, IsMasterOrSuperAdminPermissionTests, IsMasterPermissionTests (+7 more)

### Community 19 - "django_conf"
Cohesion: 0.13
Nodes (7): Migration, Migration, Migration, Migration, Migration, Migration, Migration

### Community 20 - "AuditAdapter"
Cohesion: 0.21
Nodes (3): AuditAdapter, AuditViewHolder, OnAuditActionListener

### Community 21 - "django_db_models_deletion"
Cohesion: 0.13
Nodes (7): Migration, Migration, Migration, Migration, Migration, Migration, Migration

### Community 22 - "records/tests.py"
Cohesion: 0.02
Nodes (32): BackupConfigAPITests, BackupConfigurationModelTests, CertificationAPITests, CertificationListPaginationTests, CertificationModelTests, ClubAPITests, ClubListPaginationTests, CoApplicantVisibilityTests (+24 more)

### Community 24 - "ErrorTicketDetailSerializer"
Cohesion: 0.13
Nodes (6): ErrorTicketDetailSerializer, Meta, ErrorTicketListSerializer, Meta, ErrorTicketSerializerTests, ErrorTicketDetailView

### Community 25 - "BugReportListSerializer"
Cohesion: 0.15
Nodes (6): BugReportAdminUpdateSerializer, Meta, BugReportListSerializer, Meta, BugReportDetailView, BugReportListView

### Community 26 - "Django Audit Views"
Cohesion: 0.09
Nodes (26): Client HTML Document Entry, DOM Root Mount Node, Native Android Client, Multi-Tier Web and Service Architecture, Audit and Delete Approval Workflow, Automated Test Suite (390 Tests), Gunicorn WSGI Concurrency Configuration, Locust Multi-Role Load Testing (+18 more)

### Community 29 - "Override"
Cohesion: 0.20
Nodes (5): Callback<JsonObject>, Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 31 - "Django Service Bug Reports"
Cohesion: 0.17
Nodes (3): BugReport, Meta, BugReportModelTests

### Community 32 - ".jsonStr"
Cohesion: 0.10
Nodes (6): RecordAdapter.RecordBinder, PublicationsFragment, Callback<JsonObject>, RecordAdapter.RecordBinder, android.text.TextWatcher, Callback<JsonObject>

### Community 34 - "retrofit2.Response"
Cohesion: 0.09
Nodes (8): Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonElement>, Callback<List<JsonObject>>, Callback<JsonObject>

### Community 35 - "FacultyAutoCompleteAdapter"
Cohesion: 0.11
Nodes (4): FacultyAutoCompleteAdapter, Filter, FacultyAutoCompleteAdapter, Filter

### Community 37 - "Django App Config Registry"
Cohesion: 0.11
Nodes (6): AccountsConfig, AuditConfig, ExportConfig, RecordsConfig, SchoolsConfig, ServiceConfig

### Community 39 - "BaseRecordFragment"
Cohesion: 0.08
Nodes (7): BaseRecordFragment, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<List<JsonObject>>, RecordAdapter.OnRecordActionListener, Callback<JsonObject>

### Community 40 - "StudentActivitiesFragment"
Cohesion: 0.10
Nodes (4): StudentActivitiesFragment, AdapterView.OnItemSelectedListener, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 41 - "AuditRequestSerializer"
Cohesion: 0.29
Nodes (4): AuditRequestSerializer, Meta, AuditRequestSerializerTests, AuditRequestDetailView

### Community 42 - "package.json"
Cohesion: 0.05
Nodes (42): dependencies, axios, @heroicons/react, react, react-dom, react-router-dom, devDependencies, autoprefixer (+34 more)

### Community 43 - "ErrorTicketStatusView"
Cohesion: 0.18
Nodes (5): TicketStatusUpdateSerializer, ApiStatusView, extract_urls(), ErrorTicketStatusView, ServiceDashboardStatsView

### Community 45 - "service/tests.py"
Cohesion: 0.22
Nodes (5): ErrorOccurrence, Meta, ErrorOccurrenceSerializer, Meta, ErrorOccurrenceSerializerTests

### Community 48 - "Override"
Cohesion: 0.11
Nodes (6): PatentsFragment, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>, android.text.TextWatcher, Callback<JsonObject>

### Community 51 - "UserUpdateSerializer"
Cohesion: 0.29
Nodes (3): UserUpdateSerializer, Meta, UserDetailView

### Community 52 - "Django Audit Model Tests"
Cohesion: 0.14
Nodes (3): AuditRequest, Meta, AuditRequestModelTests

### Community 55 - "RecordBinder"
Cohesion: 0.13
Nodes (4): OnRecordActionListener, RecordBinder, RecordAdapter.RecordBinder, RecordAdapter.RecordBinder

### Community 58 - "accounts/views.py"
Cohesion: 0.09
Nodes (11): _get_redis(), _incr_fixed_window(), local_one_per_second(), redis_available(), ChronicleMasterManagementView, LoginView, LogoutView, MeView (+3 more)

### Community 59 - "Django Backup Config"
Cohesion: 0.27
Nodes (4): BackupConfigurationSerializer, Meta, BackupConfigurationView, TriggerManualBackupView

### Community 60 - "ApiClient.java"
Cohesion: 0.07
Nodes (4): ApiClient, CookieJar, TokenUsed, LoginActivity

### Community 63 - "ReceivedMISDataFragment"
Cohesion: 0.12
Nodes (7): BadgeStyle, DARK, GRAY, OUTLINE, RED, ReceivedMISDataFragment, RecordAdapter.RecordBinder

### Community 66 - "Django School Tests"
Cohesion: 0.16
Nodes (4): CampusSchoolsViewTests, CampusUsersSchoolViewTests, MySchoolsViewTests, SchoolReactivateViewTests

### Community 68 - "Override"
Cohesion: 0.14
Nodes (5): ClubsFragment, Callback<JsonObject>, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 69 - "TrustBoundaryTests"
Cohesion: 0.11
Nodes (4): BackupConfiguration, Meta, perform_db_backup(), TrustBoundaryTests

### Community 73 - "Django Error Serializer Tests"
Cohesion: 0.31
Nodes (3): ReportErrorSerializer, ReportErrorSerializerTests, ReportErrorView

### Community 78 - "audit/tests.py"
Cohesion: 0.18
Nodes (4): AuditHistoryViewTests, AuditRejectViewTests, AuditRequestListViewTests, AuditTestMixin

### Community 80 - "PublicationAuthor"
Cohesion: 0.06
Nodes (13): PublicationAuthor, Meta, ClubSerializer, Meta, PublicationAuthorSerializer, Meta, StudentActivitySerializer, Meta (+5 more)

### Community 88 - "Club"
Cohesion: 0.12
Nodes (4): Club, Meta, ClubModelTests, StudentActivityModelTests

### Community 89 - "Module Cluster 89"
Cohesion: 0.25
Nodes (4): BugReportCreateSerializer, Meta, BugReportCreateSerializerTests, BugReportCreateView

### Community 105 - "Module Cluster 105"
Cohesion: 0.18
Nodes (5): SchoolActivityCollaboration, Meta, SchoolActivityCollaborationSerializer, Meta, SchoolActivityCollaborationTests

## Knowledge Gaps
- **22 isolated node(s):** `DARK`, `OUTLINE`, `RED`, `GRAY`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 878 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Campus` connect `export/views.py` to `UserVisibilitySerializer`, `React Component Library`, `Django School Models`, `Django Audit Models`, `accounts/tests.py`, `get_user_school_ids`, `RolePermission`, `records/tests.py`, `SchoolModelTests`, `UserSchoolMappingModelTests`, `CampusModelTests`, `Django User Model Tests`, `service/tests.py`, `AccountIntegrityTests`, `SchoolFacultyViewTests`, `Django School Tests`, `Django Audit Pagination Tests`, `Django User-School Mapping Tests`, `audit/tests.py`, `Module Cluster 92`, `Module Cluster 99`, `Module Cluster 106`, `Module Cluster 114`, `Module Cluster 115`, `schools/tests.py`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `DARK`, `OUTLINE`, `RED` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Android API Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.05304982817869416 - nodes in this community are weakly interconnected._
- **Why does `User` connect `Django School Models` to `records/views.py`, `export/views.py`, `TrustBoundaryTests`, `UserVisibilitySerializer`, `accounts/tests.py`, `service/tests.py`, `ErrorTicket`, `PublicationAuthor`, `UserUpdateSerializer`, `Django Audit Model Tests`, `records/tests.py`, `Club`, `accounts/views.py`, `Django Service Bug Reports`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `records/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.03907684238132704 - nodes in this community are weakly interconnected._
- **Why does `School` connect `Django School Models` to `records/views.py`, `export/views.py`, `UserVisibilitySerializer`, `React Component Library`, `accounts/tests.py`, `get_user_school_ids`, `records/tests.py`, `SchoolModelTests`, `UserSchoolMappingModelTests`, `Django Audit Model Tests`, `AccountIntegrityTests`, `SchoolFacultyViewTests`, `Django School Tests`, `Django Audit Pagination Tests`, `Django User-School Mapping Tests`, `audit/tests.py`, `Club`, `Module Cluster 105`, `Module Cluster 106`, `Module Cluster 115`, `schools/tests.py`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `export/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.02456306093528578 - nodes in this community are weakly interconnected._