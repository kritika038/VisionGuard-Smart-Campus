CREATE DATABASE IF NOT EXISTS visionguard_ai;
USE visionguard_ai;

CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  department VARCHAR(120),
  email VARCHAR(190) NOT NULL UNIQUE,
  mobile VARCHAR(20),
  qualification VARCHAR(120),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) DEFAULT '',
  enrollment_no VARCHAR(50) NOT NULL UNIQUE,
  roll_no VARCHAR(50),
  email VARCHAR(190) NOT NULL UNIQUE,
  mobile VARCHAR(20),
  department VARCHAR(120),
  course VARCHAR(120),
  semester VARCHAR(20),
  section VARCHAR(20),
  scholar_type VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  photo_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(150) NOT NULL,
  subject_code VARCHAR(50) NOT NULL UNIQUE,
  semester VARCHAR(20),
  department VARCHAR(120),
  teacher_name VARCHAR(120),
  credits VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timetable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_name VARCHAR(20) NOT NULL,
  start_time VARCHAR(20) NOT NULL,
  end_time VARCHAR(20) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  teacher_name VARCHAR(120) NOT NULL,
  room_no VARCHAR(50),
  semester VARCHAR(20),
  section VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  status VARCHAR(20) NOT NULL,
  date_marked DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance_once (student_id, subject_name, date_marked)
);

CREATE TABLE IF NOT EXISTS qr_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  teacher_id INT NOT NULL,
  teacher_name VARCHAR(120) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
);

INSERT INTO teachers (
  name,
  employee_id,
  department,
  email,
  mobile,
  qualification,
  password
)
VALUES (
  'Teacher Demo',
  'TCH-001',
  'Computer Science',
  'teacher@visionguard.com',
  '9876543210',
  'M.Tech',
  '123456'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  department = VALUES(department),
  mobile = VALUES(mobile),
  qualification = VALUES(qualification),
  password = VALUES(password);

INSERT INTO students (
  first_name,
  last_name,
  enrollment_no,
  roll_no,
  email,
  mobile,
  department,
  course,
  semester,
  section,
  scholar_type,
  password
)
VALUES (
  'Kritika',
  'Bansal',
  'ENR-001',
  '01',
  'kritikabansal3@gmail.com',
  '9876543210',
  'Computer Science',
  'B.Tech',
  '6',
  'A',
  'Day Scholar',
  '123456'
)
ON DUPLICATE KEY UPDATE
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  mobile = VALUES(mobile),
  department = VALUES(department),
  course = VALUES(course),
  semester = VALUES(semester),
  section = VALUES(section),
  scholar_type = VALUES(scholar_type),
  password = VALUES(password);

INSERT INTO subjects (
  subject_name,
  subject_code,
  semester,
  department,
  teacher_name,
  credits
)
VALUES (
  'AI Fundamentals',
  'CSE101',
  '6',
  'Computer Science',
  'Teacher Demo',
  '4'
)
ON DUPLICATE KEY UPDATE
  semester = VALUES(semester),
  department = VALUES(department),
  teacher_name = VALUES(teacher_name),
  credits = VALUES(credits);

INSERT INTO timetable (
  day_name,
  start_time,
  end_time,
  subject_name,
  teacher_name,
  room_no,
  semester,
  section
)
SELECT
  'Monday',
  '10:00',
  '11:00',
  'AI Fundamentals',
  'Teacher Demo',
  'Lab-1',
  '6',
  'A'
WHERE NOT EXISTS (
  SELECT 1
  FROM timetable
  WHERE day_name = 'Monday'
    AND start_time = '10:00'
    AND subject_name = 'AI Fundamentals'
    AND teacher_name = 'Teacher Demo'
    AND section = 'A'
);
