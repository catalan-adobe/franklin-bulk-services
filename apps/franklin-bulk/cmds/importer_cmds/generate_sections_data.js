#!/usr/bin/env node

// imports
const { cliWorkerHandler } = require('../../src/cliWorkerHandler.js');

/*
 * Helper functions
 */

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
      demandOption: true,
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
exports.handler = cliWorkerHandler.bind(null, 'generate_sections_data_worker.js', {});
