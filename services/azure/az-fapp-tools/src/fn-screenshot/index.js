import * as importerLib from 'franklin-bulk-shared';

export async function main(context, req) {
    let browser;
    let page;

    try {
        [browser, page] = await importerLib.Puppeteer.initBrowser({ headless: true });
            
        const url = req.query.url || "https://google.com/";
        const width = req.query.width ? parseInt(req.query.width, 10) : 1280;
        const postLoadWait = req.query.delay ? parseInt(req.query.delay, 10) : 1000;

        await page.setViewport({
            width: width,
            height: 1000,
            deviceScaleFactor: 1,
        });
    
        console.log(`Loading ${url}...`);
        console.log(`Viewport: ${width}x1000`);

        let screenshotBuffer;

        await importerLib.Puppeteer.runStepsSequence(
            page,
            url,
            [
                importerLib.Puppeteer.Steps.postLoadWait(500),

                importerLib.Puppeteer.Steps.GDPRAutoConsent(),
                
                importerLib.Puppeteer.Steps.execAsync(async (browserPage) => {
                    await browserPage.keyboard.press('Escape');
                }),

                importerLib.Puppeteer.Steps.execAsync(async (browserPage) => {
                    // scroll to bottom
                    await browserPage.evaluate(() => {
                    window.scrollTo({ left: 0, top: window.document.body.scrollHeight, behavior: 'smooth' });
                    });
                    await importerLib.Time.sleep(2000);
              
                    // scroll bsck up
                    await browserPage.evaluate(() => {
                    window.scrollTo(0, 0);
                    });
                    await importerLib.Time.sleep(250);
                }),

                importerLib.Puppeteer.Steps.execAsync(async (browserPage) => {
                    await importerLib.Time.sleep(postLoadWait);
                }),

                importerLib.Puppeteer.Steps.execAsync(async (browserPage) => {
                    screenshotBuffer = await browserPage.screenshot({ fullPage: true });
                }),
            ],
        );

        await browser.close();
    
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
            await browser.close();
        }
    }
};
