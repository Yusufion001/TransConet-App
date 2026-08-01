const fs = require('fs');
let code = fs.readFileSync('src/components/AdminSupportCare.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';`;

code = code.replace(/import React, \{ useState \} from 'react';/, importReplacement);

const hookReplacement = `export default function AdminSupportCare() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: ticketsData, loading, error, isOffline, refetch, mutate } = useAdminLiveData<Ticket[]>({
    endpoint: '/admin/tickets',
    queryKey: 'admin_tickets',
    autoRefreshInterval: 30000,
    socketEvent: 'ticket_updated',
    mockData: MOCK_TICKETS
  });

  const tickets = ticketsData || [];
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;
`;

code = code.replace(/export default function AdminSupportCare\(\) \{\n\s*const \[tickets, setTickets\] = useState<Ticket\[\]>\(MOCK_TICKETS\);\n\s*const \[activeFilter, setActiveFilter\] = useState<'ALL' \| 'OPEN' \| 'IN_PROGRESS' \| 'RESOLVED'>\('ALL'\);\n\s*const \[searchTerm, setSearchTerm\] = useState\(''\);\n\s*const \[selectedTicket, setSelectedTicket\] = useState<Ticket \| null>\(null\);\n\s*const \[replyText, setReplyText\] = useState\(''\);/, hookReplacement);

// We need to update setSelectedTicket calls to setSelectedTicketId
// Also the reply submission needs to update mutate
code = code.replace(/setSelectedTicket\(ticket\)/g, 'setSelectedTicketId(ticket.id)');
code = code.replace(/setSelectedTicket\(null\)/g, 'setSelectedTicketId(null)');

const replyMatch = /const handleReply = \(\) => \{\n\s*if \(!replyText.trim\(\) \|\| !selectedTicket\) return;\n\s*const updated = \{\n\s*\.\.\.selectedTicket,\n\s*messages: \[\.\.\.selectedTicket\.messages, \{ sender: 'SUPPORT' as const, text: replyText, timestamp: 'Just now' \}\],\n\s*status: selectedTicket\.status === 'OPEN' \? 'IN_PROGRESS' as const : selectedTicket\.status\n\s*\};\n\s*setTickets\(tickets\.map\(t => t\.id === selectedTicket\.id \? updated : t\)\);\n\s*setSelectedTicket\(updated\);\n\s*setReplyText\(''\);\n\s*\};/;
const replyReplacement = `const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    
    // Optimistic UI update
    const updated = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, { sender: 'SUPPORT' as const, text: replyText, timestamp: 'Just now' }],
      status: selectedTicket.status === 'OPEN' ? 'IN_PROGRESS' as const : selectedTicket.status
    };
    
    mutate(prev => prev ? prev.map(t => t.id === selectedTicket.id ? updated : t) : []);
    setReplyText('');
    
    try {
       // In a real app we'd await api.post('/admin/tickets/reply', ...) here
       // But to preserve mock behavior we'll just leave optimistic state if it's mock
    } catch (err) {
       // rollback on error
       refetch();
    }
  };`;
code = code.replace(replyMatch, replyReplacement);

const uiAdditions = `
      {isOffline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex justify-between items-center">
          <span>You are currently offline. Showing cached data.</span>
        </div>
      )}
      {error && !tickets.length && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex justify-between items-center">
          <span>Failed to load live data. Retrying...</span>
          <button onClick={refetch} className="px-3 py-1 bg-white rounded border border-rose-200 hover:bg-rose-50">Retry</button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`;
code = code.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">/, uiAdditions);

fs.writeFileSync('src/components/AdminSupportCare.tsx', code);
