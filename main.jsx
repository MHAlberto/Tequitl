import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  History, 
  Plus, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  BarChart2, 
  Sparkles,
  Layers,
  Timer,
  FileText,
  CheckSquare,
  Wind,
  Play,
  Pause,
  RotateCcw,
  Tag,
  Clock,
  Pin,
  Flame,
  Search,
  BookOpen
} from 'lucide-react';

 Náhuatl terminology reference
 TEQUITL = Work  Duty  Productive effort
 TONALLI = Day  Spirit  Energy  Calendar
 YEYELLI = Habit  Continuous practice
 TLAHUILTI = Focus  Light  Enlightenment
 AMOXTLI = Book  Document  Notes
 TEQUIPANOLLI = Tasks  Assigned work
 IHIYOTL = Breath  Vital energy
 MAHUIZOTL = Honor  Achievements  Analytics

 Returns detailed week info for 2026
function getWeekInfo(date) {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  
  d.setDate(d.getDate() + 4 - (d.getDay()  7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart)  86400000) + 1)  7);

  const current = new Date(date);
  const dayOfWeek = (current.getDay() + 6) % 7;  Monday = 0, Sunday = 6
  
  const monday = new Date(current);
  monday.setDate(current.getDate() - dayOfWeek);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const startStr = `${monday.getDate()} ${months[monday.getMonth()]}`;
  const endStr = `${sunday.getDate()} ${months[sunday.getMonth()]}`;
  const periodText = `Del ${startStr} al ${endStr} de 2026`;

  return {
    weekNumber weekNo,
    year d.getFullYear(),
    periodText,
    monday,
    sunday
  };
}

export default function App() {
   Navigation 'dashboard'  'tracker_list'  'tracker_detail'  'pomodoro'  'calendar'  'notes'  'kanban'  'breathe'  'history'
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTrackerId, setSelectedTrackerId] = useState('t1');

   Date anchor (Default August 2026)
  const [currentDate, setCurrentDate] = useState(new Date('2026-08-10T000000'));

   ================= 1. TRACKERS  HÁBITOS (Yeyelli) =================
  const [trackers, setTrackers] = useState([
    {
      id 't1',
      title 'Tracker 1 Hábitos Personales',
      activities [
        { id 'a1', name 'INGLÉS' },
        { id 'a2', name 'DUOLINGO' },
        { id 'a3', name 'EJERCICIO' },
        { id 'a4', name 'LECTURA 20 MIN' }
      ],
      logs {
        'sem_33_2026' {
          'a1' [true, true, true, true, false, false, false],
          'a2' [true, true, false, true, true, false, false],
          'a3' [false, true, false, true, false, false, false],
          'a4' [true, true, true, true, true, false, false]
        }
      }
    },
    {
      id 't2',
      title 'Tracker 2 Desarrollo & Proyecto',
      activities [
        { id 'a201', name 'CODIFICAR REFACTOR' },
        { id 'a202', name 'DOCUMENTACIÓN' },
        { id 'a203', name 'REVISIÓN DE REPOSITORIO' }
      ],
      logs {}
    }
  ]);
  const [newTrackerTitle, setNewTrackerTitle] = useState('');
  const [newActivityName, setNewActivityName] = useState('');
  const [showCreateTrackerModal, setShowCreateTrackerModal] = useState(false);

   ================= 2. POMODORO (Tlahuilli) =================
  const [pomoTimeLeft, setPomoTimeLeft] = useState(25  60);
  const [pomoMode, setPomoMode] = useState('work');  'work'  'short'  'long'
  const [pomoIsActive, setPomoIsActive] = useState(false);
  const [pomoSessions, setPomoSessions] = useState(0);
  const [pomoLogs, setPomoLogs] = useState([
    { id 1, type 'Enfoque Profundo', duration 25, date '10 Ago 2026 - 0930 AM' },
    { id 2, type 'Lectura Técnica', duration 25, date '10 Ago 2026 - 1015 AM' }
  ]);

   Pomodoro Timer Effect
  useEffect(() = {
    let interval = null;
    if (pomoIsActive && pomoTimeLeft  0) {
      interval = setInterval(() = {
        setPomoTimeLeft((prev) = prev - 1);
      }, 1000);
    } else if (pomoTimeLeft === 0 && pomoIsActive) {
      setPomoIsActive(false);
      if (pomoMode === 'work') {
        setPomoSessions((s) = s + 1);
        setPomoLogs((prev) = [
          {
            id Date.now(),
            type 'Sesión Completada',
            duration 25,
            date new Date().toLocaleTimeString('es-ES', { hour '2-digit', minute '2-digit' }) + ' - 2026'
          },
          ...prev
        ]);
        setPomoMode('short');
        setPomoTimeLeft(5  60);
      } else {
        setPomoMode('work');
        setPomoTimeLeft(25  60);
      }
    }
    return () = clearInterval(interval);
  }, [pomoIsActive, pomoTimeLeft, pomoMode]);

   ================= 3. CALENDARIO & AGENDA (Tonalli) =================
  const [selectedCalDay, setSelectedCalDay] = useState(10);  Aug 10, 2026
  const [events, setEvents] = useState([
    { id 'e1', day 10, title 'Entrega de Avances de Proyecto', tag 'Prioridad' },
    { id 'e2', day 14, title 'Reunión de Cierre de Semana', tag 'Trabajo' },
    { id 'e3', day 22, title 'Examen de Certificación Inglés', tag 'Estudio' }
  ]);
  const [newEventTitle, setNewEventTitle] = useState('');

   ================= 4. NOTAS & IDEAS (Amoxtli) =================
  const [notes, setNotes] = useState([
    { id 'n1', title 'Principios de Diseño Neo-Brutalista', content 'Utilizar bordes gruesos de 2px, sombras sólidas desfasadas, tipografía sansmono de alto contraste y esquinas rectas.', tag 'Diseño', pinned true },
    { id 'n2', title 'Lista de Libros Agosto 2026', content '1. Deep Work - Cal Newportn2. Atomic Habits - James Clearn3. El Hombre en Busca de Sentido', tag 'Personal', pinned false }
  ]);
  const [activeNoteId, setActiveNoteId] = useState('n1');
  const [noteSearch, setNoteSearch] = useState('');

   ================= 5. TAREAS  KANBAN (Tequipanolli) =================
  const [tasks, setTasks] = useState([
    { id 'k1', title 'Diseñar arquitectura de API', status 'todo', priority 'Alta' },
    { id 'k2', title 'Completar módulos de Pomodoro', status 'done', priority 'Media' },
    { id 'k3', title 'Revisar métricas semanales', status 'in_progress', priority 'Urgente' }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

   ================= 6. RESPIRO  PAUSA (Ihiyotl) =================
  const [breathePhase, setBreathePhase] = useState('Inhala');  'Inhala'  'Sostén'  'Exhala'
  const [breatheSeconds, setBreatheSeconds] = useState(4);
  const [breatheIsActive, setBreatheIsActive] = useState(false);

  useEffect(() = {
    let bInterval = null;
    if (breatheIsActive) {
      bInterval = setInterval(() = {
        setBreatheSeconds((prev) = {
          if (prev  1) return prev - 1;
           Phase shift
          if (breathePhase === 'Inhala') {
            setBreathePhase('Sostén');
            return 4;
          } else if (breathePhase === 'Sostén') {
            setBreathePhase('Exhala');
            return 4;
          } else {
            setBreathePhase('Inhala');
            return 4;
          }
        });
      }, 1000);
    } else {
      setBreathePhase('Inhala');
      setBreatheSeconds(4);
    }
    return () = clearInterval(bInterval);
  }, [breatheIsActive, breathePhase]);

  const weekInfo = useMemo(() = getWeekInfo(currentDate), [currentDate]);
  const weekKey = `sem_${weekInfo.weekNumber}_${weekInfo.year}`;

  const activeTracker = useMemo(
    () = trackers.find((t) = t.id === selectedTrackerId),
    [trackers, selectedTrackerId]
  );

  const handleWeekChange = (offset) = {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset  7);
    setCurrentDate(newDate);
  };

  const handleCreateTracker = (e) = {
    e.preventDefault();
    if (!newTrackerTitle.trim()) return;
    const newTracker = {
      id `t_${Date.now()}`,
      title newTrackerTitle.trim(),
      activities [],
      logs {}
    };
    setTrackers([...trackers, newTracker]);
    setNewTrackerTitle('');
    setShowCreateTrackerModal(false);
    setSelectedTrackerId(newTracker.id);
    setCurrentView('tracker_detail');
  };

  const handleDeleteTracker = (id, e) = {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar este tracker')) {
      setTrackers(trackers.filter(t = t.id !== id));
      if (selectedTrackerId === id) {
        setSelectedTrackerId(trackers[0].id  null);
        setCurrentView('tracker_list');
      }
    }
  };

  const handleAddActivity = (e) = {
    e.preventDefault();
    if (!newActivityName.trim()  !selectedTrackerId) return;
    const newAct = { id `a_${Date.now()}`, name newActivityName.trim().toUpperCase() };
    setTrackers(prev = prev.map(t = {
      if (t.id === selectedTrackerId) {
        return { ...t, activities [...t.activities, newAct] };
      }
      return t;
    }));
    setNewActivityName('');
  };

  const handleDeleteActivity = (actId) = {
    setTrackers(prev = prev.map(t = {
      if (t.id === selectedTrackerId) {
        return { ...t, activities t.activities.filter(a = a.id !== actId) };
      }
      return t;
    }));
  };

  const handleToggleDay = (actId, dayIndex) = {
    setTrackers(prev = prev.map(t = {
      if (t.id !== selectedTrackerId) return t;
      const currentWeekLogs = t.logs[weekKey]  {};
      const currentActArray = currentWeekLogs[actId]  [false, false, false, false, false, false, false];
      const updatedArray = [...currentActArray];
      updatedArray[dayIndex] = !updatedArray[dayIndex];

      return {
        ...t,
        logs {
          ...t.logs,
          [weekKey] {
            ...currentWeekLogs,
            [actId] updatedArray
          }
        }
      };
    }));
  };

  const daysHeader = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

  const activeTrackerStats = useMemo(() = {
    if (!activeTracker  activeTracker.activities.length === 0) return { completed 0, total 0, percent 0 };
    const weekLogs = activeTracker.logs[weekKey]  {};
    let completed = 0;
    const total = activeTracker.activities.length  7;

    activeTracker.activities.forEach(act = {
      const days = weekLogs[act.id]  [false, false, false, false, false, false, false];
      completed += days.filter(Boolean).length;
    });

    const percent = total  0  Math.round((completed  total)  100)  0;
    return { completed, total, percent };
  }, [activeTracker, weekKey]);

   Mini-apps list definition for the Dashboard Grid
  const miniApps = [
    {
      id 'tracker_list',
      title 'Hábitos (Yeyelli)',
      nahuatl 'YEYELLI',
      desc 'Matriz semanal de constancia y seguimiento por hábitos.',
      icon Layers,
      count `${trackers.length} Trackers activos`
    },
    {
      id 'pomodoro',
      title 'Temporizador (Tlahuilli)',
      nahuatl 'TLAHUILTI',
      desc 'Reloj Pomodoro para máxima concentración y bloques de trabajo.',
      icon Timer,
      count `${pomoSessions} Sesiones hoy`
    },
    {
      id 'calendar',
      title 'Calendario (Tonalli)',
      nahuatl 'TONALLI',
      desc 'Agenda mensual y mapa de fechas importantes 2026.',
      icon Calendar,
      count `${events.length} Eventos agendados`
    },
    {
      id 'notes',
      title 'Notas & Anotaciones (Amoxtli)',
      nahuatl 'AMOXTLI',
      desc 'Borrador rápido, ideas organizadas y apuntes.',
      icon FileText,
      count `${notes.length} Notas guardadas`
    },
    {
      id 'kanban',
      title 'Tablero de Tareas (Tequipanolli)',
      nahuatl 'TEQUIPANOLLI',
      desc 'Gestión por estados Por hacer, En progreso y Terminado.',
      icon CheckSquare,
      count `${tasks.filter(t = t.status !== 'done').length} Pendientes`
    },
    {
      id 'breathe',
      title 'Pausa & Respiro (Ihiyotl)',
      nahuatl 'IHIYOTL',
      desc 'Guía de respiración rítmica para oxigenar la mente.',
      icon Wind,
      count 'Enfoque guiado'
    }
  ];

  return (
    div className=flex h-screen bg-neutral-100 text-neutral-900 font-sans antialiased select-none overflow-hidden
      
      { ================= SIDEBAR ================= }
      aside className=w-64 bg-white border-r-2 border-neutral-900 flex flex-col justify-between p-5 z-10 shrink-0
        div
          { Brand Header }
          div className=pb-5 border-b-2 border-neutral-900 mb-5
            div className=flex items-center justify-between
              div className=flex items-center gap-2 font-black text-2xl tracking-wider
                Flame className=w-7 h-7 stroke-[2.5] fill-neutral-900 
                spanTEQUITLspan
              div
              span className=text-[10px] font-mono bg-neutral-900 text-white font-bold px-1.5 py-0.5 uppercase
                2026
              span
            div
            p className=text-[11px] font-mono text-neutral-600 mt-1 uppercase tracking-widest font-semibold
              Suite de Productividad
            p
          div

          { Navigation Links }
          nav className=space-y-2
            button
              onClick={() = setCurrentView('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] activetranslate-x-[1px] activetranslate-y-[1px] activeshadow-none transition-all ${
                currentView === 'dashboard'  'bg-neutral-900 text-white'  'bg-white text-neutral-900 hoverbg-neutral-100'
              }`}
            
              span className=flex items-center gap-2.5
                LayoutDashboard className=w-4 h-4 
                INICIO (APPS)
              span
              span className=text-[10px] opacity-75 font-mono01span
            button

            button
              onClick={() = setCurrentView('tracker_list')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] activetranslate-x-[1px] activetranslate-y-[1px] activeshadow-none transition-all ${
                currentView.startsWith('tracker')  'bg-neutral-900 text-white'  'bg-white text-neutral-900 hoverbg-neutral-100'
              }`}
            
              span className=flex items-center gap-2.5
                Layers className=w-4 h-4 
                HÁBITOS
              span
              span className=text-[10px] opacity-75 font-monoYEYELLIspan
            button

            button
              onClick={() = setCurrentView('pomodoro')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] activetranslate-x-[1px] activetranslate-y-[1px] activeshadow-none transition-all ${
                currentView === 'pomodoro'  'bg-neutral-900 text-white'  'bg-white text-neutral-900 hoverbg-neutral-100'
              }`}
            
              span className=flex items-center gap-2.5
                Timer className=w-4 h-4 
                POMODORO
              span
              span className=text-[10px] opacity-75 font-monoFOCUSspan
            button

            button
              onClick={() = setCurrentView('calendar')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] activetranslate-x-[1px] activetranslate-y-[1px] activeshadow-none transition-all ${
                currentView === 'calendar'  'bg-neutral-900 text-white'  'bg-white text-neutral-900 hoverbg-neutral-100'
              }`}
            
              span className=flex items-center gap-2.5
                Calendar className=w-4 h-4 
                CALENDARIO
              span
              span className=text-[10px] opacity-75 font-monoTONALLIspan
            button

            button
              onClick={() = setCurrentView('notes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] activetranslate-x-[1px] activetranslate-y-[1px] activeshadow-none transition-all ${
                currentView === 'notes'  'bg-neutral-900 text-white'  'bg-white text-neutral-900 hoverbg-neutral-100'
              }`}
            
              span className=flex items-center gap-2.5
                FileText className=w-4 h-4 
                NOTAS
              span
              span className=text-[10px] opacity-75 font-monoAMOXTLIspan
            button

            button
              onClick={() = setCurrentView('kanban')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] activetranslate-x-[1px] activetranslate-y-[1px] activeshadow-none transition-all ${
                currentView === 'kanban'  'bg-neutral-900 text-white'  'bg-white text-neutral-900 hoverbg-neutral-100'
              }`}
            
              span className=flex items-center gap-2.5
                CheckSquare className=w-4 h-4 
                TAREAS
              span
              span className=text-[10px] opacity-75 font-monoKANBANspan
            button

            button
              onClick={() = setCurrentView('breathe')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] activetranslate-x-[1px] activetranslate-y-[1px] activeshadow-none transition-all ${
                currentView === 'breathe'  'bg-neutral-900 text-white'  'bg-white text-neutral-900 hoverbg-neutral-100'
              }`}
            
              span className=flex items-center gap-2.5
                Wind className=w-4 h-4 
                RESPIRO
              span
              span className=text-[10px] opacity-75 font-monoIHIYOTLspan
            button

            button
              onClick={() = setCurrentView('history')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] activetranslate-x-[1px] activetranslate-y-[1px] activeshadow-none transition-all ${
                currentView === 'history'  'bg-neutral-900 text-white'  'bg-white text-neutral-900 hoverbg-neutral-100'
              }`}
            
              span className=flex items-center gap-2.5
                History className=w-4 h-4 
                HISTORIAL
              span
              span className=text-[10px] opacity-75 font-monoLOGSspan
            button
          nav
        div

        { Sidebar Footer }
        div className=border-t-2 border-neutral-900 pt-4 space-y-1.5 text-xs font-mono
          div className=flex items-center justify-between text-neutral-600
            spanAÑO EN CURSOspan
            span className=font-bold text-neutral-9002026span
          div
          div className=flex items-center justify-between text-neutral-600
            spanSEMANA ISOspan
            span className=font-bold text-neutral-900N° {weekInfo.weekNumber}span
          div
        div
      aside

      { ================= MAIN CONTENT AREA ================= }
      main className=flex-1 overflow-y-auto bg-neutral-50 p-6 mdp-10
        
        {}
        { ================= VISTA INICIO (DASHBOARD RECTÁNGULOS) ================= }
        {currentView === 'dashboard' && (
          div className=max-w-6xl mx-auto space-y-8
            
            { Header Dashboard }
            div className=border-b-2 border-neutral-900 pb-5 flex flex-col mdflex-row mditems-end justify-between gap-4
              div
                span className=text-xs font-mono font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 tracking-wider
                  TEQUITL · CENTRO DE PRODUCTIVIDAD
                span
                h1 className=text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1
                  TODAS LAS MINI-APPS
                h1
                p className=text-sm font-mono text-neutral-600 mt-1
                  Acceso directo a tus herramientas de trabajo, tiempo y seguimiento.
                p
              div

              div className=flex items-center gap-2 bg-white border-2 border-neutral-900 p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-mono font-bold
                Clock className=w-4 h-4 
                spanSEMANA N° {weekInfo.weekNumber} (2026)span
              div
            div

            { Grid of Mini-Apps Cards }
            div className=grid grid-cols-1 smgrid-cols-2 lggrid-cols-3 gap-6
              {miniApps.map((app) = {
                const IconComponent = app.icon;
                return (
                  div
                    key={app.id}
                    onClick={() = {
                      if (app.id === 'tracker_list') {
                        setCurrentView('tracker_list');
                      } else {
                        setCurrentView(app.id);
                      }
                    }}
                    className=group relative bg-white border-2 border-neutral-900 p-6 cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover-translate-x-1 hover-translate-y-1 hovershadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between min-h-[200px]
                  
                    div
                      div className=flex items-start justify-between gap-2 mb-4
                        span className=font-mono text-xs font-bold bg-neutral-100 border border-neutral-900 px-2 py-0.5
                          {app.nahuatl}
                        span
                        div className=w-9 h-9 border-2 border-neutral-900 bg-neutral-100 flex items-center justify-center group-hoverbg-neutral-900 group-hovertext-white transition-colors
                          IconComponent className=w-5 h-5 stroke-[2.5] 
                        div
                      div

                      h2 className=text-xl font-black uppercase text-neutral-900 group-hoverunderline decoration-2
                        {app.title}
                      h2
                      p className=text-xs font-mono text-neutral-600 mt-2 line-clamp-2
                        {app.desc}
                      p
                    div

                    div className=mt-6 pt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-mono
                      span className=font-bold text-neutral-900{app.count}span
                      span className=font-black group-hovertranslate-x-1 transition-transformABRIR →span
                    div
                  div
                );
              })}
            div

            { Banner Informativo Náhuatl }
            div className=bg-white border-2 border-neutral-900 p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] font-mono text-xs space-y-2
              div className=font-black text-sm uppercase flex items-center gap-2 border-b-2 border-neutral-900 pb-2
                Sparkles className=w-4 h-4  GLOSARIO NÁHUATL DE LA APP
              div
              div className=grid grid-cols-2 mdgrid-cols-4 gap-4 pt-1 text-neutral-700
                divstrong className=text-neutral-900Tequitlstrong Trabajo  Deberdiv
                divstrong className=text-neutral-900Yeyellistrong Hábito  Prácticadiv
                divstrong className=text-neutral-900Tonallistrong Día  Energíadiv
                divstrong className=text-neutral-900Amoxtlistrong Libro  Notasdiv
              div
            div

          div
        )}

        {}
        { ================= VISTA HÁBITOS - LISTA DE TRACKERS ================= }
        {currentView === 'tracker_list' && (
          div className=max-w-5xl mx-auto space-y-8
            div className=flex flex-col smflex-row smitems-center justify-between gap-4 border-b-2 border-neutral-900 pb-5
              div
                span className=text-xs font-mono font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 tracking-wider
                  YEYELLI · TRACKERS DE HÁBITOS
                span
                h1 className=text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1
                  SELECCIONAR TRACKER
                h1
                p className=text-sm font-mono text-neutral-600 mt-1
                  Haz clic en un rectángulo para abrir la matriz semanal o crea uno nuevo.
                p
              div

              button
                onClick={() = setShowCreateTrackerModal(true)}
                className=inline-flex items-center gap-2 bg-neutral-900 text-white font-bold text-sm px-5 py-3 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hoverbg-neutral-800 activetranslate-x-[2px] activetranslate-y-[2px] activeshadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all
              
                Plus className=w-4 h-4 stroke-[3] 
                NUEVO TRACKER
              button
            div

            { Modal Crear Tracker }
            {showCreateTrackerModal && (
              div className=p-6 bg-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-lg mx-auto space-y-4
                h3 className=font-black text-lg uppercase border-b-2 border-neutral-900 pb-2
                  Crear Nuevo Tracker
                h3
                form onSubmit={handleCreateTracker} className=space-y-4
                  div
                    label className=block text-xs font-mono font-bold mb-1NOMBRE DEL TRACKERlabel
                    input
                      type=text
                      placeholder=Ej. Tracker 3 Salud & Ejercicio
                      value={newTrackerTitle}
                      onChange={(e) = setNewTrackerTitle(e.target.value)}
                      className=w-full border-2 border-neutral-900 p-3 font-mono text-sm focusoutline-none focusring-0
                      autoFocus
                    
                  div
                  div className=flex justify-end gap-3 pt-2
                    button
                      type=button
                      onClick={() = setShowCreateTrackerModal(false)}
                      className=px-4 py-2 text-xs font-mono border-2 border-neutral-900 hoverbg-neutral-100
                    
                      CANCELAR
                    button
                    button
                      type=submit
                      className=px-5 py-2 text-xs font-bold bg-neutral-900 text-white border-2 border-neutral-900
                    
                      GUARDAR TRACKER
                    button
                  div
                form
              div
            )}

            { Grid of Trackers Rectangles }
            div className=grid grid-cols-1 smgrid-cols-2 lggrid-cols-2 gap-6
              {trackers.map((tracker, index) = {
                const totalActs = tracker.activities.length;
                const weekLogs = tracker.logs[weekKey]  {};
                let weekDone = 0;
                tracker.activities.forEach(a = {
                  const days = weekLogs[a.id]  [];
                  weekDone += days.filter(Boolean).length;
                });
                const totalWeekPossible = totalActs  7;
                const pct = totalWeekPossible  0  Math.round((weekDone  totalWeekPossible)  100)  0;

                return (
                  div
                    key={tracker.id}
                    onClick={() = {
                      setSelectedTrackerId(tracker.id);
                      setCurrentView('tracker_detail');
                    }}
                    className=group relative bg-white border-2 border-neutral-900 p-6 cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover-translate-x-1 hover-translate-y-1 hovershadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between min-h-[170px]
                  
                    div
                      div className=flex items-start justify-between gap-2 mb-3
                        span className=font-mono text-xs font-bold bg-neutral-100 border border-neutral-900 px-2 py-0.5
                          RECTÁNGULO #{index + 1}
                        span
                        
                        button
                          onClick={(e) = handleDeleteTracker(tracker.id, e)}
                          className=opacity-0 group-hoveropacity-100 text-neutral-400 hovertext-red-600 transition-opacity p-1
                          title=Eliminar Tracker
                        
                          Trash2 className=w-4 h-4 
                        button
                      div

                      h2 className=text-xl font-black uppercase text-neutral-900 group-hoverunderline decoration-2
                        {tracker.title}
                      h2
                    div

                    div className=mt-6 pt-4 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-mono
                      div className=text-neutral-600
                        strong className=text-neutral-900{totalActs}strong Actividades
                      div
                      
                      div className=flex items-center gap-2
                        span className=font-bold text-neutral-900{pct}% completadospan
                        div className=w-12 h-2 border border-neutral-900 bg-neutral-200 overflow-hidden
                          div className=h-full bg-neutral-900 style={{ width `${pct}%` }} 
                        div
                      div
                    div
                  div
                );
              })}

              div
                onClick={() = setShowCreateTrackerModal(true)}
                className=bg-neutral-100 border-2 border-dashed border-neutral-900 p-6 cursor-pointer flex flex-col items-center justify-center min-h-[170px] hoverbg-neutral-20060 transition-all group
              
                div className=w-12 h-12 border-2 border-neutral-900 bg-white flex items-center justify-center mb-2 group-hoverscale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  Plus className=w-6 h-6 stroke-[3] 
                div
                span className=font-bold text-sm uppercase tracking-wider text-neutral-900
                  + INGRESAR OTRO TRACKER
                span
              div
            div
          div
        )}

        {}
        { ================= VISTA DETALLE DE TRACKER SEMANAL ================= }
        {currentView === 'tracker_detail' && activeTracker && (
          div className=max-w-6xl mx-auto space-y-6
            div className=flex items-center justify-between
              button
                onClick={() = setCurrentView('tracker_list')}
                className=inline-flex items-center gap-2 text-xs font-mono font-bold uppercase border-2 border-neutral-900 px-3 py-1.5 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hoverbg-neutral-100
              
                ArrowLeft className=w-4 h-4  VOLVER A HÁBITOS
              button

              div className=text-xs font-mono text-neutral-500
                Página activa strong className=text-neutral-900{activeTracker.title}strong
              div
            div

            { Banner Semana 2026 }
            div className=bg-white border-2 border-neutral-900 p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col mdflex-row mditems-center justify-between gap-4
              div
                span className=text-xs font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 uppercase tracking-wider
                  2026 · VISTA DE TRACKER
                span
                h1 className=text-2xl font-black uppercase text-neutral-900 mt-1
                  {activeTracker.title}
                h1
              div

              { Selector de Semanas 2026 }
              div className=flex items-center gap-3 bg-neutral-100 border-2 border-neutral-900 p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                button
                  onClick={() = handleWeekChange(-1)}
                  className=p-2 border-2 border-neutral-900 bg-white hoverbg-neutral-200 activebg-neutral-300 transition-colors
                  title=Semana Anterior
                
                  ChevronLeft className=w-4 h-4 stroke-[3] 
                button

                div className=text-center px-4 min-w-[200px]
                  div className=font-black text-sm uppercase tracking-wide
                    SEMANA {weekInfo.weekNumber}
                  div
                  div className=text-xs font-mono text-neutral-600 mt-0.5
                    {weekInfo.periodText}
                  div
                div

                button
                  onClick={() = handleWeekChange(1)}
                  className=p-2 border-2 border-neutral-900 bg-white hoverbg-neutral-200 activebg-neutral-300 transition-colors
                  title=Semana Siguiente
                
                  ChevronRight className=w-4 h-4 stroke-[3] 
                button
              div
            div

            { Barra Cumplimiento }
            div className=bg-white border-2 border-neutral-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4 font-mono text-xs
              div className=flex items-center gap-3
                div className=w-8 h-8 border-2 border-neutral-900 bg-neutral-100 flex items-center justify-center font-bold
                  %
                div
                div
                  div className=font-bold text-neutral-900CUMPLIMIENTO SEMANALdiv
                  div className=text-neutral-500
                    {activeTrackerStats.completed} de {activeTrackerStats.total} casillas marcadas
                  div
                div
              div

              div className=flex items-center gap-3 w-13
                div className=flex-1 h-4 border-2 border-neutral-900 bg-neutral-100 overflow-hidden
                  div 
                    className=h-full bg-neutral-900 transition-all duration-300
                    style={{ width `${activeTrackerStats.percent}%` }}
                  
                div
                span className=font-black text-sm text-neutral-900{activeTrackerStats.percent}%span
              div
            div

            { TABLA PRINCIPAL DE ACTIVIDADES (BOCETO) }
            div className=bg-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-x-auto
              table className=w-full text-left border-collapse min-w-[700px]
                thead
                  tr className=border-b-2 border-neutral-900 bg-neutral-100 text-neutral-900 font-black text-xs uppercase tracking-wider
                    th className=p-4 border-r-2 border-neutral-900 w-14
                      ACTIVIDAD
                    th
                    {daysHeader.map((day, idx) = (
                      th 
                        key={day} 
                        className=p-3 border-r-2 border-neutral-900 lastborder-r-0 text-center w-[10.5%]
                      
                        div{day}div
                        div className=text-[10px] font-mono text-neutral-500 font-normal mt-0.5
                          {new Date(weekInfo.monday.getTime() + idx  86400000).getDate()}
                        div
                      th
                    ))}
                  tr
                thead

                tbody
                  {activeTracker.activities.length === 0  (
                    tr
                      td colSpan={8} className=p-12 text-center text-sm font-mono text-neutral-500
                        No hay actividades en este tracker. Agrega actividades en la barra de abajo.
                      td
                    tr
                  )  (
                    activeTracker.activities.map((activity) = {
                      const weekLogs = activeTracker.logs[weekKey]  {};
                      const dayStates = weekLogs[activity.id]  [false, false, false, false, false, false, false];

                      return (
                        tr 
                          key={activity.id} 
                          className=border-b-2 border-neutral-900 lastborder-b-0 hoverbg-neutral-50 transition-colors
                        
                          td className=p-4 border-r-2 border-neutral-900 font-bold text-sm font-mono uppercase bg-white
                            div className=flex items-center justify-between group
                              span{activity.name}span
                              button
                                onClick={() = handleDeleteActivity(activity.id)}
                                className=opacity-0 group-hoveropacity-100 text-neutral-400 hovertext-red-600 transition-opacity p-1
                              
                                Trash2 className=w-3.5 h-3.5 
                              button
                            div
                          td

                          {dayStates.map((isChecked, dayIdx) = (
                            td
                              key={dayIdx}
                              className=p-3 border-r-2 border-neutral-900 lastborder-r-0 text-center align-middle
                            
                              button
                                onClick={() = handleToggleDay(activity.id, dayIdx)}
                                className={`w-9 h-9 mx-auto border-2 border-neutral-900 flex items-center justify-center transition-all ${
                                  isChecked
                                     'bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                     'bg-white hoverbg-neutral-100'
                                }`}
                              
                                Check className={`w-5 h-5 stroke-[3.5] ${isChecked  'block'  'hidden'}`} 
                              button
                            td
                          ))}
                        tr
                      );
                    })
                  )}
                tbody
              table
            div

            { Agregar actividad }
            form onSubmit={handleAddActivity} className=flex gap-3 pt-2
              input
                type=text
                placeholder=AGREGAR ACTIVIDAD (EJ. DUOLINGO, GIMNASIO)...
                value={newActivityName}
                onChange={(e) = setNewActivityName(e.target.value)}
                className=flex-1 border-2 border-neutral-900 p-3 font-mono text-sm bg-white focusoutline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase
              
              button
                type=submit
                className=bg-neutral-900 text-white px-6 py-3 font-bold text-sm border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hoverbg-neutral-800 flex items-center gap-2 transition-all
              
                Plus className=w-4 h-4 stroke-[3] 
                AÑADIR ACTIVIDAD
              button
            form
          div
        )}

        {}
        { ================= VISTA MINI-APP POMODORO (Tlahuilli) ================= }
        {currentView === 'pomodoro' && (
          div className=max-w-4xl mx-auto space-y-8
            div className=border-b-2 border-neutral-900 pb-5
              span className=text-xs font-mono font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 tracking-wider
                TLAHUILTI · TEMPORIZADOR DE ENFOQUE
              span
              h1 className=text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1
                RELOJ POMODORO
              h1
              p className=text-sm font-mono text-neutral-600 mt-1
                Aumenta tu rendimiento con bloques de 25 minutos de concentración.
              p
            div

            div className=grid grid-cols-1 mdgrid-cols-3 gap-6
              { Main Timer Display }
              div className=mdcol-span-2 bg-white border-2 border-neutral-900 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center space-y-6
                
                { Mode Selector }
                div className=flex border-2 border-neutral-900 font-mono text-xs
                  button
                    onClick={() = { setPomoMode('work'); setPomoTimeLeft(25  60); setPomoIsActive(false); }}
                    className={`px-4 py-2 font-bold ${pomoMode === 'work'  'bg-neutral-900 text-white'  'bg-white hoverbg-neutral-100'}`}
                  
                    TRABAJO (25m)
                  button
                  button
                    onClick={() = { setPomoMode('short'); setPomoTimeLeft(5  60); setPomoIsActive(false); }}
                    className={`px-4 py-2 font-bold border-l-2 border-neutral-900 ${pomoMode === 'short'  'bg-neutral-900 text-white'  'bg-white hoverbg-neutral-100'}`}
                  
                    DESCANSO CORTO (5m)
                  button
                  button
                    onClick={() = { setPomoMode('long'); setPomoTimeLeft(15  60); setPomoIsActive(false); }}
                    className={`px-4 py-2 font-bold border-l-2 border-neutral-900 ${pomoMode === 'long'  'bg-neutral-900 text-white'  'bg-white hoverbg-neutral-100'}`}
                  
                    LARGO (15m)
                  button
                div

                { Digital Clock }
                div className=font-mono font-black text-7xl mdtext-8xl tracking-tighter my-4 py-4 px-8 border-2 border-neutral-900 bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  {Math.floor(pomoTimeLeft  60).toString().padStart(2, '0')}
                  {(pomoTimeLeft % 60).toString().padStart(2, '0')}
                div

                { Controls }
                div className=flex items-center gap-4
                  button
                    onClick={() = setPomoIsActive(!pomoIsActive)}
                    className=inline-flex items-center gap-2 bg-neutral-900 text-white font-black text-base px-8 py-4 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hoverbg-neutral-800 activetranslate-x-[2px] activetranslate-y-[2px] activeshadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all
                  
                    {pomoIsActive  Pause className=w-5 h-5 fill-white   Play className=w-5 h-5 fill-white }
                    {pomoIsActive  'PAUSAR'  'INICIAR'}
                  button

                  button
                    onClick={() = {
                      setPomoIsActive(false);
                      setPomoTimeLeft(pomoMode === 'work'  25  60  pomoMode === 'short'  5  60  15  60);
                    }}
                    className=p-4 border-2 border-neutral-900 bg-white hoverbg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                    title=Reiniciar
                  
                    RotateCcw className=w-5 h-5 stroke-[2.5] 
                  button
                div

                div className=text-xs font-mono text-neutral-500 pt-2
                  Sesiones completadas hoy strong className=text-neutral-900 text-sm{pomoSessions}strong
                div
              div

              { History  Session Log }
              div className=bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4
                h3 className=font-black text-sm uppercase border-b-2 border-neutral-900 pb-2 flex items-center justify-between
                  spanHISTORIAL POMODOROspan
                  Timer className=w-4 h-4 
                h3

                div className=space-y-3 max-h-[300px] overflow-y-auto pr-1
                  {pomoLogs.map((log) = (
                    div key={log.id} className=border-2 border-neutral-900 p-3 bg-neutral-50 text-xs font-mono
                      div className=font-bold text-neutral-900{log.type}div
                      div className=text-neutral-500 mt-1 flex justify-between
                        span{log.duration} minutosspan
                        span{log.date}span
                      div
                    div
                  ))}
                div
              div
            div
          div
        )}

        {}
        { ================= VISTA MINI-APP CALENDARIO (Tonalli) ================= }
        {currentView === 'calendar' && (
          div className=max-w-5xl mx-auto space-y-8
            div className=border-b-2 border-neutral-900 pb-5
              span className=text-xs font-mono font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 tracking-wider
                TONALLI · CALENDARIO & DÍAS
              span
              h1 className=text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1
                AGOSTO 2026
              h1
              p className=text-sm font-mono text-neutral-600 mt-1
                Planificación de fechas importantes y compromisos del mes.
              p
            div

            div className=grid grid-cols-1 lggrid-cols-3 gap-6
              { Calendar Grid }
              div className=lgcol-span-2 bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                div className=grid grid-cols-7 text-center font-black text-xs border-b-2 border-neutral-900 pb-3 mb-3
                  divDOMdivdivLUNdivdivMARdivdivMIÉdivdivJUEdivdivVIEdivdivSÁBdiv
                div

                div className=grid grid-cols-7 gap-1 font-mono text-sm
                  { Empty offset slots for August 2026 starting Saturday (6) }
                  {[...Array(6)].map((_, i) = (
                    div key={`empty-${i}`} className=h-14 border border-neutral-200 bg-neutral-50 
                  ))}

                  { Days 1-31 }
                  {[...Array(31)].map((_, i) = {
                    const dayNum = i + 1;
                    const hasEvent = events.some((e) = e.day === dayNum);
                    const isSelected = selectedCalDay === dayNum;

                    return (
                      div
                        key={dayNum}
                        onClick={() = setSelectedCalDay(dayNum)}
                        className={`h-14 border-2 border-neutral-900 p-1 flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                             'bg-neutral-900 text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                             'bg-white hoverbg-neutral-100'
                        }`}
                      
                        span className=text-xs font-bold{dayNum}span
                        {hasEvent && (
                          div className={`w-2 h-2 rounded-none ${isSelected  'bg-white'  'bg-neutral-900'}`} 
                        )}
                      div
                    );
                  })}
                div
              div

              { Day Agenda Details }
              div className=bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4
                h3 className=font-black text-sm uppercase border-b-2 border-neutral-900 pb-2
                  AGENDA PARA {selectedCalDay} DE AGOSTO, 2026
                h3

                div className=space-y-3
                  {events
                    .filter((e) = e.day === selectedCalDay)
                    .map((e) = (
                      div key={e.id} className=border-2 border-neutral-900 p-3 bg-neutral-50 font-mono text-xs
                        span className=bg-neutral-900 text-white px-1.5 py-0.5 text-[10px] font-bold
                          {e.tag}
                        span
                        div className=font-bold text-neutral-900 mt-2{e.title}div
                      div
                    ))}

                  {events.filter((e) = e.day === selectedCalDay).length === 0 && (
                    p className=text-xs font-mono text-neutral-500 py-4
                      Sin eventos programados para este día.
                    p
                  )}
                div

                form
                  onSubmit={(e) = {
                    e.preventDefault();
                    if (!newEventTitle.trim()) return;
                    setEvents([...events, { id `e_${Date.now()}`, day selectedCalDay, title newEventTitle, tag 'Nota' }]);
                    setNewEventTitle('');
                  }}
                  className=pt-4 border-t-2 border-neutral-900 space-y-2
                
                  label className=block text-xs font-mono font-boldAÑADIR EVENTOlabel
                  input
                    type=text
                    placeholder=Título del compromiso...
                    value={newEventTitle}
                    onChange={(e) = setNewEventTitle(e.target.value)}
                    className=w-full border-2 border-neutral-900 p-2 font-mono text-xs focusoutline-none
                  
                  button
                    type=submit
                    className=w-full bg-neutral-900 text-white font-bold text-xs py-2 border-2 border-neutral-900
                  
                    AGENDAR
                  button
                form
              div
            div
          div
        )}

        {}
        { ================= VISTA MINI-APP NOTAS (Amoxtli) ================= }
        {currentView === 'notes' && (
          div className=max-w-5xl mx-auto space-y-6
            div className=border-b-2 border-neutral-900 pb-5
              span className=text-xs font-mono font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 tracking-wider
                AMOXTLI · BORRADOR & NOTAS
              span
              h1 className=text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1
                LIBRO DE APUNTES
              h1
            div

            div className=grid grid-cols-1 mdgrid-cols-3 gap-6
              { Sidebar Notes List }
              div className=bg-white border-2 border-neutral-900 p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-3
                div className=flex items-center justify-between
                  span className=font-bold text-xs font-monoMIS NOTASspan
                  button
                    onClick={() = {
                      const newN = { id `n_${Date.now()}`, title 'Nueva Nota', content '', tag 'General', pinned false };
                      setNotes([newN, ...notes]);
                      setActiveNoteId(newN.id);
                    }}
                    className=p-1 border-2 border-neutral-900 bg-neutral-100 hoverbg-neutral-200
                  
                    Plus className=w-4 h-4 stroke-[3] 
                  button
                div

                div className=space-y-2
                  {notes.map((n) = (
                    div
                      key={n.id}
                      onClick={() = setActiveNoteId(n.id)}
                      className={`p-3 border-2 border-neutral-900 cursor-pointer font-mono text-xs transition-all ${
                        activeNoteId === n.id  'bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'  'bg-white hoverbg-neutral-100'
                      }`}
                    
                      div className=font-bold flex items-center justify-between
                        span className=truncate{n.title  'Sin título'}span
                        {n.pinned && Pin className=w-3 h-3 fill-current shrink-0 }
                      div
                      p className={`text-[10px] truncate mt-1 ${activeNoteId === n.id  'text-neutral-300'  'text-neutral-500'}`}
                        {n.content  'Escribe aquí...'}
                      p
                    div
                  ))}
                div
              div

              { Note Editor Area }
              div className=mdcol-span-2 bg-white border-2 border-neutral-900 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4
                {activeNoteId  (
                  (() = {
                    const activeN = notes.find((n) = n.id === activeNoteId);
                    if (!activeN) return null;

                    return (
                      div className=space-y-4
                        input
                          type=text
                          value={activeN.title}
                          onChange={(e) = {
                            const val = e.target.value;
                            setNotes(notes.map((n) = (n.id === activeNoteId  { ...n, title val }  n)));
                          }}
                          placeholder=TÍTULO DE LA NOTA
                          className=w-full text-xl font-black uppercase border-b-2 border-neutral-900 pb-2 focusoutline-none
                        

                        textarea
                          rows={12}
                          value={activeN.content}
                          onChange={(e) = {
                            const val = e.target.value;
                            setNotes(notes.map((n) = (n.id === activeNoteId  { ...n, content val }  n)));
                          }}
                          placeholder=Empieza a redactar tus ideas...
                          className=w-full font-mono text-xs border-2 border-neutral-900 p-4 focusoutline-none leading-relaxed
                        

                        div className=flex justify-between items-center text-xs font-mono pt-2
                          span className=text-neutral-500
                            {activeN.content.length} caracteres  {activeN.content.split(s+).filter(Boolean).length} palabras
                          span
                          button
                            onClick={() = {
                              setNotes(notes.filter((n) = n.id !== activeNoteId));
                              setActiveNoteId(notes[0].id  null);
                            }}
                            className=text-red-600 font-bold border-2 border-red-600 px-3 py-1 hoverbg-red-50
                          
                            ELIMINAR NOTA
                          button
                        div
                      div
                    );
                  })()
                )  (
                  p className=text-xs font-mono text-neutral-500 py-10 text-center
                    Selecciona o crea una nota para empezar.
                  p
                )}
              div
            div
          div
        )}

        {}
        { ================= VISTA MINI-APP TAREAS  KANBAN (Tequipanolli) ================= }
        {currentView === 'kanban' && (
          div className=max-w-6xl mx-auto space-y-6
            div className=border-b-2 border-neutral-900 pb-5
              span className=text-xs font-mono font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 tracking-wider
                TEQUIPANOLLI · TABLERO KANBAN
              span
              h1 className=text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1
                GESTIÓN DE TAREAS
              h1
            div

            { Quick Add Task Bar }
            form
              onSubmit={(e) = {
                e.preventDefault();
                if (!newTaskText.trim()) return;
                setTasks([...tasks, { id `k_${Date.now()}`, title newTaskText, status 'todo', priority 'Media' }]);
                setNewTaskText('');
              }}
              className=flex gap-3
            
              input
                type=text
                placeholder=AÑADIR NUEVA TAREA PENDIENTE...
                value={newTaskText}
                onChange={(e) = setNewTaskText(e.target.value)}
                className=flex-1 border-2 border-neutral-900 p-3 font-mono text-xs uppercase bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focusoutline-none
              
              button
                type=submit
                className=bg-neutral-900 text-white font-bold text-xs px-6 py-3 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
              
                + AGREGAR
              button
            form

            { 3 Columns Kanban Grid }
            div className=grid grid-cols-1 mdgrid-cols-3 gap-6
              
              { Column 1 POR HACER }
              div className=bg-white border-2 border-neutral-900 p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4
                div className=font-black text-xs uppercase border-b-2 border-neutral-900 pb-2 flex justify-between items-center
                  spanPOR HACERspan
                  span className=bg-neutral-900 text-white px-1.5 py-0.5 font-mono text-[10px]
                    {tasks.filter((t) = t.status === 'todo').length}
                  span
                div

                div className=space-y-3
                  {tasks.filter((t) = t.status === 'todo').map((t) = (
                    div key={t.id} className=border-2 border-neutral-900 p-3 bg-neutral-50 font-mono text-xs space-y-2
                      div className=font-bold{t.title}div
                      div className=flex justify-between items-center text-[10px] pt-1
                        span className=border border-neutral-900 px-1 bg-white{t.priority}span
                        button
                          onClick={() = setTasks(tasks.map((tk) = (tk.id === t.id  { ...tk, status 'in_progress' }  tk)))}
                          className=font-bold underline
                        
                          MOVER A PROGRESO →
                        button
                      div
                    div
                  ))}
                div
              div

              { Column 2 EN PROGRESO }
              div className=bg-white border-2 border-neutral-900 p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4
                div className=font-black text-xs uppercase border-b-2 border-neutral-900 pb-2 flex justify-between items-center
                  spanEN PROGRESOspan
                  span className=bg-neutral-900 text-white px-1.5 py-0.5 font-mono text-[10px]
                    {tasks.filter((t) = t.status === 'in_progress').length}
                  span
                div

                div className=space-y-3
                  {tasks.filter((t) = t.status === 'in_progress').map((t) = (
                    div key={t.id} className=border-2 border-neutral-900 p-3 bg-neutral-50 font-mono text-xs space-y-2
                      div className=font-bold{t.title}div
                      div className=flex justify-between items-center text-[10px] pt-1
                        span className=border border-neutral-900 px-1 bg-white{t.priority}span
                        button
                          onClick={() = setTasks(tasks.map((tk) = (tk.id === t.id  { ...tk, status 'done' }  tk)))}
                          className=font-bold underline
                        
                          FINALIZAR ✓
                        button
                      div
                    div
                  ))}
                div
              div

              { Column 3 TERMINADO }
              div className=bg-white border-2 border-neutral-900 p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4
                div className=font-black text-xs uppercase border-b-2 border-neutral-900 pb-2 flex justify-between items-center
                  spanCOMPLETADOspan
                  span className=bg-neutral-900 text-white px-1.5 py-0.5 font-mono text-[10px]
                    {tasks.filter((t) = t.status === 'done').length}
                  span
                div

                div className=space-y-3
                  {tasks.filter((t) = t.status === 'done').map((t) = (
                    div key={t.id} className=border-2 border-neutral-900 p-3 bg-neutral-100 font-mono text-xs space-y-2 line-through opacity-75
                      div className=font-bold{t.title}div
                      div className=text-[10px] text-neutral-500Terminadodiv
                    div
                  ))}
                div
              div

            div
          div
        )}

        {}
        { ================= VISTA MINI-APP PAUSA & RESPIRO (Ihiyotl) ================= }
        {currentView === 'breathe' && (
          div className=max-w-2xl mx-auto space-y-8 text-center
            div className=border-b-2 border-neutral-900 pb-5
              span className=text-xs font-mono font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 tracking-wider
                IHIYOTL · PAUSA CONSCIENTE
              span
              h1 className=text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1
                EXERCICIO DE RESPIRACIÓN
              h1
              p className=text-sm font-mono text-neutral-600 mt-1
                Oxigena tu cerebro durante 2 minutos para restaurar tu foco mental.
              p
            div

            div className=bg-white border-2 border-neutral-900 p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center space-y-8
              
              { Dynamic Breathing Visual Box }
              div 
                className={`w-48 h-48 border-4 border-neutral-900 flex flex-col items-center justify-center transition-all duration-1000 ${
                  breathePhase === 'Inhala'  'scale-110 bg-neutral-900 text-white'  breathePhase === 'Sostén'  'scale-105 bg-neutral-200 text-neutral-900'  'scale-90 bg-white text-neutral-900'
                }`}
              
                div className=font-black text-xl uppercase tracking-widest{breathePhase}div
                div className=font-mono text-4xl font-bold mt-2{breatheSeconds}sdiv
              div

              div className=space-y-4
                button
                  onClick={() = setBreatheIsActive(!breatheIsActive)}
                  className=bg-neutral-900 text-white font-black text-sm px-8 py-3 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] activetranslate-x-[2px] activetranslate-y-[2px]
                
                  {breatheIsActive  'DETENER PAUSA'  'INICIAR GUÍA'}
                button
                p className=text-xs font-mono text-neutral-500
                  Ritmo 4-4-4 Inhala 4s, Sostén 4s, Exhala 4s.
                p
              div
            div
          div
        )}

        {}
        { ================= VISTA HISTORIAL GLOBAL ================= }
        {currentView === 'history' && (
          div className=max-w-5xl mx-auto space-y-8
            div className=border-b-2 border-neutral-900 pb-5
              span className=text-xs font-mono font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 tracking-wider
                MAHUIZOTL · HISTORIAL DE SEGUIMIENTO
              span
              h1 className=text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1
                REGISTROS Y DESEMPEÑO
              h1
              p className=text-sm font-mono text-neutral-600 mt-1
                Consolidado de todas las actividades e hitos completados en 2026.
              p
            div

            div className=space-y-6
              {trackers.map((tracker) = {
                const loggedWeeksKeys = Object.keys(tracker.logs);

                return (
                  div key={tracker.id} className=bg-white border-2 border-neutral-900 p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4
                    div className=flex items-center justify-between border-b-2 border-neutral-900 pb-3
                      h2 className=text-xl font-black uppercase{tracker.title}h2
                      span className=font-mono text-xs font-bold bg-neutral-100 border border-neutral-900 px-2.5 py-1
                        {tracker.activities.length} Actividades
                      span
                    div

                    {loggedWeeksKeys.length === 0  (
                      p className=text-xs font-mono text-neutral-500 py-2
                        Sin registros completados en semanas anteriores aún.
                      p
                    )  (
                      div className=grid grid-cols-1 mdgrid-cols-2 gap-4 pt-2
                        {loggedWeeksKeys.map((wKey) = {
                          const parts = wKey.split('_');
                          const wNum = parts[1];
                          const weekLog = tracker.logs[wKey];

                          let totalChecks = 0;
                          let maxPossible = tracker.activities.length  7;

                          tracker.activities.forEach(a = {
                            const days = weekLog[a.id]  [];
                            totalChecks += days.filter(Boolean).length;
                          });

                          const pct = maxPossible  0  Math.round((totalChecks  maxPossible)  100)  0;

                          return (
                            div key={wKey} className=border-2 border-neutral-900 p-4 bg-neutral-50 space-y-2 font-mono
                              div className=flex justify-between items-center text-xs font-bold
                                spanSEMANA N° {wNum} (2026)span
                                span{pct}% COMPLETADOspan
                              div
                              div className=w-full h-3 border border-neutral-900 bg-white overflow-hidden
                                div className=h-full bg-neutral-900 style={{ width `${pct}%` }} 
                              div
                              div className=text-[11px] text-neutral-500 text-right
                                {totalChecks} de {maxPossible} marcas realizadas
                              div
                            div
                          );
                        })}
                      div
                    )}
                  div
                );
              })}
            div
          div
        )}

      main
    div
  );
}