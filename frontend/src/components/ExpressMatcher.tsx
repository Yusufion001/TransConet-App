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

  useEffect(() => {
    const newSocket = io('/', {
      withCredentials: true
    });
    setSocket(newSocket);
    
    // We listen globally for load_bids_updated
    newSocket.on('connect', () => {
       console.log('ExpressMatcher Socket connected');
    });
    
    // When any load bid updates, if it matches our active match, we might refresh
    newSocket.on('load_bids_updated', (data: any) => {
       console.log('load_bids_updated', data);
       if (mode === 'SHIPPER') {
         setToastNotification({
           title: 'New Bid Received!',
           message: `A transporter just placed a bid on your cargo.`
         });
         setTimeout(() => setToastNotification(null), 5000);
       }
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, [mode]);
  useEffect(() => {
    if (!socket || !activeMatch) return;
    socket.emit('join_load', activeMatch.id);
  }, [socket, activeMatch]);

  const [matchOptions, setMatchOptions] = useState<any[]>([]);
  const [acceptedJob, setAcceptedJob] = useState<any>(null);
  const [pickupDetails, setPickupDetails] = useState({ address: '', contact: '', date: '' });
  const [deliveryDetails, setDeliveryDetails] = useState({ address: '', contact: '', date: '' });
  const [detailsProvided, setDetailsProvided] = useState(false);
  
  // Negotiation States
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [negotiationStatus, setNegotiationStatus] = useState('');

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
        // Fetch live database loads via Express API connected to Supabase PostgreSQL
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
    } catch (e) {
      console.error('Failed to accept bid via API:', e.response?.data || e);
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

  return (
    <div className="flex-1 h-full w-full max-w-4xl mx-auto p-6 space-y-8 overflow-y-auto relative">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-800 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 max-w-sm">
            <div className="bg-brand-500/20 p-2 rounded-full mt-1">
              <Truck size={16} className="text-brand-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">{toastNotification.title}</h4>
              <p className="text-xs text-slate-300 dark:text-slate-300 mt-1">{toastNotification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <span className="bg-brand-50/50 text-brand-600 border border-brand-100 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5">
          <Handshake size={12} /> Direct Connection & Free Negotiation
        </span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white  tracking-tight">
          {mode === 'SHIPPER' ? 'Find a Verified Truck Instantly' : 'Grab Premium Haulage Jobs Instantly'}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400  max-w-md mx-auto">
          Get a baseline price match, negotiate directly on the platform, or call to finalize your arrangement.
        </p>
      </div>

      {/* User Type Toggle - Segmented Control */}
      <div className="flex justify-center">
        
      </div>

      {/* Shipper Sub-Tabs */}
      {mode === 'SHIPPER' && (
        <div className="flex justify-center gap-2 animate-in fade-in duration-75">
          <Button
            onClick={() => { setShipperSubMode('SEARCH'); setActiveMatch(null); }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-75 cursor-pointer uppercase tracking-widest ${shipperSubMode === 'SEARCH' ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-brand-50 cursor-pointer hover:shadow-sm border border-transparent'}`}
          >
            Find a Truck
          </Button>
          <Button
            onClick={() => { setShipperSubMode('POST'); setActiveMatch(null); }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-75 cursor-pointer uppercase tracking-widest ${shipperSubMode === 'POST' ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-brand-50 cursor-pointer hover:shadow-sm border border-transparent'}`}
          >
            Post Cargo
          </Button>
          <Button
            onClick={() => { setShipperSubMode('MY_LOADS'); setActiveMatch(null); }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-75 cursor-pointer uppercase tracking-widest ${shipperSubMode === 'MY_LOADS' ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-brand-50 cursor-pointer hover:shadow-sm border border-transparent'}`}
          >
            My Shipments
          </Button>
        </div>
      )}

      {/* Transporter Sub-Tabs */}
      {mode === 'TRANSPORTER' && (
        <div className="flex justify-center gap-2 animate-in fade-in duration-75">
          <Button
            onClick={() => { setTransporterSubMode('JOBS'); setActiveMatch(null); }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-75 cursor-pointer uppercase tracking-widest ${transporterSubMode === 'JOBS' ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-brand-50 cursor-pointer hover:shadow-sm border border-transparent'}`}
          >
            Find Load Matches
          </Button>
          <Button
            onClick={() => { setTransporterSubMode('REGISTER'); setActiveMatch(null); }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-75 cursor-pointer uppercase tracking-widest ${transporterSubMode === 'REGISTER' ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-brand-50 cursor-pointer hover:shadow-sm border border-transparent'}`}
          >
            Register Fleet
          </Button>
        </div>
      )}

      {/* Primary Content Window */}
      {acceptedJob ? (
        <TrackingView 
          acceptedJob={acceptedJob}
          setAcceptedJob={setAcceptedJob}
          detailsProvided={detailsProvided}
          setDetailsProvided={setDetailsProvided}
          mode={mode}
          activeMatch={activeMatch}
          pickupDetails={pickupDetails}
          setPickupDetails={setPickupDetails}
          deliveryDetails={deliveryDetails}
          setDeliveryDetails={setDeliveryDetails}
        />
      ) : mode === 'TRANSPORTER' && transporterSubMode === 'REGISTER' ? (
        <TransporterForm />
      ) : mode === 'SHIPPER' && shipperSubMode === 'POST' ? (
        <CargoDetailsForm />
      ) : mode === 'SHIPPER' && shipperSubMode === 'MY_LOADS' ? (
        <MyShipments 
          onAcceptBid={handleAcceptBid} 
          onViewTracking={(job) => {
            setAcceptedJob(job);
            setActiveMatch(job);
            // Optionally change view if needed, but TrackingView will render below if acceptedJob is set
          }}
        />
      ) : !activeMatch && matchOptions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-[20px] p-6 shadow-sm ">
          <form onSubmit={handleActionSubmit} className={`grid grid-cols-1 md:grid-cols-${mode === 'SHIPPER' ? '3' : '2'} gap-4 items-end`}>
            <div>
              <LocationAutocomplete 
                label={mode === 'SHIPPER' ? 'Pickup Location' : 'Current Location'}
                placeholder="Search pickup address..."
                value={origin}
                onChange={(val) => setOrigin(val)}
                iconColor="text-emerald-500"
              />
            </div>

            {mode === 'SHIPPER' && (
              <div>
                <LocationAutocomplete 
                  label="Destination Location"
                  placeholder="Search destination address..."
                  value={destination}
                  onChange={(val) => setDestination(val)}
                  iconColor="text-brand-500"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={processing}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-500/10 text-sm cursor-pointer"
            >
              {processing ? 'Matching Fleet...' : 'Find Match & Negotiate'}
            </Button>
          </form>

          {/* Interactive State Picker Drawers */}
          <StateFilterOverlay 
            isInline={true}
            isOpen={isOriginOpen}
            onClose={() => setIsOriginOpen(false)}
            onSelectState={(state) => setOrigin(state)}
            title={mode === 'SHIPPER' ? 'Select Pickup Origin' : 'Select Fleet Location'}
            subtitle="Choose a logistical starting route point"
          />

          <StateFilterOverlay 
            isInline={true}
            isOpen={isDestinationOpen}
            onClose={() => setIsDestinationOpen(false)}
            onSelectState={(state) => setDestination(state)}
            title="Select Delivery Destination"
            subtitle="Choose a logistical termination route point"
          />
        </div>
      ) : matchOptions.length > 0 && !activeMatch ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-75">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{mode === 'SHIPPER' ? 'Available Truck Options' : 'Available Load Matches'}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{mode === 'SHIPPER' ? 'Select a transport option that best fits your budget and risk preference.' : 'Select a cargo load that matches your truck capacity and route.'}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matchOptions.map(option => (
              <div key={option.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:border-brand-300 transition cursor-pointer flex flex-col" onClick={() => setActiveMatch(option)}>
                <div className="p-3 bg-brand-50 text-brand-600 rounded-xl w-fit mb-3">
                  {mode === 'SHIPPER' ? <Truck size={24} /> : <Briefcase size={24} />}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{option.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex-1">{option.subtitle}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-black tracking-wider">Estimated Fare</p>
                    <p className="text-brand-600 font-black text-xl">₦{(option?.price || 0).toLocaleString()}</p>
                  </div>
                  <Button aria-label="Action" className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 transition">
                    <Handshake size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => setMatchOptions([])} className="text-brand-600 text-sm font-semibold hover:underline">
            &larr; Back to Search
          </Button>
        </div>
      ) : (
        /* Match Result Dashboard with Built-In Negotiation Box */
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-75">
          <BiddingInterface 
            activeMatch={activeMatch}
            negotiationStatus={negotiationStatus}
            isNegotiating={isNegotiating}
            setIsNegotiating={setIsNegotiating}
            counterPrice={counterPrice}
            setCounterPrice={setCounterPrice}
            handleAcceptBid={handleAcceptBid}
            handleCounterOffer={handleCounterOffer}
          />

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4 text-left">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alternative Verified Market Loads On This Route</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">No alternative verified loads found on this route.</p>
          </div>

          {/* Back Control */}
          <div className="flex justify-center">
            <Button
              onClick={handleReturnToDashboard}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-brand-600 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-brand-600 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
            >
              <RefreshCw size={12} /> Return to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
