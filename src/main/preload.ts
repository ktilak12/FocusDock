import { contextBridge, ipcRenderer } from 'electron';
import { AppSettings, FocusDockAPI, Task } from '../types';

const focusDockAPI: FocusDockAPI = {
  // Tasks
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  saveTasks: (tasks: Task[]) => ipcRenderer.invoke('save-tasks', tasks),
  addTask: (task) => ipcRenderer.invoke('add-task', task),
  updateTask: (task: Task) => ipcRenderer.invoke('update-task', task),
  deleteTask: (id: string) => ipcRenderer.invoke('delete-task', id),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: AppSettings) => ipcRenderer.invoke('save-settings', settings),

  // Window Controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  hideToTray: () => ipcRenderer.send('window-hide-tray'),
  setAlwaysOnTop: (alwaysOnTop: boolean) => ipcRenderer.send('set-always-on-top', alwaysOnTop),
  setWindowView: (mode: 'full' | 'widget' | 'quick-add') => ipcRenderer.send('set-window-view', mode),
  setWindowSize: (width: number, height: number) => ipcRenderer.send('set-window-size', { width, height }),
  snapToPosition: (pos: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'center') =>
    ipcRenderer.send('snap-to-position', pos),

  // System & AutoStart
  setLaunchOnStartup: (enabled: boolean) => ipcRenderer.invoke('set-launch-on-startup', enabled),
  triggerNotification: (title: string, body: string, taskId?: string) =>
    ipcRenderer.send('trigger-notification', { title, body, taskId }),

  // Event Listeners
  onViewChange: (callback: (mode: 'full' | 'widget' | 'quick-add') => void) => {
    const handler = (_event: any, mode: 'full' | 'widget' | 'quick-add') => callback(mode);
    ipcRenderer.on('view-changed', handler);
    return () => ipcRenderer.removeListener('view-changed', handler);
  },
  onQuickAddTriggered: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('quick-add-triggered', handler);
    return () => ipcRenderer.removeListener('quick-add-triggered', handler);
  },
  onTaskReminderTriggered: (callback: (taskId: string) => void) => {
    const handler = (_event: any, taskId: string) => callback(taskId);
    ipcRenderer.on('task-reminder-triggered', handler);
    return () => ipcRenderer.removeListener('task-reminder-triggered', handler);
  },
};

contextBridge.exposeInMainWorld('focusDockAPI', focusDockAPI);
