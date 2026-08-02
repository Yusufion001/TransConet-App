import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Package, Truck, ChevronRight, RefreshCw, CheckCircle, Clock, MapPin, XCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface MyShipmentsProps {
  onAcceptBid: (isEscrowEnabled: boolean, bidId: string) => void;
  onViewTracking?: (job: any) => void;
}

export default function MyShipments({ onAcceptBid, onViewTracking }: MyShipmentsProps) {
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoads = async () => {
    setLoading(true);
    try {
      const response = await api.get('/my-loads');
      setLoads(response.data);
    } catch (error) {
      console.error('Failed to fetch my loads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate- p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Posted Cargo</h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Review active loads and incoming transporter bids</p>
        </div>
        <Button onClick={fetchLoads} disabled={loading} className="p-2 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition text-slate-600 dark:text-slate-">
          <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="animate-spin text-brand-500" size={32} />
        </div>
      ) : loads.length === 0 ? (
        <div className="text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12">
          <Package className="mx-auto text-slate-300 dark:text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-">No Cargo Posted Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate- mt-2">Post your first cargo to start receiving bids from transporters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {loads.map(load => (
            <div key={load.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{load.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                      load.status === 'AVAILABLE' ? 'bg-brand-100 text-brand-700' : 
                      load.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-brand-100 text-brand-700'
                    }`}>
                      {load.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-">
                    <span className="flex items-center gap-1"><MapPin size={12}/> {load.origin} &rarr; {load.destination}</span>
                    <span className="flex items-center gap-1"><Package size={12}/> {load.weightKg}kg</span>
                  </div>
                </div>
                {load.status !== 'AVAILABLE' && onViewTracking && (
                  <Button 
                    onClick={() => onViewTracking(load)}
                    className="bg-brand-50 text-brand-600 hover:bg-brand-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  >
                    Track Shipment
                  </Button>
                )}
              </div>

              {/* Bids Section */}
              {load.bids && load.bids.length > 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate- mb-3 flex items-center gap-2">
                    <Truck size={14} /> Incoming Bids ({load.bids.length})
                  </h4>
                  <div className="space-y-3">
                    {load.bids.map((bid: any) => (
                      <div key={bid.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div>
                          <p className="font-bold text-sm">₦{Number(bid.amount || 0).toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 dark:text-slate-">{bid.driver?.phoneNumber || 'Unknown Transporter'}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest ${
                              bid.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              bid.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {String(bid.status || '')}
                            </span>
                          </div>
                          {bid.notes && <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 italic">"{String(bid.notes)}"</p>}
                        </div>
                        {bid.status === 'PENDING' && load.status === 'AVAILABLE' && (
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => onAcceptBid(load.isEscrowEnabled, bid.id)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap"
                            >
                              Accept Bid
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate- italic bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  Waiting for transporters to place bids...
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
