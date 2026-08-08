import React, { useEffect, useState } from 'react';
import { AlertCircle, BarChart3, CheckCircle2, FileText, MapPin, MoreHorizontal, Plus, Search, Star, TrendingUp, Truck, Users, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/Button';
import { TransporterLoadsTable } from './TransporterLoadsTable';
import api from '../api/client';

export default function TransporterFleetDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'loads' | 'fleet' | 'drivers' | 'maintenance'>('overview');
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
            status: bid.load.status === 'AVAILABLE' ? bid.status : bid.load.status
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
    { id: 'TRK-003', plate: 'ABC-123YY', type: 'Tipper', status: 'Maintenance', driver: '-', loc: 'Workshop', maintenance: 'Critical' }
  ];

  const drivers = [
    { id: 'DRV-101', name: 'Obi C.', rating: 4.8, trips: 142, status: 'On Duty', license: 'Valid - Exp 2027' },
    { id: 'DRV-102', name: 'Chinedu E.', rating: 4.9, trips: 310, status: 'Available', license: 'Valid - Exp 2026' },
    { id: 'DRV-103', name: 'Ahmed M.', rating: 4.5, trips: 89, status: 'Off Duty', license: 'Renewal Required' }
  ];

  const tabs = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'loads', icon: FileText, label: 'Active Loads' },
    { id: 'fleet', icon: Truck, label: 'Fleet' },
    { id: 'drivers', icon: Users, label: 'Drivers' },
    { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
  ] as const;

  const statusDot = (status: string) =>
    status === 'In Transit' || status === 'On Duty' ? 'bg-brand-500' : status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500';

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <header className="shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <div className="w-full px-4 pt-4 pb-3 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400"><Truck size={17} /></span>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">Transport Operations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Fleet Operations</h1>
              <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage trucks, drivers, earnings and maintenance from one clear workspace.</p>
            </div>
            <Button aria-label="Add asset" className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2">
              <Plus size={16} /> <span className="hidden sm:inline">Add Asset</span>
            </Button>
          </div>

          <nav aria-label="Fleet sections" className="mt-4 -mx-1 overflow-x-auto hide-scrollbar">
            <div className="flex min-w-max gap-1.5 px-1 pb-1">
              {tabs.map(tab => (
                <Button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeTab === tab.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm' : 'bg-transparent text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <tab.icon size={15} /> {tab.label}
                </Button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="w-full px-4 py-4 pb-28 sm:px-6 sm:py-6 lg:px-8 lg:max-w-7xl lg:mx-auto">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'Total Fleet', value: '12', icon: Truck, tone: 'text-brand-600 bg-brand-50 dark:bg-brand-950/40' },
                  { label: 'Active Trips', value: '8', icon: MapPin, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
                  { label: 'Total Drivers', value: '15', icon: Users, tone: 'text-brand-600 bg-brand-50 dark:bg-brand-950/40' },
                  { label: 'Maint. Alerts', value: '2', icon: AlertCircle, tone: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2"><p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.label}</p><span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.tone}`}><item.icon size={16} /></span></div>
                    <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5"><div><h2 className="text-base sm:text-lg font-bold">Revenue Analytics</h2><p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Weekly performance</p></div><div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-emerald-700"><TrendingUp size={13} /> +14.2%</div></div>
                <div className="h-40 sm:h-48 flex items-end justify-between gap-1.5 sm:gap-2 px-1 sm:px-2">{[40, 60, 45, 80, 50, 90, 75].map((h, i) => <div key={i} className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative"><div className="absolute bottom-0 inset-x-0 bg-brand-500 rounded-t-lg" style={{ height: `${h}%` }} /></div>)}</div>
                <div className="flex justify-between text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase mt-3 px-1 sm:px-2"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
              </section>
            </motion.div>
          )}

          {activeTab === 'loads' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"><TransporterLoadsTable loads={myLoads} onNavigateMatcher={() => { window.location.hash = 'network'; window.location.reload(); }} /></motion.div>}

          {activeTab === 'fleet' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input type="text" placeholder="Search trucks by plate or ID..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3.5 text-sm shadow-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" /></div>
              <div className="space-y-3 md:hidden">{fleet.map(truck => <article key={truck.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${statusDot(truck.status)}`} /><h3 className="font-bold truncate">{truck.id}</h3></div><span className="mt-1 inline-flex rounded-lg bg-brand-50 dark:bg-brand-950/40 px-2 py-1 text-[10px] font-bold font-mono text-brand-700 dark:text-brand-300">{truck.plate}</span></div><Button aria-label={`Actions for ${truck.id}`} className="p-2 text-slate-400 hover:text-brand-600"><MoreHorizontal size={18} /></Button></div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><p className="text-slate-400 uppercase tracking-wider font-bold text-[9px]">Type</p><p className="mt-1 font-semibold">{truck.type}</p></div><div><p className="text-slate-400 uppercase tracking-wider font-bold text-[9px]">Status</p><p className="mt-1 font-semibold">{truck.status}</p></div><div><p className="text-slate-400 uppercase tracking-wider font-bold text-[9px]">Location</p><p className="mt-1 font-semibold flex items-center gap-1"><MapPin size={12} />{truck.loc}</p></div><div><p className="text-slate-400 uppercase tracking-wider font-bold text-[9px]">Driver</p><p className="mt-1 font-semibold">{truck.driver}</p></div></div></article>)}</div>
              <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider"><tr><th className="p-4">Truck ID / Plate</th><th className="p-4">Type</th><th className="p-4">Status & Location</th><th className="p-4">Assigned Driver</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{fleet.map(truck => <tr key={truck.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"><td className="p-4"><div className="font-bold">{truck.id}</div><div className="text-xs text-brand-600 bg-brand-50 inline-block px-2 py-0.5 rounded mt-1 border border-brand-100 font-mono">{truck.plate}</div></td><td className="p-4 text-slate-600 dark:text-slate-300">{truck.type}</td><td className="p-4"><div className="flex items-center gap-1.5 mb-1"><span className={`w-2 h-2 rounded-full ${statusDot(truck.status)}`} /><span className="font-bold text-xs">{truck.status}</span></div><div className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {truck.loc}</div></td><td className="p-4 font-medium">{truck.driver}</td><td className="p-4 text-right"><Button aria-label={`Actions for ${truck.id}`} className="p-2 text-slate-400 hover:text-brand-600"><MoreHorizontal size={18} /></Button></td></tr>)}</tbody></table></div></div>
            </motion.div>
          )}

          {activeTab === 'drivers' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"><div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input type="text" placeholder="Search drivers by name or ID..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3.5 text-sm shadow-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" /></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">{drivers.map(driver => <article key={driver.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm"><div className="flex justify-between items-start gap-3"><div className="flex items-center gap-3 min-w-0"><div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">{driver.name.charAt(0)}</div><div className="min-w-0"><h4 className="font-bold truncate">{driver.name}</h4><p className="text-xs text-slate-500 font-mono">{driver.id}</p></div></div><span className={`shrink-0 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${driver.status === 'On Duty' ? 'bg-brand-50 text-brand-600 border-brand-200' : driver.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{driver.status}</span></div><div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800"><div><p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rating</p><p className="font-bold flex items-center gap-1 mt-1"><Star size={14} className="text-amber-400 fill-amber-400" />{driver.rating}</p></div><div><p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Trips</p><p className="font-bold mt-1">{driver.trips}</p></div></div><div className="mt-4 flex items-center justify-between gap-3"><div className={`flex min-w-0 items-center gap-1.5 text-xs ${driver.license.includes('Renewal') ? 'text-red-600 font-bold' : 'text-slate-500 dark:text-slate-300'}`}>{driver.license.includes('Renewal') ? <AlertCircle size={14} /> : <CheckCircle2 size={14} className="text-emerald-500" />}<span className="truncate">{driver.license}</span></div><Button className="shrink-0 text-brand-600 text-xs font-bold">View</Button></div></article>)}</div></motion.div>
          )}

          {activeTab === 'maintenance' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"><section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"><div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between gap-3"><div><h2 className="font-bold">Maintenance Schedule</h2><p className="text-xs text-slate-500 mt-0.5">Upcoming service and priority items</p></div><Button className="text-brand-600 text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"><Plus size={15} /> Log Service</Button></div><div className="divide-y divide-slate-100 dark:divide-slate-800">{[{ truck: 'LSR-992XC', type: 'Routine Service (Oil/Filters)', date: 'Oct 15, 2026', status: 'Due Soon', priority: 'medium' }, { truck: 'ABC-123YY', type: 'Brake Pad Replacement', date: 'Oct 12, 2026', status: 'Overdue', priority: 'high' }, { truck: 'KJA-234BB', type: 'Tire Rotation', date: 'Nov 02, 2026', status: 'Scheduled', priority: 'low' }].map((log, i) => <div key={i} className="p-4 sm:p-5 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"><div className="flex items-start gap-3 min-w-0"><div className={`p-2.5 rounded-xl shrink-0 ${log.priority === 'high' ? 'bg-red-100 text-red-600' : log.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}><Wrench size={17} /></div><div className="min-w-0"><h3 className="font-bold text-sm sm:text-base">{log.type}</h3><p className="text-xs sm:text-sm text-slate-500 mt-1">Truck: <span className="font-mono font-bold">{log.truck}</span></p><p className="text-[11px] text-slate-400 mt-1">Scheduled: {log.date}</p></div></div><div className="shrink-0 flex flex-col items-end gap-2"><span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${log.status === 'Overdue' ? 'bg-red-50 text-red-600 border-red-200' : log.status === 'Due Soon' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{log.status}</span><Button className="text-slate-500 hover:text-brand-600 text-xs font-bold">Manage</Button></div></div>)}</div></section></motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
