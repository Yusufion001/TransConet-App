import React from 'react';
import { ArrowRight, PackageSearch, Store } from 'lucide-react';
import { Button } from './ui/Button';

export const HeroFindLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork?: () => void }) => (
  <section className="relative min-h-[220px] overflow-hidden rounded-2xl border border-[#16335F] bg-[#0B1F44] text-white shadow-[0_6px_22px_rgba(11,31,68,0.12)] sm:min-h-[250px]">
    <div className="absolute inset-y-0 right-0 w-[64%] bg-[#12366D]" />
    <img src="/images/transconet-market-card.svg" alt="Global cargo container operations" className="pointer-events-none absolute bottom-0 right-[-4%] h-[76%] w-[58%] object-contain object-right-bottom opacity-95 sm:right-0 sm:h-[84%] sm:w-[52%]" />
    <div className="absolute inset-y-0 right-[35%] w-16 bg-gradient-to-r from-[#0B1F44] to-transparent" />
    <div className="relative z-10 flex min-h-[220px] max-w-[74%] flex-col justify-center p-5 sm:min-h-[250px] sm:max-w-[58%] sm:p-7 md:p-8">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-blue-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Market operations</div>
      <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] sm:text-3xl">Market Operations</h2>
      <p className="mt-2 max-w-xl text-[14px] leading-6 text-blue-100 sm:text-[15px]">Find verified transport capacity and compare shipping opportunities across the TransConet network.</p>
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <Button onClick={() => onNavigateToNetwork?.()} className="h-11 w-full rounded-xl bg-white px-4 font-bold text-[#0B1F44] hover:bg-slate-100 sm:w-auto"><PackageSearch size={17} className="mr-2" /> Find Transport</Button>
        <Button onClick={() => onNavigateToNetwork?.()} variant="ghost" className="h-11 w-full rounded-xl border border-white/30 bg-transparent px-4 font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto"><Store size={16} className="mr-2" /> Marketplace <ArrowRight size={15} className="ml-2" /></Button>
      </div>
    </div>
  </section>
);
