import React from 'react';
import JobStatusFrame from './JobStatusFrame';
import TrackingDashboard from './TrackingDashboard';
import api from '../api/client';
import { Button } from './ui/Button';
import { functions } from '../utils/firebase';
import { httpsCallable } from 'firebase/functions';

interface TrackingViewProps {
  acceptedJob: any;
  setAcceptedJob: (job: any) => void;
  detailsProvided: boolean;
  setDetailsProvided: (val: boolean) => void;
  mode: string;
  activeMatch: any;
  pickupDetails: any;
  setPickupDetails: (details: any) => void;
  deliveryDetails: any;
  setDeliveryDetails: (details: any) => void;
}

export default function TrackingView({
  acceptedJob,
  setAcceptedJob,
  detailsProvided,
  setDetailsProvided,
  mode,
  activeMatch,
  pickupDetails,
  setPickupDetails,
  deliveryDetails,
  setDeliveryDetails
}: TrackingViewProps) {
  const [paymentProvider, setPaymentProvider] = React.useState('paystack');
  if (!acceptedJob) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-6 text-left">
      <JobStatusFrame 
        status={acceptedJob.status} 
        paymentStatus={acceptedJob.paymentStatus} 
        isEscrowEnabled={acceptedJob.isEscrowEnabled} 
      />

      <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <TrackingDashboard shipmentId={activeMatch?.id || acceptedJob?.id} onClose={() => setAcceptedJob(null)} />
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-wrap gap-2">
        <h4 className="w-full text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider mb-2">Simulate Lifecycle Events</h4>
        
        {acceptedJob.status === 'QUOTE_ACCEPTED' && !detailsProvided && mode === 'SHIPPER' && (
          <div className="w-full bg-brand-50 border border-brand-200 p-4 rounded-xl mb-4 space-y-4">
            <h4 className="text-sm font-bold text-brand-900">Finalize Load: Provide Exact Details</h4>
            <p className="text-xs text-brand-700">For security purposes, exact pickup and delivery details are only shared after you accept a bid.</p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-">Pickup Information</label>
                <input type="text" placeholder="Exact Pickup Address" value={pickupDetails.address} onChange={e => setPickupDetails({...pickupDetails, address: e.target.value})} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={pickupDetails.date} onChange={e => setPickupDetails({...pickupDetails, date: e.target.value})} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500" />
                  <input type="text" placeholder="Pickup Contact Phone" value={pickupDetails.contact} onChange={e => setPickupDetails({...pickupDetails, contact: e.target.value})} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-">Delivery Information</label>
                <input type="text" placeholder="Exact Delivery Address" value={deliveryDetails.address} onChange={e => setDeliveryDetails({...deliveryDetails, address: e.target.value})} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={deliveryDetails.date} onChange={e => setDeliveryDetails({...deliveryDetails, date: e.target.value})} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500" />
                  <input type="text" placeholder="Delivery Contact Phone" value={deliveryDetails.contact} onChange={e => setDeliveryDetails({...deliveryDetails, contact: e.target.value})} className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500" />
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  if(!pickupDetails.address || !deliveryDetails.address) return alert('Please provide exact addresses for pickup and delivery.');
                  setDetailsProvided(true);
                }}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
              >
                Submit Details & Proceed
              </Button>
            </div>
          </div>
        )}

        {acceptedJob.isEscrowEnabled && acceptedJob.status === 'QUOTE_ACCEPTED' && detailsProvided && acceptedJob.paymentStatus !== 'PAID' && (
          <div className="flex items-center gap-2">
            <select 
              value={paymentProvider} 
              onChange={(e) => setPaymentProvider(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-brand-500 bg-white dark:bg-slate-900"
            >
              <option value="paystack">Paystack</option>
              <option value="flutterwave">Flutterwave</option>
            </select>
            <Button 
              onClick={async () => {
                setAcceptedJob({ ...acceptedJob, paymentStatus: 'PAID' });
                try {
                  if (paymentProvider === 'flutterwave') {
                    const initFlutterwave = httpsCallable(functions, 'initializeFlutterwavePayment');
                    const result = await initFlutterwave({ 
                      loadId: String(activeMatch?.id || acceptedJob?.id || ''), 
                      amount: activeMatch?.price || 50000,
                      email: localStorage.getItem('userEmail') || 'customer@example.com'
                    });
                    console.log('Flutterwave init:', result);
                    if ((result.data as any)?.authorizationUrl) {
                      window.location.href = (result.data as any).authorizationUrl;
                    }
                  } else {
                    await api.post('/payments/initialize-escrow', { loadId: String(activeMatch?.id || acceptedJob?.id || ''), amount: activeMatch?.price || 50000 });
                  }
                } catch (e) { console.error(e); }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
            >
              Fund Escrow
            </Button>
          </div>
        )}

        {acceptedJob.status === 'QUOTE_ACCEPTED' && detailsProvided && (!acceptedJob.isEscrowEnabled || acceptedJob.paymentStatus === 'PAID') && (
          <Button 
            onClick={async () => {
              setAcceptedJob({ ...acceptedJob, status: 'TRANSIT_ONGOING' });
              try {
                await api.patch(`/loads/${activeMatch?.id || acceptedJob?.id || ''}`, { status: 'TRANSIT_ONGOING' });
              } catch (e) { console.error(e); }
            }}
            className="bg-brand-600 hover:bg-brand-50 cursor-pointer hover:shadow-sm0 text-white text-xs font-bold px-3 py-2 rounded-lg"
          >
            Driver Starts Transit
          </Button>
        )}

        {acceptedJob.status === 'TRANSIT_ONGOING' && (
          <Button 
            onClick={async () => {
              setAcceptedJob({ ...acceptedJob, status: 'DELIVERED' });
              try {
                await api.patch(`/loads/${activeMatch?.id || acceptedJob?.id || ''}`, { status: 'DELIVERED' });
              } catch (e) { console.error(e); }
            }}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
          >
            Driver Completes Delivery
          </Button>
        )}

        {acceptedJob.isEscrowEnabled && acceptedJob.status === 'DELIVERED' && acceptedJob.paymentStatus !== 'RELEASED' && mode === 'SHIPPER' && (
          <Button 
            onClick={async () => {
              alert("Goods received in good order. Escrow funds securely released to transporter's account.");
              setAcceptedJob({ ...acceptedJob, paymentStatus: 'RELEASED' });
              try {
                await api.post('/payments/release-escrow', { loadId: String(activeMatch?.id || acceptedJob?.id || ''), driverId: activeMatch?.driverId || 'pending' });
              } catch (e) { console.error(e); }
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg animate-pulse"
          >
            Verify Delivery & Release Funds
          </Button>
        )}

        <Button 
          onClick={() => setAcceptedJob(null)}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:text-slate- text-xs font-bold px-3 py-2 rounded-lg ml-auto"
        >
          Reset Demo
        </Button>
      </div>
    </div>
  );
}
