import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Task } from '../../types';
import { useTaskContext } from '../context/TaskContext';
import { TaskItem } from './TaskItem';

export const SearchModal: React.FC = () => {
  const { isSearchModalOpen, setIsSearchModalOpen, tasks } = useTaskContext();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const filteredTasks: Task[] = query.trim()
    ? tasks.filter((t) => {
        const q = query.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-16 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[70vh]">
        {/* Search bar header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, descriptions, categories... (Esc to exit)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1.5">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Type to start searching across all tasks.
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No tasks matched "{query}".
            </div>
          ) : (
            filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)
          )}
        </div>
      </div>
    </div>
  );
};
