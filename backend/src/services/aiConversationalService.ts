import { prismaBypass } from '../db/prisma';
import { searchExistingMarketplace } from './aiMarketplaceService';
import { processAutomationMessage } from './aiAutomationService';

type Role = 'CUSTOMER' | 'TRANSPORTER';
type HistoryItem = { role: 'user' | 'assistant'; content: string };
type ConversationResult = { reply: string; needsClarification: boolean; clarifyingQuestion: string; actions: any[]; marketplace?: { filters: any; loads: any[] }; aiMode: 'openai' | 'core' | 'core_marketplace' };

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const tools = [
  { type: 'function', function: { name: 'search_marketplace', description: 'Search real TransConet marketplace loads. Use this for available loads, routes, cargo, weight, budgets, or load comparisons. Never invent a load.', parameters: { type: 'object', properties: { origin: { type: 'string' }, destination: { type: 'string' }, cargoType: { type: 'string' }, maxWeightKg: { type: 'number' } }, additionalProperties: false } } },
  { type: 'function', function: { name: 'get_my_bids', description: 'Get the authenticated transporter\'s own bids.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'get_my_loads', description: 'Get the authenticated customer\'s own load postings.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'get_my_vehicles', description: 'Get the authenticated transporter\'s fleet.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'get_my_account', description: 'Get authenticated account basics, role, wallet balance and profile. Never return passwords or secrets.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'prepare_bid', description: 'Prepare a transporter bid as a pending approval action. Never submit it directly.', parameters: { type: 'object', properties: { loadId: { type: 'string' }, amount: { type: 'number' }, notes: { type: 'string' } }, required: ['loadId', 'amount'], additionalProperties: false } } },
  { type: 'function', function: { name: 'prepare_load_posting', description: 'Prepare a customer load posting as a pending approval action. Never post it directly.', parameters: { type: 'object', properties: { title: { type: 'string' }, cargoType: { type: 'string' }, weightKg: { type: 'number' }, origin: { type: 'string' }, destination: { type: 'string' }, suggestedBudget: { type: 'number' }, isEscrowEnabled: { type: 'boolean' } }, required: ['title', 'cargoType', 'weightKg', 'origin', 'destination'], additionalProperties: false } } }
];

const systemPrompt = (role: Role, context: Record<string, unknown>) => `You are the TransConet in-app AI assistant. Use real application data and never invent loads, bids, vehicles, payments, shipments, balances, users, or statuses. User role: ${role}. Current UI context: ${JSON.stringify(context).slice(0, 6000)}. Understand short follow-ups such as "that one", "it", "go ahead", and amounts using conversation history. Read-only queries may execute after checking data. Financial, bidding, posting, acceptance, or other consequential changes must never execute silently: prepare an approval action and require explicit approval. When comparing marketplace budgets, only finite numeric suggestedBudget values count; missing budgets are not zero.`;
function normalizeHistory(history: unknown): HistoryItem[] { if (!Array.isArray(history)) return []; return history.filter((item: any) => (item?.role === 'user' || item?.role === 'assistant') && typeof item?.content === 'string').slice(-12).map((item: any) => ({ role: item.role, content: String(item.content).slice(0, 4000) })); }
function text(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }
function extractMoney(value: unknown): number | null { if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value; if (typeof value !== 'string') return null; const n = Number(value.replace(/[₦,\s]/g, '').replace(/ngn/gi, '')); return Number.isFinite(n) && n > 0 ? n : null; }
function extractBidAmount(message: string, context: Record<string, unknown>) { const fromContext = extractMoney(context.amount); if (fromContext) return fromContext; const match = message.match(/(?:₦|ngn|naira)\s*([\d,]+(?:\.\d+)?)|\b([\d,]+(?:\.\d+)?)\s*(?:₦|ngn|naira)\b/i); return match ? extractMoney(match[1] || match[2]) : null; }
function numericBudget(load: any) { const value = Number(load?.suggestedBudget); return Number.isFinite(value) && value > 0 ? value : null; }
function extractLoadsFromHistory(history: HistoryItem[]) { for (let i = history.length - 1; i >= 0; i--) { const content = history[i]?.content || ''; const marker = content.indexOf('marketplaceLoads:'); if (marker >= 0) { try { const parsed = JSON.parse(content.slice(marker + 15)); if (Array.isArray(parsed)) return parsed; } catch {} } } return []; }
function resolveBidTarget(context: Record<string, unknown>, history: HistoryItem[], message: string) {
  if (context.loadId) return String(context.loadId);
  const selected = context.selectedLoad as any;
  if (selected?.id) return String(selected.id);
  const loads = Array.isArray(context.marketplaceLoads) ? context.marketplaceLoads as any[] : extractLoadsFromHistory(history);
  if (!loads.length) return null;
  const lower = message.toLowerCase();
  const highest = /\b(highest|highest budget|best|most expensive|max(?:imum)?)\b/.test(lower);
  const lowest = /\b(lowest|lowest budget|cheapest|min(?:imum)?)\b/.test(lower);
  const ordinal = lower.match(/\b(first|1st|second|2nd|third|3rd)\b/);
  if (ordinal) { const index = /second|2nd/.test(ordinal[1]) ? 1 : /third|3rd/.test(ordinal[1]) ? 2 : 0; return loads[index]?.id ? String(loads[index].id) : null; }
  if (highest || lowest) { const ranked = loads.map(load => ({ load, budget: numericBudget(load) })).filter(x => x.budget !== null) as { load: any; budget: number }[]; ranked.sort((a, b) => highest ? b.budget - a.budget : a.budget - b.budget); return ranked[0]?.load?.id ? String(ranked[0].load.id) : null; }
  if (/\b(that one|this one|it|selected|the load)\b/.test(lower)) return loads[0]?.id ? String(loads[0].id) : null;
  return null;
}
function marketplaceIntent(message: string) { return /\b(find|search|browse|show|list|available)\b.*\b(loads?|capacity|marketplace)\b|\bavailable loads?\b|\bfind loads?\b/i.test(message); }

async function runTool(name: string, args: any, userId: string, role: Role, context: Record<string, unknown>) {
  switch (name) {
    case 'search_marketplace': { const origin = text(args?.origin), destination = text(args?.destination), cargoType = text(args?.cargoType); const result = await searchExistingMarketplace([origin && `from ${origin}`, destination && `to ${destination}`, cargoType].filter(Boolean).join(' ') || 'find available loads', { origin: origin || undefined, destination: destination || undefined, cargoType: cargoType || undefined }); let loads = result.loads; if (destination) loads = loads.filter((load: any) => String(load.destination || '').toLowerCase().includes(destination.toLowerCase())); if (Number.isFinite(args?.maxWeightKg)) loads = loads.filter((load: any) => Number(load.weightKg) <= Number(args.maxWeightKg)); return { filters: { ...result.filters, destination: destination || null }, totalAvailable: result.totalAvailable, count: loads.length, loads }; }
    case 'get_my_bids': if (role !== 'TRANSPORTER') return { error: 'This feature is available to transporters only.' }; return { bids: await prismaBypass.bid.findMany({ where: { driverId: userId }, include: { load: true }, orderBy: { createdAt: 'desc' }, take: 30 }) };
    case 'get_my_loads': if (role !== 'CUSTOMER') return { error: 'This feature is available to customers only.' }; return { loads: await prismaBypass.loadPosting.findMany({ where: { customerId: userId }, orderBy: { createdAt: 'desc' }, take: 30 }) };
    case 'get_my_vehicles': if (role !== 'TRANSPORTER') return { error: 'This feature is available to transporters only.' }; return { vehicles: await prismaBypass.transporterVehicle.findMany({ where: { transporterId: userId }, orderBy: { createdAt: 'desc' }, take: 30 }) };
    case 'get_my_account': { const user = await prismaBypass.user.findUnique({ where: { id: userId }, select: { id: true, email: true, phoneNumber: true, phone: true, role: true, walletBalance: true, createdAt: true } }); return user ? { user } : { error: 'Account not found.' }; }
    case 'prepare_bid': if (role !== 'TRANSPORTER') return { error: 'Only transporters can place bids.' }; return { ...(await processAutomationMessage(userId, role, 'place bid', { ...context, loadId: args?.loadId, amount: args?.amount, notes: args?.notes })), instruction: 'The bid is only prepared as PENDING_APPROVAL. The user must approve it before execution.' };
    case 'prepare_load_posting': if (role !== 'CUSTOMER') return { error: 'Only customers can post loads.' }; return { ...(await processAutomationMessage(userId, role, 'post load', args || {})), instruction: 'The load is only prepared as PENDING_APPROVAL. The user must approve it before posting.' };
    default: return { error: `Unknown tool: ${name}` };
  }
}
function isQuotaError(status: number, body: string) { return status === 429 || /insufficient_quota|no credits remaining|quota/i.test(body); }
async function callOpenAI(userId: string, role: Role, message: string, context: Record<string, unknown>, history: HistoryItem[]) { const key = process.env.OPENAI_API_KEY; if (!key) throw new Error('OPENAI_NOT_CONFIGURED'); const messages: any[] = [{ role: 'system', content: systemPrompt(role, context) }, ...history, { role: 'user', content: message }]; const collectedActions: any[] = []; let marketplace: any; for (let round = 0; round < 4; round++) { const response = await fetch(OPENAI_URL, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: MODEL, messages, tools, tool_choice: 'auto', temperature: 0.2, max_tokens: 900 }) }); const raw = await response.text(); if (!response.ok) { if (isQuotaError(response.status, raw)) throw new Error('OPENAI_QUOTA_EXHAUSTED'); throw new Error(`OPENAI_REQUEST_FAILED_${response.status}`); } const data = JSON.parse(raw), assistant = data?.choices?.[0]?.message; if (!assistant) throw new Error('OPENAI_EMPTY_RESPONSE'); messages.push(assistant); const calls = Array.isArray(assistant.tool_calls) ? assistant.tool_calls : []; if (!calls.length) return { reply: text(assistant.content) || 'I could not generate a response for that request.', actions: collectedActions, marketplace }; for (const call of calls) { let args: any = {}; try { args = JSON.parse(call.function?.arguments || '{}'); } catch {} let output: any; try { output = await runTool(call.function?.name, args, userId, role, context); } catch (error: any) { output = { error: error?.message || 'Tool execution failed.' }; } if (call.function?.name === 'search_marketplace' && output?.loads) marketplace = { filters: output.filters, loads: output.loads }; if (Array.isArray(output?.actions)) collectedActions.push(...output.actions); messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(output).slice(0, 12000) }); } } throw new Error('OPENAI_TOOL_LOOP_LIMIT'); }

export async function processConversationalMessage(userId: string, role: Role, message: string, context: Record<string, unknown> = {}, history: unknown = []): Promise<ConversationResult> {
  const normalizedHistory = normalizeHistory(history);
  const bidAmount = role === 'TRANSPORTER' ? extractBidAmount(message, context) : null;
  if (role === 'TRANSPORTER' && bidAmount) {
    const targetId = resolveBidTarget(context, normalizedHistory, message) || resolveBidTarget(context, normalizedHistory, normalizedHistory.map(h => h.content).reverse().find(c => /\b(highest|lowest|that one|this one|selected|it)\b/i.test(c)) || '');
    if (targetId) { const core = await processAutomationMessage(userId, role, 'place bid', { ...context, loadId: targetId, amount: bidAmount }); return { ...core, aiMode: 'core' }; }
  }
  if (marketplaceIntent(message)) { try { const marketplace = await searchExistingMarketplace(message, context); return { reply: marketplace.loads.length ? `I found ${marketplace.loads.length} available load${marketplace.loads.length === 1 ? '' : 's'} using the existing marketplace search.` : 'I could not find an available load matching those marketplace search options.', needsClarification: false, clarifyingQuestion: '', actions: [], marketplace: { filters: marketplace.filters, loads: marketplace.loads }, aiMode: 'core_marketplace' }; } catch (error: any) { console.warn(`Marketplace search fallback: ${error?.message || 'unknown'}`); } }
  try { const result = await callOpenAI(userId, role, message, context, normalizedHistory); return { reply: result.reply, needsClarification: false, clarifyingQuestion: '', actions: result.actions || [], marketplace: result.marketplace, aiMode: 'openai' }; } catch (error: any) { console.warn(`Conversational AI fallback: ${error?.message || 'unknown'}`); const core = await processAutomationMessage(userId, role, message, context); return { ...core, aiMode: 'core' }; }
}
