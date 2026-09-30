import { globalShortcut } from 'electron';
import { WindowManager } from './windowManager';

export class ShortcutManager {
  private windowManager: WindowManager;

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager;
  }

  public registerGlobalShortcuts() {
    // Global shortcut Ctrl+Shift+Space to toggle Quick Add anywhere on Windows
    const ret = globalShortcut.register('CommandOrControl+Shift+Space', () => {
      this.windowManager.toggleQuickAddWindow();
    });

    if (!ret) {
      console.warn('Failed to register global shortcut CommandOrControl+Shift+Space');
    }
  }

  public unregisterAll() {
    globalShortcut.unregisterAll();
  }
}
