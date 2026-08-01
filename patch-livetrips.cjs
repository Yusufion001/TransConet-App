const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLiveTrips.tsx', 'utf8');

const importReplacement = `import React, { useState, useRef, useEffect } from 'react';
import { Activity, MapPin, Truck, AlertTriangle, Search, Navigation, Loader2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Button } from './ui/Button';
import TrackingDashboard from './TrackingDashboard';
import { useAdminLiveData } from '../hooks/useAdminLiveData';`;

code = code.replace(/import React, \{ useState, useEffect, useRef \} from 'react';\nimport \{ Activity, MapPin, Truck, AlertTriangle, Search, Navigation, Loader2 \} from 'lucide-react';\nimport \{ APIProvider, Map, AdvancedMarker, useMap \} from '@vis\.gl\/react-google-maps';\nimport \{ Button \} from '\.\/ui\/Button';\nimport api from '\.\.\/api\/client';\nimport TrackingDashboard from '\.\/TrackingDashboard';/, importReplacement);

const hookReplacement = `export default function AdminLiveTrips() {
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const { data: tripsData, loading, error, isOffline } = useAdminLiveData<any[]>({
    endpoint: '/loads?status=IN_TRANSIT',
    queryKey: 'admin_live_trips',
    autoRefreshInterval: 30000,
    socketEvent: 'trip_updated'
  });

  const trips = tripsData || [];
`;

code = code.replace(/export default function AdminLiveTrips\(\) \{\n\s*const \[selectedTrip, setSelectedTrip\] = useState<string \| null>\(null\);\n\s*const \[trips, setTrips\] = useState<any\[\]>\(\[\]\);\n\s*const \[loading, setLoading\] = useState\(true\);\n\s*useEffect\(\(\) => \{\n\s*const fetchTrips = async \(\) => \{[\s\S]*?\};\n\s*fetchTrips\(\);\n\s*const intervalId = setInterval\(fetchTrips, 30000\);\n\s*return \(\) => clearInterval\(intervalId\);\n\s*\}, \[\]\);/, hookReplacement);

const headerReplacement = `<header className="p-4 bg-slate-800 text-white flex justify-between items-center border-b border-slate-700">
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
      </header>`;
code = code.replace(/<header className="p-4 bg-slate-800 text-white flex justify-between items-center border-b border-slate-700">[\s\S]*?<\/header>/, headerReplacement);

fs.writeFileSync('src/components/AdminLiveTrips.tsx', code);
