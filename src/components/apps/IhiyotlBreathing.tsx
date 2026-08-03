import React, { useState, useEffect } from 'react'
import type { AppSettings } from '../../types/global'

interface IhiyotlBreathingProps {
  settings: AppSettings
}

export default function IhiyotlBreathing({ settings }: IhiyotlBreathingProps) {
  const inhaleTime = settings.breatheInhale
  const holdTime = settings.breatheHold
  const exhaleTime = settings.breatheExhale

  const phaseDurations = { Inhala: inhaleTime, Sostén: holdTime, Exhala: exhaleTime }

  const [phase, setPhase] = useState<'Inhala' | 'Sostén' | 'Exhala'>('Inhala')
  const [seconds, setSeconds] = useState(phaseDurations['Inhala'])
  const [isActive, setIsActive] = useState(false)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev > 1) return prev - 1
          if (phase === 'Inhala') {
            setPhase('Sostén')
            return phaseDurations['Sostén']
          } else if (phase === 'Sostén') {
            setPhase('Exhala')
            return phaseDurations['Exhala']
          } else {
            setPhase('Inhala')
            setCycles((c) => c + 1)
            return phaseDurations['Inhala']
          }
        })
      }, 1000)
    } else {
      setPhase('Inhala')
      setSeconds(phaseDurations['Inhala'])
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, phase, inhaleTime, holdTime, exhaleTime])

  const reset = () => {
    setIsActive(false)
    setPhase('Inhala')
    setSeconds(phaseDurations['Inhala'])
    setCycles(0)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      <div className="border-b-2 border-neutral-900 pb-5">
        <span className="neo-badge">IHIYOTL · PAUSA CONSCIENTE</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">EJERCICIO DE RESPIRACIÓN</h1>
        <p className="text-sm font-mono text-neutral-600 mt-1">Oxigena tu cerebro para restaurar tu foco mental.</p>
      </div>

      <div className="bg-white border-2 border-neutral-900 p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center space-y-8">
        <div
          className={`w-48 h-48 border-4 border-neutral-900 flex flex-col items-center justify-center transition-all duration-1000 ${
            phase === 'Inhala'
              ? 'scale-110 bg-neutral-900 text-white'
              : phase === 'Sostén'
              ? 'scale-105 bg-neutral-200 text-neutral-900'
              : 'scale-90 bg-white text-neutral-900'
          }`}
        >
          <div className="font-black text-xl uppercase tracking-widest">{phase}</div>
          <div className="font-mono text-4xl font-bold mt-2">{seconds}s</div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="bg-neutral-900 text-white font-black text-sm px-8 py-3 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
          >
            {isActive ? 'DETENER PAUSA' : 'INICIAR GUÍA'}
          </button>
          {!isActive && cycles > 0 && (
            <button
              onClick={reset}
              className="block mx-auto text-xs font-mono font-bold text-neutral-500 hover:text-neutral-900 underline mt-2"
            >
              Reiniciar contador
            </button>
          )}
          <div className="text-xs font-mono text-neutral-500 space-y-1 pt-2">
            <p>Ritmo {inhaleTime}-{holdTime}-{exhaleTime}: Inhala {inhaleTime}s, Sostén {holdTime}s, Exhala {exhaleTime}s.</p>
            {cycles > 0 && (
              <p className="font-bold text-neutral-900">Ciclos completados: {cycles}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
