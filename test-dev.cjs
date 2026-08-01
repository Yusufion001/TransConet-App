const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(3000); // wait for render

  const errorText = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:", errorText.substring(0, 500));

  await browser.close();
  process.exit(0);
})();
