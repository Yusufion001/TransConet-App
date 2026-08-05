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
  {
    type: 'function',
    function: {
      name: 'search_marketplace',
      description: 'Search real TransConet marketplace loads. Use this for available loads, routes, cargo, weight, budgets, or load comparisons. Never invent a load.',
      parameters: {
        type: 'object',
        properties: {
          origin: { type: 'string', description: 'Optional origin location.' },
          destination: { type: 'string', description: 'Optional destination location.' },
          cargoType: { type: 'string', description: 'Optional TransConet cargo type or natural-language cargo type.' },
          maxWeightKg: { type: 'number', description: 'Optional maximum cargo weight in kilograms.' }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_my_bids',
      description: 'Get the authenticated transporter customer\'s own bids from TransConet. Never expose another user\'s bids.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_my_loads',
      description: 'Get the authenticated customer\'s own load postings and current statuses.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_my_vehicles',
      description: 'Get the authenticated transporter\'s fleet and vehicle information.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_my_account',
      description: 'Get the authenticated user account basics, role, wallet balance and profile information. Never return passwords or secrets.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'prepare_bid',
      description: 'Prepare a transporter bid as a pending approval action. This NEVER submits the bid directly.',
      parameters: {
        type: 'object',
        properties: {
          loadId: { type: 'string' },
          amount: { type: 'number' },
          notes: { type: 'string' }
        },
        required: ['loadId', 'amount'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'prepare_load_posting',
      description: 'Prepare a customer load posting as a pending approval action. This NEVER posts the load directly.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          cargoType: { type: 'string' },
          weightKg: { type: 'number' },
          origin: { type: 'string' },
          destination: { type: 'string' },
          suggestedBudget: { type: 'number' },
          isEscrowEnabled: { type: 'boolean' }
        },
        required: ['title', 'cargoType', 'weightKg', 'origin', 'destination'],
        additionalProperties: false
      }
    }
  }
];

const systemPrompt = (role: Role, context: Record<string, unknown>) => `You are the TransConet in-app AI assistant. You are not a generic chatbot: when the user asks about TransConet, use the provided tools and real application data. Never invent loads, bids, vehicles, payments, shipments, balances, users, or statuses. If data is unavailable, say so clearly.

User role: ${role}.
Current UI context (may be empty): ${JSON.stringify(context).slice(0, 6000)}

Rules:
- Understand natural language, slang, short replies, spelling mistakes, and follow-up references such as "that one", "the second one", "it", "go ahead", and "how much?" using conversation history and UI context.
- Keep answers concise but useful and conversational.
- For factual TransConet information, prefer a tool over guessing.
- Respect role permissions. A transporter cannot perform customer-only actions and vice versa.
- Read-only queries can be answered directly after checking data.
- Financial, bidding, posting, acceptance, or other consequential changes must never be executed silently. Prepare an approval action and tell the user exactly what will happen before approval.
- Never expose passwords, API keys, JWTs, database credentials, internal secrets, or another user's private data.
- If the user's request is ambiguous and a safe tool call cannot resolve it, ask one focused clarification question.
- If the advanced AI service is unavailable, the server has a deterministic fallback. Do not claim you used OpenAI or any tool unless you actually did.`;

function normalizeHistory(history: unknown): HistoryItem[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item: any) => (item?.role === 'user' || item?.role === 'assistant') && typeof item?.content === 'string')
    .slice(-12)
    .map((item: any) => ({ role: item.role, content: String(item.content).slice(0, 4000) }));
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function runTool(name: string, args: any, userId: string, role: Role, context: Record<string, unknown>) {
  switch (name) {
    case 'search_marketplace': {
      const origin = text(args?.origin);
      const destination = text(args?.destination);
      const cargoType = text(args?.cargoType);
      const message = [origin && `from ${origin}`, destination && `to ${destination}`, cargoType].filter(Boolean).join(' ');
      const result = await searchExistingMarketplace(message || 'find available loads', {
        origin: origin || undefined,
        cargoType: cargoType || undefined
      });
      let loads = result.loads;
      if (destination) loads = loads.filter((load: any) => String(load.destination || '').toLowerCase().includes(destination.toLowerCase()));
      if (Number.isFinite(args?.maxWeightKg)) loads = loads.filter((load: any) => Number(load.weightKg) <= Number(args.maxWeightKg));
      return { filters: { ...result.filters, destination: destination || null, maxWeightKg: args?.maxWeightKg || null }, count: loads.length, loads: loads.slice(0, 20) };
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
      const [vehicles, profile] = await Promise.all([
        prismaBypass.transporterVehicle.findMany({ where: { transporterId: userId }, orderBy: { createdAt: 'desc' }, take: 30 }),
        prismaBypass.transporterProfile.findUnique({ where: { userId }, select: { id: true, companyName: true, vehicleType: true, tonnageCapacity: true, rating: true, isVerified: true } })
      ]);
      return { profile, vehicles };
    }
    case 'get_my_account': {
      const user = await prismaBypass.user.findUnique({ where: { id: userId }, select: { id: true, email: true, phoneNumber: true, phone: true, role: true, walletBalance: true, createdAt: true } });
      if (!user) return { error: 'Account not found.' };
      const [shipperProfile, transporterProfile] = await Promise.all([
        role === 'CUSTOMER' ? prismaBypass.shipperProfile.findUnique({ where: { userId }, select: { businessName: true, verificationLevel: true, isBusinessVerified: true } }) : null,
        role === 'TRANSPORTER' ? prismaBypass.transporterProfile.findUnique({ where: { userId }, select: { companyName: true, verificationLevel: true, isVerified: true, rating: true, tonnageCapacity: true } }) : null
      ]);
      return { user, profile: shipperProfile || transporterProfile };
    }
    case 'prepare_bid': {
      if (role !== 'TRANSPORTER') return { error: 'Only transporters can place bids.' };
      const result = await processAutomationMessage(userId, role, 'place bid', { loadId: args?.loadId, amount: args?.amount, notes: args?.notes });
      return { ...result, instruction: 'The bid is only prepared as PENDING_APPROVAL. The user must approve it before execution.' };
    }
    case 'prepare_load_posting': {
      if (role !== 'CUSTOMER') return { error: 'Only customers can post loads.' };
      const result = await processAutomationMessage(userId, role, 'post load', args || {});
      return { ...result, instruction: 'The load is only prepared as PENDING_APPROVAL. The user must approve it before posting.' };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function isQuotaError(status: number, body: string) {
  return status === 429 || /insufficient_quota|no credits remaining|quota/i.test(body);
}

async function callOpenAI(userId: string, role: Role, message: string, context: Record<string, unknown>, history: HistoryItem[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_NOT_CONFIGURED');

  const messages: any[] = [
    { role: 'system', content: systemPrompt(role, context) },
    ...history,
    { role: 'user', content: message }
  ];

  for (let round = 0; round < 4; round += 1) {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages, tools, tool_choice: 'auto', temperature: 0.2, max_tokens: 900 })
    });
    const raw = await response.text();
    if (!response.ok) {
      if (isQuotaError(response.status, raw)) throw new Error('OPENAI_QUOTA_EXHAUSTED');
      throw new Error(`OPENAI_REQUEST_FAILED_${response.status}`);
    }
    const data = JSON.parse(raw);
    const assistant = data?.choices?.[0]?.message;
    if (!assistant) throw new Error('OPENAI_EMPTY_RESPONSE');
    messages.push(assistant);

    const calls = Array.isArray(assistant.tool_calls) ? assistant.tool_calls : [];
    if (!calls.length) {
      const reply = text(assistant.content) || 'I could not generate a response for that request.';
      return { reply, actions: [], marketplace: undefined };
    }

    for (const call of calls) {
      let args: any = {};
      try { args = JSON.parse(call.function?.arguments || '{}'); } catch { args = {}; }
      let output: any;
      try {
        output = await runTool(call.function?.name, args, userId, role, context);
      } catch (error: any) {
        output = { error: error?.message || 'Tool execution failed.' };
      }
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(output).slice(0, 12000) });
    }
  }

  throw new Error('OPENAI_TOOL_LOOP_LIMIT');
}

function isMarketplaceMessage(message: string, role: Role) {
  return role === 'TRANSPORTER' && /\b(find|search|browse|show|available)\b.*\b(loads?|capacity|marketplace)\b|\bavailable loads?\b|\bfind loads?\b/i.test(message);
}

export async function processConversationalMessage(userId: string, role: Role, message: string, context: Record<string, unknown> = {}, history: unknown = []): Promise<ConversationResult> {
  const normalizedHistory = normalizeHistory(history);
  try {
    const result = await callOpenAI(userId, role, message, context, normalizedHistory);
    return { reply: result.reply, needsClarification: false, clarifyingQuestion: '', actions: result.actions || [], marketplace: result.marketplace, aiMode: 'openai' };
  } catch (error: any) {
    const reason = error?.message || 'unknown';
    console.warn(`Conversational AI fallback: ${reason}`);
    const core = await processAutomationMessage(userId, role, message, context);
    if (isMarketplaceMessage(message, role)) {
      const marketplace = await searchExistingMarketplace(message, context);
      return {
        reply: marketplace.loads.length
          ? `I found ${marketplace.loads.length} available load${marketplace.loads.length === 1 ? '' : 's'} using the existing marketplace search.`
          : 'I could not find an available load matching those marketplace search options.',
        needsClarification: false,
        clarifyingQuestion: '',
        actions: [],
        marketplace: { filters: marketplace.filters, loads: marketplace.loads },
        aiMode: 'core_marketplace'
      };
    }
    return { ...core, aiMode: 'core' };
  }
}
