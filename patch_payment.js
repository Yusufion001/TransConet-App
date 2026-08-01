const fs = require('fs');
const file = 'src/controllers/paymentController.ts';
let code = fs.readFileSync(file, 'utf8');

const replacement = `    if (prisma) {
      const load = await prisma.loadPosting.findUnique({ where: { id: loadId } });
      if (!load) {
        return res.status(404).json({ error: 'Load not found.' });
      }
      
      if (load.paymentStatus === 'PAID_TO_TRANSPORTER' || load.paymentStatus === 'RELEASED') {
          return res.status(200).json({
            success: true,
            loadId,
            status: 'PAID_TO_TRANSPORTER',
            message: 'Escrow funds were already released to the Transporter wallet.'
          });
      }

      if (load.customerId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Unauthorized. Only the owner can release escrow.' });
      }`;

code = code.replace(`    if (prisma) {
      const load = await prisma.loadPosting.findUnique({ where: { id: loadId } });
      if (!load) {
        return res.status(404).json({ error: 'Load not found.' });
      }
      
      if (load.customerId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Unauthorized. Only the owner can release escrow.' });
      }`, replacement);

fs.writeFileSync(file, code);
console.log('Patched');
