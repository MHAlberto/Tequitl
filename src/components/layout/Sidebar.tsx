import React from 'react'
import {
  Flame,
  LayoutDashboard,
  Layers,
  Timer,
  Calendar,
  FileText,
  CheckSquare,
  Wind,
  History,
  Database,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  ListTodo,
} from 'lucide-react'

interface SidebarProps {
  currentView: string
  setCurrentView: (view: string) => void
  weekNumber: number
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}

export default function Sidebar({ currentView, setCurrentView, collapsed, setCollapsed }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'INICIO (APPS)', icon: LayoutDashboard },
    { id: 'tracker_list', label: 'HÁBITOS', icon: Layers },
    { id: 'pomodoro', label: 'POMODORO', icon: Timer },
    { id: 'calendar', label: 'CALENDARIO', icon: Calendar },
    { id: 'notes', label: 'NOTAS', icon: FileText },
    { id: 'kanban', label: 'TAREAS', icon: CheckSquare },
    { id: 'breathe', label: 'RESPIRO', icon: Wind },
    { id: 'weight', label: 'PESO', icon: Scale },
    { id: 'schedule', label: 'AGENDA', icon: ListTodo },
    { id: 'history', label: 'HISTORIAL', icon: History },
    { id: 'config', label: 'CONFIG', icon: Settings },
    { id: 'settings', label: 'DATOS', icon: Database },
  ]

  const isActive = (navId: string) => {
    if (navId === 'tracker_list') return currentView.startsWith('tracker')
    return currentView === navId
  }

  if (collapsed) {
    return (
      <aside className="w-14 bg-white border-r-2 border-neutral-900 flex flex-col items-center justify-between py-3 z-10 shrink-0 transition-all duration-200">
        <div className="space-y-1">
          <div className="mb-3 flex justify-center">
            <Flame className="w-6 h-6 stroke-[2.5] fill-neutral-900" />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.id)
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center border-2 border-neutral-900 transition-all ${
                  active
                    ? 'bg-neutral-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setCollapsed(false)}
          className="w-10 h-10 flex items-center justify-center border-2 border-neutral-900 bg-white hover:bg-neutral-100 transition-colors"
          title="Expandir sidebar"
        >
          <PanelLeftOpen className="w-4 h-4 stroke-[2.5]" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-64 bg-white border-r-2 border-neutral-900 flex flex-col justify-between p-5 z-10 shrink-0 transition-all duration-200">
      <div>
        <div className="pb-5 border-b-2 border-neutral-900 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-2xl tracking-wider">
              <Flame className="w-7 h-7 stroke-[2.5] fill-neutral-900" />
              <span>TEQUITL</span>
            </div>
            <span className="text-[10px] font-mono bg-neutral-900 text-white font-bold px-1.5 py-0.5 uppercase">
              2026
            </span>
          </div>
          <p className="text-[11px] font-mono text-neutral-600 mt-1 uppercase tracking-widest font-semibold">
            Suite de Productividad
          </p>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 border-2 border-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              title="Colapsar sidebar"
            >
              <PanelLeftClose className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.id)
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="border-t-2 border-neutral-900 pt-4 space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between text-neutral-600">
          <span>AÑO EN CURSO</span>
          <span className="font-bold text-neutral-900">2026</span>
        </div>
        <div className="flex items-center justify-between text-neutral-600">
          <span>VERSIÓN</span>
          <span className="font-bold text-neutral-900">1.0.1</span>
        </div>
      </div>
    </aside>
  )
}
