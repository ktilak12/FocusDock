import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronDown, ChevronUp, Clock, Flame, Plus, Repeat, Tag, X } from 'lucide-react';
import { parseNaturalLanguageTask } from '../../shared/nlpParser';
import { Priority, RepeatRule } from '../../types';
import { useTaskContext } from '../context/TaskContext';

export const TaskInputModal: React.FC = () => {
  const { isAddTaskModalOpen, setIsAddTaskModalOpen, addTask } = useTaskContext();

  const [rawInput, setRawInput] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [repeatRule, setRepeatRule] = useState<RepeatRule>('none');
  const [category, setCategory] = useState('General');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isAddTaskModalOpen) {
      setRawInput('');
      setDescription('');
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      setDueDate(todayStr);
      setTime('');
      setPriority('medium');
      setRepeatRule('none');
      setCategory('General');
      setShowAdvanced(false);
    }
  }, [isAddTaskModalOpen]);

  if (!isAddTaskModalOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawInput(val);

    // Auto NLP preview if user types natural language terms
    if (val.length > 5 && !showAdvanced) {
      const parsed = parseNaturalLanguageTask(val);
      if (parsed.dueDate) setDueDate(parsed.dueDate);
      if (parsed.time) setTime(parsed.time);
      if (parsed.priority) setPriority(parsed.priority);
      if (parsed.repeatRule !== 'none') setRepeatRule(parsed.repeatRule);
      if (parsed.category !== 'General') setCategory(parsed.category);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    const parsed = parseNaturalLanguageTask(rawInput);
    const finalTitle = parsed.title.trim() || rawInput.trim();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const finalDueDate = dueDate || parsed.dueDate || todayStr;
    const finalTime = time || parsed.time;
    const finalReminder = finalDueDate && finalTime ? `${finalDueDate}T${finalTime}:00` : undefined;

    await addTask({
      title: finalTitle,
      description: description.trim() || undefined,
      completed: false,
      priority: priority || parsed.priority || 'medium',
      dueDate: finalDueDate,
      time: finalTime,
      reminderTime: finalReminder,
      repeatRule: repeatRule || parsed.repeatRule || 'none',
      category: category || parsed.category || 'General',
    });

    setIsAddTaskModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-200 tracking-wide uppercase">New Task</h2>
          <button
            onClick={() => setIsAddTaskModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Input field */}
          <div>
            <input
              type="text"
              autoFocus
              value={rawInput}
              onChange={handleInputChange}
              placeholder="What needs to be done? (e.g. Gym tomorrow at 7 PM)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Quick Toolbar (Date, Time, Priority) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Date Picker */}
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
              />
            </div>

            {/* Time Picker */}
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
              />
            </div>

            {/* Priority Selector */}
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer capitalize"
              >
                <option value="low" className="bg-slate-900">Low</option>
                <option value="medium" className="bg-slate-900">Medium</option>
                <option value="high" className="bg-slate-900">High</option>
              </select>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1 pt-1"
          >
            <span>{showAdvanced ? 'Hide advanced options' : 'More options (Repeat, Category, Notes)'}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Advanced Section */}
          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-slate-800/60 animate-in fade-in duration-150">
              {/* Description */}
              <div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add additional details or notes..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Repeat Rule */}
                <div>
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">Repeat</label>
                  <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
                    <Repeat className="w-3.5 h-3.5 text-indigo-400" />
                    <select
                      value={repeatRule}
                      onChange={(e) => setRepeatRule(e.target.value as RepeatRule)}
                      className="bg-transparent text-slate-200 focus:outline-none text-xs w-full capitalize"
                    >
                      <option value="none" className="bg-slate-900">Never</option>
                      <option value="daily" className="bg-slate-900">Every day</option>
                      <option value="weekdays" className="bg-slate-900">Every weekday</option>
                      <option value="weekly" className="bg-slate-900">Every week</option>
                      <option value="monthly" className="bg-slate-900">Every month</option>
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">Category</label>
                  <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Category"
                      className="bg-transparent text-slate-200 focus:outline-none text-xs w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddTaskModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-md shadow-sky-500/20"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
