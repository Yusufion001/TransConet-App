const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

code = code.replace(
  "import paymentRoutes from './routes/paymentRoutes';",
  "import paymentRoutes from './routes/paymentRoutes';\nimport aiOptimizationRoutes from './routes/aiOptimizationRoutes';"
);

code = code.replace(
  "app.use('/api/payments', paymentRoutes);",
  "app.use('/api/payments', paymentRoutes);\n  app.use('/api/ai', aiOptimizationRoutes);"
);

fs.writeFileSync('src/server.ts', code);
console.log('Patched server.ts with aiOptimizationRoutes');
