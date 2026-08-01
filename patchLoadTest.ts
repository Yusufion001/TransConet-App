import fs from 'fs';
let content = fs.readFileSync('tests/loadController.test.ts', 'utf-8');

content = content.replace("create: vi.fn(),", "create: vi.fn().mockResolvedValue({ id: '1', title: 'Test Load', cargoType: 'AGRICULTURAL_GOODS', weightKg: 1000, origin: 'Lagos', destination: 'Abuja' }),");

fs.writeFileSync('tests/loadController.test.ts', content);
