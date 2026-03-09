const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // also capture unhandled rejections
    page.evaluateOnNewDocument(() => {
        window.addEventListener('unhandledrejection', event => {
            console.log('UNHANDLED REJECTION:', event.reason);
        });
    });

    try {
        await page.goto('http://localhost:5173/events', { waitUntil: 'networkidle0', timeout: 10000 });
    } catch (e) {
        console.log('Error navigating:', e.message);
    }

    await browser.close();
})();
