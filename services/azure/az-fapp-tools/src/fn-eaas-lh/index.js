
import { parseCookies } from '../lib/http/request.js';
import { EaaSClient, EaaSProvider, ImsService2ServiceAuth } from '../lib/eaas/eaas.js';

const DEFAULT_INPUT_PARAMETERS = {
    url: "https://www.example.com/",
};

export async function main(context, req) {
    const options = {
        url: req.query?.url || DEFAULT_INPUT_PARAMETERS.url,
        taskId: req.query?.taskId,
    };

    try {
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

        if (!options.taskId) {
            // Start EaaS LH Task
            let eaasOptions = {};
            if (Object.keys(req.headers).includes('x-set-cookie')) {
                const cookies = parseCookies(options.url, req.headers['x-set-cookie']);
                if (cookies.length > 0) {
                    eaasOptions = { authToken: cookies[0].value };
                }
            }

            const eaasTask = await eaas.startLHTask(
                options.url,
                eaasOptions,
            );
    
            // redirection url
            const u = new URL(req.url);
            const redirectionUrl = `${u.origin}${u.pathname}?taskId=${eaasTask.id}`;

            context.res = {
                body: { taskId: eaasTask.id },
                status: 302,
                headers: {
                    'content-type': 'application/json',
                    'location': redirectionUrl,
                }
            };      
        } else {
            const response = await eaas.waitForJSONReport(options.taskId);

            context.log(`Lighthouse done. ✨`);
    
            const report = await response.text();

            context.res = {
                body: report,
                headers: {
                    'content-type': 'application/json',
                }
            };      
        }
    } catch(e) {
        context.log.error(e);
        context.res = {
            body: e,
        };
    }
}
