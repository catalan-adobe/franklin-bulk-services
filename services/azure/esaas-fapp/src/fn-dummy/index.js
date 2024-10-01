import * as importerLib from 'franklin-bulk-shared';

export async function main(context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    context.log('context');
    await context.log(context);

    await importerLib.Time.sleep(5000);

    context.log('req');
    await context.log(req);
};
