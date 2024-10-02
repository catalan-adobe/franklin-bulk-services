import { Time } from 'franklin-bulk-shared';
import { EventHubProducerClient } from "@azure/event-hubs";
import WebSocket from 'ws';

// import { BlockBlobClient } from '@azure/storage-blob';

// spacecat API
// https://github.com/adobe/spacecat-api-service/blob/main/docs/openapi/schemas.yaml

// Importer API - CI/Stage for now
const IMPAAS_API_BASE_URL = 'https://spacecat.experiencecloud.live/api/v1/tools/import/jobs';

const SP_ROOT_URL = 'https://adobe.sharepoint.com/sites/AEMDemos/Shared%20Documents/sites/esaas-demos/lpb-imports';

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
    
    context.log('IMPORTER_SERVICE_API_KEY', IMPORTER_SERVICE_API_KEY);
    // const hivesContainer = process.env.BULK_IMPORT_BLOB_CONTAINER_NAME;
    // const connStr = process.env.AzureWebJobsStorage;
    // // Create a blob
    // const content = 'hello';
    // const blobName = `test-folder/newblob${new Date().getTime()}`;
    // const blockBlobClient = new BlockBlobClient(connStr, hivesContainer, blobName);
    // const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content));
    // context.log(`Uploaded block blob ${blobName} successfully`, uploadBlobResponse.requestId);
    
    if (!IMPORTER_SERVICE_API_KEY) {
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
        
        // required parameters
        if (!req.body?.urls || !Array.isArray(req.body.urls) || req.body.urls.length === 0) {
            context.res = {
                status: 400,
                body: buildErrorResponse('urls parameter is required and must be a non-empty array'),
            };
            return;
        }
        
        context.log('Start bulk import job on import service');
        
        // const formData = new FormData();
        // formData.append('urls', JSON.stringify(req.body.urls));
        
        // context.log('formData', formData);
        
        // // call importer service api
        // const resp = await fetch(IMPAAS_API_BASE_URL, {
        //     method: 'POST',
        //     headers: {
        //         // 'Content-Type': 'multipart/form-data',
        //         'x-api-key': IMPORTER_SERVICE_API_KEY,
        //     },
        //     body: formData,
        // });
        
        // context.log('resp', resp);
        // if (!resp.ok) {
        //     context.res = {
        //         status: resp.status,
        //         body: buildErrorResponse(`Failed to start bulk import job: ${resp.statusText}`),
        //     };
        //     return;
        // }
        
        // const respJson = await resp.json();
        // context.log('respJson');
        
        // const jobId = `bulk-import-job-${respJson.id}`;
        const jobId = `bulk-import-job-${Date.now()}`;
        const urls = req.body.urls;
        
        // optional parameters
        const options = {
            ...DEFAULT_IMPORT_OPTIONS,
            ...req.body?.options,
        };
        
        // TODO - integrate with import service
        
        const startJobResult = {
            jobId,
            status: 'started',
            message: 'Bulk import job started successfully',
            statusPath: `/job/${jobId}`,
            urls,
            options,
        };
        
        /*
        output
        */
        
        // Event hubs
        const connectionString = process.env.BULK_IMPORTER_EVENT_HUB_CONNSTRING;
        const eventHubName = 'esaas-bulk-import-event-hub';
        
        const producer = new EventHubProducerClient(
            connectionString,
            eventHubName, {
                webSocketOptions: {
                    webSocket: WebSocket,
                }
            });
            
            const eventsToSend = [{
                'originFolder': 'default-wknd',
                'targetFolder': jobId,
            }];
            
            try {
                // By not specifying a partition ID or a partition key we allow the server to choose
                // which partition will accept this message.
                //
                // This pattern works well if the consumers of your events do not have any particular
                // requirements about the ordering of batches against other batches or if you don't care
                // which messages are assigned to which partition.
                //
                // If you would like more control you can pass either a `partitionKey` or a `partitionId`
                // into the createBatch() `options` parameter which will allow you full control over the
                // destination.
                const batchOptions = {
                    // The maxSizeInBytes lets you manually control the size of the batch.
                    // if this is not set we will get the maximum batch size from Event Hubs.
                    //
                    // For this sample you can change the batch size to see how different parts
                    // of the sample handle batching. In production we recommend using the default
                    // and not specifying a maximum size.
                    //
                    // maxSizeInBytes: 200
                };
                
                let batch = await producer.createBatch(batchOptions);
                
                let numEventsSent = 0;
                
                // add events to our batch
                let i = 0;
                
                while (i < eventsToSend.length) {
                    // messages can fail to be added to the batch if they exceed the maximum size configured for
                    // the EventHub.
                    const isAdded = batch.tryAdd({ body: eventsToSend[i] });
                    
                    if (isAdded) {
                        console.log(`Added eventsToSend[${i}] to the batch`);
                        ++i;
                        continue;
                    }
                    
                    if (batch.count === 0) {
                        // If we can't add it and the batch is empty that means the message we're trying to send
                        // is too large, even when it would be the _only_ message in the batch.
                        //
                        // At this point you'll need to decide if you're okay with skipping this message entirely
                        // or find some way to shrink it.
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
            
            // context.bindings.eventHubDocs = [{
            //     'originFolder': 'default-wknd',
            //     'targetFolder': jobId,
            // }];
            
            context.bindings.httpOutput = {
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
            await Time.sleep(1000);
            
            if (req.params.id) {
                // const jobId = req.params.id.split('_').pop();
                // const apiURL = `${IMPAAS_API_BASE_URL}/${jobId}`;
                
                // context.log('apiURL', apiURL);
                // await Time.sleep(1000);
                
                // // call importer service api
                // const resp = await fetch(apiURL, {
                //     method: 'GET',
                //     headers: {
                //         'x-api-key': IMPORTER_SERVICE_API_KEY,
                //     },
                // });
                
                // context.log('resp', resp);
                // await Time.sleep(1000);
                
                // if (!resp.ok) {
                //     context.res = {
                //         status: resp.status,
                //         body: buildErrorResponse(`Failed to get bulk import job status: ${resp.statusText}`),
                //     };
                //     return;
                // }
                
                // const respJson = await resp.json();
                
                // context.log('respJson', respJson);
                // await Time.sleep(1000);
                
                // const status = respJson.status;
                
                // switch (status) {
                //     case 'COMPLETE':
                //         context.res = {
                //             status: 200,
                //             body: {
                //                 jobId: req.params.id,
                //                 status: 'completed',
                //                 message: 'Bulk import job done',
                //             },
                //         };
                //         return;
                //     case 'FAILED':
                
                // } else if (status.)
                const now = Date.now();
                const startTime = req.params.id.split('-').pop();
                if (now - startTime > 42000) {
                    const results = [
                        '/us/en',
                        '/us/en/adventures',
                        '/us/en/faqs',
                        '/us/en/magazine',
                        '/us/en/magazine/western-australia',
                    ].map((url) => ({
                        url,
                        status: 'ok',
                        location: `${SP_ROOT_URL}/${req.params.id}/esaas-bulk-imports/default-wknd${url}.docx`,
                        message: 'Imported',
                    }));

                    context.res = {
                        status: 200,
                        body: {
                            jobId: req.params.id,
                            status: 'completed',
                            results,
                            message: 'Bulk import job done',
                        },
                    };
                    return;
                } else {
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
            
            // // force wait for 15 seconds
            // await Time.sleep(15000);
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
    