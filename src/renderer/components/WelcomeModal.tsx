import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export const WelcomeModal: React.FC = () => {
  const { isWelcomeModalOpen, setIsWelcomeModalOpen, updateSettings } = useTaskContext();
  const [step, setStep] = useState<'intro' | 'autostart'>('intro');

  if (!isWelcomeModalOpen) return null;

  const handleGetStarted = () => {
    setStep('autostart');
  };

  const handleFinish = async (enableAutoStart: boolean) => {
    await updateSettings({
      isFirstRun: false,
      launchOnStartup: enableAutoStart,
    });
    setIsWelcomeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-sky-500/25">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {step === 'intro' ? (
          <>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-100">Meet FocusDock</h2>
              <p className="text-xs text-slate-400">Keep your day in focus.</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              A minimal desktop companion designed to help you quickly manage tasks, schedule reminders, and work without distractions.
            </p>

            <button
              onClick={handleGetStarted}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-sky-500/20 active:scale-[0.98]"
            >
              Get Started
            </button>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-100">Start automatically with Windows?</h2>
              <p className="text-xs text-slate-400">FocusDock can run silently in your system tray on startup.</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleFinish(true)}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-sky-500/20 flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Yes, enable it</span>
              </button>

              <button
                onClick={() => handleFinish(false)}
                className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Not now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
