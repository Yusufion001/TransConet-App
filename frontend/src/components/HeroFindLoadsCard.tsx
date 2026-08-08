import React from 'react';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { Button } from './ui/Button';

export const HeroFindLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork?: () => void }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-brand-600 bg-white shadow-sm dark:border-slate-700 dark:border-l-brand-500 dark:bg-slate-900">
    <div className="p-5 sm:p-7 md:p-8">
      <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Market Operations</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
        Post cargo, find verified transporters and compare shipping rates and bids from one trusted operations hub.
      </p>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Button onClick={() => onNavigateToNetwork?.()} className="w-full rounded-xl bg-brand-600 px-4 py-3 font-bold text-white hover:bg-brand-700 sm:w-auto">
          <PackageSearch size={17} className="mr-2" /> Find Transport
        </Button>
        <Button onClick={() => onNavigateToNetwork?.()} variant="ghost" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto">
          Go to Marketplace <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  </section>
);
