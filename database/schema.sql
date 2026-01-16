-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,      -- Clerk user ID
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  
  -- Profile
  full_name TEXT,
  current_year TEXT,                       -- "freshman", "sophomore", "junior", "senior"
  current_major TEXT,                      -- "Undecided" or actual major
  school_name TEXT,
  
  -- Context (from onboarding)
  why_here TEXT,                           -- Why using OPEC
  main_struggle TEXT,                      -- Primary confusion/struggle
  
  -- State
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP
);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  title TEXT,                              -- Auto-generated from first message
  message_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  role TEXT NOT NULL,                      -- "user" or "assistant"
  content TEXT NOT NULL,
  
  -- Analysis (for user messages)
  signals JSONB,                           -- Detected signals
  patterns TEXT[],                         -- Pattern IDs detected
  
  tokens_used INTEGER
);
