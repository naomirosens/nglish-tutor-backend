-- ============================================
-- 🗄️ English AI Tutor - Database Schema
-- ============================================

-- טבלת משתמשים (תלמידות + מורות)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת קישור בין תלמידה למורה
CREATE TABLE teacher_students (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teacher_id, student_id)
);

-- טבלת שיחות
CREATE TABLE calls (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  call_sid VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  topic VARCHAR(50) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  status VARCHAR(20) NOT NULL,
  transcript TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת ניתוח שיחות (AI feedback)
CREATE TABLE call_analysis (
  id SERIAL PRIMARY KEY,
  call_id INTEGER REFERENCES calls(id) ON DELETE CASCADE,
  grammar_score INTEGER CHECK (grammar_score BETWEEN 0 AND 100),
  vocabulary_score INTEGER CHECK (vocabulary_score BETWEEN 0 AND 100),
  fluency_score INTEGER CHECK (fluency_score BETWEEN 0 AND 100),
  common_mistakes JSONB,
  suggestions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת מנויים ותשלומים
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- אינדקסים לביצועים
CREATE INDEX idx_calls_student_id ON calls(student_id);
CREATE INDEX idx_calls_start_time ON calls(start_time);
CREATE INDEX idx_teacher_students_teacher ON teacher_students(teacher_id);
CREATE INDEX idx_teacher_students_student ON teacher_students(student_id);
