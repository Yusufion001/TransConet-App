import { io, Socket } from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Headset, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Check,
  Bell,
  Volume2,
  Info,
  ShieldAlert,
  MapPin,
  Clock,
  Radio,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';

interface SupportMessage {
  id: string;
  sender: 'USER' | 'AI_BOT' | 'ADMIN';
  senderName: string;
  content: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  category: string;
  status: string; // "OPEN", "PENDING_ADMIN", "CLOSED", "AI_RESOLVED"
  messages: SupportMessage[];
}

interface SupportNotification {
  id: string;
  title: string;
  category: string;
  priority: 'URGENT' | 'HIGH' | 'ADVISORY' | 'STABLE';
  text: string;
  time: string;
  authority: string;
  read: boolean;
}

export default function SupportChatWidget({ 
  inline = false,
  initialTab = 'chat',
  highlight = false,
  onHighlightReset
}: { 
  inline?: boolean;
  initialTab?: 'chat' | 'notifications';
  highlight?: boolean;
  onHighlightReset?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(inline);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [category, setCategory] = useState('General Inquiry');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Support Dashboard Tab & Notification State
  const [activeTab, setActiveTab] = useState<'chat' | 'notifications'>(initialTab);
  const [highlightBoard, setHighlightBoard] = useState(highlight);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Custom Notifications Board State
  const [notifications, setNotifications] = useState<SupportNotification[]>([
    {
      id: 'notif-1',
      title: 'Lagos-Ibadan Expressway Construction Bottleneck',
      category: 'Route Disruption',
      priority: 'URGENT',
      text: 'Major construction work near Berger bus stop is causing up to 3-hour traffic congestion for heavy-duty transit haulage. Alternate route through Sagamu-Ikorodu is advised.',
      time: 'Just now',
      authority: 'FRSC Command',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Apapa Port Scanner Maintenance Downtime',
      category: 'Port Delay',
      priority: 'URGENT',
      text: 'Apapa terminal automated container scanners are undergoing scheduled maintenance. Turnaround time for flatbed loading is extended by estimated 4-5 hours.',
      time: '2 hours ago',
      authority: 'NPA Operations',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Abuja Driver Verification Center Fully Booked',
      category: 'Verification Status',
      priority: 'ADVISORY',
      text: 'Physical verification slots for driver credentials and truck roadworthiness permits are currently at peak capacity. Book next week slots via the Account Portal today.',
      time: '4 hours ago',
      authority: 'TransConet Compliance',
      read: false
    },
    {
      id: 'notif-4',
      title: 'Partner Station Diesel Subsidy Active',
      category: 'Fuel Subsidy',
      priority: 'STABLE',
      text: 'Diesel rebate program is now active at TotalEnergies stations along Kaduna-Kano bypass. Scan your verified driver QR code to receive instant ₦150/litre cashback.',
      time: '1 day ago',
      authority: 'TransConet Operations',
      read: true
    },
    {
      id: 'notif-5',
      title: 'Heavy Rainfall & Mudslides near Lokoja Bypass',
      category: 'Weather Safety',
      priority: 'HIGH',
      text: 'Flash floods on Lokoja bypass have caused debris accumulation. Drivers should maintain speeds under 40km/h and utilize fog lamps due to limited visibility.',
      time: '1 day ago',
      authority: 'NIMET Advisory',
      read: true
    }
  ]);

    const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      const newSocket = io((import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined' && import.meta.env.VITE_API_URL !== 'null') ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : (import.meta.env.MODE === 'production' ? 'https://transconet-app-production-0e65.up.railway.app' : ''),  {
        withCredentials: true
      });
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('join_chat', ticket.id);
      });
      
      newSocket.on('support_ticket_updated', (updatedTicket: any) => {
        // Fetch full ticket or append new messages
        api.get(`/support/${ticket.id}`)
           .then(res => {
             if (res.data?.ticket) setTicket(res.data.ticket);
             else if (res.data?.id) setTicket(res.data);
           })
           .catch(console.error);
      });
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, ticket?.id]);

  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const res = await api.get('/announcements');
        if (res.data && res.data.success && res.data.broadcasts) {
          const fetchedNotifs = res.data.broadcasts.map((b: any) => ({
            id: b.id,
            title: b.title,
            category: b.category,
            priority: b.severity || 'INFO',
            text: b.content,
            time: new Date(b.createdAt).toLocaleDateString() + ' ' + new Date(b.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            authority: b.source || 'Admin',
            read: false
          }));
          
          setNotifications(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newNotifs = fetchedNotifs.filter((n: any) => !existingIds.has(n.id));
            return [...newNotifs, ...prev];
          });
        }
      } catch (e) {
        console.error('Error fetching broadcasts:', e);
      }
    };
    
    // Fetch initially and then poll every 30 seconds
    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 30000);
    return () => clearInterval(interval);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages to bottom on update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (highlight) {
      setHighlightBoard(true);
      setActiveTab('notifications');
      setIsOpen(true);
      const timer = setTimeout(() => {
        setHighlightBoard(false);
        onHighlightReset?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlight, onHighlightReset]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [ticket?.messages, isOpen, botTyping, activeTab]);

  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (inline && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      handleOpenChat();
    }
  }, [inline]);

  // Load or create active ticket when chat is opened
  const handleOpenChat = async () => {
    setIsOpen(true);
    if (!ticket) {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post('/support/ticket', { category });
        if (res.data && res.data.success) {
          setTicket(res.data.ticket);
        }
      } catch (err: any) {
        console.error('Failed to load support ticket:', err);
        setError('Failed to establish connection with support server.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Re-fetch current ticket messages
  const refreshTicket = async () => {
    if (!ticket) return;
    try {
      const res = await api.post('/support/ticket', { category: ticket.category });
      if (res.data && res.data.success) {
        setTicket(res.data.ticket);
      }
    } catch (err) {
      console.error('Error refreshing support queue:', err);
    }
  };

  // Polling mechanism to check for admin replies every 8 seconds when chat is open and pending admin
  useEffect(() => {
    let interval: any = null;
    if (isOpen && ticket && ticket.status === 'PENDING_ADMIN') {
      interval = setInterval(() => {
        refreshTicket();
      }, 8000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, ticket?.id, ticket?.status]);

  // Trigger highlight effect when clicking the header bell
  const handleBellClick = () => {
    setActiveTab('notifications');
    setHighlightBoard(true);
    // Auto-mark unread notifications as read on click
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // Reset highlight animation after 3 seconds
    setTimeout(() => {
      setHighlightBoard(false);
    }, 3000);
  };

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !ticket) return;

    const userMsg = messageText;
    setMessageText('');
    setBotTyping(true);
    setError(null);

    // Optimistically append user message to UI
    const tempUserMessage: SupportMessage = {
      id: `temp-${Date.now()}`,
      sender: 'USER',
      senderName: 'You',
      content: userMsg,
      createdAt: new Date().toISOString()
    };

    setTicket(prev => prev ? {
      ...prev,
      messages: [...prev.messages, tempUserMessage]
    } : null);

    try {
      const res = await api.post('/support/message', {
        ticketId: ticket.id,
        content: userMsg
      });

      if (res.data && res.data.success) {
        setTicket(res.data.ticket);
      }
    } catch (err: any) {
      console.error('Error sending support message:', err);
      setError('Message delivery failed. Please try again.');
    } finally {
      setBotTyping(false);
    }
  };

  // Escalate to human representative manually
  const handleEscalateToAdmin = async () => {
    if (!ticket) return;
    setEscalating(true);
    setError(null);
    try {
      const res = await api.post('/support/escalate', { ticketId: ticket.id });
      if (res.data && res.data.success) {
        setTicket(res.data.ticket);
      }
    } catch (err) {
      console.error('Failed to escalate support ticket:', err);
      setError('Escalation failed. Try typing your request directly.');
    } finally {
      setEscalating(false);
    }
  };

  const categories = [
    'General Inquiry',
    'Payment & Wallet',
    'Verification Issues',
    'Fleet Management',
    'Bidding & Escrow',
    'App Bug / Crash'
  ];

  const handleStartWithCategory = async (selectedCat: string) => {
    setCategory(selectedCat);
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/support/ticket', { category: selectedCat });
      if (res.data && res.data.success) {
        setTicket(res.data.ticket);
      }
    } catch (err) {
      console.error('Failed to start chat with category:', err);
      setError('Connection with logistics support offline.');
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = selectedCategoryFilter === 'ALL' 
    ? notifications 
    : notifications.filter(n => n.category === selectedCategoryFilter);

  return (
    <>
      {/* Floating Action Button Widget */}
      {!inline && (
        <Button
          id="floating-support-bubble"
          onClick={isOpen ? () => setIsOpen(false) : handleOpenChat}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-50 cursor-pointer hover:shadow-sm0 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-75 hover:scale-110 flex items-center justify-center cursor-pointer group"
          title="Open TransConet Support"
        >
          {isOpen ? (
            <X size={24} className="transition-transform duration-75 rotate-90" />
          ) : (
            <div className="relative">
              <MessageSquare size={24} className="animate-pulse" />
              {unreadCount > 0 && (
                <span className="text-[8px] font-black uppercase text-blue-600 bg-blue-100   px-1 py-0.5 rounded flex items-center gap-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
          )}
        </Button>
      )}

      {/* Floating Chat Container Panel or Inline Dashboard Card */}
      {isOpen && (
        <div 
          id="customer-support-panel" 
          className={
            inline
              ? "w-full h-[600px] bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  shadow-sm rounded-3xl flex flex-col overflow-hidden animate-in fade-in duration-75"
              : "fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-8rem)] bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-75 z-50 animate-in slide-in-from-bottom-5 fade-in duration-75"
          }
        >
          {/* Header Panel */}
          <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white border-b border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-600/10 blur-2xl rounded-full" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-indigo-600/10 blur-2xl rounded-full" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-inner shadow-white/20">
                <Headset className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold tracking-tight">TransConet Support</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] text-slate-600 dark:text-slate- font-medium font-sans uppercase tracking-wider">AI & Support Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              {/* Highlight Notification Bell */}
              <Button 
                onClick={handleBellClick}
                className={`p-1.5 rounded-xl transition-all relative ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
                title="View Broadcast Board & Alerts"
              >
                <Bell size={18} className={unreadCount > 0 ? 'animate-bounce' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </Button>

              {!inline && (
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate-600 dark:text-slate- hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>

          {/* Tab Navigation Switches */}
          <div className="flex border-b border-slate-100 dark:border-slate-800  bg-slate-50 dark:bg-slate-800  p-1">
            <Button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-md border border-transparent'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:text-slate-300 :text-slate-600 dark:text-slate-300'
              }`}
            >
              <MessageSquare size={13} />
              Support Chat
            </Button>
            <Button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 relative ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white shadow-md border border-transparent'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:text-slate-300 :text-slate-600 dark:text-slate-300'
              } ${highlightBoard ? 'ring-2 ring-blue-500 bg-blue-50/10  animate-pulse' : ''}`}
            >
              <Radio size={13} className={unreadCount > 0 || highlightBoard ? 'text-blue-500 animate-pulse' : ''} />
              Broadcast Board
              {(unreadCount > 0 || highlightBoard) && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </Button>
          </div>

          {/* Body and Chat Flow */}
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800 [#0b0f19] flex flex-col">
            {activeTab === 'chat' ? (
              // CHAT COMPONENT
              loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 p-6">
                  <RefreshCw className="text-blue-600 animate-spin" size={24} />
                  <span className="text-xs text-slate-500 dark:text-slate-  font-mono">Initializing secure connection...</span>
                </div>
              ) : !ticket ? (
                // Ticket Configuration state
                <div className="p-6 space-y-6 text-left flex-1 flex flex-col justify-center">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-blue-50 text-blue-700   ring-1 ring-blue-500/20">
                      <Sparkles size={12} className="text-blue-600 " /> Platform Diagnostics
                    </span>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white ">How can we assist you today?</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-  leading-relaxed">
                      Select a category below to initiate an automated resolution thread. If unresolved, you can escalate directly to an enterprise support manager.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {categories.map((cat, i) => (
                      <Button
                        key={i}
                        onClick={() => handleStartWithCategory(cat)}
                        className="bg-white dark:bg-slate-900  hover:bg-blue-50 cursor-pointer hover:shadow-sm :bg-slate-800 border border-slate-200 dark:border-slate-700  hover:border-blue-500/50 p-3.5 rounded-xl text-left text-[11px] font-bold text-slate-700 dark:text-slate-  transition-all flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <span>{cat}</span>
                        <ArrowRight size={14} className="text-slate-600 dark:text-slate-  group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                // Chat conversation log
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {ticket.id.startsWith('temp-') && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-800 leading-relaxed flex gap-2">
                      <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                      <p>Database offline or simulation state active. Messages will fall back to local browser cache memory storage.</p>
                    </div>
                  )}

                  {/* Categories Tag Indicator */}
                  <div className="text-center">
                    <span className="inline-block text-[9px] font-bold uppercase bg-slate-200  text-slate-600 dark:text-slate-  px-2.5 py-0.5 rounded-full">
                      Category: {ticket.category}
                    </span>
                  </div>

                  {/* Conversation History */}
                  {ticket.messages.map((msg, i) => {
                    const isUser = msg.sender === 'USER';
                    const isAdmin = msg.sender === 'ADMIN';

                    return (
                      <div key={msg.id || i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-75`}>
                        <div className="flex items-center gap-1.5 px-1">
                          {!isUser && (
                            isAdmin ? (
                              <span className="text-[9px] font-black uppercase text-red-500 bg-red-100 px-1 py-0.5 rounded flex items-center gap-0.5">
                                👨‍💼 Agent
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-100 px-1 py-0.5 rounded flex items-center gap-0.5 shadow-sm border border-blue-200">
                                <Bot size={10} /> AI
                              </span>
                            )
                          )}
                          <span className="text-[10px] text-slate-500 dark:text-slate- ">{msg.senderName}</span>
                        </div>
                        
                        <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed text-left shadow-sm  ${
                          isUser 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : isAdmin 
                            ? 'bg-amber-50 border border-amber-200 text-slate-900 dark:text-white  rounded-tl-none'
                            : 'bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  text-slate-900 dark:text-white  rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}

                  {/* Bot Typing Indicator */}
                  {botTyping && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-  animate-pulse text-[10px] font-mono pl-1">
                      <Bot size={14} className="text-blue-500 animate-bounce" />
                      <span>TransConet AI is thinking...</span>
                    </div>
                  )}

                  {/* Error Banner */}
                  {error && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[10px] rounded-xl text-center font-semibold">
                      {error && error ? ((error as any).message || JSON.stringify(error)) : error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )
            ) : (
              // BROADCAST NOTIFICATION BOARD
              <div className="p-4 space-y-4 flex-1">
                {/* Header overview and filter selectors */}
                <div className="text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-500  uppercase tracking-widest flex items-center gap-1">
                      <Radio size={12} className="animate-pulse text-emerald-500" />
                      Live Feed Monitor
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 dark:text-slate-">Nigeria Standard Time</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white ">Safety & Route Alerts</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-  leading-normal">
                    Operational notifications curated by TransConet operations and Federal Road Safety Corps (FRSC).
                  </p>
                </div>

                {/* Filters Carousel */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
                  {['ALL', 'Route Disruption', 'Port Delay', 'Weather Safety', 'Fuel Subsidy'].map((filter) => (
                    <Button
                      key={filter}
                      onClick={() => setSelectedCategoryFilter(filter)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold whitespace-nowrap transition cursor-pointer ${
                        selectedCategoryFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-900  text-slate-600 dark:text-slate-300  border border-slate-200 dark:border-slate-700 '
                      }`}
                    >
                      {filter}
                    </Button>
                  ))}
                </div>

                {/* Broadcast Messages List */}
                <div className="space-y-2.5">
                  {filteredNotifications.map((notif) => {
                    const isUrgent = notif.priority === 'URGENT' || notif.priority === 'HIGH';
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-2xl text-left border transition-all ${
                          notif.read 
                            ? 'border-slate-200 dark:border-slate-700  bg-white dark:bg-slate-900  opacity-80' 
                            : 'border-blue-200  bg-blue-50/10  shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            isUrgent 
                              ? 'bg-rose-100 text-rose-700  ' 
                              : 'bg-slate-100 text-slate-600 dark:text-slate-300  '
                          }`}>
                            {notif.category}
                          </span>
                          <span className="text-[9px] text-slate-600 dark:text-slate- font-medium font-mono">{notif.time}</span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 dark:text-white  leading-snug">
                          {notif.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 dark:text-slate-  mt-1 leading-normal">
                          {notif.text}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800  flex justify-between items-center text-[10px]">
                          <span className="text-slate-600 dark:text-slate- font-semibold flex items-center gap-1">
                            <ShieldCheck size={11} className="text-emerald-500" />
                            Source: {notif.authority}
                          </span>
                          {isUrgent && (
                            <span className="text-rose-500 font-bold flex items-center gap-1 uppercase tracking-wider text-[8px]">
                              <ShieldAlert size={11} />
                              Safety Critical
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Chat Composers & Action bar (Visible only on chat tab) */}
          {activeTab === 'chat' && ticket && (
            <div className="border-t border-slate-200 dark:border-slate-700  p-3 bg-white dark:bg-slate-900  space-y-2">
              {ticket.status !== 'PENDING_ADMIN' ? (
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800  rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700  shadow-sm">
                  <div className="text-left space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate- ">Require Human Assistance?</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate- ">Escalate immediately to a real support manager</p>
                  </div>
                  <Button
                    onClick={handleEscalateToAdmin}
                    disabled={escalating}
                    className="bg-slate-900  hover:bg-slate-800 :bg-slate-100 dark:bg-slate-800 text-white  text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 hover:scale-105 disabled:opacity-50 shadow-md"
                  >
                    {escalating ? <RefreshCw size={12} className="animate-spin" /> : 'Talk to Human'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 justify-center bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl text-[10px] text-amber-800">
                  <ShieldCheck size={12} className="text-amber-500 shrink-0" />
                  <span className="font-semibold">Connected to live Admin review queue</span>
                  <Button aria-label="Action"
                    onClick={refreshTicket}
                    className="p-0.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white  rounded shrink-0 cursor-pointer"
                    title="Refresh connection status"
                  >
                    <RefreshCw size={10} />
                  </Button>
                </div>
              )}

              {/* Message Composer Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={ticket.status === 'CLOSED'}
                  placeholder={ticket.status === 'CLOSED' ? "This ticket is closed." : "Type your complaint here..."}
                  className="bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  text-slate-900 dark:text-white  text-xs rounded-xl px-3 py-2 flex-1 focus:outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-900  disabled:opacity-50"
                />
                <Button aria-label="Action"
                  type="submit"
                  disabled={!messageText.trim() || ticket.status === 'CLOSED'}
                  className="bg-blue-600 hover:bg-blue-50 cursor-pointer hover:shadow-sm0 text-white p-2 rounded-xl transition flex items-center justify-center cursor-pointer disabled:opacity-40"
                >
                  <Send size={15} />
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
