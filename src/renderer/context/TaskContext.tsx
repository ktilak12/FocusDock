import React, { createContext, useContext, useEffect, useState } from 'react';
import { parseNaturalLanguageTask } from '../../shared/nlpParser';
import { AppSettings, Priority, RepeatRule, Task } from '../../types';

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

interface TaskContextType {
  tasks: Task[];
  settings: AppSettings;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAddTaskModalOpen: boolean;
  setIsAddTaskModalOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isWelcomeModalOpen: boolean;
  setIsWelcomeModalOpen: (open: boolean) => void;
  
  // Actions
  addTask: (taskInput: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  quickAddTask: (inputStr: string) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  switchViewMode: (mode: 'full' | 'widget' | 'quick-add') => void;
  refreshData: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeFilter, setActiveFilter] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);

  const api = window.focusDockAPI;

  const refreshData = async () => {
    if (api) {
      const [fetchedTasks, fetchedSettings] = await Promise.all([
        api.getTasks(),
        api.getSettings(),
      ]);
      const uniqueTasks = fetchedTasks.filter((t, index, self) => index === self.findIndex((x) => x.id === t.id));
      setTasks(uniqueTasks);
      setSettings(fetchedSettings);
      if (fetchedSettings.isFirstRun) {
        setIsWelcomeModalOpen(true);
      }
    }
  };

  useEffect(() => {
    refreshData();

    if (api) {
      const unsubView = api.onViewChange((mode) => {
        setSettings((prev) => ({ ...prev, currentViewMode: mode }));
      });
      const unsubQuick = api.onQuickAddTriggered(() => {
        setIsAddTaskModalOpen(true);
      });
      const unsubReminder = api.onTaskReminderTriggered((taskId) => {
        setTasks((currentTasks) => {
          const found = currentTasks.find((t) => t.id === taskId);
          if (found) setEditingTask(found);
          return currentTasks;
        });
      });
      const unsubTasksUpdated = api.onTasksUpdated?.(() => {
        refreshData();
      });

      return () => {
        unsubView();
        unsubQuick();
        unsubReminder();
        if (unsubTasksUpdated) unsubTasksUpdated();
      };
    }
  }, []);

  // Update theme class on root html
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const addTask = async (taskInput: Omit<Task, 'id' | 'createdAt'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const finalInput = {
      ...taskInput,
      dueDate: taskInput.dueDate || todayStr,
    };
    if (api) {
      const newTask = await api.addTask(finalInput);
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
    } else {
      const newTask: Task = {
        ...finalInput,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const quickAddTask = async (inputStr: string) => {
    if (!inputStr.trim()) return;
    const parsed = parseNaturalLanguageTask(inputStr);
    const todayStr = new Date().toISOString().split('T')[0];
    await addTask({
      title: parsed.title,
      completed: false,
      priority: parsed.priority,
      dueDate: parsed.dueDate || todayStr,
      time: parsed.time,
      reminderTime: parsed.reminderTime,
      repeatRule: parsed.repeatRule,
      category: parsed.category,
    });
  };

  const updateTask = async (task: Task) => {
    if (api) {
      const updated = await api.updateTask(task);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  };

  const toggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const isNowCompleted = !target.completed;
    const updatedTask: Task = {
      ...target,
      completed: isNowCompleted,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    };

    await updateTask(updatedTask);

    // If completed and has repeatRule, generate next instance!
    if (isNowCompleted && target.repeatRule && target.repeatRule !== 'none') {
      const todayStr = new Date().toISOString().split('T')[0];
      await addTask({
        title: target.title,
        description: target.description,
        completed: false,
        priority: target.priority,
        dueDate: todayStr,
        time: target.time,
        repeatRule: target.repeatRule,
        category: target.category,
        isImportant: target.isImportant,
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (api) {
      await api.deleteTask(id);
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSettings = async (newSettingsPartial: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettingsPartial };
    setSettings(updated);
    if (api) {
      await api.saveSettings(updated);
    }
  };

  const switchViewMode = (mode: 'full' | 'widget' | 'quick-add') => {
    setSettings((prev) => ({ ...prev, currentViewMode: mode }));
    if (api) {
      api.setWindowView(mode);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        settings,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        isAddTaskModalOpen,
        setIsAddTaskModalOpen,
        editingTask,
        setEditingTask,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isWelcomeModalOpen,
        setIsWelcomeModalOpen,
        addTask,
        quickAddTask,
        updateTask,
        toggleTask,
        deleteTask,
        updateSettings,
        switchViewMode,
        refreshData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
