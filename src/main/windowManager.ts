import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { StorageService } from './store';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private quickAddWindow: BrowserWindow | null = null;
  private isQuitting: boolean = false;
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  public setQuitting(quitting: boolean) {
    this.isQuitting = quitting;
  }

  public createMainWindow(): BrowserWindow {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.show();
      this.mainWindow.focus();
      return this.mainWindow;
    }

    const settings = this.storage.getSettings();
    const isWidgetMode = settings.currentViewMode === 'widget';

    const width = isWidgetMode ? (settings.widgetWidth || 360) : 1000;
    const height = isWidgetMode ? (settings.widgetHeight || 540) : 660;
    const hasSavedPosition = isWidgetMode && typeof settings.widgetX === 'number' && typeof settings.widgetY === 'number';

    this.mainWindow = new BrowserWindow({
      width,
      height,
      x: hasSavedPosition ? settings.widgetX : undefined,
      y: hasSavedPosition ? settings.widgetY : undefined,
      minWidth: isWidgetMode ? 250 : 760,
      minHeight: isWidgetMode ? 300 : 500,
      frame: false,
      transparent: false,
      hasShadow: true,
      backgroundColor: '#0f172a',
      alwaysOnTop: !!settings.alwaysOnTop,
      resizable: true,
      show: false,
      skipTaskbar: isWidgetMode,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        allowRunningInsecureContent: false,
      },
    });

    // Save position and size whenever the user moves or resizes the widget
    let saveTimeout: NodeJS.Timeout | null = null;
    const saveBounds = () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
        const currentMode = this.storage.getSettings().currentViewMode;
        const bounds = this.mainWindow.getBounds();
        if (currentMode === 'widget' || bounds.width < 700) {
          this.storage.saveSettings({
            widgetX: bounds.x,
            widgetY: bounds.y,
            widgetWidth: bounds.width,
            widgetHeight: bounds.height,
          });
        }
      }, 300);
    };

    this.mainWindow.on('moved', saveBounds);
    this.mainWindow.on('resized', saveBounds);

    // When the widget loses focus, ensure it never covers active applications
    this.mainWindow.on('blur', () => {
      const currentPinned = !!this.storage.getSettings().alwaysOnTop;
      if (!currentPinned && this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.setAlwaysOnTop(false);
      }
    });

    // Security Hardening: Deny opening external windows or untrusted navigation
    this.mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      if (!url.startsWith('file://') && !url.startsWith('http://localhost')) {
        event.preventDefault();
      }
    });

    const htmlPath = path.join(__dirname, '../renderer/index.html');
    const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

    const logFile = path.join(process.cwd(), 'debug_error.log');
    const log = (msg: string) => {
      try {
        require('fs').appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
      } catch (e) {}
    };

    this.mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      log(`RENDERER CONSOLE [level ${level}]: ${message} (at ${sourceId}:${line})`);
    });

    this.mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
      log(`RENDERER LOAD FAILED [${errorCode}]: ${errorDescription} URL: ${validatedURL}`);
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      log(`RENDERER FINISHED LOAD successfully`);
      if (this.mainWindow) {
        log(`WINDOW BOUNDS: ${JSON.stringify(this.mainWindow.getBounds())}, isVisible=${this.mainWindow.isVisible()}`);
      }
    });

    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      log(`Loading URL: ${process.env.VITE_DEV_SERVER_URL}`);
      this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      log(`Loading File: ${htmlPath}`);
      this.mainWindow.loadFile(htmlPath);
    }

    if (!hasSavedPosition) {
      this.mainWindow.center();
    }
    
    const isPinned = !!settings.alwaysOnTop;
    this.mainWindow.setAlwaysOnTop(isPinned);
    
    // In widget mode on home screen, display without stealing focus from active windows
    if (isWidgetMode && !isPinned) {
      this.mainWindow.showInactive();
    } else {
      this.mainWindow.show();
      this.mainWindow.focus();
    }

    this.mainWindow.once('ready-to-show', () => {
      log('Window event ready-to-show fired');
      if (this.mainWindow) {
        const currentPinned = !!this.storage.getSettings().alwaysOnTop;
        if (isWidgetMode && !currentPinned) {
          this.mainWindow.showInactive();
        } else {
          this.mainWindow.show();
        }
      }
    });

    // Hide to tray on close unless quitting
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });

    return this.mainWindow;
  }

  public createQuickAddWindow(): BrowserWindow {
    if (this.quickAddWindow) {
      this.quickAddWindow.show();
      this.quickAddWindow.focus();
      return this.quickAddWindow;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    this.quickAddWindow = new BrowserWindow({
      width: 520,
      height: 200,
      x: Math.floor(width / 2 - 260),
      y: Math.floor(height / 3),
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      alwaysOnTop: true,
      skipTaskbar: true,
      show: false,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
    const baseUrl = (isDev && process.env.VITE_DEV_SERVER_URL) 
      ? process.env.VITE_DEV_SERVER_URL 
      : `file://${path.join(__dirname, '../renderer/index.html')}`;

    this.quickAddWindow.loadURL(`${baseUrl}#/quick-add`);

    this.quickAddWindow.on('blur', () => {
      this.quickAddWindow?.hide();
    });

    return this.quickAddWindow;
  }

  public toggleQuickAddWindow() {
    if (!this.quickAddWindow) {
      this.createQuickAddWindow();
    }

    if (this.quickAddWindow?.isVisible()) {
      this.quickAddWindow.hide();
    } else {
      this.quickAddWindow?.show();
      this.quickAddWindow?.focus();
      this.quickAddWindow?.webContents.send('quick-add-triggered');
    }
  }

  public showMainWindow() {
    if (!this.mainWindow) {
      this.createMainWindow();
    } else {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  public hideMainWindow() {
    this.mainWindow?.hide();
  }

  public switchViewMode(mode: 'full' | 'widget' | 'quick-add') {
    if (!this.mainWindow) return;

    this.storage.saveSettings({ currentViewMode: mode });

    if (mode === 'widget') {
      const settings = this.storage.getSettings();
      const targetW = settings.widgetWidth || 360;
      const targetH = settings.widgetHeight || 540;
      this.mainWindow.setMinimumSize(250, 300);
      this.mainWindow.setSize(targetW, targetH);
      if (typeof settings.widgetX === 'number' && typeof settings.widgetY === 'number') {
        this.mainWindow.setPosition(settings.widgetX, settings.widgetY);
      }
      this.mainWindow.setResizable(true);
      this.mainWindow.setSkipTaskbar(true);
    } else if (mode === 'full') {
      this.mainWindow.setSize(1000, 660);
      this.mainWindow.setMinimumSize(760, 500);
      this.mainWindow.setResizable(true);
      this.mainWindow.setSkipTaskbar(false);
      this.mainWindow.center();
    }

    this.mainWindow.webContents.send('view-changed', mode);
  }

  public setWindowSize(width: number, height: number) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      const minW = 250;
      const minH = 300;
      const targetW = Math.max(minW, Math.round(width));
      const targetH = Math.max(minH, Math.round(height));
      this.mainWindow.setSize(targetW, targetH);
      const bounds = this.mainWindow.getBounds();
      this.storage.saveSettings({
        widgetWidth: bounds.width,
        widgetHeight: bounds.height,
      });
    }
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public setAlwaysOnTop(alwaysOnTop: boolean) {
    if (this.mainWindow) {
      this.mainWindow.setAlwaysOnTop(alwaysOnTop);
    }
  }

  public snapToPosition(pos: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'center') {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;
    const { x: workX, y: workY } = primaryDisplay.workArea;
    const bounds = this.mainWindow.getBounds();
    const margin = 24;

    let targetX = workX + margin;
    let targetY = workY + margin;

    switch (pos) {
      case 'top-right':
        targetX = workX + screenW - bounds.width - margin;
        targetY = workY + margin;
        break;
      case 'bottom-right':
        targetX = workX + screenW - bounds.width - margin;
        targetY = workY + screenH - bounds.height - margin;
        break;
      case 'bottom-left':
        targetX = workX + margin;
        targetY = workY + screenH - bounds.height - margin;
        break;
      case 'top-left':
        targetX = workX + margin;
        targetY = workY + margin;
        break;
      case 'center':
        targetX = workX + Math.round((screenW - bounds.width) / 2);
        targetY = workY + Math.round((screenH - bounds.height) / 2);
        break;
    }

    this.mainWindow.setPosition(targetX, targetY);
    this.storage.saveSettings({
      widgetX: targetX,
      widgetY: targetY,
    });
  }
}
