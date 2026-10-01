import React, { useState } from 'react';
import { format } from 'date-fns';
import { Compass, Maximize2, Minus, Pin, Plus, Settings, X } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { TaskItem } from './TaskItem';

export const WidgetView: React.FC = () => {
  const { tasks, settings, setIsAddTaskModalOpen, switchViewMode, setActiveFilter, updateSettings } = useTaskContext();
  const [isSnapMenuOpen, setIsSnapMenuOpen] = useState(false);
  const api = window.focusDockAPI;

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
  const pendingTodayCount = todayTasks.filter((t) => !t.completed).length;

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.screenX;
    const startY = e.screenY;
    const startWidth = window.outerWidth;
    const startHeight = window.outerHeight;

    let rafId: number | null = null;
    let lastX = startX;
    let lastY = startY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      lastX = moveEvent.screenX;
      lastY = moveEvent.screenY;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const deltaX = lastX - startX;
          const deltaY = lastY - startY;
          const newWidth = Math.max(250, startWidth + deltaX);
          const newHeight = Math.max(300, startHeight + deltaY);
          api?.setWindowSize(newWidth, newHeight);
        });
      }
    };

    const handlePointerUp = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="relative w-full h-full bg-slate-900 text-slate-100 p-5 flex flex-col justify-between select-none border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
      {/* Top Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Sleek Visual Drag Grip Handle */}
        <div className="app-drag-region cursor-move w-full flex items-center justify-center -mt-1 pb-2">
          <div
            className="w-14 h-1.5 bg-slate-600/70 hover:bg-sky-400/90 rounded-full transition-colors cursor-move"
            title="Click and drag to place anywhere on desktop"
          />
        </div>

        {/* Top Header Row: Greeting & Controls (Draggable) */}
        <div className="app-drag-region cursor-move flex items-center justify-between pb-1">
          <h2 className="app-drag-region cursor-move text-base font-bold text-slate-100 tracking-tight">
            {greeting}, {settings.userName || 'Tilak'}
          </h2>

          <div className="app-no-drag flex items-center space-x-1 text-slate-400">
            {/* Quick Snap to Desktop Corner */}
            <div className="relative">
              <button
                onClick={() => setIsSnapMenuOpen(!isSnapMenuOpen)}
                className={`p-1 rounded-lg transition-colors ${
                  isSnapMenuOpen ? 'text-sky-400 bg-sky-500/20' : 'hover:text-slate-200 hover:bg-slate-800/80'
                }`}
                title="Snap to Desktop Corner"
              >
                <Compass className="w-3.5 h-3.5" />
              </button>

              {isSnapMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl p-1.5 z-50 text-[11px] space-y-1">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                    Snap Position
                  </div>
                  <button
                    onClick={() => {
                      api?.snapToPosition('top-right');
                      setIsSnapMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                  >
                    <span>Top Right</span>
                    <span>↗</span>
                  </button>
                  <button
                    onClick={() => {
                      api?.snapToPosition('bottom-right');
                      setIsSnapMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                  >
                    <span>Bottom Right</span>
                    <span>↘</span>
                  </button>
                  <button
                    onClick={() => {
                      api?.snapToPosition('bottom-left');
                      setIsSnapMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                  >
                    <span>Bottom Left</span>
                    <span>↙</span>
                  </button>
                  <button
                    onClick={() => {
                      api?.snapToPosition('top-left');
                      setIsSnapMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                  >
                    <span>Top Left</span>
                    <span>↖</span>
                  </button>
                  <button
                    onClick={() => {
                      api?.snapToPosition('center');
                      setIsSnapMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center justify-between"
                  >
                    <span>Center</span>
                    <span>⏺</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => updateSettings({ alwaysOnTop: !settings.alwaysOnTop })}
              className={`p-1 rounded-lg transition-colors ${
                settings.alwaysOnTop ? 'text-sky-400 bg-sky-500/20' : 'hover:text-slate-200 hover:bg-slate-800/80'
              }`}
              title={settings.alwaysOnTop ? 'Pinned On Top of Windows' : 'Desktop / Home Screen Mode (Default)'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setActiveFilter('settings');
                switchViewMode('full');
              }}
              className="p-1 rounded-lg hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => switchViewMode('full')}
              className="p-1 rounded-lg hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              title="Expand to Full View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => api?.minimizeWindow()}
              className="p-1 rounded-lg hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => api?.closeWindow()}
              className="p-1 rounded-lg hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Hide to Tray"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Date Row (Draggable) */}
        <p className="app-drag-region cursor-move text-xs text-slate-400 font-medium">
          {dateFormatted}
        </p>

        {/* Task Count Header (Draggable) */}
        <div className="app-drag-region cursor-move mt-3 mb-2 flex items-center justify-between">
          <span className="app-drag-region text-xs font-semibold text-slate-300">
            {pendingTodayCount} {pendingTodayCount === 1 ? 'task' : 'tasks'} today
          </span>
          <span className="app-drag-region text-[11px] text-slate-500">
            {todayTasks.filter(t => t.completed).length} / {todayTasks.length} done
          </span>
        </div>

        {/* Task List (Scrollable, with Draggable Empty State) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-0">
          {todayTasks.length === 0 ? (
            <div className="app-drag-region cursor-move py-12 text-center text-xs text-slate-500 rounded-xl hover:bg-slate-800/30 transition-colors">
              <p className="app-drag-region font-medium text-slate-400">Nothing planned for today</p>
              <p className="app-drag-region text-[11px] text-slate-500 mt-1">Enjoy the breathing room 🌿</p>
              <p className="app-drag-region text-[10px] text-slate-600 mt-3 flex items-center justify-center space-x-1">
                <span>✦</span>
                <span>Click & drag anywhere to place on desktop</span>
                <span>✦</span>
              </p>
            </div>
          ) : (
            todayTasks.map((task) => (
              <div key={task.id} className="app-no-drag">
                <TaskItem task={task} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Action: + Add task */}
      <div className="pt-3 border-t border-slate-800/80 mt-2">
        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-sky-500/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add task</span>
        </button>
      </div>

      {/* Interactive Bottom-Right Corner Resize Grip */}
      <div
        onPointerDown={handleResizePointerDown}
        className="app-no-drag absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-0.5 text-slate-500 hover:text-sky-400 transition-colors select-none z-30 group"
        title="Click and drag to resize widget"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" className="fill-slate-500 group-hover:fill-sky-400 transition-colors">
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="4" r="1.2" />
          <circle cx="4" cy="8" r="1.2" />
        </svg>
      </div>
    </div>
  );
};
