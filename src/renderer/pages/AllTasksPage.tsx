import React from 'react';
import { TaskList } from '../components/TaskList';
import { useTaskContext } from '../context/TaskContext';

export const AllTasksPage: React.FC = () => {
  const { tasks } = useTaskContext();
  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">All Tasks</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Overview of all active tasks</p>
      </div>

      <TaskList tasks={pendingTasks} filterType="all" />
    </div>
  );
};
