import React, { useState, useEffect } from 'react';
import { Terminal, Key, Webhook, Activity, Plus, Copy, RefreshCw, CheckCircle2, AlertCircle, Clock, Search, Code, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  status: 'ACTIVE' | 'REVOKED';
}

interface WebhookData {
  id: string;
  url: string;
  events: string[];
  status: 'ACTIVE' | 'FAILING';
  lastDelivery: string;
}

interface ApiLog {
  id: string;
  method: string;
  endpoint: string;
  status: number;
  latency: string;
  timestamp: string;
}

export default function AdminDeveloperConsole() {
  const { data: devData, loading } = useAdminLiveData<any>({
    endpoint: '/admin/developer-logs',
    queryKey: 'admin-developer-logs',
    mockData: {
      logs: [],
      apiKeys: [
        { id: 'KEY-001', name: 'Production Mobile App', prefix: 'pk_live_8f92...', created: 'Oct 1, 2023', lastUsed: 'Just now', status: 'ACTIVE' },
        { id: 'KEY-002', name: 'Staging Environment', prefix: 'pk_test_3c1a...', created: 'Nov 12, 2023', lastUsed: '5 mins ago', status: 'ACTIVE' },
        { id: 'KEY-003', name: 'Legacy Integration', prefix: 'pk_live_1d4e...', created: 'Jan 5, 2023', lastUsed: '2 months ago', status: 'REVOKED' },
      ],
      webhooks: [
        { id: 'WH-001', url: 'https://api.partner.com/v1/webhooks/freight', events: ['load.created', 'load.delivered'], status: 'ACTIVE', lastDelivery: '2 mins ago' },
        { id: 'WH-002', url: 'https://internal-tools.corp.com/hooks/sync', events: ['user.registered'], status: 'FAILING', lastDelivery: '1 hour ago' },
      ],
      apiLogs: [
        { id: 'LOG-9921', method: 'POST', endpoint: '/v1/loads', status: 201, latency: '124ms', timestamp: '10:45:21 AM' },
        { id: 'LOG-9920', method: 'GET', endpoint: '/v1/users/me', status: 200, latency: '45ms', timestamp: '10:45:19 AM' },
        { id: 'LOG-9919', method: 'GET', endpoint: '/v1/loads/active', status: 200, latency: '89ms', timestamp: '10:45:15 AM' },
        { id: 'LOG-9918', method: 'POST', endpoint: '/v1/payments/escrow', status: 400, latency: '210ms', timestamp: '10:44:50 AM' },
        { id: 'LOG-9917', method: 'GET', endpoint: '/v1/vehicles', status: 200, latency: '65ms', timestamp: '10:44:10 AM' },
      ]
    }
  });

  const [activeSection, setActiveSection] = useState<'KEYS' | 'WEBHOOKS' | 'LOGS'>('KEYS');
  const [showKeyId, setShowKeyId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast notification here
  };

  const MOCK_API_KEYS = devData?.apiKeys || [];
  const MOCK_WEBHOOKS = devData?.webhooks || [];
  const MOCK_LOGS = devData?.apiLogs || [];

  if (loading && !devData) {
    return <div className="py-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Terminal className="text-brand-600" /> Developer Console
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage API keys, configure webhooks, and monitor API traffic.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:bg-brand-50 cursor-pointer hover:shadow-sm px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
            <Code size={16} /> API Docs
          </Button>
          {activeSection === 'KEYS' && (
            <Button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
              <Plus size={16} /> Generate Key
            </Button>
          )}
          {activeSection === 'WEBHOOKS' && (
            <Button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
              <Plus size={16} /> Add Webhook
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-800 rounded-xl text-brand-400">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-slate-300 dark:text-slate-300 text-sm">Total API Requests</h3>
          </div>
          <p className="text-3xl font-black text-white">2.4M</p>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">Last 24 hours</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Avg. Latency</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">84ms</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">-12ms vs yesterday</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Error Rate</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">0.12%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">4xx and 5xx responses</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Webhook size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Active Webhooks</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">14</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across 3 environments</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex gap-2 overflow-x-auto hide-scrollbar">
          <Button
            onClick={() => setActiveSection('KEYS')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'KEYS' 
                ? 'bg-brand-600 text-white shadow-md border border-transparent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-transparent'
            }`}
          >
            <Key size={16} /> API Keys
          </Button>
          <Button
            onClick={() => setActiveSection('WEBHOOKS')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'WEBHOOKS' 
                ? 'bg-brand-600 text-white shadow-md border border-transparent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-transparent'
            }`}
          >
            <Webhook size={16} /> Webhooks
          </Button>
          <Button
            onClick={() => setActiveSection('LOGS')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'LOGS' 
                ? 'bg-brand-600 text-white shadow-md border border-transparent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-transparent'
            }`}
          >
            <Activity size={16} /> Live Logs
          </Button>
        </div>

        <div className="p-0">
          {activeSection === 'KEYS' && (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Secret Key</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Used</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_API_KEYS.map(apiKey => (
                    <tr key={apiKey.id || apiKey?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{apiKey.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{apiKey.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-2 py-1 rounded text-xs font-mono">
                            {showKeyId === apiKey.id ? apiKey.prefix.replace('...', 'a1b2c3d4e5f6g7h8') : apiKey.prefix}
                          </code>
                          <Button onClick={() => setShowKeyId(showKeyId === apiKey.id ? null : apiKey.id)} className="text-slate-400 dark:text-slate-400 hover:text-brand-600">
                            {showKeyId === apiKey.id ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                          <Button onClick={() => copyToClipboard(apiKey.prefix)} className="text-slate-400 dark:text-slate-400 hover:text-brand-600" title="Copy to clipboard">
                            <Copy size={14} />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{apiKey.created}</td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{apiKey.lastUsed}</td>
                      <td className="p-4">
                        {apiKey.status === 'ACTIVE' 
                          ? <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Active</span>
                          : <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-black uppercase">Revoked</span>
                        }
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {apiKey.status === 'ACTIVE' && (
                            <Button className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                              Revoke
                            </Button>
                          )}
                          <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'WEBHOOKS' && (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Endpoint URL</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Events</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Delivery</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_WEBHOOKS.map(webhook => (
                    <tr key={webhook.id || webhook?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                      <td className="p-4">
                        <div className="font-mono text-sm text-slate-700 dark:text-slate-400 truncate max-w-[250px]" title={webhook.url}>{webhook.url}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{webhook.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {webhook.events.map(ev => (
                            <span key={ev} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono">{ev}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        {webhook.status === 'ACTIVE' 
                          ? <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle2 size={10} /> Active</span>
                          : <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 w-fit"><AlertCircle size={10} /> Failing</span>
                        }
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{webhook.lastDelivery}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-brand-50" title="Test Payload">
                            <RefreshCw size={16} />
                          </Button>
                          <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'LOGS' && (
            <div className="animate-fade-in">
              <div className="p-4 bg-slate-900 text-slate-300 dark:text-slate-300 font-mono text-xs flex items-center gap-2 border-b border-slate-800">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Live streaming API requests...
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Method & Endpoint</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latency</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Req ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_LOGS.map(log => (
                      <tr key={log.id || log?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{log.timestamp}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase w-12 text-center ${
                              log.method === 'GET' ? 'bg-brand-100 text-brand-800' :
                              log.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {log.method}
                            </span>
                            <span className="font-mono text-sm text-slate-700 dark:text-slate-400">{log.endpoint}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            log.status >= 200 && log.status < 300 ? 'bg-emerald-100 text-emerald-800' :
                            log.status >= 400 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800 dark:text-slate-100'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{log.latency}</td>
                        <td className="p-4 text-right text-xs text-slate-400 dark:text-slate-400 font-mono">{log.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
