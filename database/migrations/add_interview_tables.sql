-- ============================================
-- INTERVIEW SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  session_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'completed', -- completed, failed, in_progress
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_clerk ON interview_sessions(clerk_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_date ON interview_sessions(session_date DESC);

-- ============================================
-- INTERVIEW REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS interview_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  
  -- AI Analysis Scores
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
  technical_score INTEGER CHECK (technical_score >= 0 AND technical_score <= 100),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Detailed Feedback
  strengths TEXT[], -- Array of strength points
  weaknesses TEXT[], -- Array of improvement areas
  key_insights TEXT, -- Overall insights
  recommendations TEXT, -- Next steps
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_reports_session ON interview_reports(session_id);
