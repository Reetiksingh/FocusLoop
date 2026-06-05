CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS focus;
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE IF NOT EXISTS auth.user_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  country_code CHAR(2) DEFAULT 'US',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS identity.user_profiles (
  user_id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  country_code CHAR(2) NOT NULL DEFAULT 'US',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS focus.focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  room_id UUID,
  status TEXT NOT NULL,
  planned_seconds INT NOT NULL,
  focused_seconds INT NOT NULL DEFAULT 0,
  idle_seconds INT NOT NULL DEFAULT 0,
  interruption_count INT NOT NULL DEFAULT 0,
  tab_switch_count INT NOT NULL DEFAULT 0,
  focus_quality_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS analytics.daily_focus_metrics (
  user_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  total_seconds INT NOT NULL DEFAULT 0,
  average_session_seconds INT NOT NULL DEFAULT 0,
  session_count INT NOT NULL DEFAULT 0,
  quality_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  streak_day BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, metric_date)
);

CREATE TABLE IF NOT EXISTS analytics.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_started ON focus.focus_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_focus_date ON analytics.daily_focus_metrics(metric_date DESC);
