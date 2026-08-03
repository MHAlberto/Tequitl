import React, { useState, useMemo } from 'react'
import { Plus, Trash2, ArrowLeft, ChevronLeft, ChevronRight, Check, Pencil, X } from 'lucide-react'
import type { Tracker, WeekInfo } from '../../types/global'

interface YeyelliTrackersProps {
  trackers: Tracker[]
  setTrackers: React.Dispatch<React.SetStateAction<Tracker[]>>
  weekInfo: WeekInfo
  currentView: string
  setCurrentView: (view: string) => void
  selectedTrackerId: string
  setSelectedTrackerId: (id: string) => void
  currentDate: Date
  setCurrentDate: (d: Date) => void
}

const daysHeader = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO']

export default function YeyelliTrackers({
  trackers,
  setTrackers,
  weekInfo,
  currentView,
  setCurrentView,
  selectedTrackerId,
  setSelectedTrackerId,
  currentDate,
  setCurrentDate,
}: YeyelliTrackersProps) {
  const [newTrackerTitle, setNewTrackerTitle] = useState('')
  const [newActivityName, setNewActivityName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTrackerId, setEditingTrackerId] = useState<string | null>(null)
  const [editTrackerTitle, setEditTrackerTitle] = useState('')
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [editActivityName, setEditActivityName] = useState('')

  const weekKey = `sem_${weekInfo.weekNumber}_${weekInfo.year}`

  const activeTracker = useMemo(
    () => trackers.find((t) => t.id === selectedTrackerId),
    [trackers, selectedTrackerId]
  )

  const activeStats = useMemo(() => {
    if (!activeTracker || activeTracker.activities.length === 0) return { completed: 0, total: 0, percent: 0 }
    const weekLogs = activeTracker.logs[weekKey] || {}
    let completed = 0
    const total = activeTracker.activities.length * 7
    activeTracker.activities.forEach((act) => {
      const days = weekLogs[act.id] || [false, false, false, false, false, false, false]
      completed += days.filter(Boolean).length
    })
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percent }
  }, [activeTracker, weekKey])

  const handleWeekChange = (offset: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + offset * 7)
    setCurrentDate(newDate)
  }

  const handleCreateTracker = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTrackerTitle.trim()) return
    try {
      const result = await window.electronAPI.createTracker(newTrackerTitle.trim())
      setTrackers(result)
      setNewTrackerTitle('')
      setShowCreateModal(false)
      const created = result[0]
      if (created) {
        setSelectedTrackerId(created.id)
        setCurrentView('tracker_detail')
      }
    } catch {
      const newTracker: Tracker = {
        id: `t_${Date.now()}`,
        title: newTrackerTitle.trim(),
        created_at: new Date().toISOString(),
        activities: [],
        logs: {},
      }
      setTrackers([newTracker, ...trackers])
      setNewTrackerTitle('')
      setShowCreateModal(false)
      setSelectedTrackerId(newTracker.id)
      setCurrentView('tracker_detail')
    }
  }

  const handleDeleteTracker = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('¿Estás seguro de eliminar este tracker?')) return
    try {
      const result = await window.electronAPI.deleteTracker(id)
      setTrackers(result)
      if (selectedTrackerId === id) {
        setSelectedTrackerId(result[0]?.id || '')
        setCurrentView('tracker_list')
      }
    } catch {
      setTrackers(trackers.filter((t) => t.id !== id))
    }
  }

  const handleEditTracker = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTrackerId(id)
    setEditTrackerTitle(title)
  }

  const handleSaveTrackerTitle = async (id: string) => {
    if (!editTrackerTitle.trim()) return
    try {
      const result = await window.electronAPI.updateTrackerTitle(id, editTrackerTitle.trim())
      setTrackers(result)
    } catch {
      setTrackers((prev) => prev.map((t) => (t.id === id ? { ...t, title: editTrackerTitle.trim() } : t)))
    }
    setEditingTrackerId(null)
  }

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActivityName.trim() || !selectedTrackerId) return
    try {
      const result = await window.electronAPI.addActivity(selectedTrackerId, newActivityName.trim().toUpperCase())
      setTrackers(result)
    } catch {
      const newAct = { id: `a_${Date.now()}`, tracker_id: selectedTrackerId, name: newActivityName.trim().toUpperCase() }
      setTrackers((prev) =>
        prev.map((t) => (t.id === selectedTrackerId ? { ...t, activities: [...t.activities, newAct] } : t))
      )
    }
    setNewActivityName('')
  }

  const handleDeleteActivity = async (actId: string) => {
    try {
      const result = await window.electronAPI.deleteActivity(actId)
      setTrackers(result)
    } catch {
      setTrackers((prev) =>
        prev.map((t) => (t.id === selectedTrackerId ? { ...t, activities: t.activities.filter((a) => a.id !== actId) } : t))
      )
    }
  }

  const handleEditActivity = (id: string, name: string) => {
    setEditingActivityId(id)
    setEditActivityName(name)
  }

  const handleSaveActivityName = async (id: string) => {
    if (!editActivityName.trim()) return
    try {
      const result = await window.electronAPI.updateActivityName(id, editActivityName.trim().toUpperCase())
      setTrackers(result)
    } catch {
      setTrackers((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTrackerId) return t
          return { ...t, activities: t.activities.map((a) => (a.id === id ? { ...a, name: editActivityName.trim().toUpperCase() } : a)) }
        })
      )
    }
    setEditingActivityId(null)
  }

  const handleToggleDay = async (actId: string, dayIdx: number) => {
    try {
      const result = await window.electronAPI.toggleTrackerLog(actId, weekKey, dayIdx)
      setTrackers(result)
    } catch {
      setTrackers((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTrackerId) return t
          const currentWeekLogs = t.logs[weekKey] || {}
          const currentActArray = currentWeekLogs[actId] || [false, false, false, false, false, false, false]
          const updatedArray = [...currentActArray]
          updatedArray[dayIdx] = !updatedArray[dayIdx]
          return {
            ...t,
            logs: {
              ...t.logs,
              [weekKey]: { ...currentWeekLogs, [actId]: updatedArray },
            },
          }
        })
      )
    }
  }

  // ─── Tracker Detail View ───
  if (currentView === 'tracker_detail' && activeTracker) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView('tracker_list')}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase border-2 border-neutral-900 px-3 py-1.5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER A HÁBITOS
          </button>
          <button
            onClick={() => {
              if (window.confirm('¿Eliminar este tracker y todas sus actividades?')) {
                handleDeleteTracker(activeTracker.id, {} as React.MouseEvent)
                setCurrentView('tracker_list')
              }
            }}
            className="text-xs font-mono font-bold border-2 border-red-600 text-red-600 px-3 py-1.5 bg-white hover:bg-red-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            ELIMINAR TRACKER
          </button>
        </div>

        <div className="bg-white border-2 border-neutral-900 p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="neo-badge">2026 · VISTA DE TRACKER</span>
            <div className="flex items-center gap-2 mt-1 group">
              {editingTrackerId === activeTracker.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editTrackerTitle}
                    onChange={(e) => setEditTrackerTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTrackerTitle(activeTracker.id) }}
                    className="text-2xl font-black uppercase border-2 border-neutral-900 px-2 py-1 focus:outline-none"
                    autoFocus
                  />
                  <button onClick={() => handleSaveTrackerTitle(activeTracker.id)} className="p-1 border-2 border-neutral-900 bg-green-500 text-white hover:bg-green-600">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                  <button onClick={() => setEditingTrackerId(null)} className="p-1 border-2 border-neutral-900 bg-white hover:bg-neutral-100">
                    <X className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-black uppercase text-neutral-900">{activeTracker.title}</h1>
                  <button
                    onClick={(e) => handleEditTracker(activeTracker.id, activeTracker.title, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 border border-neutral-400 hover:border-neutral-900 hover:bg-neutral-100 transition-all"
                    title="Editar nombre"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-neutral-100 border-2 border-neutral-900 p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button onClick={() => handleWeekChange(-1)} className="p-2 border-2 border-neutral-900 bg-white hover:bg-neutral-200 active:bg-neutral-300 transition-colors"
              title="Semana anterior">
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>
            <div className="text-center px-4 min-w-[200px]">
              <div className="font-black text-sm uppercase">SEMANA {weekInfo.weekNumber}</div>
              <div className="text-xs font-mono text-neutral-600 mt-0.5">{weekInfo.periodText}</div>
            </div>
            <button onClick={() => handleWeekChange(1)} className="p-2 border-2 border-neutral-900 bg-white hover:bg-neutral-200 active:bg-neutral-300 transition-colors"
              title="Semana siguiente">
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-neutral-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-neutral-900 bg-neutral-100 flex items-center justify-center font-bold">%</div>
            <div>
              <div className="font-bold text-neutral-900">CUMPLIMIENTO SEMANAL</div>
              <div className="text-neutral-500">{activeStats.completed} de {activeStats.total} casillas marcadas</div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-1/3">
            <div className="flex-1 h-4 border-2 border-neutral-900 bg-neutral-100 overflow-hidden">
              <div className="h-full bg-neutral-900 transition-all duration-300" style={{ width: `${activeStats.percent}%` }} />
            </div>
            <span className="font-black text-sm text-neutral-900">{activeStats.percent}%</span>
          </div>
        </div>

        <div className="bg-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-neutral-900 bg-neutral-100 text-neutral-900 font-black text-xs uppercase tracking-wider">
                <th className="p-4 border-r-2 border-neutral-900">ACTIVIDAD</th>
                {daysHeader.map((day, idx) => (
                  <th key={day} className="p-3 border-r-2 border-neutral-900 last:border-r-0 text-center w-[10.5%]">
                    <div>{day}</div>
                    <div className="text-[10px] font-mono text-neutral-500 font-normal mt-0.5">
                      {new Date(weekInfo.monday.getTime() + idx * 86400000).getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTracker.activities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-sm font-mono text-neutral-500">
                    No hay actividades en este tracker. Agrega actividades abajo.
                  </td>
                </tr>
              ) : (
                activeTracker.activities.map((activity) => {
                  const weekLogs = activeTracker.logs[weekKey] || {}
                  const dayStates = weekLogs[activity.id] || [false, false, false, false, false, false, false]
                  return (
                    <tr key={activity.id} className="border-b-2 border-neutral-900 last:border-b-0 hover:bg-neutral-50 transition-colors">
                      <td className="p-4 border-r-2 border-neutral-900 font-bold text-sm font-mono uppercase bg-white">
                        {editingActivityId === activity.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editActivityName}
                              onChange={(e) => setEditActivityName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveActivityName(activity.id) }}
                              className="flex-1 border-2 border-neutral-900 px-2 py-1 text-sm font-bold focus:outline-none uppercase"
                              autoFocus
                            />
                            <button onClick={() => handleSaveActivityName(activity.id)} className="p-1 border-2 border-neutral-900 bg-green-500 text-white hover:bg-green-600">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </button>
                            <button onClick={() => setEditingActivityId(null)} className="p-1 border-2 border-neutral-900 bg-white hover:bg-neutral-100">
                              <X className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group">
                            <span>{activity.name}</span>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditActivity(activity.id, activity.name)}
                                className="text-neutral-400 hover:text-neutral-900 p-1"
                                title="Editar"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteActivity(activity.id)}
                                className="text-neutral-400 hover:text-red-600 p-1"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      {dayStates.map((isChecked, dayIdx) => (
                        <td key={dayIdx} className="p-3 border-r-2 border-neutral-900 last:border-r-0 text-center align-middle">
                          <button
                            onClick={() => handleToggleDay(activity.id, dayIdx)}
                            className={`w-9 h-9 mx-auto border-2 border-neutral-900 flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-white hover:bg-neutral-100'
                            }`}
                          >
                            <Check className={`w-5 h-5 stroke-[3.5] ${isChecked ? 'block' : 'hidden'}`} />
                          </button>
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleAddActivity} className="flex gap-3 pt-2">
          <input
            type="text"
            placeholder="AGREGAR ACTIVIDAD (EJ. DUOLINGO, GIMNASIO)..."
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            className="flex-1 border-2 border-neutral-900 p-3 font-mono text-sm bg-white focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase"
          />
          <button
            type="submit"
            className="bg-neutral-900 text-white px-6 py-3 font-bold text-sm border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> AÑADIR ACTIVIDAD
          </button>
        </form>
      </div>
    )
  }

  // ─── Tracker List View ───
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-neutral-900 pb-5">
        <div>
          <span className="neo-badge">YEYELLI · TRACKERS DE HÁBITOS</span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">SELECCIONAR TRACKER</h1>
          <p className="text-sm font-mono text-neutral-600 mt-1">Haz clic en un rectángulo para abrir la matriz semanal.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-neutral-900 text-white font-bold text-sm px-5 py-3 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> NUEVO TRACKER
        </button>
      </div>

      {showCreateModal && (
        <div className="p-6 bg-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-lg mx-auto space-y-4">
          <h3 className="font-black text-lg uppercase border-b-2 border-neutral-900 pb-2">Crear Nuevo Tracker</h3>
          <form onSubmit={handleCreateTracker} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold mb-1">NOMBRE DEL TRACKER</label>
              <input
                type="text"
                placeholder="Ej. Tracker 3 Salud & Ejercicio"
                value={newTrackerTitle}
                onChange={(e) => setNewTrackerTitle(e.target.value)}
                className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none focus:ring-0"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-xs font-mono border-2 border-neutral-900 hover:bg-neutral-100">
                CANCELAR
              </button>
              <button type="submit" className="px-5 py-2 text-xs font-bold bg-neutral-900 text-white border-2 border-neutral-900">
                GUARDAR TRACKER
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {trackers.map((tracker, index) => {
          const totalActs = tracker.activities.length
          const weekLogs = tracker.logs[weekKey] || {}
          let weekDone = 0
          tracker.activities.forEach((a) => {
            const days = weekLogs[a.id] || []
            weekDone += days.filter(Boolean).length
          })
          const totalWeekPossible = totalActs * 7
          const pct = totalWeekPossible > 0 ? Math.round((weekDone / totalWeekPossible) * 100) : 0

          return (
            <div key={tracker.id} className="neo-card flex flex-col justify-between min-h-[170px] p-6">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold bg-neutral-100 border border-neutral-900 px-2 py-0.5">
                    RECTÁNGULO #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingTrackerId(tracker.id)
                        setEditTrackerTitle(tracker.title)
                      }}
                      className="border-2 border-neutral-900 px-2 py-0.5 text-xs font-mono font-bold bg-white hover:bg-neutral-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                      EDITAR
                    </button>
                    <button
                      onClick={(e) => handleDeleteTracker(tracker.id, e)}
                      className="border-2 border-red-600 px-2 py-0.5 text-xs font-mono font-bold text-red-600 bg-white hover:bg-red-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                      ELIMINAR
                    </button>
                  </div>
                </div>
                {editingTrackerId === tracker.id ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTrackerTitle}
                      onChange={(e) => setEditTrackerTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTrackerTitle(tracker.id) }}
                      className="flex-1 text-xl font-black uppercase border-2 border-neutral-900 px-2 py-1 focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleSaveTrackerTitle(tracker.id)} className="p-1.5 border-2 border-neutral-900 bg-green-500 text-white hover:bg-green-600">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingTrackerId(null) }} className="p-1.5 border-2 border-neutral-900 bg-white hover:bg-neutral-100">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <h2
                    onClick={() => {
                      setSelectedTrackerId(tracker.id)
                      setCurrentView('tracker_detail')
                    }}
                    className="text-xl font-black uppercase text-neutral-900 cursor-pointer hover:underline decoration-2"
                  >
                    {tracker.title}
                  </h2>
                )}
              </div>
              <div
                onClick={() => {
                  setSelectedTrackerId(tracker.id)
                  setCurrentView('tracker_detail')
                }}
                className="mt-6 pt-4 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-mono cursor-pointer"
              >
                <div className="text-neutral-600">
                  <strong className="text-neutral-900">{totalActs}</strong> Actividades
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900">{pct}% completado</span>
                  <div className="w-12 h-2 border border-neutral-900 bg-neutral-200 overflow-hidden">
                    <div className="h-full bg-neutral-900" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <div
          onClick={() => setShowCreateModal(true)}
          className="bg-neutral-100 border-2 border-dashed border-neutral-900 p-6 cursor-pointer flex flex-col items-center justify-center min-h-[170px] hover:bg-neutral-200/60 transition-all group"
        >
          <div className="w-12 h-12 border-2 border-neutral-900 bg-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="font-bold text-sm uppercase tracking-wider text-neutral-900">+ INGRESAR OTRO TRACKER</span>
        </div>
      </div>
    </div>
  )
}
