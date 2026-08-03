Aquí tienes el **prompt maestro reestructurado** para construir la aplicación nativa de escritorio **TEQUITL** utilizando **Electron + Vite + React + TypeScript** y **Better-SQLite3 / SQLite3** nativo.

El prompt le da instrucciones precisas al LLM o generador de código para organizar el proceso de IPC (Inter-Process Communication), aislar el renderizador por seguridad (usando `contextBridge` / `preload.ts`), abstraer las operaciones de SQLite en el proceso principal (`main`) y reconstruir `main.tsx` como el panel unificado de la arquitectura.

---

### 📋 PROMPT MAESTRO PARA CONSTRUIR "TEQUITL" (ELECTRON + VITE + TS)

```text
Actúa como un Ingeniero de Software Principal especializado en Electron, Vite, React 18+ y TypeScript. Necesito que construyas la arquitectura completa para "TEQUITL", una suite desktop de productividad con diseño Neo-Brutalista de alto contraste (blanco y negro estricto, bordes de 2px gruesos, esquinas rectas sin border-radius y sombras offset sólidas: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`).

Debes reestructurar completamente el punto de entrada y separar las responsabilidades mediante la arquitectura multi-proceso estándar de Electron (Proceso Principal `electron/main.ts`, Script Preload `electron/preload.ts`, y Renderizador React en `src/`).

---

### 🛠️ Pila Tecnológica & Herramientas
1. Core Desktop: Electron (última versión) + Vite (vía electron-vite o vite-plugin-electron).
2. UI Framework: React 18+ con TypeScript estricto (`.tsx`).
3. Estilos: Tailwind CSS configurado con tipografías monoespaciadas/sans-serif limpias y estética neo-brutalista.
4. Base de Datos Local: SQLite NATIVO utilizando `better-sqlite3` operado exclusivamente en el proceso Main de Electron.
5. IPC Bridge: Seguridad estricta con `contextIsolation: true` y `nodeIntegration: false`, exponiendo una API fuertemente tipada a través de `window.electronAPI`.
6. Frases de Inspiración: Carga de un archivo `frases.json` ubicado en la raíz del proyecto.

---

### 📂 Estructura de Proyecto Requerida

Crea el proyecto con la siguiente arquitectura modular de archivos:

tequitl-app/
├── package.json
├── vite.config.ts
├── frases.json                   # Archivo raíz con array de frases de inspiración
├── electron/
│   ├── main.ts                   # Proceso Principal: Creación de ventanas, SQLite IPC, export/import
│   ├── preload.ts                # Preload Script: Exposición de contextBridge seguro
│   └── db/
│       ├── schema.sql            # Script DDL de inicialización de tablas SQLite
│       ├── database.ts          # Instancia e queries con better-sqlite3
│       └── backup.ts            # Lógica para guardar/cargar archivos .db externos
└── src/
    ├── main.tsx                  # Punto de entrada de React (reemplaza el main.jsx de guía)
    ├── App.tsx                   # Layout principal, Sidebar de navegación y enrutamiento interno
    ├── index.css                 # Importación de Tailwind y utilidades neo-brutalistas
    ├── types/
    │   └── global.d.ts           # Definiciones de window.electronAPI y tipos de dominio
    ├── components/
    │   ├── layout/
    │   │   └── Sidebar.tsx       # Navegación con tipografía Náhuatl
    │   ├── shared/
    │   │   ├── QuoteBar.tsx      # Lector dinámico de frases.json
    │   │   └── DbSettings.tsx    # Panel de Importar/Exportar DB
    │   └── apps/
    │       ├── YeyelliTrackers.tsx    # Tracker de actividades por semanas (AÑO 2026)
    │       ├── TlahuilliPomodoro.tsx   # Pomodoro con persistencia de sesiones
    │       ├── TonalliCalendar.tsx    # Calendario y agenda local
    │       ├── AmoxtliNotes.tsx       # Bloc de notas Markdown / texto plano
    │       ├── TequipanolliKanban.tsx # Tablero Kanban
    │       ├── IhiyotlBreathing.tsx   # Ejercicio de respiración guiada
    │       └── MahuizotlAnalytics.tsx # Historial unificado de datos SQLite

```

---

### 🗄️ Esquema SQLite (`electron/db/schema.sql`)

Configura la base de datos `tequitl.db` alojada en `app.getPath('userData')` con estas tablas:

```sql
CREATE TABLE IF NOT EXISTS trackers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracker_activities (
  id TEXT PRIMARY KEY,
  tracker_id TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tracker_logs (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  week_key TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (activity_id) REFERENCES tracker_activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id TEXT PRIMARY KEY,
  duration_minutes INTEGER NOT NULL,
  mode TEXT NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kanban_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT CHECK(status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

```

---

### 🔌 Puente IPC (IPC Communication & Types)

1. En `electron/preload.ts`:
Define y expone métodos limpios para que la interfaz React interactúe de forma segura con SQLite y con el sistema de archivos (sin nodeIntegration):
* `getTrackers()`, `createTracker(title)`, `toggleTrackerLog(...)`
* `getPomodoroLogs()`, `savePomodoroSession(...)`
* `getNotes()`, `saveNote(...)`, `deleteNote(...)`
* `getKanbanTasks()`, `updateTaskStatus(...)`
* `exportDatabase()`, `importDatabase()`


2. En `src/types/global.d.ts`:
Extiende la interfaz `Window` para tener TypeScript autocomplete estricto al llamar `window.electronAPI`.

---

### 🎨 Requerimientos para `src/main.tsx` y la Interfaz

1. Reestructuración Completa de `main.tsx`:
* Configura el árbol de React en modo estricto `<React.StrictMode>`.
* Inicializa el layout base que lee dinámicamente las frases desde la raíz (`frases.json`).


2. Cero Datos Simulados / Hardcodeados:
* Toda la interfaz debe reaccionar a consultas reales de SQLite a través del IPC. Si la tabla está vacía, debe mostrar estados vacíos (empty states) limpios y motivacionales con estilo neo-brutalista.


3. Configuración y Control de Datos (Exportar/Importar DB):
* **Exportar Base de Datos**: Permite al usuario abrir el diálogo nativo de Electron para guardar una copia de respaldo `.db`.
* **Importar Base de Datos**: Muestra el diálogo para seleccionar un archivo `.db` existente, valida y reemplaza la base de datos actual notificando a React para recargar los datos.


4. Carga de `frases.json`:
* Crea un archivo `frases.json` en la raíz con el siguiente formato base e impórtalo o léelo vía IPC:
[
{ "id": 1, "frase": "In xochitl in cuicatl - La flor y el canto son la poesía de la vida.", "autor": "Proverbio Náhuatl" },
{ "id": 2, "frase": "Noyollo tlatocayotl - Mi corazón dicta mi propio esfuerzo.", "autor": "Pensamiento Náhuatl" }
]



---

### 📦 Entregables Requeridos

1. Código funcional para `package.json`, `vite.config.ts` y scripts de construcción con Electron.
2. `electron/main.ts` y `electron/preload.ts` con todos los manejadores `ipcMain.handle` implementados usando `better-sqlite3`.
3. `electron/db/database.ts` con la lógica de consultas SQL y backup de archivos.
4. `src/types/global.d.ts` con los tipos de la API.
5. `src/main.tsx` y `src/App.tsx` estructurados para el tablero unificado de miniapps en rectángulos.

```

```