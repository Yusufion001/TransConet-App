import fs from 'fs';
let content = fs.readFileSync('src/components/SupportChatWidget.tsx', 'utf-8');

if (!content.includes("import { io, Socket } from 'socket.io-client';")) {
  content = "import { io, Socket } from 'socket.io-client';\n" + content;
}

const socketHookCode = `  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isOpen && activeTicketId) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        withCredentials: true
      });
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('join_chat', activeTicketId);
      });
      
      newSocket.on('support_ticket_updated', (updatedTicket: any) => {
        // Fetch full ticket or append new messages
        api.get(\`/api/support/\${activeTicketId}\`)
           .then(res => setMessages(res.data.messages || []))
           .catch(console.error);
      });
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, activeTicketId]);
`;

// Insert it inside the component right before the first useEffect
if (!content.includes('const [socket, setSocket]')) {
  content = content.replace("  useEffect(() => {", socketHookCode + "\n  useEffect(() => {");
  fs.writeFileSync('src/components/SupportChatWidget.tsx', content);
  console.log('Patched SupportChatWidget with WebSockets');
}
