const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.setItem('onboarded', 'true'));
  await page.reload();
  await page.waitForTimeout(4000);
  
  const content = await page.content();
  console.log("PAGE CONTENT:");
  const errMatch = content.match(/text-red-300[^>]*>([^<]+)<\/div>/);
  if (errMatch) {
    console.log("EXTRACTED ERROR FROM BOUNDARY:", errMatch[1]);
  } else {
    console.log("No error found in boundary, check if LoginGateway loaded:", await page.innerHTML('body'));
  }
  
  await browser.close();
})();
