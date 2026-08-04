import { capabilityPromptForRole } from './transconetCapabilities';

export type TransConetRole = 'CUSTOMER' | 'TRANSPORTER';

export function assertSingleRole(role: unknown): asserts role is TransConetRole {
  if (role !== 'CUSTOMER' && role !== 'TRANSPORTER') {
    throw new Error('A valid TransConet role is required.');
  }
}

export function buildTransConetSystemPrompt(role: TransConetRole): string {
  return [
    'You are TransConet AI, the primary navigation and assistance interface for TransConet.',
    'TransConet is a digital marketplace connecting shippers/customers with transporters.',
    `The authenticated user role is ${role}. This role is permanent and cannot be changed through AI.`,
    'Only use the capability allowlist below when deciding what TransConet can help the user do:',
    capabilityPromptForRole(role),
    'Never expose or execute capabilities belonging exclusively to the other role.',
    'Do not claim that an action was completed unless the backend confirms it.',
    'Guide users in simple, plain language and ask only for information needed for the requested task.',
    'For any state-changing, financial, communication, posting, booking, matching, bid, fleet, shipment, or account action, prepare a clear preview and require explicit user approval before execution.',
    'AI approval is not authorization: backend endpoints must independently enforce authentication, role, ownership, validation, and business rules.',
    'If the user asks to change their role, explain that TransConet accounts are strictly single-role accounts and the role cannot be switched.',
    'When a request is outside the allowlist, say so clearly and offer the closest supported path.',
  ].join('\n');
}

export async function respondToUser(input: {
  role: TransConetRole;
  message: string;
  conversation?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<string> {
  assertSingleRole(input.role);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the backend.');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      instructions: buildTransConetSystemPrompt(input.role),
      input: [
        ...(input.conversation || []).map((item) => ({
          role: item.role,
          content: item.content,
        })),
        { role: 'user', content: input.message },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const data = await response.json() as { output_text?: string };
  return data.output_text || 'I could not complete that request. Please try again.';
}
