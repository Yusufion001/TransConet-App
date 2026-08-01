const fs = require('fs');
let code = fs.readFileSync('src/components/AdminVerificationCenter.tsx', 'utf8');

code = code.replace(/setRequests\(prev => prev\.map\(req => req\.id === id \? \{ \.\.\.req, status: 'APPROVED' \} : req\)\);/g, "mutate(prev => prev ? prev.map(req => req.id === id ? { ...req, status: 'APPROVED' as const } : req) : []);");
code = code.replace(/setRequests\(prev => prev\.map\(req => req\.id === id \? \{ \.\.\.req, status: 'REJECTED' \} : req\)\);/g, "mutate(prev => prev ? prev.map(req => req.id === id ? { ...req, status: 'REJECTED' as const } : req) : []);");

fs.writeFileSync('src/components/AdminVerificationCenter.tsx', code);
