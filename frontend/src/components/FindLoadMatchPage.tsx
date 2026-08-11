import React from 'react';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react';
import ExpressMatcher from './ExpressMatcher';

interface FindLoadMatchPageProps {
  onBack?: () => void;
}

export default function FindLoadMatchPage({ onBack }: FindLoadMatchPageProps) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900 min-[390px]:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to transporter home"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={19} />
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
            <BriefcaseBusiness size={18} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-black text-slate-900 dark:text-white min-[390px]:text-base">
              Find Load Match
            </h1>
            <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400 min-[390px]:text-[11px]">
              Find cargo that matches your fleet
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ExpressMatcher
          initialMode="TRANSPORTER"
          initialSubMode="JOBS"
        />
      </div>
    </div>
  );
}
