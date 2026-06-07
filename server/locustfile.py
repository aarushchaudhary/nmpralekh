"""
Locust load testing for the NMPralekh MIS Dashboard API.

Simulates realistic multi-role traffic covering all 9 user roles and all
major endpoints across accounts, schools, records, audit, export, and service.

Setup:
    pip install locust

    Set tokens via environment variables:
        export LOCUST_TOKEN_MASTER="eyJ..."
        export LOCUST_TOKEN_SUPER_ADMIN="eyJ..."
        export LOCUST_TOKEN_ADMIN="eyJ..."
        export LOCUST_TOKEN_FACULTY="eyJ..."
        export LOCUST_TOKEN_DELETE_AUTH="eyJ..."
        export LOCUST_TOKEN_MIS_COORDINATOR="eyJ..."
        export LOCUST_TOKEN_MIS_ACCUMULATOR="eyJ..."
        export LOCUST_TOKEN_CHRONICLE_MASTER="eyJ..."
        export LOCUST_TOKEN_SERVICE_ADMIN="eyJ..."

Run:
    locust -f locustfile.py --host=https://127.0.0.1:8000

    Or headless:
    locust -f locustfile.py --host=https://127.0.0.1:8000 \
        --headless --users 500 --spawn-rate 10 --run-time 5m
"""

import os
import random
from locust import HttpUser, task, between, tag
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ─── Tokens ──────────────────────────────────────────────────────────────────
# Capture these from the browser (DevTools → Application → Cookies → access_token)
# NEVER hardcode real tokens here — always use environment variables.
TOKENS = {
    "master":            os.environ.get("LOCUST_TOKEN_MASTER", ""),
    "super_admin":       os.environ.get("LOCUST_TOKEN_SUPER_ADMIN", ""),
    "admin":             os.environ.get("LOCUST_TOKEN_ADMIN", ""),
    "faculty":           os.environ.get("LOCUST_TOKEN_FACULTY", ""),
    "delete_auth":       os.environ.get("LOCUST_TOKEN_DELETE_AUTH", ""),
    "mis_coordinator":   os.environ.get("LOCUST_TOKEN_MIS_COORDINATOR", ""),
    "mis_accumulator":   os.environ.get("LOCUST_TOKEN_MIS_ACCUMULATOR", ""),
    "chronicle_master":  os.environ.get("LOCUST_TOKEN_CHRONICLE_MASTER", ""),
    "service_admin":     os.environ.get("LOCUST_TOKEN_SERVICE_ADMIN", ""),
}


# ─── Base User ───────────────────────────────────────────────────────────────

class BaseMISUser(HttpUser):
    abstract = True
    verify = False
    # Realistic think-time: 10-30 minutes between actions.
    # For quick stress tests, override via CLI: --override-plan-wait-time
    wait_time = between(600, 1800)

    def on_start(self):
        token = TOKENS.get(self.role_name)
        if token:
            self.client.cookies.set("access_token", token)


# ═══════════════════════════════════════════════════════════════════════════════
# MASTER — Weight: 1 (very few master users)
# Manages campuses, schools, users, assignments, backup config.
# ═══════════════════════════════════════════════════════════════════════════════

class MasterUser(BaseMISUser):
    weight = 1
    role_name = "master"

    @tag("structure")
    @task(5)
    def list_campuses(self):
        self.client.get("/api/schools/campuses/", name="/api/schools/campuses/")

    @tag("structure")
    @task(5)
    def list_schools(self):
        self.client.get("/api/schools/", name="/api/schools/")

    @tag("users")
    @task(4)
    def list_users(self):
        self.client.get("/api/users/", name="/api/users/")

    @tag("users")
    @task(2)
    def list_user_school_mappings(self):
        self.client.get("/api/schools/assign/", name="/api/schools/assign/")

    @tag("export")
    @task(2)
    def export_history(self):
        self.client.get("/api/export/history/", name="/api/export/history/")

    @tag("config")
    @task(1)
    def backup_config(self):
        self.client.get("/api/records/backup-config/", name="/api/records/backup-config/")

    @tag("auth")
    @task(1)
    def me(self):
        self.client.get("/api/auth/me/", name="/api/auth/me/")


# ═══════════════════════════════════════════════════════════════════════════════
# SUPER ADMIN — Weight: 10
# Read-only campus oversight: dashboard, records, users, exports.
# ═══════════════════════════════════════════════════════════════════════════════

class SuperAdminUser(BaseMISUser):
    weight = 10
    role_name = "super_admin"

    @tag("dashboard")
    @task(6)
    def dashboard_counts(self):
        self.client.get("/api/records/dashboard-counts/", name="/api/records/dashboard-counts/")

    @tag("users")
    @task(3)
    def campus_users(self):
        self.client.get("/api/users/campus-users/", name="/api/users/campus-users/")

    @tag("records")
    @task(3)
    def view_school_activities(self):
        self.client.get("/api/records/school-activities/", name="/api/records/school-activities/")

    @tag("records")
    @task(3)
    def view_publications(self):
        self.client.get("/api/records/publications/", name="/api/records/publications/")

    @tag("records")
    @task(2)
    def view_patents(self):
        self.client.get("/api/records/patents/", name="/api/records/patents/")

    @tag("records")
    @task(2)
    def view_certifications(self):
        self.client.get("/api/records/certifications/", name="/api/records/certifications/")

    @tag("export")
    @task(2)
    def export_all(self):
        self.client.get(
            "/api/export/all/",
            params={"date_from": "2025-01-01", "date_to": "2025-12-31"},
            name="/api/export/all/",
        )

    @tag("schools")
    @task(2)
    def my_schools(self):
        self.client.get("/api/schools/my-schools/", name="/api/schools/my-schools/")

    @tag("audit")
    @task(1)
    def audit_history(self):
        self.client.get("/api/audit/history/", name="/api/audit/history/")

    @tag("auth")
    @task(1)
    def me(self):
        self.client.get("/api/auth/me/", name="/api/auth/me/")


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN — Weight: 15
# School-level management: clubs, records, faculties, exports.
# ═══════════════════════════════════════════════════════════════════════════════

class AdminUser(BaseMISUser):
    weight = 15
    role_name = "admin"

    @tag("dashboard")
    @task(6)
    def dashboard_counts(self):
        self.client.get("/api/records/dashboard-counts/", name="/api/records/dashboard-counts/")

    @tag("records")
    @task(4)
    def list_clubs(self):
        self.client.get("/api/records/clubs/", name="/api/records/clubs/")

    @tag("records")
    @task(3)
    def list_school_activities(self):
        self.client.get("/api/records/school-activities/", name="/api/records/school-activities/")

    @tag("records")
    @task(3)
    def list_student_activities(self):
        self.client.get("/api/records/student-activities/", name="/api/records/student-activities/")

    @tag("records")
    @task(2)
    def list_placements(self):
        self.client.get("/api/records/placements/", name="/api/records/placements/")

    @tag("users")
    @task(3)
    def school_faculties(self):
        self.client.get("/api/users/school-faculties/", name="/api/users/school-faculties/")

    @tag("export")
    @task(2)
    def export_school_activities(self):
        self.client.get(
            "/api/export/school-activities/",
            params={"date_from": "2025-01-01", "date_to": "2025-12-31"},
            name="/api/export/school-activities/",
        )

    @tag("schools")
    @task(2)
    def my_schools(self):
        self.client.get("/api/schools/my-schools/", name="/api/schools/my-schools/")

    @tag("schools")
    @task(1)
    def school_faculty(self):
        self.client.get("/api/schools/faculty/", name="/api/schools/faculty/")

    @tag("auth")
    @task(1)
    def me(self):
        self.client.get("/api/auth/me/", name="/api/auth/me/")


# ═══════════════════════════════════════════════════════════════════════════════
# FACULTY — Weight: 60 (majority of users)
# Creates and views own records: publications, patents, certifications, FDP.
# ═══════════════════════════════════════════════════════════════════════════════

class FacultyUser(BaseMISUser):
    weight = 60
    role_name = "faculty"

    @tag("dashboard")
    @task(6)
    def dashboard_counts(self):
        self.client.get("/api/records/dashboard-counts/", name="/api/records/dashboard-counts/")

    @tag("records")
    @task(5)
    def view_publications(self):
        self.client.get("/api/records/publications/", name="/api/records/publications/")

    @tag("records")
    @task(4)
    def view_patents(self):
        self.client.get("/api/records/patents/", name="/api/records/patents/")

    @tag("records")
    @task(4)
    def view_certifications(self):
        self.client.get("/api/records/certifications/", name="/api/records/certifications/")

    @tag("records")
    @task(3)
    def view_fdp(self):
        self.client.get("/api/records/fdp/", name="/api/records/fdp/")

    @tag("records")
    @task(2)
    def view_school_activities(self):
        self.client.get("/api/records/school-activities/", name="/api/records/school-activities/")

    @tag("records")
    @task(2)
    def view_student_activities(self):
        self.client.get("/api/records/student-activities/", name="/api/records/student-activities/")

    @tag("records")
    @task(1)
    def search_faculty_users(self):
        """Used by co-author / co-applicant picker."""
        self.client.get(
            "/api/records/faculty-users/",
            params={"search": "a"},
            name="/api/records/faculty-users/",
        )

    @tag("schools")
    @task(2)
    def my_schools(self):
        self.client.get("/api/schools/my-schools/", name="/api/schools/my-schools/")

    @tag("records")
    @task(1)
    def list_clubs(self):
        self.client.get("/api/records/clubs/", name="/api/records/clubs/")

    @tag("export")
    @task(1)
    def export_publications(self):
        self.client.get(
            "/api/export/publications/",
            params={"date_from": "2025-01-01", "date_to": "2025-12-31"},
            name="/api/export/publications/",
        )

    @tag("service")
    @task(1)
    def report_error(self):
        """Simulates the frontend's automatic error reporting."""
        self.client.post(
            "/api/service/report-error/",
            json={
                "error_type": "TypeError",
                "error_message": f"Cannot read properties of undefined (reading 'map') at line {random.randint(1, 500)}",
                "url_path": random.choice(["/dashboard", "/publications", "/patents", "/certifications"]),
                "source": "frontend_js",
            },
            name="/api/service/report-error/",
        )

    @tag("service")
    @task(1)
    def submit_bug_report(self):
        self.client.post(
            "/api/service/bug-reports/submit/",
            json={
                "title": f"Locust bug {random.randint(1, 9999)}",
                "description": "Automated load test bug report — please ignore.",
                "severity": random.choice(["low", "medium", "high"]),
            },
            name="/api/service/bug-reports/submit/",
        )

    @tag("auth")
    @task(1)
    def me(self):
        self.client.get("/api/auth/me/", name="/api/auth/me/")


# ═══════════════════════════════════════════════════════════════════════════════
# DELETE AUTH — Weight: 5
# Reviews audit requests, views history.
# ═══════════════════════════════════════════════════════════════════════════════

class DeleteAuthUser(BaseMISUser):
    weight = 5
    role_name = "delete_auth"

    @tag("audit")
    @task(6)
    def pending_audits(self):
        self.client.get("/api/audit/", name="/api/audit/")

    @tag("audit")
    @task(4)
    def audit_history(self):
        self.client.get("/api/audit/history/", name="/api/audit/history/")

    @tag("auth")
    @task(1)
    def me(self):
        self.client.get("/api/auth/me/", name="/api/auth/me/")


# ═══════════════════════════════════════════════════════════════════════════════
# MIS COORDINATOR — Weight: 8
# Read-only access to school records, creates MIS reports, coordinator exports.
# ═══════════════════════════════════════════════════════════════════════════════

class MISCoordinatorUser(BaseMISUser):
    weight = 8
    role_name = "mis_coordinator"

    @tag("dashboard")
    @task(5)
    def dashboard_counts(self):
        self.client.get("/api/records/dashboard-counts/", name="/api/records/dashboard-counts/")

    @tag("records")
    @task(3)
    def view_school_activities(self):
        self.client.get("/api/records/school-activities/", name="/api/records/school-activities/")

    @tag("records")
    @task(3)
    def view_publications(self):
        self.client.get("/api/records/publications/", name="/api/records/publications/")

    @tag("records")
    @task(2)
    def view_fdp(self):
        self.client.get("/api/records/fdp/", name="/api/records/fdp/")

    @tag("export")
    @task(4)
    def coordinator_export(self):
        self.client.get(
            "/api/export/coordinator/",
            params={"date_from": "2025-01-01", "date_to": "2025-12-31"},
            name="/api/export/coordinator/",
        )

    @tag("reports")
    @task(2)
    def list_reports(self):
        self.client.get("/api/export/reports/", name="/api/export/reports/")

    @tag("schools")
    @task(1)
    def my_schools(self):
        self.client.get("/api/schools/my-schools/", name="/api/schools/my-schools/")

    @tag("auth")
    @task(1)
    def me(self):
        self.client.get("/api/auth/me/", name="/api/auth/me/")


# ═══════════════════════════════════════════════════════════════════════════════
# MIS ACCUMULATOR — Weight: 3
# Receives reports from coordinators, sends to super_admin/chronicle_master.
# ═══════════════════════════════════════════════════════════════════════════════

class MISAccumulatorUser(BaseMISUser):
    weight = 3
    role_name = "mis_accumulator"

    @tag("reports")
    @task(5)
    def received_reports(self):
        self.client.get("/api/export/reports/received/", name="/api/export/reports/received/")

    @tag("reports")
    @task(3)
    def list_reports(self):
        self.client.get("/api/export/reports/", name="/api/export/reports/")

    @tag("users")
    @task(3)
    def list_coordinators(self):
        self.client.get(
            "/api/users/accumulator-coordinators/",
            name="/api/users/accumulator-coordinators/",
        )

    @tag("reports")
    @task(2)
    def list_data_requests(self):
        self.client.get("/api/export/data-requests/", name="/api/export/data-requests/")

    @tag("auth")
    @task(1)
    def me(self):
        self.client.get("/api/auth/me/", name="/api/auth/me/")


# ═══════════════════════════════════════════════════════════════════════════════
# CHRONICLE MASTER — Weight: 1
# Receives reports from accumulators, university-level coordination.
# ═══════════════════════════════════════════════════════════════════════════════

class ChronicleMasterUser(BaseMISUser):
    weight = 1
    role_name = "chronicle_master"

    @tag("reports")
    @task(5)
    def received_reports(self):
        self.client.get("/api/export/reports/received/", name="/api/export/reports/received/")

    @tag("reports")
    @task(3)
    def list_reports(self):
        self.client.get("/api/export/reports/", name="/api/export/reports/")

    @tag("users")
    @task(3)
    def list_accumulators(self):
        self.client.get(
            "/api/users/chronicle/accumulators/",
            name="/api/users/chronicle/accumulators/",
        )

    @tag("auth")
    @task(1)
    def me(self):
        self.client.get("/api/auth/me/", name="/api/auth/me/")


# ═══════════════════════════════════════════════════════════════════════════════
# SERVICE ADMIN — Weight: 1
# Manages error tickets, bug reports, service dashboard.
# ═══════════════════════════════════════════════════════════════════════════════

class ServiceAdminUser(BaseMISUser):
    weight = 1
    role_name = "service_admin"

    @tag("service")
    @task(5)
    def dashboard_stats(self):
        self.client.get("/api/service/stats/", name="/api/service/stats/")

    @tag("service")
    @task(5)
    def list_tickets(self):
        self.client.get("/api/service/tickets/", name="/api/service/tickets/")

    @tag("service")
    @task(3)
    def list_tickets_open(self):
        self.client.get(
            "/api/service/tickets/",
            params={"status": "open"},
            name="/api/service/tickets/?status=open",
        )

    @tag("service")
    @task(3)
    def list_bug_reports(self):
        self.client.get("/api/service/bug-reports/", name="/api/service/bug-reports/")

    @tag("service")
    @task(2)
    def api_status(self):
        self.client.get("/api/service/api-status/", name="/api/service/api-status/")

    @tag("auth")
    @task(1)
    def me(self):
        self.client.get("/api/auth/me/", name="/api/auth/me/")