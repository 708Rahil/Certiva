-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query)

CREATE TABLE IF NOT EXISTS certifications (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  industry TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  description TEXT NOT NULL,
  skills TEXT NOT NULL,
  primary_skills TEXT,
  secondary_skills TEXT,
  prerequisites TEXT,
  target_job_titles TEXT,
  job_postings_count INTEGER,
  next_certs TEXT,
  cost TEXT,
  duration_weeks INTEGER,
  study_hours INTEGER,
  exam_format TEXT,
  pass_rate_percent INTEGER,
  salary_boost_low INTEGER,
  salary_boost_high INTEGER,
  worth_it_rating REAL,
  trending BOOLEAN DEFAULT FALSE,
  last_verified TEXT,
  data_confidence TEXT,
  official_url TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  extracted_skills TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  cert_id INTEGER NOT NULL REFERENCES certifications(id),
  score REAL NOT NULL,
  skill_overlap REAL NOT NULL,
  industry_match BOOLEAN NOT NULL,
  difficulty_fit REAL NOT NULL,
  matched_skills TEXT NOT NULL,
  explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_certifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  cert_id INTEGER NOT NULL REFERENCES certifications(id),
  status TEXT NOT NULL DEFAULT 'interested',
  started_date DATE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, cert_id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_job_id ON recommendations(job_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
