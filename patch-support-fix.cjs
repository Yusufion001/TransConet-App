const fs = require('fs');
let code = fs.readFileSync('src/components/AdminSupportCare.tsx', 'utf8');

code = code.replace(/setTickets\(prev => prev\.map\(t => t\.id === updatedTicket\.id \? updatedTicket : t\)\);/g, 'mutate(prev => prev ? prev.map(t => t.id === updatedTicket.id ? updatedTicket : t) : []);');
code = code.replace(/setSelectedTicket\(updatedTicket\);/g, 'setSelectedTicketId(updatedTicket.id);');

fs.writeFileSync('src/components/AdminSupportCare.tsx', code);
