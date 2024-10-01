/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  h1NoCache, Response, timeoutSignal,
} from '@adobe/fetch';

import {
  cleanupHeaderValue,
  logLevelForStatusCode,
  propagateStatusCode,
} from '@adobe/helix-shared-utils';

// use stateless fetch to avoid hanging processes
export const { fetch } = h1NoCache({
  userAgent: 'adobe-fetch', // static user-agent for recorded tests
});

const DOMAIN_OVERRIDE = {
  'main--express-website--adobe.hlx.live': 'express-website--adobe.hlx.live',
  'main--spark-website--adobe.hlx.live': 'spark-website--adobe.hlx.live',
};

export function getLiveDomain(owner, repo, ref = 'main') {
  const domain = `${ref}--${repo}--${owner}.hlx.live`;
  return DOMAIN_OVERRIDE[domain] || domain;
}

/**
 * Returns fetch compatible options with the common headers set
 * @param {UniversalContext} ctx the context
 * @param {object} [opts] additional fetch options
 * @return {object} fetch options.
 */
export function getFetchOptions(ctx, opts) {
  const fetchopts = {
    headers: {
      'cache-control': 'no-cache', // respected by runtime
    },
  };
  if (ctx.requestId) {
    fetchopts.headers['x-request-id'] = ctx.requestId;
  }
  if (ctx.githubToken) {
    fetchopts.headers['x-github-token'] = ctx.githubToken;
  }
  if (opts?.fetchTimeout) {
    fetchopts.signal = timeoutSignal(opts.fetchTimeout);
    delete fetchopts.fetchTimeout;
  }
  if (opts?.lastModified) {
    fetchopts.headers['if-modified-since'] = opts.lastModified;
    delete fetchopts.lastModified;
  }
  return fetchopts;
}

/**
 * Logs and creates an error response.
 * @param {Logger} [log] Logger.
 * @param {number} status The HTTP status. if negative, the status will be turned into a
 *                        gateway status response.
 * @param {string} message Error message. if empty, body is used.
 * @param {string} [body = '']
 * @returns {Response}
 */
export function errorResponse(log, status, message, body = '') {
  if (!message) {
    // eslint-disable-next-line no-param-reassign
    message = body;
  }
  log[logLevelForStatusCode(Math.abs(status))](message);
  if (status < 0) {
    // eslint-disable-next-line no-param-reassign
    status = propagateStatusCode(-status);
  }
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/plain',
      'cache-control': 'no-store, private, must-revalidate',
      'x-error': cleanupHeaderValue(message),
    },
  });
}

/**
 * Returns the external url for the given path
 * @param {PathInfo} info the info
 * @param {string} path path
 * @param {object} [query] optional query
 * @returns {string} the url
 */
export function getLinkUrl(info, path, query) {
  const url = new URL(`${info.scheme}://${info.host}${info.functionPath}${path}`);
  Object.entries(info.query).forEach(([name, value]) => {
    url.searchParams.append(name, value);
  });
  if (query) {
    Object.entries(query).forEach(([name, value]) => {
      url.searchParams.append(name, value);
    });
  }
  if (info.branch && info.branch !== info.ref) {
    url.searchParams.append('branch', info.branch);
  }
  return url.href;
}

/**
 * Returns the API urls for the given info and route
 * @param {UniversalContext} ctx the universal context
 * @param {PathInfo} info the info
 * @param {string[]} routes the routes
 * @returns {object} an object with the given routes
 */
export function getAPIUrls(ctx, info, ...routes) {
  const links = {};
  routes.forEach((route) => {
    links[route] = getLinkUrl(info, `/${route}/${info.owner}/${info.repo}/${info.ref}${info.path}`);
  });
  return links;
}

export function toSISize(bytes, precision = 2) {
  if (bytes === 0) {
    return '0B';
  }
  const mags = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  const LOG_1024 = Math.log(1024);

  const magnitude = Math.floor(Math.log(Math.abs(bytes)) / LOG_1024);
  const result = bytes / (1024 ** magnitude);
  return `${result.toFixed(magnitude === 0 ? 0 : precision)}${mags[magnitude]}`;
}

export function FileSizeFormatter(lang, options) {
  return {
    format: (bytes) => {
      const myoptions = {
        unit: 'byte',
        notation: 'standard',
        unitDisplay: 'long',
        style: 'unit',
        maximumSignificantDigits: 2,
        ...options,
      };
      if (bytes === 0) {
        return new Intl.NumberFormat(lang, myoptions).format(0);
      }
      const mags = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte', 'exabyte'];
      const LOG_1024 = Math.log(1024);

      const magnitude = Math.floor(Math.log(Math.abs(bytes)) / LOG_1024);
      const result = bytes / (1024 ** magnitude);

      myoptions.unit = mags[magnitude];
      return new Intl.NumberFormat(lang, myoptions).format(result);
    },
  };
}

export function* cartesian(...arrays) {
  const len = arrays.length;
  const idx = new Array(len).fill(0);
  let done = false;
  do {
    yield arrays.map((a, i) => a[idx[i]]);
    for (let i = 0; i < len; i += 1) {
      if (idx[i] < arrays[i].length - 1) {
        idx[i] += 1;
        break;
      } else {
        idx[i] = 0;
        if (i === len - 1) {
          done = true;
        }
      }
    }
  } while (!done);
}

/**
 * Determines whether a URL is "internal", i.e. it points to some internal host/port
 * combination that we don't want to expose.
 *
 * @param {URL} url url to test
 * @returns true if the url is internal, otherwise false
 */
export function isInternal(url) {
  return (url.protocol !== 'https:'
    || url.port !== ''
    || url.hostname === 'localhost'
    || url.hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
  );
}
