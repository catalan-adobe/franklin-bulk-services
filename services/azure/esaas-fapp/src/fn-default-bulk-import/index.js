import { Time } from 'franklin-bulk-shared';
import { EventHubProducerClient } from "@azure/event-hubs";
import WebSocket from 'ws';
import { Readable } from 'stream';
import unzipper from 'unzipper';
import { BlockBlobClient } from '@azure/storage-blob';

const DEFAULT_IMPORT_OPTIONS = {
    pageLoadTimeout: 30000,
    enableJavascript: false,
};

const IMPORTER_SERVICE_CONFIGURATION = {
    apiEndpoint: 'https://spacecat.experiencecloud.live/api/v1/tools/import/jobs',
    apiKey: null,
};

function buildErrorResponse(message) {
    return {
        error: message,
    };
}

export async function main(context, req) {
    context.log('ESaaS Bulk Import function processing a request.');

    // Environment variable set in Function App Configuration in Azure Portal
    IMPORTER_SERVICE_CONFIGURATION.apiKey = process.env.IMPORTER_SERVICE_API_KEY;
    context.log('IMPORTER_SERVICE_CONFIGURATION', IMPORTER_SERVICE_CONFIGURATION);

    if (!IMPORTER_SERVICE_CONFIGURATION.apiKey) {
        context.res = {
            status: 500,
            body: buildErrorResponse('Importer Service API Key is required'),
        };
        return;
    }

    context.log('context');
    await context.log(context);

    await Time.sleep(2000);

    context.log('req');
    await context.log(req);

    // 1. Start bulk import job on import service
    if (req.method === 'POST') {
        try {
            const urls = req.body?.urls;
            // required parameters
            if (!urls || !Array.isArray(urls) || urls.length === 0) {
                context.res = {
                    status: 400,
                    body: buildErrorResponse('urls parameter is required and must be a non-empty array'),
                };
                return;
            }

            context.log('Start bulk import job on import service');

            const jobId = await impSvcStartJob(urls, DEFAULT_IMPORT_OPTIONS, IMPORTER_SERVICE_CONFIGURATION);

            const startJobResult = {
                jobId: `esaas-bulk-import_${jobId}`,
                status: 'started',
                message: 'Bulk import job started successfully',
                statusPath: `${req.url}/${jobId}`,
                urls,
                // options,
            };

            /*
                output
            */

            context.bindings.httpOutput = {
                status: 201,
                headers: {
                    "content-type": "application/json"
                },
                body: startJobResult,
            };
        } catch (error) {
            context.log('Error', error);
        }
    }
    // 2. Get status of bulk import job
    else if (req.method === 'GET') {
        try {
            context.log('Get status of bulk import job');
            await Time.sleep(1000);

            if (req.params.id) {
                const jobId = req.params.id.split('_').pop();

                const status = await impSvcGetJobStatus(jobId, IMPORTER_SERVICE_CONFIGURATION);
                await Time.sleep(1000);
                
                switch (status) {
                    case 'COMPLETE':
                        // 1. get download url for result archive from import service
                        const downloadUrl = await impSvcGetResultArchiveURL(jobId, IMPORTER_SERVICE_CONFIGURATION);
                        if (!downloadUrl) {
                            throw new Error('Failed to get download URL for result archive');
                        }

                        const connStr = process.env.AzureWebJobsStorage;
                        const container = process.env.BULK_IMPORT_BLOB_CONTAINER_NAME;

                        if (!connStr || !container) {
                            throw new Error('Azure Blob Storage connection string and container name are required');
                        }

                        const eventHubName = process.env.BULK_IMPORTER_EVENT_HUB_NAME;
                        const eventHubConnStr = process.env.BULK_IMPORTER_EVENT_HUB_CONNSTRING;

                        if (!eventHubName || !eventHubConnStr) {
                            throw new Error('Event Hub name and connection string are required');
                        }

                        // 2. download result archive from import service and push .docx files to Azure Blob Storage
                        await streamImpSvcResultArchiveAndPushDocxToAzStorage(downloadUrl, req.params.id, container, connStr);

                        await sendEventToTriggerPowerAutomateFlow(req.params.id, eventHubName, eventHubConnStr);

                        await Time.sleep(15000);

                        context.res = {
                            status: 200,
                            body: {
                                jobId: req.params.id,
                                status: 'completed',
                                message: 'Bulk import job done',
                            },
                        };
                        return;
                    case 'FAILED':
                        context.res = {
                            status: 200,
                            body: {
                                jobId: req.params.id,
                                status: 'failed',
                                message: 'Bulk import job failed',
                            },
                        };
                        return;
                    case 'RUNNING':
                        context.res = {
                            status: 200,
                            body: {
                                jobId: req.params.id,
                                status: 'running',
                                message: 'Bulk import job still running',
                            },
                        };
                        return;
                }
            } else {
                context.res = {
                    status: 400,
                    body: buildErrorResponse('/api/v1/tools/import/jobs/{jobId} parameter is required'),
                };
                return;
            }
        } catch (error) {
            context.res = {
                status: 500,
                body: buildErrorResponse(`get job status failed: ${error}`),
            };
            return;
        }
    }
};

async function impSvcStartJob(urls, options, config = null) {
    try {
        if (!config.apiKey) {
            throw new Error('Importer Service API key is required');
        }

        const formData = new FormData();
        formData.append('urls', JSON.stringify(urls));            
        // context.log('formData', formData);

        // call importer service api
        const resp = await fetch(IMPORTER_SERVICE_CONFIGURATION.apiEndpoint, {
            method: 'POST',
            headers: {
                'x-api-key': IMPORTER_SERVICE_CONFIGURATION.apiKey,
            },
            body: formData,
        });

        if (!resp.ok) {
            // get error message x-error header
            const error = resp.headers.get('x-error');
            throw new Error(error);
        }

        const respJson = await resp.json();

        // log
        console.log('respJson', respJson);
        await Time.sleep(1000);

        return respJson.id;
    } catch (error) {
        throw new Error(`Failed to start bulk import job: ${error}`);
    }
}

async function impSvcGetJobStatus(jobId, config = null) {
    try {
        if (!config.apiKey) {
            throw new Error('Importer Service API key is required');
        }

        // call importer service api
        const resp = await fetch(`${config.apiEndpoint}/${jobId}`, {
            method: 'GET',
            headers: {
                'x-api-key': config.apiKey,
            },
        });

        if (!resp.ok) {
            // get error message x-error header
            const error = resp.headers.get('x-error');
            throw new Error(error);
        }

        const respJson = await resp.json();

        // log
        console.log('respJson', respJson);
        await Time.sleep(1000);

        return respJson.status;
    } catch (error) {
        throw new Error(`Failed to get bulk import job status: ${error}`);
    }
}

async function impSvcGetResultArchiveURL(jobId, config = null) {
    try {
        if (!config.apiKey) {
            throw new Error('Importer Service API key is required');
        }

        // call importer service api
        const resp = await fetch(`${config.apiEndpoint}/${jobId}/result`, {
            method: 'POST',
            headers: {
                'x-api-key': config.apiKey,
            },
        });

        if (!resp.ok) {
            // get error message x-error header
            const error = resp.headers.get('x-error');
            throw new Error(error);
        }
    
        const respJson = await resp.json();

        // log
        console.log('respJson', respJson);
        await Time.sleep(1000);

        return respJson.downloadUrl;
    } catch (error) {
        throw new Error(`Failed to get bulk import job result archive URL: ${error}`);
    }
}

async function streamImpSvcResultArchiveAndPushDocxToAzStorage(downloadUrl, rootFolder, containerName, connStr) {
    // return new Promise(async (resolve, reject) => {
        try {
            // download result archive from import service
            const readableStream = await fetch(downloadUrl).then(r => Readable.fromWeb(r.body));

            const zip = readableStream.pipe(unzipper.Parse({forceStream: true}));
            for await (const entry of zip) {
                console.log(`File: ${entry.path}, Type: ${entry.type}`);
                if (entry.path.endsWith('.docx')) {
                    const blobName = `${rootFolder}/${entry.path}`;
                    const blockBlobClient = new BlockBlobClient(connStr, containerName, blobName);
                    const uploadBlobResponse = await blockBlobClient.uploadData(await entry.buffer());
                    console.log(`Uploaded block blob ${blobName} successfully`, uploadBlobResponse.requestId);
                }
                entry.autodrain();
                // const fileName = entry.path;
                // const type = entry.type; // 'Directory' or 'File'
                // const size = entry.vars.uncompressedSize; // There is also compressedSize;
                // if (fileName === "this IS the file I'm looking for") {
                //     entry.pipe(fs.createWriteStream('output/path'));
                // } else {
                //     entry.autodrain();
                // }
            }

            // readableStream.on('end', () => {
            //     resolve('Streamed bulk import job result archive successfully');
            // });

            // readableStream.on('error', (error) => {
            //     reject(`Failed to stream bulk import job result archive: ${error}`);
            // });

            // await readableStream
            //     .pipe(unzipper.Parse())
            //     .on("entry", async (entry) => {
            //         if (entry.path.endsWith('.docx')) {
            //             console.log(`File: ${entry.path}, Type: ${entry.type}`);
            //             const blobName = `${rootFolder}/${entry.path}`;
            //             const blockBlobClient = new BlockBlobClient(connStr, containerName, blobName);
            //             const uploadBlobResponse = await blockBlobClient.uploadData(await entry.buffer());
            //             console.log(`Uploaded block blob ${blobName} successfully`, uploadBlobResponse.requestId);
            //         }
            //         entry.autodrain();
            //     })
            //     .promise();

            console.log('Streamed bulk import job result archive successfully');
        } catch (error) {
            throw new Error(`Failed to stream bulk import job result archive and push .docx files to Azure Blob Storage: ${error}`);
        }
    // });
}

async function sendEventToTriggerPowerAutomateFlow(originFolder, eventHubName, connStr) {
    const producer = new EventHubProducerClient(
        connStr,
        eventHubName, {
            webSocketOptions: {
                webSocket: WebSocket,
            }
        },
    );

    const eventsToSend = [{
        'originFolder': originFolder,
        'targetFolder': originFolder,
    }];

    try {
        const batchOptions = {};
        let batch = await producer.createBatch(batchOptions);

        // add events to our batch
        let numEventsSent = 0;
        let i = 0;

        while (i < eventsToSend.length) {
            const isAdded = batch.tryAdd({ body: eventsToSend[i] });

            if (isAdded) {
                console.log(`Added eventsToSend[${i}] to the batch`);
                ++i;
                continue;
            }

            if (batch.count === 0) {
                console.log(`Message was too large and can't be sent until it's made smaller. Skipping...`);
                ++i;
                continue;
            }

            // otherwise this just signals a good spot to send our batch
            console.log(`Batch is full - sending ${batch.count} messages as a single batch.`);
            await producer.sendBatch(batch);
            numEventsSent += batch.count;

            // and create a new one to house the next set of messages
            batch = await producer.createBatch(batchOptions);
        }

        // send any remaining messages, if any.
        if (batch.count > 0) {
            console.log(`Sending remaining ${batch.count} messages as a single batch.`);
            await producer.sendBatch(batch);
            numEventsSent += batch.count;
        }

        console.log(`Sent ${numEventsSent} events`);

        if (numEventsSent !== eventsToSend.length) {
            throw new Error(`Not all messages were sent (${numEventsSent}/${eventsToSend.length})`);
        }
    } catch (err) {
        console.log("Error when creating & sending a batch of events: ", err);
    }

    await producer.close();
    console.log(`Exiting sendEvents sample`);
} 