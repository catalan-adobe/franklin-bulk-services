#!/usr/bin/env node

(async function main() {
  await require('yargs/yargs')(process.argv.slice(2))
    .commandDir('cmds')
    .demandCommand()
    .help('h')
    .argv;
})();
