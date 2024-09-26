// spacecat API
// https://github.com/adobe/spacecat-api-service/blob/main/docs/openapi/schemas.yaml

const DEFAULT_IMPORT_OPTIONS = {
    pageLoadTimeout: 30000,
    enableJavascript: false,
};

function buildErrorResponse(message) {
    return {
        error: message,
    };
}

export async function main(context, req) {
    context.log('ESaaS Bulk Import function processing a request.');

    // Environment variable set in Function App Configuration in Azure Portal
    const IMPORTER_SERVICE_API_KEY = process.env.IMPORTER_SERVICE_API_KEY;

    if (!IMPORTER_SERVICE_API_KEY) {
        context.res = {
            status: 500,
            body: buildErrorResponse('Importer Service API Key is required'),
        };
        return;
    }

    // required parameters
    if (!req.body?.urls || !Array.isArray(req.body.urls) || req.body.urls.length === 0) {
        context.res = {
            status: 400,
            body: buildErrorResponse('urls parameter is required and must be a non-empty array'),
        };
        return;
    }

    const urls = req.body.urls;

    // optional parameters
    const options = {
        ...DEFAULT_IMPORT_OPTIONS,
        ...req.body?.options,
    };

    context.log('context');
    await context.log(context);

    // await importerLib.Time.sleep(5000);

    context.log('req');
    await context.log(req);

    // 1. Start bulk import job on import service
    if (req.method === 'POST') {
        context.log('Start bulk import job on import service');

        // TODO - integrate with import service

        const startJobResult = {
            jobId: '12345',
            status: 'started',
            message: 'Bulk import job started successfully',
            jobStatusURL: 'https://franklin-bulk-import-service.com/jobs/12345',
            urls,
            options,
        };

        context.res = {
            status: 201,
            headers: {
                "content-type": "application/json"
            },
            body: startJobResult,
        };
    }
    // 2. Get status of bulk import job
    else if (req.method === 'GET') {
        context.log('Get status of bulk import job');
        context.res = {
            status: 200,
            body: 'Get status of bulk import job',
        };
    }
    // // Unsupported method => 400
    // Should not be needed as function.json specifies only POST and GET so any other method
    // will not reach this function and return 404
    // else {
    //     context.res = {
    //         status: 400,
    //         body: `Unsupported method ${req.method}. Please pass a name on the query string or in the request body`,
    //     };
    // }
};
