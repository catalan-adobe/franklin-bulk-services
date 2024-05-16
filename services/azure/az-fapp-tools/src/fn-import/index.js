import * as frkBulk from 'franklin-bulk-shared';
import { RequestInterceptionManager } from 'puppeteer-intercept-and-modify-requests';
import serveStatic from 'serve-static';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import zl from 'zip-lib';

const DEFAULT_INPUT_PARAMETERS = {
    url:            "https://www.adobe.com/",
    width:          1280,
    adBlocker:      true,
    gdprBlocker:    true,
    delay:          0,
    jsToInject:     null,
    disableJs:      true,
};

const HELIX_IMPORTER_SCRIPT_URL = 'http://localhost:8888/helix-importer.js';
const DEFAULT_IMPORT_SCRIPT_URL = 'http://localhost:8888/defaults/import-script.js';

async function startHTTPServer() {
    const app = express();
    app.use(cors());
    app.use(serveStatic(path.join(import.meta.dirname, '../lib/importer')));
    app.use(serveStatic(path.join(import.meta.dirname, '../node_modules/@adobe/helix-importer-ui/')));
    return app.listen(8888);
}

async function disableJS(page) {
    const client = await page.target().createCDPSession();
    const interceptManager = new RequestInterceptionManager(client);
    await interceptManager.intercept(
        {
            // specify the URL pattern to intercept:
            urlPattern: '*',
            // optionally filter by resource type:
            resourceType: 'Document',
            // specify how you want to modify the response (may be async):
            modifyResponse({ body }) {
                if (body) {
                    const regex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gm;
                    const subst = '';
                    const result = body.replace(regex, subst);
                    return { body: result };
                }
                return { body };
            },
        },
    );
}

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
    
    // output directory
    const outputDir = path.join(os.tmpdir(), `import-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`);
    context.log(`output dir: ${outputDir}`);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // http server to serve the import script
    const httpServer = await startHTTPServer();
    
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
        
        
        // disable JS
        if (options.disableJs) {
            await disableJS(page);
        }
        
        // force bypass CSP
        await page.setBypassCSP(true);
        
        const resp = await page.goto(options.url, { waitUntil: 'networkidle2' });
        
        // compute status
        if (resp.status() >= 400) {
            // error -> stop + do not retry
            // importResult.status = 'error';
            // importResult.message = `status code ${resp.status()}`;
            // importResult.retries = 0;
        } else if (resp.request()?.redirectChain()?.length > 0) {
            // redirect -> stop
            // importResult.status = 'redirect';
            // importResult.message = `redirected to ${resp.url()}`;
        } else {
            // ok -> proceed
            if (!options.disableJs) {
                await frkBulk.Puppeteer.smartScroll(page, { postReset: true });
            }
            
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
            
            const u = new URL(options.url);
            const docxPath = path.join(outputDir, path.dirname(u.pathname));
            const client = await page.target().createCDPSession();
            await client.send('Browser.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: docxPath,
                eventsEnabled: true,
            });
            
            const { filename, md } = await page.evaluate(async (helixImporterScriptURL, importScriptURL) => {
                /* eslint-disable */
                // code executed in the browser context
                await import(helixImporterScriptURL);
                
                const customTransformConfig = await import(importScriptURL);
                
                // execute default import script
                const out = await WebImporter.html2docx(location.href, document, customTransformConfig.default, {});
                
                // get the docx file
                const blob = new Blob([out.docx], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                const url = window.URL.createObjectURL(blob);
                
                // download the docx file
                const filename = `${out.path.substring(out.path.lastIndexOf('/') + 1)}.docx`;
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                
                // return the filename
                return {
                    filename: out.path,
                    md: out.md,
                };
                /* eslint-enable */
            }, HELIX_IMPORTER_SCRIPT_URL, DEFAULT_IMPORT_SCRIPT_URL);
            
            context.log(`imported page saved to docx file ${docxPath}${filename}.docx`);
            
            // wait for download to complete
            const dlPromise = new Promise((res) => {
                client.on('Browser.downloadProgress', async ({
                    // guid,
                    // totalBytes,
                    // receivedBytes,
                    state,
                }) => {
                    if (state !== 'inProgress') {
                        res(state);
                    }
                });
            });
            const dlState = await Promise.resolve(dlPromise);
            
            context.log(`download state: ${dlState}`);

            if (!fs.existsSync(docxPath)) {
                fs.mkdirSync(docxPath, { recursive: true });
            }

            fs.writeFileSync(`${docxPath}${filename}.md`, md);
            fs.writeFileSync(`${docxPath}${filename}.png`, screenshotBuffer);
            
            // zip the files
            const zipFilepath = path.join(outputDir, 'import.zip');
            await zl.archiveFolder(docxPath, zipFilepath);
            const rawFile = fs.readFileSync(zipFilepath);
            const fileBuffer = Buffer.from(rawFile, 'base64');

            /**
            * response
            */
            
            context.log(`All done. ✨`);

            context.res = {
                status: 202,
                body: fileBuffer,
                headers: {
                    // "content-type": "image/png"
                    "Content-Disposition": `attachment; filename=import.zip`,
                }
            };
        }
    } catch(e) {
        context.log.error(e);
        context.res = {
            body: e,
        };
    } finally {
        if (httpServer) {
            // stop http server
            await httpServer.close();
        }
        
        if (browser) {
            context.log.info("Closing browser..");
            await browser.close();
        }
    }
};

const USAGE_MESSAGE = `
Imports a web page into a docx file using the Helix Importer (with a default import script).

Method: POST

JSON Input Body:

{
    url:            string,     // required - the url to import
    width:          <width>,    // the viewport width of the browser (in pixels)
                                // default: 1280
    adBlocker:      true|false, // enable ad blocker plugin
                                // default: true
    gdprBlocker:    true|false, // enable gdpr blocker plugin
                                // default: true
    delay:          <delay>,    // forced waiting time after page load (in ms.)
                                // default: 0 (no delay)
    disableJs:      true|false, // disable JS execution in the browser
                                // default: true
}

Example

{
    url:            "https://www.adobe.com",
    width:          1440,
    adBlocker:      true,
    gdprBlocker:    false,
}
`;