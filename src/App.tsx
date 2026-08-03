import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Calendar,
  Timer,
  FileText,
  CheckSquare,
  Wind,
  Layers,
  Clock,
  Sparkles,
  Play,
  Pause,
  X,
  Scale,
  ListTodo,
} from 'lucide-react'
import TitleBar from './components/layout/TitleBar'
import Sidebar from './components/layout/Sidebar'
import QuoteBar from './components/shared/QuoteBar'
import DbSettings from './components/shared/DbSettings'
import Configuracion from './components/Configuracion'
import YeyelliTrackers from './components/apps/YeyelliTrackers'
import TlahuilliPomodoro from './components/apps/TlahuilliPomodoro'
import TonalliCalendar from './components/apps/TonalliCalendar'
import AmoxtliNotes from './components/apps/AmoxtliNotes'
import TequipanolliKanban from './components/apps/TequipanolliKanban'
import IhiyotlBreathing from './components/apps/IhiyotlBreathing'
import MahuizotlAnalytics from './components/apps/MahuizotlAnalytics'
import EtiliWeightTracker from './components/apps/EtiliWeightTracker'
import CahuitlSchedule from './components/apps/CahuitlSchedule'
import type { Tracker, WeekInfo, MiniApp, AppSettings, PomodoroSession } from './types/global'

const DEFAULT_SETTINGS: AppSettings = {
  pomodoroWork: 25,
  pomodoroShort: 5,
  pomodoroLong: 15,
  breatheInhale: 4,
  breatheHold: 4,
  breatheExhale: 4,
  scheduleStart: '05:00',
  scheduleEnd: '22:00',
  scheduleInterval: 30,
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('tequitl-settings')
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_SETTINGS }
}

function getWeekInfo(date: Date): WeekInfo {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)

  const dayOfWeek = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - dayOfWeek)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const startStr = `${monday.getDate()} ${months[monday.getMonth()]}`
  const endStr = `${sunday.getDate()} ${months[sunday.getMonth()]}`
  const periodText = `Del ${startStr} al ${endStr} de ${d.getFullYear()}`

  return { weekNumber: weekNo, year: d.getFullYear(), periodText, monday, sunday }
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedTrackerId, setSelectedTrackerId] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  // ─── Pomodoro State (lives here so timer persists across views) ───
  const [pomoTimeLeft, setPomoTimeLeft] = useState(settings.pomodoroWork * 60)
  const [pomoMode, setPomoMode] = useState<'work' | 'short' | 'long'>('work')
  const [pomoIsActive, setPomoIsActive] = useState(false)
  const [pomoSessions, setPomoSessions] = useState(0)
  const [pomoLogs, setPomoLogs] = useState<PomodoroSession[]>([])
  const [isZen, setIsZen] = useState(false)
  const [isMini, setIsMini] = useState(false)

  const weekInfo = useMemo(() => getWeekInfo(currentDate), [currentDate])

  const workDuration = settings.pomodoroWork
  const shortDuration = settings.pomodoroShort
  const longDuration = settings.pomodoroLong

  // Pomodoro timer effect (runs always at App level)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (pomoIsActive && pomoTimeLeft > 0) {
      interval = setInterval(() => setPomoTimeLeft((p) => p - 1), 1000)
    } else if (pomoTimeLeft === 0 && pomoIsActive) {
      setPomoIsActive(false)
      if (pomoMode === 'work') {
        setPomoSessions((s) => s + 1)
        const session = {
          id: `p_${Date.now()}`,
          duration_minutes: workDuration,
          mode: 'Enfoque Profundo',
          completed_at: new Date().toISOString(),
        }
        setPomoLogs((prev) => [session, ...prev])
        try { window.electronAPI.savePomodoroSession(workDuration, 'work') } catch {}
        setPomoMode('short')
        setPomoTimeLeft(shortDuration * 60)
      } else {
        setPomoMode('work')
        setPomoTimeLeft(workDuration * 60)
      }
    }
    return () => { if (interval) clearInterval(interval) }
  }, [pomoIsActive, pomoTimeLeft, pomoMode, workDuration, shortDuration])

  // Load trackers
  useEffect(() => {
    async function load() {
      try {
        const result = await window.electronAPI.getTrackers()
        setTrackers(result || [])
      } catch { setTrackers([]) }
    }
    load()
  }, [])

  // Check for updates on startup
  useEffect(() => {
    const t = setTimeout(() => {
      try { window.electronAPI.checkForUpdates() } catch {}
    }, 5000)
    return () => clearTimeout(t)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        setSidebarCollapsed((prev) => !prev)
      }
      if (e.ctrlKey && e.key === ' ' && !isZen) {
        e.preventDefault()
        setPomoIsActive((p) => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isZen])

  // ─── Pomodoro action handlers ───
  const handleToggleActive = useCallback(() => setPomoIsActive((p) => !p), [])
  const handleReset = useCallback(() => {
    setPomoIsActive(false)
    setPomoTimeLeft(pomoMode === 'work' ? workDuration * 60 : pomoMode === 'short' ? shortDuration * 60 : longDuration * 60)
  }, [pomoMode, workDuration, shortDuration, longDuration])
  const handleSwitchMode = useCallback((mode: 'work' | 'short' | 'long') => {
    setPomoMode(mode)
    setPomoIsActive(false)
    const durs = { work: workDuration * 60, short: shortDuration * 60, long: longDuration * 60 }
    setPomoTimeLeft(durs[mode])
  }, [workDuration, shortDuration, longDuration])

  const handleToggleZen = useCallback(async () => {
    if (isZen) {
      setIsZen(false)
      try { await window.electronAPI.toggleFullscreen() } catch {
        try { document.exitFullscreen() } catch {}
      }
    } else {
      setIsZen(true)
      try { await window.electronAPI.toggleFullscreen() } catch {
        try { document.documentElement.requestFullscreen() } catch {}
      }
    }
  }, [isZen])

  const handleToggleMini = useCallback(async () => {
    if (isMini) {
      try { await window.electronAPI.resetWindowSize() } catch {}
      setIsMini(false)
    } else {
      try { await window.electronAPI.setWindowSize(300, 320) } catch {}
      setIsMini(true)
    }
  }, [isMini])

  // ─── MiniApp definitions ───
  const miniApps: MiniApp[] = [
    { id: 'tracker_list', title: 'Hábitos (Yeyelli)', nahuatl: 'YEYELLI', desc: 'Matriz semanal de constancia y seguimiento por hábitos.', icon: Layers, count: `${trackers.length} Trackers activos` },
    { id: 'pomodoro', title: 'Temporizador (Tlahuilli)', nahuatl: 'TLAHUILTI', desc: 'Reloj Pomodoro para máxima concentración y bloques de trabajo.', icon: Timer, count: pomoIsActive ? 'En progreso...' : 'Enfoque productivo' },
    { id: 'calendar', title: 'Calendario (Tonalli)', nahuatl: 'TONALLI', desc: 'Agenda mensual y mapa de fechas importantes.', icon: Calendar, count: 'Planificación' },
    { id: 'notes', title: 'Notas & Apuntes (Amoxtli)', nahuatl: 'AMOXTLI', desc: 'Borrador rápido, ideas organizadas y apuntes.', icon: FileText, count: 'Bloc de ideas' },
    { id: 'kanban', title: 'Tablero Kanban (Tequipanolli)', nahuatl: 'TEQUIPANOLLI', desc: 'Gestión por estados: Por hacer, En progreso, Terminado.', icon: CheckSquare, count: 'Organización visual' },
    { id: 'breathe', title: 'Pausa & Respiro (Ihiyotl)', nahuatl: 'IHIYOTL', desc: 'Guía de respiración rítmica para oxigenar la mente.', icon: Wind, count: 'Enfoque guiado' },
    { id: 'weight', title: 'Tracker de Peso (Etili)', nahuatl: 'ETILI', desc: 'Registro diario de peso corporal y evolución.', icon: Scale, count: 'Seguimiento corporal' },
    { id: 'schedule', title: 'Planificador Diario (Cahuitl)', nahuatl: 'CAHUITL', desc: 'Agenda por horarios de 5 AM a 10 PM con actividades puntuales.', icon: ListTodo, count: 'Organización horaria' },
  ]

  const pomoMins = Math.floor(pomoTimeLeft / 60).toString().padStart(2, '0')
  const pomoSecs = (pomoTimeLeft % 60).toString().padStart(2, '0')

  // ─── Zen Mode renders ONLY the clock ───
  if (isZen) {
    return (
      <div className="h-screen flex flex-col bg-neutral-900">
        <div className="h-10 bg-neutral-900 flex items-center justify-end shrink-0 px-2"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          <button
            onClick={handleToggleZen}
            className="w-10 h-8 flex items-center justify-center border-2 border-neutral-700 text-neutral-400 hover:text-white hover:border-white transition-colors"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-10">
          <div className="font-mono font-black text-[12vw] tracking-tighter text-white">
            {pomoMins}:{pomoSecs}
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={handleToggleActive}
              className="w-20 h-20 border-2 border-white text-white hover:bg-white hover:text-neutral-900 flex items-center justify-center transition-all"
            >
              {pomoIsActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
            </button>
            <button
              onClick={handleReset}
              className="w-20 h-20 border-2 border-white text-white hover:bg-white hover:text-neutral-900 flex items-center justify-center transition-all"
            >
              <RotateCcwIcon className="w-8 h-8" />
            </button>
          </div>
          <div className="text-neutral-500 text-xs font-mono">
            {pomoMode === 'work' ? 'TRABAJO' : pomoMode === 'short' ? 'DESCANSO CORTO' : 'DESCANSO LARGO'}
            &nbsp;·&nbsp;
            {pomoSessions} sesiones
          </div>
        </div>
      </div>
    )
  }

  // ─── Mini Mode renders ONLY the compact timer ───
  if (isMini) {
    return (
      <div className="h-screen flex flex-col bg-neutral-100" style={{ minWidth: 280, minHeight: 280 }}>
        <div className="h-8 bg-neutral-900 flex items-center justify-between px-2 shrink-0"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          <span className="text-[9px] font-mono text-neutral-400 font-bold ml-1">POMODORO</span>
          <button
            onClick={handleToggleMini}
            className="w-6 h-6 flex items-center justify-center border border-neutral-700 text-neutral-400 hover:text-white hover:border-white transition-colors"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <X className="w-3 h-3 stroke-[3]" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white p-4">
          <div className="font-mono font-black text-5xl tracking-tighter py-2 px-4 border-2 border-neutral-900 bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {pomoMins}:{pomoSecs}
          </div>
          <button
            onClick={handleToggleActive}
            className="inline-flex items-center gap-1.5 bg-neutral-900 text-white font-bold text-xs px-5 py-2 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            {pomoIsActive ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            {pomoIsActive ? 'PAUSAR' : 'INICIAR'}
          </button>
          <button
            onClick={handleToggleMini}
            className="text-[10px] font-mono font-bold border-2 border-neutral-900 px-3 py-1 bg-white hover:bg-neutral-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            SALIR
          </button>
        </div>
      </div>
    )
  }

  // ─── Normal layout ───
  return (
    <div className="h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans antialiased select-none overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          weekNumber={weekInfo.weekNumber}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 md:p-10">
          {/* ─── DASHBOARD ─── */}
          {currentView === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="border-b-2 border-neutral-900 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="neo-badge">TEQUITL · CENTRO DE PRODUCTIVIDAD</span>
                  <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">TODAS LAS MINI-APPS</h1>
                  <p className="text-sm font-mono text-neutral-600 mt-1">
                    Acceso directo a tus herramientas de trabajo, tiempo y seguimiento.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white border-2 border-neutral-900 p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-mono font-bold">
                  <Clock className="w-4 h-4" />
                  <span>SEMANA N° {weekInfo.weekNumber} (2026)</span>
                </div>
              </div>

              <QuoteBar />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {miniApps.map((app) => {
                  const IconComponent = app.icon
                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        if (app.id === 'tracker_list') setCurrentView('tracker_list')
                        else setCurrentView(app.id)
                      }}
                      className="neo-card p-6 flex flex-col justify-between min-h-[200px]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <span className="font-mono text-xs font-bold bg-neutral-100 border border-neutral-900 px-2 py-0.5">
                            {app.nahuatl}
                          </span>
                          <div className="w-9 h-9 border-2 border-neutral-900 bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                            <IconComponent className="w-5 h-5 stroke-[2.5]" />
                          </div>
                        </div>
                        <h2 className="text-xl font-black uppercase text-neutral-900 group-hover:underline decoration-2">
                          {app.title}
                        </h2>
                        <p className="text-xs font-mono text-neutral-600 mt-2 line-clamp-2">{app.desc}</p>
                      </div>
                      <div className="mt-6 pt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-neutral-900">{app.count}</span>
                        <span className="font-black group-hover:translate-x-1 transition-transform">ABRIR →</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-white border-2 border-neutral-900 p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] font-mono text-xs space-y-2">
                <div className="font-black text-sm uppercase flex items-center gap-2 border-b-2 border-neutral-900 pb-2">
                  <Sparkles className="w-4 h-4" /> GLOSARIO NÁHUATL DE LA APP
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-neutral-700">
                  <div><strong className="text-neutral-900">Tequitl</strong>: Trabajo · Deber</div>
                  <div><strong className="text-neutral-900">Yeyelli</strong>: Hábito · Práctica</div>
                  <div><strong className="text-neutral-900">Tonalli</strong>: Día · Energía</div>
                  <div><strong className="text-neutral-900">Amoxtli</strong>: Libro · Notas</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TRACKERS ─── */}
          {(currentView === 'tracker_list' || currentView === 'tracker_detail') && (
            <YeyelliTrackers
              trackers={trackers}
              setTrackers={setTrackers}
              weekInfo={weekInfo}
              currentView={currentView}
              setCurrentView={setCurrentView}
              selectedTrackerId={selectedTrackerId}
              setSelectedTrackerId={setSelectedTrackerId}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
            />
          )}

          {/* ─── POMODORO ─── */}
          {currentView === 'pomodoro' && (
            <TlahuilliPomodoro
              settings={settings}
              pomoTimeLeft={pomoTimeLeft}
              pomoMode={pomoMode}
              pomoIsActive={pomoIsActive}
              pomoSessions={pomoSessions}
              pomoLogs={pomoLogs}
              isZen={isZen}
              isMini={isMini}
              onToggleActive={handleToggleActive}
              onReset={handleReset}
              onSwitchMode={handleSwitchMode}
              onToggleZen={handleToggleZen}
              onToggleMini={handleToggleMini}
            />
          )}

          {/* ─── CALENDARIO ─── */}
          {currentView === 'calendar' && <TonalliCalendar />}

          {/* ─── NOTAS ─── */}
          {currentView === 'notes' && <AmoxtliNotes />}

          {/* ─── KANBAN ─── */}
          {currentView === 'kanban' && <TequipanolliKanban />}

          {/* ─── BREATHING ─── */}
          {currentView === 'breathe' && <IhiyotlBreathing settings={settings} />}

          {/* ─── WEIGHT TRACKER ─── */}
          {currentView === 'weight' && <EtiliWeightTracker />}

          {/* ─── SCHEDULE ─── */}
          {currentView === 'schedule' && <CahuitlSchedule settings={settings} />}

          {/* ─── HISTORY ─── */}
          {currentView === 'history' && <MahuizotlAnalytics trackers={trackers} />}

          {/* ─── DB SETTINGS ─── */}
          {currentView === 'settings' && <DbSettings />}

          {/* ─── CONFIGURATION ─── */}
          {currentView === 'config' && <Configuracion settings={settings} setSettings={setSettings} />}
        </main>
      </div>

      {/* ─── Floating Pomodoro Bar (visible when timer active on other views) ─── */}
      {pomoIsActive && currentView !== 'pomodoro' && !isZen && (
        <div className="fixed bottom-4 right-4 bg-white border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex items-center gap-4 font-mono z-50">
          <div className="flex items-center gap-3">
            <Timer className="w-4 h-4 text-neutral-900" />
            <span className="font-black text-lg tracking-tighter">
              {pomoMins}:{pomoSecs}
            </span>
            <span className="text-[10px] text-neutral-500 uppercase font-bold">
              {pomoMode === 'work' ? 'TRABAJO' : pomoMode === 'short' ? 'DESCANSO' : 'LARGO'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleActive}
              className="w-8 h-8 border-2 border-neutral-900 bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-700"
              title="Pausar"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={() => { handleToggleActive(); handleReset() }}
              className="w-8 h-8 border-2 border-neutral-900 bg-white flex items-center justify-center hover:bg-neutral-100"
              title="Detener"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <button
              onClick={() => setCurrentView('pomodoro')}
              className="text-[10px] font-bold border-2 border-neutral-900 px-2.5 h-8 bg-white hover:bg-neutral-100 ml-1"
              title="Ir al Pomodoro"
            >
              IR →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RotateCcwIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  )
}
