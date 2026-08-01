const fs = require('fs');
let code = fs.readFileSync('src/components/AdminActivityTimeline.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';`;
code = code.replace(/import React, \{ useState \} from 'react';/, importReplacement);

const hookReplacement = `export default function AdminActivityTimeline() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const { data: eventsData, loading, error, isOffline, refetch } = useAdminLiveData<TimelineEvent[]>({
    endpoint: '/admin/audit-logs',
    queryKey: 'admin_audit_logs',
    autoRefreshInterval: 15000,
    socketEvent: 'audit_log_created',
    mockData: MOCK_EVENTS
  });

  const events = eventsData || [];
`;
code = code.replace(/export default function AdminActivityTimeline\(\) \{\n\s*const \[events, setEvents\] = useState<TimelineEvent\[\]>\(MOCK_EVENTS\);\n\s*const \[searchTerm, setSearchTerm\] = useState\(''\);\n\s*const \[filterType, setFilterType\] = useState<string>\('ALL'\);/, hookReplacement);


const wrapperMatch = /<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">/;
const uiAdditions = `<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
      {isOffline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex justify-between items-center">
          <span>You are currently offline. Showing cached data.</span>
        </div>
      )}
      {error && !events.length && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex justify-between items-center">
          <span>Failed to load live events. Retrying...</span>
          <button onClick={refetch} className="px-3 py-1 bg-white rounded border border-rose-200 hover:bg-rose-50">Retry</button>
        </div>
      )}
      {loading && events.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading live activity feed...</p>
        </div>
      )}
`;
code = code.replace(wrapperMatch, uiAdditions);

fs.writeFileSync('src/components/AdminActivityTimeline.tsx', code);
