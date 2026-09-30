import { Notification } from 'electron';
import { addDays, addMonths, addWeeks, format, isBefore, parseISO } from 'date-fns';
import { RepeatRule, Task } from '../types';
import { StorageService } from './store';
import { WindowManager } from './windowManager';

export class ReminderScheduler {
  private storage: StorageService;
  private windowManager: WindowManager;
  private intervalId: NodeJS.Timeout | null = null;
  private notifiedTaskReminders: Set<string> = new Set();

  constructor(storage: StorageService, windowManager: WindowManager) {
    this.storage = storage;
    this.windowManager = windowManager;
  }

  public start() {
    // Check every 15 seconds for precise reminder delivery
    this.intervalId = setInterval(() => this.checkReminders(), 15000);
    // Immediate check on boot/wake
    this.checkReminders();
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private checkReminders() {
    const settings = this.storage.getSettings();
    if (!settings.enableNotifications) return;

    const tasks = this.storage.getTasks();
    const now = new Date();

    for (const task of tasks) {
      if (task.completed || !task.reminderTime) continue;

      try {
        const reminderDate = parseISO(task.reminderTime);

        // Check if reminder is due or missed (within the last 2 hours to avoid ancient stale notifications)
        if (isBefore(reminderDate, now)) {
          const reminderKey = `${task.id}_${task.reminderTime}`;

          if (!this.notifiedTaskReminders.has(reminderKey)) {
            this.notifiedTaskReminders.add(reminderKey);
            this.triggerTaskNotification(task);
          }
        }
      } catch (err) {
        console.error(`Invalid reminder date format for task ${task.id}:`, err);
      }
    }
  }

  public triggerTaskNotification(task: Task) {
    const settings = this.storage.getSettings();
    if (!settings.enableNotifications) return;

    if (!Notification.isSupported()) {
      console.warn('Native desktop notifications are not supported on this platform.');
      return;
    }

    const notification = new Notification({
      title: 'FocusDock Reminder',
      subtitle: task.title,
      body: task.description || `Priority: ${task.priority.toUpperCase()} | Time: ${task.time || 'Today'}`,
      silent: !settings.reminderSound,
      actions: [
        { type: 'button', text: 'Complete' },
        { type: 'button', text: `Snooze ${settings.snoozeDurationMinutes}m` },
      ],
    });

    notification.on('click', () => {
      this.windowManager.showMainWindow();
      const win = this.windowManager.getMainWindow();
      if (win) {
        win.webContents.send('task-reminder-triggered', task.id);
      }
    });

    notification.on('action', (_event, index) => {
      if (index === 0) {
        // Complete Task Action
        this.handleCompleteTask(task);
      } else if (index === 1) {
        // Snooze Task Action
        this.handleSnoozeTask(task, settings.snoozeDurationMinutes);
      }
    });

    notification.show();
  }

  public handleCompleteTask(task: Task) {
    const tasks = this.storage.getTasks();
    const target = tasks.find((t) => t.id === task.id);
    if (!target) return;

    target.completed = true;
    target.completedAt = new Date().toISOString();
    this.storage.saveTasks(tasks);

    // If recurring task, schedule next occurrence automatically!
    if (target.repeatRule && target.repeatRule !== 'none') {
      this.createNextRecurringTask(target);
    }

    const win = this.windowManager.getMainWindow();
    if (win) {
      win.webContents.send('tasks-updated');
    }
  }

  public handleSnoozeTask(task: Task, snoozeMinutes: number) {
    const tasks = this.storage.getTasks();
    const target = tasks.find((t) => t.id === task.id);
    if (!target) return;

    const snoozedDate = new Date(Date.now() + snoozeMinutes * 60 * 1000);
    target.reminderTime = snoozedDate.toISOString();
    target.dueDate = format(snoozedDate, 'yyyy-MM-dd');
    target.time = format(snoozedDate, 'HH:mm');

    this.storage.saveTasks(tasks);

    const win = this.windowManager.getMainWindow();
    if (win) {
      win.webContents.send('tasks-updated');
    }
  }

  public createNextRecurringTask(completedTask: Task) {
    const rule = completedTask.repeatRule;
    if (!rule || rule === 'none') return;

    const baseDate = completedTask.dueDate ? parseISO(completedTask.dueDate) : new Date();
    let nextDate: Date;

    switch (rule) {
      case 'daily':
        nextDate = addDays(baseDate, 1);
        break;
      case 'weekdays': {
        const dayOfWeek = baseDate.getDay();
        if (dayOfWeek === 5) {
          // Friday -> Next Monday (+3 days)
          nextDate = addDays(baseDate, 3);
        } else if (dayOfWeek === 6) {
          // Saturday -> Next Monday (+2 days)
          nextDate = addDays(baseDate, 2);
        } else {
          nextDate = addDays(baseDate, 1);
        }
        break;
      }
      case 'weekly':
        nextDate = addWeeks(baseDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(baseDate, 1);
        break;
      default:
        nextDate = addDays(baseDate, 1);
    }

    const nextDueDateStr = format(nextDate, 'yyyy-MM-dd');
    let nextReminderTimeStr: string | undefined = undefined;

    if (completedTask.time) {
      nextReminderTimeStr = `${nextDueDateStr}T${completedTask.time}:00`;
    }

    this.storage.addTask({
      title: completedTask.title,
      description: completedTask.description,
      completed: false,
      priority: completedTask.priority,
      dueDate: nextDueDateStr,
      time: completedTask.time,
      reminderTime: nextReminderTimeStr,
      repeatRule: completedTask.repeatRule,
      category: completedTask.category,
      isImportant: completedTask.isImportant,
    });
  }
}
