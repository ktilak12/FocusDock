import React from 'react';
import { TaskList } from '../components/TaskList';
import { useTaskContext } from '../context/TaskContext';

export const UpcomingPage: React.FC = () => {
  const { tasks } = useTaskContext();

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingTasks = tasks
    .filter((t) => t.dueDate && t.dueDate > todayStr && !t.completed)
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Upcoming Tasks</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Tasks scheduled for future dates</p>
      </div>

      <TaskList tasks={upcomingTasks} filterType="upcoming" />
    </div>
  );
};
