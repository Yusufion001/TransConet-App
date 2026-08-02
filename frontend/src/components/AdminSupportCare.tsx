import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import { Headset, MessageSquare, AlertCircle, CheckCircle, Clock, Search, ChevronRight, User, Star, Send, PhoneCall } from 'lucide-react';
import { Button } from './ui/Button';

interface Ticket {
  id: string;
  user: string;
  role: 'TRANSPORTER' | 'SHIPPER';
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'COMPLAINT' | 'INQUIRY' | 'DISPUTE' | 'TECHNICAL';
  lastUpdated: string;
  messages: { sender: 'USER' | 'SUPPORT', text: string, timestamp: string }[];
  csatScore?: number;
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TCK-9901',
    user: 'Michael O.',
    role: 'TRANSPORTER',
    subject: 'Delayed escrow release for Load LD-442',
    status: 'OPEN',
    priority: 'HIGH',
    category: 'DISPUTE',
    lastUpdated: '10 mins ago',
    messages: [
      { sender: 'USER', text: 'I completed the delivery yesterday but the funds are still in escrow.', timestamp: '10:30 AM' }
    ]
  },
  {
    id: 'TCK-9902',
    user: 'Sarah Logistics',
    role: 'SHIPPER',
    subject: 'Transporter has not arrived at pickup',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    category: 'COMPLAINT',
    lastUpdated: '1 hour ago',
    messages: [
      { sender: 'USER', text: 'The driver is 3 hours late and not answering calls.', timestamp: '09:15 AM' },
      { sender: 'SUPPORT', text: 'We are reaching out to the transporter\'s emergency contact now.', timestamp: '09:20 AM' }
    ]
  },
  {
    id: 'TCK-9855',
    user: 'Dave Trucking Ltd',
    role: 'TRANSPORTER',
    subject: 'App crashing on document upload',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    category: 'TECHNICAL',
    lastUpdated: '1 day ago',
    csatScore: 5,
    messages: [
      { sender: 'USER', text: 'My app crashes when I try to upload my insurance.', timestamp: 'Yesterday 14:00' },
      { sender: 'SUPPORT', text: 'Please update your app to version 2.4.1 from the store.', timestamp: 'Yesterday 14:30' },
      { sender: 'USER', text: 'That fixed it, thanks!', timestamp: 'Yesterday 15:00' }
    ]
  }
];

export default function AdminSupportCare() {
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


  const filteredTickets = tickets.filter(t => {
    const matchFilter = activeFilter === 'ALL' || t.status === activeFilter;
    const matchSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Open</span>;
      case 'IN_PROGRESS': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">In Progress</span>;
      case 'RESOLVED': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Resolved</span>;
      case 'CLOSED': return <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate- px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Closed</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'URGENT': return <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold border border-red-200">Urgent</span>;
      case 'HIGH': return <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-bold border border-orange-200">High</span>;
      case 'MEDIUM': return <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-xs font-bold border border-brand-200">Medium</span>;
      case 'LOW': return <span className="text-slate-600 dark:text-slate- bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-bold border border-slate-200 dark:border-slate-700">Low</span>;
      default: return null;
    }
  };

  const handleSendReply = () => {
    if(!replyText.trim() || !selectedTicket) return;
    
    const updatedTicket = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages, 
        { sender: 'SUPPORT' as const, text: replyText, timestamp: 'Just now' }
      ],
      status: selectedTicket.status === 'OPEN' ? 'IN_PROGRESS' as const : selectedTicket.status
    };
    
    mutate(prev => prev ? prev.map(t => t.id === updatedTicket.id ? updatedTicket : t) : []);
    setSelectedTicketId(updatedTicket.id);
    setReplyText('');
  };

  const resolveTicket = () => {
    if(!selectedTicket) return;
    const updatedTicket = { ...selectedTicket, status: 'RESOLVED' as const };
    mutate(prev => prev ? prev.map(t => t.id === updatedTicket.id ? updatedTicket : t) : []);
    setSelectedTicketId(updatedTicket.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Headset className="text-brand-600" /> Support & Customer Care
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Manage support tickets, complaints, and live chats.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Open Tickets</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">24</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Avg. Resolution</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">4h 12m</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Resolved Today</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">86</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Star size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">CSAT Score</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">4.8<span className="text-sm text-slate-500 dark:text-slate- font-medium">/5</span></p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* Ticket List */}
        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex-col w-full ${selectedTicket ? 'hidden lg:flex lg:w-1/3' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(filter => (
                <Button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === filter 
                      ? 'bg-brand-50 text-brand-700 border border-brand-200' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-brand-50 cursor-pointer hover:shadow-sm border border-transparent'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredTickets.map(ticket => (
              <Button
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTicket?.id === ticket.id 
                    ? 'bg-brand-50/50 border-brand-300' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 hover:bg-brand-50 cursor-pointer hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-">{ticket.id}</span>
                  {getStatusBadge(ticket.status)}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mb-1">{ticket.subject}</h4>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-">
                    <User size={12} /> <span className="truncate max-w-[100px]">{ticket.user}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-400">{ticket.lastUpdated}</span>
                </div>
              </Button>
            ))}
            {filteredTickets.length === 0 && (
              <div className="text-center text-slate-500 dark:text-slate- py-8 text-sm">
                No tickets found.
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details & Chat */}
        {selectedTicket ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex flex-col w-full lg:w-2/3 h-full animate-fade-in">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl gap-4">
              <div className="flex gap-3">
                <Button onClick={() => setSelectedTicketId(null)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:text-slate- mt-1">
                  <ChevronRight size={20} className="rotate-180" />
                </Button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h3>
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-">
                    <span className="flex items-center gap-1"><User size={14} /> {selectedTicket.user} ({selectedTicket.role})</span>
                    <span className="flex items-center gap-1"><AlertCircle size={14} /> {selectedTicket.category}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button aria-label="Action" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate- hover:text-brand-600 hover:border-brand-300 rounded-lg shadow-sm transition-colors" title="Call User">
                  <PhoneCall size={18} />
                </Button>
                {selectedTicket.status !== 'RESOLVED' && (
                  <Button onClick={resolveTicket} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap">
                    Resolve Ticket
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/30">
              {selectedTicket.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'SUPPORT' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.sender === 'SUPPORT' 
                      ? 'bg-brand-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm'
                  }`}>
                    <div className="text-sm">{msg.text}</div>
                    <div className={`text-[10px] mt-1 text-right ${msg.sender === 'SUPPORT' ? 'text-brand-200' : 'text-slate-400 dark:text-slate-400'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              {selectedTicket.status === 'RESOLVED' && selectedTicket.csatScore && (
                <div className="flex justify-center my-4">
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs px-4 py-2 rounded-full flex items-center gap-2 font-medium">
                    <CheckCircle size={14} /> User rated this interaction {selectedTicket.csatScore}/5 stars
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
              {selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED' ? (
                <div className="text-center text-slate-500 dark:text-slate- text-sm font-medium py-2">
                  This ticket is closed. Reopen to send a message.
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type your reply here..." 
                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                  <Button aria-label="Action" 
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="bg-brand-600 disabled:bg-brand-400 hover:bg-brand-700 text-white px-4 py-2 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center w-2/3 border border-dashed border-slate-300 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-">Select a Ticket</h3>
            <p className="text-slate-500 dark:text-slate- text-sm mt-1 max-w-sm text-center">Choose a ticket from the list to view details, reply, or resolve the issue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
