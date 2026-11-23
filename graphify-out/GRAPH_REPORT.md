# Graph Report - nmpralekh  (2026-11-23)

## Corpus Check
- 227 files · ~98,051 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .xml 33, (none) 6, .properties 3)

## Summary
- 2678 nodes · 7576 edges · 169 communities (71 shown, 98 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 787 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e71c4a62`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Android API Service Layer
- PublicationAuthor
- export/views.py
- Android Record Fragments
- FanOutWriteTests
- HomeDashboardFragment
- export/tasks.py
- PageHeader
- LoginViewTests
- records/tests.py
- ErrorTicket
- Django Audit Models
- django_db
- AuditRequestModelTests
- get_user_school_ids
- ErrorTicketDetailSerializer
- AdminActivity.java
- append_safe_row
- RolePermission
- accounts/urls.py
- AuditAdapter
- Override
- APITestCase
- SchoolModelTests
- PatentApplicantListCreateView
- TestCase
- Django Audit Views
- BackgroundExportAllTests
- SessionManager
- Override
- service/views.py
- .jsonStr
- StudentActivitiesFragment
- androidx.fragment.app.Fragment
- Override
- Django User Model Tests
- Django App Config Registry
- AuditedDetailMixin
- BaseRecordFragment
- RecordBinder
- ClubListPaginationTests
- package.json
- ErrorOccurrence
- AuditApproveViewTests
- AuditListPaginationTests
- django_conf
- AuditRequestIndexTests
- Override
- CertificationListPaginationTests
- StudentActivity
- CoApplicantVisibilityTests
- Django Service Tests
- AccountIntegrityTests
- UserSchoolMappingViewTests
- CoAuthorVisibilityTests
- SchoolActivityAPITests
- accounts/views.py
- BackupConfiguration
- ApiClient.java
- Android Campus Users Fragment
- Android Faculties Fragment
- ReceivedMISDataFragment
- Patent
- SchoolActivityListPaginationTests
- APITestCase
- Django Error Fingerprint
- Override
- TrustBoundaryTests
- ReportErrorSerializer
- APITestCase
- BugReportModelTests
- ServiceUserManagementViewTests
- Django Settings Configuration
- AccumulatorDashboardTests
- django_db_models_deletion
- DashboardCountsCacheTests
- ._setup_base
- ChronicleDataRequest
- records/serializers.py
- PlacementListPaginationTests
- LoginSerializer
- Module Cluster 83
- GeneratedExportModelTests
- .performLogout
- LoginDuringRedisOutageTests
- records/views.py
- LogoutViewTests
- SchoolScopedMixin
- IntegrityRuleTests
- throttles.py
- MISReport
- AuditHistoryPaginationTests
- _lock_pending_audit
- MISReportViewTests
- NewExportEndpointsTests
- ErrorOccurrenceModelTests
- MISReportSerializer
- FixedWindowThrottle
- ClubAPITests
- CampusListCreateViewTests
- UserDetailViewTests
- UserListCreateViewTests
- AuditHistoryViewTests
- ChronicleDashboardTests
- SchoolListCreateViewTests
- override_settings
- ChronicleMasterManagementViewTests
- APITestCase
- SchoolActivity
- FDPListPaginationTests
- PatentListPaginationTests
- StudentActivityListPaginationTests
- CampusDetailViewTests
- SchoolDetailViewTests
- SchoolFacultyViewTests
- SchoolFacultiesViewTests
- ServiceUserManagementView
- CampusReactivateViewTests
- MySchoolsViewTests
- 0009_mis_report_sent_from_time.py
- FacultyFDPWorkshopGL
- MISDataRequestSerializer
- MISDataRequest
- Certification
- PlacementActivity
- RecordTestMixin
- UserCreateSerializer
- ._setup_base
- Module Cluster 132
- User
- UserVisibilitySerializer
- UserSerializer
- UserUpdateSerializer
- ._setup_base
- _job_file_for
- PublicationListPaginationTests
- PatentApplicantIndexTests
- ExportHistoryView
- FacultyUserSearchView
- CampusUsersView
- CampusUsersView
- SchoolFacultiesView
- AccumulatorDashboardView
- 0003_add_mis_coordinator_role.py
- 0006_alter_user_role.py
- 0007_user_is_chronicle_master_alter_user_role.py
- 0009_integrity_rules.py
- 0005_misreport_sent_to_chronicle_master_and_more.py
- 0007_chronicle_data_requests.py
- records/migrations/0001_initial.py
- 0008_drop_coauthor_is_primary.py
- service/migrations/0001_initial.py

## God Nodes (most connected - your core abstractions)
1. `PageHeader()` - 81 edges
2. `Button()` - 72 edges
3. `ApiService` - 66 edges
4. `User` - 63 edges
5. `FormError()` - 61 edges
6. `Badge()` - 60 edges
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

## Communities (169 total, 98 thin omitted)

### Community 0 - "Android API Service Layer"
Cohesion: 0.05
Nodes (12): locust.sh script, AdminUser, BaseMISUser, ChronicleMasterUser, DeleteAuthUser, FacultyUser, MasterUser, MISAccumulatorUser (+4 more)

### Community 1 - "PublicationAuthor"
Cohesion: 0.06
Nodes (14): Club, Meta, PublicationAuthor, Meta, ClubSerializer, Meta, PublicationAuthorSerializer, Meta (+6 more)

### Community 2 - "export/views.py"
Cohesion: 0.12
Nodes (11): ExportCertificationsView, ExportDownloadView, ExportFDPView, ExportPatentsView, ExportPlacementsView, ExportPublicationsView, ExportSchoolActivitiesView, ExportStudentActivitiesView (+3 more)

### Community 4 - "FanOutWriteTests"
Cohesion: 0.33
Nodes (3): FanOutWriteTests, add_campuses(), _queries()

### Community 5 - "HomeDashboardFragment"
Cohesion: 0.08
Nodes (8): AdminActivity, BaseAuthActivity, FacultyActivity, CertificationsFragment, FDPFragment, HomeDashboardFragment, OnModuleClickListener, SuperAdminActivity

### Community 6 - "export/tasks.py"
Cohesion: 0.07
Nodes (18): GeneratedExport, Meta, _append_styled_headers(), build_campus_workbook(), ensure_export_dir(), export_all_for_user(), export_single_campus(), generate_manual_export() (+10 more)

### Community 7 - "PageHeader"
Cohesion: 0.05
Nodes (148): api, apiErrors(), App(), RoleRedirect(), BugReportButton(), ErrorBoundary, Layout(), roleNavLinks (+140 more)

### Community 9 - "records/tests.py"
Cohesion: 0.05
Nodes (34): UserManager, ChronicleAccumulatorSerializer, Meta, AuditTestMixin, FacultyPublication, Meta, Campus, Meta (+26 more)

### Community 10 - "ErrorTicket"
Cohesion: 0.18
Nodes (3): ErrorTicket, Meta, ErrorTicketModelTests

### Community 11 - "Django Audit Models"
Cohesion: 0.07
Nodes (8): BugReportCreateViewTests, BugReportDetailViewTests, BugReportListViewTests, ErrorTicketDetailViewTests, ErrorTicketListViewTests, ErrorTicketStatusViewTests, ServiceDashboardStatsViewTests, ServiceTestMixin

### Community 12 - "django_db"
Cohesion: 0.10
Nodes (10): Migration, Migration, Migration, Migration, Migration, Migration, Migration, Migration (+2 more)

### Community 14 - "get_user_school_ids"
Cohesion: 0.07
Nodes (15): AuditRequest, Meta, AuditRequestSerializer, Meta, AuditRowLockTests, AuditHistoryView, AuditRequestDetailView, AuditRequestListView (+7 more)

### Community 15 - "ErrorTicketDetailSerializer"
Cohesion: 0.12
Nodes (7): ErrorTicketDetailSerializer, Meta, ErrorTicketListSerializer, Meta, ErrorTicketSerializerTests, ErrorTicketDetailView, ErrorTicketListView

### Community 17 - "append_safe_row"
Cohesion: 0.08
Nodes (15): append_safe_row(), ExportHelperFunctionTests, AccumulatorExportView, append_styled_headers(), build_apply_filters(), apply_filters(), ChronicleExportView, CoordinatorExportView (+7 more)

### Community 18 - "RolePermission"
Cohesion: 0.08
Nodes (16): RolePermission(), IsAdminOrUserOrSuperAdminOrCoordinatorTests, IsAdminOrUserPermissionTests, IsAdminPermissionTests, IsChronicleMasterPermissionTests, IsDeleteAuthPermissionTests, IsMasterOrSuperAdminPermissionTests, IsMasterPermissionTests (+8 more)

### Community 19 - "accounts/urls.py"
Cohesion: 0.20
Nodes (4): ChronicleMasterManagementView, LogoutView, MeView, RefreshTokenView

### Community 20 - "AuditAdapter"
Cohesion: 0.13
Nodes (4): AuditAdapter, AuditViewHolder, OnAuditActionListener, ViewHolder

### Community 21 - "Override"
Cohesion: 0.23
Nodes (4): Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 22 - "APITestCase"
Cohesion: 0.17
Nodes (5): CertificationAPITests, FDPAPITests, FDPDateRangeTests, PatentAPITests, PlacementAPITests

### Community 23 - "SchoolModelTests"
Cohesion: 0.07
Nodes (3): CampusModelTests, SchoolModelTests, UserSchoolMappingModelTests

### Community 24 - "PatentApplicantListCreateView"
Cohesion: 0.26
Nodes (3): PatentApplicantListCreateView, PublicationAuthorListCreateView, replace_people()

### Community 25 - "TestCase"
Cohesion: 0.05
Nodes (9): BackupConfigurationModelTests, CertificationModelTests, FDPWorkshopGLModelTests, PlacementActivityModelTests, PublicationAuthorIndexTests, PublicationModelTests, SchoolActivityCollaborationTests, SchoolActivityModelTests (+1 more)

### Community 26 - "Django Audit Views"
Cohesion: 0.09
Nodes (26): Client HTML Document Entry, DOM Root Mount Node, Native Android Client, Multi-Tier Web and Service Architecture, Audit and Delete Approval Workflow, Automated Test Suite (390 Tests), Gunicorn WSGI Concurrency Configuration, Locust Multi-Role Load Testing (+18 more)

### Community 29 - "Override"
Cohesion: 0.20
Nodes (5): Callback<JsonObject>, Callback<JsonObject>, AuditAdapter.OnAuditActionListener, Callback<JsonObject>, Callback<JsonObject>

### Community 31 - "service/views.py"
Cohesion: 0.09
Nodes (13): BugReport, Meta, BugReportAdminUpdateSerializer, Meta, BugReportListSerializer, Meta, TicketStatusUpdateSerializer, ApiStatusView (+5 more)

### Community 33 - "StudentActivitiesFragment"
Cohesion: 0.13
Nodes (4): StudentActivitiesFragment, AdapterView.OnItemSelectedListener, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 34 - "androidx.fragment.app.Fragment"
Cohesion: 0.22
Nodes (5): DeleteAuthActivity, DeleteAuthDashboardFragment, OnViewAllClickListener, DeleteAuthHistoryFragment, DeleteAuthPendingFragment

### Community 35 - "Override"
Cohesion: 0.07
Nodes (11): Callback<JsonObject>, Callback<JsonElement>, Callback<List<JsonObject>>, FacultyAutoCompleteAdapter, Filter, PublicationsFragment, Callback<JsonObject>, RecordAdapter.RecordBinder (+3 more)

### Community 37 - "Django App Config Registry"
Cohesion: 0.11
Nodes (6): AccountsConfig, AuditConfig, ExportConfig, RecordsConfig, SchoolsConfig, ServiceConfig

### Community 38 - "AuditedDetailMixin"
Cohesion: 0.15
Nodes (7): FacultyPublicationSerializer, Meta, AuditedDetailMixin, create_audit_request(), PatentDetailView, PublicationDetailView, StudentActivityDetailView

### Community 39 - "BaseRecordFragment"
Cohesion: 0.08
Nodes (7): BaseRecordFragment, Callback<JsonObject>, Callback<JsonObject>, Callback<JsonObject>, Callback<List<JsonObject>>, RecordAdapter.OnRecordActionListener, Callback<JsonObject>

### Community 40 - "RecordBinder"
Cohesion: 0.09
Nodes (4): PlacementsFragment, RecordAdapter.RecordBinder, SchoolActivitiesFragment, RecordAdapter.RecordBinder

### Community 42 - "package.json"
Cohesion: 0.05
Nodes (44): author, dependencies, axios, @heroicons/react, react, react-dom, react-router-dom, devDependencies (+36 more)

### Community 43 - "ErrorOccurrence"
Cohesion: 0.22
Nodes (5): ErrorOccurrence, Meta, ErrorOccurrenceSerializer, Meta, ErrorOccurrenceSerializerTests

### Community 46 - "django_conf"
Cohesion: 0.13
Nodes (7): Migration, Migration, Migration, Migration, Migration, Migration, Migration

### Community 48 - "Override"
Cohesion: 0.08
Nodes (8): FacultyAutoCompleteAdapter, Filter, PatentsFragment, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonElement>, android.text.TextWatcher, Callback<JsonObject>

### Community 51 - "StudentActivity"
Cohesion: 0.16
Nodes (4): StudentActivity, Meta, ListQueryCountTests, StudentActivityModelTests

### Community 59 - "BackupConfiguration"
Cohesion: 0.27
Nodes (4): BackupConfigurationSerializer, Meta, BackupConfigurationView, TriggerManualBackupView

### Community 60 - "ApiClient.java"
Cohesion: 0.09
Nodes (3): ApiClient, CookieJar, TokenUsed

### Community 63 - "ReceivedMISDataFragment"
Cohesion: 0.09
Nodes (9): BadgeStyle, DARK, GRAY, OUTLINE, RED, OnRecordActionListener, RecordBinder, ReceivedMISDataFragment (+1 more)

### Community 64 - "Patent"
Cohesion: 0.08
Nodes (7): Patent, Meta, CoPeopleReplaceTests, count_queries(), DetailQueryCountTests, PatentApplicantTests, PatentModelTests

### Community 66 - "APITestCase"
Cohesion: 0.22
Nodes (3): CampusSchoolsViewTests, CampusUsersSchoolViewTests, SchoolReactivateViewTests

### Community 68 - "Override"
Cohesion: 0.12
Nodes (5): ClubsFragment, Callback<JsonObject>, Callback<JsonObject>, RecordAdapter.RecordBinder, Callback<JsonObject>

### Community 70 - "ReportErrorSerializer"
Cohesion: 0.31
Nodes (3): ReportErrorSerializer, ReportErrorSerializerTests, ReportErrorView

### Community 71 - "APITestCase"
Cohesion: 0.14
Nodes (5): CoordinatorExportViewTests, ExportHistoryViewTests, ExportSchoolActivitiesViewTests, ExportTestMixin, MISDataRequestViewTests

### Community 72 - "BugReportModelTests"
Cohesion: 0.12
Nodes (5): BugReportCreateSerializer, Meta, BugReportCreateSerializerTests, BugReportModelTests, BugReportCreateView

### Community 76 - "django_db_models_deletion"
Cohesion: 0.13
Nodes (7): Migration, Migration, Migration, Migration, Migration, Migration, Migration

### Community 79 - "ChronicleDataRequest"
Cohesion: 0.14
Nodes (6): ChronicleDataRequest, Meta, ChronicleDataRequestSerializer, Meta, ChronicleDashboardView, ChronicleDataRequestListCreateView

### Community 80 - "records/serializers.py"
Cohesion: 0.16
Nodes (10): SchoolActivityCollaboration, Meta, StudentActivityCollaboration, Meta, PatentSerializer, Meta, SchoolActivityCollaborationSerializer, Meta (+2 more)

### Community 82 - "LoginSerializer"
Cohesion: 0.33
Nodes (5): LoginSerializer, LoginSerializerTests, local_one_per_second(), LoginView, _too_fast()

### Community 88 - "records/views.py"
Cohesion: 0.21
Nodes (5): PatentApplicant, Meta, PatentApplicantSerializer, Meta, PatentApplicantDetailView

### Community 90 - "SchoolScopedMixin"
Cohesion: 0.19
Nodes (6): InvalidateDashboardCacheMixin, PatentListCreateView, PublicationListCreateView, SchoolActivityListCreateView, SchoolScopedMixin, StudentActivityListCreateView

### Community 92 - "throttles.py"
Cohesion: 0.32
Nodes (3): _get_redis(), _incr_fixed_window(), redis_available()

### Community 93 - "MISReport"
Cohesion: 0.17
Nodes (7): MISReport, Meta, MISReportListCreateView, MISReportSendAccumulatorView, MISReportSendAdminView, MISReportSendChronicleMasterView, MISReportSendSuperAdminView

### Community 95 - "_lock_pending_audit"
Cohesion: 0.32
Nodes (4): AuditApproveView, AuditRejectView, _lock_pending_audit(), _not_found()

### Community 99 - "MISReportSerializer"
Cohesion: 0.18
Nodes (4): check_date_order(), MISReportSerializer, Meta, MISReportSerializerTests

### Community 105 - "AuditHistoryViewTests"
Cohesion: 0.15
Nodes (3): AuditHistoryViewTests, AuditRejectViewTests, AuditRequestListViewTests

### Community 111 - "SchoolActivity"
Cohesion: 0.22
Nodes (6): _gather_coordinator_data(), SchoolActivity, Meta, SchoolActivitySerializer, Meta, SchoolActivityDetailView

### Community 124 - "FacultyFDPWorkshopGL"
Cohesion: 0.22
Nodes (6): FacultyFDPWorkshopGL, Meta, FacultyFDPWorkshopGLSerializer, Meta, FDPDetailView, FDPListCreateView

### Community 125 - "MISDataRequestSerializer"
Cohesion: 0.17
Nodes (4): MISDataRequestSerializer, Meta, MISDataRequestModelTests, MISDataRequestSerializerTests

### Community 126 - "MISDataRequest"
Cohesion: 0.24
Nodes (4): MISDataRequest, Meta, AccumulatorBulkRequestView, MISDataRequestDetailView

### Community 127 - "Certification"
Cohesion: 0.24
Nodes (6): Certification, Meta, CertificationSerializer, Meta, CertificationDetailView, CertificationListCreateView

### Community 128 - "PlacementActivity"
Cohesion: 0.24
Nodes (6): PlacementActivity, Meta, PlacementActivitySerializer, Meta, PlacementDetailView, PlacementListCreateView

### Community 129 - "RecordTestMixin"
Cohesion: 0.20
Nodes (3): DashboardCountsAPITests, PublicationAPITests, RecordTestMixin

### Community 130 - "UserCreateSerializer"
Cohesion: 0.25
Nodes (4): UserCreateSerializer, Meta, UserCreateSerializerTests, UserListCreateView

### Community 133 - "User"
Cohesion: 0.25
Nodes (3): User, Meta, ChronicleAccumulatorsView

### Community 139 - "UserVisibilitySerializer"
Cohesion: 0.32
Nodes (3): UserVisibilitySerializer, Meta, UserVisibilitySerializerTests

### Community 147 - "UserSerializer"
Cohesion: 0.38
Nodes (3): UserSerializer, Meta, UserSerializerTests

### Community 148 - "UserUpdateSerializer"
Cohesion: 0.29
Nodes (3): UserUpdateSerializer, Meta, UserDetailView

### Community 150 - "_job_file_for"
Cohesion: 0.33
Nodes (3): ExportJobDownloadView, ExportJobView, _job_file_for()

### Community 153 - "ExportHistoryView"
Cohesion: 0.33
Nodes (3): ExportHistorySerializer, Meta, ExportHistoryView

## Knowledge Gaps
- **22 isolated node(s):** `DARK`, `OUTLINE`, `RED`, `GRAY`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 891 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **98 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `PlacementActivity`, `PublicationAuthor`, `UserCreateSerializer`, `export/views.py`, `RecordTestMixin`, `export/tasks.py`, `records/tests.py`, `ErrorTicket`, `UserVisibilitySerializer`, `get_user_school_ids`, `UserSerializer`, `UserUpdateSerializer`, `accounts/urls.py`, `FacultyUserSearchView`, `CampusUsersView`, `CampusUsersView`, `SchoolFacultiesView`, `AccumulatorDashboardView`, `service/views.py`, `ErrorOccurrence`, `StudentActivity`, `CoApplicantVisibilityTests`, `CoAuthorVisibilityTests`, `SchoolActivityAPITests`, `accounts/views.py`, `Patent`, `ChronicleDataRequest`, `records/views.py`, `SchoolActivity`, `ServiceUserManagementView`, `FacultyFDPWorkshopGL`, `MISDataRequest`, `Certification`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `DARK`, `OUTLINE`, `RED` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Android API Service Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.05304982817869416 - nodes in this community are weakly interconnected._
- **Why does `Campus` connect `records/tests.py` to `RecordTestMixin`, `export/views.py`, `FanOutWriteTests`, `export/tasks.py`, `UserVisibilitySerializer`, `Django Audit Models`, `get_user_school_ids`, `RolePermission`, `UserSerializer`, `SchoolModelTests`, `Django User Model Tests`, `ErrorOccurrence`, `AuditListPaginationTests`, `AccountIntegrityTests`, `UserSchoolMappingViewTests`, `APITestCase`, `APITestCase`, `NewExportEndpointsTests`, `CampusListCreateViewTests`, `ChronicleDashboardTests`, `SchoolListCreateViewTests`, `override_settings`, `APITestCase`, `CampusDetailViewTests`, `SchoolDetailViewTests`, `SchoolFacultyViewTests`, `SchoolFacultiesViewTests`, `CampusReactivateViewTests`, `MySchoolsViewTests`, `MISDataRequest`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `PublicationAuthor` be split into smaller, more focused modules?**
  _Cohesion score 0.05731707317073171 - nodes in this community are weakly interconnected._
- **Why does `School` connect `records/tests.py` to `PlacementActivity`, `PublicationAuthor`, `export/views.py`, `RecordTestMixin`, `export/tasks.py`, `UserVisibilitySerializer`, `AuditRequestModelTests`, `get_user_school_ids`, `SchoolModelTests`, `AuditListPaginationTests`, `StudentActivity`, `AccountIntegrityTests`, `UserSchoolMappingViewTests`, `Patent`, `APITestCase`, `APITestCase`, `DashboardCountsCacheTests`, `records/serializers.py`, `SchoolListCreateViewTests`, `SchoolActivity`, `SchoolDetailViewTests`, `SchoolFacultyViewTests`, `SchoolFacultiesViewTests`, `MySchoolsViewTests`, `FacultyFDPWorkshopGL`, `Certification`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `export/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._