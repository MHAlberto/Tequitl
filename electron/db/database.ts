import path from 'path'
import fs from 'fs'
import { app } from 'electron'

const DB_FILENAME = 'tequitl.db'

let db: any = null
let SQL: any = null

function getWasmPath(): string {
  // In production, WASM is unpacked from asar at app.asar.unpacked/resources/
  const unpackedPath = path.join(__dirname, '..', 'app.asar.unpacked', 'resources', 'sql-wasm.wasm')
  if (fs.existsSync(unpackedPath)) return unpackedPath
  // Dev: relative to project root through node_modules
  const devPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
  if (fs.existsSync(devPath)) return devPath
  // Fallback: let sql.js find it itself
  return ''
}

async function getSQL() {
  if (!SQL) {
    const initSqlJs = require('sql.js')
    const wasmPath = getWasmPath()
    if (wasmPath) {
      SQL = await initSqlJs({ locateFile: () => wasmPath })
    } else {
      SQL = await initSqlJs()
    }
  }
  return SQL
}

export function getDbPath(): string {
  return path.join(app.getPath('userData'), DB_FILENAME)
}

function saveToDisk() {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(getDbPath(), buffer)
}

async function loadOrCreateDb() {
  const sql = await getSQL()
  const dbPath = getDbPath()

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new sql.Database(fileBuffer)
  } else {
    db = new sql.Database()
  }

  db.run('PRAGMA foreign_keys = ON')

  // Run schema
  db.run(`
    CREATE TABLE IF NOT EXISTS trackers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS tracker_activities (
      id TEXT PRIMARY KEY,
      tracker_id TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS tracker_logs (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL,
      week_key TEXT NOT NULL,
      day_index INTEGER NOT NULL,
      checked INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (activity_id) REFERENCES tracker_activities(id) ON DELETE CASCADE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      duration_minutes INTEGER NOT NULL,
      mode TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      tag TEXT DEFAULT 'General',
      pinned INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS kanban_tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT CHECK(status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
      priority TEXT DEFAULT 'Media',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      day INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      title TEXT NOT NULL,
      tag TEXT DEFAULT 'Nota'
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS weight_logs (
      id TEXT PRIMARY KEY,
      weight REAL NOT NULL,
      log_date TEXT NOT NULL,
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS schedule_entries (
      id TEXT PRIMARY KEY,
      time_slot TEXT NOT NULL,
      activity TEXT NOT NULL,
      day_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS schedule_templates (
      id TEXT PRIMARY KEY,
      time_slot TEXT NOT NULL,
      activity TEXT NOT NULL,
      days TEXT NOT NULL DEFAULT '["lun","mar","mie","jue","vie","sab","dom"]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  saveToDisk()
  return db
}

export async function initDatabase() {
  if (db) return db
  return loadOrCreateDb()
}

function queryAll(sql: string, params: any[] = []): any[] {
  if (!db) return []
  const stmt = db.prepare(sql)
  if (params.length > 0) stmt.bind(params)
  const results: any[] = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

function run(sql: string, params: any[] = []) {
  if (!db) return
  db.run(sql, params)
  saveToDisk()
}

// ─── Tracker Queries ───

export function getTrackers() {
  const trackers = queryAll('SELECT * FROM trackers ORDER BY created_at DESC')

  return trackers.map((t: any) => {
    const activities = queryAll('SELECT * FROM tracker_activities WHERE tracker_id = ? ORDER BY rowid', [t.id])

    const activityIds = activities.map((a: any) => a.id)
    const logs: Record<string, Record<string, boolean[]>> = {}

    for (const actId of activityIds) {
      const logRows = queryAll(
        'SELECT * FROM tracker_logs WHERE activity_id = ? ORDER BY week_key, day_index',
        [actId]
      )
      for (const row of logRows) {
        if (!logs[row.week_key]) logs[row.week_key] = {}
        if (!logs[row.week_key][row.activity_id]) {
          logs[row.week_key][row.activity_id] = [false, false, false, false, false, false, false]
        }
        logs[row.week_key][row.activity_id][row.day_index] = row.checked === 1
      }
    }

    return { ...t, activities, logs }
  })
}

export function createTracker(title: string) {
  const id = `t_${Date.now()}`
  run('INSERT INTO trackers (id, title) VALUES (?, ?)', [id, title])
  return getTrackers()
}

export function deleteTracker(id: string) {
  const activities = queryAll('SELECT id FROM tracker_activities WHERE tracker_id = ?', [id])
  for (const a of activities) {
    run('DELETE FROM tracker_logs WHERE activity_id = ?', [a.id])
  }
  run('DELETE FROM tracker_activities WHERE tracker_id = ?', [id])
  run('DELETE FROM trackers WHERE id = ?', [id])
  return getTrackers()
}

export function updateTrackerTitle(id: string, title: string) {
  run('UPDATE trackers SET title = ? WHERE id = ?', [title, id])
  return getTrackers()
}

export function addActivity(trackerId: string, name: string) {
  const id = `a_${Date.now()}`
  run('INSERT INTO tracker_activities (id, tracker_id, name) VALUES (?, ?, ?)', [id, trackerId, name])
  return getTrackers()
}

export function deleteActivity(activityId: string) {
  run('DELETE FROM tracker_logs WHERE activity_id = ?', [activityId])
  run('DELETE FROM tracker_activities WHERE id = ?', [activityId])
  return getTrackers()
}

export function updateActivityName(activityId: string, name: string) {
  run('UPDATE tracker_activities SET name = ? WHERE id = ?', [name, activityId])
  return getTrackers()
}

export function toggleTrackerLog(activityId: string, weekKey: string, dayIndex: number) {
  const rows = queryAll(
    'SELECT * FROM tracker_logs WHERE activity_id = ? AND week_key = ? AND day_index = ?',
    [activityId, weekKey, dayIndex]
  )

  if (rows.length > 0) {
    run('UPDATE tracker_logs SET checked = ? WHERE activity_id = ? AND week_key = ? AND day_index = ?', [
      rows[0].checked === 1 ? 0 : 1,
      activityId,
      weekKey,
      dayIndex,
    ])
  } else {
    const id = `l_${Date.now()}_${Math.random().toString(36).slice(2)}`
    run('INSERT INTO tracker_logs (id, activity_id, week_key, day_index, checked) VALUES (?, ?, ?, ?, 1)', [
      id,
      activityId,
      weekKey,
      dayIndex,
    ])
  }
  return getTrackers()
}

// ─── Pomodoro Queries ───

export function getPomodoroLogs() {
  return queryAll('SELECT * FROM pomodoro_sessions ORDER BY completed_at DESC')
}

export function savePomodoroSession(durationMinutes: number, mode: string) {
  const id = `p_${Date.now()}`
  run('INSERT INTO pomodoro_sessions (id, duration_minutes, mode) VALUES (?, ?, ?)', [id, durationMinutes, mode])
  return getPomodoroLogs()
}

// ─── Notes Queries ───

export function getNotes() {
  return queryAll('SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC')
}

export function saveNote(note: { id: string; title: string; content: string; tag?: string; pinned?: boolean }) {
  const rows = queryAll('SELECT id FROM notes WHERE id = ?', [note.id])
  if (rows.length > 0) {
    run('UPDATE notes SET title = ?, content = ?, tag = ?, pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      note.title,
      note.content,
      note.tag || 'General',
      note.pinned ? 1 : 0,
      note.id,
    ])
  } else {
    run('INSERT INTO notes (id, title, content, tag, pinned) VALUES (?, ?, ?, ?, ?)', [
      note.id,
      note.title,
      note.content,
      note.tag || 'General',
      note.pinned ? 1 : 0,
    ])
  }
  return getNotes()
}

export function deleteNote(id: string) {
  run('DELETE FROM notes WHERE id = ?', [id])
  return getNotes()
}

// ─── Kanban Queries ───

export function getKanbanTasks() {
  return queryAll('SELECT * FROM kanban_tasks ORDER BY created_at DESC')
}

export function createKanbanTask(title: string, priority?: string) {
  const id = `k_${Date.now()}`
  run('INSERT INTO kanban_tasks (id, title, priority) VALUES (?, ?, ?)', [id, title, priority || 'Media'])
  return getKanbanTasks()
}

export function updateTaskStatus(id: string, status: string) {
  run('UPDATE kanban_tasks SET status = ? WHERE id = ?', [status, id])
  return getKanbanTasks()
}

export function deleteKanbanTask(id: string) {
  run('DELETE FROM kanban_tasks WHERE id = ?', [id])
  return getKanbanTasks()
}

// ─── Calendar Queries ───

export function getCalendarEvents() {
  return queryAll('SELECT * FROM calendar_events ORDER BY year, month, day')
}

export function addCalendarEvent(event: { day: number; month: number; year: number; title: string; tag: string }) {
  const id = `e_${Date.now()}`
  run('INSERT INTO calendar_events (id, day, month, year, title, tag) VALUES (?, ?, ?, ?, ?, ?)', [
    id,
    event.day,
    event.month,
    event.year,
    event.title,
    event.tag,
  ])
  return getCalendarEvents()
}

export function deleteCalendarEvent(id: string) {
  run('DELETE FROM calendar_events WHERE id = ?', [id])
  return getCalendarEvents()
}

// ─── Weight Tracker Queries ───

export function getWeightLogs() {
  return queryAll('SELECT * FROM weight_logs ORDER BY log_date DESC')
}

export function addWeightLog(weight: number, date: string, note: string) {
  const id = `w_${Date.now()}`
  run('INSERT INTO weight_logs (id, weight, log_date, note) VALUES (?, ?, ?, ?)', [id, weight, date, note])
  return getWeightLogs()
}

export function deleteWeightLog(id: string) {
  run('DELETE FROM weight_logs WHERE id = ?', [id])
  return getWeightLogs()
}

export function updateWeightLog(id: string, weight: number, note: string) {
  run('UPDATE weight_logs SET weight = ?, note = ? WHERE id = ?', [weight, note, id])
  return getWeightLogs()
}

// ─── Schedule Queries ───

export function getScheduleEntries(date: string) {
  return queryAll('SELECT * FROM schedule_entries WHERE day_date = ? ORDER BY time_slot', [date])
}

export function addScheduleEntry(timeSlot: string, activity: string, dayDate: string) {
  const id = `s_${Date.now()}`
  run('INSERT INTO schedule_entries (id, time_slot, activity, day_date) VALUES (?, ?, ?, ?)', [id, timeSlot, activity, dayDate])
  return getScheduleEntries(dayDate)
}

export function deleteScheduleEntry(id: string, dayDate: string) {
  run('DELETE FROM schedule_entries WHERE id = ?', [id])
  return getScheduleEntries(dayDate)
}

export function updateScheduleEntry(id: string, timeSlot: string, activity: string, dayDate: string) {
  run('UPDATE schedule_entries SET time_slot = ?, activity = ? WHERE id = ?', [timeSlot, activity, id])
  return getScheduleEntries(dayDate)
}

// ─── Schedule Templates (Recurring) ───

export function getScheduleTemplates() {
  return queryAll('SELECT * FROM schedule_templates ORDER BY time_slot')
}

export function addScheduleTemplate(timeSlot: string, activity: string, days: string) {
  const id = `st_${Date.now()}`
  run('INSERT INTO schedule_templates (id, time_slot, activity, days) VALUES (?, ?, ?, ?)', [id, timeSlot, activity, days])
  return getScheduleTemplates()
}

export function deleteScheduleTemplate(id: string) {
  run('DELETE FROM schedule_templates WHERE id = ?', [id])
  return getScheduleTemplates()
}

export function updateScheduleTemplate(id: string, timeSlot: string, activity: string, days: string) {
  run('UPDATE schedule_templates SET time_slot = ?, activity = ?, days = ? WHERE id = ?', [timeSlot, activity, days, id])
  return getScheduleTemplates()
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

export { loadOrCreateDb as getDatabase }
