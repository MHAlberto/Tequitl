import React, { useState, useEffect } from 'react'
import { Minus, Square, X, Copy } from 'lucide-react'

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    async function check() {
      try { setIsMaximized(await window.electronAPI.isMaximized()) } catch {}
    }
    check()
    const onResize = () => check()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleMinimize = () => {
    try { window.electronAPI.minimize() } catch {}
  }

  const handleMaximize = () => {
    try {
      window.electronAPI.maximize()
      setIsMaximized(!isMaximized)
    } catch {}
  }

  const handleClose = () => {
    try { window.electronAPI.close() } catch {}
  }

  return (
    <div
      className="h-10 bg-neutral-900 text-white flex items-center justify-between select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 pl-3">
        <span className="font-black text-xs tracking-widest uppercase text-neutral-400">
          TEQUITL
        </span>
      </div>

      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleMinimize}
          className="w-12 h-full flex items-center justify-center border-l-2 border-neutral-700 hover:bg-neutral-800 transition-colors"
        >
          <Minus className="w-3.5 h-3.5 stroke-[3]" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-12 h-full flex items-center justify-center border-l-2 border-neutral-700 hover:bg-neutral-800 transition-colors"
        >
          {isMaximized ? (
            <Copy className="w-3 h-3 stroke-[3] rotate-180" />
          ) : (
            <Square className="w-3 h-3 stroke-[3]" />
          )}
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-full flex items-center justify-center border-l-2 border-neutral-700 hover:bg-red-600 hover:border-red-600 transition-colors"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  )
}
