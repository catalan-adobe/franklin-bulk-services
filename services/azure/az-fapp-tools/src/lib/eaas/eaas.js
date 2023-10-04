/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable max-classes-per-file */
import { fetch } from '../fetch.js';
import { extractHelixUrls } from '../franklin.js';

export class ImsService2ServiceAuth {
  constructor(imsUrl, clientId, clientSecret, scopes) {
    this.imsUrl = imsUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scopes = scopes;
    this._token = null;
  }

  async token() {
    if (!this._token) {
      this._token = await this.obtainToken();
    }
    return this._token;
  }

  async obtainToken() {
    const url = `${this.imsUrl}/ims/token/v3`;

    const token = await new Promise((resolve, reject) => {
      const timeout = 30000;
      const retryDelay = 1000;
      const start = Date.now();
      const check = async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
            scope: this.scopes,
          }).toString(),
        });

        if (response.ok) {
          const jsonResponse = await response.json();
          resolve(jsonResponse.access_token);
        } else if (Date.now() - start > timeout) {
          reject(new Error('timeout'));
        } else {
          setTimeout(check, retryDelay);
        }
      };
      check();
    });

    return token;
  }
}

class EaaSClientError extends Error {
  constructor(response, ...args) {
    super(`Error Response: ${response.status} ${response.statusText}`, ...args);
    this.response = response;
  }
}

export class EaaSProviderTask {
  static #isCompleted(eaasTask) {
    return eaasTask.status === 'terminated' || eaasTask.status === 'failed';
  }

  constructor(eaasTask) {
    this.provider = 'eaas';
    this.id = eaasTask.id;
    this.status = eaasTask.status;

    // remap statuses
    this.status = this.status === 'failed' ? 'error' : this.status;
    this.status = this.status === 'terminated' ? 'passed' : this.status;

    this.completed = EaaSProviderTask.#isCompleted(eaasTask);
    this.result = eaasTask;
    this.startedAt = eaasTask.createdAt;

    if (this.completed) {
      /* eslint-disable no-underscore-dangle */
      const eaasTaskResults = eaasTask._embedded['lh:task-results'];
      this.scores = {
        metrics: eaasTaskResults.metrics,
        /* eslint-disable no-underscore-dangle */
        pages: eaasTaskResults._embedded['lh:page-results'].map((pageResult) => ({
          metrics: pageResult.metrics,
          /* eslint-disable no-underscore-dangle */
          reportLink: pageResult._links['lh:lighthouse-report-shareable'],
          path: pageResult.page.path,
        })),
      };
    }
  }
}

export class EaaSProvider {
  constructor(eaasClient) {
    this.eaasClient = eaasClient;
  }

  static #isCompleted(eaasTask) {
    return eaasTask.status === 'terminated' || eaasTask.status === 'failed';
  }

  async readLHTask(taskID) {
    return new EaaSProviderTask(await this.eaasClient.readLHTask(taskID));
  }

  async startLHTask(url, options = {}) {
    const taskId = await this.eaasClient.startLHTask(url, options);
    return taskId;
  }

  /**
   * waitForJSONReport - wait for a LH Task to finish and return the JSON report
   * 1. poll check LH task status until completion
   * 2. download LH JSON report
   *
   * @param {string} lhTaskId - the existing EaaS LH Task ID
   * @returns {Promise<Response>}
   */
  async waitForJSONReport(lhTaskId) {
    try {
      // 1. poll check (every 2s, timeout after 5min)
      const timeout = 300000;
      const retryDelay = 2000;

      const lhTaskStatus = await new Promise((resolve, reject) => {
        const start = Date.now();
        const check = async () => {
          let lhTask = null;
          try {
            lhTask = await this.readLHTask(lhTaskId);
            this.eaasClient.logger(`Lighthouse task status: ${lhTask.status} ⏳`);
          } catch (e) {
            this.eaasClient.logger.error(`Error reading EaaS LH Task ${lhTaskId}: ${e}`)
          } finally {
            if (lhTask && lhTask.completed) {
              resolve(lhTask);
            } else if (Date.now() - start > timeout) {
              reject(new Error('timeout waiting for EaaS LH Task to complete'));
            } else {
              setTimeout(check, retryDelay);
            }
          }
        };
        check();
      });

      // 2. get report
      const lhReportUrl = lhTaskStatus.scores?.pages[0]?.reportLink?.href;
      if (!lhReportUrl) {
        throw new Error(`no report url for eaas lh task ${lhTask.id}`);
      }

      const report = await new Promise((resolve, reject) => {
        const timeout = 30000;
        const retryDelay = 1000;
        const start = Date.now();
        const check = async () => {
          const reportResp = await fetch(lhReportUrl);
          this.eaasClient.logger(`Fetching Lighthouse JSON report: ${reportResp.status} ⏳`);
          if (reportResp.ok) {
            const lighthouseResult = await reportResp.text();
            const report = `{ "lighthouseResult" : ${lighthouseResult} }`;  
            resolve(report);
          } else if (Date.now() - start > timeout) {
            reject(new Error('timeout fetching Lighthouse JSON report'));
          } else {
            setTimeout(check, retryDelay);
          }
        };
        check();
      });

      return new Response(report, {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    } catch (e) {
      this.eaasClient.logger.error(`Error waiting for JSON report for EaaS LH Task ${lhTaskId}: ${e}`);
      return new Response(e.message, {
        status: e.response?.status || 500,
      });
    }
  }
}

export class EaaSClient {
  constructor(eaasEndpoint, auth, logger = console) {
    this.eaasEndpoint = eaasEndpoint;
    this.auth = auth;
    this.logger = logger;
  }

  static #taskIdFromStartTaskResponse(response) {
    /* eslint-disable no-underscore-dangle */
    const taskId = response._links['lh:task'].href.replace('/v1/tasks/lh/', '').split('?')[0];
    return taskId;
  }

  static #checkStatus(response, expectedStatus) {
    if (response.status === expectedStatus) {
      return response;
    } else {
      throw new EaaSClientError(response);
    }
  }

  static #headers(accessToken) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Api-Key': 'eaas_cli',
      'X-Gw-Ims-Org-Id': 'AD3435505CAF3A610A495C2A@AdobeOrg',
      Accept: 'application/hal+json',
    };
  }

  async readLHTask(taskID) {
    this.logger(`EaaSClient readLHTask: ${taskID}`);

    const accessToken = await this.auth.token();
    const lhTaskUrl = `${this.eaasEndpoint}/v1/tasks/lh/${taskID}?status=pending`;

    const response = await fetch(lhTaskUrl, {
      headers: EaaSClient.#headers(accessToken),
    });

    EaaSClient.#checkStatus(response, 200);
    return response.json();
  }

  async startLHTask(url, options = {}) {
    try {
      const accessToken = await this.auth.token();
      const lhTasksUrl = `${this.eaasEndpoint}/v1/tasks/lh`;
      
      const u = new URL(url);
      const origin = u.origin;
      const page = u.pathname + u.search + u.hash;
      
      let serviceId = u.host.replace('www.', '');
      const franklinUrls = extractHelixUrls(url);
      if (franklinUrls.length > 0) {
        serviceId = `${franklinUrls[0].repo}--${franklinUrls[0].owner}`;
      }
      
      this.logger(`EaaSClient startLHTask for url ${url} (serviceId: ${serviceId})`);

      const payload = {
        service: {
          type: options.type,
          id: serviceId,
          url: origin,
          runmodes: ['publish'],
          users: [
            {
              role: 'admin',
              credentials: {
                type: 'basic',
                user: options.authToken ? 'hlx-auth-token' : 'admin',
                password: options.authToken || 's3cr3t',
              },
            },
          ],
        },
        pages: [page],
      };
  
      this.logger(`EaaSClient startLHTask payload: ${JSON.stringify(payload)}`);

      const response = await fetch(lhTasksUrl, {
        headers: EaaSClient.#headers(accessToken),
        method: 'post',
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`EaaSClient startLHTask http response not ok: ${response.status} ${response.statusText}`);
      }
  
      EaaSClient.#checkStatus(response, 202);
  
      const respJson = await response.json();
  
      const taskId = EaaSClient.#taskIdFromStartTaskResponse(respJson);
      this.logger(`EaaS LH Task started. taskId: ${taskId}`);
      return taskId;
    } catch (e) {
      this.logger.error(`EaaSClient startLHTask error: ${e}`);
      throw new Error(`EaaS startLHTask error: ${e}`);
    }
  }
}
