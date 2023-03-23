#!/usr/bin/env node

// imports
const { cliWorkerHandler } = require('../src/cliWorkerHandler.js');
const { defaultCLICmdWithWorkerYargsBuilder } = require('../src/yargs.js');

/*
 * Main
 */

exports.desc = 'Executes Lighthouse analysis for a list of URLs';
exports.builder = defaultCLICmdWithWorkerYargsBuilder;
exports.handler = cliWorkerHandler.bind(null, 'lighthouse_worker.js', {});
