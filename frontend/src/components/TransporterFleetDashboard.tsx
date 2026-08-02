import React, { useState, useEffect } from 'react';
import { Truck, Users, Wrench, BarChart3, TrendingUp, TrendingDown, MapPin, Search, Plus, MoreHorizontal, FileText, CheckCircle2, AlertCircle, Star } from 'lucide-react';
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
    if (activeTab === 'loads') {
      fetchLoads();
    }
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

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      <div className="p-4 md:p-6 pb-32 space-y-4 max-w-5xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-400">Fleet Operations</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your trucks, drivers, earnings, and maintenance.</p>
          </div>
          <Button className="bg-brand-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-brand-700 transition shadow-lg shadow-blue-500/20 flex items-center gap-2 w-fit overflow-hidden">
            <Plus size={16} /> Add Asset
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          {[
            { id: 'overview', icon: BarChart3, label: 'Analytics & Earnings' },
            { id: 'loads', icon: FileText, label: 'Active Loads' },
            { id: 'fleet', icon: Truck, label: 'Fleet Management' },
            { id: 'drivers', icon: Users, label: 'Driver Management' },
            { id: 'maintenance', icon: Wrench, label: 'Maintenance Hub' },
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </Button>
          ))}
        </div>

      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Fleet</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-400">12</h3>
                  <Truck className="text-brand-500" size={20} />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Active Trips</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-400">8</h3>
                  <MapPin className="text-emerald-500" size={20} />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Drivers</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-400">15</h3>
                  <Users className="text-brand-500" size={20} />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Maint. Alerts</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-400">2</h3>
                  <AlertCircle className="text-red-500" size={20} />
                </div>
              </div>
            </div>

            {/* Earnings Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-400">Revenue Analytics</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Weekly performance</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                  <TrendingUp size={14} /> +14.2%
                </div>
              </div>
              
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {[40, 60, 45, 80, 50, 90, 75].map((h, i) => (
                  <div key={i} className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-brand-500 rounded-t-lg transition-all" 
                      style={{ height: `${h}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded shadow-lg transition-opacity whitespace-nowrap">
                        ₦{((h || 0) * 15000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mt-4 px-2">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === 'loads' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <TransporterLoadsTable 
              loads={myLoads} 
              onNavigateMatcher={() => {
                // If this is in a context or has a prop, we'd use it. For now, alert or fallback
                // Ideally this calls a prop like onNavigateToNetwork
                window.location.hash = 'network';
                window.location.reload();
              }} 
            />
          </motion.div>
        )}

        {activeTab === 'fleet' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={18} />
              <input type="text" placeholder="Search trucks by plate or ID..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Truck ID / Plate</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status & Location</th>
                      <th className="p-4">Assigned Driver</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fleet.map((truck) => (
                      <tr key={truck.id} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                        <td className="p-4">
                          <div className="font-bold text-slate-800 dark:text-slate-400">{truck.id}</div>
                          <div className="text-xs text-brand-600 bg-brand-50 inline-block px-2 py-0.5 rounded mt-1 border border-brand-100 font-mono">{truck.plate}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{truck.type}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2 h-2 rounded-full ${truck.status === 'In Transit' ? 'bg-brand-500' : truck.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            <span className="font-bold text-slate-800 dark:text-slate-400 text-xs">{truck.status}</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin size={12}/> {truck.loc}</div>
                        </td>
                        <td className="p-4 text-slate-800 dark:text-slate-400 font-medium">{truck.driver}</td>
                        <td className="p-4 text-right">
                          <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-brand-600 p-2"><MoreHorizontal size={18} /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'drivers' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={18} />
              <input type="text" placeholder="Search drivers by name or ID..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map(driver => (
                <div key={driver.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm hover:shadow-sm transition overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-400">{driver.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{driver.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      driver.status === 'On Duty' ? 'bg-brand-50 text-brand-600 border border-brand-200' : 
                      driver.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                      'bg-slate-100 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {driver.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Rating</p>
                       <p className="font-bold text-slate-800 dark:text-slate-400 flex items-center gap-1 text-sm"><Star size={14} className="text-amber-400 fill-amber-400"/> {driver.rating}</p>
                     </div>
                     <div>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Trips</p>
                       <p className="font-bold text-slate-800 dark:text-slate-400 text-sm">{driver.trips}</p>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs">
                      {driver.license.includes('Renewal') ? (
                        <AlertCircle size={14} className="text-red-500" />
                      ) : (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      )}
                      <span className={driver.license.includes('Renewal') ? 'text-red-600 font-bold' : 'text-slate-600 dark:text-slate-300'}>{driver.license}</span>
                    </div>
                    <Button className="text-brand-600 text-xs font-bold hover:underline">View Profile</Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'maintenance' && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-400">Maintenance Schedule</h3>
                  <Button className="text-brand-600 text-sm font-bold flex items-center gap-1"><Plus size={16}/> Log Service</Button>
                </div>
                <div className="divide-y divide-slate-100">
                   {[
                     { truck: 'LSR-992XC', type: 'Routine Service (Oil/Filters)', date: 'Oct 15, 2026', status: 'Due Soon', priority: 'medium' },
                     { truck: 'ABC-123YY', type: 'Brake Pad Replacement', date: 'Oct 12, 2026', status: 'Overdue', priority: 'high' },
                     { truck: 'KJA-234BB', type: 'Tire Rotation', date: 'Nov 02, 2026', status: 'Scheduled', priority: 'low' },
                   ].map((log, i) => (
                     <div key={i} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-brand-50 cursor-pointer hover:shadow-sm transition">
                       <div className="flex items-start gap-3">
                         <div className={`p-2 rounded-xl mt-1 ${
                           log.priority === 'high' ? 'bg-red-100 text-red-600' : 
                           log.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600 dark:text-slate-300'
                         }`}>
                           <Wrench size={18} />
                         </div>
                         <div>
                           <h4 className="font-bold text-slate-800 dark:text-slate-400">{log.type}</h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400">Truck: <span className="font-mono font-bold text-slate-700 dark:text-slate-400">{log.truck}</span></p>
                           <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 flex items-center gap-1">Scheduled for: {log.date}</p>
                         </div>
                       </div>
                       
                       <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 ml-11 md:ml-0">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                           log.status === 'Overdue' ? 'bg-red-50 text-red-600 border-red-200' : 
                           log.status === 'Due Soon' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                         }`}>
                           {log.status}
                         </span>
                         <Button className="text-slate-500 dark:text-slate-400 hover:text-brand-600 text-sm font-bold transition">Manage</Button>
                       </div>
                     </div>
                   ))}
                </div>
             </div>

           </motion.div>
        )}

      </div>
    </div>
  );
}
