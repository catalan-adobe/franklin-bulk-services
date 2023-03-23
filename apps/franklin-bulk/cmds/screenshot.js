#!/usr/bin/env node

// imports
const { cliWorkerHandler } = require('../src/cliWorkerHandler.js');
const { defaultCLICmdWithWorkerYargsBuilder } = require('../src/yargs.js');

/*
 * Main
 */

exports.desc = 'Take full page screenshots for given list of URLs';
exports.builder = defaultCLICmdWithWorkerYargsBuilder;
exports.handler = cliWorkerHandler.bind(null, 'screenshot_worker.js', {});
