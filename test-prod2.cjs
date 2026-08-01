const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  await context.addInitScript(() => {
     localStorage.setItem('auth-storage', JSON.stringify({
       state: {
         isAuthenticated: true,
         token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiU0hJUFBFUiIsImV4cCI6OTk5OTk5OTk5OX0.dummy',
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
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(3000); // wait for render

  const errorText = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:", errorText.substring(0, 1000));

  await browser.close();
  process.exit(0);
})();
