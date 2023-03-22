#!/usr/bin/env node

// imports
const express = require('express');
var serveIndex = require('serve-index');
const crypto = require('crypto');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs');

/*
 * Helper functions
 */

function yargsBuilder(yargs) {
  return yargs
    .option('data-folder', {
      alias: 'd',
      describe: 'Folder containing the section data files',
      type: 'string',
      demandOption: true,
    })
    .option('blocks-folder', {
      alias: 'b',
      describe: 'Folder containing the qualified blocks screenshots',
      type: 'string',
      demandOption: true,
    });
}


/*
 * Helper functions
 */

function template(strings, ...keys) {
  return (...values) => {
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join("");
  };
}

async function sectionsDataHandler (req, res) {
  try {
    let filePattern = '';
    if (req.query.url) {
      const urlHash = crypto.createHash('sha1').update(req.query.url).digest('hex');
      filePattern = urlHash;
    } else if (req.query.pageHash) {
      filePattern = req.query.pageHash;
    }
    
    console.log(`Looking for sections data file matching pattern: "${path.join(res.dataFolder, `/**/${filePattern}-sections.json`)}"`);

    const jsfiles = await glob(path.join(res.dataFolder, `/**/${filePattern}-sections.json`));

    const jsFile = jsfiles[0];
  
    let dataFile = jsFile;

    const sectionsDataRaw = await fs.readFileSync(dataFile, 'utf8');
    const sectionsData = JSON.parse(sectionsDataRaw);
  
    const sections = [];
    for (let i = 0; i < sectionsData.length; i++) {
      const section = sectionsData[i];
  
      const fS = path.join(res.blocksFolder, `/**/${section.urlHash}*${section.xpathHash}*.png`);

      const blockFiles = await glob(fS);

      const blockFile = blockFiles[0];
  
      section.block = {
        type: 'na',
      }
      if (blockFile) {
        section.block.screenshot = 'http://localhost:3000/blocks/' + blockFile.split("blocks/")[1];
        section.block.type = blockFile.split("blocks/")[1].split("/")[0];
      } else {
        continue;
      }

      sections.push(section);
    }
  
    res.send(sections);
  } catch(e) {
    res.status(500).send(e);
  }
}


/*
 * Main
 */

exports.desc = 'Serve sections data via HTTP';
exports.builder = yargsBuilder;
exports.handler = function (argv) {
  const app = express();
  const port = 3000;
  const dataFolder = path.join(process.cwd(), argv.dataFolder,);
  const blocksFolder = path.join(process.cwd(), argv.blocksFolder);
  
  app.get('/', (req, res) => {
    res.send('<html><body><pre>' + APP_DEFAULT_OUTPUT(port) + '</pre></body></html>');
  })
  
  // static content routes
  app.use('/data', express.static(dataFolder), serveIndex(dataFolder, {'icons': true}));
  app.use('/blocks', express.static(blocksFolder), serveIndex(blocksFolder, {'icons': true}));
  // api routes
  app.get('/sections-data', (req, res, next) => {
    res.dataFolder = dataFolder;
    res.blocksFolder = blocksFolder;
    next();
  },
  sectionsDataHandler
);
  
  app.listen(port, () => {
    console.log(APP_DEFAULT_OUTPUT(port));
  });
}

const APP_DEFAULT_OUTPUT = template`
adobe.com Sections Mapping Server:
* Data:                           http://localhost:${0}/data
* Blocks:                         http://localhost:${0}/blocks
* Get Sections Mapping for a URL: http://localhost:${0}/sections-data?url=<url>
* Milo Blocks Sample Pages List:  http://localhost:${0}/blocks/milo_blocks_samples_pages.html
`;