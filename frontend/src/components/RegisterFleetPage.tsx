import React from 'react';
import { ArrowLeft, Truck } from 'lucide-react';
import TransporterForm from './TransporterForm';

interface RegisterFleetPageProps {
  onBack?: () => void;
}

export default function RegisterFleetPage({ onBack }: RegisterFleetPageProps) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Truck size={18} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-black text-slate-900 dark:text-white min-[390px]:text-base">
              Register Fleet
            </h1>
            <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400 min-[390px]:text-[11px]">
              Add and verify your vehicles
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div className="mx-auto w-full max-w-3xl px-3 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-3 min-[390px]:px-4 min-[390px]:pt-4 sm:px-6 sm:pb-10">
          <TransporterForm />
        </div>
      </div>
    </div>
  );
}
