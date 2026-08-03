import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getTrackers: () => ipcRenderer.invoke('get-trackers'),
  createTracker: (title: string) => ipcRenderer.invoke('create-tracker', title),
  deleteTracker: (id: string) => ipcRenderer.invoke('delete-tracker', id),
  addActivity: (trackerId: string, name: string) => ipcRenderer.invoke('add-activity', trackerId, name),
  deleteActivity: (activityId: string) => ipcRenderer.invoke('delete-activity', activityId),
  toggleTrackerLog: (activityId: string, weekKey: string, dayIndex: number) =>
    ipcRenderer.invoke('toggle-tracker-log', activityId, weekKey, dayIndex),
  updateTrackerTitle: (id: string, title: string) =>
    ipcRenderer.invoke('update-tracker-title', id, title),
  updateActivityName: (id: string, name: string) =>
    ipcRenderer.invoke('update-activity-name', id, name),

  getPomodoroLogs: () => ipcRenderer.invoke('get-pomodoro-logs'),
  savePomodoroSession: (duration: number, mode: string) =>
    ipcRenderer.invoke('save-pomodoro-session', duration, mode),

  getNotes: () => ipcRenderer.invoke('get-notes'),
  saveNote: (note: any) => ipcRenderer.invoke('save-note', note),
  deleteNote: (id: string) => ipcRenderer.invoke('delete-note', id),

  getKanbanTasks: () => ipcRenderer.invoke('get-kanban-tasks'),
  createKanbanTask: (title: string, priority?: string) =>
    ipcRenderer.invoke('create-kanban-task', title, priority),
  updateTaskStatus: (id: string, status: string) =>
    ipcRenderer.invoke('update-task-status', id, status),
  deleteKanbanTask: (id: string) => ipcRenderer.invoke('delete-kanban-task', id),

  getCalendarEvents: () => ipcRenderer.invoke('get-calendar-events'),
  addCalendarEvent: (event: any) => ipcRenderer.invoke('add-calendar-event', event),
  deleteCalendarEvent: (id: string) => ipcRenderer.invoke('delete-calendar-event', id),

  getWeightLogs: () => ipcRenderer.invoke('get-weight-logs'),
  addWeightLog: (weight: number, date: string, note: string) =>
    ipcRenderer.invoke('add-weight-log', weight, date, note),
  deleteWeightLog: (id: string) => ipcRenderer.invoke('delete-weight-log', id),
  updateWeightLog: (id: string, weight: number, note: string) =>
    ipcRenderer.invoke('update-weight-log', id, weight, note),

  getScheduleEntries: (date: string) => ipcRenderer.invoke('get-schedule-entries', date),
  addScheduleEntry: (timeSlot: string, activity: string, dayDate: string) =>
    ipcRenderer.invoke('add-schedule-entry', timeSlot, activity, dayDate),
  deleteScheduleEntry: (id: string, dayDate: string) =>
    ipcRenderer.invoke('delete-schedule-entry', id, dayDate),
  updateScheduleEntry: (id: string, timeSlot: string, activity: string, dayDate: string) =>
    ipcRenderer.invoke('update-schedule-entry', id, timeSlot, activity, dayDate),

  getScheduleTemplates: () => ipcRenderer.invoke('get-schedule-templates'),
  addScheduleTemplate: (timeSlot: string, activity: string, days: string) =>
    ipcRenderer.invoke('add-schedule-template', timeSlot, activity, days),
  deleteScheduleTemplate: (id: string) => ipcRenderer.invoke('delete-schedule-template', id),
  updateScheduleTemplate: (id: string, timeSlot: string, activity: string, days: string) =>
    ipcRenderer.invoke('update-schedule-template', id, timeSlot, activity, days),

  exportDatabase: () => ipcRenderer.invoke('export-database'),
  importDatabase: () => ipcRenderer.invoke('import-database'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // Window controls
  minimize: () => ipcRenderer.invoke('win-minimize'),
  maximize: () => ipcRenderer.invoke('win-maximize'),
  close: () => ipcRenderer.invoke('win-close'),
  isMaximized: () => ipcRenderer.invoke('win-is-maximized'),

  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  setWindowSize: (width: number, height: number) =>
    ipcRenderer.invoke('set-window-size', width, height),
  resetWindowSize: () => ipcRenderer.invoke('reset-window-size'),

  // Updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdateAvailable: (cb: (info: any) => void) => {
    ipcRenderer.on('update-available', (_e, info) => cb(info))
  },
  onUpdateDownloaded: (cb: (info: any) => void) => {
    ipcRenderer.on('update-downloaded', (_e, info) => cb(info))
  },
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available')
    ipcRenderer.removeAllListeners('update-downloaded')
  },
})
