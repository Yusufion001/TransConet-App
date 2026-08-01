const { chromium } = require('playwright');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'dist/client')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/client/index.html')));

const server = app.listen(3002, async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message || err));

  await page.goto('http://localhost:3002/');
  await page.waitForTimeout(3000); // wait for render

  const errorText = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:", errorText.substring(0, 1000));

  await browser.close();
  server.close();
  process.exit(0);
});
