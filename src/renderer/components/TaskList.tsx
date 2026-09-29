import React from 'react';
import { Coffee, Moon, Sun, Sunset, Sparkles } from 'lucide-react';
import { Task } from '../../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  filterType: string;
  isTodayView?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, filterType, isTodayView = false }) => {
  if (tasks.length === 0) {
    let title = 'No tasks found.';
    let subtitle = 'Create a task to keep your day focused.';

    if (filterType === 'today') {
      title = 'Nothing planned for today.';
      subtitle = 'Enjoy the breathing room 🌿';
    } else if (filterType === 'upcoming') {
      title = 'No upcoming tasks.';
      subtitle = 'You are all caught up!';
    } else if (filterType === 'completed') {
      title = 'No completed tasks yet.';
      subtitle = 'Checked off items will appear here.';
    } else if (filterType === 'important') {
      title = 'No important tasks.';
      subtitle = 'Star tasks to keep them highlighted.';
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-800 flex items-center justify-center text-slate-400">
          <Sparkles className="w-6 h-6 text-sky-400/80" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{subtitle}</p>
      </div>
    );
  }

  // If Today view, group into Morning, Afternoon, Evening, Anytime
  if (isTodayView) {
    const morningTasks: Task[] = [];
    const afternoonTasks: Task[] = [];
    const eveningTasks: Task[] = [];
    const anytimeTasks: Task[] = [];

    tasks.forEach((task) => {
      if (!task.time) {
        anytimeTasks.push(task);
      } else {
        const hour = parseInt(task.time.split(':')[0], 10);
        if (hour < 12) {
          morningTasks.push(task);
        } else if (hour < 17) {
          afternoonTasks.push(task);
        } else {
          eveningTasks.push(task);
        }
      }
    });

    const sections = [
      { id: 'morning', title: 'Morning', icon: Coffee, items: morningTasks, color: 'text-amber-400' },
      { id: 'afternoon', title: 'Afternoon', icon: Sun, items: afternoonTasks, color: 'text-sky-400' },
      { id: 'evening', title: 'Evening', icon: Sunset, items: eveningTasks, color: 'text-indigo-400' },
      { id: 'anytime', title: 'Anytime', icon: Moon, items: anytimeTasks, color: 'text-slate-400' },
    ];

    return (
      <div className="space-y-6">
        {sections.map((sec) => {
          if (sec.items.length === 0) return null;
          const Icon = sec.icon;

          return (
            <div key={sec.id} className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 tracking-wider uppercase">
                <Icon className={`w-3.5 h-3.5 ${sec.color}`} />
                <span>{sec.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">({sec.items.length})</span>
              </div>
              <div className="space-y-1.5">
                {sec.items.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Standard flat task list
  return (
    <div className="space-y-1.5">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};
