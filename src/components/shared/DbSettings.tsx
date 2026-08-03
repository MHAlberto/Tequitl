import React, { useState } from 'react'
import { Download, Upload, Database } from 'lucide-react'

export default function DbSettings() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    setMessage('')
    try {
      const result = await window.electronAPI.exportDatabase()
      if (result) {
        setMessage('Base de datos exportada exitosamente.')
      } else {
        setMessage('Exportación cancelada.')
      }
    } catch (err) {
      setMessage('Error al exportar la base de datos.')
    }
    setLoading(false)
  }

  const handleImport = async () => {
    setLoading(true)
    setMessage('')
    try {
      const result = await window.electronAPI.importDatabase()
      if (result) {
        setMessage('Base de datos importada exitosamente. Reinicia la app si es necesario.')
        // Reload all data
        window.location.reload()
      } else {
        setMessage('Importación cancelada.')
      }
    } catch (err) {
      setMessage('Error al importar la base de datos.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b-2 border-neutral-900 pb-5">
        <span className="neo-badge">DATOS · GESTIÓN DE BASE DE DATOS</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">
          RESPALDO Y RESTAURACIÓN
        </h1>
        <p className="text-sm font-mono text-neutral-600 mt-1">
          Exporta o importa tu base de datos SQLite para migrar entre dispositivos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-neutral-900 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center space-y-4">
          <div className="w-16 h-16 border-2 border-neutral-900 bg-neutral-100 flex items-center justify-center mx-auto">
            <Download className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-black uppercase">Exportar Base de Datos</h2>
          <p className="text-xs font-mono text-neutral-600">
            Guarda una copia de seguridad de todos tus datos en un archivo .db
          </p>
          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-neutral-900 text-white font-bold text-sm px-6 py-3 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? 'EXPORTANDO...' : 'EXPORTAR DB'}
          </button>
        </div>

        <div className="bg-white border-2 border-neutral-900 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center space-y-4">
          <div className="w-16 h-16 border-2 border-neutral-900 bg-neutral-100 flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-black uppercase">Importar Base de Datos</h2>
          <p className="text-xs font-mono text-neutral-600">
            Restaura tus datos desde un archivo .db previamente exportado
          </p>
          <button
            onClick={handleImport}
            disabled={loading}
            className="bg-neutral-900 text-white font-bold text-sm px-6 py-3 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? 'IMPORTANDO...' : 'IMPORTAR DB'}
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-white border-2 border-neutral-900 p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-mono text-xs font-bold">
          <Database className="w-4 h-4 inline mr-2" />
          {message}
        </div>
      )}
    </div>
  )
}
