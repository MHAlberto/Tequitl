import React, { useState, useEffect } from 'react'
import { Plus, Pin, Search } from 'lucide-react'
import type { Note } from '../../types/global'

export default function AmoxtliNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const result = await window.electronAPI.getNotes()
        setNotes(result || [])
      } catch {
        setNotes([])
      }
    }
    load()
  }, [])

  const handleCreateNote = async () => {
    const newNote = {
      id: `n_${Date.now()}`,
      title: 'Nueva Nota',
      content: '',
      tag: 'General',
      pinned: false,
    }
    try {
      const result = await window.electronAPI.saveNote(newNote)
      setNotes(result)
    } catch {
      const fallback: Note = { ...newNote, pinned: 0, updated_at: new Date().toISOString() }
      setNotes([fallback, ...notes])
    }
    setActiveNoteId(newNote.id)
  }

  const activeNote = notes.find((n) => n.id === activeNoteId) || null

  const handleUpdate = async (id: string, field: string, value: string | boolean) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    const updated = { ...note, [field]: value }
    try {
      const result = await window.electronAPI.saveNote({
        id: updated.id,
        title: updated.title,
        content: updated.content,
        tag: updated.tag,
        pinned: typeof updated.pinned === 'number' ? updated.pinned === 1 : updated.pinned,
      })
      setNotes(result)
    } catch {
      setNotes(notes.map((n) => (n.id === id ? updated : n)))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await window.electronAPI.deleteNote(id)
      setNotes(result)
      if (activeNoteId === id) setActiveNoteId(result[0]?.id || null)
    } catch {
      setNotes(notes.filter((n) => n.id !== id))
      if (activeNoteId === id) setActiveNoteId(null)
    }
  }

  const filteredNotes = search
    ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
    : notes

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b-2 border-neutral-900 pb-5">
        <span className="neo-badge">AMOXTLI · BORRADOR & NOTAS</span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">LIBRO DE APUNTES</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-neutral-900 p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs font-mono">MIS NOTAS</span>
            <button onClick={handleCreateNote} className="p-1 border-2 border-neutral-900 bg-neutral-100 hover:bg-neutral-200">
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-neutral-900 pl-7 pr-2 py-1.5 font-mono text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredNotes.map((n) => (
              <div
                key={n.id}
                onClick={() => setActiveNoteId(n.id)}
                className={`p-3 border-2 border-neutral-900 cursor-pointer font-mono text-xs transition-all ${
                  activeNoteId === n.id
                    ? 'bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span className="truncate">{n.title}</span>
                  {(n.pinned === 1 || n.pinned === true) && <Pin className="w-3 h-3 fill-current shrink-0" />}
                </div>
                <p className={`text-[10px] truncate mt-1 ${activeNoteId === n.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {n.content || 'Escribe aquí...'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
          {activeNote ? (
            <div className="space-y-4">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdate(activeNote.id, 'title', e.target.value)}
                placeholder="TÍTULO DE LA NOTA"
                className="w-full text-xl font-black uppercase border-b-2 border-neutral-900 pb-2 focus:outline-none"
              />
              <textarea
                rows={12}
                value={activeNote.content}
                onChange={(e) => handleUpdate(activeNote.id, 'content', e.target.value)}
                placeholder="Empieza a redactar tus ideas..."
                className="w-full font-mono text-xs border-2 border-neutral-900 p-4 focus:outline-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-xs font-mono pt-2">
                <span className="text-neutral-500">
                  {activeNote.content.length} caracteres · {activeNote.content.split(/\s+/).filter(Boolean).length} palabras
                </span>
                <button
                  onClick={() => handleDelete(activeNote.id)}
                  className="text-red-600 font-bold border-2 border-red-600 px-3 py-1 hover:bg-red-50"
                >
                  ELIMINAR NOTA
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs font-mono text-neutral-500 py-10 text-center">Selecciona o crea una nota para empezar.</p>
          )}
        </div>
      </div>
    </div>
  )
}
