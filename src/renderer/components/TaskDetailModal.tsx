import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Flame, Repeat, Star, Tag, Trash2, X } from 'lucide-react';
import { Priority, RepeatRule, Task } from '../../types';
import { useTaskContext } from '../context/TaskContext';

export const TaskDetailModal: React.FC = () => {
  const { editingTask, setEditingTask, updateTask, deleteTask } = useTaskContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [repeatRule, setRepeatRule] = useState<RepeatRule>('none');
  const [category, setCategory] = useState('General');
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate || '');
      setTime(editingTask.time || '');
      setPriority(editingTask.priority);
      setRepeatRule(editingTask.repeatRule);
      setCategory(editingTask.category || 'General');
      setIsImportant(editingTask.isImportant || false);
    }
  }, [editingTask]);

  if (!editingTask) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const reminderTime = dueDate && time ? `${dueDate}T${time}:00` : undefined;

    const updated: Task = {
      ...editingTask,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      time: time || undefined,
      reminderTime,
      priority,
      repeatRule,
      category: category.trim() || 'General',
      isImportant,
    };

    await updateTask(updated);
    setEditingTask(null);
  };

  const handleDelete = async () => {
    await deleteTask(editingTask.id);
    setEditingTask(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Edit Task</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsImportant(!isImportant)}
              className={`p-1.5 rounded-lg transition-colors ${
                isImportant ? 'text-rose-400 bg-rose-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Important"
            >
              <Star className={`w-4 h-4 ${isImportant ? 'fill-rose-400' : ''}`} />
            </button>
            <button
              onClick={() => setEditingTask(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Notes, links, or context..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Due Date</label>
              <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none text-xs w-full cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Reminder Time</label>
              <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none text-xs w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Priority & Repeat */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
              <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="bg-transparent text-slate-200 focus:outline-none text-xs w-full capitalize"
                >
                  <option value="low" className="bg-slate-900">Low</option>
                  <option value="medium" className="bg-slate-900">Medium</option>
                  <option value="high" className="bg-slate-900">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Repeat</label>
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
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none text-xs w-full"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
