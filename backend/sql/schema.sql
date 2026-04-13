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
