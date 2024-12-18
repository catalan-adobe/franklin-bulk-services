import * as frkBulk from 'franklin-bulk-shared';
import fs from 'fs';
import path from 'path';
import { generateDocumentPath } from '../lib/franklin.js';


const ADOBE_DETECT_LIB_PATH = './lib/vendors/adobe-detects.min.js'
const PAGE_WIDTH = 1280;

const DETECTED_SECTIONS_BLOCKS_MAPPING = {
    unknown: 'defaultContent',
    'default-content': 'defaultContent',
    carousel: 'defaultContent',
    hero: 'hero',
    columns: 'columns',
    header: 'header',
    footer: 'footer',
    cards: 'cards',
};

const DEFAULT_INPUT_PARAMETERS = {
    width:          PAGE_WIDTH,
    disableJS:      false,
    adBlocker:      true,
    gdprBlocker:    true,
    delay:          0,
    screenshot:     false,
};

function returnError(context, status = 400, message) {
    context.res = {
        status,
        headers: {
            'x-error': message,
        },
        body: message,
    };
    return;
}

export async function main(context, req) {
    // validate input url
    let url = req.body?.url;
    let uObj = null;

    if (!url) {
        return returnError(context, 400, "url body parameter is required");
    }

    try {
        uObj = new URL(url);
    } catch (e) {
        return returnError(context, 400, `Invalid url: ${url}`);
    }

    const options = {
        ...DEFAULT_INPUT_PARAMETERS,
        ...req.body?.options,
    };

    context.log('options', options);

    let browser;
    let page;

    try {
        [browser, page] = await frkBulk.Puppeteer.initBrowser({
            width: options.width,
            adBlocker: true,
            gdprBlocker: true,
            useLocalChrome: false,
            headless: true,
            devTools: false,
        });

        if (options.disableJS) {
            await page.setJavaScriptEnabled(false);
        }

        await page.goto(url, { waitUntil: 'networkidle2' });

        // if set, delay before any action
        if (options.delay > 0) {
            await frkBulk.Time.sleep(options.delay);
        }

        // pacing delay
        await frkBulk.Time.sleep(1000);
        // force scroll the page to trigger potential lazy loading
        await frkBulk.Puppeteer.smartScroll(page, { postReset: true });
        // pacing delay for possible CLS
        await frkBulk.Time.sleep(1000);

        // page height in browser 
        const pageHeight = await page.evaluate(() => window.document.body.offsetHeight || window.document.body.scrollHeight);
        console.log('pageHeight', pageHeight);

        // load detection library
        await page.setJavaScriptEnabled(true);
        const js = fs.readFileSync(ADOBE_DETECT_LIB_PATH, 'utf8');
        await page.evaluate(js);

        // detect sections
        const sections = await page.evaluate(async () => {
            await window.xp.detectSections(
                document.body,
                window,
                { autoDetect: true },
            );


            const predictions = window.xp.boxes.predictedBoxes;

            // cleanup boxes, remove div property in every box and all children
            const clean = (b) => {
                delete b.div;
                if (b.children) {
                    b.children.forEach(clean);
                }
            };
            return predictions.map((b) => {
                clean(b);
                return b;
            });
        });

        console.log('sections', sections);

        // await frkBulk.Time.sleep(100000);

        // get template
        const template = await page.evaluate(() => window.xp.template || null);

        // get eds page path from url
        const edsPath = generateDocumentPath({ url });

        function parseSection(b) {
            const m = DETECTED_SECTIONS_BLOCKS_MAPPING[b.prediction.sectionType] || 'unset'
            return {
                id: b.id,
                color: 'rgba(0, 255, 0, 1)',
                width: b.width,
                height: b.height,
                xpath: b.xpath,
                childrenXpaths: (b.layout.numCols > 1 || b.layout.numRows > 1)
                ? b.children.map((child) => ({
                    xpath: child.xpath,
                    xpathWithDetails: child.xpathWithDetails,
                })) : null,
                layout: b.layout,
                x: b.x,
                y: b.y,
                mapping: m,
                customBlockName: `ai${m}`,
            };
        }
        
        // parse headers and footers
        const header = sections.shift();
        const headerBoxes = [header];

        const footer = sections.pop();
        const footerBoxes = footer.layout.numRows > 1 ? footer.children : [footer];

        const mainBoxes = sections;
        
        const responseBody = {
            url: url,
            browserOptions: options,
            autoDetect: true,
            template,
            pageHeight,
            mapping: [
                {
                    id: 1,
                    path: '/nav',
                    sections: [
                        {
                            id: '1-1',
                            blocks: headerBoxes.map(parseSection),
                        }
                    ],
                },
                {
                    id: 2,
                    path: edsPath,
                    sections: [
                        {
                            id: '2-1',
                            blocks: mainBoxes.map(parseSection),
                        }
                    ],
                },
                {
                    id: 3,
                    path: '/footer',
                    sections: [
                        {
                            id: '3-1',
                            blocks: footerBoxes.map(parseSection),
                        }
                    ],
                },
            ],
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
        return returnError(context, 500, e.cause || e.message);
    } finally {
        context.log.info("Cleaning up ...");
        if (browser) {
            context.log.info("Closing browser..");
            await browser.close();
        }
    }
};
