# NMPralekh — MIS Dashboard Portal

A full-stack Management Information System portal built for NMIMS University across all 9 campuses. Manages academic records, faculty activities, student activities, examinations, publications, patents, certifications, and placements — with a complete role-based access control system and an audit-driven change workflow.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Django 6 + Django REST Framework |
| Database | MariaDB 10.6+ (InnoDB, ACID compliant) |
| Auth | JWT via djangorestframework-simplejwt + httpOnly cookies |
| Cache | Redis + django-redis |
| Background Tasks | Celery |
| Excel Export | openpyxl |
| Production Server | Gunicorn (gthread workers) |
| Container | Podman |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│              http://localhost:5173 (dev)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Vite Dev Server                           │
│         Proxies /api/* → http://localhost:8000              │
│         (Production: Nginx handles this)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Django + Gunicorn                              │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────┐ ┌────────┐  │
│  │accounts │ │ schools │ │ records │ │audit │ │export  │  │
│  │ Users   │ │Campuses │ │ 8 MIS   │ │Approve│ │ Excel  │  │
│  │ Roles   │ │ Schools │ │ Modules │ │Reject │ │ Export │  │
│  │  JWT    │ │Mapping  │ │ Marks   │ │      │ │        │  │
│  └─────────┘ └─────────┘ └─────────┘ └──────┘ └────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  academics app                       │   │
│  │  Courses │ Years │ Semesters │ Subjects │ ClassGroups│   │
│  │  ExamGroups │ Clubs │ FacultyAssignments             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼──────┐  ┌───────▼────────┐
│   MariaDB   │  │     Redis     │  │    Celery      │
│ All tables  │  │ Cache counts  │  │ Background     │
│ ACID/InnoDB │  │ Sessions      │  │ Excel exports  │
│ Indexed     │  │ Export files  │  │                │
└─────────────┘  └───────────────┘  └────────────────┘
```

---

## Project Structure

```
nmpralekh/
├── venv/                           # Python virtual environment (never commit)
├── client/                         # React Vite frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios with cookie auth + auto refresh
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state, login, logout
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx      # Page wrapper with sidebar
│   │   │   │   └── Sidebar.jsx     # Role-aware navigation
│   │   │   ├── ui/
│   │   │   │   ├── Table.jsx       # Sortable paginated table + mobile cards
│   │   │   │   ├── Modal.jsx       # Form modal
│   │   │   │   ├── Button.jsx      # Primary, secondary, danger variants
│   │   │   │   ├── Badge.jsx       # Status pills
│   │   │   │   ├── FormInput.jsx   # Input, select, textarea
│   │   │   │   ├── PageHeader.jsx  # Title + action button
│   │   │   │   ├── EmptyState.jsx  # Empty table placeholder
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   └── MultiPersonPicker.jsx  # Co-authors / co-applicants
│   │   │   └── ProtectedRoute.jsx  # Role-based route guard
│   │   ├── pages/
│   │   │   ├── auth/               # Login, Unauthorized
│   │   │   ├── master/             # Campus, School, User, Assignment mgmt
│   │   │   ├── admin/              # Admin dashboard + all modules
│   │   │   ├── faculty/            # Faculty dashboard + self-managed modules
│   │   │   ├── superadmin/         # Read-only cross-campus view + exports
│   │   │   ├── deleteauth/         # Pending requests + history
│   │   │   ├── records/            # Shared record module pages (8 modules)
│   │   │   └── academics/          # Courses, Years, Semesters, Subjects etc.
│   │   ├── hooks/
│   │   │   ├── useRecords.js       # Generic CRUD + server-side pagination
│   │   │   ├── useSchools.js       # Fetch assigned schools for dropdowns
│   │   │   └── useExport.js        # Excel file download handler
│   │   ├── App.jsx                 # Router + role-based redirects
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js              # Proxy /api/* to Django
│   └── package.json
│
├── server/                         # Django backend
│   ├── apps/
│   │   ├── accounts/               # Custom User model, JWT, permissions
│   │   │   ├── models.py           # User with role + campus FK
│   │   │   ├── serializers.py
│   │   │   ├── views.py            # Login, logout, refresh, me, user CRUD
│   │   │   ├── permissions.py      # IsMaster, IsAdmin, IsUser etc.
│   │   │   └── authentication.py  # CookieJWTAuthentication
│   │   ├── schools/                # Campus, School, UserSchoolMapping
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── utils.py            # get_user_school_ids (campus-scoped)
│   │   ├── academics/              # Academic structure
│   │   │   ├── models.py           # Course, AcademicYear, Semester,
│   │   │   │                       # Subject, ClassGroup, ExamGroup,
│   │   │   │                       # Club, FacultyTeachingAssignment
│   │   │   ├── serializers.py
│   │   │   └── views.py
│   │   ├── records/                # All 8 MIS data modules
│   │   │   ├── models.py           # ExamsConducted, SchoolActivity,
│   │   │   │                       # StudentActivity, FacultyFDPWorkshopGL,
│   │   │   │                       # FacultyPublication, Patent,
│   │   │   │                       # Certification, PlacementActivity,
│   │   │   │                       # StudentMarks, PublicationAuthor,
│   │   │   │                       # PatentApplicant
│   │   │   ├── serializers.py
│   │   │   ├── views.py            # School-scoped CRUD + audit interception
│   │   │   └── cache_utils.py      # Redis-cached dashboard counts
│   │   ├── audit/                  # Approve/reject workflow
│   │   │   ├── models.py           # AuditRequest
│   │   │   ├── serializers.py
│   │   │   └── views.py            # Pending list, approve, reject, history
│   │   └── export/                 # Excel generation
│   │       ├── views.py            # Per-module + all exports
│   │       └── tasks.py            # Celery async export tasks
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   ├── celery.py
│   │   └── pagination.py           # StandardPagination (25/page)
│   ├── gunicorn.conf.py            # Production server config
│   ├── entrypoint.sh               # Podman startup script
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                        # Never commit — see .env.example
│
├── start.sh                        # Start all services in one command
├── server.sh                       # Start Django only
├── client.sh                       # Start React only
├── celery.sh                       # Start Celery only
└── README.md
```

---

## User Roles and Hierarchy

```
master
  └── Creates campuses, schools, users, assigns them to schools
super_admin (per campus)
  └── Read-only view of all records in their campus + export
admin (per school)
  └── Full CRUD on all records for their school
      Approves faculty teaching assignment requests
user / faculty (per school)
  └── Creates records for their school
      Manages their own publications, patents, certifications
      Requests teaching assignments (needs admin approval)
      Enters student marks for their assigned subjects
delete_auth
  └── Reviews and approves or rejects all update and delete
      requests before they are applied to the database
```

| Action | master | super_admin | admin | faculty | delete_auth |
|---|---|---|---|---|---|
| Create campuses | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create schools | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign users to schools | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all campus records | ✅ | ✅ | ❌ | ❌ | ❌ |
| View own school records | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create records | ❌ | ❌ | ✅ | ✅ | ❌ |
| Request update/delete | ❌ | ❌ | ✅ | ✅ | ❌ |
| Approve/reject changes | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve faculty assignments | ❌ | ❌ | ✅ | ❌ | ❌ |
| Export Excel | ❌ | ✅ | ✅ | ✅ | ❌ |
| Enter student marks | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## MIS Record Modules

| Module | Key Fields |
|---|---|
| Exams Conducted | Exam group, subject, class group, faculty, date |
| School Activities | Name, date, details, school-wide flag, collaborating schools |
| Student Activities | Name, date, details, club/committee dropdown, collaborations |
| Faculty FDP/Workshop/GL | Faculty, date range, name, type, organizing body |
| Faculty Publications | Author(s), title, journal/conference, date, venue, DOI |
| Patents | Applicant(s), title, date, journal number, status |
| Certifications | Name, date, course title, agency, Credly link |
| Placement Activities | Name, date, details, PlaceCom, company |
| Student Marks | Student name, roll number, marks, max marks, absent flag |

---

## Academic Structure Flow

```
Master creates campus
  → Admin creates Course (e.g. B.Tech CSEDS)
    → Admin creates Academic Year (Year 1, Graduation 2027)
      → Admin creates Semester (Semester 1, July-Nov 2024)
        → Admin creates Subjects (Data Structures, Mathematics)
          → Admin creates Class Groups (CSDS-A, CSDS-B)
            → Admin creates Exam Groups (Mid Term 1, End Semester)
              → Admin creates Clubs (Sankalp, PlaceCom)

Faculty requests teaching assignment
  → Selects school, semester, subject, class group
  → Admin approves or rejects with notes
  → On approval faculty can create exams and enter marks
    for their assigned subjects and class groups only
```

---

## Audit and Delete Auth Flow

Every UPDATE and DELETE goes through an approval workflow:

```
1. Admin or faculty submits edit or delete on any record
      ↓
2. System snapshots the current row into old_data (JSON)
3. Creates AuditRequest with status = pending
4. Record is flagged with pending_audit_id
5. Original record is NOT changed yet
      ↓
6. delete_auth logs in → sees Pending Requests dashboard
7. Each request shows a before/after diff (field by field)
      ↓
8a. APPROVE → Django applies change inside transaction.atomic()
              → record updated or soft-deleted
              → pending_audit_id cleared
              → AuditRequest marked approved

8b. REJECT  → record stays exactly as it was
              → pending_audit_id cleared
              → AuditRequest marked rejected

9. All decisions logged in History with reviewer name and timestamp
```

---

## Prerequisites

```
Python 3.11+
Node.js 18+
MariaDB 10.6+
Redis 6+
Git
```

---

## Initial Setup

### 1. Clone and enter the project

```bash
git clone <your-repo-url>
cd nmpralekh
```

### 2. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install Python dependencies

```bash
cd server
pip install -r requirements.txt
```

### 4. Set up MariaDB

```sql
CREATE DATABASE mis_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mis_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON mis_portal.* TO 'mis_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Configure environment variables

Create `server/.env`:

```ini
SECRET_KEY=your_long_random_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=mis_portal
DB_USER=mis_user
DB_PASSWORD=your_strong_password
DB_HOST=localhost
DB_PORT=3306

JWT_ACCESS_MINUTES=30
JWT_REFRESH_DAYS=7

TIME_ZONE=Asia/Kolkata

CORS_ALLOWED_ORIGINS=http://localhost:5173

REDIS_URL=redis://127.0.0.1:6379/1
```

Generate a secure secret key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 6. Run migrations

```bash
python manage.py makemigrations accounts
python manage.py makemigrations schools
python manage.py makemigrations audit
python manage.py makemigrations records
python manage.py makemigrations academics
python manage.py migrate
```

### 7. Create the master user

```bash
python manage.py createsuperuser
```

Enter username, email and password when prompted. This account gets the `master` role automatically.

### 8. Install frontend dependencies

```bash
cd ../client
npm install
```

---

## Running Locally

### Option A — Single command

```bash
cd ~/nmpralekh
chmod +x start.sh
./start.sh
```

Starts Redis, Django, Celery, and React with clean Ctrl+C shutdown.

### Option B — Separate terminals

**Terminal 1 — Redis**
```bash
sudo systemctl start redis
```

**Terminal 2 — Django**
```bash
cd ~/nmpralekh
source venv/bin/activate
cd server
python manage.py runserver
```

**Terminal 3 — Celery**
```bash
cd ~/nmpralekh/server
source ~/nmpralekh/venv/bin/activate
celery -A config worker --loglevel=info --concurrency=4
```

**Terminal 4 — React**
```bash
cd ~/nmpralekh/client
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## First Use Flow

```
1. Log in as master_admin

2. Campuses → Create NMIMS Hyderabad (HYD)

3. Schools → Create School of Technology (campus: HYD)

4. Users → Create:
   - super_admin (campus: HYD)
   - admin (campus: HYD)
   - faculty members (campus: HYD)
   - delete_auth reviewer

5. Assignments → Filter by campus → Assign admin and faculty to school

6. Log in as admin → Academics:
   - Create Course → B.Tech Computer Science
   - Create Year → Year 1 (graduation 2027)
   - Create Semester → Semester 1
   - Create Subjects → Data Structures, Mathematics
   - Create Class Groups → CSDS-A, CSDS-B
   - Create Exam Groups → Mid Term 1
   - Create Clubs → Sankalp (club), PlaceCom (placecom)

7. Log in as faculty → My Assignments → Request teaching assignment

8. Log in as admin → Faculty Assignments → Approve request

9. Log in as faculty → Exams → Add Exam
   (dropdowns show only assigned subjects and class groups)

10. Faculty → Marks → Select exam → Enter student marks

11. Faculty → My Publications → Add publication with co-authors

12. Admin → any record → Edit → Submit for Approval

13. Log in as delete_auth → Pending Requests
    → Review before/after diff → Approve or Reject
```

---

## API Reference

### Authentication
```
POST   /api/auth/login/        → Returns user object, sets httpOnly cookies
POST   /api/auth/refresh/      → Refreshes access token cookie
POST   /api/auth/logout/       → Blacklists token, clears cookies
GET    /api/auth/me/           → Current user profile
```

### Users (master only)
```
GET    /api/users/
POST   /api/users/
PUT    /api/users/<id>/
DELETE /api/users/<id>/
```

### Campuses (master only)
```
GET    /api/schools/campuses/
POST   /api/schools/campuses/
PUT    /api/schools/campuses/<id>/
DELETE /api/schools/campuses/<id>/
GET    /api/schools/campuses/<id>/schools/
GET    /api/schools/campuses/<id>/users/
```

### Schools
```
GET    /api/schools/
POST   /api/schools/
PUT    /api/schools/<id>/
POST   /api/schools/assign/
DELETE /api/schools/assign/<id>/
GET    /api/schools/my-schools/
GET    /api/schools/faculty/
```

### Academics
```
GET/POST   /api/academics/courses/
GET/POST   /api/academics/years/
GET/POST   /api/academics/semesters/
GET/POST   /api/academics/subjects/
GET/POST   /api/academics/class-groups/
GET/POST   /api/academics/exam-groups/
GET/POST   /api/academics/clubs/
GET/POST   /api/academics/assignments/
POST       /api/academics/assignments/<id>/approve/
POST       /api/academics/assignments/<id>/reject/
GET        /api/academics/my-assignments/
GET        /api/academics/faculty/
```

### Records (scoped to user's school)
```
GET/POST       /api/records/exams/
PUT/DELETE     /api/records/exams/<id>/       → Creates audit request

GET/POST       /api/records/school-activities/
GET/POST       /api/records/student-activities/
GET/POST       /api/records/fdp/
GET/POST       /api/records/publications/
GET/POST       /api/records/patents/
GET/POST       /api/records/certifications/
GET/POST       /api/records/placements/
GET/POST       /api/records/marks/

GET/POST       /api/records/publications/<id>/authors/
GET/POST       /api/records/patents/<id>/applicants/
GET            /api/records/dashboard-counts/
```

### Audit
```
GET    /api/audit/
GET    /api/audit/<id>/
POST   /api/audit/<id>/approve/
POST   /api/audit/<id>/reject/
GET    /api/audit/history/
```

### Export
```
GET    /api/export/exams/
GET    /api/export/school-activities/
GET    /api/export/student-activities/
GET    /api/export/fdp/
GET    /api/export/publications/
GET    /api/export/patents/
GET    /api/export/certifications/
GET    /api/export/placements/
GET    /api/export/all/

GET    /api/export/academics/courses/
GET    /api/export/academics/years/
GET    /api/export/academics/semesters/
GET    /api/export/academics/subjects/
GET    /api/export/academics/class-groups/
GET    /api/export/academics/exam-groups/
GET    /api/export/academics/clubs/
GET    /api/export/academics/marks/
GET    /api/export/academics/all/
```

### Common Query Parameters
```
?school_id=1
?campus_id=1
?date_from=2024-01-01
?date_to=2024-12-31
?page=1
?page_size=25
?status=pending
?type=FDP
?author_type=faculty
?is_active=true
```

---

## Database Schema

```
campuses
  └──< schools
         └──< user_school_mapping >── users (campus FK)
         └──< courses
                └──< academic_years
                       └──< semesters
                              └──< subjects
                              └──< exam_groups >──< class_groups (M2M)
         └──< class_groups
         └──< clubs

faculty_teaching_assignments → faculty + subject + class_group

exams_conducted              → school, exam_group, subject, class_group, faculty
student_marks                → exam
school_activities            → school + school_activity_collaborations
student_activities           → school, club + student_activity_collaborations
faculty_fdp_workshop_gl      → school
faculty_publications         → school + publication_authors
patents                      → school + patent_applicants
certifications               → school
placement_activities         → school, placecom

audit_requests               → every update/delete flows through here
```

All record tables share this pattern:
```
school_id        → data isolation per school
created_by       → audit trail
created_at       → immutable timestamp
updated_at       → auto-updated on every save
is_deleted       → soft delete flag
pending_audit_id → FK to pending change request
```

---

## Performance

```
Concurrent users     →  500 (dev) / 1500+ (Gunicorn 9 workers)
Response time        →  <50ms cached / <150ms uncached
Dashboard loads      →  <5ms (Redis cached 60 seconds)
Export row limit     →  5000 rows per file
Pagination           →  25 records per page server-side
DB indexes           →  On school, date, created_by, status columns
Connection pooling   →  CONN_MAX_AGE = 600 seconds
Rate limiting        →  20/min anonymous, 200/min authenticated
```

---

## Security

```
Authentication   →  JWT in httpOnly SameSite=Lax cookies (XSS safe)
Token refresh    →  Automatic via Axios interceptor on 401
Token rotation   →  Refresh tokens rotate on every use
Token blacklist  →  Logout blacklists token in database
Data isolation   →  Every query scoped to user's school and campus
Soft deletes     →  Records never hard deleted without approval
Audit trail      →  Every change logged with who, when, what
Password hashing →  Django PBKDF2 with SHA256
CORS             →  Restricted to configured origins only
SQL injection    →  Django ORM parameterised queries throughout
Strict SQL mode  →  STRICT_TRANS_TABLES enforced on connection
```

---

## Production Deployment (Podman)

```bash
podman-compose up -d
podman-compose exec backend python manage.py migrate
podman-compose exec backend python manage.py createsuperuser
```

Services:
- `db` — MariaDB with persistent named volume
- `backend` — Django + Gunicorn, runs migrate on startup
- `frontend` — Nginx serving Vite production build, proxies /api to backend
- `redis` — Cache and Celery broker
- `celery` — Background worker for exports

---

## Important Rules

- Never commit `.env`, `settings.py`, or `wsgi.py`
- Never gitignore `migrations/` — they must be committed
- All record edits and deletes go through audit — nothing is directly modified
- Faculty only see and manage their own publications, patents, certifications
- Super admins are strictly read-only
- Master is the only role that creates campuses, schools, and users
- Faculty teaching assignments must be admin-approved before exam creation