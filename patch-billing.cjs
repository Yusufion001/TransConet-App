const fs = require('fs');
let code = fs.readFileSync('src/components/AdminSubscriptionBilling.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';`;
code = code.replace(/import React, \{ useState \} from 'react';/, importReplacement);

const hookReplacement = `export default function AdminSubscriptionBilling() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'ALL' | 'BASIC' | 'PRO' | 'ENTERPRISE'>('ALL');

  const { data: subscribersData, loading, error, isOffline, refetch } = useAdminLiveData<Subscriber[]>({
    endpoint: '/admin/subscriptions',
    queryKey: 'admin_subscriptions',
    autoRefreshInterval: 30000,
    socketEvent: 'subscription_updated',
    mockData: MOCK_SUBSCRIBERS
  });

  const subscribers = subscribersData || [];
`;
code = code.replace(/export default function AdminSubscriptionBilling\(\) \{\n\s*const \[subscribers, setSubscribers\] = useState<Subscriber\[\]>\(MOCK_SUBSCRIBERS\);\n\s*const \[searchTerm, setSearchTerm\] = useState\(''\);\n\s*const \[filterPlan, setFilterPlan\] = useState\<'ALL' \| 'BASIC' \| 'PRO' \| 'ENTERPRISE'\>\('ALL'\);/, hookReplacement);

// Add loading/error UI just before the grid
const gridMatch = /<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">/;
const uiAdditions = `
      {isOffline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex justify-between items-center">
          <span>You are currently offline. Showing cached data.</span>
        </div>
      )}
      {error && !subscribers.length && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex justify-between items-center">
          <span>Failed to load live data. Retrying...</span>
          <button onClick={refetch} className="px-3 py-1 bg-white rounded border border-rose-200 hover:bg-rose-50">Retry</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">`;
code = code.replace(gridMatch, uiAdditions);

const listMatch = /<tbody className="divide-y divide-slate-100 dark:divide-slate-800">/;
const listReplacement = `<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading && subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Loading live subscriptions...</p>
                      </div>
                    </td>
                  </tr>
                ) : null}`;
code = code.replace(listMatch, listReplacement);

fs.writeFileSync('src/components/AdminSubscriptionBilling.tsx', code);
