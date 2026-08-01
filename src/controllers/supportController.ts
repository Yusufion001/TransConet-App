import { getIO } from '../socket';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import { sanitizeInput } from '../utils/sanitize';

import { prismaRLS as prisma } from '../db/prisma';

// Initialize GoogleGenAI server-side client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize Google Gen AI Client:', error);
  }
}

// (removed inMemoryTickets mock data interface/definition)

// Helper to retrieve user details (phone number)
const getUserPhoneAndName = async (userId: string): Promise<{ phone: string; email: string }> => {
  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        return {
          phone: user.phoneNumber || user.phone || '08104352733',
          email: user.email || 'yusufjimoh969@gmail.com'
        };
      }
    } catch (err) {
      console.error('Error fetching user for support ticket:', err);
    }
  }
  return { phone: '08104352733', email: 'yusufjimoh969@gmail.com' };
};

const getAutomatedReply = (category: string): string => {
  switch (category) {
    case 'General Inquiry':
      return "Hello! I am TransConet AI. How can I help you navigate the TransConet platform today?";
    case 'Payment & Wallet':
      return "Hi there! I see you have a question about Payment & Wallet. Whether it's deposits, withdrawals, or escrow, I'm here to assist. What seems to be the issue?";
    case 'Verification Issues':
      return "Hello! Verification is crucial for trust on TransConet. If your documents are pending or rejected, please let me know which document (e.g., Driver's License, Vehicle Registration) you need help with.";
    case 'Fleet Management':
      return "Welcome to Fleet Management support! If you need help adding vehicles, tracking them, or managing drivers, please provide the details below.";
    case 'Bidding & Escrow':
      return "Hi! Bidding & Escrow ensures secure transactions. If you're having trouble placing a bid or need help with a payout, please describe the load or transaction in question.";
    case 'App Bug / Crash':
      return "We're sorry you're experiencing technical difficulties. Please describe the bug or crash in detail, including what you were trying to do when it happened, so we can investigate and escalate to the technical team immediately.";
    default:
      return `Hello! I am TransConet AI, your automated helper on TransConet. How can I help you today regarding "${category}" or any other issue?`;
  }
};

// 1. Get or Create active support ticket for a user
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required.' });
    }

    if (prisma) {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
      if (ticket) {
        return res.status(200).json({ success: true, ticket });
      }
    }

    return res.status(404).json({ error: 'Ticket not found.' });
  } catch (error: any) {
    console.error('Failed to get ticket by ID:', error);
    return res.status(500).json({ error: 'Failed to retrieve support ticket.' });
  }
};

export const getOrCreateActiveTicket = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated user context.' });
    }

    let { category = 'General Inquiry' } = req.body;
    category = sanitizeInput(category);
    const { phone: userPhone } = await getUserPhoneAndName(userId);

    if (prisma) {
      // Find existing open or pending support ticket
      let ticket = await prisma.supportTicket.findFirst({
        where: {
          userId,
          status: { in: ['OPEN', 'PENDING_ADMIN'] },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      // Create new ticket if none active
      if (!ticket) {
        ticket = await prisma.supportTicket.create({
          data: {
            userId,
            userPhone,
            category,
            status: 'OPEN',
          },
          include: {
            messages: true,
          },
        });

        // Add initial welcome bot message
        const welcomeMessage = await prisma.supportMessage.create({
          data: {
            ticketId: ticket.id,
            sender: 'AI_BOT',
            senderName: 'TransConet AI',
            content: getAutomatedReply(category),
          },
        });
        ticket.messages = [welcomeMessage];
      }

      emitToTicket(ticket.id, 'support_ticket_updated', ticket);
      return res.status(200).json({ success: true, ticket });
    } else {
      throw new Error('Database is unconfigured or offline.');
    }
  } catch (error: any) {
    console.error('Failed to get/create support ticket:', error);
    return res.status(500).json({ error: 'Internal server error initializing support queue.' });
  }
};

// 2. Add message to support ticket & invoke AI Chat Bot response
const emitToTicket = (ticketId: string, event: string, data: any) => {
  try {
    getIO().to(`chat_${ticketId}`).emit(event, data);
  } catch(e) { console.error('Socket emit failed:', e.message); }
};

export const addSupportMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated user context.' });
    }

    let { ticketId, content } = req.body;
    if (!ticketId || !content) {
      return res.status(400).json({ error: 'Ticket ID and message content are required.' });
    }
    content = sanitizeInput(content);

    const { phone: userPhone, email: userEmail } = await getUserPhoneAndName(userId);

    let ticketStatus = 'OPEN';
    let dbTicketMessages: any[] = [];
    let isFallback = true;

    // A. Write User Message
    if (prisma) {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (ticket) {
        ticketStatus = ticket.status;

        await prisma.supportMessage.create({
          data: {
            ticketId,
            sender: 'USER',
            senderName: userEmail.split('@')[0],
            content,
          },
        });

        // Fetch full conversation history for AI context
        const updatedTicket = await prisma.supportTicket.findUnique({
          where: { id: ticketId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        dbTicketMessages = updatedTicket?.messages || [];
      } else {
        return res.status(404).json({ error: 'Support ticket not found.' });
      }
    } else {
      throw new Error('Database connection failed.');
    }

    // B. Call Gemini AI bot if the ticket is NOT already flagged for Admin reply or if user asks for assistant
    let aiResponseText = '';
    let shouldEscalate = false;

    if (ticketStatus !== 'PENDING_ADMIN' && ai) {
      try {
        // Build the context prompt for Gemini
        const formattedHistory = dbTicketMessages
          .map(m => `${m.sender === 'USER' ? 'User' : m.sender === 'ADMIN' ? 'Support Admin' : 'TransConet AI'}: ${m.content}`)
          .join('\n');

        const systemInstruction = `You are "TransConet AI", an intelligent and extremely helpful customer support AI chatbot built into the "TransConet" platform in Nigeria. 
TransConet links cargo owners (Shippers) and vehicle/fleet managers (Transporters or Drivers).

Key FAQs & Information:
- Shippers post loads. Transporters bid on them. Once accepted, shipment logistics proceed.
- Fleet verification requires Transporter Profile submission, including Driver's License, Vehicle Registration Certificate, CAC Certificate, CAC Status Report, Insurance, and physical photographs.
- Document states are APPROVED, PENDING, or REJECTED. Admins review within 24 hours.
- If the user is reporting a serious complaint, app bug, payment failure, or explicitly requesting a "human agent", "support rep", "customer care", or "admin", you MUST respond politely, answer what you can, and conclude your reply by stating you are escalating the ticket to a human administrator.
- If you decide to escalate the issue, append the exact token "[ESCALATE]" at the very end of your response so the platform flags it for our human support queue.

Respond professionally, concisely, and keep your formatting neat.`;

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Conversation History:\n${formattedHistory}\n\nProvide the next helpful response. Remember to append "[ESCALATE]" at the end if the user remains unsatisfied or requests a human helper:`,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const rawText = geminiResponse.text || '';
        if (rawText.includes('[ESCALATE]')) {
          shouldEscalate = true;
          aiResponseText = rawText.replace('[ESCALATE]', '').trim();
        } else {
          aiResponseText = rawText.trim();
        }
      } catch (aiError) {
        console.error('Gemini API call failed during support chat:', aiError);
        aiResponseText = "I hear you. Let me check our platform registries. If you'd like to reach out directly to our human logistics admins, feel free to click the 'Request Human Representative' button above!";
      }
    } else if (ticketStatus === 'PENDING_ADMIN') {
      aiResponseText = "Your ticket is in our priority administrative queue. A human representative will read and respond to your complaint shortly.";
    } else {
      // Offline fallback simple logic if no Gemini API Key is available
      const lowercaseContent = content.toLowerCase();
      if (lowercaseContent.includes('human') || lowercaseContent.includes('admin') || lowercaseContent.includes('help') || lowercaseContent.includes('stuck')) {
        shouldEscalate = true;
        aiResponseText = "I understand you need immediate human assistance. I am flagging this complaint ticket for our direct admin team. They will reply directly here. Thank you for your patience!";
      } else {
        aiResponseText = "Thank you for sharing your complaint. I have logged this info. Our automated system is checking for resolution. If this is urgent, please request a human agent using the action button!";
      }
    }

    // C. Write Bot Reply & update ticket status
    if (shouldEscalate) {
      ticketStatus = 'PENDING_ADMIN';
    }

    if (prisma) {
      await prisma.supportMessage.create({
        data: {
          ticketId,
          sender: 'AI_BOT',
          senderName: 'TransConet AI',
          content: aiResponseText,
        },
      });

      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: ticketStatus,
          updatedAt: new Date(),
        },
      });

      const finalTicket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      emitToTicket(ticketId, 'support_ticket_updated', finalTicket);
      return res.status(200).json({ success: true, ticket: finalTicket });
    }

    return res.status(404).json({ error: 'Ticket context lost during transaction.' });
  } catch (error: any) {
    console.error('Add support message error:', error);
    return res.status(500).json({ error: 'Failed to process message transaction.' });
  }
};

// 3. User manually escalates ticket to ADMIN
export const escalateTicketToAdmin = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required for escalation.' });
    }

    if (prisma) {
      await prisma.supportMessage.create({
        data: {
          ticketId,
          sender: 'AI_BOT',
          senderName: 'TransConet AI',
          content: '🚨 Support request escalated to high-priority. Connecting you to a TransConet Admin...',
        },
      });

      const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: 'PENDING_ADMIN',
          updatedAt: new Date(),
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      return res.status(200).json({ success: true, ticket });
    }

    throw new Error('Database is unconfigured or offline.');
  } catch (error: any) {
    console.error('Manual escalation failure:', error);
    return res.status(500).json({ error: 'Failed to escalate ticket.' });
  }
};

// 4. Admin reads all tickets in the queue
export const getAdminTicketsQueue = async (req: Request, res: Response) => {
  try {
    if (prisma) {
      const tickets = await prisma.supportTicket.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
      return res.status(200).json({ success: true, tickets });
    }
    
    throw new Error('Database is offline');
  } catch (error: any) {
    console.error('Failed to get admin support queue:', error);
    return res.status(500).json({ error: 'Failed to query admin support channels.' });
  }
};

// 5. Admin replies to a ticket
export const adminReplyToTicket = async (req: Request, res: Response) => {
  try {
    let { ticketId, content } = req.body;
    if (!ticketId || !content) {
      return res.status(400).json({ error: 'Ticket ID and response content are required.' });
    }
    content = sanitizeInput(content);

    if (prisma) {
      await prisma.supportMessage.create({
        data: {
          ticketId,
          sender: 'ADMIN',
          senderName: 'Support Officer',
          content,
        },
      });

      const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: 'PENDING_ADMIN', // Keep open but marked with admin involvement
          updatedAt: new Date(),
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      return res.status(200).json({ success: true, ticket });
    }

    throw new Error('Database is offline');
  } catch (error: any) {
    console.error('Admin reply transaction failed:', error);
    return res.status(500).json({ error: 'Failed to process admin reply.' });
  }
};

// 6. Close/Resolve ticket (Admin action)
export const resolveTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId, status = 'CLOSED' } = req.body;
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required to update status.' });
    }

    if (prisma) {
      await prisma.supportMessage.create({
        data: {
          ticketId,
          sender: 'AI_BOT',
          senderName: 'TransConet AI',
          content: `This support conversation has been marked as ${status.toLowerCase()} by an administrator. You can open a new complain request anytime if you face further issues.`,
        },
      });

      const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      return res.status(200).json({ success: true, ticket });
    }

    throw new Error('Database offline');
  } catch (error: any) {
    console.error('Resolve ticket error:', error);
    return res.status(500).json({ error: 'Failed to complete status transaction.' });
  }
};
