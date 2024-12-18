import * as frkBulk from 'franklin-bulk-shared';
import { RequestInterceptionManager } from 'puppeteer-intercept-and-modify-requests';
import serveStatic from 'serve-static';
import express from 'express';
import cors from 'cors';
import path from 'path';
import AdmZip from 'adm-zip';

import { md2docx } from '@adobe/helix-md2docx';
import sharp from 'sharp';

const DEFAULT_INPUT_PARAMETERS = {
    url:                'https://www.adobe.com/',
    width:              1280,
    adBlocker:          true,
    gdprBlocker:        true,
    delay:              0,
    jsToInject:         null,
    disableJs:          true,
    screenshotQuality: 'normal',
    resources:          {
        docx:         true,
        md:           false,
        screenshot:   false,
        config:       false,
    },
};

const HELIX_IMPORTER_SCRIPT_URL = 'http://localhost:8888/helix-importer.js';
const DEFAULT_IMPORT_SCRIPT_URL = 'http://localhost:8888/defaults/import-script.js';
const LOW_QUALITY_MAX_SCREENSHOT_WIDTH = 800;

async function image2png ({ src, data, type }) {
    try {
        const png = (await sharp(data))
            .png();
        const metadata = await png.metadata()
        return {
            data: png.toBuffer(),
            width: metadata.width,
            height: metadata.height,
            type: 'image/png',
        };
    } catch (e) {
        log(context, `Cannot convert image ${src} to png. It might corrupt the Word document and you should probably remove it from the DOM.`);
        return null;
    }
};

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

async function log(context, ...args) {
    context.log(...args);
    await frkBulk.Time.sleep(10);
}

function buildError(context, status, message) {
    context.log.error(`error caught: returning ${status} ${message}`);
    return {
        status: status,
        headers: {
            'x-error': message,
        },
        message: message,
    };
}

export async function main(context, req) {
    log(context, 'request', req);

    const options = {
        ...DEFAULT_INPUT_PARAMETERS,
        ...req.body,
    };

    log(context, 'options', options);

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

    // http server to serve the import script
    const httpServer = await startHTTPServer();

    let browser;
    let page;

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
            // error -> return
            context.res = buildError(context, 500, `error loading ${options.url} returns http status ${resp.status()} ${resp.statusText()}`);
        } else if (resp.request()?.redirectChain()?.length > 0) {
            // redirect -> return
            context.res = buildError(context, 500, `${options.url} is a redirect to ${resp.url()}, do not import it`);
        } else {
            const outputResources = [];
            // compute filename
            const u = new URL(options.url);
            const filename = u.pathname.replace(path.extname(u.pathname), '');

            // ok -> proceed
            if (!options.disableJs) {
                await frkBulk.Puppeteer.smartScroll(page, { postReset: true });
            }

            if (options.resources?.screenshot) {
                // add a screenshot of the page
                const screenshotOptions = {
                    fullPage: true,
                };
                if (options.screenshotQuality === 'low') {
                    screenshotOptions.type = 'jpeg';
                    screenshotOptions.quality = 10;
                    screenshotOptions.optimizeForSpeed = true;
                }
                const screenshotBuffer = await page.screenshot(screenshotOptions);
                if (options.screenshotQuality === 'low' && options.width > LOW_QUALITY_MAX_SCREENSHOT_WIDTH) {
                    screenshotBuffer = await sharp(screenshotBuffer).resize(LOW_QUALITY_MAX_SCREENSHOT_WIDTH).toBuffer();
                }
                outputResources.push({
                    filename: `${filename}-viewport-screenshot.${options.screenshotQuality === 'low' ? 'jpeg' : 'png'}`,
                    buffer: screenshotBuffer,
                });
            }

            // execute the import script and get back the filename and the markdown
            const { /*filename,*/ md } = await page.evaluate(async (helixImporterScriptURL, importScriptURL) => {
                await import(helixImporterScriptURL);
                const customTransformConfig = await import(importScriptURL);
                // execute default import script
                const out = await WebImporter.html2docx(location.href, document, customTransformConfig.default, { toDocx: false, toMd: true });
                return {
                    // filename: out.path,
                    md: out.md,
                };
            }, HELIX_IMPORTER_SCRIPT_URL, DEFAULT_IMPORT_SCRIPT_URL);

            if (options.resources?.md) {
                outputResources.push({
                    filename: `${filename}.md`,
                    buffer: Buffer.from(md, 'utf-8'),
                });
            }

            // convert markdown to docx
            const docx = await md2docx(md, {
                docxStylesXML: null,
                image2png,
            });
            outputResources.push({
                filename: `${filename}.docx`,
                buffer: docx,
            });

            if (options.resources?.config) {
                outputResources.push({
                    filename: `${filename}-import-config.json`,
                    buffer: Buffer.from(JSON.stringify(options, null, 2), 'utf-8'),
                });
            }

            // create zip archive with all resources
            var zip = new AdmZip();
            for (let { filename, buffer } of outputResources) {
                zip.addFile(filename, buffer);
            }
            
            log(context, `All done. ✨`);

            // response
            if (outputResources.length === 1 && options.resources?.docx) {
                // only word document
                context.res = {
                    status: 200,
                    body: docx,
                    headers: {
                        "Content-Disposition": `attachment; filename=${path.basename(filename)}.docx`,
                    }
                };
            } else {
                context.res = {
                    status: 200,
                    body: zip.toBuffer(),
                    headers: {
                        "Content-Disposition": `attachment; filename=import.zip`,
                    }
                };
            }
        }
    } catch(e) {
        context.res = buildError(context, 500, `fn-import error: ${e.message}, ${e.stack}`);
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
fn-import
===

Imports a web page into a docx file using the Helix Importer (with a default import script).

## Method

    POST

## JSON Input Body

    {
        "url":            string,               // required - the url to import

        "resources": {                          // optional - resources to include in the zip file
                                                // default: only docx
            "docx":             true|false,     // include the docx file
                                                // default: true
            "md":               true|false,     // include the markdown file
                                                // default: false
            "screenshot":       true|false,     // include a screenshot of the page
                                                // default: false
            "config":           true|false,     // include the import json configuration
                                                // default: false
        },
        
        "width":                <width>,        // the viewport width of the browser (in pixels)
                                                // default: 1280
        "adBlocker":            true|false,     // enable ad blocker plugin
                                                // default: true
        "gdprBlocker":          true|false,     // enable gdpr blocker plugin
                                                // default: true
        "delay":                <delay>,        // forced waiting time after page load (in ms.)
                                                // default: 0 (no delay)
        "disableJs":            true|false,     // disable JS execution in the browser
                                                // default: true
        "screenshotQuality":    "normal"|"low"  // screenshot quality
                                                //   * normal: png file
                                                //   * low: jpeg file, 10% quality
                                                // default: normal
    }

## Examples

### Import a page with javascript enabled and get only the docx result

    {
        "url":            "https://www.adobe.com",
        "disableJs":      false,
    }

    Returns docx binary content

### Import a page and get all resources (javascript disabled)

    {
        "url":            "https://www.adobe.com",
        "resources": {
            "docx":         true,
            "md":           true,
            "screenshot":   true,
            "config":       true,
        }
    }

    Returns a zip file with all resources
`;