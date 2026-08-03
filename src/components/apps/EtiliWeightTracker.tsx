import React, { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { WeightLog } from '../../types/global'

export default function EtiliWeightTracker() {
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const result = await window.electronAPI.getWeightLogs()
        setLogs(result || [])
      } catch { setLogs([]) }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0) return

    try {
      if (editingId) {
        const result = await window.electronAPI.updateWeightLog(editingId, w, note)
        setLogs(result)
        setEditingId(null)
      } else {
        const result = await window.electronAPI.addWeightLog(w, date, note)
        setLogs(result)
      }
    } catch {
      // Fallback local
      if (editingId) {
        setLogs(logs.map((l) => (l.id === editingId ? { ...l, weight: w, note } : l)))
        setEditingId(null)
      } else {
        const newLog: WeightLog = { id: `w_${Date.now()}`, weight: w, log_date: date, note, created_at: new Date().toISOString() }
        setLogs([newLog, ...logs])
      }
    }
    setWeight('')
    setNote('')
    setDate(new Date().toISOString().slice(0, 10))
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await window.electronAPI.deleteWeightLog(id)
      setLogs(result)
    } catch {
      setLogs(logs.filter((l) => l.id !== id))
    }
  }

  const handleEdit = (log: WeightLog) => {
    setWeight(log.weight.toString())
    setDate(log.log_date)
    setNote(log.note)
    setEditingId(log.id)
  }

  // Trend calculation
  const sortedLogs = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date))
  const latest = sortedLogs[sortedLogs.length - 1]
  const previous = sortedLogs.length >= 2 ? sortedLogs[sortedLogs.length - 2] : null
  const trend = latest && previous
    ? latest.weight < previous.weight ? 'down' : latest.weight > previous.weight ? 'up' : 'same'
    : null

  // Min/Max/Avg
  const weights = sortedLogs.map((l) => l.weight)
  const minWeight = weights.length ? Math.min(...weights).toFixed(1) : '-'
  const maxWeight = weights.length ? Math.max(...weights).toFixed(1) : '-'
  const avgWeight = weights.length ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : '-'

  const TrendIcon = trend === 'down' ? TrendingDown : trend === 'up' ? TrendingUp : Minus
  const trendColor = trend === 'down' ? 'text-green-600' : trend === 'up' ? 'text-red-600' : 'text-neutral-400'
  const trendLabel = trend === 'down' ? 'Bajando' : trend === 'up' ? 'Subiendo' : 'Estable'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b-2 border-neutral-900 pb-5">
        <span className="neo-badge">ETILI · REGISTRO DE PESO</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">TRACKER DE PESO</h1>
        <p className="text-sm font-mono text-neutral-600 mt-1">Registra tu peso diario y sigue tu evolución.</p>
      </div>

      {/* Stats bar */}
      {sortedLogs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border-2 border-neutral-900 p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[10px] font-mono text-neutral-500">ACTUAL</div>
            <div className="font-black text-lg">{latest?.weight.toFixed(1)} kg</div>
          </div>
          <div className="bg-white border-2 border-neutral-900 p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[10px] font-mono text-neutral-500">TENDENCIA</div>
            <div className={`font-black text-lg flex items-center justify-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" /> {trendLabel}
            </div>
          </div>
          <div className="bg-white border-2 border-neutral-900 p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[10px] font-mono text-neutral-500">PROMEDIO</div>
            <div className="font-black text-lg">{avgWeight} kg</div>
          </div>
          <div className="bg-white border-2 border-neutral-900 p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[10px] font-mono text-neutral-500">MÍNIMO</div>
            <div className="font-black text-lg">{minWeight} kg</div>
          </div>
          <div className="bg-white border-2 border-neutral-900 p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[10px] font-mono text-neutral-500">MÁXIMO</div>
            <div className="font-black text-lg">{maxWeight} kg</div>
          </div>
        </div>
      )}

      {/* Sparkline chart */}
      {weights.length >= 2 && (
        <div className="bg-white border-2 border-neutral-900 p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-xs uppercase border-b-2 border-neutral-900 pb-2 mb-4">GRÁFICO DE EVOLUCIÓN</h3>
          <div className="h-32 flex items-end gap-1">
            {sortedLogs.map((log) => {
              const min = Math.min(...weights)
              const max = Math.max(...weights)
              const range = max - min || 1
              const h = ((log.weight - min) / range) * 90 + 10
              return (
                <div key={log.id} className="flex-1 flex flex-col items-center justify-end h-full" title={`${log.log_date}: ${log.weight}kg`}>
                  <div
                    className="w-full bg-neutral-900 border border-neutral-900 min-h-[2px]"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[8px] font-mono text-neutral-500 mt-1 truncate w-full text-center">
                    {log.log_date.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="bg-white border-2 border-neutral-900 p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <h3 className="font-black text-sm uppercase border-b-2 border-neutral-900 pb-2">
          {editingId ? 'EDITAR REGISTRO' : 'NUEVO REGISTRO'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold">PESO (kg)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              placeholder="70.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold">FECHA</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold">NOTA</label>
            <input
              type="text"
              placeholder="Ayuno / Post-entreno..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border-2 border-neutral-900 p-3 font-mono text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-neutral-900 text-white font-bold text-xs py-3 px-4 border-2 border-neutral-900 hover:bg-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {editingId ? 'ACTUALIZAR' : 'REGISTRAR'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setWeight(''); setNote('') }}
                className="px-3 py-3 border-2 border-neutral-900 text-xs font-mono font-bold hover:bg-neutral-100"
              >
                X
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Logs table */}
      <div className="bg-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-900 bg-neutral-100 text-neutral-900 font-black text-xs uppercase tracking-wider">
              <th className="p-4 border-r-2 border-neutral-900">FECHA</th>
              <th className="p-4 border-r-2 border-neutral-900">PESO</th>
              <th className="p-4 border-r-2 border-neutral-900">NOTA</th>
              <th className="p-4 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-sm font-mono text-neutral-500">
                  Sin registros de peso aún. ¡Agrega tu primer peso!
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b-2 border-neutral-900 last:border-b-0 hover:bg-neutral-50 transition-colors">
                  <td className="p-4 border-r-2 border-neutral-900 font-mono text-sm">
                    {new Date(log.log_date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 border-r-2 border-neutral-900 font-mono text-sm font-bold">
                    {log.weight.toFixed(1)} kg
                  </td>
                  <td className="p-4 border-r-2 border-neutral-900 font-mono text-xs text-neutral-600">
                    {log.note || '-'}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(log)}
                        className="text-[10px] font-mono font-bold border border-neutral-900 px-2 py-0.5 hover:bg-neutral-100"
                      >
                        EDITAR
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
