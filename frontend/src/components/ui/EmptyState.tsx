import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl my-6">
      {/* Icon Wrapper */}
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-slate-50 dark:bg-slate-800 text-brand-500 border border-slate-100 dark:border-slate-700 shadow-inner">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate- mb-1">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 dark:text-slate- max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {/* Optional Call to Action */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-50 cursor-pointer hover:shadow-sm0 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <span>{actionLabel}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
};
