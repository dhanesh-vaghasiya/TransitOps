const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PORT = 5173; // Vite default, fallback to 3000 if needed
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR);
}

const takeScreenshot = async (page, name) => {
  console.log(`Taking screenshot: ${name}`);
  // wait a bit for animations to settle
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: false });
};

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  
  try {
    // 1. Login Page
    console.log('Navigating to login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 60000 });
    await takeScreenshot(page, '01-login');

    // Perform Login
    console.log('Logging in...');
    await page.type('input[type="email"]', 'manager@gmail.com');
    await page.type('input[type="password"]', 'manager123');
    
    // Attempt to submit form
    await page.evaluate(() => {
      document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      // OR click the button if it's there
      const btn = document.querySelector('button[type="submit"]') || document.querySelector('button');
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
    
    // Ensure we are logged in by waiting for sidebar
    await page.waitForSelector('aside', { timeout: 10000 });
    
    // 2. Dashboard
    console.log('Navigating to Dashboard...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '02-dashboard');

    // 3. Fleet
    console.log('Navigating to Fleet...');
    await page.goto(`${BASE_URL}/fleet`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '03-fleet');

    // 4. Drivers
    console.log('Navigating to Drivers...');
    await page.goto(`${BASE_URL}/drivers`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '04-drivers');

    // 5. Trips (Fleet Manager doesn't have Trips access in seed.js default, but let's try)
    console.log('Navigating to Trips...');
    await page.goto(`${BASE_URL}/trips`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '05-trips');

    // 6. Maintenance
    console.log('Navigating to Maintenance...');
    await page.goto(`${BASE_URL}/maintenance`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '06-maintenance');

    // 7. Fuel
    console.log('Navigating to Fuel & Expenses...');
    await page.goto(`${BASE_URL}/fuel`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '07-fuel');

    // 8. Analytics
    console.log('Navigating to Analytics...');
    await page.goto(`${BASE_URL}/analytics`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '08-analytics');

    // 9. Settings
    console.log('Navigating to Settings...');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '09-settings');

    console.log('All screenshots captured successfully!');
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
})();
