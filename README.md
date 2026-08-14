# NMPralekh — MIS Dashboard Portal

A full-stack Management Information System portal built for NMIMS University across all 9 campuses. Manages faculty activities, student activities, publications, patents, certifications, and placements — with a complete role-based access control system and an audit-driven change workflow.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Django 6 + Django REST Framework |
| Database | PostgreSQL 15+ (ACID compliant) |
| Auth | JWT via djangorestframework-simplejwt + httpOnly cookies |
| Cache | Redis + django-redis |
| Background Tasks | Celery |
| Search & Filtering | django-filter + DRF SearchFilter |
| Excel Export | openpyxl |
| Production Server | Gunicorn (gthread workers) |
| Reverse Proxy | Nginx (rate limiting, admin protection, static files) |

---

## Architecture Overview

```mermaid
graph TD
    A["Browser<br>https://localhost:5173"] -->|HTTPS| B["Vite Dev Server<br>:5173"]
    B -->|"Proxy /api/* → http://localhost:7567"| N["Nginx<br>:7567 — public entry point"]
    N -->|"proxy_pass → 127.0.0.1:8000"| C["Gunicorn<br>:8000 — internal only"]
    
    subgraph Django Applications
        D1[accounts: Users, Roles, JWT]
        D2[schools: Campuses, Schools]
        D3[records: 8 MIS Modules + Clubs]
        D4[audit: Approve/Reject]
        D5[export: Excel Export]
        D6[service: Errors & Bug Tickets]
    end
    
    C --> D1
    C --> D2
    C --> D3
    C --> D4
    C --> D5
    C --> D6
    
    C -->|Read/Write| DB[(PostgreSQL<br>ACID)]
    C -->|Cache/Sessions| Cache[(Redis)]
    C -->|Task Queue| Worker[Celery<br>Background Tasks]
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
│   │   │   │   ├── FormInput.jsx   # Input, searchable select, textarea
│   │   │   │   ├── SearchableSelect.jsx # Custom combobox with filtering
│   │   │   │   ├── PageHeader.jsx  # Title + action button
│   │   │   │   ├── EmptyState.jsx  # Empty table placeholder
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   └── MultiPersonPicker.jsx  # Co-authors / co-applicants
│   │   │   └── ProtectedRoute.jsx  # Role-based route guard
│   │   ├── pages/
│   │   │   ├── auth/               # Login, Unauthorized
│   │   │   ├── master/             # Campus, School, User, Assignment mgmt
│   │   │   ├── admin/              # Admin dashboard, Clubs, Faculties view
│   │   │   ├── faculty/            # Faculty dashboard + self-managed modules
│   │   │   ├── superadmin/         # Read-only view, Campus Users, exports
│   │   │   ├── deleteauth/         # Pending requests + history
│   │   │   └── records/            # Shared record module pages (7 modules)
│   │   ├── hooks/
│   │   │   ├── useRecords.js       # Generic CRUD + server-side pagination
│   │   │   ├── useSchools.js       # Fetch assigned schools for dropdowns
│   │   │   └── useExport.js        # Excel file download handler
│   │   ├── App.jsx                 # Router + role-based redirects
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js              # HTTPS + Proxy /api/* to Django
│   └── package.json
│
├── server/                         # Django backend
│   ├── apps/
│   │   ├── accounts/               # Custom User model, JWT, permissions
│   │   │   ├── models.py           # User with role + campus FK
│   │   │   ├── serializers.py      # UserSerializer, UserVisibilitySerializer
│   │   │   ├── views.py            # Login, logout, refresh, me, user CRUD,
│   │   │   │                       # SchoolFacultiesView, CampusUsersView
│   │   │   ├── permissions.py      # IsMaster, IsAdmin, IsSuperAdmin, IsUser
│   │   │   └── authentication.py   # CookieJWTAuthentication
│   │   ├── schools/                # Campus, School, UserSchoolMapping
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── utils.py            # get_user_school_ids (campus-scoped)
│   │   ├── records/                # All MIS data modules + Clubs
│   │   │   ├── models.py           # Club, SchoolActivity, StudentActivity,
│   │   │   │                       # FacultyFDPWorkshopGL, FacultyPublication,
│   │   │   │                       # Patent, Certification, PlacementActivity,
│   │   │   │                       # PublicationAuthor, PatentApplicant,
│   │   │   │                       # BackupConfiguration
│   │   │   ├── serializers.py
│   │   │   ├── views.py            # School-scoped CRUD + audit interception
│   │   │   └── cache_utils.py      # Redis-cached dashboard counts
│   │   ├── audit/                  # Approve/reject workflow
│   │   │   ├── models.py           # AuditRequest
│   │   │   ├── serializers.py
│   │   │   └── views.py            # Pending list, approve, reject, history
│   │   ├── export/                 # Excel generation
│   │   │   ├── views.py            # Per-module + all exports
│   │   │   └── tasks.py            # Celery async export tasks
│   │   └── service/                # Service Portal (errors & tickets)
│   │       ├── models.py           # ErrorTicket, ErrorOccurrence, BugReport
│   │       └── views.py            # Error ingestion, bug reporting, stats
│   ├── config/
│   │   ├── settings.py
│   │   ├── settings.example.py     # Template — copy to settings.py, fill secrets
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   ├── wsgi.example.py         # Template — includes deployment notes
│   │   ├── celery.py
│   │   └── pagination.py           # StandardPagination (25/page)
│   ├── gunicorn.conf.py            # Production server config (gthread, 9w × 2t)
│   ├── manage.py
│   ├── requirements.txt            # Python dependencies
│   ├── venv/                       # Virtual environment
│   └── .env                        # Never commit — use .env.example as reference
│
├── android-client/                 # Native Android mobile app (Java)
│   ├── app/
│   │   └── src/main/
│   │       ├── java/.../           # Activities (LoginActivity, FacultyActivity)
│   │       ├── res/layout/         # UI layouts (XML)
│   │       └── AndroidManifest.xml # App config and entry points
│   └── build.gradle                # Android build config
│
├── start.sh                        # Start all services in one command (Gunicorn)
├── server.sh                       # Start Gunicorn only
├── client.sh                       # Start React only
├── celery.sh                       # Start Celery only
└── README.md
```

---

## User Roles and Hierarchy

```mermaid
graph TD
    master[Master] -->|Creates & Assigns| campuses[Campuses, Schools, Users]
    
    subgraph System Level
        service_admin[Service Admin] -->|Manages| errors[Error Tickets & Bug Reports]
    end
    
    subgraph Campus Level
        super_admin[Super Admin] -->|Read-Only & Export| all_records[All Records in Campus]
        super_admin -->|Views| campus_users[All Campus Users]
    end
    
    subgraph School Level
        admin[Admin] -->|Full CRUD & Approvals| school_records[All Records in School]
        admin -->|Manages| clubs[Clubs & Committees]
        admin -->|Views| school_faculties[School Faculties]
        
        faculty[Faculty / User] -->|Creates| own_records[Own Records]
        faculty -->|Requests Update/Delete| edit_requests[Audit Requests]
        
        mis_coord[MIS Coordinator] -->|Read-Only & Aggregated Export| school_records
    end
    
    subgraph Campus Coordination
        mis_accumulator[MIS Accumulator] -->|Receives & Combines| mis_coord
    end
    
    subgraph University Coordination
        chronicle_master[Chronicle Master] -->|Receives & Combines| mis_accumulator
    end
    
    delete_auth[Delete Auth Reviewer] -->|Reviews| edit_requests
    delete_auth -->|Approves/Rejects| DB_updates[Database Updates]
```

| Action | master | super_admin | admin | faculty | delete_auth | mis_coordinator | mis_accumulator | chronicle_master | service_admin |
|---|---|---|---|---|---|---|---|---|---|
| Create campuses | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create schools | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign users to schools | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View all campus records | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View campus users | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View school faculties | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage clubs & committees | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View own school records | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Create records | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Request update/delete | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve/reject changes | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export Excel | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Finalize MIS Reports | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Use AI Summarizer | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Manage errors & bug reports| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## MIS Record Modules

| Module | Key Fields |
|---|---|
| School Activities | Name, date, details, school-wide flag, collaborating schools |
| Student Activities | Name, date, details, club/committee dropdown, collaborations |
| Faculty FDP/Workshop/GL | Faculty, date range, name, type, organizing body |
| Faculty Publications | Author(s), title, journal/conference, date, venue, DOI/Link (required) |
| Patents | Applicant(s), title, date, journal number, status, DOI/Link (required) |
| Certifications | Name, date, course title, agency, Credly/Proof link (required) |
| Placement Activities | Name, date, details, PlaceCom, company |

### Clubs & Committees

Clubs are managed by Admins and linked to schools. They come in three types:
- **Club** — Student clubs (e.g. Coding Club, IEEE)
- **Committee** — Faculty/student committees
- **Placement Committee** — PlaceCom entities

When creating Student Activities, users select from registered clubs via a searchable dropdown, with an "Other" option for free-text entry.

---

## Audit and Delete Auth Flow

Every **UPDATE** and **DELETE** goes through a strict approval workflow:

```mermaid
sequenceDiagram
    participant U as Admin/Faculty
    participant S as System
    participant DB as PostgreSQL
    participant D as Delete Auth (Reviewer)
    
    U->>S: Submits Edit/Delete request
    S->>S: Snapshot current row to old_data (JSON)
    S->>DB: Add pending_audit_id flag to Record
    S->>DB: Create AuditRequest (status=pending)
    Note over S,DB: Original record remains unchanged!
    
    D->>S: Logs in & views Pending Requests
    S-->>D: Displays field-by-field diff
    
    alt is Approved
        D->>S: APPROVE
        S->>DB: Apply changes inside transaction.atomic()
        S->>DB: Clear pending_audit_id
        S->>DB: Mark AuditRequest approved
    else is Rejected
        D->>S: REJECT
        S->>DB: Record stays exactly as it was
        S->>DB: Clear pending_audit_id
        S->>DB: Mark AuditRequest rejected
    end
    
    Note over S,DB: All decisions logged in History with reviewer name & timestamp
```

---

## Prerequisites

```
Python 3.11+
Node.js 18+
PostgreSQL 15+
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

### 4. Set up PostgreSQL

```sql
CREATE DATABASE nmpralekh
    ENCODING 'UTF8'
    LC_COLLATE 'en_US.UTF-8'
    LC_CTYPE 'en_US.UTF-8'
    TEMPLATE template0;

CREATE USER mis_user WITH PASSWORD 'your_strong_password';

ALTER ROLE mis_user SET client_encoding TO 'utf8';
ALTER ROLE mis_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mis_user SET timezone TO 'Asia/Kolkata';
ALTER ROLE mis_user WITH CREATEDB;

GRANT ALL PRIVILEGES ON DATABASE nmpralekh TO mis_user;

-- PostgreSQL 15+ also requires this
\c nmpralekh
GRANT ALL ON SCHEMA public TO mis_user;

\q
```

### 5. Start Redis

Redis is strictly required for caching dashboard counts. If you don't have it installed:

```bash
sudo apt update
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 6. Configure Django settings & environment variables

Because they contain sensitive paths and imports, the main Django configuration files are gitignored. You must copy them from their templates:

```bash
cp config/settings.example.py config/settings.py
cp config/wsgi.example.py config/wsgi.py
```

Next, create `server/.env`:

```ini
SECRET_KEY=your_long_random_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=nmpralekh
DB_USER=mis_user
DB_PASSWORD=your_strong_password
DB_HOST=127.0.0.1
DB_PORT=5432

JWT_ACCESS_MINUTES=30
JWT_REFRESH_DAYS=7

TIME_ZONE=Asia/Kolkata

CORS_ALLOWED_ORIGINS=https://localhost:5173

REDIS_URL=redis://127.0.0.1:6379/1
```

Generate a secure secret key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 7. Run migrations

```bash
python manage.py makemigrations accounts schools audit records export
python manage.py migrate
```

### 8. Create the master user

```bash
python manage.py createsuperuser
```

Enter username, email and password when prompted. This account gets the `master` role automatically.

### 9. Generate local SSL certificates (mkcert)

The Vite frontend is configured to run on HTTPS. You need to generate local trusted certificates in the **project root**:

```bash
# Install mkcert if you don't have it (e.g. on Ubuntu: sudo apt install mkcert libnss3-tools)
cd ..  # Move to the nmpralekh root folder
mkcert -install
mkcert localhost 127.0.0.1 ::1
```
This generates `localhost+1.pem` and `localhost+1-key.pem` which Vite expects.

### 10. Install frontend dependencies

```bash
cd client
npm install
```

---

## Database Optimization (pgBouncer)

For production-grade connection pooling, it is highly recommended to use **pgBouncer**.

### Step 1 — Install pgBouncer
```bash
sudo apt update
sudo apt install pgbouncer -y

```

Verify installation:

```bash
pgbouncer --version

```

### Step 2 — Configure pgBouncer

Open the config file:

```bash
sudo nano /etc/pgbouncer/pgbouncer.ini

```

Replace the entire content with:

```ini
[databases]
nmpralekh = host=127.0.0.1 port=5432 dbname=nmpralekh

[pgbouncer]
listen_port          = 6432
listen_addr          = 127.0.0.1
auth_type            = scram-sha-256
auth_file            = /etc/pgbouncer/userlist.txt

pool_mode            = transaction
max_client_conn      = 200
default_pool_size    = 20
reserve_pool_size    = 5
reserve_pool_timeout = 5

# Timeouts to prevent idle connections and bottlenecks
server_idle_timeout  = 600
client_idle_timeout  = 300
query_wait_timeout   = 30

log_connections      = 0
log_disconnections   = 0
log_pooler_errors    = 1

# In transaction mode, server_reset_query is ignored anyway
# but DISCARD ALL is expensive if it were used.
server_reset_query   = DISCARD ALL
ignore_startup_parameters = extra_float_digits

admin_users = pgbouncer
stats_users = pgbouncer

```

### Step 3 — Generate SCRAM-SHA-256 Passwords

pgBouncer needs its own user authentication file with secure SCRAM hashes generated by PostgreSQL.

Log into PostgreSQL as the postgres administrator:

```bash
sudo -u postgres psql

```

Run the following SQL commands to generate the hashes:

```sql
-- Ensure PostgreSQL uses SCRAM encryption
SET password_encryption = 'scram-sha-256';

-- Update your main database user to generate the hash
ALTER USER mis_user WITH PASSWORD 'your_strong_password';

-- Create the internal pgbouncer admin user
CREATE USER pgbouncer WITH PASSWORD 'admin';

-- Extract the generated hashes to copy
SELECT rolname, rolpassword FROM pg_authid WHERE rolname IN ('mis_user', 'pgbouncer');

```

Copy the long strings that start with `SCRAM-SHA-256$4096:...` and type `\q` to exit.

### Step 4 — Create pgBouncer User File

Open the userlist file:

```bash
sudo nano /etc/pgbouncer/userlist.txt

```

Add the users using the hashes you just copied (keep the double quotes):

```text
"mis_user" "SCRAM-SHA-256$4096:..."
"pgbouncer" "SCRAM-SHA-256$4096:..."

```

### Step 5 — Start pgBouncer

```bash
sudo systemctl restart pgbouncer
sudo systemctl enable pgbouncer
sudo systemctl status pgbouncer

```

Should show `active (running)`.

### Step 6 — Test pgBouncer Connection

```bash
psql -U mis_user -d nmpralekh -h 127.0.0.1 -p 6432

```

If it connects successfully type `\q` to exit.

### Step 7 — Update Django to Use pgBouncer Port

Open `server/.env` and change the port from `5432` to `6432`:

```ini
DB_PORT=6432

```


## Redis Configuration (Optimization & Limits)

To prevent Redis from growing unbounded and to ensure it can handle a high volume of concurrent users (e.g., 10,000+), you must configure strict memory caps, an eviction policy, and connection limits.

### Step 1 — Edit redis.conf

Open the Redis configuration file:
```bash
sudo nano /etc/redis/redis.conf
```

**1a. Set Memory Limits:**
Search for the `# maxmemory <bytes>` section and add (or uncomment):

```conf
maxmemory 512mb
maxmemory-policy allkeys-lru
```

*(This limits Redis to 512 MB of RAM. Once full, it evicts the least recently used keys.)*

**1b. Set Connection Limits:**
Search for the `# maxclients 10000` section and update it to allow a safe buffer for web workers and Celery:

```conf
maxclients 20000
```

### Step 2 — Increase System File Descriptor Limits

Linux limits the number of file descriptors (network connections) a service can open. To allow Redis to actually accept 20,000 clients, you must increase this limit at the system level.

Open the Redis service override file:

```bash
sudo systemctl edit redis
```

Add the following lines at the **very top** of the file (do not use a `#` at the beginning):

```ini
[Service]
LimitNOFILE=65536
```

Save and exit the editor.

### Step 3 — Apply the changes

Reload the systemd daemon to recognize the new file limit, then restart Redis to apply all configurations:

```bash
sudo systemctl daemon-reload
sudo systemctl restart redis
```

*(Optional) If you only want to apply the memory limits live without a restart, you can use:*

```bash
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
# Note: maxclients and LimitNOFILE require a restart to take effect safely.
```


---

## Gunicorn Configuration

The project uses **Gunicorn** with `gthread` workers as its production WSGI server. The config lives in `server/gunicorn.conf.py`.

### Why WSGI / Gunicorn and not ASGI / Uvicorn?

The entire codebase is synchronous Django — every view, ORM call, and Celery task uses sync code. ASGI would run those sync views inside a thread pool anyway, adding overhead with no benefit. Move to ASGI only if you add Django Channels (WebSockets) or rewrite critical views as `async def`.

### Thread math and pgBouncer

```
workers  = (CPU cores × 2) + 1   →  9 on a 4-core machine
threads  = 2                      →  lowered from 8 (was exhausting the pool)
─────────────────────────────────────────────────────
total DB connections = 9 × 2 = 18  ←  fits inside pgBouncer's pool of 20
```

> **Why not 8 threads?** 9 workers × 8 threads = 72 concurrent DB connections against a pgBouncer pool capped at 20 → connection exhaustion under load.

### Key settings

| Setting | Value | Reason |
|---|---|---|
| `worker_class` | `gthread` | Thread-based — good for I/O-bound Django |
| `threads` | `2` | Keeps total connections ≤ pgBouncer pool |
| `timeout` | `120` | Covers slow Excel export generation |
| `max_requests` | `1000` | Recycles workers to prevent memory leaks |
| `max_requests_jitter` | `100` | Staggers restarts to avoid thundering-herd |
| `worker_tmp_dir` | `/dev/shm` | RAM-based tmp — faster heartbeat checks |
| `preload_app` | `True` | Forks after import — faster startup, less RAM |
| `graceful_timeout` | `30` | Lets in-flight requests finish on shutdown |
| `limit_request_line` | `4096` | Rejects oversized request lines |
| `limit_request_fields`| `100` | Caps HTTP header count |

---

## Nginx Configuration

Nginx sits between the public internet and Gunicorn, acting as the **only public entry point**. It handles rate limiting, security headers, static file serving, and blocks direct access to the Django admin panel.

### Traffic flow

```
Browser / Client  (https://localhost:5173)
    ↓  /api/* proxied by Vite dev server
Nginx             (http://localhost:7567)        ← public entry point
    ↓  proxy_pass
Gunicorn          (http://127.0.0.1:8000)        ← internal only
    ↓
Django
```

### Step 1 — Install Nginx

```bash
sudo apt update && sudo apt install nginx -y
```

### Step 2 — Create the backend config

```bash
sudo nano /etc/nginx/sites-available/nmpralekh-backend
```

Paste the following (replace `/path/to/nmpralekh` with your actual project path):

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

server {
    listen 7567;
    server_name localhost;   # replace with your domain in production

    # --- Security Headers ---
    add_header X-Frame-Options         "DENY"                            always;
    add_header X-Content-Type-Options  "nosniff"                         always;
    add_header Referrer-Policy         "strict-origin-when-cross-origin" always;

    # --- Django static files (Admin panel assets) ---
    # Run `python manage.py collectstatic` first
    location /static/ {
        alias /path/to/nmpralekh/server/staticfiles/;
        expires 30d;
    }

    # --- Block /admin/ from public internet, allow only from localhost ---
    location /admin/ {
        allow 127.0.0.1;
        deny all;

        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # --- Proxy all other requests (including /api/*) to Gunicorn ---
    location / {
        limit_req zone=api burst=50 nodelay;

        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout    120s;
        proxy_connect_timeout 10s;
        client_max_body_size  20M;
    }
}
```

### Step 3 — Enable the site

```bash
# Enable the nmpralekh site
sudo ln -s /etc/nginx/sites-available/nmpralekh-backend /etc/nginx/sites-enabled/nmpralekh-backend

# Disable the default site — it may conflict if it listens on the same port
sudo rm /etc/nginx/sites-enabled/default

# Test config syntax
sudo nginx -t

# Apply changes
sudo systemctl reload nginx
```

### Step 4 — Collect Django static files

Required so the Admin panel loads its CSS/JS through Nginx:

```bash
cd server
source venv/bin/activate
python manage.py collectstatic
```

### Step 5 — Lock Gunicorn to localhost

In `server/gunicorn.conf.py`:

```python
bind = '127.0.0.1:8000'  # was 0.0.0.0:8000 — only Nginx can now reach it
```

### Step 6 — Configure UFW firewall

```bash
sudo ufw allow ssh              # don't lock yourself out
sudo ufw allow 7567/tcp         # nginx port (use 80/443 in production)
sudo ufw deny 8000/tcp          # block direct Gunicorn access
sudo ufw enable
```

### Step 7 — Update Vite proxy

In `client/vite.config.js`, set the `/api` proxy to point to Nginx instead of Gunicorn directly:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:7567',   // Nginx, not Gunicorn
    changeOrigin: true,
    secure: false,
  }
}
```

### Verifying Nginx is working

```bash
# Confirm Server header shows nginx
curl -sI http://localhost:7567/api/auth/me/ | grep -i server
# → Server: nginx/1.x.x

# Watch live request log
sudo tail -f /var/log/nginx/access.log

# Confirm /admin/ is blocked from external IPs (returns 403)
# From localhost it returns 302 (allowed through to Django login)
curl -s -o /dev/null -w "%{http_code}" http://localhost:7567/admin/

# Confirm all services are listening on the right ports
ss -tlnp | grep -E '7567|8000|5173'
```

### Production deployment checklist

When deploying to a real server, update `server/.env`:

```ini
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

And in the Nginx config:
- `listen 7567` → `listen 80` (then set up `certbot` for HTTPS on 443)
- `server_name localhost` → `server_name api.yourdomain.com`
- Update the `/static/` alias to the absolute path on the server

---

## Running Locally

### Option A — Single command

```bash
cd ~/nmpralekh
chmod +x start.sh
./start.sh
```

Starts Redis, pgBouncer, Django, Celery, and React with clean Ctrl+C shutdown.

### Option B — Separate terminals

**Terminal 1 — Services**
```bash
sudo systemctl start redis
sudo systemctl start pgbouncer
```

**Terminal 2 — Backend (Gunicorn)**
```bash
cd ~/nmpralekh
source venv/bin/activate
cd server
gunicorn -c gunicorn.conf.py config.wsgi:application
```

> **Development note:** If you need Django's auto-reload while working on the backend, you can still use `python manage.py runserver` locally. Use Gunicorn for any staging or production-like testing.

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

Open `https://localhost:5173` in your browser.

---

## First Use Flow

```mermaid
flowchart TD
    step1[1. Log in as master] --> step2[2. Create Campus <br> e.g. NMIMS Hyderabad]
    step2 --> step3[3. Create School <br> e.g. School of Technology]
    step3 --> step4[4. Create Users <br> super_admin, admin, faculty, delete_auth]
    step4 --> step5[5. Assign Admin & Faculty to School]
    
    step5 --> step6[6. Admin creates Clubs & Committees]
    step6 --> step7[7. Admin/Faculty add MIS Records <br> Publications, Patents, etc.]
    
    step7 --> step8[8. Submit Record for Approval <br> Edit/Delete]
    step8 --> step9[9. delete_auth Reviewer <br> Approves/Rejects changes]
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
GET/POST /api/users/master/chronicle-master/
GET/POST /api/users/master/service-user/
```

### User Visibility
```
GET    /api/users/school-faculties/        → Admin: faculty in their school(s)
GET    /api/users/campus-users/            → Super Admin: all users in campus
GET    /api/users/accumulator-coordinators/→ MIS Accumulator: MIS coordinators
GET    /api/users/chronicle/accumulators/  → Chronicle Master: MIS accumulators
```
Both endpoints support `?search=`, `?role=`, `?school_code=`, and server-side pagination.

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

### Clubs & Committees
```
GET    /api/records/clubs/              → List (admin + faculty)
POST   /api/records/clubs/              → Create (admin only)
PUT    /api/records/clubs/<id>/         → Update (admin only)
DELETE /api/records/clubs/<id>/         → Delete (admin only)
```
Supports `?school=`, `?type=`, `?is_active=` query params.

### Records (scoped to user's school)
```
GET/POST       /api/records/school-activities/
GET/POST       /api/records/student-activities/
GET/POST       /api/records/fdp/
GET/POST       /api/records/publications/
GET/POST       /api/records/patents/
GET/POST       /api/records/certifications/
GET/POST       /api/records/placements/

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

### Service Portal
```
GET    /api/service/stats/
GET    /api/service/api-status/
GET    /api/service/tickets/            → Admin view of error tickets
POST   /api/service/tickets/<id>/status/
GET/POST /api/service/bug-reports/      → Submit or view bug reports
POST   /api/service/report-error/       → Frontend automated error ingestion
```

### Export & MIS Reporting
```
GET    /api/export/school-activities/
GET    /api/export/student-activities/
GET    /api/export/fdp/
GET    /api/export/publications/
GET    /api/export/patents/
GET    /api/export/certifications/
GET    /api/export/placements/
GET    /api/export/all/

GET    /api/export/reports/             → List/Create final text-based MIS reports (Coord/Accumulator)
GET    /api/export/reports/received/    → Accumulator lists reports sent by Coordinators
GET    /api/export/reports/admin/       → Admin lists final reports sent by Coordinators
POST   /api/export/reports/<id>/send-accumulator/
POST   /api/export/reports/<id>/send-admin/
POST   /api/export/reports/<id>/send-superadmin/
POST   /api/export/reports/<id>/send-chronicle/

GET    /api/export/data-requests/       → Accumulator requests data from Coordinators
```

### Common Query Parameters
```
?school_id=1
?campus_id=1
?date_from=2024-01-01
?date_to=2024-12-31
?page=1
?page_size=25
?search=keyword
?status=pending
?type=FDP
?author_type=faculty
?is_active=true
?school_code=SOT
```

---

## Database Schema

```mermaid
erDiagram
    CAMPUSES ||--o{ SCHOOLS : "contains"
    CAMPUSES ||--o{ USERS : "belongs to"
    SCHOOLS ||--o{ USER_SCHOOL_MAPPING : "maps users"
    USERS ||--o{ USER_SCHOOL_MAPPING : "assigned to"
    SCHOOLS ||--o{ CLUBS : "has"
    
    CLUBS ||--o{ STUDENT_ACTIVITIES : "conducted by"
    SCHOOLS ||--o{ SCHOOL_ACTIVITIES : "has"
    SCHOOLS ||--o{ STUDENT_ACTIVITIES : "has"
    SCHOOLS ||--o{ FACULTY_PUBLICATIONS : "has"
    SCHOOLS ||--o{ PATENTS : "has"
    SCHOOLS ||--o{ CERTIFICATIONS : "has"
    SCHOOLS ||--o{ PLACEMENT_ACTIVITIES : "has"
    
    FACULTY_PUBLICATIONS ||--o{ PUBLICATION_AUTHORS : "has"
    PATENTS ||--o{ PATENT_APPLICANTS : "has"
    
    MIS_RECORDS }o--o| AUDIT_REQUESTS : "pending_audit_id"
```

All record tables share this pattern:
```
school_id        → data isolation per school
created_by       → audit trail
created_at       → immutable timestamp
updated_at       → auto-updated on every save
pending_audit_id → FK to pending change request
```

---

## Performance

```
Concurrent users     →  500 (dev) / 1500+ (Gunicorn 9 workers × 2 threads)
Response time        →  <50ms cached / <150ms uncached
Dashboard loads      →  <5ms (Redis cached 60 seconds)
Export row limit     →  5000 rows per file
Pagination           →  25 records per page server-side
DB indexes           →  On school, date, created_by, status columns
Connection pooling   →  CONN_MAX_AGE = 0 (pgBouncer transaction mode)
                        9 workers × 2 threads = 18 connections (pool cap: 20)
Rate limiting        →  60/min anonymous, 300/min authenticated
```

---

## Load Testing (Locust)

The project ships with a Locust test script at `server/locustfile.py` that simulates realistic multi-role traffic against all API endpoints across all 9 user roles.

### Install Locust

Locust is **not** in `requirements.txt` (it is a dev-only tool). Install it separately inside the virtualenv:

```bash
cd server
source venv/bin/activate
pip install locust
```

### Set up tokens

The script authenticates each virtual user by injecting a pre-captured JWT into the `access_token` cookie. Set tokens via environment variables (capture from DevTools → Application → Cookies):

```bash
export LOCUST_TOKEN_MASTER="eyJ..."
export LOCUST_TOKEN_SUPER_ADMIN="eyJ..."
export LOCUST_TOKEN_ADMIN="eyJ..."
export LOCUST_TOKEN_FACULTY="eyJ..."
export LOCUST_TOKEN_DELETE_AUTH="eyJ..."
export LOCUST_TOKEN_MIS_COORDINATOR="eyJ..."
export LOCUST_TOKEN_MIS_ACCUMULATOR="eyJ..."
export LOCUST_TOKEN_CHRONICLE_MASTER="eyJ..."
export LOCUST_TOKEN_SERVICE_ADMIN="eyJ..."
```

### User classes and weights

| Class | Weight | Role | Endpoints hit |
|---|---|---|---|
| `MasterUser` | 1 | master | Campuses, schools, users, assignments, export history, backup config |
| `SuperAdminUser` | 10 | super_admin | Dashboard counts, campus users, all record types, export all, audit history |
| `AdminUser` | 15 | admin | Dashboard counts, clubs, school/student activities, placements, faculties, exports |
| `FacultyUser` | 60 | faculty | Dashboard counts, publications, patents, certifications, FDP, activities, faculty search, **error reporting (POST)**, **bug report (POST)**, exports |
| `DeleteAuthUser` | 5 | delete_auth | Pending audit requests, audit history |
| `MISCoordinatorUser` | 8 | mis_coordinator | Dashboard counts, school activities, publications, FDP, coordinator export, MIS reports |
| `MISAccumulatorUser` | 3 | mis_accumulator | Received reports, own reports, data requests, coordinator list |
| `ChronicleMasterUser` | 1 | chronicle_master | Received reports, own reports, accumulator list |
| `ServiceAdminUser` | 1 | service_admin | Service dashboard stats, error tickets (all + filtered), bug reports, API status |

Weights reflect realistic traffic distribution: faculty make up ~60% of users. `wait_time = between(600, 1800)` (10–30 min) simulates actual human think time.

### Tagged tasks

Each task is tagged for selective execution. Available tags: `structure`, `users`, `dashboard`, `records`, `audit`, `export`, `reports`, `service`, `schools`, `config`, `auth`.

```bash
# Run only record-related tasks
locust -f locustfile.py --tags records --host=https://127.0.0.1:8000

# Run only service portal tasks
locust -f locustfile.py --tags service --host=https://127.0.0.1:8000

# Exclude export tasks (they generate large files)
locust -f locustfile.py --exclude-tags export --host=https://127.0.0.1:8000
```

### Write operations

The faculty user class includes **write (POST) operations** to realistically simulate frontend behavior:
- **Error reporting** — sends randomized error payloads to `/api/service/report-error/` (tests the deduplication pipeline)
- **Bug report submission** — posts to `/api/service/bug-reports/submit/`

### Running the tests

**Option A — via helper script (recommended)**

```bash
cd ~/nmpralekh
chmod +x locust.sh
./locust.sh
```

Then open the Locust UI at **http://localhost:8089** and configure user count and spawn rate.

**Option B — manual**

```bash
source venv/bin/activate
cd server
locust -f locustfile.py --host=https://127.0.0.1:8000
```

**Option C — headless (CI/scripted runs)**

```bash
locust -f locustfile.py \
  --host=https://127.0.0.1:8000 \
  --headless \
  --users 500 \
  --spawn-rate 10 \
  --run-time 5m
```

### Interpreting results

| Metric | Healthy target |
|---|---|
| Median response time | < 150 ms |
| 95th percentile | < 500 ms |
| Failure rate | < 1 % |
| Gunicorn worker CPU | < 80 % sustained |

> **Note:** The test script disables SSL verification (`urllib3.disable_warnings`) because the dev server uses a self-signed certificate via `django-sslserver`. Remove that line when testing against a properly signed staging environment.

---

## Testing

### Running the Automated Test Suite

```bash
cd server
python manage.py test
```

This runs **390 automated tests** across all 6 Django apps. No frontend, no browser, no Postman needed — Django spins up a temporary test database, simulates HTTP requests to every API endpoint, and tears it down when done.

To run tests for a specific app:

```bash
python manage.py test apps.accounts       # Accounts only
python manage.py test apps.schools        # Schools only
python manage.py test apps.records        # Records only
python manage.py test apps.audit          # Audit only
python manage.py test apps.export         # Export only
python manage.py test apps.service        # Service only
```

For verbose output:

```bash
python manage.py test --verbosity=2
```

### What the Automated Tests Cover

| Test File | Tests | What It Validates |
|-----------|-------|-------------------|
| `apps/accounts/tests.py` | ~45 | User model creation, `UserManager` (`create_user`, `create_superuser`), email normalization, all 13 permission classes, serializer validation (password min-length, `ChangePasswordSerializer`), login/logout/me API, user CRUD (list, create, update, soft-delete), self-deactivation prevention, service user & chronicle master singleton management, school faculties & campus users views |
| `apps/schools/tests.py` | ~40 | Campus/School/UserSchoolMapping models (`__str__`, unique constraints, FK cascades, `RESTRICT` delete protection), `get_user_school_ids()` utility for all role types with caching, campus CRUD + soft-deactivate + reactivate, school CRUD + scoping (master sees all, super_admin sees campus only), mapping creation with validation (role check, duplicate check, cross-campus check), my-schools (no pagination), school faculty view |
| `apps/records/tests.py` | ~35 | All 13 models — Club (`unique_together`), SchoolActivity, StudentActivity (club_name auto-fill), FDP/Workshop/GL, Publications, Patents, Certifications, Placements, PublicationAuthor (cascade + ordering), PatentApplicant, BackupConfiguration. Serializer auto-set `created_by`. API CRUD with permission checks. Audit-gated updates (202 response). Soft-delete behavior (records never hard-deleted). Dashboard counts endpoint |
| `apps/audit/tests.py` | ~20 | AuditRequest model (all field types, choices, FK behaviors — CASCADE on school, RESTRICT on requested_by, SET_NULL on reviewed_by). Serializer with nested `UserSerializer`. Approve DELETE (sets `is_deleted=True`), approve UPDATE (applies field changes via whitelist), reject (clears `pending_audit`, record unchanged). History view (excludes pending, allows master/super_admin/delete_auth). Permission gating on all endpoints |
| `apps/export/tests.py` | ~30 | GeneratedExport, MISDataRequest, MISReport models (defaults, `__str__`, FK behaviors). Serializer auto-set `accumulator`/`created_by` from request. Export history (master only). MIS report send workflow (send-admin, send-accumulator, send-superadmin, send-chronicle with permission checks). Coordinator, Accumulator, and Chronicle Master dashboard and export access. Chronicle Data Requests. `validate_export_params` helper (valid/invalid school_id, date formats) |
| `apps/service/tests.py` | ~35 | ErrorTicket, ErrorOccurrence, BugReport models. `make_fingerprint` normalization (digits→N, hex→0xADDR, SHA256, truncation at 200 chars). Error deduplication (same error → 1 ticket, 2 occurrences). `affected_users_count` tracking (unique users only). Closed ticket reopening on recurrence. Invalid payload returns `{ok: false}`. Bug report creation with user auto-set. Ticket list filtering (status, source, search, sort). Ticket status transitions with `resolved_by`/`resolved_at` set on close and cleared on reopen. Bug report admin updates (status, admin_note, linked_ticket). Service dashboard stats |

### What the Tests Specifically Validate

- **Models**: Creation, `__str__` output, default values, `unique_together`, FK cascade behavior (`CASCADE`, `RESTRICT`, `SET_NULL`), field choices, ordering, `db_table`
- **Permissions**: All 13 custom permission classes tested with correct and incorrect roles, including edge cases (e.g., `IsMaster` excludes `is_service_admin` users)
- **Serializers**: Field validation, password min-length, `created_by` auto-injection, `club_name` auto-fill from FK, nested read-only fields (`campus_name`, `school_name`, `user_full_name`)
- **API Endpoints**: Correct HTTP status codes (200, 201, 202, 400, 401, 403, 404), response data, pagination, role-based access control on every endpoint
- **Business Logic**: Audit approve/reject workflow, error fingerprint deduplication, soft-delete (never hard-delete), school-scoped data isolation, singleton patterns (service user, chronicle master), token blacklisting on logout

### What You Must Test Manually

The automated tests cover all backend API logic, but the following areas require manual verification because they depend on the browser, external services, or visual inspection.

#### Frontend UI (browser testing)

| What to Test | Why |
|--------------|-----|
| Pages load without blank screens | React rendering, routing, lazy loading |
| Forms show validation errors correctly | Client-side validation, field highlighting |
| Buttons and links navigate correctly | React Router, sidebar, breadcrumbs |
| Tables display data with pagination | Sorting UI, empty states, page controls |
| Modals open and close properly | Create/edit/delete confirmation dialogs |
| Responsive layout on mobile/tablet | Breakpoints, sidebar collapse |
| Loading spinners and error toasts | UX feedback on slow or failed requests |

#### End-to-End (frontend + backend together)

| What to Test | Why |
|--------------|-----|
| Login → Dashboard flow | Full cookie-based JWT auth through the browser, CSRF tokens |
| Session stays alive after 30 min | Auto token refresh without logging out |
| Excel file downloads | Click Export → `.xlsx` downloads and opens correctly |
| Role-based UI visibility | Admin sees admin panels, faculty doesn't |
| Date pickers, dropdowns, search bars | Real filter interactions with live API |

#### Infrastructure (requires running services)

| What to Test | Why |
|--------------|-----|
| Rate limiting | Hit login 11 times rapidly → should get blocked (needs Redis) |
| Nightly export Celery task | Scheduled job runs at midnight and creates files (needs Celery + Redis) |
| Manual backup trigger | Backup creates `.dump` file on disk (needs PostgreSQL) |
| Dashboard caching | Second load is faster (needs Redis) |

#### Quick Manual Test Checklist

```
□ Login with each role: master, super_admin, admin, user, delete_auth,
  mis_coordinator, mis_accumulator, chronicle_master, service_admin
□ Download one Excel export and open it in Excel/Sheets
□ Trigger a manual backup and verify the .dump file exists
□ Leave a session idle for 30+ min, verify it auto-refreshes
□ Rapid-fire 11+ login attempts to confirm rate limiting
□ Check all pages on a mobile screen size
□ Submit a bug report from the frontend and verify it appears in the service portal
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
CORS             →  Restricted to configured origins only (via .env)
SQL injection    →  Django ORM parameterised queries throughout
Reverse proxy    →  Nginx is the only public entry point; Gunicorn bound to 127.0.0.1
Admin panel      →  /admin/ blocked at Nginx level for all external IPs
Rate limiting    →  30 req/s at Nginx + DRF throttles (60/min anon, 300/min auth)
Firewall         →  UFW blocks all ports except SSH and the Nginx port
HSTS             →  Enabled in production (DEBUG=False) — 1-year max-age
```

---

## Important Rules

- Never commit `.env` or sensitive configuration files
- Never gitignore `migrations/` — they must be committed
- All record edits and deletes go through audit — nothing is directly modified
- Faculty only see and manage their own publications, patents, certifications
- Super admins are strictly read-only
- Master is the only role that creates campuses, schools, and users
- DOI/Link fields are mandatory for Publications, Patents, and Certifications
- All dropdown menus use the searchable `SearchableSelect` component

---

## Mobile App (Android)

An Android mobile client is available to provide easy access for faculty members on the go. It is built using the native Android SDK (Java) and connects to the same Django REST API as the web client.

### Features
- **Native Login**: Authenticates securely via the `/api/auth/login/` endpoint.
- **Faculty Dashboard**: A mobile-optimized DrawerLayout (sidebar) that provides access to all faculty-specific modules (School Activities, Student Activities, FDP, Publications, Patents, Certifications, Placements).
- **Custom Branding**: Integrated with the official NMPralekh logo and a clean, light-blue Material Design UI.
- **Networking**: Uses `OkHttp` for fast and reliable API requests.

### Setup and Running
1. Open the `android-client/` directory in **Android Studio**.
2. Sync the project with Gradle files.
3. Ensure the Django server is running locally with `ALLOWED_HOSTS = ['*']` or specifically allowing the Android emulator IP (`10.0.2.2`).
4. Build and run the app on an emulator or a physical device.
