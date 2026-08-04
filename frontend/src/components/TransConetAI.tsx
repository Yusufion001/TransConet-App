import React, { FormEvent, useMemo, useState } from 'react';
import { Bot, Check, Loader2, Send, Sparkles, UserRound } from 'lucide-react';
import api from '../api/client';

type Role = 'CUSTOMER' | 'TRANSPORTER';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const starters: Record<Role, string[]> = {
  CUSTOMER: ['I want to post a load', 'Help me find a transporter', 'Track my shipment', 'What can I do on TransConet?'],
  TRANSPORTER: ['Show me available loads', 'Help me manage my fleet', 'Help me find a suitable load', 'What can I do on TransConet?'],
};

export default function TransConetAI({ role }: { role: Role }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: role === 'CUSTOMER'
        ? 'Hello. I’m TransConet AI. I can help you post loads, find transporters, track shipments, and navigate your customer features. What would you like to do?'
        : 'Hello. I’m TransConet AI. I can help you find loads, manage your fleet, review your transporter options, and navigate your transporter features. What would you like to do?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = useMemo(() => starters[role], [role]);

  const send = async (event?: FormEvent, preset?: string) => {
    event?.preventDefault();
    const text = (preset ?? input).trim();
    if (!text || loading) return;

    const nextUser: Message = { id: `${Date.now()}-u`, role: 'user', content: text };
    const history = [...messages, nextUser].slice(-12);
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/transconet-ai/chat', {
        message: text,
        conversation: history.slice(-10).map(({ role: messageRole, content }) => ({ role: messageRole, content })),
      });
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-a`, role: 'assistant', content: response.data?.response || 'I could not complete that request. Please try again.' },
      ]);
    } catch (error: any) {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-e`, role: 'assistant', content: error?.response?.data?.error || 'I’m temporarily unavailable. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-150px)] px-3 py-4 sm:px-6 sm:py-8">
      <div className="rounded-[28px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col flex-1">
        <header className="px-5 py-5 sm:px-7 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-brand-50/80 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/20">
              <Bot size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-600 flex items-center gap-1"><Sparkles size={11} /> TransConet AI</p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">What would you like to do?</h1>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <Check size={13} className="text-emerald-500" />
            <span>AI guides you. You approve important actions before TransConet executes them.</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && <div className="w-8 h-8 shrink-0 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center"><Bot size={16} /></div>}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm'}`}>
                {message.content}
              </div>
              {message.role === 'user' && <div className="w-8 h-8 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 flex items-center justify-center"><UserRound size={16} /></div>}
            </div>
          ))}
          {loading && <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={14} className="animate-spin text-brand-600" /> TransConet AI is thinking...</div>}
        </div>

        <div className="px-4 pb-3 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => send(undefined, suggestion)} disabled={loading} className="shrink-0 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition disabled:opacity-50">
                {suggestion}
              </button>
            ))}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 focus-within:border-brand-500">
            <input value={input} onChange={(event) => setInput(event.target.value)} disabled={loading} placeholder="Tell TransConet what you want to do..." className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400" />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send to TransConet AI" className="w-10 h-10 shrink-0 rounded-xl bg-brand-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-brand-700 transition">
              <Send size={17} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
