import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const QuickAddView: React.FC = () => {
  const { quickAddTask } = useTaskContext();
  const [input, setInput] = useState('');
  const api = window.focusDockAPI;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await quickAddTask(input.trim());
    setInput('');

    if (api) {
      api.closeWindow();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (api) api.closeWindow();
    }
  };

  return (
    <div className="w-screen h-screen bg-transparent p-2 flex items-center justify-center select-none">
      <div className="w-full h-full bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 flex flex-col justify-between backdrop-blur-xl app-drag-region">
        {/* Header */}
        <div className="flex items-center justify-between app-drag-region">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-slate-200 tracking-wide">Quick Add Task</span>
          </div>
          <button
            onClick={() => api?.closeWindow()}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 app-no-drag"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="app-no-drag mt-2">
          <input
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Finish DSA assignment tomorrow 7pm..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
            <span>Press Enter to save task</span>
            <span>Esc to close</span>
          </div>
        </form>
      </div>
    </div>
  );
};
