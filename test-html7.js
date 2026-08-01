import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  const continueBtn = page.locator('button:has-text("Continue")').first();
  const skipBtn = page.locator('button:has-text("Skip")').first();
  const getStartedBtn = page.locator('button:has-text("Get Started")').first();
  
  if (await continueBtn.isVisible({ timeout: 5000 })) {
     await continueBtn.click();
     await page.waitForTimeout(500);
     if (await continueBtn.isVisible()) await continueBtn.click();
     await page.waitForTimeout(500);
     if (await getStartedBtn.isVisible()) await getStartedBtn.click();
  } else if (await skipBtn.isVisible()) {
     await skipBtn.click();
  }
  
  await page.waitForTimeout(1000);
  
  const signInBtn = page.locator('span:has-text("Sign In")').locator('..');
  if (await signInBtn.isVisible({ timeout: 5000 })) {
      await signInBtn.click();
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
  
  await page.waitForTimeout(2000); 
  
  const transporterTabBtn = page.locator('text=Transporter').first();
  if (await transporterTabBtn.isVisible({ timeout: 3000 })) {
      await transporterTabBtn.click();
  }
  
  await page.waitForTimeout(1000);
  
  const originInput = page.locator('input[placeholder="Search pickup address..."]').first();
  if (await originInput.isVisible()) {
     await originInput.fill('Lagos');
     await page.waitForTimeout(500);
     const suggestion = page.locator('text=Lagos').first();
     if (await suggestion.isVisible()) {
         await suggestion.click();
     } else {
         await page.keyboard.press('Enter');
     }
  }
  
  const findMatchBtn = page.locator('button:has-text("Find Match")').first();
  if (await findMatchBtn.isVisible({ timeout: 3000 })) {
      await findMatchBtn.click();
  }
  
  await page.waitForTimeout(3000);
  
  console.log(await page.content());
  
  await browser.close();
})();
