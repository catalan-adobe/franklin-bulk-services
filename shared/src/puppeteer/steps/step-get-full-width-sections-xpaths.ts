/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import crypto from 'crypto';
import fs from 'fs';
import pUtils from 'path';
import { buildPathAndFilenameWithPathFromUrl } from '../../url.js';
import sharp from 'sharp';
import { Buffer } from 'node:buffer';
import { writeFileSync } from 'fs';
import { sleep } from '../../time.js';

type GetFullWidthSectionsXPathsStepOptions = {
  outputFolder?: string;
  exclusions?: string
};

export function getFullWidthSectionsXPaths({ outputFolder = process.cwd() + '/xpaths', exclusions = '' }: GetFullWidthSectionsXPathsStepOptions = {}) {
  return function(action) {
    return async (params) => {
      try {
        console.info('do get full-width sections xpaths');



        // main action
        await action(params);
        


        /*
         * init
         */

        const cssExclusions = exclusions.split(',').map((x) => x.trim());

        // prepare output folder
        let [path, filename] = buildPathAndFilenameWithPathFromUrl(params.url, 'sections-screenshot', 'png');
        path = pUtils.join(outputFolder, path);
        if (!fs.existsSync(path)){
          fs.mkdirSync(path, { recursive: true });
        }
        
        // Evaluate JavaScript
        const pageHeight = await params.page.evaluate(() => {
          return window.document.body.scrollHeight;
        });
    
        await params.page.setViewport({
          width: 1280,
          height: pageHeight,
          deviceScaleFactor: 1,
        });

        // inject javascript function to generate xpath
        await params.page.addScriptTag({
          content: pptrPageScript,
        });

        /*
         * Look for "sections"
         */
        const sections = [];
        const urlHash = crypto.createHash('sha1').update(params.url).digest('hex');

        // get all divs
        const divs = await params.page.$$('div');

        // loop over all divs to find full-width sections
        for (let i = 0; i < divs.length; i++) {
          const div = divs[i];
          // @ts-expect-error: Let's ignore a compile error like this unreachable code
          const xpathWithClasses = await div.$eval(':scope', node => window.getXPath(node, true));
          const checkCSSExclusions = await Promise.all(cssExclusions.map(async (e) => {
            // @ts-expect-error: Let's ignore a compile error like this unreachable code
            const b = await div.$eval(':scope', (node, css) => window.parentHasCSSSelector(node, css), e);
            const res = b === true;
            return res;
          }));
          const isCSSExcluded = checkCSSExclusions.some((x) => x === true);
          const boundingBox = await div.boundingBox();

          // is the div a full-width section?
          if (!isCSSExcluded && boundingBox && boundingBox.x === 0 && boundingBox.y >= 0 && boundingBox.width > 1180 && boundingBox.height > 50 && boundingBox.height < 0.8 * pageHeight) {
            const section = {
              x: Math.floor(boundingBox.x),
              y: Math.floor(boundingBox.y),
              width: Math.floor(boundingBox.width),
              height: Math.floor(boundingBox.height),
              url: params.url,
              urlHash,
              div,
              xpathWithClasses,
              xpath: '',
              xpathHash: '',
            };

            // @ts-expect-error: Let's ignore a compile error like this unreachable code
            const xpath = await div.$eval(':scope', node => window.getXPath(node, false));
            section.xpath = xpath;

            const xpathHash = crypto.createHash('sha1').update(xpath).digest('hex');
            section.xpathHash = xpathHash;

            if (sections.length === 0) {
              sections.push(section);
            }

            const already = sections.some((s) => s.x === section.x && s.y === section.y && s.width === section.width && s.height === section.height);
            if (!already) {
              sections.push(section);
            }
          }
        }

        let selectedXpathPattern = '';
        const xpathGrouping = [];
        sections.forEach((s) => {
          const xp = s.xpath.substring(0, s.xpath.lastIndexOf('['));
          if (!xpathGrouping[xp]) {
            xpathGrouping[xp] = 1;
          } else {
            xpathGrouping[xp]++;
            if (xpathGrouping[xp] > 3) {
              selectedXpathPattern = xp;
              return;
            }
          }
        });

        const result = sections.filter((element, index, array) => { 
          return element.xpath.substring(0, element.xpath.lastIndexOf('[')) === selectedXpathPattern;
        });

        for (let i = 0; i < result.length; i++) {
          const section = result[i];
          await section.div.screenshot({
            path: pUtils.join(path, urlHash + '.section-' + i + '.' + section.xpathHash + '.' + filename + '.png'),
          });
          await sleep(100);
        }

        // save sections data json file
        await writeFileSync(pUtils.join(path, urlHash + '-sections' + '.json'), JSON.stringify(sections, null, 2));

        // save a page screenshot with all discovered sections boxes
        await generateAndSavePageScreenshotWithSectionsBoxes(result, params.page, pUtils.join(path, urlHash + '.' + filename));
      } catch(e) {
        console.error('get full-width sections xpaths catch', e);
        params.result = {
          passed: false,
          error: e,
        };
      } finally {
        console.info('get full-width sections xpaths finally');
        return params;
      }
    };
  };
}

async function generateAndSavePageScreenshotWithSectionsBoxes(sections, page, filename) {
  const screenshot = await page.screenshot({
    encoding: 'binary',
    fullPage: true,
    type: 'jpeg',
    quality: 10,
  });

  await sleep(1000);

  const boxes = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const svgBuffer = `<svg width="${section.width}" height="${section.height}">
        <rect width="${section.width-8}" height="${section.height-8}" x="4" y="4" fill="none" stroke="#00F" stroke-width="2"/>
      </svg>`;
    boxes.push({
      input: Buffer.from(svgBuffer),
      left: section.x,
      top: section.y,
    });
  }

  return await sharp(screenshot)
    .composite(boxes)
    .png()
    .toFile(filename);
}

const pptrPageScript = `
window.getXPath = function(elm, addClass = false) {
  var allNodes = document.getElementsByTagName('*');
  for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
    /*if (elm.hasAttribute('id')) {
        var uniqueIdCount = 0;
        for (var n=0;n < allNodes.length;n++) {
            if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
            if (uniqueIdCount > 1) break;
        };
        if ( uniqueIdCount == 1) {
            segs.unshift('id("' + elm.getAttribute('id') + '")');
            return segs.join('/');
        } else {
            segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
        }
    } else if (elm.hasAttribute('class')) {
        segs.unshift(elm.localName.toLowerCase() + '[@class="' + [...elm.classList].join(" ").trim() + '"]');
    } else {*/
    if (addClass && elm.hasAttribute('class')) {
      segs.unshift(elm.localName.toLowerCase() + '[@class="' + [...elm.classList].join(" ").trim() + '"]');
    } else {

        for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
            if (sib.localName == elm.localName)  i++;
        }
        segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
    }
  }
  return segs.length ? '/' + segs.join('/') : null;
};
window.parentHasCSSSelector = function(elm, selector) {
  console.log(selector, elm.closest(selector), elm);
  return elm.closest(selector) !== null;
};
`;