const { chromium } = require('playwright');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));

const server = app.listen(3003, async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message || err));
  
  // Inject error boundary listener
  await page.exposeFunction('logErrorToNode', (msg) => {
    console.log('REACT ERROR:', msg);
  });

  await page.goto('http://localhost:3003/');
  await page.waitForTimeout(3000); // wait for render

  const errorText = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:", errorText.substring(0, 1000));

  await browser.close();
  server.close();
  process.exit(0);
});
