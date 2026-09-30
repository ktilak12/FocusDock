import { app, Menu, nativeImage, Tray } from 'electron';
import { StorageService } from './store';
import { WindowManager } from './windowManager';

export class TrayManager {
  private tray: Tray | null = null;
  private windowManager: WindowManager;
  private storage: StorageService;
  private isNotificationsPaused: boolean = false;

  constructor(windowManager: WindowManager, storage: StorageService) {
    this.windowManager = windowManager;
    this.storage = storage;
  }

  public createTray(): Tray | null {
    try {
      const iconDataUrl = this.generateTrayIconPNG();
      const icon = nativeImage.createFromDataURL(iconDataUrl);

      this.tray = new Tray(icon);
      this.tray.setToolTip('FocusDock - Personal Desktop Companion');

      this.updateContextMenu();

      this.tray.on('click', () => {
        this.windowManager.showMainWindow();
      });

      this.tray.on('double-click', () => {
        this.windowManager.showMainWindow();
      });

      return this.tray;
    } catch (err) {
      console.error('Failed to create system tray icon:', err);
      return null;
    }
  }

  public updateContextMenu() {
    if (!this.tray) return;

    const todayString = new Date().toISOString().split('T')[0];
    const tasks = this.storage.getTasks();
    const todayTasks = tasks.filter((t) => t.dueDate === todayString && !t.completed);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'FocusDock',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Show FocusDock',
        click: () => {
          this.windowManager.showMainWindow();
        },
      },
      {
        label: 'Quick Add (Ctrl+Shift+Space)',
        click: () => {
          this.windowManager.toggleQuickAddWindow();
        },
      },
      {
        label: `Today's Tasks (${todayTasks.length} pending)`,
        click: () => {
          const win = this.windowManager.getMainWindow();
          if (win) {
            win.webContents.send('navigate-tab', 'today');
          }
          this.windowManager.showMainWindow();
        },
      },
      { type: 'separator' },
      {
        label: this.isNotificationsPaused ? 'Resume Notifications' : 'Pause Notifications',
        type: 'checkbox',
        checked: this.isNotificationsPaused,
        click: () => {
          this.isNotificationsPaused = !this.isNotificationsPaused;
          const settings = this.storage.getSettings();
          this.storage.saveSettings({ enableNotifications: !this.isNotificationsPaused });
          this.updateContextMenu();
        },
      },
      {
        label: 'Settings',
        click: () => {
          const win = this.windowManager.getMainWindow();
          if (win) {
            win.webContents.send('navigate-tab', 'settings');
          }
          this.windowManager.showMainWindow();
        },
      },
      { type: 'separator' },
      {
        label: 'Quit FocusDock',
        click: () => {
          this.windowManager.setQuitting(true);
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private generateTrayIconPNG(): string {
    // 16x16 PNG icon with a glowing sky-blue focus circle
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA6SURBVDhPY2AYBaNgFNAIDB48+D8D0cChgweJiAbS5EFKMxItYBjVAFIMIHk9iAYOHTxIeDRQDAZCAAB6JRsxL822xQAAAABJRU5ErkJggg==';
  }
}
