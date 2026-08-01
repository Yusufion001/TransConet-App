import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  const skipButton = page.locator('button:has-text("Skip")').first();
  if (await skipButton.isVisible({ timeout: 10000 })) {
     await skipButton.click();
  }
  
  const getStartedButton = page.locator('text=Get Started').first();
  if (await getStartedButton.isVisible({ timeout: 5000 })) {
     await getStartedButton.click();
  }
  
  const signInButton = page.locator('text=Sign In').first();
  if (await signInButton.isVisible({ timeout: 5000 })) {
    await signInButton.click();
  }
  
  await page.waitForTimeout(1000);
  
  const phoneInput = page.locator('input[type="tel"]').first();
  if (await phoneInput.isVisible({ timeout: 10000 })) {
    await phoneInput.fill('+2348000000001');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  }

  await page.waitForTimeout(3000);

  const marketplaceBtn = page.locator('text=Find Transport').first(); 
  if (await marketplaceBtn.isVisible()) {
     await marketplaceBtn.click();
  } else {
      const networkBtn = page.locator('text=Marketplace').first();
      if(await networkBtn.isVisible()) {
          await networkBtn.click();
      }
  }
  
  await page.waitForTimeout(3000);
  
  console.log(await page.content());
  
  await browser.close();
})();
