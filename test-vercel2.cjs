const { chromium } = require('playwright');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));

const server = app.listen(3004, async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  await context.addInitScript(() => {
     localStorage.setItem('onboarded', 'true');
     localStorage.setItem('auth-storage', JSON.stringify({
       state: {
         isAuthenticated: true,
         token: 'dummy',
         userPhone: '1234567890',
         userEmail: 'test@example.com',
         activeRole: 'CUSTOMER',
         isOnboarded: true
       },
       version: 0
     }));
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message || err));
  
  // Inject error boundary listener
  await page.exposeFunction('logErrorToNode', (msg) => {
    console.log('REACT ERROR:', msg);
  });

  await page.goto('http://localhost:3004/');
  await page.waitForTimeout(3000); // wait for render

  const errorText = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:", errorText.substring(0, 1000));

  await browser.close();
  server.close();
  process.exit(0);
});
