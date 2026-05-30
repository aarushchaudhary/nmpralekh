-- PostgreSQL Schema for NMP Pralekh - MIS Application
-- Database version: PostgreSQL 18.4+
-- This schema defines the complete database structure for the Management Information System

-- ============================================================================
-- SETUP
-- ============================================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

-- ============================================================================
-- CORE ORGANIZATIONAL TABLES
-- ============================================================================

-- Campuses - Represent different campus locations within the organization
CREATE TABLE IF NOT EXISTS public.campuses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campuses_code ON public.campuses(code);
CREATE INDEX IF NOT EXISTS idx_campuses_name ON public.campuses(name);
CREATE INDEX IF NOT EXISTS idx_campuses_is_active ON public.campuses(is_active);

-- Schools - Represent schools/departments within campuses
CREATE TABLE IF NOT EXISTS public.schools (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    campus_id BIGINT REFERENCES public.campuses(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schools_code ON public.schools(code);
CREATE INDEX IF NOT EXISTS idx_schools_name ON public.schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_campus_id ON public.schools(campus_id);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON public.schools(is_active);

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Users - System users with various roles
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_staff BOOLEAN NOT NULL DEFAULT false,
    is_superuser BOOLEAN NOT NULL DEFAULT false,
    is_service_admin BOOLEAN NOT NULL DEFAULT false,
    is_chronicle_master BOOLEAN NOT NULL DEFAULT false,
    campus_id BIGINT REFERENCES public.campuses(id) ON DELETE SET_NULL,
    created_by_id BIGINT REFERENCES public.users(id) ON DELETE SET_NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_campus_id ON public.users(campus_id);
CREATE INDEX IF NOT EXISTS idx_users_created_by_id ON public.users(created_by_id);

-- User to School Mapping - Links users to schools they manage
CREATE TABLE IF NOT EXISTS public.user_school_mapping (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    UNIQUE(user_id, school_id)
);

CREATE INDEX IF NOT EXISTS idx_user_school_mapping_user_id ON public.user_school_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_user_school_mapping_school_id ON public.user_school_mapping(school_id);
CREATE INDEX IF NOT EXISTS idx_user_school_mapping_assigned_by_id ON public.user_school_mapping(assigned_by_id);

-- ============================================================================
-- AUDIT AND TRACKING TABLES
-- ============================================================================

-- Audit Requests - Track data change requests for auditing
CREATE TABLE IF NOT EXISTS public.audit_requests (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL CHECK (record_id >= 0),
    action VARCHAR(10) NOT NULL,
    old_data JSONB NOT NULL,
    new_data JSONB,
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    requested_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    reviewed_by_id BIGINT REFERENCES public.users(id) ON DELETE SET_NULL,
    school_id BIGINT REFERENCES public.schools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_requests_table_record ON public.audit_requests(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_requests_status ON public.audit_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_requests_requested_at ON public.audit_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_audit_requests_requested_by_id ON public.audit_requests(requested_by_id);
CREATE INDEX IF NOT EXISTS idx_audit_requests_reviewed_by_id ON public.audit_requests(reviewed_by_id);
CREATE INDEX IF NOT EXISTS idx_audit_requests_status_school ON public.audit_requests(status, school_id);

-- ============================================================================
-- ACADEMIC RECORDS - FACULTY PUBLICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.faculty_publications (
    id BIGSERIAL PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    author_type VARCHAR(10) NOT NULL,
    title_of_paper VARCHAR(1000) NOT NULL,
    journal_or_conference_name VARCHAR(500) NOT NULL,
    date DATE NOT NULL,
    venue VARCHAR(500),
    publication VARCHAR(255),
    doi_or_link VARCHAR(500) NOT NULL,
    is_own_work BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    created_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    pending_audit_id BIGINT REFERENCES public.audit_requests(id) ON DELETE SET_NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faculty_publications_author_type ON public.faculty_publications(author_type);
CREATE INDEX IF NOT EXISTS idx_faculty_publications_date ON public.faculty_publications(date);
CREATE INDEX IF NOT EXISTS idx_faculty_publications_school_deleted ON public.faculty_publications(school_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_faculty_publications_school_deleted_date ON public.faculty_publications(school_id, is_deleted, date);
CREATE INDEX IF NOT EXISTS idx_faculty_publications_created_by_id ON public.faculty_publications(created_by_id);
CREATE INDEX IF NOT EXISTS idx_faculty_publications_pending_audit_id ON public.faculty_publications(pending_audit_id);

-- Publication Authors - Track individual authors for publications
CREATE TABLE IF NOT EXISTS public.publication_authors (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL REFERENCES public.faculty_publications(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET_NULL,
    name VARCHAR(255) NOT NULL,
    author_type VARCHAR(10) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    "order" SMALLINT NOT NULL CHECK ("order" >= 0)
);

CREATE INDEX IF NOT EXISTS idx_publication_authors_publication_id ON public.publication_authors(publication_id);
CREATE INDEX IF NOT EXISTS idx_publication_authors_user_id ON public.publication_authors(user_id);

-- ============================================================================
-- ACADEMIC RECORDS - PATENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patents (
    id BIGSERIAL PRIMARY KEY,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_type VARCHAR(10) NOT NULL,
    title_of_patent VARCHAR(1000) NOT NULL,
    details TEXT,
    date_of_publication DATE NOT NULL,
    journal_number VARCHAR(100) NOT NULL,
    patent_status VARCHAR(20) NOT NULL CHECK (patent_status IN ('filed', 'published', 'granted')),
    doi_or_link VARCHAR(500) NOT NULL,
    is_own_work BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    created_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    pending_audit_id BIGINT REFERENCES public.audit_requests(id) ON DELETE SET_NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patents_patent_status ON public.patents(patent_status);
CREATE INDEX IF NOT EXISTS idx_patents_date_of_publication ON public.patents(date_of_publication);
CREATE INDEX IF NOT EXISTS idx_patents_school_deleted ON public.patents(school_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_patents_school_deleted_date ON public.patents(school_id, is_deleted, date_of_publication);
CREATE INDEX IF NOT EXISTS idx_patents_created_by_id ON public.patents(created_by_id);
CREATE INDEX IF NOT EXISTS idx_patents_pending_audit_id ON public.patents(pending_audit_id);

-- Patent Applicants - Track individual applicants for patents
CREATE TABLE IF NOT EXISTS public.patent_applicants (
    id BIGSERIAL PRIMARY KEY,
    patent_id BIGINT NOT NULL REFERENCES public.patents(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET_NULL,
    name VARCHAR(255) NOT NULL,
    applicant_type VARCHAR(10) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_patent_applicants_patent_id ON public.patent_applicants(patent_id);
CREATE INDEX IF NOT EXISTS idx_patent_applicants_user_id ON public.patent_applicants(user_id);

-- ============================================================================
-- ACADEMIC RECORDS - CERTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.certifications (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    title_of_course VARCHAR(500) NOT NULL,
    details TEXT,
    agency VARCHAR(255) NOT NULL,
    credly_or_proof_link VARCHAR(500) NOT NULL,
    person_type VARCHAR(10) NOT NULL CHECK (person_type IN ('faculty', 'student')),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    created_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    pending_audit_id BIGINT REFERENCES public.audit_requests(id) ON DELETE SET_NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certifications_agency ON public.certifications(agency);
CREATE INDEX IF NOT EXISTS idx_certifications_date ON public.certifications(date);
CREATE INDEX IF NOT EXISTS idx_certifications_school_deleted ON public.certifications(school_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_certifications_school_deleted_date ON public.certifications(school_id, is_deleted, date);
CREATE INDEX IF NOT EXISTS idx_certifications_created_by_id ON public.certifications(created_by_id);
CREATE INDEX IF NOT EXISTS idx_certifications_pending_audit_id ON public.certifications(pending_audit_id);

-- ============================================================================
-- ACADEMIC RECORDS - FACULTY FDP & WORKSHOPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.faculty_fdp_workshop_gl (
    id BIGSERIAL PRIMARY KEY,
    faculty_name VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    details TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('FDP', 'Workshop', 'Guest_Lecture')),
    organizing_body VARCHAR(255),
    date_start DATE NOT NULL,
    date_end DATE,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    created_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    pending_audit_id BIGINT REFERENCES public.audit_requests(id) ON DELETE SET_NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faculty_fdp_type ON public.faculty_fdp_workshop_gl(type);
CREATE INDEX IF NOT EXISTS idx_faculty_fdp_date_start ON public.faculty_fdp_workshop_gl(date_start);
CREATE INDEX IF NOT EXISTS idx_faculty_fdp_school_deleted ON public.faculty_fdp_workshop_gl(school_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_faculty_fdp_school_deleted_date ON public.faculty_fdp_workshop_gl(school_id, is_deleted, date_start);
CREATE INDEX IF NOT EXISTS idx_faculty_fdp_created_by_id ON public.faculty_fdp_workshop_gl(created_by_id);
CREATE INDEX IF NOT EXISTS idx_faculty_fdp_pending_audit_id ON public.faculty_fdp_workshop_gl(pending_audit_id);

-- ============================================================================
-- STUDENT RECORDS - CLUBS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clubs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('club', 'committee', 'placecom')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    created_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, school_id, type)
);

CREATE INDEX IF NOT EXISTS idx_clubs_school_type_active ON public.clubs(school_id, type, is_active);
CREATE INDEX IF NOT EXISTS idx_clubs_school_id ON public.clubs(school_id);
CREATE INDEX IF NOT EXISTS idx_clubs_created_by_id ON public.clubs(created_by_id);

-- ============================================================================
-- ACTIVITIES - SCHOOL ACTIVITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_activities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    date DATE NOT NULL,
    details TEXT NOT NULL,
    is_school_wide BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    created_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    pending_audit_id BIGINT REFERENCES public.audit_requests(id) ON DELETE SET_NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_school_activities_date ON public.school_activities(date);
CREATE INDEX IF NOT EXISTS idx_school_activities_school_deleted ON public.school_activities(school_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_school_activities_school_deleted_date ON public.school_activities(school_id, is_deleted, date);
CREATE INDEX IF NOT EXISTS idx_school_activities_created_by_id ON public.school_activities(created_by_id);
CREATE INDEX IF NOT EXISTS idx_school_activities_pending_audit_id ON public.school_activities(pending_audit_id);

-- School Activity Collaborations - Track collaborating schools
CREATE TABLE IF NOT EXISTS public.school_activity_collaborations (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES public.school_activities(id) ON DELETE CASCADE,
    collaborating_school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    notes VARCHAR(255),
    UNIQUE(activity_id, collaborating_school_id)
);

CREATE INDEX IF NOT EXISTS idx_school_activity_collab_activity_id ON public.school_activity_collaborations(activity_id);
CREATE INDEX IF NOT EXISTS idx_school_activity_collab_school_id ON public.school_activity_collaborations(collaborating_school_id);

-- ============================================================================
-- ACTIVITIES - STUDENT ACTIVITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_activities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    date DATE NOT NULL,
    details TEXT NOT NULL,
    club_name VARCHAR(255),
    conducted_by VARCHAR(255),
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('club', 'committee', 'other')),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    club_id BIGINT REFERENCES public.clubs(id) ON DELETE SET_NULL,
    school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    created_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    pending_audit_id BIGINT REFERENCES public.audit_requests(id) ON DELETE SET_NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_activities_date ON public.student_activities(date);
CREATE INDEX IF NOT EXISTS idx_student_activities_school_deleted ON public.student_activities(school_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_student_activities_school_deleted_date ON public.student_activities(school_id, is_deleted, date);
CREATE INDEX IF NOT EXISTS idx_student_activities_club_id ON public.student_activities(club_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_created_by_id ON public.student_activities(created_by_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_pending_audit_id ON public.student_activities(pending_audit_id);

-- Student Activity Collaborations - Track collaborating schools/clubs
CREATE TABLE IF NOT EXISTS public.student_activity_collaborations (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES public.student_activities(id) ON DELETE CASCADE,
    collaborating_school_id BIGINT REFERENCES public.schools(id) ON DELETE SET_NULL,
    collaborating_club_or_committee VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_student_activity_collab_activity_id ON public.student_activity_collaborations(activity_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_collab_school_id ON public.student_activity_collaborations(collaborating_school_id);

-- ============================================================================
-- PLACEMENT RECORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.placement_activities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    date DATE NOT NULL,
    details TEXT NOT NULL,
    company_name VARCHAR(255),
    placecom_name VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    created_by_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    pending_audit_id BIGINT REFERENCES public.audit_requests(id) ON DELETE SET_NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_placement_activities_date ON public.placement_activities(date);
CREATE INDEX IF NOT EXISTS idx_placement_activities_school_deleted ON public.placement_activities(school_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_placement_activities_school_deleted_date ON public.placement_activities(school_id, is_deleted, date);
CREATE INDEX IF NOT EXISTS idx_placement_activities_created_by_id ON public.placement_activities(created_by_id);
CREATE INDEX IF NOT EXISTS idx_placement_activities_pending_audit_id ON public.placement_activities(pending_audit_id);

-- ============================================================================
-- DATA MANAGEMENT & EXPORTS
-- ============================================================================

-- MIS Reports - Reports generated by coordinators
CREATE TABLE IF NOT EXISTS public.mis_reports (
    id BIGSERIAL PRIMARY KEY,
    coordinator_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    data_content TEXT NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    sent_to_admin BOOLEAN NOT NULL DEFAULT false,
    sent_to_admin_at TIMESTAMP WITH TIME ZONE,
    sent_to_accumulator BOOLEAN NOT NULL DEFAULT false,
    sent_to_accumulator_at TIMESTAMP WITH TIME ZONE,
    sent_to_chronicle_master BOOLEAN NOT NULL DEFAULT false,
    sent_to_chronicle_master_at TIMESTAMP WITH TIME ZONE,
    sent_to_super_admin BOOLEAN NOT NULL DEFAULT false,
    sent_to_super_admin_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mis_reports_coordinator_id ON public.mis_reports(coordinator_id);

-- MIS Data Requests - Track requests for data from accumulators
CREATE TABLE IF NOT EXISTS public.mis_data_requests (
    id BIGSERIAL PRIMARY KEY,
    coordinator_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    accumulator_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_mis_data_requests_coordinator_id ON public.mis_data_requests(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_mis_data_requests_accumulator_id ON public.mis_data_requests(accumulator_id);

-- Generated Exports - Track exported data files
CREATE TABLE IF NOT EXISTS public.generated_exports (
    id BIGSERIAL PRIMARY KEY,
    export_type VARCHAR(10) NOT NULL CHECK (export_type IN ('nightly', 'manual')),
    filename VARCHAR(500) NOT NULL,
    filepath VARCHAR(1000) NOT NULL,
    file_size_kb INTEGER NOT NULL CHECK (file_size_kb >= 0),
    record_count INTEGER NOT NULL CHECK (record_count >= 0),
    date_range_from DATE,
    date_range_to DATE,
    campus_id BIGINT REFERENCES public.campuses(id) ON DELETE CASCADE,
    generated_by_id BIGINT REFERENCES public.users(id) ON DELETE SET_NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generated_exports_campus_id ON public.generated_exports(campus_id);
CREATE INDEX IF NOT EXISTS idx_generated_exports_generated_by_id ON public.generated_exports(generated_by_id);

-- Backup Configuration - Track backup settings
CREATE TABLE IF NOT EXISTS public.records_backupconfiguration (
    id BIGSERIAL PRIMARY KEY,
    is_active BOOLEAN NOT NULL DEFAULT true,
    schedule_type VARCHAR(10) NOT NULL CHECK (schedule_type IN ('weekly', 'monthly')),
    schedule_day SMALLINT CHECK (schedule_day BETWEEN 0 AND 6),
    backup_scope VARCHAR(15) NOT NULL CHECK (backup_scope IN ('full', 'date_range')),
    date_from DATE,
    date_to DATE,
    last_run TIMESTAMP WITH TIME ZONE,
    updated_by_id BIGINT REFERENCES public.users(id) ON DELETE SET_NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backup_config_updated_by_id ON public.records_backupconfiguration(updated_by_id);

-- ============================================================================
-- ERROR TRACKING & BUG REPORTING
-- ============================================================================

-- Error Tickets - Track system errors
CREATE TABLE IF NOT EXISTS public.service_error_tickets (
    id BIGSERIAL PRIMARY KEY,
    fingerprint VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('frontend_js', 'api_error', 'manual')),
    error_type VARCHAR(255) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    component_stack TEXT,
    url_path VARCHAR(1000) NOT NULL,
    http_status SMALLINT CHECK (http_status >= 0),
    api_endpoint VARCHAR(500),
    occurrence_count INTEGER NOT NULL DEFAULT 1 CHECK (occurrence_count >= 0),
    affected_users_count INTEGER NOT NULL DEFAULT 0 CHECK (affected_users_count >= 0),
    first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(15) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'planning', 'fixing', 'testing', 'closed')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    resolved_by_id BIGINT REFERENCES public.users(id) ON DELETE SET_NULL
);

CREATE INDEX IF NOT EXISTS idx_error_tickets_source ON public.service_error_tickets(source);
CREATE INDEX IF NOT EXISTS idx_error_tickets_status ON public.service_error_tickets(status);
CREATE INDEX IF NOT EXISTS idx_error_tickets_first_seen ON public.service_error_tickets(first_seen);
CREATE INDEX IF NOT EXISTS idx_error_tickets_occurrence_count ON public.service_error_tickets(occurrence_count);
CREATE INDEX IF NOT EXISTS idx_error_tickets_fingerprint ON public.service_error_tickets(fingerprint);
CREATE INDEX IF NOT EXISTS idx_error_tickets_resolved_by_id ON public.service_error_tickets(resolved_by_id);

-- Error Occurrences - Track individual error occurrences
CREATE TABLE IF NOT EXISTS public.service_error_occurrences (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES public.service_error_tickets(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET_NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    url_path VARCHAR(1000) NOT NULL,
    user_agent VARCHAR(500),
    extra JSONB
);

CREATE INDEX IF NOT EXISTS idx_error_occurrences_ticket_id ON public.service_error_occurrences(ticket_id);
CREATE INDEX IF NOT EXISTS idx_error_occurrences_ticket_occurred ON public.service_error_occurrences(ticket_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_error_occurrences_user_id ON public.service_error_occurrences(user_id);

-- Bug Reports - User-reported bugs
CREATE TABLE IF NOT EXISTS public.service_bug_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET_NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    url_path VARCHAR(1000) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(15) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'planning', 'fixing', 'testing', 'closed')),
    screenshot TEXT,
    admin_note TEXT,
    linked_ticket_id BIGINT REFERENCES public.service_error_tickets(id) ON DELETE SET_NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON public.service_bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.service_bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_submitted_at ON public.service_bug_reports(submitted_at);
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.service_bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_linked_ticket_id ON public.service_bug_reports(linked_ticket_id);

-- ============================================================================
-- AUTHENTICATION - DJANGO TABLES
-- ============================================================================

-- Django auth groups
CREATE TABLE IF NOT EXISTS public.auth_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_auth_group_name ON public.auth_group(name);

-- Django auth permissions
CREATE TABLE IF NOT EXISTS public.auth_permission (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content_type_id INTEGER NOT NULL,
    codename VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_permission_content_type_id ON public.auth_permission(content_type_id);

-- Django group permissions junction table
CREATE TABLE IF NOT EXISTS public.auth_group_permissions (
    id BIGSERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES public.auth_group(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES public.auth_permission(id) ON DELETE CASCADE,
    UNIQUE(group_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_auth_group_permissions_group_id ON public.auth_group_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_auth_group_permissions_permission_id ON public.auth_group_permissions(permission_id);

-- User groups junction table
CREATE TABLE IF NOT EXISTS public.users_groups (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES public.auth_group(id) ON DELETE CASCADE,
    UNIQUE(user_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_users_groups_user_id ON public.users_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_users_groups_group_id ON public.users_groups(group_id);

-- User permissions junction table
CREATE TABLE IF NOT EXISTS public.users_user_permissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES public.auth_permission(id) ON DELETE CASCADE,
    UNIQUE(user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_users_user_permissions_user_id ON public.users_user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_user_permissions_permission_id ON public.users_user_permissions(permission_id);

-- ============================================================================
-- TOKEN MANAGEMENT - DJANGO REST FRAMEWORK
-- ============================================================================

-- Outstanding tokens for JWT
CREATE TABLE IF NOT EXISTS public.token_blacklist_outstandingtoken (
    id BIGSERIAL PRIMARY KEY,
    jti VARCHAR(255) NOT NULL UNIQUE,
    token TEXT NOT NULL,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_token_outstanding_jti ON public.token_blacklist_outstandingtoken(jti);
CREATE INDEX IF NOT EXISTS idx_token_outstanding_user_id ON public.token_blacklist_outstandingtoken(user_id);

-- Blacklisted tokens
CREATE TABLE IF NOT EXISTS public.token_blacklist_blacklistedtoken (
    id BIGSERIAL PRIMARY KEY,
    token_id BIGINT NOT NULL UNIQUE REFERENCES public.token_blacklist_outstandingtoken(id) ON DELETE CASCADE,
    blacklisted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DJANGO FRAMEWORK TABLES
-- ============================================================================

-- Django content types
CREATE TABLE IF NOT EXISTS public.django_content_type (
    id SERIAL PRIMARY KEY,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    UNIQUE(app_label, model)
);

-- Django migrations tracking
CREATE TABLE IF NOT EXISTS public.django_migrations (
    id BIGSERIAL PRIMARY KEY,
    app VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Django admin log
CREATE TABLE IF NOT EXISTS public.django_admin_log (
    id SERIAL PRIMARY KEY,
    action_time TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_type_id INTEGER REFERENCES public.django_content_type(id) ON DELETE CASCADE,
    object_id TEXT,
    object_repr VARCHAR(200) NOT NULL,
    action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
    change_message TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_log_user_id ON public.django_admin_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_content_type_id ON public.django_admin_log(content_type_id);

-- Django sessions
CREATE TABLE IF NOT EXISTS public.django_session (
    session_key VARCHAR(40) PRIMARY KEY,
    session_data TEXT NOT NULL,
    expire_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire_date ON public.django_session(expire_date);

-- ============================================================================
-- CELERY BEAT SCHEDULING TABLES
-- ============================================================================

-- Crontab schedules
CREATE TABLE IF NOT EXISTS public.django_celery_beat_crontabschedule (
    id SERIAL PRIMARY KEY,
    minute VARCHAR(240) NOT NULL,
    hour VARCHAR(96) NOT NULL,
    day_of_week VARCHAR(64) NOT NULL,
    day_of_month VARCHAR(124) NOT NULL,
    month_of_year VARCHAR(64) NOT NULL,
    timezone VARCHAR(63) NOT NULL
);

-- Interval schedules
CREATE TABLE IF NOT EXISTS public.django_celery_beat_intervalschedule (
    id SERIAL PRIMARY KEY,
    every INTEGER NOT NULL,
    period VARCHAR(24) NOT NULL
);

-- Solar schedules
CREATE TABLE IF NOT EXISTS public.django_celery_beat_solarschedule (
    id SERIAL PRIMARY KEY,
    event VARCHAR(24) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    UNIQUE(event, latitude, longitude)
);

-- Clocked schedules
CREATE TABLE IF NOT EXISTS public.django_celery_beat_clockedschedule (
    id SERIAL PRIMARY KEY,
    clocked_time TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Periodic tasks
CREATE TABLE IF NOT EXISTS public.django_celery_beat_periodictask (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    task VARCHAR(200) NOT NULL,
    crontab_id INTEGER REFERENCES public.django_celery_beat_crontabschedule(id) ON DELETE CASCADE,
    interval_id INTEGER REFERENCES public.django_celery_beat_intervalschedule(id) ON DELETE CASCADE,
    solar_id INTEGER REFERENCES public.django_celery_beat_solarschedule(id) ON DELETE CASCADE,
    clocked_id INTEGER REFERENCES public.django_celery_beat_clockedschedule(id) ON DELETE CASCADE,
    args TEXT NOT NULL,
    kwargs TEXT NOT NULL,
    queue VARCHAR(200),
    exchange VARCHAR(200),
    routing_key VARCHAR(200),
    priority INTEGER CHECK (priority >= 0),
    expires TIMESTAMP WITH TIME ZONE,
    expire_seconds INTEGER CHECK (expire_seconds >= 0),
    enabled BOOLEAN NOT NULL DEFAULT true,
    one_off BOOLEAN NOT NULL DEFAULT false,
    start_time TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    total_run_count INTEGER NOT NULL DEFAULT 0 CHECK (total_run_count >= 0),
    date_changed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    headers TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_celery_task_name ON public.django_celery_beat_periodictask(name);
CREATE INDEX IF NOT EXISTS idx_celery_task_crontab_id ON public.django_celery_beat_periodictask(crontab_id);
CREATE INDEX IF NOT EXISTS idx_celery_task_interval_id ON public.django_celery_beat_periodictask(interval_id);
CREATE INDEX IF NOT EXISTS idx_celery_task_solar_id ON public.django_celery_beat_periodictask(solar_id);
CREATE INDEX IF NOT EXISTS idx_celery_task_clocked_id ON public.django_celery_beat_periodictask(clocked_id);

-- Periodic task metadata
CREATE TABLE IF NOT EXISTS public.django_celery_beat_periodictasks (
    ident SMALLINT PRIMARY KEY,
    last_update TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================================================================
-- PERMISSIONS AND ACCESS CONTROL
-- ============================================================================

-- Grant all schema permissions to the application user
GRANT ALL PRIVILEGES ON SCHEMA public TO mis_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mis_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mis_user;

-- ============================================================================
-- SCHEMA FINALIZATION
-- ============================================================================

-- End of schema dump
