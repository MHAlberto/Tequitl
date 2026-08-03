# TEQUITL

Suite de productividad desktop con diseño Neo-Brutalista. Construida con **Electron + Vite + React + TypeScript + Tailwind CSS + SQLite (sql.js)**.

[![MIT License](https://img.shields.io/badge/license-MIT-black.svg)](LICENSE)
[![GitHub release](https://img.shields.io/badge/release-v1.0.1-black.svg)](https://github.com/MHAlberto/Tequitl/releases/latest)

## Mini-Apps

| App | Náhuatl | Descripción |
|-----|---------|-------------|
| Hábitos | **Yeyelli** | Matriz semanal de constancia y seguimiento con edición inline |
| Pomodoro | **Tlahuilli** | Temporizador con modos Zen (fullscreen) y Mini (ventana compacta) |
| Agenda | **Cahuitl** | Planificador diario por horarios (5am-10pm) con rutina semanal recurrente |
| Calendario | **Tonalli** | Agenda mensual con eventos y navegación entre meses |
| Notas | **Amoxtli** | Bloc de notas con búsqueda |
| Kanban | **Tequipanolli** | Tablero de tareas (Por hacer / En progreso / Completado) |
| Respiro | **Ihiyotl** | Ejercicio guiado de respiración con tiempos configurables |
| Peso | **Etili** | Tracker de peso corporal con gráfico y estadísticas |
| Datos | — | Exportar/Importar base de datos SQLite |

## Stack

- **Desktop**: Electron 33
- **Bundler**: Vite 6 + vite-plugin-electron
- **UI**: React 18 + TypeScript + Tailwind CSS
- **DB**: SQLite via sql.js (WASM, sin compilación nativa)
- **Iconos**: Lucide React
- **Empaquetado**: electron-builder (NSIS para Windows, próximamente Linux AppImage y macOS DMG)
- **Actualizaciones**: electron-updater con GitHub Releases

## Requisitos

- **Node.js** >= 18
- **npm** >= 9

## Instalación

```bash
git clone https://github.com/MHAlberto/Tequitl.git
cd Tequitl
npm install
```

## Desarrollo

```bash
npm run dev
```

Inicia Vite dev server + Electron en modo desarrollo con hot reload.

## Build

```bash
npm run build:win     # Windows (.exe NSIS)
npm run build:linux   # Linux (AppImage)
npm run build:mac     # macOS (DMG)
npm run build:all     # Todas las plataformas
```

Los instaladores se generan en `release/`.

## Estructura

```
tequitl/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── frases.json
├── LICENSE
├── resources/
│   ├── logo.ico
│   ├── logo.png
│   └── sql-wasm.wasm
├── electron/
│   ├── main.ts            # Proceso principal + IPC handlers + auto-updater
│   ├── preload.ts         # contextBridge seguro
│   └── db/
│       ├── schema.sql     # Esquema DDL
│       ├── database.ts    # Operaciones SQLite
│       └── backup.ts      # Export/Import DB
├── docs/                  # Landing page (GitHub Pages)
│   └── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── global.d.ts
    └── components/
        ├── Configuracion.tsx
        ├── layout/
        │   ├── Sidebar.tsx
        │   └── TitleBar.tsx
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
            ├── MahuizotlAnalytics.tsx
            ├── EtiliWeightTracker.tsx
            └── CahuitlSchedule.tsx
```

## Base de Datos

- Archivo: `tequitl.db` en `%APPDATA%/tequitl/`
- Exportar/Importar desde la app en **Datos > Exportar/Importar DB**
- Las frases de inspiración se cargan desde `frases.json` en la raíz

## Licencia

**MIT License** — Totalmente libre y open source.

Podés **usar, modificar, distribuir y vender** este software sin ninguna restricción. No hay versión "pro", funcionalidades bloqueadas ni telemetría. Todo el código está disponible en este repositorio.

Ver [LICENSE](LICENSE) para el texto completo.
