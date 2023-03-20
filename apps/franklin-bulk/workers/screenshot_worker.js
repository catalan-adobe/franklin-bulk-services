const { parentPort } = require('worker_threads');

/*
 * Worker thread
 */

// Listen for messages from the parent thread
parentPort.on('message', async (msg) => {
  if (msg && msg.type === 'exit') {
    // If the parent thread sent 'exit', exit the worker thread
    process.exit();
  } else {
    const importerLib = await import('franklin-importer-shared');

    try {
      const OUTPUT_FOLDER = process.cwd()+'/output';

      console.log("Start browser script");
      
      const [browser, page] = await importerLib.Puppeteer.initBrowser();
      
      await importerLib.Puppeteer.runStepsSequence(page, msg.url, 
        [
          importerLib.Puppeteer.Steps.postLoadWait(500),
          importerLib.Puppeteer.Steps.GDPRAutoConsent(),
          importerLib.Puppeteer.Steps.smartScroll(),
          importerLib.Puppeteer.Steps.execAsync(async(page) => {
            await page.keyboard.press("Escape");
          }),
          importerLib.Puppeteer.Steps.fullPageScreenshot({
            outputFolder: OUTPUT_FOLDER,
          }),
        ]);
      
      // cool down
      await importerLib.Time.sleep(250);
      
      await browser.close();
      
      console.log("Stop browser script");

      parentPort.postMessage({
        url: msg.url,
        passed: true,
        result: 'Success',
      });
    } catch (error) {
      parentPort.postMessage({
        url: msg.url,
        passed: false,
        result: error.message,
      });
    }
  }
});
