import React from 'react'
import type { Tracker } from '../../types/global'
import { BarChart2 } from 'lucide-react'

interface MahuizotlAnalyticsProps {
  trackers: Tracker[]
}

export default function MahuizotlAnalytics({ trackers }: MahuizotlAnalyticsProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b-2 border-neutral-900 pb-5">
        <span className="neo-badge">MAHUIZOTL · HISTORIAL DE SEGUIMIENTO</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">REGISTROS Y DESEMPEÑO</h1>
        <p className="text-sm font-mono text-neutral-600 mt-1">Consolidado de todas las actividades e hitos completados en 2026.</p>
      </div>

      <div className="space-y-6">
        {trackers.map((tracker) => {
          const loggedWeeksKeys = Object.keys(tracker.logs)

          return (
            <div key={tracker.id} className="bg-white border-2 border-neutral-900 p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-3">
                <h2 className="text-xl font-black uppercase">{tracker.title}</h2>
                <span className="font-mono text-xs font-bold bg-neutral-100 border border-neutral-900 px-2.5 py-1">
                  {tracker.activities.length} Actividades
                </span>
              </div>

              {loggedWeeksKeys.length === 0 ? (
                <p className="text-xs font-mono text-neutral-500 py-2">Sin registros completados en semanas anteriores.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {loggedWeeksKeys.map((wKey) => {
                    const parts = wKey.split('_')
                    const wNum = parts[1]
                    const weekLog = tracker.logs[wKey]
                    let totalChecks = 0
                    const maxPossible = tracker.activities.length * 7

                    tracker.activities.forEach((a) => {
                      const days = weekLog[a.id] || []
                      totalChecks += days.filter(Boolean).length
                    })

                    const pct = maxPossible > 0 ? Math.round((totalChecks / maxPossible) * 100) : 0

                    return (
                      <div key={wKey} className="border-2 border-neutral-900 p-4 bg-neutral-50 space-y-2 font-mono">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>SEMANA N° {wNum} (2026)</span>
                          <span>{pct}% COMPLETADO</span>
                        </div>
                        <div className="w-full h-3 border border-neutral-900 bg-white overflow-hidden">
                          <div className="h-full bg-neutral-900" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-[11px] text-neutral-500 text-right">
                          {totalChecks} de {maxPossible} marcas realizadas
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {trackers.length === 0 && (
          <div className="text-center py-16 font-mono text-sm text-neutral-500 border-2 border-neutral-900 p-8 bg-white">
            <BarChart2 className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
            <p className="font-bold">Sin datos de seguimiento aún.</p>
            <p className="mt-1">Crea trackers de hábitos y registra tu progreso semanal.</p>
          </div>
        )}
      </div>
    </div>
  )
}
