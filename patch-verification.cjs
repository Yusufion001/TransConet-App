const fs = require('fs');
let code = fs.readFileSync('src/components/AdminVerificationCenter.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';`;

code = code.replace(/import React, \{ useState \} from 'react';/, importReplacement);

const hookReplacement = `export default function AdminVerificationCenter() {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { data: requestsData, loading, error, isOffline, refetch, mutate } = useAdminLiveData<VerificationRequest[]>({
    endpoint: '/admin/verifications',
    queryKey: 'admin_verifications',
    autoRefreshInterval: 30000,
    socketEvent: 'verification_updated',
    mockData: MOCK_REQUESTS
  });

  const requests = requestsData || [];
  const selectedRequest = requests.find(r => r.id === selectedRequestId) || null;
`;

code = code.replace(/export default function AdminVerificationCenter\(\) \{\n\s*const \[requests, setRequests\] = useState<VerificationRequest\[\]>\(MOCK_REQUESTS\);\n\s*const \[filterType, setFilterType\] = useState<string>\('ALL'\);\n\s*const \[searchTerm, setSearchTerm\] = useState\(''\);\n\s*const \[selectedRequest, setSelectedRequest\] = useState<VerificationRequest \| null>\(null\);/, hookReplacement);

// Update calls to setSelectedRequest to setSelectedRequestId
code = code.replace(/setSelectedRequest\(req\)/g, 'setSelectedRequestId(req.id)');
code = code.replace(/setSelectedRequest\(null\)/g, 'setSelectedRequestId(null)');
code = code.replace(/setSelectedRequest\(([^)]+)\)/g, (match, p1) => {
    if (p1 === 'null') return 'setSelectedRequestId(null)';
    // In case it's an object being passed, this regex might be tricky, so let's stick to safe replacements
    return `setSelectedRequestId(${p1}.id)`;
});

const actionMatch = /const handleAction = \(id: string, action: 'APPROVE' \| 'REJECT'\) => \{\n\s*setRequests\(prev => prev\.map\(req => req\.id === id \? \{ \.\.\.req, status: action === 'APPROVE' \? 'APPROVED' : 'REJECTED' \} : req\)\);\n\s*setSelectedRequest\(null\);\n\s*\};/;
const actionReplacement = `const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    mutate(prev => prev ? prev.map(req => req.id === id ? { ...req, status: action === 'APPROVE' ? 'APPROVED' as const : 'REJECTED' as const } : req) : []);
    setSelectedRequestId(null);
  };`;
code = code.replace(actionMatch, actionReplacement);

const listMatch = /<div className="flex-1 overflow-y-auto p-2">/;
const listReplacement = `<div className="flex-1 overflow-y-auto p-2">
            {isOffline && (
              <div className="m-2 p-3 bg-amber-50 text-amber-700 rounded-xl text-xs">
                Offline. Showing cached data.
              </div>
            )}
            {error && !requests.length && (
              <div className="m-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex justify-between items-center">
                Failed to load live data.
                <button onClick={refetch} className="px-2 py-1 bg-white rounded border border-rose-200">Retry</button>
              </div>
            )}
            {loading && requests.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Loading live verifications...</div>
            ) : null}`;
code = code.replace(listMatch, listReplacement);


fs.writeFileSync('src/components/AdminVerificationCenter.tsx', code);
