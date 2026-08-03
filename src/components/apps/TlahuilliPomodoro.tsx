import React from 'react'
import { Play, Pause, RotateCcw, Timer, Maximize, Minimize, ArrowLeft, X } from 'lucide-react'
import type { PomodoroSession, AppSettings } from '../../types/global'

interface TlahuilliPomodoroProps {
  settings: AppSettings
  pomoTimeLeft: number
  pomoMode: 'work' | 'short' | 'long'
  pomoIsActive: boolean
  pomoSessions: number
  pomoLogs: PomodoroSession[]
  isZen: boolean
  isMini: boolean
  onToggleActive: () => void
  onReset: () => void
  onSwitchMode: (mode: 'work' | 'short' | 'long') => void
  onToggleZen: () => void
  onToggleMini: () => void
}

export default function TlahuilliPomodoro({
  settings,
  pomoTimeLeft,
  pomoMode,
  pomoIsActive,
  pomoSessions,
  pomoLogs,
  isZen,
  isMini,
  onToggleActive,
  onReset,
  onSwitchMode,
  onToggleZen,
  onToggleMini,
}: TlahuilliPomodoroProps) {
  const workDuration = settings.pomodoroWork
  const shortDuration = settings.pomodoroShort
  const longDuration = settings.pomodoroLong

  const minutes = Math.floor(pomoTimeLeft / 60).toString().padStart(2, '0')
  const seconds = (pomoTimeLeft % 60).toString().padStart(2, '0')

  const modeLabel = pomoMode === 'work' ? 'TRABAJO' : pomoMode === 'short' ? 'DESCANSO CORTO' : 'DESCANSO LARGO'
  const durations = [
    { mode: 'work' as const, label: `TRABAJO (${workDuration}m)` },
    { mode: 'short' as const, label: `DESCANSO CORTO (${shortDuration}m)` },
    { mode: 'long' as const, label: `LARGO (${longDuration}m)` },
  ]

  return (
    <div className={`${isZen ? 'fixed inset-0 z-50 bg-neutral-100' : 'max-w-4xl mx-auto'} space-y-8`}>
      <div className="border-b-2 border-neutral-900 pb-5">
        <span className="neo-badge">TLAHUILTI · TEMPORIZADOR DE ENFOQUE</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">RELOJ POMODORO</h1>
        <p className="text-sm font-mono text-neutral-600 mt-1">
          Bloques de {workDuration} min de concentración.
        </p>
      </div>

      <div className={`grid ${isMini ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-6`}>
        <div className={`${isMini ? '' : 'md:col-span-2'} bg-white border-2 border-neutral-900 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center space-y-6`}>
          <div className="flex border-2 border-neutral-900 font-mono text-xs flex-wrap justify-center">
            {durations.map((d) => (
              <button
                key={d.mode}
                onClick={() => onSwitchMode(d.mode)}
                className={`px-4 py-2 font-bold ${pomoMode === d.mode ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-100'} ${
                  d.mode !== 'work' ? 'border-l-2 border-neutral-900' : ''
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div
            className={`font-mono font-black tracking-tighter py-4 px-8 border-2 border-neutral-900 bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              isMini ? 'text-5xl' : 'text-7xl md:text-8xl'
            }`}
          >
            {minutes}:{seconds}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleActive}
              className="inline-flex items-center gap-2 bg-neutral-900 text-white font-black text-base px-8 py-4 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {pomoIsActive ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              {pomoIsActive ? 'PAUSAR' : 'INICIAR'}
            </button>
            <button
              onClick={onReset}
              className="p-4 border-2 border-neutral-900 bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Reiniciar"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onToggleZen}
              className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                isZen ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-100'
              }`}
              title="Modo Zen (pantalla completa)"
            >
              <Maximize className="w-3.5 h-3.5" /> ZEN
            </button>
            <button
              onClick={onToggleMini}
              className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                isMini ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-100'
              }`}
              title="Modo Mini (ventana pequeña)"
            >
              <Minimize className="w-3.5 h-3.5" /> MINI
            </button>
          </div>

          <div className="text-xs font-mono text-neutral-500 pt-2">
            Sesiones completadas: <strong className="text-neutral-900 text-sm">{pomoSessions}</strong>
          </div>
        </div>

        {!isMini && (
          <div className="bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="font-black text-sm uppercase border-b-2 border-neutral-900 pb-2 flex items-center justify-between">
              <span>HISTORIAL</span>
              <Timer className="w-4 h-4" />
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {pomoLogs.map((log) => (
                <div key={log.id} className="border-2 border-neutral-900 p-3 bg-neutral-50 text-xs font-mono">
                  <div className="font-bold text-neutral-900">
                    {log.mode === 'work' ? 'Sesión Completada' : 'Descanso'}
                  </div>
                  <div className="text-neutral-500 mt-1 flex justify-between">
                    <span>{log.duration_minutes} minutos</span>
                    <span>
                      {new Date(log.completed_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {pomoLogs.length === 0 && (
                <p className="text-xs font-mono text-neutral-500 py-4 text-center">Sin sesiones registradas aún.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
