const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const server = spawn('node', ['dist/server.cjs'], {
  env: { ...process.env, NODE_ENV: 'production', PORT: '3001' },
  stdio: 'inherit'
});

setTimeout(async () => {
  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await page.goto('http://localhost:3001/');
  await page.waitForTimeout(3000); // wait for render

  const errorText = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:", errorText.substring(0, 1000));

  await browser.close();
  server.kill('SIGTERM');
  process.exit(0);
}, 5000);
