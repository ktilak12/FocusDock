import React from 'react';
import { Bell, Command, Eye, Monitor, Moon, Sun, User, Zap } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useTaskContext();
  const api = window.focusDockAPI;

  const handleLaunchOnStartupToggle = async (checked: boolean) => {
    await updateSettings({ launchOnStartup: checked });
    if (api) {
      await api.setLaunchOnStartup(checked);
    }
  };

  const handleAlwaysOnTopToggle = async (checked: boolean) => {
    await updateSettings({ alwaysOnTop: checked });
    if (api) {
      api.setAlwaysOnTop(checked);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl pb-10">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Customize FocusDock preferences</p>
      </div>

      {/* User Profile */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <User className="w-4 h-4 text-sky-400" />
          <span>User Profile</span>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400 font-medium w-24">Greeting Name</label>
          <input
            type="text"
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            placeholder="e.g. Tilak"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 w-48"
          />
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <Monitor className="w-4 h-4 text-indigo-400" />
          <span>Appearance</span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { id: 'system', label: 'System', icon: Monitor },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'light', label: 'Light', icon: Sun },
          ].map((themeOpt) => {
            const Icon = themeOpt.icon;
            const isSelected = settings.theme === themeOpt.id;
            return (
              <button
                key={themeOpt.id}
                onClick={() => updateSettings({ theme: themeOpt.id as any })}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{themeOpt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Widget Transparency Slider */}
        <div className="pt-3 border-t border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium text-xs text-slate-200">Widget Opacity / Transparency</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-xs font-semibold">
              {Math.round((settings.widgetOpacity ?? 0.5) * 100)}% Opacity
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Adjust how transparent the desktop widget appears on your screen (default: 50%).
          </p>
          <div className="flex items-center space-x-3 pt-1">
            <span className="text-[11px] text-slate-500 font-mono">20%</span>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={settings.widgetOpacity ?? 0.5}
              onChange={(e) => updateSettings({ widgetOpacity: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <span className="text-[11px] text-slate-500 font-mono">100%</span>
          </div>
        </div>
      </section>

      {/* Behavior & Windows Integration */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Desktop Integration & Behavior</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Launch on Startup */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-200">Launch FocusDock when Windows starts</p>
              <p className="text-[11px] text-slate-400">Automatically run in background on startup</p>
            </div>
            <input
              type="checkbox"
              checked={settings.launchOnStartup}
              onChange={(e) => handleLaunchOnStartupToggle(e.target.checked)}
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          {/* Always running */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div>
              <p className="font-medium text-slate-200">Keep app running in background</p>
              <p className="text-[11px] text-slate-400">Closing window minimizes to tray instead of quitting</p>
            </div>
            <input
              type="checkbox"
              checked={settings.keepRunningInBackground}
              onChange={(e) => updateSettings({ keepRunningInBackground: e.target.checked })}
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          {/* Always on top */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div>
              <p className="font-medium text-slate-200">Always on top</p>
              <p className="text-[11px] text-slate-400">Keep FocusDock window floating above other windows</p>
            </div>
            <input
              type="checkbox"
              checked={settings.alwaysOnTop}
              onChange={(e) => handleAlwaysOnTopToggle(e.target.checked)}
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <Bell className="w-4 h-4 text-emerald-400" />
          <span>Notifications & Reminders</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-200">Enable desktop notifications</p>
              <p className="text-[11px] text-slate-400">Show native Windows notifications when reminders trigger</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => updateSettings({ enableNotifications: e.target.checked })}
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div>
              <p className="font-medium text-slate-200">Default reminder sound</p>
              <p className="text-[11px] text-slate-400">Play chime sound with notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.reminderSound}
              onChange={(e) => updateSettings({ reminderSound: e.target.checked })}
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts Reference */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <Command className="w-4 h-4 text-rose-400" />
          <span>Keyboard Shortcuts</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { shortcut: 'Ctrl + Shift + Space', desc: 'Global Quick Add (Anywhere on Windows)' },
            { shortcut: 'Ctrl + K', desc: 'Instant Task Search' },
            { shortcut: 'Ctrl + N', desc: 'New Task' },
            { shortcut: 'Esc', desc: 'Close open dialogs/popups' },
          ].map((sc, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/40 last:border-none">
              <span className="text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400 font-mono text-[11px]">
                {sc.shortcut}
              </kbd>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
