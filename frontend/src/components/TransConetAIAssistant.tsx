import React, { useState } from 'react';
import { Bot, Check, Loader2, Send, Sparkles, X, XCircle } from 'lucide-react';
import api from '../api/client';
import { Button } from './ui/Button';

interface AIAction {
  id: string;
  action_name: string;
  status: string;
  payload?: { description?: string };
}

export default function TransConetAIAssistant({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('Hi. What would you like to do in TransConet?');
  const [actions, setActions] = useState<AIAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true); setError('');
    try {
      const response = await api.post('/ai-automation/assistant', { message: message.trim(), context: { currentPath: window.location.pathname } });
      setReply(response.data.reply || 'Tell me what you want to do next.');
      setActions(response.data.actions || []);
      setMessage('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'AI assistant is temporarily unavailable.');
    } finally { setLoading(false); }
  };

  const decide = async (id: string, approved: boolean) => {
    setProcessing(id); setError('');
    try {
      const response = await api.post(`/ai-automation/actions/${id}/${approved ? 'approve' : 'reject'}`);
      setActions(prev => prev.map(a => a.id === id ? response.data.action : a));
      if (approved) setReply('Approved. I will pass this request to the TransConet automation system.');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to update that request.');
    } finally { setProcessing(null); }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open TransConet AI assistant"
        className="fixed bottom-20 right-20 z-[101] flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl ring-2 ring-white/80 transition hover:scale-105"
      >
        <Sparkles size={21} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-[101] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">
        <div className="flex items-center gap-2"><Bot size={20} /><div><div className="text-sm font-bold">TransConet AI</div><div className="text-[10px] text-slate-300">Your logistics assistant · {role}</div></div></div>
        <Button type="button" onClick={() => setOpen(false)} className="bg-transparent p-1.5 text-white hover:bg-white/10"><X size={18}/></Button>
      </div>
      <div className="max-h-[55vh] space-y-3 overflow-y-auto p-4">
        <div className="rounded-2xl bg-slate-100 p-3 text-sm leading-5 text-slate-800 dark:bg-slate-800 dark:text-slate-100">{reply}</div>
        {actions.map(action => (
          <div key={action.id} className="rounded-2xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-950/30">
            <div className="text-xs font-bold text-slate-900 dark:text-white">Approval required</div>
            <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{action.payload?.description || action.action_name}</div>
            {action.status === 'PENDING_APPROVAL' ? (
              <div className="mt-3 flex gap-2">
                <Button type="button" disabled={processing === action.id} onClick={() => decide(action.id, true)} className="flex-1 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white"><Check size={14}/> Approve</Button>
                <Button type="button" disabled={processing === action.id} onClick={() => decide(action.id, false)} className="flex-1 rounded-xl bg-slate-200 px-3 py-2 text-xs font-bold text-slate-800 dark:bg-slate-700 dark:text-white"><XCircle size={14}/> Decline</Button>
              </div>
            ) : <div className="mt-2 text-[11px] font-bold uppercase text-slate-500">{action.status}</div>}
          </div>
        ))}
        {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
        <input value={message} onChange={e => setMessage(e.target.value)} placeholder="What would you like to do?" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        <Button type="submit" disabled={loading || !message.trim()} className="rounded-xl bg-brand-600 p-2 text-white">{loading ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}</Button>
      </form>
    </div>
  );
}
