import React, { useEffect, useState } from 'react';
import { AlertCircle, BarChart3, CheckCircle2, FileText, MapPin, MoreHorizontal, Plus, Search, Star, TrendingUp, Truck, Users, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/Button';
import { TransporterLoadsTable } from './TransporterLoadsTable';
import api from '../api/client';

type Tab = 'overview' | 'loads' | 'fleet' | 'drivers' | 'maintenance';

export default function TransporterFleetDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [myLoads, setMyLoads] = useState<any[]>([]);

  useEffect(() => {
    const fetchLoads = async () => {
      try {
        const res = await api.get('/bids/my-bids');
        if (res.data && Array.isArray(res.data)) {
          const mapped = res.data.map((bid: any) => ({
            id: bid.load.id,
            origin: bid.load.origin,
            destination: bid.load.destination,
            cargoType: bid.load.cargoType,
            weight: bid.load.weightKg + 'kg',
            pickupDate: new Date(bid.load.createdAt).toLocaleDateString(),
            price: `₦${Number(bid.amount).toLocaleString()}`,
            status: bid.load.status === 'AVAILABLE' ? bid.status : bid.load.status,
          }));
          setMyLoads(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch transporter loads:', err);
      }
    };
    if (activeTab === 'loads') fetchLoads();
  }, [activeTab]);

  const fleet = [
    { id: 'TRK-001', plate: 'KJA-234BB', type: 'Flatbed', status: 'In Transit', driver: 'Obi C.', loc: 'Oshodi, Lagos', maintenance: 'Good' },
    { id: 'TRK-002', plate: 'LSR-992XC', type: 'Refrigerated', status: 'Available', driver: 'Chinedu E.', loc: 'Apapa Port', maintenance: 'Service Due' },
    { id: 'TRK-003', plate: 'ABC-123YY', type: 'Tipper', status: 'Maintenance', driver: '-', loc: 'Workshop', maintenance: 'Critical' },
  ];

  const drivers = [
    { id: 'DRV-101', name: 'Obi C.', rating: 4.8, trips: 142, status: 'On Duty', license: 'Valid - Exp 2027' },
    { id: 'DRV-102', name: 'Chinedu E.', rating: 4.9, trips: 310, status: 'Available', license: 'Valid - Exp 2026' },
    { id: 'DRV-103', name: 'Ahmed M.', rating: 4.5, trips: 89, status: 'Off Duty', license: 'Renewal Required' },
  ];

  const tabs = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'loads', icon: FileText, label: 'Loads' },
    { id: 'fleet', icon: Truck, label: 'Fleet' },
    { id: 'drivers', icon: Users, label: 'Drivers' },
    { id: 'maintenance', icon: Wrench, label: 'Service' },
  ] as const;

  const statusDot = (status: string) => status === 'In Transit' || status === 'On Duty' ? 'bg-brand-500' : status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500';
  const statusTone = (status: string) => status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : status === 'In Transit' || status === 'On Duty' ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f7f8fa] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white"><Truck size={16} /></span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Transporter workspace</span>
              </div>
              <h1 className="text-[25px] font-black tracking-[-0.03em] text-slate-950 dark:text-white sm:text-3xl">Fleet Operations</h1>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">A clear command centre for your fleet, drivers, loads and vehicle service.</p>
            </div>
            <Button aria-label="Add asset" className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900">
              <Plus size={15} /><span className="hidden sm:inline">Add Asset</span>
            </Button>
          </div>
          <nav aria-label="Fleet sections" className="mt-4 -mx-1 overflow-x-auto hide-scrollbar">
            <div className="flex min-w-max gap-1 px-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return <Button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex h-10 items-center gap-2 rounded-lg border px-3.5 text-xs font-bold whitespace-nowrap transition ${active ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900' : 'border-transparent bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}><Icon size={15} />{tab.label}</Button>;
              })}
            </div>
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 pb-28 sm:px-6 sm:py-6 lg:px-8">
          {activeTab === 'overview' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[['Fleet size','12',Truck,'text-brand-600 bg-brand-50'],['Active trips','8',MapPin,'text-emerald-600 bg-emerald-50'],['Drivers','15',Users,'text-indigo-600 bg-indigo-50'],['Service alerts','2',AlertCircle,'text-red-600 bg-red-50']].map(([label,value,Icon,tone]) => <section key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.04)] dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}><Icon size={15} /></span></div><p className="mt-3 text-2xl font-black tracking-tight">{value}</p></section>)}
            </div>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.04)] dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Performance</p><h2 className="mt-1 text-lg font-black">Revenue analytics</h2><p className="text-xs text-slate-500">Weekly performance</p></div><span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><TrendingUp size={13} /> +14.2%</span></div>
              <div className="flex h-44 items-end gap-2 border-b border-slate-100 dark:border-slate-800">{[40,60,45,80,50,90,75].map((h,i)=><div key={i} className="relative h-full flex-1"><div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-brand-500/90" style={{height:`${h}%`}} /></div>)}</div>
              <div className="mt-3 flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            </section>
            <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fleet utilisation</p><p className="mt-2 text-xl font-black">67%</p><div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full w-[67%] rounded-full bg-brand-500" /></div></div><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">On-time rate</p><p className="mt-2 text-xl font-black">94%</p><div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full w-[94%] rounded-full bg-emerald-500" /></div></div><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attention needed</p><p className="mt-2 text-xl font-black">2 vehicles</p><p className="mt-1 text-xs text-red-600">Service due</p></div></section>
          </motion.div>}

          {activeTab === 'loads' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><TransporterLoadsTable loads={myLoads} onNavigateMatcher={() => { window.location.hash = 'network'; window.location.reload(); }} /></motion.div>}

          {activeTab === 'fleet' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input type="text" placeholder="Search trucks by plate or ID..." className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-900"/></div>
            <div className="space-y-3 md:hidden">{fleet.map(truck=><article key={truck.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${statusDot(truck.status)}`}/><h3 className="font-black">{truck.id}</h3></div><span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{truck.plate}</span></div><Button aria-label={`Actions for ${truck.id}`} className="p-2 text-slate-400"><MoreHorizontal size={18}/></Button></div><div className="mt-4 grid grid-cols-2 gap-4"><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Type</p><p className="mt-1 text-sm font-semibold">{truck.type}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Status</p><span className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[9px] font-bold ${statusTone(truck.status)}`}>{truck.status}</span></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Location</p><p className="mt-1 flex items-center gap-1 text-sm font-semibold"><MapPin size={12}/>{truck.loc}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Driver</p><p className="mt-1 text-sm font-semibold">{truck.driver}</p></div></div></article>)}</div>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400"><tr><th className="p-4">Truck / Plate</th><th className="p-4">Type</th><th className="p-4">Status / Location</th><th className="p-4">Driver</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{fleet.map(truck=><tr key={truck.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50"><td className="p-4"><div className="font-bold">{truck.id}</div><span className="font-mono text-xs text-slate-500">{truck.plate}</span></td><td className="p-4">{truck.type}</td><td className="p-4"><div className="flex items-center gap-2 font-semibold text-xs"><span className={`h-2 w-2 rounded-full ${statusDot(truck.status)}`}/>{truck.status}</div><div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={12}/>{truck.loc}</div></td><td className="p-4 font-medium">{truck.driver}</td><td className="p-4 text-right"><Button aria-label={`Actions for ${truck.id}`} className="p-2 text-slate-400"><MoreHorizontal size={18}/></Button></td></tr>)}</tbody></table></div></div>
          </motion.div>}

          {activeTab === 'drivers' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"><div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input type="text" placeholder="Search drivers by name or ID..." className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-900"/></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{drivers.map(driver=><article key={driver.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{driver.name.charAt(0)}</div><div className="min-w-0"><h3 className="truncate font-black">{driver.name}</h3><p className="font-mono text-xs text-slate-500">{driver.id}</p></div></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${statusTone(driver.status)}`}>{driver.status}</span></div><div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4 dark:border-slate-800"><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Rating</p><p className="mt-1 flex items-center gap-1 font-bold"><Star size={14} className="fill-amber-400 text-amber-400"/>{driver.rating}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Trips</p><p className="mt-1 font-bold">{driver.trips}</p></div></div><div className="mt-4 flex items-center justify-between"><p className="text-xs text-slate-500">{driver.license}</p><Button aria-label={`Actions for ${driver.name}`} className="p-2 text-slate-400"><MoreHorizontal size={18}/></Button></div></article>)}</div></motion.div>}

          {activeTab === 'maintenance' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fleet health</p><p className="mt-2 text-2xl font-black">84%</p><p className="mt-1 text-xs text-emerald-600">Good overall condition</p></section><section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Service due</p><p className="mt-2 text-2xl font-black">1</p><p className="mt-1 text-xs text-amber-600">Schedule soon</p></section><section className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20"><p className="text-[10px] font-bold uppercase tracking-wider text-red-500">Critical</p><p className="mt-2 text-2xl font-black text-red-700 dark:text-red-300">1</p><p className="mt-1 text-xs text-red-600">Vehicle needs attention</p></section></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">{fleet.map((truck,i)=><div key={truck.id} className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-0 dark:border-slate-800"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${i === 2 ? 'bg-red-50 text-red-600' : i === 1 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}><Wrench size={17}/></span><div className="min-w-0 flex-1"><p className="font-bold">{truck.id} · {truck.plate}</p><p className="text-xs text-slate-500">{truck.type} · {truck.maintenance}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${i === 2 ? 'bg-red-100 text-red-700' : i === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{truck.maintenance}</span></div>)}</div></motion.div>}
        </div>
      </main>
    </div>
  );
}
