const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/controllers/admin/adminAuthController.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(`    if (!admin && (email === 'yusufjimoh969@gmail.com' || email === 'admin@transconet.ng' || email === 'admin@transportconnect.ng')) {
      const pwd = await bcrypt.hash(password, 10);
      admin = await prisma.adminUser.create({ data: { email, passwordHash: pwd, role: 'SUPER_ADMIN', isActive: true } });
    } });
    }`, `    if (!admin && (email === 'yusufjimoh969@gmail.com' || email === 'admin@transconet.ng' || email === 'admin@transportconnect.ng')) {
      const pwd = await bcrypt.hash(password, 10);
      admin = await prisma.adminUser.create({ data: { email, passwordHash: pwd, role: 'SUPER_ADMIN', isActive: true } });
    }`);

fs.writeFileSync(file, content);
console.log('Patched');
