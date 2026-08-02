import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import { Activity, Search, Filter, Calendar, User, Settings, Shield, CreditCard, Box, Download, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface TimelineEvent {
  id: string;
  type: 'AUTH' | 'FINANCE' | 'SYSTEM' | 'USER_ACTION' | 'SECURITY';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

const MOCK_EVENTS: TimelineEvent[] = [
  { id: 'EVT-001', type: 'SECURITY', title: 'Multiple Failed Logins', description: '5 failed login attempts detected from IP 192.168.1.45', user: 'System', timestamp: '10 mins ago', severity: 'WARNING' },
  { id: 'EVT-002', type: 'FINANCE', title: 'Large Payout Approved', description: 'Payout of ₦1,200,000 approved for Global Freight Ltd', user: 'Yusuf Jimoh', timestamp: '1 hour ago', severity: 'INFO' },
  { id: 'EVT-003', type: 'USER_ACTION', title: 'New Fleet Registered', description: 'Logistics Pro Ltd registered 5 new trucks', user: 'Logistics Pro', timestamp: '3 hours ago', severity: 'INFO' },
  { id: 'EVT-004', type: 'SYSTEM', title: 'API Rate Limit Reached', description: 'Payment gateway API rate limit reached (500 req/min)', user: 'System', timestamp: '5 hours ago', severity: 'CRITICAL' },
  { id: 'EVT-005', type: 'AUTH', title: 'Admin Role Updated', description: 'Sarah Connor role changed to Finance Manager', user: 'Yusuf Jimoh', timestamp: '1 day ago', severity: 'INFO' },
  { id: 'EVT-006', type: 'SYSTEM', title: 'Automated Backup Completed', description: 'Daily database snapshot stored in AWS S3', user: 'System', timestamp: '1 day ago', severity: 'INFO' },
];

export default function AdminActivityTimeline() {
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


  const filteredEvents = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        e.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'ALL' || e.type === filterType;
    return matchSearch && matchType;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'AUTH': return <Shield size={16} className="text-brand-500" />;
      case 'FINANCE': return <CreditCard size={16} className="text-emerald-500" />;
      case 'SYSTEM': return <Settings size={16} className="text-slate-500 dark:text-slate-400" />;
      case 'USER_ACTION': return <User size={16} className="text-brand-500" />;
      case 'SECURITY': return <AlertTriangle size={16} className="text-red-500" />;
      default: return <Activity size={16} className="text-slate-500 dark:text-slate-400" />;
    }
  };

  const getEventBg = (type: string) => {
    switch (type) {
      case 'AUTH': return 'bg-brand-50 border-brand-100';
      case 'FINANCE': return 'bg-emerald-50 border-emerald-100';
      case 'SYSTEM': return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
      case 'USER_ACTION': return 'bg-brand-50 border-brand-100';
      case 'SECURITY': return 'bg-red-50 border-red-100';
      default: return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'WARNING': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Warning</span>;
      case 'CRITICAL': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Critical</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="text-brand-600" /> Activity Timeline
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit logs, system events, and admin actions across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:bg-brand-50 cursor-pointer hover:shadow-sm px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm overflow-hidden">
            <Calendar size={16} /> Date Range
          </Button>
          <Button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm overflow-hidden">
            <Download size={16} /> Export Logs
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit overflow-x-auto hide-scrollbar">
            {['ALL', 'AUTH', 'FINANCE', 'SYSTEM', 'USER_ACTION', 'SECURITY'].map(type => (
              <Button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === type 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Events' : type.replace('_', ' ')}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="p-6">
          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 md:ml-4 space-y-8 pb-4">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="relative pl-6 md:pl-8 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                {/* Timeline Node */}
                <div className={`absolute -left-[17px] top-1 p-2 rounded-full border-2 border-white shadow-sm ${getEventBg(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                
                {/* Content Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-sm transition-shadow overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">{event.title}</h4>
                      {getSeverityBadge(event.severity)}
                    </div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-400 font-mono">{event.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{event.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <User size={14} />
                      <span className="font-medium">{event.user}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 font-mono">
                      <span>ID: {event.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="pl-8 py-8 text-slate-500 dark:text-slate-400 text-sm">
                No events found matching your criteria.
              </div>
            )}
          </div>
          
          {filteredEvents.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors">
                Load More Events
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
