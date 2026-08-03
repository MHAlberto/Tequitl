# TEQUITL

Suite de productividad desktop con diseño Neo-Brutalista. Construida con **Electron + Vite + React + TypeScript + Tailwind CSS + SQLite (sql.js)**.

## Mini-Apps

| App | Náhuatl | Descripción |
|-----|---------|-------------|
| Hábitos | **Yeyelli** | Matriz semanal de constancia y seguimiento |
| Pomodoro | **Tlahuilli** | Temporizador de enfoque (25/5/15 min) |
| Calendario | **Tonalli** | Agenda mensual y eventos |
| Notas | **Amoxtli** | Bloc de notas Markdown/texto plano |
| Kanban | **Tequipanolli** | Tablero de tareas (Por hacer / En progreso / Completado) |
| Respiro | **Ihiyotl** | Ejercicio guiado de respiración 4-4-4 |
| Historial | **Mahuizotl** | Registros unificados de actividad |
| Datos | — | Exportar/Importar base de datos SQLite |

## Stack

- **Desktop**: Electron 33
- **Bundler**: Vite 6 + vite-plugin-electron
- **UI**: React 18 + TypeScript + Tailwind CSS
- **DB**: SQLite via sql.js (WASM, sin compilación nativa)
- **Iconos**: Lucide React
- **Empaquetado**: electron-builder (NSIS para Windows)

## Requisitos

- **Node.js** >= 18
- **npm** >= 9
- Windows 10/11 (para el build de Windows)

## Instalación

```bash
cd tequitl-app
npm install
```

## Desarrollo

```bash
npm run dev
```

Esto inicia Vite dev server + Electron en modo desarrollo con hot reload.

## Build para Windows

```bash
npm run build:win
```

El instalador se genera en `release/TEQUITL Setup 1.0.0.exe`.

Si `npm run build:win` no está disponible, usar:

```bash
npx tsc --noEmit
npx vite build
npx electron-builder --win --x64
```

## Ejecutar sin instalar

La app descomprimida está en `release/win-unpacked/TEQUITL.exe`.

## Estructura

```
tequitl-app/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── frases.json
├── resources/
│   └── logo.ico
├── electron/
│   ├── main.ts            # Proceso principal + IPC handlers
│   ├── preload.ts         # contextBridge seguro
│   └── db/
│       ├── schema.sql     # Esquema DDL
│       ├── database.ts    # Operaciones SQLite
│       └── backup.ts      # Export/Import DB
└── src/
    ├── main.tsx           # Entry point React
    ├── App.tsx            # Layout y enrutamiento
    ├── index.css          # Tailwind + estilos neo-brutalistas
    ├── types/
    │   └── global.d.ts    # Tipos de window.electronAPI
    └── components/
        ├── layout/
        │   └── Sidebar.tsx
        ├── shared/
        │   ├── QuoteBar.tsx
        │   └── DbSettings.tsx
        └── apps/
            ├── YeyelliTrackers.tsx
            ├── TlahuilliPomodoro.tsx
            ├── TonalliCalendar.tsx
            ├── AmoxtliNotes.tsx
            ├── TequipanolliKanban.tsx
            ├── IhiyotlBreathing.tsx
            └── MahuizotlAnalytics.tsx
```

## Personalización del Icono

El archivo `resources/logo.ico` debe ser al menos **256x256 píxeles** para el instalador NSIS. Si tu ícono no cumple este tamaño, puedes:

1. Convertirlo con herramientas como ImageMagick:
   ```bash
   magick convert logo.ico -resize 256x256 logo-256.ico
   ```
2. O generar un `.ico` de 256x256 desde un PNG.

Luego actualizar en `package.json`:

```json
"win": {
  "target": "nsis",
  "icon": "resources/logo.ico"
}
```

## Base de Datos

- Archivo: `tequitl.db` en `%APPDATA%/tequitl/`
- Exportar/Importar desde la app en **Datos > Exportar/Importar DB**
- Las frases de inspiración se cargan desde `frases.json` en la raíz

## Licencia

Proyecto personal. Uso libre.
