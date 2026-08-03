-- TEQUITL Database Schema
-- Neo-Brutalist Productivity Suite

CREATE TABLE IF NOT EXISTS trackers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracker_activities (
  id TEXT PRIMARY KEY,
  tracker_id TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tracker_logs (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  week_key TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (activity_id) REFERENCES tracker_activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id TEXT PRIMARY KEY,
  duration_minutes INTEGER NOT NULL,
  mode TEXT NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tag TEXT DEFAULT 'General',
  pinned INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kanban_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT CHECK(status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  priority TEXT DEFAULT 'Media',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  day INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  tag TEXT DEFAULT 'Nota'
);
