-- =============================================================================
-- NMPRALEKH DATABASE SCHEMA
-- Compatible with: PostgreSQL 15+
-- Engine: Managed by PostgreSQL Storage Manager
-- Charset: UTF-8 (Native support)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- DATABASE SETUP (Referential)
-- -----------------------------------------------------------------------------
-- CREATE DATABASE nmpralekh;
-- \c nmpralekh

-- =============================================================================
-- SECTION 0: CUSTOM TYPES & FUNCTIONS
-- =============================================================================

-- Enums
CREATE TYPE user_role AS ENUM ('master', 'super_admin', 'admin', 'user', 'delete_auth');
CREATE TYPE audit_action AS ENUM ('UPDATE', 'DELETE');
CREATE TYPE audit_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE export_type AS ENUM ('nightly', 'manual');
CREATE TYPE club_type AS ENUM ('club', 'committee', 'placecom');
CREATE TYPE activity_category AS ENUM ('club', 'committee', 'other');
CREATE TYPE author_category AS ENUM ('faculty', 'student');
CREATE TYPE patent_state AS ENUM ('filed', 'published', 'granted');

-- Trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';


-- =============================================================================
-- SECTION 1: FOUNDATION TABLES
-- Build order: campuses → schools → users → mapping
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: campuses
-- -----------------------------------------------------------------------------
CREATE TABLE campuses (
    id              SERIAL              PRIMARY KEY,
    name            VARCHAR(255)        NOT NULL UNIQUE,
    code            VARCHAR(20)         NOT NULL UNIQUE,
    city            VARCHAR(100)        NOT NULL,
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- -----------------------------------------------------------------------------
-- TABLE: schools
-- -----------------------------------------------------------------------------
CREATE TABLE schools (
    id              SERIAL              PRIMARY KEY,
    campus_id       INT                     NULL,
    name            VARCHAR(255)        NOT NULL UNIQUE,
    code            VARCHAR(20)         NOT NULL UNIQUE,
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_schools_campus
        FOREIGN KEY (campus_id)
        REFERENCES campuses (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);


-- -----------------------------------------------------------------------------
-- TABLE: users
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL              PRIMARY KEY,
    username        VARCHAR(100)        NOT NULL UNIQUE,
    email           VARCHAR(255)        NOT NULL UNIQUE,
    password        VARCHAR(255)        NOT NULL,
    full_name       VARCHAR(255)        NOT NULL,
    role            user_role           NOT NULL,
    campus_id       INT                     NULL,
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    is_staff        BOOLEAN             NOT NULL DEFAULT FALSE,
    is_superuser    BOOLEAN             NOT NULL DEFAULT FALSE,
    created_by      INT                     NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login      TIMESTAMP               NULL,

    CONSTRAINT fk_users_campus
        FOREIGN KEY (campus_id)
        REFERENCES campuses (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_users_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- -----------------------------------------------------------------------------
-- TABLE: user_school_mapping
-- -----------------------------------------------------------------------------
CREATE TABLE user_school_mapping (
    id              SERIAL              PRIMARY KEY,
    user_id         INT                 NOT NULL,
    school_id       INT                 NOT NULL,
    assigned_by     INT                 NOT NULL,
    assigned_at     TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, school_id),

    CONSTRAINT fk_usm_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_usm_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_usm_assigned_by
        FOREIGN KEY (assigned_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);


-- =============================================================================
-- SECTION 2: SYSTEM TABLES
-- Audit and Exports
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: audit_requests
-- -----------------------------------------------------------------------------
CREATE TABLE audit_requests (
    id              SERIAL              PRIMARY KEY,
    table_name      VARCHAR(100)        NOT NULL,
    record_id       INT                 NOT NULL,
    action          audit_action        NOT NULL,
    old_data        JSONB               NOT NULL,
    new_data        JSONB                   NULL,
    school_id       INT                     NULL,
    requested_by    INT                 NOT NULL,
    requested_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by     INT                     NULL,
    reviewed_at     TIMESTAMP               NULL,
    status          audit_status        NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_audit_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_audit_requested_by
        FOREIGN KEY (requested_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_audit_reviewed_by
        FOREIGN KEY (reviewed_by)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX idx_audit_status ON audit_requests(status);
CREATE INDEX idx_audit_table_record ON audit_requests(table_name, record_id);


-- -----------------------------------------------------------------------------
-- TABLE: generated_exports
-- -----------------------------------------------------------------------------
CREATE TABLE generated_exports (
    id              SERIAL              PRIMARY KEY,
    campus_id       INT                     NULL,
    export_type     export_type         NOT NULL,
    filename        VARCHAR(500)        NOT NULL,
    filepath        VARCHAR(1000)       NOT NULL,
    generated_by    INT                     NULL,
    generated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_size_kb    INT                 NOT NULL DEFAULT 0,
    date_range_from DATE                    NULL,
    date_range_to   DATE                    NULL,
    record_count    INT                 NOT NULL DEFAULT 0,

    CONSTRAINT fk_exp_campus
        FOREIGN KEY (campus_id)
        REFERENCES campuses (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_exp_generated_by
        FOREIGN KEY (generated_by)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- =============================================================================
-- SECTION 3: ACADEMIC INFRASTRUCTURE
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: courses
-- -----------------------------------------------------------------------------
CREATE TABLE courses (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    name            VARCHAR(255)        NOT NULL,
    code            VARCHAR(50)         NOT NULL,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    UNIQUE (school_id, code),

    CONSTRAINT fk_courses_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_courses_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_courses_audit
        FOREIGN KEY (pending_audit_id)
        REFERENCES audit_requests (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- -----------------------------------------------------------------------------
-- TABLE: academic_years
-- -----------------------------------------------------------------------------
CREATE TABLE academic_years (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    course_id       INT                 NOT NULL,
    year_number     SMALLINT            NOT NULL,
    graduation_year SMALLINT            NOT NULL,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    UNIQUE (course_id, year_number, graduation_year),

    CONSTRAINT fk_ayear_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_ayear_course FOREIGN KEY (course_id) REFERENCES courses (id),
    CONSTRAINT fk_ayear_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);


-- -----------------------------------------------------------------------------
-- TABLE: semesters
-- -----------------------------------------------------------------------------
CREATE TABLE semesters (
    id              SERIAL              PRIMARY KEY,
    academic_year_id INT                NOT NULL,
    semester_number SMALLINT            NOT NULL,
    start_date      DATE                    NULL,
    end_date        DATE                    NULL,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    UNIQUE (academic_year_id, semester_number),

    CONSTRAINT fk_sem_ayear FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
    CONSTRAINT fk_sem_audit FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);


-- -----------------------------------------------------------------------------
-- TABLE: subjects
-- -----------------------------------------------------------------------------
CREATE TABLE subjects (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    semester_id     INT                 NOT NULL,
    name            VARCHAR(255)        NOT NULL,
    code            VARCHAR(50)         NOT NULL,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    UNIQUE (semester_id, code),

    CONSTRAINT fk_sub_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_sub_sem    FOREIGN KEY (semester_id) REFERENCES semesters (id),
    CONSTRAINT fk_sub_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);


-- -----------------------------------------------------------------------------
-- TABLE: class_groups
-- -----------------------------------------------------------------------------
CREATE TABLE class_groups (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    course_id       INT                 NOT NULL,
    name            VARCHAR(100)        NOT NULL,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    UNIQUE (school_id, name),

    CONSTRAINT fk_cg_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_cg_course FOREIGN KEY (course_id) REFERENCES courses (id),
    CONSTRAINT fk_cg_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);


-- -----------------------------------------------------------------------------
-- TABLE: exam_groups
-- -----------------------------------------------------------------------------
CREATE TABLE exam_groups (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    semester_id     INT                 NOT NULL,
    name            VARCHAR(255)        NOT NULL,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    UNIQUE (semester_id, name),

    CONSTRAINT fk_eg_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_eg_sem    FOREIGN KEY (semester_id) REFERENCES semesters (id),
    CONSTRAINT fk_eg_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);


-- -----------------------------------------------------------------------------
-- TABLE: exam_groups_class_groups (Join Table)
-- -----------------------------------------------------------------------------
CREATE TABLE exam_groups_class_groups (
    id              SERIAL              PRIMARY KEY,
    examgroup_id    INT                 NOT NULL,
    classgroup_id   INT                 NOT NULL,

    UNIQUE (examgroup_id, classgroup_id),

    CONSTRAINT fk_egcg_eg FOREIGN KEY (examgroup_id) REFERENCES exam_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_egcg_cg FOREIGN KEY (classgroup_id) REFERENCES class_groups (id) ON DELETE CASCADE
);


-- -----------------------------------------------------------------------------
-- TABLE: clubs
-- -----------------------------------------------------------------------------
CREATE TABLE clubs (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    name            VARCHAR(255)        NOT NULL,
    type            club_type           NOT NULL DEFAULT 'club',
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    UNIQUE (school_id, name),

    CONSTRAINT fk_clubs_school     FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_clubs_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_clubs_audit      FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);


-- -----------------------------------------------------------------------------
-- TABLE: faculty_teaching_assignments
-- -----------------------------------------------------------------------------
CREATE TABLE faculty_teaching_assignments (
    id              SERIAL              PRIMARY KEY,
    faculty_id      INT                 NOT NULL  /* COMMENT 'Link to user with role=user' */,
    school_id       INT                 NOT NULL,
    subject_id      INT                 NOT NULL,
    class_group_id  INT                 NOT NULL,
    semester_id     INT                 NOT NULL,
    status          audit_status        NOT NULL DEFAULT 'pending',
    requested_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by     INT                     NULL,
    reviewed_at     TIMESTAMP               NULL,
    notes           TEXT                    NULL,

    UNIQUE (faculty_id, subject_id, class_group_id),
    KEY idx_fta_status (status),

    CONSTRAINT fk_fta_faculty FOREIGN KEY (faculty_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_fta_school  FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_fta_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT fk_fta_cg      FOREIGN KEY (class_group_id) REFERENCES class_groups (id),
    CONSTRAINT fk_fta_sem     FOREIGN KEY (semester_id) REFERENCES semesters (id)
);

CREATE INDEX idx_fta_status ON faculty_teaching_assignments(status);


-- =============================================================================
-- SECTION 4: RECORD TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: exams_conducted
-- -----------------------------------------------------------------------------
CREATE TABLE exams_conducted (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    exam_group_id   INT                     NULL,
    subject_id      INT                     NULL,
    class_group_id  INT                     NULL,
    faculty_id      INT                     NULL,
    date            DATE                NOT NULL,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    CONSTRAINT fk_exams_school     FOREIGN KEY (school_id)     REFERENCES schools (id),
    CONSTRAINT fk_exams_exam_group FOREIGN KEY (exam_group_id) REFERENCES exam_groups (id),
    CONSTRAINT fk_exams_subject    FOREIGN KEY (subject_id)    REFERENCES subjects (id),
    CONSTRAINT fk_exams_class      FOREIGN KEY (class_group_id) REFERENCES class_groups (id),
    CONSTRAINT fk_exams_faculty    FOREIGN KEY (faculty_id)    REFERENCES users (id),
    CONSTRAINT fk_exams_audit      FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);

CREATE INDEX idx_exams_school ON exams_conducted(school_id);
CREATE INDEX idx_exams_date ON exams_conducted(date);

CREATE TRIGGER trg_exams_conducted_updated_at
BEFORE UPDATE ON exams_conducted
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- -----------------------------------------------------------------------------
-- TABLE: student_marks
-- -----------------------------------------------------------------------------
CREATE TABLE student_marks (
    id              SERIAL              PRIMARY KEY,
    exam_id         INT                 NOT NULL,
    student_name    VARCHAR(255)        NOT NULL,
    roll_number     VARCHAR(50)         NOT NULL,
    marks_obtained  DECIMAL(6,2)        NOT NULL,
    max_marks       DECIMAL(6,2)        NOT NULL,
    is_absent       BOOLEAN             NOT NULL DEFAULT FALSE,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (exam_id, roll_number),

    CONSTRAINT fk_marks_exam FOREIGN KEY (exam_id) REFERENCES exams_conducted (id) ON DELETE CASCADE,
    CONSTRAINT fk_marks_user FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE TRIGGER trg_student_marks_updated_at
BEFORE UPDATE ON student_marks
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- -----------------------------------------------------------------------------
-- TABLE: school_activities
-- -----------------------------------------------------------------------------
CREATE TABLE school_activities (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    name            VARCHAR(500)        NOT NULL,
    date            DATE                NOT NULL,
    details         TEXT                NOT NULL,
    is_school_wide  BOOLEAN             NOT NULL DEFAULT FALSE,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    CONSTRAINT fk_sact_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_sact_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);

CREATE TRIGGER trg_school_activities_updated_at
BEFORE UPDATE ON school_activities
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- -----------------------------------------------------------------------------
-- TABLE: school_activity_collaborations
-- -----------------------------------------------------------------------------
CREATE TABLE school_activity_collaborations (
    id                      SERIAL          PRIMARY KEY,
    activity_id             INT             NOT NULL,
    collaborating_school_id INT             NOT NULL,
    notes                   VARCHAR(255)        NULL,

    UNIQUE (activity_id, collaborating_school_id),

    CONSTRAINT fk_sactcollab_activity FOREIGN KEY (activity_id) REFERENCES school_activities (id) ON DELETE CASCADE,
    CONSTRAINT fk_sactcollab_school   FOREIGN KEY (collaborating_school_id) REFERENCES schools (id) ON DELETE CASCADE
);


-- -----------------------------------------------------------------------------
-- TABLE: student_activities
-- -----------------------------------------------------------------------------
CREATE TABLE student_activities (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    name            VARCHAR(500)        NOT NULL,
    date            DATE                NOT NULL,
    details         TEXT                NOT NULL,
    club_id         INT                     NULL,
    conducted_by    VARCHAR(255)            NULL /* COMMENT 'Legacy/Fallback free text' */,
    activity_type   activity_category   NOT NULL DEFAULT 'club',
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    CONSTRAINT fk_stact_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_stact_club   FOREIGN KEY (club_id)   REFERENCES clubs (id),
    CONSTRAINT fk_stact_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);

CREATE TRIGGER trg_student_activities_updated_at
BEFORE UPDATE ON student_activities
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- -----------------------------------------------------------------------------
-- TABLE: student_activity_collaborations
-- -----------------------------------------------------------------------------
CREATE TABLE student_activity_collaborations (
    id                          SERIAL          PRIMARY KEY,
    activity_id                 INT             NOT NULL,
    collaborating_club_or_committee VARCHAR(255)    NULL,
    collaborating_school_id     INT                 NULL,

    CONSTRAINT fk_stactcollab_activity FOREIGN KEY (activity_id) REFERENCES student_activities (id) ON DELETE CASCADE,
    CONSTRAINT fk_stactcollab_school   FOREIGN KEY (collaborating_school_id) REFERENCES schools (id) ON DELETE SET NULL
);


-- -----------------------------------------------------------------------------
-- TABLE: faculty_fdp_workshop_gl
-- -----------------------------------------------------------------------------
CREATE TABLE faculty_fdp_workshop_gl (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    faculty_name    VARCHAR(255)        NOT NULL,
    date_start      DATE                NOT NULL,
    date_end        DATE                    NULL,
    name            VARCHAR(500)        NOT NULL,
    details         TEXT                NOT NULL,
    type            VARCHAR(20)         NOT NULL, -- FDP, Workshop, Guest_Lecture
    organizing_body VARCHAR(255)            NULL,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    CONSTRAINT fk_fdp_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_fdp_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);

CREATE TRIGGER trg_fdp_updated_at
BEFORE UPDATE ON faculty_fdp_workshop_gl
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- -----------------------------------------------------------------------------
-- TABLE: faculty_publications
-- -----------------------------------------------------------------------------
CREATE TABLE faculty_publications (
    id                          SERIAL          PRIMARY KEY,
    school_id                   INT                 NOT NULL,
    author_name                 VARCHAR(255)        NOT NULL,
    author_type                 author_category     NOT NULL DEFAULT 'faculty',
    title_of_paper              VARCHAR(1000)       NOT NULL,
    journal_or_conference_name  VARCHAR(500)        NOT NULL,
    date                        DATE                NOT NULL,
    venue                       VARCHAR(500)            NULL,
    publication                 VARCHAR(255)            NULL,
    doi_or_link                 VARCHAR(500)            NULL,
    is_own_work                 BOOLEAN             NOT NULL DEFAULT TRUE,
    created_by                  INT                 NOT NULL,
    created_at                  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted                  BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id            INT                     NULL,

    CONSTRAINT fk_pub_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_pub_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);

CREATE TRIGGER trg_publications_updated_at
BEFORE UPDATE ON faculty_publications
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- -----------------------------------------------------------------------------
-- TABLE: publication_authors
-- -----------------------------------------------------------------------------
CREATE TABLE publication_authors (
    id              SERIAL              PRIMARY KEY,
    publication_id  INT                 NOT NULL,
    name            VARCHAR(255)        NOT NULL,
    author_type     author_category     NOT NULL DEFAULT 'faculty',
    is_primary      BOOLEAN             NOT NULL DEFAULT FALSE,
    "order"         SMALLINT            NOT NULL DEFAULT 1,

    CONSTRAINT fk_pub_auth_pub FOREIGN KEY (publication_id) REFERENCES faculty_publications (id) ON DELETE CASCADE
);


-- -----------------------------------------------------------------------------
-- TABLE: patents
-- -----------------------------------------------------------------------------
CREATE TABLE patents (
    id                  SERIAL          PRIMARY KEY,
    school_id           INT             NOT NULL,
    applicant_name      VARCHAR(255)    NOT NULL,
    applicant_type      author_category NOT NULL DEFAULT 'faculty',
    title_of_patent     VARCHAR(1000)   NOT NULL,
    details             TEXT                NULL,
    date_of_publication DATE            NOT NULL,
    journal_number      VARCHAR(100)    NOT NULL,
    patent_status       patent_state    NOT NULL DEFAULT 'filed',
    is_own_work         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_by          INT             NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted          BOOLEAN         NOT NULL DEFAULT FALSE,
    pending_audit_id    INT                 NULL,

    CONSTRAINT fk_patents_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_patents_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);

CREATE TRIGGER trg_patents_updated_at
BEFORE UPDATE ON patents
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- -----------------------------------------------------------------------------
-- TABLE: patent_applicants
-- -----------------------------------------------------------------------------
CREATE TABLE patent_applicants (
    id              SERIAL              PRIMARY KEY,
    patent_id       INT                 NOT NULL,
    name            VARCHAR(255)        NOT NULL,
    applicant_type  author_category     NOT NULL DEFAULT 'faculty',
    is_primary      BOOLEAN             NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_pat_app_pat FOREIGN KEY (patent_id) REFERENCES patents (id) ON DELETE CASCADE
);


-- -----------------------------------------------------------------------------
-- TABLE: certifications
-- -----------------------------------------------------------------------------
CREATE TABLE certifications (
    id                  SERIAL          PRIMARY KEY,
    school_id           INT             NOT NULL,
    date                DATE            NOT NULL,
    name                VARCHAR(255)    NOT NULL,
    title_of_course     VARCHAR(500)    NOT NULL,
    details             TEXT                NULL,
    agency              VARCHAR(255)    NOT NULL,
    credly_or_proof_link VARCHAR(500)       NULL,
    person_type         author_category NOT NULL DEFAULT 'faculty',
    created_by          INT             NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted          BOOLEAN         NOT NULL DEFAULT FALSE,
    pending_audit_id    INT                 NULL,

    CONSTRAINT fk_cert_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_cert_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);

CREATE TRIGGER trg_certifications_updated_at
BEFORE UPDATE ON certifications
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- -----------------------------------------------------------------------------
-- TABLE: placement_activities
-- -----------------------------------------------------------------------------
CREATE TABLE placement_activities (
    id              SERIAL              PRIMARY KEY,
    school_id       INT                 NOT NULL,
    name            VARCHAR(500)        NOT NULL,
    date            DATE                NOT NULL,
    details         TEXT                NOT NULL,
    company_name    VARCHAR(255)            NULL,
    placecom_id     INT                     NULL /* COMMENT 'FK to clubs with type=placecom' */,
    created_by      INT                 NOT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted      BOOLEAN             NOT NULL DEFAULT FALSE,
    pending_audit_id INT                    NULL,

    CONSTRAINT fk_placement_school FOREIGN KEY (school_id) REFERENCES schools (id),
    CONSTRAINT fk_placement_club   FOREIGN KEY (placecom_id) REFERENCES clubs (id),
    CONSTRAINT fk_placement_audit  FOREIGN KEY (pending_audit_id) REFERENCES audit_requests (id)
);

CREATE TRIGGER trg_placement_updated_at
BEFORE UPDATE ON placement_activities
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================