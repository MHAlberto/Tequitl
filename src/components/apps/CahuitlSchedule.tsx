import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Plus, Trash2, Pencil, Check, X, ChevronLeft, ChevronRight, Clock, Calendar, RefreshCw } from 'lucide-react'
import type { ScheduleEntry, ScheduleTemplate, AppSettings } from '../../types/global'

const ALL_DAYS = [
  { key: 'lun', label: 'LUN' },
  { key: 'mar', label: 'MAR' },
  { key: 'mie', label: 'MIÉ' },
  { key: 'jue', label: 'JUE' },
  { key: 'vie', label: 'VIE' },
  { key: 'sab', label: 'SÁB' },
  { key: 'dom', label: 'DOM' },
]

interface CahuitlScheduleProps {
  settings: AppSettings
}

function generateSlots(start: string, end: string, intervalMin: number): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let current = sh * 60 + sm
  const endMin = eh * 60 + em
  while (current <= endMin) {
    const h = Math.floor(current / 60)
    const m = current % 60
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    current += intervalMin
  }
  return slots
}

function getCurrentSlot(slots: string[]): string | null {
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const nowStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  for (let i = slots.length - 1; i >= 0; i--) {
    const [h, m] = slots[i].split(':').map(Number)
    if (h * 60 + m <= mins) return slots[i]
  }
  return null
}

export default function CahuitlSchedule({ settings }: CahuitlScheduleProps) {
  const [view, setView] = useState<'day' | 'week'>('day')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [entries, setEntries] = useState<ScheduleEntry[]>([])
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [newActivity, setNewActivity] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editingTplId, setEditingTplId] = useState<string | null>(null)
  const [editTplText, setEditTplText] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const todayRowRef = useRef<HTMLDivElement>(null)

  const slots = useMemo(
    () => generateSlots(settings.scheduleStart, settings.scheduleEnd, settings.scheduleInterval),
    [settings.scheduleStart, settings.scheduleEnd, settings.scheduleInterval]
  )

  const isToday = date === currentTime.toISOString().slice(0, 10)
  const currentSlot = useMemo(() => isToday ? getCurrentSlot(slots) : null, [isToday, slots, currentTime])

  // Tick current time every minute
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  // Auto-scroll to current time slot
  useEffect(() => {
    if (view === 'day' && isToday && currentSlot && todayRowRef.current) {
      todayRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [view, isToday, currentSlot])

  const loadEntries = useCallback(async (d: string) => {
    try { setEntries(await window.electronAPI.getScheduleEntries(d) || []) } catch { setEntries([]) }
  }, [])

  const loadTemplates = useCallback(async () => {
    try { setTemplates(await window.electronAPI.getScheduleTemplates() || []) } catch { setTemplates([]) }
  }, [])

  useEffect(() => { loadEntries(date) }, [date, loadEntries])
  useEffect(() => { loadTemplates() }, [loadTemplates])

  const dayOfWeekShort = useMemo(() => {
    const d = new Date(date + 'T00:00:00')
    return ALL_DAYS[(d.getDay() + 6) % 7]?.key || 'lun'
  }, [date])

  const mergedSlots = useMemo(() => {
    return slots.map((slot) => {
      const oneOff = entries.find((e) => e.time_slot === slot)
      const recurring = templates.filter(
        (t) => t.time_slot === slot && JSON.parse(t.days || '[]').includes(dayOfWeekShort)
      )
      return { slot, oneOff, recurring }
    })
  }, [slots, entries, templates, dayOfWeekShort])

  const changeDate = (offset: number) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + offset)
    setDate(d.toISOString().slice(0, 10))
  }

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const handleAdd = async (slot: string) => {
    if (!newActivity.trim()) return
    try { setEntries(await window.electronAPI.addScheduleEntry(slot, newActivity.trim(), date)) } catch {}
    setNewActivity(''); setSelectedSlot('')
  }

  const handleDelete = async (id: string) => {
    try { setEntries(await window.electronAPI.deleteScheduleEntry(id, date)) } catch {}
  }

  const handleEdit = (id: string, activity: string) => { setEditingId(id); setEditText(activity) }

  const handleSaveEdit = async (id: string, slot: string) => {
    if (!editText.trim()) return
    try { setEntries(await window.electronAPI.updateScheduleEntry(id, slot, editText.trim(), date)) } catch {}
    setEditingId(null)
  }

  const handleAddTpl = async (slot: string, days: string[]) => {
    if (!newActivity.trim()) return
    try {
      setTemplates(await window.electronAPI.addScheduleTemplate(slot, newActivity.trim(), JSON.stringify(days)))
    } catch {}
    setNewActivity(''); setSelectedSlot('')
  }

  const handleDeleteTpl = async (id: string) => {
    try { setTemplates(await window.electronAPI.deleteScheduleTemplate(id)) } catch {}
  }

  const handleEditTpl = (id: string, activity: string) => { setEditingTplId(id); setEditTplText(activity) }

  const handleSaveTpl = async (id: string, slot: string, days: string) => {
    if (!editTplText.trim()) return
    try {
      setTemplates(await window.electronAPI.updateScheduleTemplate(id, slot, editTplText.trim(), days))
    } catch {}
    setEditingTplId(null)
  }

  const [addDays, setAddDays] = useState<string[]>(['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'])

  const toggleDay = (day: string) => {
    setAddDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])
  }

  const tplBySlot = useMemo(() => {
    const map: Record<string, ScheduleTemplate[]> = {}
    for (const t of templates) {
      if (!map[t.time_slot]) map[t.time_slot] = []
      map[t.time_slot].push(t)
    }
    return map
  }, [templates])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b-2 border-neutral-900 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="neo-badge">CAHUITL · PLANIFICADOR DIARIO</span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">AGENDA POR HORARIOS</h1>
          <p className="text-sm font-mono text-neutral-600 mt-1">
            {settings.scheduleStart} a {settings.scheduleEnd} · Intervalos de {settings.scheduleInterval} min
          </p>
        </div>
        <div className="flex border-2 border-neutral-900">
          <button onClick={() => setView('day')}
            className={`px-4 py-2 font-bold text-xs font-mono ${view === 'day' ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-100'}`}>
            DÍA
          </button>
          <button onClick={() => setView('week')}
            className={`px-4 py-2 font-bold text-xs font-mono border-l-2 border-neutral-900 ${view === 'week' ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-100'}`}>
            RUTINA SEMANAL
          </button>
        </div>
      </div>

      {/* ── Form bar (shared) ── */}
      {selectedSlot && (
        <div className="bg-white border-2 border-neutral-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            {selectedSlot} · {view === 'day' ? dateLabel : 'Rutina semanal'}
          </div>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Actividad..." value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') view === 'day' ? handleAdd(selectedSlot) : handleAddTpl(selectedSlot, addDays)
              }}
              className="flex-1 border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none uppercase" autoFocus />
            <button
              onClick={() => view === 'day' ? handleAdd(selectedSlot) : handleAddTpl(selectedSlot, addDays)}
              className="bg-neutral-900 text-white font-bold text-xs px-5 py-3 border-2 border-neutral-900 hover:bg-neutral-800">
              AGREGAR
            </button>
            <button onClick={() => { setSelectedSlot(''); setNewActivity('') }}
              className="p-3 border-2 border-neutral-900 bg-white hover:bg-neutral-100">
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
          {view === 'week' && (
            <div>
              <div className="text-xs font-mono font-bold mb-2">Repetir los días:</div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DAYS.map((d) => (
                  <button key={d.key} onClick={() => toggleDay(d.key)}
                    className={`px-3 py-1 text-xs font-mono font-bold border-2 border-neutral-900 transition-all ${
                      addDays.includes(d.key) ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-100'
                    }`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DAY VIEW ── */}
      {view === 'day' && (
        <>
          <div className="flex items-center justify-between">
            <button onClick={() => changeDate(-1)}
              className="p-2 border-2 border-neutral-900 bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ChevronLeft className="w-5 h-5 stroke-[3]" />
            </button>
            <div className="text-center">
              <div className="font-black text-base uppercase">{dateLabel}</div>
              {!isToday && (
                <button onClick={() => setDate(currentTime.toISOString().slice(0, 10))}
                  className="text-xs font-mono font-bold underline mt-1">Ir a HOY</button>
              )}
            </div>
            <button onClick={() => changeDate(1)}
              className="p-2 border-2 border-neutral-900 bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          <div className="bg-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            {mergedSlots.map(({ slot, oneOff, recurring }) => {
              const isSelected = selectedSlot === slot
              const isCurrent = isToday && currentSlot === slot
              return (
                <div key={slot}
                  ref={isCurrent ? todayRowRef : null}
                  className={`flex items-start border-b-2 border-neutral-200 last:border-b-0 min-h-[44px] transition-colors ${
                    isCurrent
                      ? 'bg-neutral-200 border-l-4 border-l-neutral-900'
                      : isSelected
                      ? 'bg-neutral-100'
                      : 'hover:bg-neutral-50'
                  }`}>
                  <div className={`w-16 shrink-0 p-2 border-r-2 border-neutral-200 font-mono text-xs text-center ${
                    isCurrent ? 'bg-neutral-300' : ''
                  }`}>
                    <span className="font-black text-neutral-900">
                      {slot}
                    </span>
                    {isCurrent && <div className="text-[8px] font-bold text-neutral-600 mt-0.5">AHORA</div>}
                  </div>
                  <div className="flex-1 p-1.5 flex flex-col gap-0.5">
                    {oneOff && (
                      editingId === oneOff.id ? (
                        <div className="flex items-center gap-1">
                          <input type="text" value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(oneOff.id, slot) }}
                            className="flex-1 border-2 border-neutral-900 px-2 py-1 font-mono text-xs focus:outline-none" autoFocus />
                          <button onClick={() => handleSaveEdit(oneOff.id, slot)}
                            className="p-1 border-2 border-neutral-900 bg-green-500 text-white hover:bg-green-600">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="p-1 border-2 border-neutral-900 bg-white hover:bg-neutral-100">
                            <X className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group">
                          <span className="font-bold text-sm font-mono uppercase bg-white border border-neutral-900 px-2 py-0.5">{oneOff.activity}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(oneOff.id, oneOff.activity)}
                              className="text-neutral-400 hover:text-neutral-900 p-0.5"><Pencil className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(oneOff.id)}
                              className="text-neutral-400 hover:text-red-600 p-0.5"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      )
                    )}
                    {recurring.map((tpl) => (
                      <div key={tpl.id} className="flex items-center justify-between group border border-dashed border-neutral-400 bg-neutral-100 px-2 py-0.5">
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 text-neutral-400" />
                          <span className="text-xs font-mono text-neutral-600">{tpl.activity}</span>
                        </div>
                        <span className="text-[9px] font-mono text-neutral-400 italic">rutina</span>
                      </div>
                    ))}
                    {!oneOff && recurring.length === 0 && !isSelected && (
                      <button onClick={() => { setSelectedSlot(slot); setNewActivity('') }}
                        className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-900 font-mono text-xs transition-colors py-1">
                        <Plus className="w-3 h-3" /> Agregar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── WEEKLY ROUTINE VIEW ── */}
      {view === 'week' && (
        <div className="overflow-x-auto">
          <div className="bg-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] min-w-[700px]">
            <div className="grid grid-cols-[4rem_repeat(7,1fr)] border-b-2 border-neutral-900 bg-neutral-100">
              <div className="p-2" />
              {ALL_DAYS.map((d) => (
                <div key={d.key} className="p-2 text-center font-black text-xs border-l-2 border-neutral-900">{d.label}</div>
              ))}
            </div>
            {slots.map((slot) => {
              const tpls = tplBySlot[slot] || []
              return (
                <div key={slot} className="grid grid-cols-[4rem_repeat(7,1fr)] border-b-2 border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors">
                  <div className="p-2 border-r-2 border-neutral-200 font-mono text-xs text-center font-black text-neutral-600 flex items-center justify-center">
                    {slot}
                  </div>
                  {ALL_DAYS.map((day) => {
                    const dayTpls = tpls.filter((t) => {
                      try { return JSON.parse(t.days || '[]').includes(day.key) } catch { return false }
                    })
                    return (
                      <div key={day.key} className="p-1 border-l-2 border-neutral-200 min-h-[36px] relative group/cell">
                        {dayTpls.map((tpl) => (
                          editingTplId === tpl.id ? (
                            <div key={tpl.id} className="flex items-center gap-1 text-xs">
                              <input type="text" value={editTplText}
                                onChange={(e) => setEditTplText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTpl(tpl.id, slot, tpl.days) }}
                                className="w-full border border-neutral-900 px-1 py-0.5 font-mono text-[10px] focus:outline-none" autoFocus />
                              <button onClick={() => handleSaveTpl(tpl.id, slot, tpl.days)}
                                className="p-0.5 border border-neutral-900 bg-green-500 text-white"><Check className="w-2.5 h-2.5" /></button>
                              <button onClick={() => setEditingTplId(null)}
                                className="p-0.5 border border-neutral-900 bg-white"><X className="w-2.5 h-2.5" /></button>
                            </div>
                          ) : (
                            <div key={tpl.id} className="flex items-center justify-between group/item text-[10px] font-mono bg-neutral-900 text-white px-1 py-0.5 mb-0.5">
                              <span className="truncate">{tpl.activity}</span>
                              <div className="flex items-center gap-0.5 opacity-0 group/item-hover:opacity-100 ml-1 shrink-0">
                                <button onClick={() => {
                                  setEditingTplId(tpl.id)
                                  setEditTplText(tpl.activity)
                                }} className="text-neutral-300 hover:text-white p-0"><Pencil className="w-2.5 h-2.5" /></button>
                                <button onClick={() => handleDeleteTpl(tpl.id)}
                                  className="text-neutral-300 hover:text-red-400 p-0"><Trash2 className="w-2.5 h-2.5" /></button>
                              </div>
                            </div>
                          )
                        ))}
                        <button
                          onClick={() => {
                            setSelectedSlot(slot)
                            setNewActivity('')
                            setAddDays([day.key])
                          }}
                          className="opacity-0 group-hover/cell:opacity-100 flex items-center gap-0.5 text-neutral-400 hover:text-neutral-900 font-mono text-[9px] transition-opacity"
                        >
                          <Plus className="w-2.5 h-2.5" /> +
                        </button>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 p-4 bg-white border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-mono text-xs">
        <Calendar className="w-4 h-4" />
        <span><strong>{entries.length}</strong> actividades puntuales · <strong>{templates.length}</strong> en rutina semanal</span>
      </div>
    </div>
  )
}
