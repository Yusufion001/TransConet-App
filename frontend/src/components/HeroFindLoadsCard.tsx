import React from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, ArrowRight, ShieldCheck, PackageSearch } from 'lucide-react';
import { Button } from './ui/Button';

export const HeroFindLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork?: () => void }) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-brand-600 text-white shadow-[0_12px_35px_rgba(37,99,235,0.16)] dark:border-brand-500/20"
  >
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.20),transparent_25%),linear-gradient(135deg,transparent_35%,rgba(15,23,42,0.16))]" />
    <div className="relative p-5 sm:p-7 md:p-9">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Live marketplace
          </span>
          <h2 className="mt-5 max-w-2xl text-[27px] font-black tracking-tight sm:text-3xl md:text-4xl">Market Operations</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-50 sm:text-base">Post cargo, find verified transporters and compare shipping rates and bids from one trusted operations hub.</p>
        </div>
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 sm:flex"><MapPin size={22} /></div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-blue-100">Post cargo</p><p className="mt-1 text-xs font-semibold">Create a shipment</p></div>
        <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-blue-100">Transport</p><p className="mt-1 text-xs font-semibold">Find verified capacity</p></div>
        <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-blue-100">Quotes</p><p className="mt-1 text-xs font-semibold">Compare live bids</p></div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Button onClick={() => onNavigateToNetwork?.()} className="w-full rounded-xl bg-white px-4 py-3 font-bold text-brand-700 hover:bg-blue-50 sm:w-auto">
          <PackageSearch size={17} className="mr-2" /> Find Transport
        </Button>
        <Button onClick={() => onNavigateToNetwork?.()} variant="ghost" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto">
          Go to Marketplace <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>

      <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold text-blue-100">
        <ShieldCheck size={13} /> Verified network operations
      </div>
    </div>
  </motion.section>
);
