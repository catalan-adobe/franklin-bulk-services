#!/usr/bin/env node

// imports
const { cliWorkerHandler } = require('../src/cliWorkerHandler.js');
const { defaultCLICmdWithWorkerYargsBuilder } = require('../src/yargs.js');

// constants
const FRANKLIN_STAGE_PREVIEW = 'preview';

/*
 * Main
 */

exports.desc = 'Publish pages to preview stage on Franklin';
exports.builder = defaultCLICmdWithWorkerYargsBuilder;
exports.handler = cliWorkerHandler.bind(null, 'publish_worker.js', { stage: FRANKLIN_STAGE_PREVIEW });
