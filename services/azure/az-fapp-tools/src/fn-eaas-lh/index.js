
import { parseCookies } from '../lib/http/request.js';
import { EaaSClient, EaaSProvider, ImsService2ServiceAuth } from '../lib/eaas/eaas.js';

const DEFAULT_INPUT_PARAMETERS = {
    url:            "https://google.com/",
    // output:         "html",
    // numRuns:        3,
    // type:           "desktop",
};

export async function main(context, req) {

    await context.log("Request: ", req);
    await new Promise(res => setTimeout(res, 100));
    await context.log("Context: ", context);
    await new Promise(res => setTimeout(res, 100));
    await context.log("Process Env: ", process.env);
    await new Promise(res => setTimeout(res, 100));

    const options = {
        url: req.query?.url || DEFAULT_INPUT_PARAMETERS.url,
        // output: req.query?.output || DEFAULT_INPUT_PARAMETERS.output,
        // numRuns: req.query?.numRuns || DEFAULT_INPUT_PARAMETERS.numRuns,
        // type: req.query?.type || DEFAULT_INPUT_PARAMETERS.type,
    };

    await context.log('options', options);
    await new Promise(res => setTimeout(res, 100));

    try {
        let eaasOptions = {};
        if (Object.keys(req.headers).includes('x-set-cookie')) {
            // headers = { 'x-set-cookie': req.headers['x-set-cookie'] };
            const cookies = parseCookies(options.url, req.headers['x-set-cookie']);
            if (cookies.length > 0) {
                eaasOptions = { authToken: cookies[0].value };
                console.log('cookies', cookies);
                await new Promise(res => setTimeout(res, 100));
            }
        }
            
        // Login to EaaS API
        const imsService2ServiceAuth = new ImsService2ServiceAuth(
          process.env.IMS_ENDPOINT,
          process.env.EAAS_CLIENT_ID,
          process.env.EAAS_CLIENT_SECRET,
          process.env.EAAS_SCOPES,
        );
      
        // Get EaaS API Client
        const eaasClient = new EaaSClient(process.env.EAAS_API_ENDPOINT, imsService2ServiceAuth);
        const eaas = new EaaSProvider(eaasClient);
      
        // Execute EaaS LH Task
        const response = await eaas.executeLHAnalysis(
          options.url,
          eaasOptions,
        );
      
        context.log(`Lighthouse done. ✨`);

        const report = await response.text();

        context.res = {
            body: report,
            headers: {
                'content-type': 'application/json',
            }
        };      
    } catch(e) {
        context.log.error(e);
        context.res = {
            body: e,
        };
    // } finally {
    //     if (browser) {
    //         context.log.info("Closing browser..");
    //         await browser.close();
    //     }
    }
}
