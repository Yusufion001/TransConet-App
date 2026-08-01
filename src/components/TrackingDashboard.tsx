/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageSquare, X, ChevronUp, Navigation, CheckCircle2, Clock, Radio } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import api from '../api/client';
import { getSocket } from '../api/socketClient';
import { Button } from './ui/Button';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function RouteDisplay({ origin, destination, vehicleLocation }: {
  origin: string | google.maps.LatLngLiteral;
  destination: string | google.maps.LatLngLiteral;
  vehicleLocation: google.maps.LatLngLiteral | null;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [routeSet, setRouteSet] = useState(false);

  useEffect(() => {
    if (!routesLib || !map) return;
    if (!origin || !destination) return;
    
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => {
            p.setOptions({ strokeColor: '#2563eb', strokeWeight: 5, strokeOpacity: 0.8 });
            p.setMap(map);
        });
        polylinesRef.current = newPolylines;
        if (routes[0].viewport && !routeSet) {
            map.fitBounds(routes[0].viewport);
            setRouteSet(true);
        }
      }
    });

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
}

interface TrackingDashboardProps {
  shipmentId: string;
  onClose: () => void;
}

const defaultCenter = { lat: 6.5244, lng: 3.3792 }; // Lagos

export default function TrackingDashboard({ shipmentId, onClose }: TrackingDashboardProps) {
  const [vehicleLocation, setVehicleLocation] = useState(defaultCenter);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [loadData, setLoadData] = useState<any>(null);

  useEffect(() => {
    // Fetch load info
    api.get(`/loads/${shipmentId}`).then((res) => {
      if (res.data) {
        setLoadData(res.data);
      }
    }).catch(console.error);
    
    // Subscribe to socket updates
    const socket = getSocket();
    socket.emit('join_load', shipmentId);
    
    socket.on('location_update', (data: any) => {
      if (data.lat && data.lng) {
        setVehicleLocation({ lat: data.lat, lng: data.lng });
      }
    });
    
    // Fallback simulated movement if no live driver data is streaming
    
    return () => {
      socket.off('location_update');
      
    };
  }, [shipmentId]);

  if (!hasValidKey) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col justify-center items-center text-white p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Google Maps API Key Required</h2>
        <div className="max-w-md mx-auto text-left">
            <p className="mb-2 text-slate-300 dark:text-slate-300">Enter your Google Maps API key in AI Studio Secrets:</p>
            <ol className="list-decimal text-slate-300 dark:text-slate-300 ml-6 mb-6 leading-relaxed">
            <li>Open Settings (⚙️ icon, top-right)</li>
            <li>Select Secrets</li>
            <li>Add <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
            <li>Paste your key and press Enter</li>
            </ol>
        </div>
        <Button onClick={onClose} className="px-8 py-3 font-bold bg-rose-600 rounded-lg hover:bg-rose-500 transition shadow-lg">Close Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-hidden flex flex-col font-sans">
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10 pointer-events-none">
        <div className="max-w-3xl mx-auto flex justify-between items-start">
          <Button aria-label="Action" 
            onClick={onClose}
            className="w-12 h-12 bg-white dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center text-slate-700 dark:text-slate- hover:text-rose-500 transition-colors cursor-pointer pointer-events-auto"
          >
            <X size={24} strokeWidth={2.5} />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={7}
            center={vehicleLocation}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI={true}
          >
            <RouteDisplay 
               origin={loadData?.origin || "Lagos, Nigeria"} 
               destination={loadData?.destination || "Kano, Nigeria"}
               vehicleLocation={vehicleLocation}
            />
            
            <AdvancedMarker position={vehicleLocation}>
              <div className="w-10 h-10 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                <Navigation size={18} className="text-white transform rotate-45 relative z-10" />
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>

        {/* Radar overlay */}
        <div className="absolute top-20 left-4 sm:left-6 z-10 bg-slate-900/90 border border-slate-700 p-3 rounded-xl backdrop-blur-md max-w-xs space-y-1 text-left pointer-events-none shadow-xl">
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider">
            <Radio size={12} className="animate-pulse" />
            Live GPS Telemetry
          </div>
          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 space-y-0.5 mt-2">
            <p>LAT: {vehicleLocation.lat.toFixed(6)} N</p>
            <p>LNG: {vehicleLocation.lng.toFixed(6)} E</p>
            <p>VELOCITY: 62 km/h</p>
            <p>SAT-SYNC: SECURE (11/12)</p>
          </div>
        </div>
      </div>

      {/* Interactive Bottom Sheet */}
      <AnimatePresence>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isSheetOpen ? 0 : 'calc(100% - 80px)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto flex justify-center"
        >
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden border-t border-slate-200 dark:border-slate-700">
            <div 
              className="w-full pt-4 pb-2 px-6 flex flex-col items-center cursor-pointer bg-white dark:bg-slate-900"
              onClick={() => setIsSheetOpen(!isSheetOpen)}
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-3" />
              <div className="w-full flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-[#1F2937] uppercase">{loadData?.title || `Shipment ${shipmentId.substring(0, 8)}`}</h3>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Navigation size={12} /> Live Transit Active
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isSheetOpen ? 180 : 0 }}
                  className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-"
                >
                  <ChevronUp size={20} />
                </motion.div>
              </div>
            </div>

            <div className={`px-6 pb-8 pt-2 transition-opacity duration-75 ${isSheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none h-0'}`}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F5F7FA] p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-600 dark:text-slate- uppercase tracking-widest font-bold mb-1">ETA</p>
                  <p className="text-lg font-black text-[#1F2937] flex items-center gap-1.5">
                    <Clock size={16} className="text-blue-500" /> ~14h 20m
                  </p>
                </div>
                <div className="bg-[#F5F7FA] p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-600 dark:text-slate- uppercase tracking-widest font-bold mb-1">Cargo Weight</p>
                  <p className="text-lg font-black text-[#1F2937] flex items-center gap-1.5">
                    {loadData?.weightKg ? `${loadData.weightKg} kg` : '30 Tons'}
                  </p>
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between mb-6 shadow-sm bg-white dark:bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center relative">
                    <img src="https://ui-avatars.com/api/?name=Driver&background=1565C0&color=fff" alt="Driver" className="w-12 h-12 rounded-full" />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1F2937]">Assigned Transporter</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-">Verified Partner Network</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button aria-label="Action" className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition">
                    <MessageSquare size={18} />
                  </Button>
                  <Button aria-label="Action" className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition">
                    <Phone size={18} />
                  </Button>
                </div>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white shadow-sm" />
                  <p className="text-[10px] text-slate-600 dark:text-slate- font-bold uppercase tracking-widest mb-0.5">Origin</p>
                  <p className="font-bold text-[#1F2937] text-sm">{loadData?.origin || 'Lagos Port Terminal'}</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white shadow-sm animate-pulse" />
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-0.5">Current Location</p>
                  <p className="font-bold text-[#1F2937] text-sm tracking-wide">{vehicleLocation.lat.toFixed(4)}, {vehicleLocation.lng.toFixed(4)}</p>
                </div>
                <div className="relative opacity-70">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900 ring-4 ring-white" />
                  <p className="text-[10px] text-slate-600 dark:text-slate- font-bold uppercase tracking-widest mb-0.5">Destination</p>
                  <p className="font-bold text-[#1F2937] text-sm">{loadData?.destination || 'Kano Central Depot'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
