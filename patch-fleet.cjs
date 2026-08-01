const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFleetMarketplace.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';`;

code = code.replace(/import React, \{ useState \} from 'react';/, importReplacement);

const hookReplacement = `export default function AdminFleetMarketplace() {
  const [activeTab, setActiveTab] = useState<'FLEET' | 'MARKETPLACE'>('FLEET');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: fleetData, loading: fleetLoading, error: fleetError, isOffline: fleetOffline, refetch: refetchFleet } = useAdminLiveData<Vehicle[]>({
    endpoint: '/admin/fleet',
    queryKey: 'admin_fleet',
    autoRefreshInterval: 30000,
    mockData: MOCK_FLEET
  });

  const { data: loadsData, loading: loadsLoading, error: loadsError, isOffline: loadsOffline, refetch: refetchLoads } = useAdminLiveData<Load[]>({
    endpoint: '/admin/loads',
    queryKey: 'admin_loads',
    autoRefreshInterval: 30000,
    mockData: MOCK_LOADS
  });

  const fleet = fleetData || [];
  const loads = loadsData || [];
`;

code = code.replace(/export default function AdminFleetMarketplace\(\) \{\n\s*const \[activeTab, setActiveTab\] = useState\<'FLEET' \| 'MARKETPLACE'\>\('FLEET'\);\n\s*const \[searchTerm, setSearchTerm\] = useState\(''\);/, hookReplacement);

// Replace MOCK_FLEET and MOCK_LOADS in jsx
code = code.replace(/MOCK_FLEET\.filter/g, 'fleet.filter');
code = code.replace(/MOCK_LOADS\.filter/g, 'loads.filter');

// add offline/error ui inside the wrapper
const wrapperMatch = /<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">/;
const uiAdditions = `<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
      {(fleetOffline || loadsOffline) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex justify-between items-center">
          <span>You are currently offline. Showing cached data.</span>
        </div>
      )}
      {(fleetError || loadsError) && !fleet.length && !loads.length && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex justify-between items-center">
          <span>Failed to load live data. Retrying...</span>
          <button onClick={() => {refetchFleet(); refetchLoads();}} className="px-3 py-1 bg-white rounded border border-rose-200 hover:bg-rose-50">Retry</button>
        </div>
      )}`;
code = code.replace(wrapperMatch, uiAdditions);

fs.writeFileSync('src/components/AdminFleetMarketplace.tsx', code);
