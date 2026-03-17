# MIS Portal — NMPralekh Dashboard Portal

A full-stack Management Information System (MIS) portal for colleges and schools. Built with React + Vite on the frontend and Django REST Framework on the backend, using MariaDB as the database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Django 6 + Django REST Framework |
| Database | MariaDB 10.6+ (InnoDB, ACID compliant) |
| Auth | JWT via djangorestframework-simplejwt |
| Excel Export | openpyxl |
| Container | Podman (planned) |

---

## Project Structure

```
nmpralekh/
├── client/                         # React Vite frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios instance with JWT interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state, login, logout
│   │   ├── components/
│   │   │   ├── layout/             # Sidebar, navbar, layout wrappers
│   │   │   ├── ui/                 # Reusable UI components
│   │   │   └── ProtectedRoute.jsx  # Role-based route guard
│   │   ├── pages/
│   │   │   ├── auth/               # Login, Unauthorized
│   │   │   ├── master/             # Master admin pages
│   │   │   ├── admin/              # Admin pages
│   │   │   ├── faculty/            # Faculty pages
│   │   │   ├── superadmin/         # Super admin pages
│   │   │   ├── deleteauth/         # Delete auth pages
│   │   │   └── records/            # Shared record module pages
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Django backend
│   ├── apps/
│   │   ├── accounts/               # Users, roles, JWT auth, permissions
│   │   ├── schools/                # Schools, user-school mapping
│   │   ├── records/                # All 8 MIS record modules
│   │   ├── audit/                  # Approve/reject change requests
│   │   └── export/                 # Excel export endpoints
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                        # Never commit this
│
└── README.md
```

---

## User Roles

| Role | Description | Access |
|---|---|---|
| `master` | Master administrator | Create users, create schools, assign roles |
| `super_admin` | Director / Registrar | View all records across all schools |
| `admin` | Dean / Program Chair | CRUD records for assigned school |
| `user` | Faculty | Create and view records for assigned school |
| `delete_auth` | Delete authorizer | Approve or reject pending update/delete requests |

---

## MIS Record Modules

1. **Exams Conducted** — course, examination name, date, expected graduation year
2. **School Activities** — name, date, details, school-wide flag, collaborations
3. **Student Activities** — name, date, details, conducted by club/committee, collaborations
4. **Faculty FDP / Workshop / GL** — faculty name, date range, name, type, organizing body
5. **Faculty Publications** — author, title, journal/conference, date, venue, publication
6. **Patents** — applicant, title, date of publication, journal number, status
7. **Certifications** — name, date, course title, agency, Credly/proof link
8. **Placement Activities** — name, date, details, company name

---

## Prerequisites

Before setting up, make sure you have:

- Python 3.11+
- Node.js 18+
- MariaDB 10.6+
- Git

---

## Backend Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd nmpralekh
```

### 2. Create and activate virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 3. Install Python dependencies

```bash
cd server
pip install -r requirements.txt
```

### 4. Set up MariaDB

Log into MariaDB and create the database and user:

```sql
CREATE DATABASE mis_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mis_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON mis_portal.* TO 'mis_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Configure environment variables

Create `server/.env` (copy from `server/config/settings.example.py` for reference):

```ini
SECRET_KEY=your_long_random_secret_key_here
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
```

Generate a secure secret key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 6. Run migrations

```bash
python manage.py makemigrations accounts
python manage.py makemigrations audit
python manage.py makemigrations schools
python manage.py makemigrations records
python manage.py migrate
```

### 7. Create master user

```bash
python manage.py createsuperuser
```

When prompted, enter your desired username, email, and password. This account will have the `master` role by default.

### 8. Start the backend server

```bash
python manage.py runserver
```

Backend runs at `http://localhost:8000`

---

## Frontend Setup

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Start the frontend dev server

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Endpoints Reference

### Auth
```
POST   /api/auth/login/           → Login, returns JWT tokens
POST   /api/auth/refresh/         → Refresh access token
POST   /api/auth/logout/          → Blacklist refresh token
GET    /api/auth/me/              → Current user profile
```

### Users (master only)
```
GET    /api/users/                → List all users
POST   /api/users/                → Create user
GET    /api/users/<id>/           → Get user detail
PUT    /api/users/<id>/           → Update user
DELETE /api/users/<id>/           → Deactivate user
```

### Schools (master / super_admin)
```
GET    /api/schools/              → List schools
POST   /api/schools/              → Create school
PUT    /api/schools/<id>/         → Update school
DELETE /api/schools/<id>/         → Deactivate school
POST   /api/schools/assign/       → Assign user to school
GET    /api/schools/assign/       → List all assignments
DELETE /api/schools/assign/<id>/  → Remove assignment
GET    /api/schools/my-schools/   → My assigned schools
```

### Records (admin / user / super_admin)
```
GET    /api/records/exams/
POST   /api/records/exams/
GET    /api/records/exams/<id>/
PUT    /api/records/exams/<id>/           → Creates audit request
DELETE /api/records/exams/<id>/           → Creates audit request

# Same pattern for:
/api/records/school-activities/
/api/records/student-activities/
/api/records/fdp/
/api/records/publications/
/api/records/patents/
/api/records/certifications/
/api/records/placements/
```

### Query Parameters (all record endpoints)
```
?school_id=1
?date_from=2024-01-01
?date_to=2024-12-31
?author_type=faculty          (publications)
?type=FDP                     (fdp)
?status=published             (patents)
?person_type=faculty          (certifications)
```

### Audit (delete_auth / super_admin)
```
GET    /api/audit/                → Pending requests
GET    /api/audit/<id>/           → Request detail with before/after diff
POST   /api/audit/<id>/approve/   → Approve and apply change
POST   /api/audit/<id>/reject/    → Reject, record unchanged
GET    /api/audit/history/        → All past approved/rejected requests
```

### Export (admin / user / super_admin)
```
GET    /api/export/exams/
GET    /api/export/school-activities/
GET    /api/export/student-activities/
GET    /api/export/fdp/
GET    /api/export/publications/
GET    /api/export/patents/
GET    /api/export/certifications/
GET    /api/export/placements/
GET    /api/export/all/           → Full multi-sheet Excel download
```

---

## How the Audit / Delete Auth Flow Works

```
1. Admin or faculty submits PUT or DELETE on any record
2. System creates an AuditRequest (status = pending)
3. Record is flagged with pending_audit_id
4. delete_auth user logs in and sees pending requests dashboard
5. delete_auth reviews the before/after diff
6. If approved  → change is applied atomically using transaction.atomic()
7. If rejected  → record stays unchanged, pending flag cleared
```

This ensures no data is modified or deleted without explicit authorization.

---

## Access Control Rules

| Action | master | super_admin | admin | user | delete_auth |
|---|---|---|---|---|---|
| Create users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create schools | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign users to schools | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all school records | ✅ | ✅ | ❌ | ❌ | ❌ |
| View own school records | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create records | ❌ | ❌ | ✅ | ✅ | ❌ |
| Request update/delete | ❌ | ❌ | ✅ | ✅ | ❌ |
| Approve/reject changes | ❌ | ❌ | ❌ | ❌ | ✅ |
| Export Excel | ❌ | ✅ | ✅ | ✅ | ❌ |

---

## Database Schema Summary

```
schools
user_school_mapping          → links users to schools
audit_requests               → pending change requests

exams_conducted              → school_id FK
school_activities            → school_id FK
school_activity_collaborations
student_activities           → school_id FK
student_activity_collaborations
faculty_fdp_workshop_gl      → school_id FK
faculty_publications         → school_id FK
patents                      → school_id FK
certifications               → school_id FK
placement_activities         → school_id FK
```

All record tables have:
- `school_id` — scopes data to a school
- `created_by` — tracks who entered the record
- `is_deleted` — soft delete flag
- `pending_audit_id` — points to pending audit request if change awaiting approval

---

## Running Both Servers Together

Open two terminals:

**Terminal 1 — Backend**
```bash
cd nmpralekh
source venv/bin/activate
cd server
python manage.py runserver
```

**Terminal 2 — Frontend**
```bash
cd nmpralekh/client
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Planned: Podman Containerization

A `podman-compose.yml` will be added with three services:
- `db` — MariaDB with persistent volume
- `backend` — Django + Gunicorn
- `frontend` — Nginx serving the Vite production build

---

## Notes

- Never commit `.env` or `settings.py` — use `settings.example.py` as reference
- Migrations are committed to git — do not add them to `.gitignore`
- All record deletions and updates go through the audit workflow — nothing is directly modified
- Super admins have read-only access across all schools — they cannot create or modify records
- The `master` role is the only role that can create users and schools