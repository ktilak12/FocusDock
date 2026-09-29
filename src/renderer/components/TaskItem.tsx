import React from 'react';
import { Calendar, Check, Clock, Repeat, Star, Tag } from 'lucide-react';
import { Task } from '../../types';
import { useTaskContext } from '../context/TaskContext';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, setEditingTask, updateTask } = useTaskContext();

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask(task.id);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask({ ...task, isImportant: !task.isImportant });
  };

  const priorityColor = {
    high: 'bg-rose-500 shadow-rose-500/50',
    medium: 'bg-amber-500 shadow-amber-500/50',
    low: 'bg-slate-500 opacity-60',
  }[task.priority];

  return (
    <div
      onClick={() => setEditingTask(task)}
      className={`group relative py-2.5 px-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between space-x-3 ${
        task.completed
          ? 'bg-slate-900/40 border-slate-800/40 opacity-60'
          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700/60 shadow-sm'
      }`}
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {/* Animated Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
            task.completed
              ? 'bg-sky-500 border-sky-500 text-slate-950 scale-105'
              : 'border-slate-600 hover:border-sky-400 bg-slate-900/60'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3] animate-checkmark" />}
        </button>

        {/* Priority dot indicator */}
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor}`}
          title={`Priority: ${task.priority}`}
        />

        {/* Task Title & Description */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-medium truncate transition-all duration-200 ${
              task.completed
                ? 'line-through text-slate-500'
                : 'text-slate-200 group-hover:text-slate-100'
            }`}
          >
            {task.title}
          </p>

          {/* Subtitle Badges */}
          <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400 font-normal">
            {task.time && (
              <span className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>{task.time}</span>
              </span>
            )}

            {task.repeatRule && task.repeatRule !== 'none' && (
              <span className="flex items-center space-x-1 text-indigo-400" title={`Repeats: ${task.repeatRule}`}>
                <Repeat className="w-3 h-3" />
                <span className="capitalize">{task.repeatRule}</span>
              </span>
            )}

            {task.category && task.category !== 'General' && (
              <span className="flex items-center space-x-1 text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded text-[10px]">
                <Tag className="w-2.5 h-2.5" />
                <span>{task.category}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Action: Star / Important */}
      <button
        onClick={handleStarClick}
        className={`p-1.5 rounded-lg transition-colors ${
          task.isImportant
            ? 'text-rose-400 hover:text-rose-300'
            : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
        }`}
        title={task.isImportant ? 'Remove from Important' : 'Mark as Important'}
      >
        <Star className={`w-3.5 h-3.5 ${task.isImportant ? 'fill-rose-400' : ''}`} />
      </button>
    </div>
  );
};
