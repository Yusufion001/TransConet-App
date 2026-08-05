import React, { useState } from 'react';
import { Bot, Check, Loader2, Send, Sparkles, X, XCircle } from 'lucide-react';
import api from '../api/client';
import { Button } from './ui/Button';

interface AIAction { id: string; action_name: string; status: string; payload?: { description?: string; loadId?: string; amount?: number } }
interface MarketplaceLoad { id: string; title: string; cargoType: string; weightKg: number; origin: string; destination: string; suggestedBudget?: number | null; createdAt?: string }
interface HistoryItem { role: 'user' | 'assistant'; content: string }

export default function TransConetAIAssistant({ role }: { role: string }) {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState(''); const [reply, setReply] = useState('Hi. What would you like to do in TransConet?'); const [clarifyingQuestion, setClarifyingQuestion] = useState(''); const [actions, setActions] = useState<AIAction[]>([]); const [loads, setLoads] = useState<MarketplaceLoad[]>([]); const [conversationLoads, setConversationLoads] = useState<MarketplaceLoad[]>([]); const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null); const [history, setHistory] = useState<HistoryItem[]>([]); const [loading, setLoading] = useState(false); const [processing, setProcessing] = useState<string | null>(null); const [error, setError] = useState('');

  const findReferencedLoad = (text: string) => {
    const lower = text.toLowerCase();
    if (!conversationLoads.length) return selectedLoadId;
    if (/\b(second|2nd)\b/.test(lower)) return conversationLoads[1]?.id || selectedLoadId || null;
    if (/\b(third|3rd)\b/.test(lower)) return conversationLoads[2]?.id || selectedLoadId || null;
    if (/\b(first|1st)\b/.test(lower)) return conversationLoads[0]?.id || selectedLoadId || null;
    if (/\b(highest|highest budget|most|maximum|max)\b/.test(lower)) return [...conversationLoads].sort((a, b) => Number(b.suggestedBudget ?? -1) - Number(a.suggestedBudget ?? -1))[0]?.id || selectedLoadId || null;
    if (/\b(lowest|lowest budget|least|minimum|min)\b/.test(lower)) return [...conversationLoads].sort((a, b) => Number(a.suggestedBudget ?? Infinity) - Number(b.suggestedBudget ?? Infinity))[0]?.id || selectedLoadId || null;
    if (/\b(that one|this one|it|the selected|the load)\b/.test(lower)) return selectedLoadId || conversationLoads[0]?.id || null;
    return selectedLoadId;
  };

  const send = async (e?: React.FormEvent, overrideMessage?: string, overrideContext?: Record<string, unknown>) => {
    e?.preventDefault(); const text = (overrideMessage ?? message).trim(); if (!text || loading) return; setLoading(true); setError('');
    const referencedLoadId = findReferencedLoad(text); const selectedLoad = conversationLoads.find(load => load.id === referencedLoadId) || null; const nextHistory = [...history, { role: 'user' as const, content: text }].slice(-12);
    const isLoadReference = /\b(highest|highest budget|lowest|lowest budget|second|third|first|that one|this one|it|selected|the load)\b/i.test(text);
    try {
      const response = await api.post('/ai-automation/assistant', { message: text, history: nextHistory, context: { currentPath: window.location.pathname, ...(referencedLoadId ? { loadId: referencedLoadId } : {}), ...(selectedLoad ? { selectedLoad } : {}), ...(conversationLoads.length ? { marketplaceLoads: conversationLoads.slice(0, 20) } : {}), ...(overrideContext || {}) } });
      const nextReply = response.data.reply || 'Tell me what you want to do next.'; const returnedLoads = response.data.marketplace?.loads || [];
      setReply(nextReply); setClarifyingQuestion(response.data.clarifyingQuestion || ''); setActions(response.data.actions || []); setLoads(returnedLoads); if (returnedLoads.length) setConversationLoads(returnedLoads);
      // Persist the resolved load ID independently of the current message. This is critical for
      // the next bare amount message (e.g. “₦400,000”), which contains no load reference words.
      if (referencedLoadId && (isLoadReference || /\b(bid|offer)\b/i.test(text))) setSelectedLoadId(referencedLoadId);
      setHistory([...nextHistory, { role: 'assistant', content: nextReply }].slice(-12)); if (!overrideMessage) setMessage('');
    } catch (err: any) { setError(err?.response?.data?.error || 'AI assistant is temporarily unavailable.'); } finally { setLoading(false); }
  };

  const chooseLoadForBid = (load: MarketplaceLoad) => { setLoads([]); setActions([]); setSelectedLoadId(load.id); setMessage(''); setClarifyingQuestion('What amount would you like to bid?'); setReply(`You selected “${load.title}” (${load.origin} → ${load.destination}, ${load.weightKg} kg).`); setHistory(prev => [...prev, { role: 'assistant', content: `Selected load: ${load.title} (${load.id}).` }].slice(-12)); };

  const decide = async (id: string, approved: boolean) => { setProcessing(id); setError(''); try { const response = await api.post(`/ai-automation/actions/${id}/${approved ? 'approve' : 'reject'}`); setActions(prev => prev.map(a => a.id === id ? response.data.action : a)); const nextReply = approved ? 'Approved. The TransConet automation system has executed the requested action.' : 'Declined. No action was executed.'; setReply(nextReply); setHistory(prev => [...prev, { role: 'assistant', content: nextReply }].slice(-12)); setClarifyingQuestion(''); if (approved) setSelectedLoadId(null); } catch (err: any) { setError(err?.response?.data?.error || 'Unable to update that request.'); } finally { setProcessing(null); } };

  if (!open) return <button type="button" onClick={() => setOpen(true)} aria-label="Open TransConet AI assistant" className="fixed bottom-20 right-20 z-[101] flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl ring-2 ring-white/80 transition hover:scale-105"><Sparkles size={21} /></button>;
  return <div className="fixed bottom-20 right-4 z-[101] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white"><div className="flex items-center gap-2"><Bot size={20} /><div><div className="text-sm font-bold">TransConet AI</div><div className="text-[10px] text-slate-300">Your logistics assistant · {role}</div></div></div><Button type="button" onClick={() => setOpen(false)} className="bg-transparent p-1.5 text-white hover:bg-white/10"><X size={18}/></Button></div>
    <div className="max-h-[55vh] space-y-3 overflow-y-auto p-4"><div className="rounded-2xl bg-slate-100 p-3 text-sm leading-5 text-slate-800 dark:bg-slate-800 dark:text-slate-100">{reply}</div>{clarifyingQuestion && <div className="rounded-2xl border border-brand-200 bg-brand-50 p-3 text-sm font-semibold leading-5 text-slate-800 dark:border-brand-800 dark:bg-brand-950/30 dark:text-slate-100">{clarifyingQuestion}</div>}
      {loads.length > 0 && <div className="space-y-2">{loads.map(load => <div key={load.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700"><div className="text-sm font-bold text-slate-900 dark:text-white">{load.title}</div><div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{load.origin} → {load.destination}</div><div className="mt-1 text-xs text-slate-500">{load.cargoType} · {load.weightKg} kg{load.suggestedBudget != null ? ` · Budget ₦${Number(load.suggestedBudget).toLocaleString()}` : ''}</div>{role === 'TRANSPORTER' && <Button type="button" disabled={loading} onClick={() => chooseLoadForBid(load)} className="mt-2 w-full rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white">Bid on this load</Button>}</div>)}</div>}
      {actions.map(action => <div key={action.id} className="rounded-2xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-950/30"><div className="text-xs font-bold text-slate-900 dark:text-white">Approval required</div><div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{action.payload?.description || action.action_name}</div>{action.status === 'PENDING_APPROVAL' ? <div className="mt-3 flex gap-2"><Button type="button" disabled={processing === action.id} onClick={() => decide(action.id, true)} className="flex-1 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white"><Check size={14}/> Approve</Button><Button type="button" disabled={processing === action.id} onClick={() => decide(action.id, false)} className="flex-1 rounded-xl bg-slate-200 px-3 py-2 text-xs font-bold text-slate-800 dark:bg-slate-700 dark:text-white"><XCircle size={14}/> Decline</Button></div> : <div className="mt-2 text-[11px] font-bold uppercase text-slate-500">{action.status}</div>}</div>)}
      {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}</div>
    <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700"><input value={message} onChange={e => setMessage(e.target.value)} placeholder="What would you like to do?" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><Button type="submit" disabled={loading || !message.trim()} className="rounded-xl bg-brand-600 p-2 text-white">{loading ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}</Button></form>
  </div>;
}
