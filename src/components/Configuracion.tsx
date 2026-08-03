import React from 'react'
import type { AppSettings } from '../types/global'
import { Settings, Timer, Wind, ListTodo, Save } from 'lucide-react'

interface ConfiguracionProps {
  settings: AppSettings
  setSettings: (s: AppSettings) => void
}

export default function Configuracion({ settings, setSettings }: ConfiguracionProps) {
  const updateNum = (key: keyof AppSettings, value: number, min: number, max: number) => {
    if (value < min || value > max) return
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    localStorage.setItem('tequitl-settings', JSON.stringify(updated))
  }

  const updateStr = (key: keyof AppSettings, value: string) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    localStorage.setItem('tequitl-settings', JSON.stringify(updated))
  }

  const handleSave = () => {
    localStorage.setItem('tequitl-settings', JSON.stringify(settings))
  }

  const intervalOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1 hora y media' },
    { value: 120, label: '2 horas' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b-2 border-neutral-900 pb-5">
        <span className="neo-badge">CONFIGURACIÓN · AJUSTES DE LA APP</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">PREFERENCIAS</h1>
        <p className="text-sm font-mono text-neutral-600 mt-1">
          Personaliza los tiempos y comportamientos de cada mini-app.
        </p>
      </div>

      {/* Pomodoro */}
      <div className="bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-neutral-900 pb-3">
          <Timer className="w-5 h-5 stroke-[2.5]" />
          <h2 className="text-lg font-black uppercase">Pomodoro (Tlahuilli)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold">TRABAJO (minutos)</label>
            <input type="number" min={1} max={120} value={settings.pomodoroWork}
              onChange={(e) => updateNum('pomodoroWork', parseInt(e.target.value) || 25, 1, 120)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold">DESCANSO CORTO (minutos)</label>
            <input type="number" min={1} max={60} value={settings.pomodoroShort}
              onChange={(e) => updateNum('pomodoroShort', parseInt(e.target.value) || 5, 1, 60)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold">DESCANSO LARGO (minutos)</label>
            <input type="number" min={1} max={120} value={settings.pomodoroLong}
              onChange={(e) => updateNum('pomodoroLong', parseInt(e.target.value) || 15, 1, 120)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Breathing */}
      <div className="bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-neutral-900 pb-3">
          <Wind className="w-5 h-5 stroke-[2.5]" />
          <h2 className="text-lg font-black uppercase">Respiración (Ihiyotl)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold">INHALAR (segundos)</label>
            <input type="number" min={1} max={30} value={settings.breatheInhale}
              onChange={(e) => updateNum('breatheInhale', parseInt(e.target.value) || 4, 1, 30)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold">SOSTENER (segundos)</label>
            <input type="number" min={1} max={30} value={settings.breatheHold}
              onChange={(e) => updateNum('breatheHold', parseInt(e.target.value) || 4, 1, 30)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold">EXHALAR (segundos)</label>
            <input type="number" min={1} max={30} value={settings.breatheExhale}
              onChange={(e) => updateNum('breatheExhale', parseInt(e.target.value) || 4, 1, 30)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-neutral-900 pb-3">
          <ListTodo className="w-5 h-5 stroke-[2.5]" />
          <h2 className="text-lg font-black uppercase">Agenda (Cahuitl)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold">HORA DE INICIO</label>
            <input type="time" value={settings.scheduleStart}
              onChange={(e) => updateStr('scheduleStart', e.target.value)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold">HORA DE FIN</label>
            <input type="time" value={settings.scheduleEnd}
              onChange={(e) => updateStr('scheduleEnd', e.target.value)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold">INTERVALO</label>
            <select value={settings.scheduleInterval}
              onChange={(e) => updateNum('scheduleInterval', parseInt(e.target.value), 15, 120)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none bg-white">
              {intervalOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button onClick={handleSave}
        className="inline-flex items-center gap-2 bg-neutral-900 text-white font-bold text-sm px-6 py-3 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
        <Save className="w-4 h-4 stroke-[2.5]" /> GUARDAR CONFIGURACIÓN
      </button>
    </div>
  )
}
