import { io, Socket } from 'socket.io-client';
// src/components/ExpressMatcher.tsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, RefreshCw, Briefcase, Handshake, DollarSign, MapPin, Truck } from 'lucide-react';
import TransporterForm from './TransporterForm';
import CargoDetailsForm from './CargoDetailsForm';
import StateFilterOverlay from './StateFilterOverlay';
import LoadResultCard from './LoadResultCard';
import LocationAutocomplete from './LocationAutocomplete';
import RouteDistanceCalculator from './RouteDistanceCalculator';
import BiddingInterface from './BiddingInterface';
import TrackingView from './TrackingView';
import MyShipments from './MyShipments';
import { fetchLoadsApi } from '../services/loadService';
import api from '../api/client';
import { Button } from './ui/Button';

interface ExpressMatcherProps {
  initialMode?: 'SHIPPER' | 'TRANSPORTER';
  initialSubMode?: 'JOBS' | 'REGISTER';
}

export default function ExpressMatcher({ initialMode = 'SHIPPER', initialSubMode = 'JOBS' }: ExpressMatcherProps = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toastNotification, setToastNotification] = useState<{title: string, message: string} | null>(null);
  const [mode, setMode] = useState<'SHIPPER' | 'TRANSPORTER'>(initialMode);
  const [transporterSubMode, setTransporterSubMode] = useState<'JOBS' | 'REGISTER'>(initialSubMode);
  const [shipperSubMode, setShipperSubMode] = useState<'POST' | 'SEARCH' | 'MY_LOADS'>(initialMode === 'SHIPPER' && initialSubMode === 'REGISTER' ? 'POST' : 'SEARCH');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [matchOptions, setMatchOptions] = useState<any[]>([]);
  const [acceptedJob, setAcceptedJob] = useState<any>(null);
  const [pickupDetails, setPickupDetails] = useState({ address: '', contact: '', date: '' });
  const [deliveryDetails, setDeliveryDetails] = useState({ address: '', contact: '', date: '' });
  const [detailsProvided, setDetailsProvided] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [negotiationStatus, setNegotiationStatus] = useState('');

  useEffect(() => {
    const newSocket = io('/', { withCredentials: true });
    setSocket(newSocket);
    newSocket.on('connect', () => console.log('ExpressMatcher Socket connected'));
    newSocket.on('load_bids_updated', () => {
      if (mode === 'SHIPPER') {
        setToastNotification({ title: 'New Bid Received!', message: 'A transporter just placed a bid on your cargo.' });
        setTimeout(() => setToastNotification(null), 5000);
      }
    });
    return () => newSocket.disconnect();
  }, [mode]);

  useEffect(() => {
    if (!socket || !activeMatch) return;
    socket.emit('join_load', activeMatch.id);
  }, [socket, activeMatch]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'SHIPPER' && (!origin || !destination)) {
      alert('Please select both route locations.');
      return;
    }
    setProcessing(true);
    setActiveMatch(null);
    setMatchOptions([]);
    setIsNegotiating(false);
    setNegotiationStatus('');
    try {
      if (mode === 'TRANSPORTER') {
        const liveLoads = await fetchLoadsApi();
        if (Array.isArray(liveLoads) && liveLoads.length > 0) {
          const mapped = liveLoads.map((load: any, index: number) => ({
            id: load.id || index + 1,
            title: load.title || 'General Freight Consignment',
            subtitle: `${load.cargoType || 'Cargo'} • ${load.weightKg || '5000'}kg • ${load.origin} → ${load.destination}`,
            price: load.suggestedBudget || 250000,
            phone: load.customer?.phoneNumber || '08030000000',
            origin: load.origin,
            destination: load.destination
          }));
          setMatchOptions(mapped);
          setProcessing(false);
          return;
        }
      }
      setMatchOptions([]);
    } catch (err) {
      console.error('Express matcher search error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterPrice) return;
    setNegotiationStatus(`Counter-offer of ₦${Number(counterPrice).toLocaleString()} sent! Waiting for response...`);
    setIsNegotiating(false);
  };

  const handleAcceptBid = async (isEscrowEnabled: boolean, loadOrBidId: string) => {
    setAcceptedJob({ status: 'QUOTE_ACCEPTED', paymentStatus: 'PENDING', isEscrowEnabled });
    try {
      if (mode === 'TRANSPORTER') {
        await api.post('/bids/submit', { loadId: loadOrBidId, amount: activeMatch?.price || 0, notes: 'Accepted immediately' });
      } else {
        await api.post('/bids/accept', { bidId: loadOrBidId });
      }
    } catch (e: any) {
      console.error('Failed to accept bid via API:', e?.response?.data || e);
    }
  };

  const handleReturnToDashboard = () => {
    setOrigin('');
    setDestination('');
    setActiveMatch(null);
    setIsNegotiating(false);
    setNegotiationStatus('');
    setCounterPrice('');
    setTransporterSubMode('JOBS');
  };

  const tabClass = (active: boolean) => `shrink-0 rounded-full px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.08em] transition ${active ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'}`;

  return (
    <div className="tc-express-matcher flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#F8FAFC] dark:bg-slate-950">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div className="mx-auto w-full max-w-5xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 sm:pt-6 md:px-7 md:pb-10 lg:px-8">
          {toastNotification && (
            <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[60] sm:left-auto sm:right-5 sm:w-[360px]">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-2xl">
                <div className="rounded-xl bg-brand-500/20 p-2"><Truck size={17} className="text-brand-300" /></div>
                <div className="min-w-0"><h4 className="text-sm font-bold">{toastNotification.title}</h4><p className="mt-1 text-xs leading-5 text-slate-300">{toastNotification.message}</p></div>
              </div>
            </div>
          )}

          {!(mode === 'SHIPPER' && shipperSubMode === 'POST') && (
            <header className="mb-5 text-center">
            </header>
          )}

          {mode === 'SHIPPER' && (
            <div className="mb-5 overflow-x-auto scrollbar-none">
              <div className="mx-auto flex w-max items-center gap-1 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <Button onClick={() => { setShipperSubMode('SEARCH'); setActiveMatch(null); }} className={tabClass(shipperSubMode === 'SEARCH')}>Find a Truck</Button>
                <Button onClick={() => { setShipperSubMode('POST'); setActiveMatch(null); }} className={tabClass(shipperSubMode === 'POST')}>Post Cargo</Button>
                <Button onClick={() => { setShipperSubMode('MY_LOADS'); setActiveMatch(null); }} className={tabClass(shipperSubMode === 'MY_LOADS')}>My Shipments</Button>
              </div>
            </div>
          )}


          {acceptedJob ? (
            <TrackingView acceptedJob={acceptedJob} setAcceptedJob={setAcceptedJob} detailsProvided={detailsProvided} setDetailsProvided={setDetailsProvided} mode={mode} activeMatch={activeMatch} pickupDetails={pickupDetails} setPickupDetails={setPickupDetails} deliveryDetails={deliveryDetails} setDeliveryDetails={setDeliveryDetails} />
          ) : mode === 'TRANSPORTER' && transporterSubMode === 'REGISTER' ? (
            <TransporterForm />
          ) : mode === 'SHIPPER' && shipperSubMode === 'POST' ? (
            <CargoDetailsForm />
          ) : mode === 'SHIPPER' && shipperSubMode === 'MY_LOADS' ? (
            <MyShipments onAcceptBid={handleAcceptBid} onViewTracking={(job) => { setAcceptedJob(job); setActiveMatch(job); }} />
          ) : !activeMatch && matchOptions.length === 0 ? (
            <section className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.045)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6">
              <form onSubmit={handleActionSubmit} className={`grid grid-cols-1 gap-4 md:grid-cols-${mode === 'SHIPPER' ? '3' : '2'} md:items-end`}>
                <LocationAutocomplete label={mode === 'SHIPPER' ? 'Pickup Location' : 'Current Location'} placeholder="Search pickup address..." value={origin} onChange={(val) => setOrigin(val)} iconColor="text-emerald-500" />
                {mode === 'SHIPPER' && <LocationAutocomplete label="Destination Location" placeholder="Search destination address..." value={destination} onChange={(val) => setDestination(val)} iconColor="text-brand-500" />}
                <Button type="submit" disabled={processing} className="min-h-12 w-full rounded-xl bg-brand-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-700">{processing ? 'Matching Fleet...' : 'Find Match & Negotiate'}</Button>
              </form>

              <StateFilterOverlay isInline={true} isOpen={isOriginOpen} onClose={() => setIsOriginOpen(false)} onSelectState={(state) => setOrigin(state)} title={mode === 'SHIPPER' ? 'Select Pickup Origin' : 'Select Fleet Location'} subtitle="Choose a logistical starting route point" />
              <StateFilterOverlay isInline={true} isOpen={isDestinationOpen} onClose={() => setIsDestinationOpen(false)} onSelectState={(state) => setDestination(state)} title="Select Delivery Destination" subtitle="Choose a logistical termination route point" />
            </section>
          ) : matchOptions.length > 0 && !activeMatch ? (
            <section className="space-y-4">
              <div><h3 className="text-xl font-extrabold text-[#0B1F44] dark:text-white">{mode === 'SHIPPER' ? 'Available Truck Options' : 'Available Load Matches'}</h3><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{mode === 'SHIPPER' ? 'Select a transport option that best fits your budget and risk preference.' : 'Select a cargo load that matches your truck capacity and route.'}</p></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {matchOptions.map(option => (
                  <article key={option.id} className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800" onClick={() => setActiveMatch(option)}>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950"><>{mode === 'SHIPPER' ? <Truck size={22} /> : <Briefcase size={22} />}</></div>
                    <h4 className="text-lg font-bold leading-tight text-[#0B1F44] dark:text-white">{option.title}</h4>
                    <p className="mt-1 flex-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{option.subtitle}</p>
                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estimated Fare</p><p className="text-xl font-black text-brand-600">₦{(option?.price || 0).toLocaleString()}</p></div>
                      <Button aria-label="Action" className="rounded-xl bg-brand-600 p-2.5 text-white hover:bg-brand-700"><Handshake size={16} /></Button>
                    </div>
                  </article>
                ))}
              </div>
              <Button onClick={() => setMatchOptions([])} className="text-sm font-bold text-brand-700 hover:underline">&larr; Back to Search</Button>
            </section>
          ) : (
            <section className="space-y-5">
              <BiddingInterface activeMatch={activeMatch} negotiationStatus={negotiationStatus} isNegotiating={isNegotiating} setIsNegotiating={setIsNegotiating} counterPrice={counterPrice} setCounterPrice={setCounterPrice} handleAcceptBid={handleAcceptBid} handleCounterOffer={handleCounterOffer} />
              <div className="space-y-2 border-t border-slate-200 pt-6 text-left dark:border-slate-800"><h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alternative verified market loads on this route</h4><p className="text-sm leading-6 text-slate-500 dark:text-slate-400">No alternative verified loads found on this route.</p></div>
              <div className="flex justify-center"><Button onClick={handleReturnToDashboard} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"><RefreshCw size={12} /> Return to Dashboard</Button></div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
