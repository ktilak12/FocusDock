import React from 'react';
import { LayoutGrid, Minimize2, Minus, Maximize2, X, Search, Sparkles } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const Header: React.FC = () => {
  const { settings, switchViewMode, setIsSearchModalOpen, setIsAddTaskModalOpen } = useTaskContext();
  const api = window.focusDockAPI;

  const isWidget = settings.currentViewMode === 'widget';

  return (
    <header className="app-drag-region h-12 px-4 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md flex items-center justify-between select-none z-30">
      {/* Left Branding / Drag region */}
      <div className="flex items-center space-x-3 app-drag-region">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-wide text-slate-100 font-sans">
          FocusDock
        </span>
        {isWidget && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
            Widget
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-1.5 app-no-drag">
        {/* Search trigger */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title="Search (Ctrl + K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Mode Switcher */}
        <button
          onClick={() => switchViewMode(isWidget ? 'full' : 'widget')}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors flex items-center space-x-1 text-xs"
          title={isWidget ? 'Expand to Full Window' : 'Switch to Compact Widget'}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Window controls */}
        {api && (
          <>
            <button
              onClick={() => api.minimizeWindow()}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            {!isWidget && (
              <button
                onClick={() => api.maximizeWindow()}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                title="Maximize"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => api.closeWindow()}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Close to Tray"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
