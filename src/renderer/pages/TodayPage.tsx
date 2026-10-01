import React from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar';
import { TaskList } from '../components/TaskList';
import { useTaskContext } from '../context/TaskContext';

export const TodayPage: React.FC = () => {
  const { tasks, settings, setIsAddTaskModalOpen } = useTaskContext();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const dateFormatted = format(new Date(), 'EEEE, MMMM d');

  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  if (hour >= 17) greeting = 'Good evening';

  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return true;
    if (t.dueDate === todayStr) return true;
    if (!t.completed && t.dueDate < todayStr) return true;
    return false;
  });
  const completedCount = todayTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            {greeting}, {settings.userName || 'Tilak'}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{dateFormatted}</p>
        </div>

        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="py-1.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add task</span>
        </button>
      </div>

      {/* Progress Bar */}
      {todayTasks.length > 0 && (
        <ProgressBar completedCount={completedCount} totalCount={todayTasks.length} />
      )}

      {/* Task List grouped by Morning/Afternoon/Evening/Anytime */}
      <TaskList tasks={todayTasks} filterType="today" isTodayView={true} />
    </div>
  );
};
