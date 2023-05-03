import * as importerLib from 'franklin-bulk-shared';

export async function main(context, req) {
    let browser;
    let page;

    try {
        [browser, page] = await importerLib.Puppeteer.initBrowser();
    
        const url = req.query.url || "https://google.com/";
    
        await page.setViewport({
            width: 1200,
            height: 1000,
            deviceScaleFactor: 1,
        });
    
        await page.goto(url);
    
        /*
          scroll
        */

        await importerLib.Puppeteer.scrollDown(page);
        await importerLib.Puppeteer.scrollUp(page);
                        
        // cool down
        await importerLib.Time.sleep(1000);

        const screenshotBuffer = await page.screenshot({ fullPage: true });
    
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
