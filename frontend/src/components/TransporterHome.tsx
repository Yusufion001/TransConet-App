import React from 'react';
import { ArrowRight, BriefcaseBusiness, CircleDollarSign, LifeBuoy, Settings2, Truck, Navigation, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';

interface TransporterHomeProps {
  onNavigate?: (view: string) => void;
  userPhone?: string;
}

/**
 * Transporter-only home surface.
 * Presentation/navigation only: existing modules remain the source of truth for live data.
 */
export default function TransporterHome({ onNavigate, userPhone }: TransporterHomeProps) {
  const actions = [
    { view: 'marketplace', icon: BriefcaseBusiness, title: 'Find loads', text: 'Browse available cargo and matching opportunities.' },
    { view: 'driver-dashboard', icon: Navigation, title: 'My trips', text: 'Manage assigned trips and delivery progress.' },
    { view: 'fleet', icon: Truck, title: 'Fleet', text: 'Manage vehicles and verification.' },
    { view: 'wallet', icon: CircleDollarSign, title: 'Earnings', text: 'View your existing financial activity.' },
  ];

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] pb-[calc(6rem+env(safe-area-inset-bottom))] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,.05)] dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-brand-600">Transporter workspace</p>
              <h1 className="mt-2 text-[28px] font-black tracking-[-.035em] text-[#0B1F44] dark:text-white sm:text-4xl">Keep your fleet moving.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">Find verified loads, manage trips and keep your vehicles ready for the next job.</p>
              {userPhone && <p className="mt-3 text-xs font-semibold text-slate-400">Signed in as {userPhone}</p>}
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 sm:flex dark:bg-brand-950/40">
              <Truck size={24} />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            <ShieldCheck size={16} /> Use the operational modules below for live account data.
          </div>
        </section>

        <section className="mt-6" aria-labelledby="transporter-actions">
          <div className="mb-3 px-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">Operations</p>
            <h2 id="transporter-actions" className="mt-1 text-xl font-black tracking-tight text-[#0B1F44] dark:text-white">What do you need?</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map(({ view, icon: Icon, title, text }) => (
              <button key={view} type="button" onClick={() => onNavigate?.(view)} className="group flex min-h-[104px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,.04)] transition hover:border-brand-200 hover:shadow-md active:scale-[.995] dark:border-slate-800 dark:bg-slate-900">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-brand-600 dark:bg-slate-800"><Icon size={21} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-slate-900 dark:text-white">{title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="ghost" onClick={() => onNavigate?.('support')} className="min-h-14 justify-start rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm font-bold text-slate-800 shadow-none dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <LifeBuoy size={18} className="mr-3 text-brand-600" /> Help & support
          </Button>
          <Button type="button" variant="ghost" onClick={() => onNavigate?.('settings')} className="min-h-14 justify-start rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm font-bold text-slate-800 shadow-none dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <Settings2 size={18} className="mr-3 text-brand-600" /> Account settings
          </Button>
        </section>
      </div>
    </main>
  );
}
