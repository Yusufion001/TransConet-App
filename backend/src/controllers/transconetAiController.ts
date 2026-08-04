import { Request, Response } from 'express';
import { assertSingleRole, respondToUser } from '../ai/transconetAi';

export const chatWithTransConetAi = async (req: Request, res: Response): Promise<Response> => {
  try {
    const role = req.user?.role;
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    assertSingleRole(role);

    if (!message) {
      return res.status(400).json({ error: 'Please tell TransConet AI what you want to do.' });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: 'Your message is too long. Please shorten it and try again.' });
    }

    const conversation = Array.isArray(req.body?.conversation)
      ? req.body.conversation
          .filter((item: any) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
          .slice(-12)
          .map((item: any) => ({ role: item.role, content: item.content.slice(0, 4000) }))
      : [];

    const response = await respondToUser({ role, message, conversation });
    return res.status(200).json({ response, role });
  } catch (error: any) {
    console.error('[TransConet AI] request failed:', error?.message || error);
    return res.status(500).json({ error: 'TransConet AI is temporarily unavailable. Please try again shortly.' });
  }
};
