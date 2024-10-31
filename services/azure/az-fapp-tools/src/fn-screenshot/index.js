import fs from 'fs';
import os from 'os';
// import path from 'path';
import * as frkBulk from 'franklin-bulk-shared';
import { parseCookies } from '../lib/http/request.js';
// import puppeteer from 'puppeteer';

const DEFAULT_INPUT_PARAMETERS = {
    url:            "https://google.com/",
    width:          1280,
    adBlocker:      true,
    gdprBlocker:    true,
    delay:          0,
    jsToInject:     null,
};

export async function main(context, req) {

    context.log(import.meta.dirname); 
    await new Promise(resolve => setTimeout(resolve, 1000));

    context.log(os.homedir()); 
    context.log(fs.existsSync('/home/site/wwwroot/.cache/puppeteer/chrome/linux-130.0.6723.69/chrome-linux64'));
    await new Promise(resolve => setTimeout(resolve, 1000));

    context.log("context: ", context);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const options = {
        ...DEFAULT_INPUT_PARAMETERS,
        ...req.body,
    };

    context.log('options', options);
    await new Promise(resolve => setTimeout(resolve, 1000));

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
                
        // const browser = await puppeteer.launch({
        //     headless: true,
        //     args: [
        //         '--no-sandbox',
        //         '--disable-setuid-sandbox'
        //     ],
        //     // cacheDirectory: path.join(import.meta.dirname, '../.cache/puppeteer'),
        // });

        // const page = await browser.newPage();        

        [browser, page] = await frkBulk.Puppeteer.initBrowser({
            width: 1200,
            adBlocker: options.adBlocker,
            gdprBlocker: options.gdprBlocker,
            headless: true,
            useLocalChrome: false,
            // executablePath: puppeteer.executablePath(),
        });

        if (Object.keys(req.headers).includes('x-set-cookie')) {
            const cookies = parseCookies(options.url, req.headers['x-set-cookie']);
            console.log('cookies', cookies);
            await page.setCookie(...cookies);
        }

        await page.setViewport({ width: options.width, height: 1000 });

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
        const pageHeight = await page.evaluate(() => window.document.body.scrollHeight || window.document.body.offsetHeight);

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