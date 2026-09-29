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
  widgetOpacity: 0.95,
  widgetSize: 'standard',
  showCompletedInWidget: true,
  isFirstRun: false,
  currentViewMode: 'widget',
  activeFilter: 'today',
};

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
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

  private saveData(data: DatabaseSchema): boolean {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
      this.data = data;
      return true;
    } catch (err) {
      console.error('Failed to save FocusDock database:', err);
      return false;
    }
  }

  public getTasks(): Task[] {
    return this.data.tasks;
  }

  public saveTasks(tasks: Task[]): boolean {
    this.data.tasks = tasks;
    return this.saveData(this.data);
  }

  public addTask(taskInput: Omit<Task, 'id' | 'createdAt'>): Task {
    const newTask: Task = {
      ...taskInput,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.tasks.unshift(newTask);
    this.saveData(this.data);
    return newTask;
  }

  public updateTask(task: Task): Task {
    const index = this.data.tasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      this.data.tasks[index] = task;
    } else {
      this.data.tasks.unshift(task);
    }
    this.saveData(this.data);
    return task;
  }

  public deleteTask(id: string): boolean {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    return this.saveData(this.data);
  }

  public getSettings(): AppSettings {
    return this.data.settings;
  }

  public saveSettings(settingsPartial: Partial<AppSettings>): boolean {
    this.data.settings = { ...this.data.settings, ...settingsPartial };
    return this.saveData(this.data);
  }
}
