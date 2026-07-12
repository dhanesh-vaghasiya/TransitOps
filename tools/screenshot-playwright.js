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

    // Perform Login
    console.log('Logging in...');
    await page.fill('input[type="email"]', 'manager@gmail.com');
    await page.fill('input[type="password"]', 'manager123');
    await page.click('button[type="submit"]');

    // Wait for Dashboard to load
    await page.waitForSelector('aside', { timeout: 15000 });
    
    // 2. Dashboard
    console.log('Capturing Dashboard...');
    await takeScreenshot('02-dashboard');

    // 3. Fleet
    console.log('Navigating to Fleet...');
    await navigateTo('/fleet');
    await takeScreenshot('03-fleet');

    // 4. Drivers
    console.log('Navigating to Drivers...');
    await navigateTo('/drivers');
    await takeScreenshot('04-drivers');

    // 5. Trips
    console.log('Navigating to Trips...');
    await navigateTo('/trips');
    await takeScreenshot('05-trips');

    // 6. Maintenance
    console.log('Navigating to Maintenance...');
    await navigateTo('/maintenance');
    await takeScreenshot('06-maintenance');

    // 7. Fuel
    console.log('Navigating to Fuel & Expenses...');
    await navigateTo('/fuel');
    await takeScreenshot('07-fuel');

    // 8. Analytics
    console.log('Navigating to Analytics...');
    await navigateTo('/analytics');
    await takeScreenshot('08-analytics');

    // (Settings removed as requested)

    console.log('All screenshots captured successfully!');
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
})();
