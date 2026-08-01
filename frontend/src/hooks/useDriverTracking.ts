
import { useEffect, useState } from 'react';
import { NativeTrackingEngine } from '../utils/nativeTrackingEngine';

export type TripStatus = 'IDLE' | 'QUOTE_SUBMITTED' | 'QUOTE_ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELED';

export const useDriverTracking = (tripStatus: TripStatus) => {
  const [trackingStatus, setTrackingStatus] = useState(NativeTrackingEngine.getStatus());

  useEffect(() => {
    // 1. Wrap the background tracking initialization inside an active condition handler
    // that checks the current load state or order status
    
    if (tripStatus === 'QUOTE_ACCEPTED' || tripStatus === 'IN_TRANSIT') {
      // 3. Create an active listener or callback hook tied to the customer confirmation action.
      // Only when the server returns confirmation that the customer has accepted the driver's quote,
      // set the tracking status to active and trigger the native Background Geolocation service.
      NativeTrackingEngine.start();
      setTrackingStatus('ACTIVE');
    } else if (tripStatus === 'QUOTE_SUBMITTED') {
      // 2. Ensure that when a driver submits a quote, the native tracking engine remains completely idle ('STOPPED')
      NativeTrackingEngine.stop();
      setTrackingStatus('STOPPED');
    } else if (tripStatus === 'CANCELED' || tripStatus === 'COMPLETED') {
      // 4. If a trip is canceled or completes, explicitly call the .stop() tracking function
      // to immediately shut down the device's GPS hardware and preserve battery.
      NativeTrackingEngine.stop();
      setTrackingStatus('STOPPED');
    } else {
      // Fallback for IDLE or unknown state
      NativeTrackingEngine.stop();
      setTrackingStatus('STOPPED');
    }
  }, [tripStatus]);

  return trackingStatus;
};
