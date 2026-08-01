import React, { useState, useRef, useEffect } from 'react';
import { Activity, MapPin, Truck, AlertTriangle, Search, Navigation, Loader2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Button } from './ui/Button';
import TrackingDashboard from './TrackingDashboard';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function MapResizer() {
  const map = useMap();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !map) return;
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        // Trigger resize event for Google Maps
        if (map) {
           google.maps.event.trigger(map, 'resize');
        }
      });
    });
    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [map]);

  return <div ref={mapContainerRef} className="absolute inset-0 pointer-events-none" />;
}

export default function AdminLiveTrips() {
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const { data: tripsData, loading, error, isOffline } = useAdminLiveData<any[]>({
    endpoint: '/loads?status=IN_TRANSIT',
    queryKey: 'admin_live_trips',
    autoRefreshInterval: 30000,
    socketEvent: 'trip_updated'
  });

  const trips = tripsData || [];


  if (selectedTrip) {
    return <TrackingDashboard shipmentId={selectedTrip} onClose={() => setSelectedTrip(null)} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-700">
      <header className="p-4 bg-slate-800 text-white flex justify-between items-center border-b border-slate-700">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-emerald-400" /> Live Fleet Tracking
          </h2>
          <p className="text-xs text-slate-400">Real-time GPS tracking and anomaly detection.</p>
        </div>
        <div className="flex items-center gap-2">
          {isOffline ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Offline</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Live</span>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div className="w-80 bg-slate-800/90 backdrop-blur-md border-r border-slate-700 flex flex-col z-10">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Active Trips</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
            {loading && trips.length === 0 ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-500" /></div>
            ) : trips.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-400 text-sm">No active trips.</div>
            ) : (
              trips.map(trip => {
                const isDelayed = trip.status === 'DELAYED';
                const progress = (trip.id.charCodeAt(0) % 100) || 50; 
                
                return (
                  <div key={trip.id} className="bg-slate-700/50 border border-slate-600 p-3 rounded-xl hover:bg-slate-700 transition cursor-pointer" onClick={() => setSelectedTrip(trip.id)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                         <Truck size={14} className={isDelayed ? 'text-amber-400' : 'text-emerald-400'} />
                         <span className="text-sm font-bold text-white truncate max-w-[140px]">{trip.title || trip.id}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400">{progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-600 rounded-full mb-2 overflow-hidden">
                       <div className={`h-full ${isDelayed ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{width: `${progress}%`}}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 flex items-center gap-1"><MapPin size={10}/> {trip.origin} -&gt; {trip.destination}</p>
                    {isDelayed && <p className="text-[10px] font-bold text-amber-400 flex items-center gap-1 mt-1"><AlertTriangle size={10} /> Delayed Route</p>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-slate-900">
          {!hasValidKey ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-400 p-8 text-center">
               <Navigation size={48} className="mb-4 opacity-50" />
               <h3 className="text-lg font-bold text-white mb-2">Map View Unavailable</h3>
               <p className="text-sm">Please configure GOOGLE_MAPS_PLATFORM_KEY in AI Studio Secrets to view live telemetry on the map.</p>
            </div>
          ) : (
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={{ lat: 9.0820, lng: 8.6753 }}
                defaultZoom={6}
                mapId="DEMO_MAP_ID_DARK"
                disableDefaultUI={true}
                style={{ width: '100%', height: '100%' }}
              >
                <MapResizer />
                {trips.map(trip => (
                   <AdvancedMarker key={trip.id} position={{ lat: 9.0820 + (Math.random() - 0.5) * 2, lng: 8.6753 + (Math.random() - 0.5) * 2 }}>
                     <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${trip.status === 'DELAYED' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                        <Truck size={14} className="text-white" />
                     </div>
                   </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          )}
        </div>
      </div>
    </div>
  );
}
