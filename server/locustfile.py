from locust import HttpUser, task, between, tag
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Replace these with real tokens captured from your browser cookies
TOKENS = {
    "master": "MASTER_JWT_TOKEN",
    "super_admin": "SUPER_ADMIN_JWT_TOKEN",
    "admin": "ADMIN_JWT_TOKEN",
    "faculty": "FACULTY_JWT_TOKEN",
    "delete_auth": "DELETE_AUTH_JWT_TOKEN",
    "mis_coordinator": "MIS_COORDINATOR_JWT_TOKEN"
}

class BaseMISUser(HttpUser):
    abstract = True
    verify = False
    # Realistic wait time between actions (10-30 minutes for a balanced test)
    wait_time = between(600, 1800)

    def on_start(self):
        token = TOKENS.get(self.role_name)
        if token:
            self.client.cookies.set('access_token', token)

class MasterUser(BaseMISUser):
    weight = 1 # Very few master users
    role_name = "master"

    @task
    def manage_structure(self):
        self.client.get("/api/schools/campuses/")
        self.client.get("/api/schools/")
        self.client.get("/api/users/")

class SuperAdminUser(BaseMISUser):
    weight = 10 
    role_name = "super_admin"

    @task
    def campus_oversight(self):
        self.client.get("/api/records/dashboard-counts/")
        self.client.get("/api/users/campus-users/")
        self.client.get("/api/export/all/")

class AdminUser(BaseMISUser):
    weight = 15
    role_name = "admin"

    @task
    def school_management(self):
        self.client.get("/api/records/dashboard-counts/")
        self.client.get("/api/records/clubs/")
        self.client.get("/api/users/school-faculties/")

class FacultyUser(BaseMISUser):
    weight = 60 # Majority of users
    role_name = "faculty"

    @task
    def view_records(self):
        self.client.get("/api/records/publications/")
        self.client.get("/api/records/patents/")
        self.client.get("/api/records/certifications/")

class DeleteAuthUser(BaseMISUser):
    weight = 5
    role_name = "delete_auth"

    @task
    def review_audit(self):
        self.client.get("/api/audit/")
        self.client.get("/api/audit/history/")

class MISCoordinatorUser(BaseMISUser):
    weight = 10
    role_name = "mis_coordinator"

    @task
    def coordinator_export(self):
        self.client.get("/api/export/coordinator/")