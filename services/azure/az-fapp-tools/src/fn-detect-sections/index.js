import * as frkBulk from 'franklin-bulk-shared';
import fs from 'fs';


const ADOBE_DETECT_LIB_PATH = './lib/vendors/adobe-detects.min.js'
const PAGE_WIDTH = 1280;

const DEFAULT_INPUT_PARAMETERS = {
    url:            'https://google.com/',
    width:          PAGE_WIDTH,
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
            width: options.width,
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
        // pacing delay for possible CLS
        await frkBulk.Time.sleep(1000);

        // page height in browser 
        const pageHeight = await page.evaluate(() => window.document.body.offsetHeight || window.document.body.scrollHeight);
        console.log('pageHeight', pageHeight);

        // detect sections
        await page.evaluate(async () => await window.xp.detectSections(document.body, window));

        const boxes = await page.evaluate(() => {
            function cleanupBox(box) {
                delete box.div;
                if (box.children && box.children.length > 0) {
                    box.children.forEach(cleanupBox);
                }
            }
            if (window.xp.boxes) {
                cleanupBox(window.xp.boxes);
            }
            return window.xp.boxes || [];
        });

        // get template
        const template = await page.evaluate(() => window.xp.template || null);
        
        const responseBody = {
            boxes,
            template,
            pageHeight,
        };

        if (options.screenshot) {
            await page.setViewport({
                width: options.width,
                height: pageHeight,
                deviceScaleFactor: 1,
            });
            responseBody.screenshot = await page.screenshot({
                fullPage: true,
                type: 'png',
                encoding: 'base64',
            });
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
