# FocusDock 🎯

A minimal, beautiful **desktop widget** for Windows 10/11 — your personal to-do list and reminder companion that lives right on your home screen.

---

## ✨ Features

- 📌 **Desktop Widget Mode** — Lives on your Windows desktop (home screen) without overlapping open apps
- 🖱️ **Drag Anywhere** — Click and drag to place the widget exactly where you want it on your desktop
- 🧭 **Quick Snap Presets** — One-click snapping to Top Right, Bottom Right, Bottom Left, Top Left, or Center
- ↔️ **Freely Resizable** — Drag the corner grip to set your preferred size
- 💾 **Persistent Position** — Your position and size are automatically saved and restored on next launch
- ✅ **Task Management** — Add, complete, and delete to-do items with due dates
- 🔔 **Reminders** — Set task reminders with native Windows notifications
- 🌙 **Dark Mode UI** — Beautiful dark glassmorphism interface
- 🚀 **Launch on Startup** — Optionally start FocusDock with Windows

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/)

### Install & Run

```bash
git clone https://github.com/ktilak12/FocusDock.git
cd FocusDock
npm install
npm run build
npm start
```

### Desktop Shortcut
After building, double-click the **FocusDock** shortcut on your Desktop to launch.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Shell | Electron |
| UI | React + TypeScript |
| Styling | Tailwind CSS |
| Bundler | Vite + tsup |
| Storage | LowDB (JSON) |
| IPC | Electron contextBridge |

---

## 📁 Project Structure

```
src/
├── main/            # Electron main process
│   ├── index.ts     # App entry, IPC handlers, tray setup
│   ├── preload.ts   # Secure contextBridge API
│   ├── windowManager.ts  # Window creation & positioning
│   └── store.ts     # Settings & task storage (LowDB)
├── renderer/        # React frontend
│   ├── components/  # UI components (WidgetView, TaskItem, etc.)
│   ├── context/     # React context for tasks & settings
│   └── App.tsx      # Root app component
├── types/           # Shared TypeScript interfaces
└── shared/          # Shared utilities
```

---

## 📝 License

MIT © [ktilak12](https://github.com/ktilak12)
