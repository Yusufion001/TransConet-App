const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.goto('http://localhost:3000/admin/login');
  await page.waitForTimeout(1000);
  
  await page.fill('input[type="email"]', 'admin@transconet.ng');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(3000);
  
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);
  
  const content = await page.content();
  if (content.includes('Access Denied')) {
    console.log('Got Access Denied!');
  } else if (content.includes('Admin Portal')) {
    console.log('Got Admin Portal!');
  } else {
    console.log('Content snippet:', content.substring(content.indexOf('<body'), content.indexOf('<body') + 500));
  }
  
  await page.screenshot({ path: 'admin-login.png' });

  await browser.close();
})();
