import React from 'react';
import { Calendar, CheckCircle2, Clock, Inbox, Plus, Settings, Star, Sun } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const Sidebar: React.FC = () => {
  const { activeFilter, setActiveFilter, tasks, setIsAddTaskModalOpen } = useTaskContext();

  const todayStr = new Date().toISOString().split('T')[0];

  const counts = {
    today: tasks.filter((t) => t.dueDate === todayStr && !t.completed).length,
    upcoming: tasks.filter((t) => t.dueDate && t.dueDate > todayStr && !t.completed).length,
    all: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    important: tasks.filter((t) => t.isImportant && !t.completed).length,
  };

  const navItems = [
    { id: 'today', label: 'Today', icon: Sun, count: counts.today, color: 'text-amber-400' },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar, count: counts.upcoming, color: 'text-sky-400' },
    { id: 'all', label: 'All Tasks', icon: Inbox, count: counts.all, color: 'text-indigo-400' },
    { id: 'important', label: 'Important', icon: Star, count: counts.important, color: 'text-rose-400' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: counts.completed, color: 'text-emerald-400' },
  ];

  return (
    <aside className="w-56 bg-slate-900/90 border-r border-slate-800/60 flex flex-col justify-between p-3 select-none">
      <div className="space-y-4">
        {/* Quick Add Button */}
        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-sky-500/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
          <span className="text-[10px] opacity-75 font-normal ml-auto bg-slate-950/20 px-1.5 py-0.5 rounded">
            Ctrl+N
          </span>
        </button>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveFilter(item.id)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-slate-700 text-slate-200' : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Footer */}
      <div className="pt-3 border-t border-slate-800/60">
        <button
          onClick={() => setActiveFilter('settings')}
          className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center space-x-2.5 transition-all ${
            activeFilter === 'settings'
              ? 'bg-slate-800 text-slate-100 border border-slate-700/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
