const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFinancialOperations.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';`;

code = code.replace(/import React, \{ useState \} from 'react';/, importReplacement);

const mockCodeMatch = /const MOCK_TRANSACTIONS: Transaction\[\] = \[[\s\S]*?\];/;
const mockCodeString = code.match(mockCodeMatch)[0];

const hookReplacement = `export default function AdminFinancialOperations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ESCROW_DEPOSIT' | 'PAYOUT' | 'COMMISSION' | 'REFUND'>('ALL');

  const { data: transactionsData, loading, error, isOffline, refetch } = useAdminLiveData<Transaction[]>({
    endpoint: '/admin/transactions',
    queryKey: 'admin_transactions',
    autoRefreshInterval: 30000,
    socketEvent: 'transaction_updated',
    mockData: MOCK_TRANSACTIONS
  });

  const transactions = transactionsData || [];
`;

code = code.replace(/export default function AdminFinancialOperations\(\) \{\n\s*const \[transactions, setTransactions\] = useState<Transaction\[\]>\(MOCK_TRANSACTIONS\);\n\s*const \[searchTerm, setSearchTerm\] = useState\(''\);\n\s*const \[activeTab, setActiveTab\] = useState<'ALL' \| 'ESCROW_DEPOSIT' \| 'PAYOUT' \| 'COMMISSION' \| 'REFUND'>\('ALL'\);/, hookReplacement);

// Optional: add loading and offline UI states, probably before the main grid
const mainGridMatch = /<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">/;
const uiAdditions = `
      {isOffline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex justify-between items-center">
          <span>You are currently offline. Showing cached data.</span>
        </div>
      )}
      {error && !transactions.length && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex justify-between items-center">
          <span>Failed to load live data. Retrying...</span>
          <button onClick={refetch} className="px-3 py-1 bg-white rounded border border-rose-200 hover:bg-rose-50">Retry</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">`;
code = code.replace(mainGridMatch, uiAdditions);

// Update table to show loading state if no data and loading
const tbodyMatch = /<tbody className="divide-y divide-slate-100">/;
const tbodyReplacement = `<tbody className="divide-y divide-slate-100">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Loading live transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : null}`;
code = code.replace(tbodyMatch, tbodyReplacement);

fs.writeFileSync('src/components/AdminFinancialOperations.tsx', code);
