import { prismaBypass } from '../db/prisma';
import { searchExistingMarketplace } from './aiMarketplaceService';
import { processAutomationMessage } from './aiAutomationService';

type Role = 'CUSTOMER' | 'TRANSPORTER';
type HistoryItem = { role: 'user' | 'assistant'; content: string };

type ConversationResult = {
  reply: string;
  needsClarification: boolean;
  clarifyingQuestion: string;
  actions: any[];
  marketplace?: { filters: any; loads: any[] };
  aiMode: 'openai' | 'core' | 'core_marketplace';
};

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const tools = [
  { type: 'function', function: { name: 'search_marketplace', description: 'Search real TransConet marketplace loads. Use this for available loads, routes, cargo, weight, budgets, or load comparisons. Never invent a load.', parameters: { type: 'object', properties: { origin: { type: 'string' }, destination: { type: 'string' }, cargoType: { type: 'string' }, maxWeightKg: { type: 'number' } }, additionalProperties: false } } },
  { type: 'function', function: { name: 'get_my_bids', description: 'Get the authenticated transporter\'s own bids. Never expose another user\'s bids.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'get_my_loads', description: 'Get the authenticated customer\'s own load postings and current statuses.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'get_my_vehicles', description: 'Get the authenticated transporter\'s fleet and vehicle information.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'get_my_account', description: 'Get authenticated account basics, role, wallet balance and profile. Never return passwords or secrets.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'prepare_bid', description: 'Prepare a transporter bid as a pending approval action. Never submit it directly.', parameters: { type: 'object', properties: { loadId: { type: 'string' }, amount: { type: 'number' }, notes: { type: 'string' } }, required: ['loadId', 'amount'], additionalProperties: false } } },
  { type: 'function', function: { name: 'prepare_load_posting', description: 'Prepare a customer load posting as a pending approval action. Never post it directly.', parameters: { type: 'object', properties: { title: { type: 'string' }, cargoType: { type: 'string' }, weightKg: { type: 'number' }, origin: { type: 'string' }, destination: { type: 'string' }, suggestedBudget: { type: 'number' }, isEscrowEnabled: { type: 'boolean' } }, required: ['title', 'cargoType', 'weightKg', 'origin', 'destination'], additionalProperties: false } } }
];

const systemPrompt = (role: Role, context: Record<string, unknown>) => `You are the TransConet in-app AI assistant. When the user asks about TransConet, use the provided tools and real application data. Never invent loads, bids, vehicles, payments, shipments, balances, users, or statuses. If data is unavailable, say so clearly.\n\nUser role: ${role}.\nCurrent UI context: ${JSON.stringify(context).slice(0, 6000)}\n\nRules:\n- Understand natural language, slang, short replies, spelling mistakes, and follow-up references such as "that one", "the second one", "it", "go ahead", and "how much?" using conversation history and UI context.\n- Keep answers concise but useful and conversational.\n- For factual TransConet information, prefer a tool over guessing.\n- Respect role permissions.\n- Read-only queries can be answered after checking data.\n- Financial, bidding, posting, acceptance, or other consequential changes must never be executed silently. Prepare an approval action and tell the user exactly what will happen before approval.\n- Never expose passwords, API keys, JWTs, database credentials, internal secrets, or another user's private data.\n- When comparing marketplace budgets, compare only actual finite numeric suggestedBudget values. Missing budgets are not zero and must never be selected as the highest or lowest budget. If none of the candidate loads has a numeric budget, say that the budgets are not listed and that a highest/lowest budget cannot be determined.\n- If ambiguous and a safe tool call cannot resolve it, ask one focused clarification question.`;

function normalizeHistory(history: unknown): HistoryItem[] { if (!Array.isArray(history)) return []; return history.filter((item: any) => (item?.role === 'user' || item?.role === 'assistant') && typeof item?.content === 'string').slice(-12).map((item: any) => ({ role: item.role, content: String(item.content).slice(0, 4000) })); }
function text(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }
function extractMoney(value: unknown): number | null { if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value; if (typeof value !== 'string') return null; const cleaned = value.replace(/[₦,\s]/g, '').replace(/ngn/gi, ''); const n = Number(cleaned); return Number.isFinite(n) && n > 0 ? n : null; }
function extractBidAmount(message: string, context: Record<string, unknown>) {
  const contextAmount = extractMoney(context.amount);
  if (contextAmount) return contextAmount;
  const match = message.match(/(?:₦|ngn|naira)\s*([\d,]+(?:\.\d+)?)|\b([\d,]+(?:\.\d+)?)\s*(?:₦|ngn|naira)\b/i);
  return match ? extractMoney(match[1] || match[2]) : null;
}

async function runTool(name: string, args: any, userId: string, role: Role, context: Record<string, unknown>) {
  switch (name) {
    case 'search_marketplace': {
      const origin = text(args?.origin), destination = text(args?.destination), cargoType = text(args?.cargoType);
      const message = [origin && `from ${origin}`, destination && `to ${destination}`, cargoType].filter(Boolean).join(' ');
      const result = await searchExistingMarketplace(message || 'find available loads', { origin: origin || undefined, destination: destination || undefined, cargoType: cargoType || undefined });
      let loads = result.loads;
      if (destination) loads = loads.filter((load: any) => String(load.destination || '').toLowerCase().includes(destination.toLowerCase()));
      if (Number.isFinite(args?.maxWeightKg)) loads = loads.filter((load: any) => Number(load.weightKg) <= Number(args.maxWeightKg));
      return { filters: { ...result.filters, destination: destination || null, maxWeightKg: args?.maxWeightKg || null }, totalAvailable: result.totalAvailable, count: loads.length, loads };
    }
    case 'get_my_bids': {
      if (role !== 'TRANSPORTER') return { error: 'This feature is available to transporters only.' };
      const bids = await prismaBypass.bid.findMany({ where: { driverId: userId }, include: { load: true }, orderBy: { createdAt: 'desc' }, take: 30 });
      return { count: bids.length, bids };
    }
    case 'get_my_loads': {
      if (role !== 'CUSTOMER') return { error: 'This feature is available to customers only.' };
      const loads = await prismaBypass.loadPosting.findMany({ where: { customerId: userId }, orderBy: { createdAt: 'desc' }, take: 30 });
      return { count: loads.length, loads };
    }
    case 'get_my_vehicles': {
      if (role !== 'TRANSPORTER') return { error: 'This feature is available to transporters only.' };
      const [vehicles, profile] = await Promise.all([prismaBypass.transporterVehicle.findMany({ where: { transporterId: userId }, orderBy: { createdAt: 'desc' }, take: 30 }), prismaBypass.transporterProfile.findUnique({ where: { userId }, select: { id: true, companyName: true, vehicleType: true, tonnageCapacity: true, rating: true, isVerified: true } })]);
      return { profile, vehicles };
    }
    case 'get_my_account': {
      const user = await prismaBypass.user.findUnique({ where: { id: userId }, select: { id: true, email: true, phoneNumber: true, phone: true, role: true, walletBalance: true, createdAt: true } });
      if (!user) return { error: 'Account not found.' };
      const [shipperProfile, transporterProfile] = await Promise.all([role === 'CUSTOMER' ? prismaBypass.shipperProfile.findUnique({ where: { userId }, select: { businessName: true, verificationLevel: true, isBusinessVerified: true } }) : null, role === 'TRANSPORTER' ? prismaBypass.transporterProfile.findUnique({ where: { userId }, select: { companyName: true, verificationLevel: true, isVerified: true, rating: true, tonnageCapacity: true } }) : null]);
      return { user, profile: shipperProfile || transporterProfile };
    }
    case 'prepare_bid':
      if (role !== 'TRANSPORTER') return { error: 'Only transporters can place bids.' };
      return { ...(await processAutomationMessage(userId, role, 'place bid', { ...context, loadId: args?.loadId, amount: args?.amount, notes: args?.notes })), instruction: 'The bid is only prepared as PENDING_APPROVAL. The user must approve it before execution.' };
    case 'prepare_load_posting':
      if (role !== 'CUSTOMER') return { error: 'Only customers can post loads.' };
      return { ...(await processAutomationMessage(userId, role, 'post load', args || {})), instruction: 'The load is only prepared as PENDING_APPROVAL. The user must approve it before posting.' };
    default: return { error: `Unknown tool: ${name}` };
  }
}

function isQuotaError(status: number, body: string) { return status === 429 || /insufficient_quota|no credits remaining|quota/i.test(body); }

async function callOpenAI(userId: string, role: Role, message: string, context: Record<string, unknown>, history: HistoryItem[]) {
  const key = process.env.OPENAI_API_KEY; if (!key) throw new Error('OPENAI_NOT_CONFIGURED');
  const messages: any[] = [{ role: 'system', content: systemPrompt(role, context) }, ...history, { role: 'user', content: message }];
  const collectedActions: any[] = []; let marketplace: any;
  for (let round = 0; round < 4; round += 1) {
    const response = await fetch(OPENAI_URL, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: MODEL, messages, tools, tool_choice: 'auto', temperature: 0.2, max_tokens: 900 }) });
    const raw = await response.text(); if (!response.ok) { if (isQuotaError(response.status, raw)) throw new Error('OPENAI_QUOTA_EXHAUSTED'); throw new Error(`OPENAI_REQUEST_FAILED_${response.status}`); }
    const data = JSON.parse(raw), assistant = data?.choices?.[0]?.message; if (!assistant) throw new Error('OPENAI_EMPTY_RESPONSE');
    messages.push(assistant); const calls = Array.isArray(assistant.tool_calls) ? assistant.tool_calls : [];
    if (!calls.length) return { reply: text(assistant.content) || 'I could not generate a response for that request.', actions: collectedActions, marketplace };
    for (const call of calls) {
      let args: any = {}; try { args = JSON.parse(call.function?.arguments || '{}'); } catch { args = {}; }
      let output: any; try { output = await runTool(call.function?.name, args, userId, role, context); } catch (error: any) { output = { error: error?.message || 'Tool execution failed.' }; }
      if (call.function?.name === 'search_marketplace' && output?.loads) marketplace = { filters: output.filters, loads: output.loads };
      if (Array.isArray(output?.actions)) collectedActions.push(...output.actions);
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(output).slice(0, 12000) });
    }
  }
  throw new Error('OPENAI_TOOL_LOOP_LIMIT');
}

function isMarketplaceMessage(message: string) { return /\b(find|search|browse|show|list|available)\b.*\b(loads?|capacity|marketplace)\b|\bavailable loads?\b|\bfind loads?\b/i.test(message); }
function isMarketplaceFollowup(message: string, context: Record<string, unknown>) { if (!context || (!context.selectedLoad && !context.loadId && !context.marketplaceLoads)) return false; return /\b(highest|lowest|highest budget|lowest budget|best|most expensive|cheapest|second|third|first|that one|this one|it|selected)\b/i.test(message); }
function numericBudget(load: any) { const value = Number(load?.suggestedBudget); return Number.isFinite(value) && value > 0 ? value : null; }
function selectedLoadFromContext(context: Record<string, unknown>) { const selected = context.selectedLoad; if (selected && typeof selected === 'object') return selected as any; const loads = Array.isArray(context.marketplaceLoads) ? context.marketplaceLoads as any[] : []; if (!loads.length) return null; const lower = text(context.followupIntent).toLowerCase(); if (lower.includes('second')) return loads[1] || loads[0]; if (lower.includes('third')) return loads[2] || loads[0]; if (lower.includes('first')) return loads[0]; const budgets = loads.map(load => ({ load, budget: numericBudget(load) })).filter(item => item.budget !== null) as { load: any; budget: number }[]; if (lower.includes('lowest')) return budgets.sort((a, b) => a.budget - b.budget)[0]?.load || null; if (lower.includes('highest') || lower.includes('best') || lower.includes('most expensive')) return budgets.sort((a, b) => b.budget - a.budget)[0]?.load || null; return loads[0]; }
function deterministicFollowupReply(message: string, context: Record<string, unknown>) { const isBudgetComparison = /\b(highest|highest budget|lowest|lowest budget|best|most expensive|cheapest)\b/i.test(message); const loads = Array.isArray(context.marketplaceLoads) ? context.marketplaceLoads as any[] : []; const hasNumericBudget = loads.some(load => numericBudget(load) !== null); const load = selectedLoadFromContext({ ...context, followupIntent: message }); if (isBudgetComparison && !hasNumericBudget) return 'The available loads do not have numeric suggested budgets listed, so I cannot determine which one has the highest or lowest budget yet.'; if (!load && isBudgetComparison) return 'I could not determine a highest-budget load from the available marketplace results.'; if (!load) return null; const budgetValue = numericBudget(load); const budget = budgetValue === null ? 'no suggested budget listed' : `₦${budgetValue.toLocaleString()}`; if (/\b(highest|highest budget|best|most expensive)\b/i.test(message)) return `The highest-budget load from the loads we just found is “${load.title}” (${load.origin} → ${load.destination}) with a suggested budget of ${budget}.`; if (/\b(lowest|lowest budget|cheapest)\b/i.test(message)) return `The lowest-budget load from the loads we just found is “${load.title}” (${load.origin} → ${load.destination}) with a suggested budget of ${budget}.`; return `The load you selected is “${load.title}” (${load.origin} → ${load.destination}) with a suggested budget of ${budget}.`; }

export async function processConversationalMessage(userId: string, role: Role, message: string, context: Record<string, unknown> = {}, history: unknown = []): Promise<ConversationResult> {
  // A bare money reply is a continuation of an already selected bid target.
  // Resolve it deterministically before OpenAI/core fallback can lose the intent.
  const bidAmount = role === 'TRANSPORTER' ? extractBidAmount(message, context) : null;
  if (role === 'TRANSPORTER' && context.loadId && bidAmount) {
    const core = await processAutomationMessage(userId, role, 'place bid', { ...context, amount: bidAmount });
    return { ...core, aiMode: 'core' };
  }
  if (isMarketplaceMessage(message)) {
    try { const marketplace = await searchExistingMarketplace(message, context); return { reply: marketplace.loads.length ? `I found ${marketplace.loads.length} available load${marketplace.loads.length === 1 ? '' : 's'} using the existing marketplace search.` : 'I could not find an available load matching those marketplace search options.', needsClarification: false, clarifyingQuestion: '', actions: [], marketplace: { filters: marketplace.filters, loads: marketplace.loads }, aiMode: 'core_marketplace' }; } catch (error: any) { console.warn(`Marketplace search fallback: ${error?.message || 'unknown'}`); }
  }
  try { const result = await callOpenAI(userId, role, message, context, normalizeHistory(history)); return { reply: result.reply, needsClarification: false, clarifyingQuestion: '', actions: result.actions || [], marketplace: result.marketplace, aiMode: 'openai' }; }
  catch (error: any) { console.warn(`Conversational AI fallback: ${error?.message || 'unknown'}`); if (isMarketplaceFollowup(message, context)) { const followupReply = deterministicFollowupReply(message, context); if (followupReply) return { reply: followupReply, needsClarification: false, clarifyingQuestion: '', actions: [], marketplace: Array.isArray(context.marketplaceLoads) ? { filters: {}, loads: context.marketplaceLoads } : undefined, aiMode: 'core_marketplace' }; } const core = await processAutomationMessage(userId, role, message, context); return { ...core, aiMode: 'core' }; }
}
