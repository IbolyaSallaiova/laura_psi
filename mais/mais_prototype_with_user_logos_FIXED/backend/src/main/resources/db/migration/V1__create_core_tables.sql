CREATE TABLE IF NOT EXISTS teachers (
    id BIGSERIAL PRIMARY KEY,
    ais_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    ais_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    teacher_id BIGINT,
    max_zapocet INTEGER,
    max_zadanie1 INTEGER,
    max_skuska INTEGER,
    CONSTRAINT fk_subject_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS course_groups (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    room VARCHAR(255),
    semester VARCHAR(50),
    subject_id BIGINT NOT NULL,
    CONSTRAINT fk_course_group_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    course_group_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    zapocet_points INTEGER,
    zadanie1_points INTEGER,
    skuska_points INTEGER,
    final_override VARCHAR(4),
    CONSTRAINT fk_enrollment_group FOREIGN KEY (course_group_id) REFERENCES course_groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    CONSTRAINT uk_enrollment_group_student UNIQUE (course_group_id, student_id)
);

CREATE TABLE IF NOT EXISTS user_accounts (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rola VARCHAR(50),
    student_id BIGINT,
    teacher_id BIGINT,
    full_name VARCHAR(255),
    study_program VARCHAR(255),
    semester INTEGER,
    CONSTRAINT fk_user_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE SET NULL,
    CONSTRAINT fk_user_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_subject_teacher ON subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_group_subject ON course_groups(subject_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_group ON enrollments(course_group_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_student ON enrollments(student_id);
