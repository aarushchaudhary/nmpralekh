-- =============================================================================
-- MIS PORTAL DATABASE SCHEMA
-- Compatible with: MariaDB 10.6+
-- Engine: InnoDB (ACID compliant)
-- Charset: utf8mb4 (full Unicode support)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- DATABASE SETUP
-- -----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS nmpralekh
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE nmpralekh;

-- Enforce strict mode and foreign key checks
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================================
-- SECTION 1: FOUNDATION TABLES
-- Build order: schools → users → user_school_mapping
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: schools
-- -----------------------------------------------------------------------------
CREATE TABLE schools (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)        NOT NULL,
    code            VARCHAR(20)         NOT NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_schools_code (code),
    UNIQUE KEY uq_schools_name (name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Top-level organisational unit. All records are scoped to a school.';


-- -----------------------------------------------------------------------------
-- TABLE: users
-- Self-referencing FK on created_by (master creates admins, admins create users)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    username        VARCHAR(100)        NOT NULL,
    email           VARCHAR(255)        NOT NULL,
    password_hash   VARCHAR(255)        NOT NULL,
    full_name       VARCHAR(255)        NOT NULL,
    role            ENUM(
                        'master',
                        'super_admin',
                        'admin',
                        'user',
                        'delete_auth'
                    )                   NOT NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    created_by      INT UNSIGNED            NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login      DATETIME                NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),

    CONSTRAINT fk_users_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='All portal users across all roles.';


-- -----------------------------------------------------------------------------
-- TABLE: user_school_mapping
-- Links a user to one or more schools. Admins and users only see their schools.
-- -----------------------------------------------------------------------------
CREATE TABLE user_school_mapping (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED        NOT NULL,
    school_id       INT UNSIGNED        NOT NULL,
    assigned_by     INT UNSIGNED        NOT NULL,
    assigned_at     DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_user_school (user_id, school_id),

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
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Maps users to schools. Controls data visibility.';


-- =============================================================================
-- SECTION 2: AUDIT TABLE (shell — record tables will FK into this)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: audit_requests
-- Every UPDATE and DELETE creates a row here first.
-- The actual DB change only executes after delete_auth approves it.
-- -----------------------------------------------------------------------------
CREATE TABLE audit_requests (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    table_name      VARCHAR(100)        NOT NULL  COMMENT 'e.g. patents, certifications',
    record_id       INT UNSIGNED        NOT NULL  COMMENT 'PK of the row being changed',
    action          ENUM('UPDATE','DELETE')
                                        NOT NULL,
    old_data        JSON                NOT NULL  COMMENT 'Snapshot of row before change',
    new_data        JSON                    NULL  COMMENT 'What the row will become; NULL for DELETE',
    requested_by    INT UNSIGNED        NOT NULL,
    requested_at    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by     INT UNSIGNED            NULL,
    reviewed_at     DATETIME                NULL,
    status          ENUM('pending','approved','rejected')
                                        NOT NULL DEFAULT 'pending',

    PRIMARY KEY (id),
    KEY idx_audit_status (status),
    KEY idx_audit_table_record (table_name, record_id),

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
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Pending change requests awaiting delete_auth approval.';


-- =============================================================================
-- SECTION 3: RECORD TABLES
-- All follow the same pattern:
--   school_id, data columns, created_by, created_at, updated_at,
--   is_deleted (soft delete), pending_audit_id
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: exams_conducted
-- -----------------------------------------------------------------------------
CREATE TABLE exams_conducted (
    id                          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    school_id                   INT UNSIGNED    NOT NULL,
    course                      VARCHAR(500)    NOT NULL  COMMENT 'e.g. B.Tech CSEDS (I and III Sem)',
    examination                 VARCHAR(255)    NOT NULL  COMMENT 'e.g. Mid Term Test II',
    date                        DATE            NOT NULL,
    expected_graduation_year    YEAR            NOT NULL  COMMENT 'e.g. 2027',
    created_by                  INT UNSIGNED    NOT NULL,
    created_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,
    is_deleted                  TINYINT(1)      NOT NULL DEFAULT 0,
    pending_audit_id            INT UNSIGNED        NULL,

    PRIMARY KEY (id),
    KEY idx_exams_school (school_id),
    KEY idx_exams_grad_year (expected_graduation_year),
    KEY idx_exams_date (date),

    CONSTRAINT fk_exams_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_exams_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_exams_audit
        FOREIGN KEY (pending_audit_id)
        REFERENCES audit_requests (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLE: school_activities
-- -----------------------------------------------------------------------------
CREATE TABLE school_activities (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    school_id       INT UNSIGNED        NOT NULL,
    name            VARCHAR(500)        NOT NULL,
    date            DATE                NOT NULL,
    details         TEXT                NOT NULL,
    is_school_wide  TINYINT(1)          NOT NULL DEFAULT 0
                                        COMMENT '1 = conducted for entire school',
    created_by      INT UNSIGNED        NOT NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,
    is_deleted      TINYINT(1)          NOT NULL DEFAULT 0,
    pending_audit_id INT UNSIGNED           NULL,

    PRIMARY KEY (id),
    KEY idx_sact_school (school_id),
    KEY idx_sact_date (date),

    CONSTRAINT fk_sact_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_sact_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_sact_audit
        FOREIGN KEY (pending_audit_id)
        REFERENCES audit_requests (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLE: school_activity_collaborations
-- One activity can be co-hosted by multiple other schools
-- -----------------------------------------------------------------------------
CREATE TABLE school_activity_collaborations (
    id                      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    activity_id             INT UNSIGNED    NOT NULL,
    collaborating_school_id INT UNSIGNED    NOT NULL,
    notes                   VARCHAR(255)        NULL  COMMENT 'e.g. co-hosted, co-sponsored',

    PRIMARY KEY (id),
    UNIQUE KEY uq_sact_collab (activity_id, collaborating_school_id),

    CONSTRAINT fk_sactcollab_activity
        FOREIGN KEY (activity_id)
        REFERENCES school_activities (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_sactcollab_school
        FOREIGN KEY (collaborating_school_id)
        REFERENCES schools (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLE: student_activities
-- -----------------------------------------------------------------------------
CREATE TABLE student_activities (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    school_id       INT UNSIGNED        NOT NULL,
    name            VARCHAR(500)        NOT NULL,
    date            DATE                NOT NULL,
    details         TEXT                NOT NULL,
    conducted_by    VARCHAR(255)        NOT NULL  COMMENT 'Club or committee name',
    activity_type   ENUM('club','committee','other')
                                        NOT NULL DEFAULT 'club',
    created_by      INT UNSIGNED        NOT NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,
    is_deleted      TINYINT(1)          NOT NULL DEFAULT 0,
    pending_audit_id INT UNSIGNED           NULL,

    PRIMARY KEY (id),
    KEY idx_stact_school (school_id),
    KEY idx_stact_date (date),

    CONSTRAINT fk_stact_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_stact_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_stact_audit
        FOREIGN KEY (pending_audit_id)
        REFERENCES audit_requests (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLE: student_activity_collaborations
-- -----------------------------------------------------------------------------
CREATE TABLE student_activity_collaborations (
    id                          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    activity_id                 INT UNSIGNED    NOT NULL,
    collaborating_club_or_committee VARCHAR(255)    NULL,
    collaborating_school_id     INT UNSIGNED        NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_stactcollab_activity
        FOREIGN KEY (activity_id)
        REFERENCES student_activities (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_stactcollab_school
        FOREIGN KEY (collaborating_school_id)
        REFERENCES schools (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLE: faculty_fdp_workshop_gl
-- -----------------------------------------------------------------------------
CREATE TABLE faculty_fdp_workshop_gl (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    school_id       INT UNSIGNED        NOT NULL,
    faculty_name    VARCHAR(255)        NOT NULL,
    date_start      DATE                NOT NULL,
    date_end        DATE                    NULL  COMMENT 'NULL if single-day event',
    name            VARCHAR(500)        NOT NULL  COMMENT 'Title of the FDP / Workshop / GL',
    details         TEXT                NOT NULL,
    type            ENUM('FDP','Workshop','Guest_Lecture')
                                        NOT NULL,
    organizing_body VARCHAR(255)            NULL  COMMENT 'e.g. NPTEL, Coursera, Duke University',
    created_by      INT UNSIGNED        NOT NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,
    is_deleted      TINYINT(1)          NOT NULL DEFAULT 0,
    pending_audit_id INT UNSIGNED           NULL,

    PRIMARY KEY (id),
    KEY idx_fdp_school (school_id),
    KEY idx_fdp_type (type),
    KEY idx_fdp_date_start (date_start),

    CONSTRAINT fk_fdp_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_fdp_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_fdp_audit
        FOREIGN KEY (pending_audit_id)
        REFERENCES audit_requests (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLE: faculty_publications
-- -----------------------------------------------------------------------------
CREATE TABLE faculty_publications (
    id                          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    school_id                   INT UNSIGNED    NOT NULL,
    author_name                 VARCHAR(255)    NOT NULL,
    author_type                 ENUM('faculty','student')
                                                NOT NULL DEFAULT 'faculty',
    title_of_paper              VARCHAR(1000)   NOT NULL,
    journal_or_conference_name  VARCHAR(500)    NOT NULL,
    date                        DATE            NOT NULL,
    venue                       VARCHAR(500)        NULL,
    publication                 VARCHAR(255)        NULL  COMMENT 'e.g. IEEE Xplore, Springer',
    doi_or_link                 VARCHAR(500)        NULL,
    created_by                  INT UNSIGNED    NOT NULL,
    created_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,
    is_deleted                  TINYINT(1)      NOT NULL DEFAULT 0,
    pending_audit_id            INT UNSIGNED        NULL,

    PRIMARY KEY (id),
    KEY idx_pub_school (school_id),
    KEY idx_pub_date (date),
    KEY idx_pub_author_type (author_type),

    CONSTRAINT fk_pub_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_pub_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_pub_audit
        FOREIGN KEY (pending_audit_id)
        REFERENCES audit_requests (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLE: patents
-- -----------------------------------------------------------------------------
CREATE TABLE patents (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    school_id           INT UNSIGNED    NOT NULL,
    applicant_name      VARCHAR(255)    NOT NULL,
    applicant_type      ENUM('faculty','student')
                                        NOT NULL DEFAULT 'faculty',
    title_of_patent     VARCHAR(1000)   NOT NULL,
    details             TEXT                NULL,
    date_of_publication DATE            NOT NULL,
    journal_number      VARCHAR(100)    NOT NULL  COMMENT 'e.g. 22/2025',
    patent_status       ENUM('filed','published','granted')
                                        NOT NULL DEFAULT 'filed',
    created_by          INT UNSIGNED    NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,
    is_deleted          TINYINT(1)      NOT NULL DEFAULT 0,
    pending_audit_id    INT UNSIGNED        NULL,

    PRIMARY KEY (id),
    KEY idx_patents_school (school_id),
    KEY idx_patents_status (patent_status),
    KEY idx_patents_date (date_of_publication),

    CONSTRAINT fk_patents_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_patents_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_patents_audit
        FOREIGN KEY (pending_audit_id)
        REFERENCES audit_requests (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLE: certifications
-- -----------------------------------------------------------------------------
CREATE TABLE certifications (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    school_id           INT UNSIGNED    NOT NULL,
    date                DATE            NOT NULL,
    name                VARCHAR(255)    NOT NULL  COMMENT 'Name of the faculty or student',
    title_of_course     VARCHAR(500)    NOT NULL,
    details             TEXT                NULL,
    agency              VARCHAR(255)    NOT NULL  COMMENT 'e.g. Coursera, Google, Amazon',
    credly_or_proof_link VARCHAR(500)       NULL,
    person_type         ENUM('faculty','student')
                                        NOT NULL DEFAULT 'faculty',
    created_by          INT UNSIGNED    NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,
    is_deleted          TINYINT(1)      NOT NULL DEFAULT 0,
    pending_audit_id    INT UNSIGNED        NULL,

    PRIMARY KEY (id),
    KEY idx_cert_school (school_id),
    KEY idx_cert_date (date),
    KEY idx_cert_agency (agency),

    CONSTRAINT fk_cert_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_cert_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_cert_audit
        FOREIGN KEY (pending_audit_id)
        REFERENCES audit_requests (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- TABLE: placement_activities
-- -----------------------------------------------------------------------------
CREATE TABLE placement_activities (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    school_id       INT UNSIGNED        NOT NULL,
    name            VARCHAR(500)        NOT NULL,
    date            DATE                NOT NULL,
    details         TEXT                NOT NULL,
    company_name    VARCHAR(255)            NULL,
    created_by      INT UNSIGNED        NOT NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,
    is_deleted      TINYINT(1)          NOT NULL DEFAULT 0,
    pending_audit_id INT UNSIGNED           NULL,

    PRIMARY KEY (id),
    KEY idx_placement_school (school_id),
    KEY idx_placement_date (date),

    CONSTRAINT fk_placement_school
        FOREIGN KEY (school_id)
        REFERENCES schools (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_placement_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_placement_audit
        FOREIGN KEY (pending_audit_id)
        REFERENCES audit_requests (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================