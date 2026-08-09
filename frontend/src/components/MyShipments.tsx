import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Package, Truck, RefreshCw, CheckCircle, Clock, MapPin } from 'lucide-react';
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

  const statusIcon = (status: string) => {
    if (status === 'DELIVERED') return <CheckCircle size={15} className="text-emerald-600" />;
    if (status === 'AVAILABLE') return <Clock size={15} className="text-amber-600" />;
    if (status === 'QUOTE_ACCEPTED') return <Truck size={15} className="text-brand-600" />;
    return <Package size={15} className="text-slate-500" />;
  };

  return (
    <div className="min-h-full w-full px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 md:px-7 md:pb-10">
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="flex items-start justify-between gap-3 pb-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-brand-700 dark:text-brand-400">Shipper workspace</p>
            <h1 className="mt-1 text-[27px] font-extrabold tracking-tight text-[#0B1F44] dark:text-white sm:text-3xl">My Shipments</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">Review cargo activity, transporter bids and delivery progress.</p>
          </div>
          <Button onClick={fetchLoads} disabled={loading} aria-label="Refresh shipments" className="h-11 w-11 shrink-0 rounded-xl border-0 bg-white p-0 text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300">
            <RefreshCw className={loading ? 'animate-spin' : ''} size={19} />
          </Button>
        </header>

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <RefreshCw className="animate-spin text-brand-500" size={30} />
          </div>
        ) : loads.length === 0 ? (
          <div className="mt-2 rounded-2xl bg-white p-7 text-center shadow-sm dark:bg-slate-900 sm:p-12">
            <Package className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={44} />
            <h2 className="text-lg font-bold text-[#0B1F44] dark:text-white">No active shipments</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">Your cargo activity will appear here after you post a shipment.</p>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            {loads.map(load => (
              <article key={load.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)] dark:bg-slate-900">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="min-w-0 truncate text-lg font-extrabold text-[#0B1F44] dark:text-white">{load.title}</h2>
                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          load.status === 'AVAILABLE' ? 'bg-amber-50 text-amber-700' :
                          load.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-blue-50 text-brand-700'
                        }`}>
                          {statusIcon(load.status)} {String(load.status || '').replaceAll('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-3 flex items-start gap-1.5 text-sm leading-5 text-slate-600 dark:text-slate-300"><MapPin size={15} className="mt-0.5 shrink-0" /> <span className="min-w-0 break-words">{load.origin} <span className="mx-1 text-slate-400">→</span> {load.destination}</span></p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"><Package size={15} /> {load.weightKg}kg</p>
                    </div>
                    {load.status !== 'AVAILABLE' && onViewTracking && (
                      <Button onClick={() => onViewTracking(load)} className="min-h-11 shrink-0 rounded-xl bg-blue-50 px-3 text-sm font-bold text-brand-700 hover:bg-blue-100 dark:bg-brand-950 dark:text-brand-300">Track</Button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50/80 p-4 dark:bg-slate-950/40 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#0B1F44] dark:text-white"><Truck size={16} className="text-brand-600" /> Incoming bids</h3>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{load.bids?.length || 0}</span>
                  </div>

                  {load.bids && load.bids.length > 0 ? (
                    <div className="space-y-3">
                      {load.bids.map((bid: any) => (
                        <div key={bid.id} className="rounded-xl bg-white p-4 dark:bg-slate-900">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-lg font-extrabold text-[#0B1F44] dark:text-white">₦{Number(bid.amount || 0).toLocaleString()}</p>
                              <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-400">{bid.driver?.phoneNumber || 'Unknown Transporter'}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                              bid.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                              bid.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700' :
                              'bg-red-50 text-red-700'
                            }`}>{String(bid.status || '')}</span>
                          </div>
                          {bid.notes && <p className="mt-2 text-sm italic leading-5 text-slate-500 dark:text-slate-400">“{String(bid.notes)}”</p>}
                          {bid.status === 'PENDING' && load.status === 'AVAILABLE' && (
                            <Button onClick={() => onAcceptBid(load.isEscrowEnabled, bid.id)} className="mt-3 min-h-11 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700">Accept Bid</Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white px-4 py-5 text-sm leading-6 text-slate-500 dark:bg-slate-900 dark:text-slate-400">Waiting for transporters to place bids.</div>
                  )}
                </div>

                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Shipment ID</span>
                  <span className="max-w-[60%] truncate font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{load.id}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
