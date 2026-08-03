import React, { useState, useEffect } from 'react'
import type { KanbanTask } from '../../types/global'

export default function TequipanolliKanban() {
  const [tasks, setTasks] = useState<KanbanTask[]>([])
  const [newTaskText, setNewTaskText] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const result = await window.electronAPI.getKanbanTasks()
        setTasks(result || [])
      } catch {
        setTasks([])
      }
    }
    load()
  }, [])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    try {
      const result = await window.electronAPI.createKanbanTask(newTaskText, 'Media')
      setTasks(result)
    } catch {
      const newTask: KanbanTask = {
        id: `k_${Date.now()}`,
        title: newTaskText,
        status: 'todo',
        priority: 'Media',
        created_at: new Date().toISOString(),
      }
      setTasks([...tasks, newTask])
    }
    setNewTaskText('')
  }

  const handleMove = async (id: string, status: 'todo' | 'in_progress' | 'done') => {
    try {
      const result = await window.electronAPI.updateTaskStatus(id, status)
      setTasks(result)
    } catch {
      setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await window.electronAPI.deleteKanbanTask(id)
      setTasks(result)
    } catch {
      setTasks(tasks.filter((t) => t.id !== id))
    }
  }

  const columns: { key: 'todo' | 'in_progress' | 'done'; title: string }[] = [
    { key: 'todo', title: 'POR HACER' },
    { key: 'in_progress', title: 'EN PROGRESO' },
    { key: 'done', title: 'COMPLETADO' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b-2 border-neutral-900 pb-5">
        <span className="neo-badge">TEQUIPANOLLI · TABLERO KANBAN</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">GESTIÓN DE TAREAS</h1>
      </div>

      <form onSubmit={handleAddTask} className="flex gap-3">
        <input
          type="text"
          placeholder="AÑADIR NUEVA TAREA PENDIENTE..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          className="flex-1 border-2 border-neutral-900 p-3 font-mono text-xs uppercase bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
        />
        <button type="submit" className="bg-neutral-900 text-white font-bold text-xs px-6 py-3 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          + AGREGAR
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key)
          return (
            <div key={col.key} className="bg-white border-2 border-neutral-900 p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="font-black text-xs uppercase border-b-2 border-neutral-900 pb-2 flex justify-between items-center">
                <span>{col.title}</span>
                <span className="bg-neutral-900 text-white px-1.5 py-0.5 font-mono text-[10px]">{colTasks.length}</span>
              </div>
              <div className="space-y-3">
                {colTasks.map((t) => (
                  <div key={t.id} className={`border-2 border-neutral-900 p-3 font-mono text-xs space-y-2 ${
                    col.key === 'done' ? 'bg-neutral-100 line-through opacity-75' : 'bg-neutral-50'
                  }`}>
                    <div className="font-bold">{t.title}</div>
                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="border border-neutral-900 px-1 bg-white">{t.priority}</span>
                      <div className="flex gap-2">
                        {col.key === 'todo' && (
                          <button onClick={() => handleMove(t.id, 'in_progress')} className="font-bold underline">PROGRESO →</button>
                        )}
                        {col.key === 'in_progress' && (
                          <>
                            <button onClick={() => handleMove(t.id, 'todo')} className="font-bold underline text-neutral-500">← VOLVER</button>
                            <button onClick={() => handleMove(t.id, 'done')} className="font-bold underline">FINALIZAR ✓</button>
                          </>
                        )}
                        <button onClick={() => handleDelete(t.id)} className="font-bold text-red-500 underline ml-1">X</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
