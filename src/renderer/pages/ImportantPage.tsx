import React from 'react';
import { TaskList } from '../components/TaskList';
import { useTaskContext } from '../context/TaskContext';

export const ImportantPage: React.FC = () => {
  const { tasks } = useTaskContext();
  const importantTasks = tasks.filter((t) => t.isImportant && !t.completed);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Important Tasks</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Starred priority items</p>
      </div>

      <TaskList tasks={importantTasks} filterType="important" />
    </div>
  );
};
