import React, { useState } from 'react';
import MyShipments from './MyShipments';
import TrackingDashboard from './TrackingDashboard';
import api from '../api/client';

export default function ShipperShipmentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [trackingShipmentId, setTrackingShipmentId] = useState<string | null>(null);

  const handleAcceptBid = async (_isEscrowEnabled: boolean, bidId: string) => {
    try {
      await api.post('/bids/accept', { bidId });
      setRefreshKey((value) => value + 1);
    } catch (error: any) {
      console.error('Failed to accept bid:', error);
      window.alert(error?.response?.data?.error || 'Unable to accept this bid. Please try again.');
    }
  };

  return (
    <div className="tc-shipper-mobile-surface flex min-h-0 w-full flex-1 flex-col overflow-hidden dark:bg-slate-950">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
        <MyShipments
          key={refreshKey}
          onAcceptBid={handleAcceptBid}
          onViewTracking={(load) => setTrackingShipmentId(load?.id ? String(load.id) : null)}
        />
      </div>
      {trackingShipmentId && (
        <TrackingDashboard shipmentId={trackingShipmentId} onClose={() => setTrackingShipmentId(null)} />
      )}
    </div>
  );
}
