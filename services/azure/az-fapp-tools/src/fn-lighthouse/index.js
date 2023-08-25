// import chromium from 'chromium';
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import { fullLists, PuppeteerBlocker } from '@cliqz/adblocker-puppeteer';
// import fetch from 'cross-fetch';

import * as frkBulk from 'franklin-bulk-shared';
import lighthouse from 'lighthouse';
import {default as desktopConfig} from 'lighthouse/core/config/lr-desktop-config.js';
import {default as mobileConfig} from 'lighthouse/core/config/lr-mobile-config.js';
import {lighthouseVersion} from 'lighthouse/root.js';
import fp from 'find-free-port';

const DEFAULT_INPUT_PARAMETERS = {
    url:            "https://google.com/",
    output:         "html",
};

export async function main(context, req) {

    context.log("Request: ", req);

    const options = {
        url: req.query?.url || DEFAULT_INPUT_PARAMETERS.url,
        output: req.query?.output || DEFAULT_INPUT_PARAMETERS.output,
    };

    context.log('options', options);

    let browser;

    const port = await fp(9222);

    try {
        [ browser ] = await frkBulk.Puppeteer.initBrowser({
            port,
            headless: true,
            extraArgs: [
                '--disable-gpu', // disable gpu acceleration
                '--no-sandbox', // disable chrome sandbox mode
                '--no-zygote', // disable the zygote process (https://chromium.googlesource.com/chromium/src/+/HEAD/docs/linux/zygote.md)
                '--no-first-run', // disable first run beacon (e.g. first run wizard)
                '--disable-storage-reset', //  disable resetting the local storage at the end
                '--disable-features=TranslateUI,BlinkGenPropertyTrees', // disable some unnecessary chrome features
                '--max-wait-for-load=120000' // LH waits up to 120s for the page to load    
            ],
        });
        
        const lhOptions = { logLevel: 'error', output: options.output, port};

        let runnerResult;
        for (var i = 0; i < 3; i++) {
            runnerResult = await lighthouse(options.url, lhOptions, desktopConfig);
        }

        // `.report` is the HTML report as a string
        const reportHtml = runnerResult.report;

        context.log(`Lighthouse done. ✨`);

        context.res = {
            body: reportHtml,
            headers: {
                "content-type": options.output === 'html' ? 'text/html' : 'application/json',
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
Run a Lighthouse analysis

Method: POST

JSON Input Body:

    {
        url:            "<url>",    // required
    }

    Example

    {
        url:            "https://www.adobe.com",
    }
`;