-- =====================================================================
-- ClassHub - Smart Classroom Management System
-- MySQL Database Schema
-- =====================================================================

DROP DATABASE IF EXISTS classhub_db;
CREATE DATABASE classhub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE classhub_db;

-- =====================================================================
-- 1. ADMIN TABLE
-- =====================================================================
CREATE TABLE admin (
    admin_id        INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 2. STUDENTS TABLE
-- =====================================================================
CREATE TABLE students (
    student_id      INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    roll_number     VARCHAR(30) NOT NULL UNIQUE,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    branch          VARCHAR(50) DEFAULT 'CSE',
    semester        INT DEFAULT 1,
    profile_image   VARCHAR(255) DEFAULT NULL,
    status          ENUM('active','inactive') DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_roll_number (roll_number)
) ENGINE=InnoDB;

-- =====================================================================
-- 3. CR (Class Representative) TABLE
-- =====================================================================
CREATE TABLE cr (
    cr_id           INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    roll_number     VARCHAR(30) NOT NULL UNIQUE,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    branch          VARCHAR(50) DEFAULT 'CSE',
    semester        INT DEFAULT 1,
    class_strength  INT DEFAULT 60,
    profile_image   VARCHAR(255) DEFAULT NULL,
    status          ENUM('active','inactive') DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 4. ATTENDANCE TABLE (daily, twice a day, taken by CR)
-- =====================================================================
CREATE TABLE attendance (
    attendance_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    cr_id           INT NOT NULL,
    attendance_date DATE NOT NULL,
    session         ENUM('10AM','2PM') NOT NULL,
    status          ENUM('Present','Absent') NOT NULL DEFAULT 'Absent',
    marked_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (cr_id) REFERENCES cr(cr_id) ON DELETE CASCADE,
    UNIQUE KEY uniq_attendance (student_id, attendance_date, session),
    INDEX idx_date_session (attendance_date, session)
) ENGINE=InnoDB;

-- =====================================================================
-- 5. ATTENDANCE PERCENTAGE TABLE (uploaded ONLY by Admin)
-- =====================================================================
CREATE TABLE attendance_percentage (
    percentage_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL UNIQUE,
    total_classes   INT NOT NULL DEFAULT 0,
    attended_classes INT NOT NULL DEFAULT 0,
    percentage      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    updated_by      INT NOT NULL,          -- admin_id
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 6. SCHEDULE TABLE (Today's / weekly class schedule)
-- =====================================================================
CREATE TABLE schedule (
    schedule_id     INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week     ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
    subject         VARCHAR(100) NOT NULL,
    faculty         VARCHAR(100) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    room_number     VARCHAR(20) NOT NULL,
    created_by      INT,                   -- cr_id or admin_id
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_day (day_of_week)
) ENGINE=InnoDB;

-- =====================================================================
-- 7. NOTES TABLE (PDF/Image uploaded by CR)
-- =====================================================================
CREATE TABLE notes (
    note_id         INT AUTO_INCREMENT PRIMARY KEY,
    subject         VARCHAR(100) NOT NULL,
    title           VARCHAR(150) NOT NULL,
    file_path       VARCHAR(255) NOT NULL,
    file_type       ENUM('pdf','image') NOT NULL,
    uploaded_by     INT NOT NULL,          -- cr_id
    uploaded_by_name VARCHAR(100) NOT NULL,
    upload_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES cr(cr_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 8. ASSIGNMENTS TABLE
-- =====================================================================
CREATE TABLE assignments (
    assignment_id     INT AUTO_INCREMENT PRIMARY KEY,
    subject           VARCHAR(100) NOT NULL,
    title             VARCHAR(150) NOT NULL,
    description       TEXT,
    date_assigned     DATE NOT NULL,
    last_submission   DATE NOT NULL,
    attachment_path   VARCHAR(255),
    uploaded_by       INT NOT NULL,        -- cr_id
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES cr(cr_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 9. PROJECTS TABLE
-- =====================================================================
CREATE TABLE projects (
    project_id        INT AUTO_INCREMENT PRIMARY KEY,
    title             VARCHAR(150) NOT NULL,
    subject           VARCHAR(100) NOT NULL,
    description       TEXT,
    assigned_date     DATE NOT NULL,
    submission_deadline DATE NOT NULL,
    attachment_path   VARCHAR(255),
    uploaded_by       INT NOT NULL,        -- cr_id
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES cr(cr_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 10. SEMESTER RANKING TABLE (editable only by Admin)
-- =====================================================================
CREATE TABLE semester_ranking (
    ranking_id      INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    semester        INT NOT NULL,
    rank_no         INT NOT NULL,
    sgpa            DECIMAL(4,2) NOT NULL,
    cgpa            DECIMAL(4,2) NOT NULL,
    updated_by      INT NOT NULL,          -- admin_id
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE KEY uniq_student_sem (student_id, semester)
) ENGINE=InnoDB;

-- =====================================================================
-- 11. NOTICES TABLE
-- =====================================================================
CREATE TABLE notices (
    notice_id       INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    description     TEXT NOT NULL,
    posted_by_role  ENUM('admin','cr') NOT NULL,
    posted_by_id    INT NOT NULL,
    posted_by_name  VARCHAR(100) NOT NULL,
    posted_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_important    TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

-- =====================================================================
-- 12. FEEDBACK TABLE (students submit, only Admin views)
-- =====================================================================
CREATE TABLE feedback (
    feedback_id     INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    subject         VARCHAR(150) NOT NULL,
    message         TEXT NOT NULL,
    status          ENUM('unread','read') DEFAULT 'unread',
    submitted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 13. CONTACT TABLE (managed by Admin)
-- =====================================================================
CREATE TABLE contact (
    contact_id      INT AUTO_INCREMENT PRIMARY KEY,
    admin_name      VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    college_name    VARCHAR(150) NOT NULL,
    address         VARCHAR(255),
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- SAMPLE / SEED DATA
-- =====================================================================

-- Admin (password: Admin@12345 -> hashed at runtime by seed.js, placeholder here)
INSERT INTO admin (name, email, password, phone, role) VALUES
('System Administrator', 'admin@classhub.edu', '$2a$10$replaceWithBcryptHashAtSeedTime', '9999999999', 'admin');

-- Contact info
INSERT INTO contact (admin_name, email, phone, college_name, address) VALUES
('Dr. R. Sharma', 'admin@classhub.edu', '9999999999', 'ClassHub Institute of Technology', '123 College Road, Knowledge City, India');

-- CR account
INSERT INTO cr (name, roll_number, email, phone, password, branch, semester, class_strength) VALUES
('Aditya Verma', 'CSE21CR01', 'aditya.cr@classhub.edu', '9876543210', '$2a$10$replaceWithBcryptHashAtSeedTime', 'CSE', 5, 60);

-- Sample students
INSERT INTO students (name, roll_number, email, phone, password, branch, semester) VALUES
('Priya Sharma', 'CSE21001', 'priya.sharma@classhub.edu', '9876500001', '$2a$10$replaceWithBcryptHashAtSeedTime', 'CSE', 5),
('Rahul Kumar', 'CSE21002', 'rahul.kumar@classhub.edu', '9876500002', '$2a$10$replaceWithBcryptHashAtSeedTime', 'CSE', 5),
('Sneha Reddy', 'CSE21003', 'sneha.reddy@classhub.edu', '9876500003', '$2a$10$replaceWithBcryptHashAtSeedTime', 'CSE', 5),
('Karan Mehta', 'CSE21004', 'karan.mehta@classhub.edu', '9876500004', '$2a$10$replaceWithBcryptHashAtSeedTime', 'CSE', 5),
('Ananya Iyer', 'CSE21005', 'ananya.iyer@classhub.edu', '9876500005', '$2a$10$replaceWithBcryptHashAtSeedTime', 'CSE', 5);

-- Attendance percentage (Admin uploaded)
INSERT INTO attendance_percentage (student_id, total_classes, attended_classes, percentage, updated_by) VALUES
(1, 120, 110, 91.67, 1),
(2, 120, 96, 80.00, 1),
(3, 120, 102, 85.00, 1),
(4, 120, 78, 65.00, 1),
(5, 120, 115, 95.83, 1);

-- Weekly schedule
INSERT INTO schedule (day_of_week, subject, faculty, start_time, end_time, room_number, created_by) VALUES
('Monday', 'Data Structures', 'Dr. A. Nair', '09:00:00', '10:00:00', 'R-101', 1),
('Monday', 'Database Systems', 'Prof. K. Rao', '10:15:00', '11:15:00', 'R-102', 1),
('Monday', 'Operating Systems', 'Dr. S. Gupta', '11:30:00', '12:30:00', 'R-101', 1),
('Tuesday', 'Computer Networks', 'Prof. M. Das', '09:00:00', '10:00:00', 'R-103', 1),
('Tuesday', 'Data Structures Lab', 'Dr. A. Nair', '10:15:00', '12:15:00', 'Lab-1', 1),
('Wednesday', 'Software Engineering', 'Dr. P. Joshi', '09:00:00', '10:00:00', 'R-101', 1),
('Wednesday', 'Database Systems', 'Prof. K. Rao', '10:15:00', '11:15:00', 'R-102', 1),
('Thursday', 'Operating Systems Lab', 'Dr. S. Gupta', '09:00:00', '11:00:00', 'Lab-2', 1),
('Friday', 'Computer Networks', 'Prof. M. Das', '09:00:00', '10:00:00', 'R-103', 1),
('Friday', 'Software Engineering', 'Dr. P. Joshi', '10:15:00', '11:15:00', 'R-101', 1),
('Saturday', 'Mentoring Session', 'Class Advisor', '09:00:00', '10:00:00', 'R-101', 1);

-- Semester ranking (Admin uploaded)
INSERT INTO semester_ranking (student_id, semester, rank_no, sgpa, cgpa, updated_by) VALUES
(1, 5, 1, 9.45, 9.20, 1),
(5, 5, 2, 9.30, 9.10, 1),
(3, 5, 3, 8.95, 8.80, 1),
(2, 5, 4, 8.40, 8.25, 1),
(4, 5, 5, 7.60, 7.75, 1);

-- Notices
INSERT INTO notices (title, description, posted_by_role, posted_by_id, posted_by_name, is_important) VALUES
('Mid-Semester Exams Schedule Released', 'The mid-semester examination timetable has been published. Please check the notice board outside the exam cell.', 'admin', 1, 'System Administrator', 1),
('Guest Lecture on AI & Machine Learning', 'A guest lecture on AI/ML applications will be held on Friday in the main auditorium. Attendance is mandatory for CSE students.', 'cr', 1, 'Aditya Verma', 0),
('Submission of Database Assignment Extended', 'The deadline for the Database Systems assignment has been extended by 3 days due to popular request.', 'cr', 1, 'Aditya Verma', 0);

-- Sample assignment
INSERT INTO assignments (subject, title, description, date_assigned, last_submission, uploaded_by) VALUES
('Database Systems', 'ER Diagram & Normalization', 'Design an ER diagram for a library management system and normalize it up to 3NF.', '2026-07-20', '2026-08-05', 1),
('Operating Systems', 'CPU Scheduling Algorithms', 'Implement and compare FCFS, SJF, and Round Robin scheduling algorithms with sample input.', '2026-07-22', '2026-08-08', 1);

-- Sample project
INSERT INTO projects (title, subject, description, assigned_date, submission_deadline, uploaded_by) VALUES
('Library Management System', 'Software Engineering', 'Build a full-stack library management system covering book issue, return, and fine calculation modules.', '2026-07-01', '2026-09-15', 1);
