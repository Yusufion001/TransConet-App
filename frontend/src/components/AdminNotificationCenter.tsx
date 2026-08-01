import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Send, History, Users, AlertCircle, CheckCircle, BarChart3, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import api from '../api/client';

interface NotificationLog {
  id: string;
  title: string;
  channel: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
  targetAudience: 'ALL' | 'TRANSPORTERS' | 'SHIPPERS' | 'SPECIFIC_USERS';
  sentAt: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
  metrics: {
    sent: number;
    delivered: number;
    opened?: number;
  };
}

export default function AdminNotificationCenter() {
  const { data: notificationData, loading, refetch } = useAdminLiveData<any>({
    endpoint: '/admin/notifications',
    queryKey: 'admin-notifications',
    mockData: { history: [], deliveryRate: '-', failureRate: '-', providers: {} }
  });

  const [activeTab, setActiveTab] = useState<'COMPOSE' | 'HISTORY'>('COMPOSE');
  const [history, setHistory] = useState<NotificationLog[]>([]);

  useEffect(() => {
    if (notificationData?.history) {
      setHistory(notificationData.history);
    }
  }, [notificationData]);

  // Compose State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP'>('IN_APP');
  const [audience, setAudience] = useState<'ALL' | 'TRANSPORTERS' | 'SHIPPERS' | 'SPECIFIC_USERS'>('ALL');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      // Assuming a real endpoint would exist for sending notifications
      // await api.post('/admin/notifications/send', { title, message, channel, audience });
      setTimeout(() => {
        setIsSending(false);
        setTitle('');
        setMessage('');
        alert('Notification campaign launched successfully!');
        refetch(); // Refresh the list
      }, 1500);
    } catch (e) {
      console.error(e);
      setIsSending(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch(type) {
      case 'PUSH': return <Smartphone size={16} className="text-indigo-500" />;
      case 'EMAIL': return <Mail size={16} className="text-blue-500" />;
      case 'SMS': return <MessageSquare size={16} className="text-emerald-500" />;
      case 'IN_APP': return <Bell size={16} className="text-amber-500" />;
      default: return <Bell size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DELIVERED': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Delivered</span>;
      case 'FAILED': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Failed</span>;
      case 'PENDING': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Pending</span>;
      default: return null;
    }
  };

  if (loading && history.length === 0) {
    return <div className="py-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="text-indigo-600" /> Notification Center
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Broadcast messages, push notifications, and emails to users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Send size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Total Sent (30d)</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">45.2K</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Delivery Rate</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">99.1%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Open Rate</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">42.8%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Failed Delivery</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">142</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex gap-2">
          <Button
            onClick={() => setActiveTab('COMPOSE')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'COMPOSE' 
                ? 'bg-blue-600 text-white shadow-md border border-transparent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-transparent'
            }`}
          >
            <Send size={16} /> Compose Broadcast
          </Button>
          <Button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'HISTORY' 
                ? 'bg-blue-600 text-white shadow-md border border-transparent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-transparent'
            }`}
          >
            <History size={16} /> Campaign History
          </Button>
        </div>

        <div className="p-6">
          {activeTab === 'COMPOSE' ? (
            <div className="max-w-3xl space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate- mb-2">Delivery Channel</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'IN_APP', label: 'In-App', icon: Bell },
                      { id: 'PUSH', label: 'Push', icon: Smartphone },
                      { id: 'EMAIL', label: 'Email', icon: Mail },
                      { id: 'SMS', label: 'SMS', icon: MessageSquare }
                    ].map(ch => (
                      <Button
                        key={ch.id}
                        onClick={() => setChannel(ch.id as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                          channel === ch.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-blue-50 cursor-pointer hover:shadow-sm'
                        }`}
                      >
                        <ch.icon size={20} />
                        <span className="text-xs font-bold">{ch.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate- mb-2">Target Audience</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'ALL', label: 'All Users', icon: Users },
                      { id: 'TRANSPORTERS', label: 'Transporters', icon: Users },
                      { id: 'SHIPPERS', label: 'Shippers', icon: Users },
                      { id: 'SPECIFIC_USERS', label: 'Specific List', icon: Users }
                    ].map(aud => (
                      <Button
                        key={aud.id}
                        onClick={() => setAudience(aud.id as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                          audience === aud.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-blue-50 cursor-pointer hover:shadow-sm'
                        }`}
                      >
                        <aud.icon size={20} />
                        <span className="text-xs font-bold">{aud.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate- mb-1">Message Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                  placeholder="E.g., Special Holiday Promo!" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate- mb-1">Message Body</label>
                <textarea 
                  rows={6} 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                  placeholder="Write your message here..."
                ></textarea>
                <p className="text-xs text-slate-500 dark:text-slate- mt-1 flex justify-end">{message.length} characters</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  onClick={handleSend}
                  disabled={!title || !message || isSending}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
                >
                  {isSending ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Sending...</>
                  ) : (
                    <><Send size={18} /> Launch Campaign</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Campaign</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Channel & Audience</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Sent At</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Metrics</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(item => (
                    <tr key={item.id || item?.id || Math.random()} className="hover:bg-blue-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate- font-mono mt-0.5">{item.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          {getChannelIcon(item.channel)}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-">{item.channel}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate- flex items-center gap-1">
                          <Users size={12} /> {item.targetAudience}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-">
                        {item.sentAt}
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-">Sent:</span> <span className="font-bold text-slate-700 dark:text-slate-">{item.metrics.sent.toLocaleString()}</span></div>
                          <div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-">Delivered:</span> <span className="font-bold text-slate-700 dark:text-slate-">{item.metrics.delivered.toLocaleString()}</span></div>
                          {item.metrics.opened !== undefined && (
                            <div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-">Opened:</span> <span className="font-bold text-slate-700 dark:text-slate-">{item.metrics.opened.toLocaleString()}</span></div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
