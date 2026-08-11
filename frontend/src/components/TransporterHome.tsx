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
    { view: 'find-load-match', icon: BriefcaseBusiness, title: 'Find Load Match', text: 'Find cargo that matches your fleet, route and capacity.' },
    { view: 'register-fleet', icon: Truck, title: 'Register Fleet', text: 'Register and verify your vehicles for load matching.' },
    { view: 'driver-dashboard', icon: Navigation, title: 'My trips', text: 'Manage assigned trips and delivery progress.' },
    { view: 'fleet', icon: Truck, title: 'Fleet', text: 'Manage vehicles and verification.' },
    { view: 'wallet', icon: CircleDollarSign, title: 'Earnings', text: 'View your existing financial activity.' },
  ];

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] pb-[calc(6rem+env(safe-area-inset-bottom))] dark:bg-slate-950">
      <div className="mx-auto w-full max-w-[1120px] px-3 pb-8 pt-3 min-[390px]:px-4 sm:px-6 sm:pt-6 lg:px-8">
        <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] dark:border-slate-800 dark:bg-slate-900 min-[390px]:p-5 sm:rounded-[24px] sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-brand-600">Transporter workspace</p>
              <h1 className="mt-2 text-[23px] font-black leading-tight tracking-[-.035em] text-[#0B1F44] dark:text-white min-[390px]:text-[25px] sm:text-4xl">Keep your fleet moving.</h1>
              <p className="mt-2 max-w-xl text-[12px] leading-5 text-slate-500 dark:text-slate-400 min-[390px]:text-[13px] sm:text-sm sm:leading-6">Find verified loads, manage trips and keep your vehicles ready for the next job.</p>
              {userPhone && <p className="mt-3 text-xs font-semibold text-slate-400">Signed in as {userPhone}</p>}
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 sm:flex dark:bg-brand-950/40">
              <Truck size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-bold min-[390px]:text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            <ShieldCheck size={16} /> Use the operational modules below for live account data.
          </div>
        </section>

        <section className="mt-5" aria-labelledby="transporter-actions">
          <div className="mb-3 px-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">Operations</p>
            <h2 id="transporter-actions" className="mt-1 text-[18px] font-black tracking-tight text-[#0B1F44] dark:text-white">What do you need?</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 min-[390px]:gap-3 sm:grid-cols-2">
            {actions.map(({ view, icon: Icon, title, text }) => (
              <button key={view} type="button" onClick={() => onNavigate?.(view)} className="group flex min-h-[112px] items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_6px_18px_rgba(15,23,42,.04)] transition hover:border-brand-200 hover:shadow-md active:scale-[.995] dark:border-slate-800 dark:bg-slate-900 min-[390px]:min-h-[118px] min-[390px]:gap-3 min-[390px]:p-3.5 text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl min-[390px]:h-10 min-[390px]:w-10 bg-slate-50 text-brand-600 dark:bg-slate-800"><Icon size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-extrabold min-[390px]:text-[13px] text-slate-900 dark:text-white">{title}</span>
                  <span className="mt-1 block text-[10px] leading-4 min-[390px]:text-[11px] text-slate-500 dark:text-slate-400">{text}</span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-2.5 min-[390px]:gap-3 sm:grid-cols-2">
          <Button type="button" variant="ghost" onClick={() => onNavigate?.('support')} className="min-h-12 justify-start rounded-2xl border border-slate-200 bg-white px-3 text-left text-[11px] font-bold min-[390px]:text-xs text-slate-800 shadow-none dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <LifeBuoy size={16} className="mr-2 text-brand-600" /> Help & support
          </Button>
          <Button type="button" variant="ghost" onClick={() => onNavigate?.('settings')} className="min-h-12 justify-start rounded-2xl border border-slate-200 bg-white px-3 text-left text-[11px] font-bold min-[390px]:text-xs text-slate-800 shadow-none dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <Settings2 size={16} className="mr-2 text-brand-600" /> Account settings
          </Button>
        </section>
      </div>
    </main>
  );
}
