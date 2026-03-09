const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // 1. Launch browser
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        // 2. Load the App
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

        // 3. Login as Admin
        await page.waitForSelector('input[type="email"]', { visible: true });
        await page.type('input[type="email"]', 'admin_1@glop.fr');
        await page.type('input[type="password"]', 'password');
        await page.click('button[type="submit"]');

        // Wait for dashboard to load
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // 4. Navigate to Map
        await page.goto('http://localhost:5173/map', { waitUntil: 'networkidle2' });

        // Wait for Map and WebSocket rendering
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 5. Take screenshot
        await page.screenshot({ path: 'map_admin_view.png', fullPage: true });
        console.log("Successfully captured Map screenshot as admin.");

    } catch (err) {
        console.error("Puppeteer Error:", err);
    } finally {
        await browser.close();
    }
})();
