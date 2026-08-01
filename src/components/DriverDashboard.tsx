import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/Button';
import { 
  MapPin, Navigation, Camera, ShieldCheck, 
  MessageCircle, Wallet, CheckCircle2, AlertTriangle, 
  PhoneCall, UploadCloud, Truck, ShieldAlert,
  Clock, CheckSquare, XCircle
} from 'lucide-react';
import api from '../api/client';

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'active-trip' | 'earnings' | 'documents'>('jobs');
  const [sosActive, setSosActive] = useState(false);
  const [tripStatus, setTripStatus] = useState<'pending' | 'en_route' | 'arrived' | 'delivered'>('pending');
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'jobs') {
      api.get('/loads').then(res => {
        if (Array.isArray(res.data)) {
          setAvailableJobs(res.data);
        }
      }).catch(err => console.error(err));
    }
  }, [activeTab]);

  return (
    <div className="w-full h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="p-4 md:p-6 pb-0 space-y-4 max-w-lg mx-auto w-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate- tracking-tight">Driver Hub</h1>
            <p className="text-sm text-slate-500 dark:text-slate- font-medium">Ready for your next trip.</p>
          </div>
          <Button 
            onClick={() => setSosActive(!sosActive)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              sosActive ? 'bg-red-600 animate-pulse text-white shadow-red-500/40' : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            <ShieldAlert size={24} strokeWidth={2.5} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'jobs', label: 'Job Offers', icon: Truck },
            { id: 'active-trip', label: 'Active Trip', icon: Navigation },
            { id: 'earnings', label: 'Wallet', icon: Wallet },
            { id: 'documents', label: 'Documents', icon: ShieldCheck },
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-lg mx-auto w-full">
        
        {activeTab === 'jobs' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {availableJobs.length === 0 ? (
              <div className="text-center p-8 text-slate-500 dark:text-slate-">No jobs available right now.</div>
            ) : availableJobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                    <Clock size={12} /> {job.cargoType || 'Cargo'}
                  </div>
                  <h3 className="font-black text-lg text-slate-800 dark:text-slate-">₦{(job.suggestedBudget || 0).toLocaleString()}</h3>
                </div>
                
                <div className="space-y-3 mb-6 relative">
                  <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
                  <div className="flex gap-3 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider">Pickup</p>
                      <p className="font-bold text-slate-800 dark:text-slate- text-sm">{job.origin}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center mt-0.5">
                      <MapPin size={10} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider">Dropoff</p>
                      <p className="font-bold text-slate-800 dark:text-slate- text-sm">{job.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => {
                    api.post('/bids/submit', { loadId: job.id, amount: job.suggestedBudget || 0, notes: 'Available immediately' })
                      .then(() => alert('Bid submitted successfully!'))
                      .catch(e => alert('Failed to submit bid: ' + ((typeof e.response?.data?.error === 'object' ? JSON.stringify(e.response?.data?.error) : e.response?.data?.error) || e.message)));
                  }} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <CheckSquare size={18} /> Accept
                  </Button>
                  <Button className="flex-1 bg-rose-50 text-rose-600 font-bold py-3 rounded-xl hover:bg-rose-100 border border-rose-200 transition flex items-center justify-center gap-2">
                    <XCircle size={18} /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'active-trip' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-slate-800 text-white p-5 rounded-3xl relative overflow-hidden shadow-xl shadow-slate-900/20">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Navigation size={120} />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900/20 px-2.5 py-1 rounded-full text-xs font-bold mb-4 border border-white/10 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Trip in Progress
                </div>
                <h3 className="text-2xl font-black mb-1">Apapa Port Delivery</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 mb-6">
                  <Navigation size={14} /> 14 mins away (5.2 km)
                </p>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition">
                    <Navigation size={16} /> Navigate
                  </Button>
                  <Button className="flex-1 bg-blue-500/30 border border-blue-400/30 text-blue-100 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-blue-50 cursor-pointer hover:shadow-sm0/50 transition">
                    <MessageCircle size={16} /> Chat
                  </Button>
                </div>
              </div>
            </div>

            {/* Proof of Delivery / Update Status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate- mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={18} /> Update Trip Status
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <Button className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-blue-50 cursor-pointer hover:shadow-sm hover:border-blue-200 hover:text-blue-600 transition group text-slate-600 dark:text-slate-">
                    <Camera size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-center">Upload Cargo<br/>Photos</span>
                 </Button>
                 <Button className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition group text-slate-600 dark:text-slate-">
                    <CheckSquare size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-center">Capture<br/>Signature</span>
                 </Button>
              </div>

              <Button className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                Complete Delivery <CheckCircle2 size={18} />
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'earnings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-blue-100 font-bold uppercase tracking-wider text-xs mb-1">Available Balance</p>
                  <h2 className="text-4xl font-black tracking-tight">₦124,500<span className="text-xl text-blue-300">.00</span></h2>
                  
                  <div className="mt-6 pt-6 border-t border-blue-500/30 flex justify-between items-center">
                    <div>
                      <p className="text-blue-200 text-[10px] uppercase font-bold tracking-wider">This Week</p>
                      <p className="font-bold text-lg">+ ₦45,000</p>
                    </div>
                    <Button className="bg-white dark:bg-slate-900 text-blue-700 px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:scale-105 transition-transform">
                      Withdraw
                    </Button>
                  </div>
                </div>
             </div>

             <h3 className="font-bold text-slate-800 dark:text-slate- px-1 mt-6 mb-3">Recent Transactions</h3>
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                {[
                  { desc: 'Trip #TR-8839 (Apapa)', date: 'Today, 2:30 PM', amt: '+ ₦15,000', type: 'credit' },
                  { desc: 'Withdrawal to Bank', date: 'Yesterday, 10:15 AM', amt: '- ₦50,000', type: 'debit' },
                  { desc: 'Trip #TR-8812 (Ikeja)', date: 'Mon, 4:00 PM', amt: '+ ₦12,500', type: 'credit' },
                ].map((txn, i) => (
                  <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 flex justify-between items-center hover:bg-blue-50 cursor-pointer hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600 dark:text-slate-300'}`}>
                        {txn.type === 'credit' ? <CheckCircle2 size={18} /> : <Wallet size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate- text-sm">{txn.desc}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase">{txn.date}</p>
                      </div>
                    </div>
                    <p className={`font-black ${txn.type === 'credit' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>
                      {txn.amt}
                    </p>
                  </div>
                ))}
             </div>
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-">Compliance Documents</h3>
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Verified</span>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Driver\'s License', status: 'Valid - Expires 2027', color: 'emerald' },
                    { title: 'Vehicle Inspection Report', status: 'Valid - Expires Dec 2026', color: 'emerald' },
                    { title: 'Insurance Certificate', status: 'Pending Review', color: 'amber' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                         <ShieldCheck className={`text-${doc.color}-500`} size={20} />
                         <div>
                           <p className="font-bold text-slate-800 dark:text-slate- text-sm">{doc.title}</p>
                           <p className={`text-[10px] font-bold uppercase tracking-wider text-${doc.color}-600`}>{doc.status}</p>
                         </div>
                      </div>
                      <Button aria-label="Action" className="text-blue-600 p-2 bg-blue-50 rounded-lg hover:bg-blue-100">
                        <UploadCloud size={16} />
                      </Button>
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
