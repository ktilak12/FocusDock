import React from 'react';
import { TaskList } from '../components/TaskList';
import { useTaskContext } from '../context/TaskContext';

export const CompletedPage: React.FC = () => {
  const { tasks } = useTaskContext();
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Completed Tasks</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Tasks you have successfully checked off</p>
      </div>

      <TaskList tasks={completedTasks} filterType="completed" />
    </div>
  );
};
