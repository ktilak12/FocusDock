import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { AppSettings, Task } from '../types';

export interface DatabaseSchema {
  settings: AppSettings;
  tasks: Task[];
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  userName: 'Tilak',
  launchOnStartup: true,
  keepRunningInBackground: true,
  alwaysOnTop: false,
  enableNotifications: true,
  reminderSound: true,
  snoozeDurationMinutes: 10,
  widgetOpacity: 0.5,
  widgetSize: 'standard',
  showCompletedInWidget: true,
  isFirstRun: false,
  currentViewMode: 'widget',
  activeFilter: 'today',
};

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SAMPLE_TASKS: Task[] = [];

export class StorageService {
  private filePath: string;
  private data: DatabaseSchema;

  constructor() {
    const userDataPath = app ? app.getPath('userData') : process.cwd();
    this.filePath = path.join(userDataPath, 'focusdock_db.json');
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : SAMPLE_TASKS,
        };
      }
    } catch (err) {
      console.error('Failed to load FocusDock database, falling back to defaults:', err);
    }

    const initialData: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      tasks: SAMPLE_TASKS,
    };
    this.saveData(initialData);
    return initialData;
  }

  private saveTimeout: NodeJS.Timeout | null = null;
  private isWriting: boolean = false;
  private hasPendingSave: boolean = false;

  private saveData(data: DatabaseSchema, immediate: boolean = false): boolean {
    this.data = data;

    if (immediate) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }
      return this.flushSync();
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      this.flushAsync();
    }, 300);

    return true;
  }

  public flushSync(): boolean {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
      return true;
    } catch (err) {
      console.error('Failed to save FocusDock database synchronously:', err);
      return false;
    }
  }

  private async flushAsync(): Promise<boolean> {
    if (this.isWriting) {
      this.hasPendingSave = true;
      return false;
    }

    this.isWriting = true;
    this.hasPendingSave = false;

    try {
      const tempPath = `${this.filePath}.tmp`;
      const content = JSON.stringify(this.data, null, 2);
      await fs.promises.writeFile(tempPath, content, 'utf-8');
      await fs.promises.rename(tempPath, this.filePath);
    } catch (err) {
      console.error('Failed to save FocusDock database asynchronously:', err);
    } finally {
      this.isWriting = false;
      if (this.hasPendingSave) {
        this.flushAsync();
      }
    }

    return true;
  }

  public getTasks(): Task[] {
    return this.data.tasks;
  }

  public saveTasks(tasks: Task[]): boolean {
    return this.saveData({ ...this.data, tasks });
  }

  public addTask(taskInput: Omit<Task, 'id' | 'createdAt'>): Task {
    const newTask: Task = {
      ...taskInput,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const newTasks = [newTask, ...this.data.tasks];
    this.saveData({ ...this.data, tasks: newTasks }, true);
    return newTask;
  }

  public updateTask(task: Task): Task {
    const newTasks = [...this.data.tasks];
    const index = newTasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      newTasks[index] = task;
    } else {
      newTasks.unshift(task);
    }
    this.saveData({ ...this.data, tasks: newTasks });
    return task;
  }

  public deleteTask(id: string): boolean {
    const newTasks = this.data.tasks.filter((t) => t.id !== id);
    return this.saveData({ ...this.data, tasks: newTasks });
  }

  public getSettings(): AppSettings {
    return this.data.settings;
  }

  public saveSettings(settingsPartial: Partial<AppSettings>, immediate: boolean = false): boolean {
    const newSettings = { ...this.data.settings, ...settingsPartial };
    return this.saveData({ ...this.data, settings: newSettings }, immediate);
  }
}

