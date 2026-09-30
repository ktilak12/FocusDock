# FocusDock 🎯

A minimal, beautiful **desktop widget** for Windows 10/11 — your personal to-do list and reminder companion that lives right on your home screen.

---

## ⚡ Quickest Way: Download & Install

> **No Node.js or Docker needed — just download and run.**

Go to **[Releases](https://github.com/ktilak12/FocusDock/releases)** and grab the latest installer for your platform:

| Platform | File to download |
|----------|-----------------|
| **Windows** (recommended) | `FocusDock-Setup-x.x.x.exe` |
| **Windows** (no install) | `FocusDock-x.x.x-portable.exe` |
| **Linux** (most distros) | `FocusDock-x.x.x.AppImage` |
| **Linux** (Debian/Ubuntu) | `focusdock_x.x.x_amd64.deb` |

---

## ✨ Features

- 📌 **Desktop Widget Mode** — Lives on your Windows desktop without overlapping open apps
- 🖱️ **Drag Anywhere** — Click and drag to place the widget exactly where you want it
- 🧭 **Quick Snap Presets** — One-click snapping to Top Right, Bottom Right, Bottom Left, Top Left, or Center
- ↔️ **Freely Resizable** — Drag the corner grip to set your preferred size
- 💾 **Persistent Position** — Your position and size are automatically saved and restored
- ✅ **Task Management** — Add, complete, and delete to-do items with due dates
- 🔔 **Reminders** — Set task reminders with native Windows notifications
- 🌙 **Dark Mode UI** — Beautiful dark glassmorphism interface
- 🚀 **Launch on Startup** — Optionally start FocusDock with Windows

---

## 🐳 Run with Docker (Linux — no Node.js needed)

Electron apps need a display to run. On **Linux with X11**, Docker can launch FocusDock directly.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine

### Run the app (Linux X11)

```bash
git clone https://github.com/ktilak12/FocusDock.git
cd FocusDock

# Allow Docker to access your display
xhost +local:docker

# Build image and launch app
docker compose up focusdock
```

Your tasks and settings are saved in a Docker volume and persist across restarts.

### Preview the React UI in a browser (all platforms)

```bash
docker compose up renderer
# Open http://localhost:5173
```

> **Windows/macOS users:** Docker cannot easily forward a GUI on these platforms. Use the installer from Releases instead — it is the easiest option.

---

## 🛠️ Build from Source (requires Node.js v18+)

```bash
git clone https://github.com/ktilak12/FocusDock.git
cd FocusDock
npm install
npm run build
npm start
```

### Package an installer

```bash
# Windows (.exe installer + portable)
npm run package

# Linux (AppImage + .deb)
npm run package:linux
```

---

## 🔄 CI/CD (GitHub Actions)

Every push to `main` builds and verifies the app.  
Every version tag (`v1.2.3`) automatically builds **Windows and Linux installers** and publishes them as a **GitHub Release**.

To cut a new release:

```bash
git tag v1.0.1
git push origin v1.0.1
# GitHub Actions builds everything and creates the release automatically
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Shell | Electron |
| UI | React + TypeScript |
| Styling | Tailwind CSS |
| Bundler | Vite + tsup |
| Storage | JSON flat-file (fs) |
| IPC | Electron contextBridge |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
src/
├── main/            # Electron main process
│   ├── index.ts     # App entry, IPC handlers, tray setup
│   ├── preload.ts   # Secure contextBridge API
│   ├── windowManager.ts  # Window creation & positioning
│   └── store.ts     # Settings & task storage
├── renderer/        # React frontend
│   ├── components/  # UI components (WidgetView, TaskItem, etc.)
│   ├── context/     # React context for tasks & settings
│   └── App.tsx      # Root app component
├── types/           # Shared TypeScript interfaces
└── shared/          # Shared utilities
.github/
└── workflows/
    └── release.yml  # Auto-build & publish installers on version tags
```

---

## 📝 License

MIT © [ktilak12](https://github.com/ktilak12)