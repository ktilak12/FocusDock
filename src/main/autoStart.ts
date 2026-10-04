import { app } from 'electron';
import path from 'path';

export function configureAutoStart(enable: boolean): boolean {
  try {
    const isPackaged = app.isPackaged;
    const args = isPackaged
      ? ['--process-start-args', '--widget']
      : [path.join(__dirname, 'index.js')];

    app.setLoginItemSettings({
      openAtLogin: enable,
      path: process.execPath,
      args,
    });
    return true;
  } catch (err) {
    console.error('Failed to update Windows startup settings:', err);
    return false;
  }
}
