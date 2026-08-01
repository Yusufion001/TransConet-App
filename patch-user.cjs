const fs = require('fs');
let code = fs.readFileSync('src/components/AdminUserManagement.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { Users, CheckCircle2, XCircle, ShieldCheck, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';`;
code = code.replace(/import React, \{ useState, useEffect \} from 'react';\nimport \{ Users, CheckCircle2, XCircle, ShieldCheck, Zap, AlertTriangle \} from 'lucide-react';\nimport api from '\.\.\/api\/client';\nimport \{ Button \} from '\.\/ui\/Button';/, importReplacement);

const hookReplacement = `export default function AdminUserManagement() {
  const [autoVerifyToggle, setAutoVerifyToggle] = useState(true);

  const { data: usersData, loading, error, isOffline, refetch, mutate } = useAdminLiveData<any[]>({
    endpoint: '/admin/users',
    queryKey: 'admin_users',
    autoRefreshInterval: 30000,
    socketEvent: 'user_updated',
  });

  const users = usersData || [];
`;

code = code.replace(/export default function AdminUserManagement\(\) \{\n\s*const \[users, setUsers\] = useState<any\[\]>\(\[\]\);\n\s*const \[loading, setLoading\] = useState\(true\);\n\s*const \[error, setError\] = useState<string \| null>\(null\);\n\s*const \[autoVerifyToggle, setAutoVerifyToggle\] = useState\(true\);\n\s*const fetchUsers = async \(\) => \{[\s\S]*?\};\n\s*useEffect\(\(\) => \{\n\s*fetchUsers\(\);\n\s*\}, \[\]\);/, hookReplacement);

code = code.replace(/setUsers\(prev => prev.map\(u => \{/g, 'mutate(prev => (prev || []).map(u => {');

const errorStateMatch = /\{error && \([\s\S]*?\}\)/;
const errorStateReplacement = `{isOffline && (
        <div className="bg-amber-50 text-amber-700 p-3 rounded-lg mb-4 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertTriangle size={14} /> You are currently offline. Showing cached data.</div>
        </div>
      )}
      {error && !users.length && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertTriangle size={14} /> Failed to load users.</div>
          <Button onClick={refetch} className="px-2 py-1 bg-white border border-red-200 text-red-700 rounded hover:bg-red-50 flex items-center gap-1"><RefreshCw size={12}/> Retry</Button>
        </div>
      )}`;
code = code.replace(errorStateMatch, errorStateReplacement);

fs.writeFileSync('src/components/AdminUserManagement.tsx', code);
