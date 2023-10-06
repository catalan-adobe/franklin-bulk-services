
import { parseCookies } from '../lib/http/request.js';
import { EaaSClient, EaaSProvider, ImsService2ServiceAuth } from '../lib/eaas/eaas.js';

const DEFAULT_INPUT_PARAMETERS = {
    url: "https://www.example.com/",
};

const EAAS_LH_TASK_TYPE_AEM = 'AEM';
const EAAS_LH_TASK_TYPE_FRANKLIN = 'Franklin';

export async function main(context, req) {
    const options = {
        url: req.query?.url || DEFAULT_INPUT_PARAMETERS.url,
        taskId: req.query?.taskId,
    };

    context.log('req:');
    context.log(req);

    try {
        // Login to EaaS API
        const imsService2ServiceAuth = new ImsService2ServiceAuth(
          process.env.IMS_ENDPOINT,
          process.env.EAAS_CLIENT_ID,
          process.env.EAAS_CLIENT_SECRET,
          process.env.EAAS_SCOPES,
        );
      
        // Get EaaS API Client
        const eaasClient = new EaaSClient(process.env.EAAS_API_ENDPOINT, imsService2ServiceAuth, context.log);
        const eaas = new EaaSProvider(eaasClient);

        // Start EaaS LH Task
        if (!options.taskId) {
            let eaasOptions = {
                type: EAAS_LH_TASK_TYPE_AEM,
            };

            // detect Helix Bot Requests
            if (req.headers['user-agent'] && req.headers['user-agent'].includes('adobe-fetch')) {
                eaasOptions.type = EAAS_LH_TASK_TYPE_FRANKLIN;
            }

            // detect request for an authenticated page
            if (Object.keys(req.headers).includes('x-set-cookie')) {
                const cookies = parseCookies(options.url, req.headers['x-set-cookie']);
                if (cookies.length > 0) {
                    eaasOptions.authToken = cookies[0].value;
                }
            }

            // start LH task
            const eaasTaskId = await eaas.startLHTask(
                options.url,
                eaasOptions,
            );

            // redirection url
            const u = new URL(req.url);
            let origin = u.origin;
            let proto = u.protocol;
            let path = u.pathname;
            if (req.headers['x-forwarded-host']) {
                if (req.headers['x-forwarded-proto']) {
                    proto = req.headers['x-forwarded-proto'] + ':';
                }
                if (req.headers['x-forwarded-prefix-strip']) {
                    path = path.replace(req.headers['x-forwarded-prefix-strip'], '/');
                }
                origin = `${proto}//${req.headers['x-forwarded-host']}`;
            } else if (req.headers['host']) {
                origin = `${proto}//${req.headers['host']}`;
            }
            const redirectionUrl = `${origin}${path}?taskId=${eaasTaskId}`;

            context.res = {
                body: { taskId: eaasTaskId },
                status: 302,
                headers: {
                    'content-type': 'application/json',
                    'location': redirectionUrl,
                    'x-eaas-taskid': eaasTaskId,
                }
            };      
        // Wait for EaaS LH Task to finish and return JSON report
        } else {
            const response = await eaas.waitForJSONReport(options.taskId);

            context.log(`Lighthouse done. ✨`);
    
            const report = await response.json();

            context.res = {
                body: report,
                headers: {
                    'Content-Type': 'application/json',
                }
            };      
        }
    } catch(e) {
        context.log.error('main error:');
        context.log.error(e);
        context.res = {
            status: 500,
            body: e,
        };
    }
}
