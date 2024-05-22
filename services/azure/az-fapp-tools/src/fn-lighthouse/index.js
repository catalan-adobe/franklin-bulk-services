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
import { parseCookies } from '../lib/http/request.js';

const DEFAULT_INPUT_PARAMETERS = {
    url:            "https://google.com/",
    output:         "html",
    numRuns:        3,
    type:           "mobile",
};

export async function main(context, req) {

    context.log("Request: ", req);

    const options = {
        url: req.query?.url || DEFAULT_INPUT_PARAMETERS.url,
        output: req.query?.output || DEFAULT_INPUT_PARAMETERS.output,
        numRuns: req.query?.numRuns || DEFAULT_INPUT_PARAMETERS.numRuns,
        type: req.query?.type || DEFAULT_INPUT_PARAMETERS.type,
    };

    context.log('options', options);

    let browser;
    let page;

    const port = await fp(9222);

    try {
        [ browser, page ] = await frkBulk.Puppeteer.initBrowser({
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
        
        if (Object.keys(req.headers).includes('x-set-cookie')) {
            const cookies = parseCookies(options.url, req.headers['x-set-cookie']);
            console.log('cookies', cookies);
            await page.setCookie(...cookies);
        }

        const lhOptions = {
            logLevel: 'error',
            output: options.output,
            disableFullPageScreenshot: true,
        };

        const lhConfig = options.type === 'desktop' ? desktopConfig : mobileConfig;
        lhConfig.settings.onlyCategories = ['accessibility', 'best-practices', 'performance', 'seo'];

        console.log(`Running Lighthouse ${lighthouseVersion}...`);
        console.log(lhConfig);

        let runnerResult;
        for (var i = 0; i < options.numRuns; i++) {
            runnerResult = await lighthouse(options.url, lhOptions, lhConfig, page);
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
