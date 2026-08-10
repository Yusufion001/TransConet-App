/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageSquare, X, ChevronUp, Navigation, CheckCircle2, Clock, Radio } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import api from '../api/client';
import { getSocket } from '../api/socketClient';
import { Button } from './ui/Button';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';
const defaultCenter = { lat: 6.5244, lng: 3.3792 };

function RouteDisplay({ origin, destination }: { origin: string | google.maps.LatLngLiteral; destination: string | google.maps.LatLngLiteral }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const hasFittedRoute = useRef(false);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    })
      .then(({ routes }) => {
        const route = routes?.[0];
        if (!route) return;

        const newPolylines = route.createPolylines();
        newPolylines.forEach((polyline) => {
          polyline.setOptions({ strokeColor: '#2563eb', strokeWeight: 5, strokeOpacity: 0.8 });
          polyline.setMap(map);
        });
        polylinesRef.current = newPolylines;

        if (route.viewport && !hasFittedRoute.current) {
          map.fitBounds(route.viewport);
          hasFittedRoute.current = true;
        }
      })
      .catch(() => undefined);

    return () => {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, origin, destination]);

  return null;
}

interface TrackingDashboardProps {
  shipmentId: string;
  onClose: () => void;
}

export default function TrackingDashboard({ shipmentId, onClose }: TrackingDashboardProps) {
  const [vehicleLocation, setVehicleLocation] = useState(defaultCenter);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [loadData, setLoadData] = useState<any>(null);

  useEffect(() => {
    api.get(`/loads/${shipmentId}`)
      .then((res) => {
        if (res.data) setLoadData(res.data);
      })
      .catch(console.error);

    const socket = getSocket();
    socket.emit('join_load', shipmentId);

    const handleLocationUpdate = (data: any) => {
      const lat = Number(data?.lat);
      const lng = Number(data?.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setVehicleLocation({ lat, lng });
      }
    };

    socket.on('location_update', handleLocationUpdate);
    return () => {
      socket.off('location_update', handleLocationUpdate);
    };
  }, [shipmentId]);

  if (!hasValidKey) {
    return (
      <div className="tc-tracking-screen fixed inset-0 z-50 flex min-h-[100dvh] flex-col items-center justify-center bg-slate-900 p-6 text-white">
        <h2 className="mb-4 text-center text-2xl font-bold">Google Maps API Key Required</h2>
        <div className="mx-auto max-w-md text-left text-sm leading-6 text-slate-300">
          <p className="mb-2">Enter your Google Maps API key in AI Studio Secrets:</p>
          <ol className="mb-6 ml-6 list-decimal">
            <li>Open Settings</li>
            <li>Select Secrets</li>
            <li>Add <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
            <li>Paste your key and press Enter</li>
          </ol>
        </div>
        <Button onClick={onClose} className="min-h-11 rounded-xl bg-red-600 px-7 py-3 font-bold shadow-lg hover:bg-red-500">Close Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="tc-tracking-screen fixed inset-0 z-50 flex min-h-[100dvh] w-full flex-col overflow-hidden bg-slate-900 font-sans">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-5">
        <Button
          aria-label="Close tracking"
          onClick={onClose}
          className="pointer-events-auto h-11 w-11 rounded-2xl bg-white p-0 text-slate-700 shadow-lg hover:text-red-500 dark:bg-slate-900 dark:text-slate-200"
        >
          <X size={22} strokeWidth={2.5} />
        </Button>
      </div>

      <div className="relative min-h-0 flex-1">
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
            <RouteDisplay origin={loadData?.origin || 'Lagos, Nigeria'} destination={loadData?.destination || 'Kano, Nigeria'} />
            <AdvancedMarker position={vehicleLocation}>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-brand-600 shadow-xl">
                <div className="absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-75" />
                <Navigation size={18} className="relative z-10 rotate-45 text-white" />
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>

        <div className="absolute left-3 top-[calc(4.5rem+env(safe-area-inset-top))] z-20 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-700 bg-slate-900/90 p-3 text-left text-white shadow-lg backdrop-blur-md sm:left-5 sm:top-20 sm:max-w-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-400">
            <Radio size={12} className="animate-pulse" /> Live GPS Telemetry
          </div>
          <div className="mt-2 space-y-0.5 font-mono text-[10px] text-slate-400">
            <p>LAT: {vehicleLocation.lat.toFixed(6)} N</p>
            <p>LNG: {vehicleLocation.lng.toFixed(6)} E</p>
            <p>GPS: LIVE</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isSheetOpen ? 0 : 'calc(100% - 76px)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="pointer-events-auto absolute bottom-0 left-0 right-0 z-40 flex justify-center"
        >
          <div className="max-h-[82dvh] w-full overflow-hidden rounded-t-[28px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.16)] dark:bg-slate-900 sm:max-w-3xl sm:rounded-t-[32px]">
            <button
              type="button"
              className="w-full cursor-pointer px-4 pb-2 pt-3 text-left sm:px-6"
              onClick={() => setIsSheetOpen((value) => !value)}
              aria-label="Toggle tracking details"
            >
              <span className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold uppercase text-slate-900 dark:text-white sm:text-lg">
                    {loadData?.title || `Shipment ${shipmentId.substring(0, 8)}`}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-600">
                    <Navigation size={12} /> Live Transit Active
                  </span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <motion.span animate={{ rotate: isSheetOpen ? 180 : 0 }}><ChevronUp size={19} /></motion.span>
                </span>
              </span>
            </button>

            <div className={`max-h-[calc(82dvh-76px)] overflow-y-auto overscroll-contain px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-8 ${isSheetOpen ? 'opacity-100' : 'pointer-events-none h-0 opacity-0'}`}>
              <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/70 sm:p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">ETA</p>
                  <p className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                    <Clock size={16} className="text-brand-500" />~14h 20m
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/70 sm:p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Cargo Weight</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">{loadData?.weightKg ? `${loadData.weightKg} kg` : '30 Tons'}</p>
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-brand-100">
                    <img src="https://ui-avatars.com/api/?name=Driver&background=1565C0&color=fff" alt="Driver" className="h-full w-full" />
                    <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                      <CheckCircle2 size={9} className="text-white" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate font-semibold text-slate-900 dark:text-white">Assigned Transporter</h4>
                    <p className="truncate text-xs text-slate-500">Verified Partner Network</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button aria-label="Message transporter" className="h-11 w-11 rounded-xl bg-brand-50 p-0 text-brand-600 hover:bg-brand-100 dark:bg-brand-950"><MessageSquare size={18} /></Button>
                  <Button aria-label="Call transporter" className="h-11 w-11 rounded-xl bg-emerald-50 p-0 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950"><Phone size={18} /></Button>
                </div>
              </div>

              <div className="relative space-y-6 pl-6 before:absolute before:inset-y-2 before:left-2.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-slate-300 ring-4 ring-white dark:ring-slate-900" />
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Origin</p>
                  <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">{loadData?.origin || 'Lagos Port Terminal'}</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3 w-3 animate-pulse rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-900" />
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-600">Current Location</p>
                  <p className="break-words text-sm font-semibold tracking-wide text-slate-900 dark:text-white">{vehicleLocation.lat.toFixed(4)}, {vehicleLocation.lng.toFixed(4)}</p>
                </div>
                <div className="relative opacity-70">
                  <span className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-emerald-500 bg-white ring-4 ring-white dark:bg-slate-900 dark:ring-slate-900" />
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Destination</p>
                  <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">{loadData?.destination || 'Kano Central Depot'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
