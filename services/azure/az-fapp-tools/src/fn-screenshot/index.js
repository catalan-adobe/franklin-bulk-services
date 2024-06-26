import * as frkBulk from 'franklin-bulk-shared';
import { parseCookies } from '../lib/http/request.js';

const DEFAULT_INPUT_PARAMETERS = {
    url:            "https://google.com/",
    width:          1280,
    adBlocker:      true,
    gdprBlocker:    true,
    delay:          0,
    jsToInject:     null,
};

export async function main(context, req) {

    context.log("Request: ", req);

    const options = {
        ...DEFAULT_INPUT_PARAMETERS,
        ...req.body,
    };

    context.log('options', options);

    if (req.method === 'GET') {
        context.res = {
            body: USAGE_MESSAGE,
            headers: {
                "content-type": "text/plain",
            }
        };
        context.done();
        return new Promise(() => {}).resolve();
    }

    let browser;
    let page;
    let screenshotBuffer;

    try {
        [browser, page] = await frkBulk.Puppeteer.initBrowser({
            width: options.width,
            adBlocker: options.adBlocker,
            gdprBlocker: options.gdprBlocker,
            headless: true,
        });

        if (Object.keys(req.headers).includes('x-set-cookie')) {
            const cookies = parseCookies(options.url, req.headers['x-set-cookie']);
            console.log('cookies', cookies);
            await page.setCookie(...cookies);
        }

        await page.goto(options.url, { waitUntil: 'networkidle2' });
        
        if (options.delay > 0) {
            await frkBulk.Time.sleep(options.delay);
        }
        
        if (options.jsToInject) {
            try {
                let navigationTriggered = false;
                await page.setRequestInterception(true);
                page.on('request', (interceptedRequest) => {
                    if (!interceptedRequest.isInterceptResolutionHandled()) {
                        if (interceptedRequest.isNavigationRequest()) {
                            context.log(interceptedRequest);
                            navigationTriggered = true;
                        }
                        interceptedRequest.continue();
                    }
                });

                const js = decodeURIComponent(options.jsToInject);
                await page.evaluate(js);
                await frkBulk.Time.sleep(500);
                if (navigationTriggered) {
                    await page.waitForNavigation({ waitUntil: 'networkidle2' });
                }
            } catch (e) {
                context.log.error(e);
            }
        }
        
        await frkBulk.Puppeteer.smartScroll(page, { postReset: true });

        // pacing down after scrolling
        await frkBulk.Time.sleep(2500);

        // page height in browser 
        const pageHeight = await page.evaluate(() =>  window.document.body.offsetHeight || window.document.body.scrollHeight);

        console.log('pageHeight', pageHeight);

        const screenshotOptions = {
            fullPage: true,
        };

        if (pageHeight > 800) {
            screenshotOptions.fullPage = false;
            screenshotOptions.clip = {
                x: 0,
                y: 0,
                width: options.width,
                height: pageHeight,
            };
        }

        screenshotBuffer = await page.screenshot(screenshotOptions);

        context.log(`All done. ✨`);

        context.res = {
            body: screenshotBuffer,
            headers: {
                "content-type": "image/png"
            }
        };      
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

const USAGE_MESSAGE = `
Takes a screenshot of a webpage

Method: POST

JSON Input Body:

    {
        url:            "<url>",    // required
        width:          <width>,    // the viewport width of the browser (in pixels)
                                    // default: 1280
        adBlocker:      true|false, // enable ad blocker plugin
                                    // default: true
        gdprBlocker:    true|false, // enable gdpr blocker plugin
                                    // default: true
        delay:          <delay>,    // forced waiting time after page load (in ms.)
                                    // default: 0 (no delay)
        jsToInject:     "<js_code>",     // javascript code injected before taking the screenshot
                                    // default: null
    }

    Example

    {
        "url":            "https://business.adobe.com",
        "width":          1280,
        "adBlocker":      true,
        "gdprBlocker":    true,
        "jsToInject":     "document.querySelector('.dialog-modal .dialog-close')?.click();"
    }
`;