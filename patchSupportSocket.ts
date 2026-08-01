import fs from 'fs';
let content = fs.readFileSync('src/controllers/supportController.ts', 'utf-8');

// Insert import if missing
if (!content.includes('import { getIO } from')) {
  content = "import { getIO } from '../socket';\n" + content;
}

// Function to emit socket event
const emitToTicket = (ticketId: string, event: string, data: any) => {
  try {
    getIO().to(`chat_${ticketId}`).emit(event, data);
  } catch(e) {}
};

// Insert it as a helper function
content = content.replace("export const addSupportMessage", `const emitToTicket = (ticketId: string, event: string, data: any) => {
  try {
    getIO().to(\`chat_\${ticketId}\`).emit(event, data);
  } catch(e) { console.error('Socket emit failed:', e.message); }
};

export const addSupportMessage`);

// In addSupportMessage, when saving a message, emit new_message
content = content.replace(
  `const userMsg = await prisma.supportMessage.create({`,
  `const userMsg = await prisma.supportMessage.create({`
);

content = content.replace(
  `        const finalTicket = await prisma.supportTicket.findUnique({`,
  `        
        const finalTicket = await prisma.supportTicket.findUnique({`
);

content = content.replace(
  "return res.status(200).json({ success: true, ticket: finalTicket });",
  "emitToTicket(ticketId, 'support_ticket_updated', finalTicket);\n        return res.status(200).json({ success: true, ticket: finalTicket });"
);

content = content.replace(
  "return res.status(200).json({ success: true, ticket: memTicket });",
  "emitToTicket(ticketId, 'support_ticket_updated', memTicket);\n      return res.status(200).json({ success: true, ticket: memTicket });"
);

content = content.replace(
  "return res.status(200).json({ success: true, ticket });",
  "emitToTicket(ticketId, 'support_ticket_updated', ticket);\n        return res.status(200).json({ success: true, ticket });"
);

fs.writeFileSync('src/controllers/supportController.ts', content);
