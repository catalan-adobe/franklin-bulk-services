import fs from 'fs';
import path from 'path';
import { Time } from 'franklin-bulk-shared';
import { EventHubProducerClient } from "@azure/event-hubs";
import WebSocket from 'ws';
import { Readable } from 'stream';
import unzipper from 'unzipper';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';

const IMPORTER_SERVICE_CONFIGURATION = {
    apiEndpoint: 'https://spacecat.experiencecloud.live/api/v1/tools/import/jobs',
    apiKey: null,
};

const SHAREPOINT_TARGETS = {
    esaas: {
        root: 'https://adobe.sharepoint.com/sites/AEMDemos',
        path: '/Shared Documents/sites/esaas-demos/lpb-imports',
        
    },
    lpb: {
        root: 'https://adobe.sharepoint.com/sites/alturaeds',
        path: '/Shared Documents/esaaslpbeds',
        
    },
};

function buildErrorResponse(message) {
    return {
        error: message,
    };
}

function getRandomDigit(type = 'even') {
    let digit = Math.floor(Math.random() * 10);
    if (type === 'even' && digit % 2 !== 0) {
        digit -= 1;
    } else if (type === 'odd' && digit % 2 === 0) {
        digit += 1;
    }
    return digit;
}

function getRandomLetter() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26)).toLowerCase();
}

export async function main(context, req) {
    context.log('ESaaS Bulk Import function processing a request.');
    
    context.log(context);
    await Time.sleep(2000);

    context.log('req', req);
    await Time.sleep(2000);

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
    
    // 1. Start bulk import job on import service
    if (req.method === 'POST') {
        try {
            let urlsRaw = req.body?.urls;
            
            const sp_target = req.body?.target || 'esaas';
            if (sp_target && !SHAREPOINT_TARGETS[sp_target]) {
                context.res = {
                    status: 400,
                    body: buildErrorResponse('Invalid target parameter (should be "esaas" or "lpb")'),
                };
                return;
            }
            
            const username = req.body?.username || '';
            
            // required parameters
            if (!urlsRaw || !Array.isArray(urlsRaw) || urlsRaw.length === 0) {
                context.res = {
                    status: 400,
                    body: buildErrorResponse('urls parameter is required and must be a non-empty array'),
                };
                return;
            }

            context.log('urlsRaw', urlsRaw);
            await Time.sleep(1000);

            let urls = [
                urlsRaw[0],
                urlsRaw[0],
                ...urlsRaw,
            ];

            context.log('urls', urls);
            await Time.sleep(1000);

            urls = urls.map((url, idx) => {
                const u = new URL(url);
                let uuid = crypto.randomUUID();

                if (idx === 0) {
                    uuid = uuid.replace(/.$/, getRandomDigit('even'));
                } else if (idx === 1) {
                    uuid = uuid.replace(/.$/, getRandomDigit('odd'));
                } else {
                    uuid = uuid.replace(/.$/, getRandomLetter());
                }

                u.searchParams.set('esaasImpId', uuid);
                return u.href;
            });

            context.log('urls', urls);
            await Time.sleep(1000);

            context.log('Start bulk import job on import service');

            const impSvcJobId = await impSvcStartJob(urls, context, IMPORTER_SERVICE_CONFIGURATION);
            const jobId = `${sp_target}_${username}_${impSvcJobId}`;

            const startJobResult = {
                jobId,
                status: 'started',
                message: 'Bulk import job started successfully',
                target: sp_target,
                username,
                statusPath: `${req.url}/${jobId}`,
                urls,
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
            
            if (!req.params.id) {
                throw new Error('GET /api/v1/tools/import/jobs/{jobId} requires jobId parameter');
            }
            
            const [ sp_target, username, jobId ] = req.params.id.split('_');
            
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
                
                const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
                
                // get container client for the target container
                const azBlobContainerName = `esaas-bulk-import-${jobId}`;
                const spTargetFolder = req.params.id.replaceAll('_', '-').toLowerCase();
                
                let files = [];
                
                const { root, path } = SHAREPOINT_TARGETS[sp_target];
                
                try {
                    const containerClient = blobServiceClient.getContainerClient(azBlobContainerName);
                    
                    let i = 1;
                    for await (const blob of containerClient.listBlobsFlat()) {
                        console.log(`Blob ${i++}: ${blob.name}`);
                        files.push(blob.name);
                    }
                } catch (error) {
                    context.log('Error', error);
                    
                    // 2. download result archive from import service and push .docx files to Azure Blob Storage
                    files = await streamImpSvcResultArchiveAndPushDocxToAzStorage(downloadUrl, azBlobContainerName, connStr);
                    
                    await sendEventToTriggerPowerAutomateFlow(azBlobContainerName, spTargetFolder, root, path, username, eventHubName, eventHubConnStr);
                    // force 15s. the may delay of the powerautomate flow to catch the event
                    await Time.sleep(15000);
                }
                
                const results = files.map((p) => ({
                    p,
                    status: 'ok',
                    location: encodeURI(`${root}${path}${username ? `/${username}` : ''}/${azBlobContainerName}/${p}`),
                    message: 'Imported',
                }));
                
                context.res = {
                    status: 200,
                    body: {
                        jobId: req.params.id,
                        status: 'completed',
                        message: 'Bulk import job done',
                        results,
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
        } catch (error) {
            context.res = {
                status: 500,
                body: buildErrorResponse(`get job status failed: ${error}`),
            };
            return;
        }
    }
};

async function impSvcStartJob(urls, context, config = null) {
    try {
        if (!config.apiKey) {
            throw new Error('Importer Service API key is required');
        }
        
        const formData = new FormData();
        formData.append('urls', JSON.stringify(urls));            
        
        console.log('executionContext', context.executionContext.functionDirectory);
        const scriptCode = fs.readFileSync(`${context.executionContext.functionDirectory}/sections-mapping.import.bundle.js`, 'utf8');
        const bundledScriptBlob = new Blob([scriptCode], { type: 'application/javascript' });
        formData.append('importScript', bundledScriptBlob, path.basename('tools/import/import.js'));

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
        console.log('respJson', respJson);
        
        await Time.sleep(1000);
        
        return respJson.downloadUrl;
    } catch (error) {
        throw new Error(`Failed to get bulk import job result archive URL: ${error}`);
    }
}

async function streamImpSvcResultArchiveAndPushDocxToAzStorage(downloadUrl, containerName, connStr) {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
        
        // creating client also creates container
        await blobServiceClient.createContainer(containerName);
        console.log(`container ${containerName} created`);
        
        const files = [];
        
        // download result archive from import service
        const readableStream = await fetch(downloadUrl).then(r => Readable.fromWeb(r.body));
        
        const zip = readableStream.pipe(unzipper.Parse({forceStream: true}));
        for await (const entry of zip) {
            console.log(`File: ${entry.path}, Type: ${entry.type}`);
            if (entry.path.endsWith('.docx')) {
                const blobName = `${entry.path}`;
                const blockBlobClient = new BlockBlobClient(connStr, containerName, blobName);
                const uploadBlobResponse = await blockBlobClient.uploadData(await entry.buffer());
                console.log(`Uploaded block blob ${blobName} successfully`, uploadBlobResponse.requestId);
                files.push(blobName);
            }
            entry.autodrain();
        }
        
        console.log('Streamed bulk import job result archive successfully');
        
        return files;
    } catch (error) {
        throw new Error(`Failed to stream bulk import job result archive and push .docx files to Azure Blob Storage: ${error}`);
    }
}

async function sendEventToTriggerPowerAutomateFlow(originFolder, targetFolder, spRoot, spFolder, username, eventHubName, connStr) {
    const producer = new EventHubProducerClient(
        connStr,
        eventHubName, {
            webSocketOptions: {
                webSocket: WebSocket,
            }
        },
    );
    
    const eventsToSend = [{
        originFolder,
        targetFolder,
        sharepointRoot: spRoot,
        sharepointFolder: spFolder,
        subFolder: username ? `/${username}` : '',
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