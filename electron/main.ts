import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import {
  initDatabase,
  closeDatabase,
  getDbPath,
  getTrackers,
  createTracker,
  deleteTracker,
  addActivity,
  deleteActivity,
  toggleTrackerLog,
  getPomodoroLogs,
  savePomodoroSession,
  getNotes,
  saveNote,
  deleteNote,
  getKanbanTasks,
  createKanbanTask,
  updateTaskStatus,
  deleteKanbanTask,
  getCalendarEvents,
  addCalendarEvent,
  deleteCalendarEvent,
  getWeightLogs,
  addWeightLog,
  deleteWeightLog,
  updateWeightLog,
  updateTrackerTitle,
  updateActivityName,
  getScheduleEntries,
  addScheduleEntry,
  deleteScheduleEntry,
  updateScheduleEntry,
  getScheduleTemplates,
  addScheduleTemplate,
  deleteScheduleTemplate,
  updateScheduleTemplate,
} from './db/database'
import { exportDatabase, importDatabase } from './db/backup'

if (process.platform === 'win32') {
  app.setAppUserModelId(app.getName())
}

let mainWindow: BrowserWindow | null = null
const DEFAULT_WIDTH = 1440
const DEFAULT_HEIGHT = 900
let savedBounds = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, x: 0, y: 0 }

function createWindow() {
  mainWindow = new BrowserWindow({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    minWidth: 400,
    minHeight: 400,
    frame: false,
    title: 'TEQUITL',
    icon: path.join(__dirname, '..', 'resources', 'logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#f5f5f5',
  })

  mainWindow.setMenuBarVisibility(false)

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

function registerIpcHandlers() {
  ipcMain.handle('get-trackers', async () => getTrackers())
  ipcMain.handle('create-tracker', async (_e, title: string) => createTracker(title))
  ipcMain.handle('delete-tracker', async (_e, id: string) => deleteTracker(id))
  ipcMain.handle('add-activity', async (_e, trackerId: string, name: string) => addActivity(trackerId, name))
  ipcMain.handle('delete-activity', async (_e, activityId: string) => deleteActivity(activityId))
  ipcMain.handle('toggle-tracker-log', async (_e, activityId: string, weekKey: string, dayIndex: number) =>
    toggleTrackerLog(activityId, weekKey, dayIndex)
  )
  ipcMain.handle('update-tracker-title', async (_e, id: string, title: string) =>
    updateTrackerTitle(id, title)
  )
  ipcMain.handle('update-activity-name', async (_e, id: string, name: string) =>
    updateActivityName(id, name)
  )

  ipcMain.handle('get-pomodoro-logs', async () => getPomodoroLogs())
  ipcMain.handle('save-pomodoro-session', async (_e, duration: number, mode: string) =>
    savePomodoroSession(duration, mode)
  )

  ipcMain.handle('get-notes', async () => getNotes())
  ipcMain.handle('save-note', async (_e, note: any) => saveNote(note))
  ipcMain.handle('delete-note', async (_e, id: string) => deleteNote(id))

  ipcMain.handle('get-kanban-tasks', async () => getKanbanTasks())
  ipcMain.handle('create-kanban-task', async (_e, title: string, priority?: string) =>
    createKanbanTask(title, priority)
  )
  ipcMain.handle('update-task-status', async (_e, id: string, status: string) =>
    updateTaskStatus(id, status)
  )
  ipcMain.handle('delete-kanban-task', async (_e, id: string) => deleteKanbanTask(id))

  ipcMain.handle('get-calendar-events', async () => getCalendarEvents())
  ipcMain.handle('add-calendar-event', async (_e, event: any) => addCalendarEvent(event))
  ipcMain.handle('delete-calendar-event', async (_e, id: string) => deleteCalendarEvent(id))

  ipcMain.handle('export-database', async () => exportDatabase(getDbPath()))
  ipcMain.handle('import-database', async () => {
    const result = await importDatabase(getDbPath())
    closeDatabase()
    await initDatabase()
    return result
  })

  // Weight tracker handlers
  ipcMain.handle('get-weight-logs', async () => getWeightLogs())
  ipcMain.handle('add-weight-log', async (_e, weight: number, date: string, note: string) =>
    addWeightLog(weight, date, note)
  )
  ipcMain.handle('delete-weight-log', async (_e, id: string) => deleteWeightLog(id))
  ipcMain.handle('update-weight-log', async (_e, id: string, weight: number, note: string) =>
    updateWeightLog(id, weight, note)
  )

  // Schedule handlers
  ipcMain.handle('get-schedule-entries', async (_e, date: string) => getScheduleEntries(date))
  ipcMain.handle('add-schedule-entry', async (_e, timeSlot: string, activity: string, dayDate: string) =>
    addScheduleEntry(timeSlot, activity, dayDate)
  )
  ipcMain.handle('delete-schedule-entry', async (_e, id: string, dayDate: string) =>
    deleteScheduleEntry(id, dayDate)
  )
  ipcMain.handle('update-schedule-entry', async (_e, id: string, timeSlot: string, activity: string, dayDate: string) =>
    updateScheduleEntry(id, timeSlot, activity, dayDate)
  )

  // Schedule template handlers
  ipcMain.handle('get-schedule-templates', async () => getScheduleTemplates())
  ipcMain.handle('add-schedule-template', async (_e, timeSlot: string, activity: string, days: string) =>
    addScheduleTemplate(timeSlot, activity, days)
  )
  ipcMain.handle('delete-schedule-template', async (_e, id: string) => deleteScheduleTemplate(id))
  ipcMain.handle('update-schedule-template', async (_e, id: string, timeSlot: string, activity: string, days: string) =>
    updateScheduleTemplate(id, timeSlot, activity, days)
  )

  // ─── Window Controls ───
  ipcMain.handle('win-minimize', async () => mainWindow?.minimize())
  ipcMain.handle('win-maximize', async () => {
    if (!mainWindow) return
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.handle('win-close', async () => mainWindow?.close())
  ipcMain.handle('win-is-maximized', async () => mainWindow?.isMaximized() || false)

  ipcMain.handle('toggle-fullscreen', async () => {
    if (!mainWindow) return false
    const isFS = mainWindow.isFullScreen()
    mainWindow.setFullScreen(!isFS)
    return !isFS
  })

  ipcMain.handle('set-window-size', async (_e, width: number, height: number) => {
    if (!mainWindow) return
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    mainWindow.setMinimumSize(width, height)
    mainWindow.setMaximumSize(width, height)
    mainWindow.setSize(width, height)
    mainWindow.center()
  })

  ipcMain.handle('reset-window-size', async () => {
    if (!mainWindow) return
    mainWindow.setMinimumSize(400, 400)
    mainWindow.setMaximumSize(0, 0)
    mainWindow.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT)
    mainWindow.center()
  })

  ipcMain.handle('get-user-data-path', async () => app.getPath('userData'))

  // Auto-updater
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdatesAndNotify()
      return { available: !!result }
    } catch {
      return { available: false }
    }
  })

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch {
      return { success: false }
    }
  })

  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.handle('get-app-version', async () => app.getVersion())

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-available', info)
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('update-downloaded', info)
  })

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err)
  })
}

app.whenReady().then(async () => {
  try {
    await initDatabase()
  } catch (err) {
    console.error('Failed to initialize database:', err)
    // Continue without DB - app will work with in-memory fallback
  }
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  closeDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
