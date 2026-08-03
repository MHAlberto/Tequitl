import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '../../types/global'

export default function TonalliCalendar() {
  const today = new Date()
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [newEventTitle, setNewEventTitle] = useState('')

  const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

  useEffect(() => {
    async function load() {
      try {
        const evts = await window.electronAPI.getCalendarEvents()
        setEvents(evts || [])
      } catch { setEvents([]) }
    }
    load()
  }, [])

  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const offsetDays = firstDayOfMonth

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim()) return
    try {
      const evt = { day: selectedDay, month: calMonth + 1, year: calYear, title: newEventTitle, tag: 'Nota' }
      const result = await window.electronAPI.addCalendarEvent(evt)
      setEvents(result)
    } catch {
      const newEvt: CalendarEvent = { id: `e_${Date.now()}`, day: selectedDay, month: calMonth + 1, year: calYear, title: newEventTitle, tag: 'Nota' }
      setEvents([...events, newEvt])
    }
    setNewEventTitle('')
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      const result = await window.electronAPI.deleteCalendarEvent(id)
      setEvents(result)
    } catch {
      setEvents(events.filter((e) => e.id !== id))
    }
  }

  const goToToday = () => {
    setCalMonth(today.getMonth())
    setCalYear(today.getFullYear())
    setSelectedDay(today.getDate())
  }

  const isToday = (day: number) =>
    day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()

  const dayNameHeaders = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

  const dayEvents = events.filter((e) => e.day === selectedDay && e.month === calMonth + 1 && e.year === calYear)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b-2 border-neutral-900 pb-5">
        <span className="neo-badge">TONALLI · CALENDARIO & DÍAS</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">
          {months[calMonth]} {calYear}
        </h1>
        <p className="text-sm font-mono text-neutral-600 mt-1">Planificación de fechas importantes y compromisos.</p>
      </div>

      {calMonth !== today.getMonth() || calYear !== today.getFullYear() ? (
        <button
          onClick={goToToday}
          className="text-xs font-mono font-bold border-2 border-neutral-900 px-3 py-1.5 bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          VOLVER A HOY
        </button>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
                else setCalMonth(calMonth - 1)
              }}
              className="p-1.5 border-2 border-neutral-900 bg-white hover:bg-neutral-100"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>
            <span className="font-black text-sm uppercase">{months[calMonth]} {calYear}</span>
            <button
              onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
                else setCalMonth(calMonth + 1)
              }}
              className="p-1.5 border-2 border-neutral-900 bg-white hover:bg-neutral-100"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center font-black text-xs border-b-2 border-neutral-900 pb-3 mb-3">
            {dayNameHeaders.map((d) => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 font-mono text-sm">
            {[...Array(offsetDays)].map((_, i) => (
              <div key={`empty-${i}`} className="h-14 border border-neutral-200 bg-neutral-50" />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1
              const hasEvent = events.some((e) => e.day === dayNum && e.month === calMonth + 1 && e.year === calYear)
              const isSelected = selectedDay === dayNum
              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-14 border-2 p-1 flex flex-col justify-between cursor-pointer transition-all ${
                    isToday(dayNum)
                      ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                      : isSelected
                      ? 'border-neutral-900 bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-neutral-300 bg-white hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-xs font-bold">{dayNum}</span>
                  {hasEvent && (
                    <div className={`w-2 h-2 ${isToday(dayNum) ? 'bg-white' : 'bg-neutral-900'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h3 className="font-black text-sm uppercase border-b-2 border-neutral-900 pb-2">
            AGENDA {selectedDay}/{calMonth + 1}/{calYear}
          </h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {dayEvents.map((e) => (
              <div key={e.id} className="border-2 border-neutral-900 p-3 bg-neutral-50 font-mono text-xs group">
                <div className="flex items-center justify-between">
                  <span className="bg-neutral-900 text-white px-1.5 py-0.5 text-[10px] font-bold">{e.tag}</span>
                  <button
                    onClick={() => handleDeleteEvent(e.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-bold text-neutral-900 mt-2">{e.title}</div>
              </div>
            ))}
            {dayEvents.length === 0 && (
              <p className="text-xs font-mono text-neutral-500 py-4">Sin eventos para este día.</p>
            )}
          </div>

          <form onSubmit={handleAddEvent} className="pt-4 border-t-2 border-neutral-900 space-y-2">
            <label className="block text-xs font-mono font-bold">AÑADIR EVENTO</label>
            <input
              type="text"
              placeholder="Título del compromiso..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="w-full border-2 border-neutral-900 p-2 font-mono text-xs focus:outline-none"
            />
            <button type="submit" className="w-full bg-neutral-900 text-white font-bold text-xs py-2 border-2 border-neutral-900 hover:bg-neutral-800">
              AGENDAR
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
