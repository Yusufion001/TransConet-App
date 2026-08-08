import React from 'react';
import { ArrowRight, PackageSearch, Store } from 'lucide-react';
import { Button } from './ui/Button';

export const HeroFindLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork?: () => void }) => (
  <section className="relative min-h-[250px] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900 sm:min-h-[285px]">
    <div className="absolute inset-y-0 right-0 w-[62%] bg-gradient-to-l from-blue-50/90 via-blue-50/35 to-transparent dark:from-brand-950/70 dark:via-brand-950/20 dark:to-transparent" />
    <img
      src="/images/transconet-market-card.svg"
      alt="Global cargo container operations"
      className="pointer-events-none absolute bottom-0 right-[-5%] h-[72%] w-[58%] object-contain object-right-bottom opacity-95 sm:right-0 sm:h-[82%] sm:w-[52%]"
    />
    <div className="relative z-10 flex min-h-[250px] max-w-[72%] flex-col justify-center p-5 sm:min-h-[285px] sm:max-w-[58%] sm:p-7 md:p-8">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Market Operations
      </div>
      <h2 className="text-[25px] font-black leading-tight tracking-[-0.02em] text-slate-950 dark:text-white sm:text-3xl">Market Operations</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
        Post cargo, find verified transporters and compare shipping rates and bids from one trusted operations hub.
      </p>
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <Button onClick={() => onNavigateToNetwork?.()} className="h-11 w-full rounded-xl bg-brand-600 px-4 font-bold text-white shadow-sm hover:bg-brand-700 sm:w-auto">
          <PackageSearch size={17} className="mr-2" /> Find Transport
        </Button>
        <Button onClick={() => onNavigateToNetwork?.()} variant="ghost" className="h-11 w-full rounded-xl border border-slate-200 bg-white/90 px-4 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto">
          <Store size={16} className="mr-2" /> Marketplace <ArrowRight size={15} className="ml-2" />
        </Button>
      </div>
    </div>
  </section>
);
