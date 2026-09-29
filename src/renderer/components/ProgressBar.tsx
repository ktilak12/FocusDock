import React from 'react';

interface ProgressBarProps {
  completedCount: number;
  totalCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completedCount, totalCount }) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-1.5 my-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-300">Progress</span>
        <span>
          {completedCount} / {totalCount} tasks completed ({percentage}%)
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
