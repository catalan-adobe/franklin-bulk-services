import * as frkBulk from 'franklin-bulk-shared';
import fs from 'fs';


const ADOBE_DETECT_LIB_PATH = './lib/vendors/adobe-detects.min.js'

const DEFAULT_INPUT_PARAMETERS = {
    url:            'https://google.com/',
    width:          1280,
    adBlocker:      true,
    gdprBlocker:    true,
    delay:          0,
    jsToInject:     null,
    screenshot:     false,
};

async function syncJSCodeInBrowser(page) {
    try {
        const js = fs.readFileSync(ADOBE_DETECT_LIB_PATH, 'utf8');
        await page.evaluateOnNewDocument(js);
        await page.reload({ waitUntil: 'networkidle2'});
    } catch (e) {
        console.error(e);
    }
}

export async function main(context, req) {

    const options = {
        ...DEFAULT_INPUT_PARAMETERS,
        ...req.query,
    };

    context.log('options', options);

    let browser;
    let page;

    try {
        [browser, page] = await frkBulk.Puppeteer.initBrowser({
            width: 1280,
            adBlocker: true,
            gdprBlocker: true,
            headless: true,
        });

        page.once('load', async () => {
            const url = await page.url();
            console.log('Page loaded: ' + url);
            console.log('injecting detection library ...');
            await syncJSCodeInBrowser(page);
        });
        
        await page.goto(options.url, { waitUntil: 'networkidle2' });
        
        // if set, delay before any action
        if (options.delay > 0) {
            await frkBulk.Time.sleep(options.delay);
        }
        
        // force scroll the page to trigger potential lazy loading
        await frkBulk.Puppeteer.smartScroll(page, { postReset: true });

        // page height in browser 
        const pageHeight = await page.evaluate(() => window.document.body.offsetHeight || window.document.body.scrollHeight);
        console.log('pageHeight', pageHeight);

        // detect sections
        await page.evaluate(() => window.xp.detectSections(document.body, window));
        const boxes = await page.evaluate(() =>  window.xp.boxes);

        // get template
        const template = await page.evaluate(() => window.xp.template || null);
        
        const responseBody = {
            boxes,
            template,
            pageHeight,
        };
        
        if (options.screenshot) {
            responseBody.screenshot = await page.screenshot({ fullPage: true, type: 'png', encoding: 'base64' });
        }
        context.res = {
            body: responseBody,
            headers: {
                "content-type": "application/json"
            }
        };      

        context.log(`All done. ✨`);
    } catch(e) {
        context.log.error(e);
        context.res = {
            body: e,
        };
    } finally {
        if (browser) {
            context.log.info("Closing browser..");
            await browser.close();
        }
    }
};
