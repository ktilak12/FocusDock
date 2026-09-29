export type Priority = 'low' | 'medium' | 'high';

export type RepeatRule = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  reminderTime?: string; // ISO string
  repeatRule: RepeatRule;
  category: string;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  isImportant?: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  userName: string;
  launchOnStartup: boolean;
  keepRunningInBackground: boolean;
  alwaysOnTop: boolean;
  enableNotifications: boolean;
  reminderSound: boolean;
  snoozeDurationMinutes: number;
  widgetOpacity: number;
  widgetSize: 'compact' | 'standard' | 'large';
  showCompletedInWidget: boolean;
  isFirstRun: boolean;
  currentViewMode: 'full' | 'widget' | 'quick-add';
  activeFilter: string;
  widgetX?: number;
  widgetY?: number;
  widgetWidth?: number;
  widgetHeight?: number;
}

export interface SearchQuery {
  term: string;
  category?: string;
  priority?: Priority;
}

export interface SystemInfo {
  platform: string;
  version: string;
}

export interface FocusDockAPI {
  // Task Storage
  getTasks: () => Promise<Task[]>;
  saveTasks: (tasks: Task[]) => Promise<boolean>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (task: Task) => Promise<Task>;
  deleteTask: (id: string) => Promise<boolean>;
  
  // Settings
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<boolean>;
  
  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  hideToTray: () => void;
  setAlwaysOnTop: (alwaysOnTop: boolean) => void;
  setWindowView: (mode: 'full' | 'widget' | 'quick-add') => void;
  setWindowSize: (width: number, height: number) => void;
  snapToPosition: (pos: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'center') => void;
  
  // System Tray & Auto Launch & Notifications
  setLaunchOnStartup: (enabled: boolean) => Promise<boolean>;
  triggerNotification: (title: string, body: string, taskId?: string) => void;
  
  // Event Listeners
  onViewChange: (callback: (mode: 'full' | 'widget' | 'quick-add') => void) => () => void;
  onQuickAddTriggered: (callback: () => void) => () => void;
  onTaskReminderTriggered: (callback: (taskId: string) => void) => () => void;
}

declare global {
  interface Window {
    focusDockAPI?: FocusDockAPI;
  }
}
