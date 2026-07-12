const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR);
}

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const takeScreenshot = async (name) => {
    console.log(`Taking screenshot: ${name}`);
    await page.waitForTimeout(1500); // Wait for data to load and animations to finish
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`) });
  };

  const navigateTo = async (href) => {
    // Click the sidebar link matching the href
    await page.click(`aside nav a[href="${href}"]`);
    await page.waitForTimeout(500);
  };

  try {
    // 1. Login Page
    console.log('Navigating to login...');
    await page.goto(`${BASE_URL}/login`);
    await takeScreenshot('01-login');

    // === MANAGER ===
    console.log('Logging in as Manager...');
    await page.fill('input[type="email"]', 'manager@gmail.com');
    await page.fill('input[type="password"]', 'manager123');
    await page.click('button[type="submit"]');

    await page.waitForSelector('aside', { timeout: 15000 });
    
    console.log('Capturing Dashboard...');
    await takeScreenshot('02-dashboard');

    console.log('Navigating to Fleet...');
    await navigateTo('/fleet');
    await takeScreenshot('03-fleet');

    console.log('Navigating to Drivers...');
    await navigateTo('/drivers');
    await takeScreenshot('04-drivers');

    console.log('Navigating to Maintenance...');
    await navigateTo('/maintenance');
    await takeScreenshot('06-maintenance');

    // Logout
    console.log('Logging out Manager...');
    await page.click('aside > div.mt-auto > div'); // Click logout block
    await page.waitForSelector('input[type="email"]');

    // === DISPATCHER ===
    console.log('Logging in as Dispatcher...');
    await page.fill('input[type="email"]', 'dispatcher@gmail.com');
    await page.fill('input[type="password"]', 'dispatcher123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('aside');

    console.log('Navigating to Trips...');
    await navigateTo('/trips');
    await takeScreenshot('05-trips');

    // Logout
    console.log('Logging out Dispatcher...');
    await page.click('aside > div.mt-auto > div');
    await page.waitForSelector('input[type="email"]');

    // === ANALYST ===
    console.log('Logging in as Analyst...');
    await page.fill('input[type="email"]', 'analyst@gmail.com');
    await page.fill('input[type="password"]', 'analyst123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('aside');

    console.log('Navigating to Fuel & Expenses...');
    await navigateTo('/fuel');
    await takeScreenshot('07-fuel');

    console.log('Navigating to Analytics...');
    await navigateTo('/analytics');
    await takeScreenshot('08-analytics');

    console.log('All screenshots captured successfully!');
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
})();
