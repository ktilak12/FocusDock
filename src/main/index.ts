import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { configureAutoStart } from './autoStart';
import { ReminderScheduler } from './reminderScheduler';
import { ShortcutManager } from './shortcuts';
import { StorageService } from './store';
import { TrayManager } from './tray';
import { WindowManager } from './windowManager';

const logFile = path.join(process.cwd(), 'debug_error.log');
function log(msg: string) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {}
}

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.stack || err}`);
});
process.on('unhandledRejection', (err: any) => {
  log(`UNHANDLED REJECTION: ${err?.stack || err}`);
});

log('FocusDock index.ts loaded');

let storage: StorageService;
let windowManager: WindowManager;
let trayManager: TrayManager;
let shortcutManager: ShortcutManager;
let reminderScheduler: ReminderScheduler;

// Set application identity
app.setName('FocusDock');

// Single instance enforcement
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (windowManager) {
      windowManager.showMainWindow();
    }
  });

  app.whenReady().then(() => {
    storage = new StorageService();
    windowManager = new WindowManager(storage);
    trayManager = new TrayManager(windowManager, storage);
    shortcutManager = new ShortcutManager(windowManager);
    reminderScheduler = new ReminderScheduler(storage, windowManager);

    // 1. Create Tray Icon
    trayManager.createTray();

    // 2. Register Global Shortcuts
    shortcutManager.registerGlobalShortcuts();

    // 3. Start Reminder Engine
    reminderScheduler.start();

    // 4. Configure Startup Settings
    const settings = storage.getSettings();
    configureAutoStart(settings.launchOnStartup);

    // 5. Create & Show Main Window
    const isHiddenStart = process.argv.includes('--hidden');
    if (!isHiddenStart) {
      windowManager.createMainWindow();
    }

    // --- IPC HANDLERS ---
    ipcMain.handle('get-tasks', () => storage.getTasks());
    ipcMain.handle('save-tasks', (_event, tasks) => {
      const result = storage.saveTasks(tasks);
      trayManager.updateContextMenu();
      return result;
    });
    ipcMain.handle('add-task', (_event, taskInput) => {
      const task = storage.addTask(taskInput);
      trayManager.updateContextMenu();
      const mainWin = windowManager.getMainWindow();
      if (mainWin) mainWin.webContents.send('tasks-updated');
      return task;
    });
    ipcMain.handle('update-task', (_event, task) => {
      const updated = storage.updateTask(task);
      trayManager.updateContextMenu();
      const mainWin = windowManager.getMainWindow();
      if (mainWin) mainWin.webContents.send('tasks-updated');
      return updated;
    });
    ipcMain.handle('delete-task', (_event, id) => {
      const result = storage.deleteTask(id);
      trayManager.updateContextMenu();
      const mainWin = windowManager.getMainWindow();
      if (mainWin) mainWin.webContents.send('tasks-updated');
      return result;
    });

    ipcMain.handle('get-settings', () => storage.getSettings());
    ipcMain.handle('save-settings', (_event, newSettings) => {
      const saved = storage.saveSettings(newSettings);
      if (newSettings.launchOnStartup !== undefined) {
        configureAutoStart(newSettings.launchOnStartup);
      }
      if (newSettings.alwaysOnTop !== undefined) {
        windowManager.setAlwaysOnTop(newSettings.alwaysOnTop);
      }
      if (newSettings.widgetOpacity !== undefined) {
        const currentMode = storage.getSettings().currentViewMode;
        if (currentMode === 'widget') {
          windowManager.setOpacity(newSettings.widgetOpacity);
        }
      }
      trayManager.updateContextMenu();
      return saved;
    });

    ipcMain.handle('set-launch-on-startup', (_event, enabled) => {
      storage.saveSettings({ launchOnStartup: enabled });
      return configureAutoStart(enabled);
    });

    ipcMain.on('window-minimize', () => {
      windowManager.getMainWindow()?.minimize();
    });
    ipcMain.on('window-maximize', () => {
      const win = windowManager.getMainWindow();
      if (win) {
        if (win.isMaximized()) win.unmaximize();
        else win.maximize();
      }
    });
    ipcMain.on('window-close', () => {
      windowManager.hideMainWindow();
    });
    ipcMain.on('window-hide-tray', () => {
      windowManager.hideMainWindow();
    });

    ipcMain.on('set-always-on-top', (_event, alwaysOnTop) => {
      storage.saveSettings({ alwaysOnTop });
      windowManager.setAlwaysOnTop(alwaysOnTop);
    });

    ipcMain.on('set-window-view', (_event, mode) => {
      storage.saveSettings({ currentViewMode: mode });
      windowManager.switchViewMode(mode);
    });

    ipcMain.on('set-window-size', (_event, { width, height }) => {
      windowManager.setWindowSize(width, height);
    });

    ipcMain.on('snap-to-position', (_event, pos) => {
      windowManager.snapToPosition(pos);
    });
  });

  app.on('will-quit', () => {
    if (shortcutManager) shortcutManager.unregisterAll();
    if (reminderScheduler) reminderScheduler.stop();
    if (storage) storage.flushSync();
  });

  app.on('window-all-closed', () => {
    // Keep app running in background tray on Windows
  });
}
