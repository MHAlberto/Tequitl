export interface Tracker {
  id: string
  title: string
  created_at: string
  activities: Activity[]
  logs: Record<string, Record<string, boolean[]>>
}

export interface Activity {
  id: string
  tracker_id: string
  name: string
}

export interface PomodoroSession {
  id: string
  duration_minutes: number
  mode: string
  completed_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  tag: string
  pinned: number | boolean
  updated_at: string
}

export interface KanbanTask {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  priority: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  day: number
  month: number
  year: number
  title: string
  tag: string
}

export interface WeightLog {
  id: string
  weight: number
  log_date: string
  note: string
  created_at: string
}

export interface ScheduleEntry {
  id: string
  time_slot: string
  activity: string
  day_date: string
  created_at: string
}

export interface Frase {
  autor: string
  frase: string
  fuente: string
}

export interface WeekInfo {
  weekNumber: number
  year: number
  periodText: string
  monday: Date
  sunday: Date
}

export interface MiniApp {
  id: string
  title: string
  nahuatl: string
  desc: string
  icon: React.ComponentType<any>
  count: string
}

export interface AppSettings {
  pomodoroWork: number
  pomodoroShort: number
  pomodoroLong: number
  breatheInhale: number
  breatheHold: number
  breatheExhale: number
  scheduleStart: string
  scheduleEnd: string
  scheduleInterval: number
}

export interface ScheduleTemplate {
  id: string
  time_slot: string
  activity: string
  days: string
  created_at: string
}

export interface ElectronAPI {
  getTrackers: () => Promise<Tracker[]>
  createTracker: (title: string) => Promise<Tracker[]>
  deleteTracker: (id: string) => Promise<Tracker[]>
  addActivity: (trackerId: string, name: string) => Promise<Tracker[]>
  deleteActivity: (activityId: string) => Promise<Tracker[]>
  toggleTrackerLog: (activityId: string, weekKey: string, dayIndex: number) => Promise<Tracker[]>
  updateTrackerTitle: (id: string, title: string) => Promise<Tracker[]>
  updateActivityName: (id: string, name: string) => Promise<Tracker[]>
  getPomodoroLogs: () => Promise<PomodoroSession[]>
  savePomodoroSession: (duration: number, mode: string) => Promise<PomodoroSession[]>
  getNotes: () => Promise<Note[]>
  saveNote: (note: any) => Promise<Note[]>
  deleteNote: (id: string) => Promise<Note[]>
  getKanbanTasks: () => Promise<KanbanTask[]>
  createKanbanTask: (title: string, priority?: string) => Promise<KanbanTask[]>
  updateTaskStatus: (id: string, status: string) => Promise<KanbanTask[]>
  deleteKanbanTask: (id: string) => Promise<KanbanTask[]>
  getCalendarEvents: () => Promise<CalendarEvent[]>
  addCalendarEvent: (event: any) => Promise<CalendarEvent[]>
  deleteCalendarEvent: (id: string) => Promise<CalendarEvent[]>
  getWeightLogs: () => Promise<WeightLog[]>
  addWeightLog: (weight: number, date: string, note: string) => Promise<WeightLog[]>
  deleteWeightLog: (id: string) => Promise<WeightLog[]>
  updateWeightLog: (id: string, weight: number, note: string) => Promise<WeightLog[]>
  getScheduleEntries: (date: string) => Promise<ScheduleEntry[]>
  addScheduleEntry: (timeSlot: string, activity: string, dayDate: string) => Promise<ScheduleEntry[]>
  deleteScheduleEntry: (id: string, dayDate: string) => Promise<ScheduleEntry[]>
  updateScheduleEntry: (id: string, timeSlot: string, activity: string, dayDate: string) => Promise<ScheduleEntry[]>
  getScheduleTemplates: () => Promise<ScheduleTemplate[]>
  addScheduleTemplate: (timeSlot: string, activity: string, days: string) => Promise<ScheduleTemplate[]>
  deleteScheduleTemplate: (id: string) => Promise<ScheduleTemplate[]>
  updateScheduleTemplate: (id: string, timeSlot: string, activity: string, days: string) => Promise<ScheduleTemplate[]>
  exportDatabase: () => Promise<string>
  importDatabase: () => Promise<string>
  getUserDataPath: () => Promise<string>
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  toggleFullscreen: () => Promise<boolean>
  setWindowSize: (width: number, height: number) => Promise<void>
  resetWindowSize: () => Promise<void>
  checkForUpdates: () => Promise<{ available: boolean }>
  downloadUpdate: () => Promise<{ success: boolean }>
  installUpdate: () => void
  getAppVersion: () => Promise<string>
  onUpdateAvailable: (cb: (info: any) => void) => void
  onUpdateDownloaded: (cb: (info: any) => void) => void
  removeUpdateListeners: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
