import fs from 'fs';
let content = fs.readFileSync('src/components/SupportChatWidget.tsx', 'utf-8');

const hookFix = `  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isOpen && ticket?.id) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        withCredentials: true
      });
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('join_chat', ticket.id);
      });
      
      newSocket.on('support_ticket_updated', (updatedTicket: any) => {
        // Fetch full ticket or append new messages
        api.get(\`/api/support/\${ticket.id}\`)
           .then(res => setTicket(res.data))
           .catch(console.error);
      });
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, ticket?.id]);
`;

// wait, the previous code had `activeTicketId`. Let's remove the previous code.
content = content.replace(/const \[socket, setSocket\][\s\S]*?\}, \[isOpen, activeTicketId\]\);\n/m, hookFix);

fs.writeFileSync('src/components/SupportChatWidget.tsx', content);
console.log("Patched SupportChatWidget again");
