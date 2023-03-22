#!/usr/bin/env node

// imports
const { cliWorkerHandler } = require('../src/cliWorkerHandler.js');
const path = require('path');
const fs = require('fs');

/*
 * constants
 */

const MILO_BLOCK_SAMPLE_PAGE_ROOT = 'https://main--milo--adobecom.hlx.page/docs/library/blocks/';
const MILO_BLOCKS_DEFAULT = [ 'aside', 'marquee', 'icon-block', 'text', 'media', 'carousel', 'fragment', 'z-pattern' ];
const CUSTOM_BLOCKS_DEFAULT = [ 'unknown' ];

/*
 * Helper functions
 */

function getDefaultBlocksList() {
  return MILO_BLOCKS_DEFAULT.concat(CUSTOM_BLOCKS_DEFAULT);
}

function yargsBuilder(yargs) {
  return yargs
    .option('interactive', {
      alias: 'i',
      describe: 'Start the application in interactive mode, you will be prompted to copy/paste the list of URLs directly in the terminal. Enter an empty line to finish the process',
      type: 'boolean',
    })
    .option('file', {
      alias: 'f',
      describe: 'Path to a text file containing the list of URLs to deliver (urls pattern: "https://<branch>--<repo>--<owner>.hlx.page/<path>")',
      type: 'string',
    })
    .conflicts('f', 'i')
    .option('css-exclusions', {
      alias: 'e',
      describe: 'A list of CSS selectors to exclude from the analysis (comma separated)',
      type: 'string',
      default: 'header, footer, .globalnavheader, .globalnavfooter',
    })
    .option('output-folder', {
      alias: 'o',
      describe: 'The target folder for the generated data',
      type: 'string',
      default: 'sections-mapping',
    })
    .option('workers', {
      alias: 'w',
      describe: 'Number of workers to use (max. 5)',
      type: 'number',
      default: 1,
      coerce: (value) => {
        if (value > 8) {
          terminal.yellow('Warning: Maximum number of workers is 5. Using 5 workers instead.\n');
          return 8;
        }
        return value;
      },
    });
}

/*
 * Main
 */

exports.desc = 'Generate sections data for given list of URLs (json + screenshots)';
exports.builder = yargsBuilder;
exports.handler = async function(argv) {
  // prepare output folder structure
  const outputFolder = path.join(process.cwd(), argv.outputFolder);
  let blocksList = getDefaultBlocksList();

  // milo blocks
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  for (const block of blocksList) {
    const blockFolder = path.join(outputFolder, 'blocks', block);
    if (!fs.existsSync(blockFolder)) {
      fs.mkdirSync(blockFolder, { recursive: true });
    }
  }

  // milo blocks samples html page
  const blockSampleListItems = MILO_BLOCKS_DEFAULT.map((block) => `<li><a href="${MILO_BLOCK_SAMPLE_PAGE_ROOT}${block}">${block}</a></li>`);
  fs.writeFileSync(path.join(outputFolder, 'blocks', 'milo_blocks_samples_pages.html'), MILO_BLOCK_SAMPLE_PAGE_HTML.replace('%BLOCKS%', blockSampleListItems.join('\n')));

  // execute
  return await cliWorkerHandler('prepare_sections_data_worker.js', {
    outputFolder: argv.outputFolder,
  }, argv);
};

const MILO_BLOCK_SAMPLE_PAGE_HTML = `<html>
  <body>
  <h3><a href="https://milo.adobe.com" target="_blank">Milo</a> Blocks Sample Pages</h3>
  <ul>%BLOCKS%</ul>
  </body>
</html>`;
