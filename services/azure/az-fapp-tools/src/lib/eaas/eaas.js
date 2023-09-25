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

export class ImsService2ServiceAuth {
  constructor(imsUrl, clientId, clientSecret, scopes) {
    this.imsUrl = imsUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scopes = scopes;
  }

  async obtainToken() {
    const url = `${this.imsUrl}/ims/token/v3`;
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
    const jsonResponse = await response.json();
    return jsonResponse.access_token;
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
    return new EaaSProviderTask(await this.eaasClient.startLHTask(url, options));
  }

  /**
   * Execute a complete EaaS LH flow in a single function
   * 1. start LH task
   * 2. poll check LH task status until completion
   * 3. download LH JSON report
   *
   * @param {string} url
   * @returns {Promise<Response>}
   */
  async executeLHAnalysis(url, options = {}) {
    try {
      // 1. start LH task
      const lhTask = await this.startLHTask(url, options);

      console.log(`Lighthouse task started. 🚀`, lhTask);

      // 2. poll check (every 5s, timeout after 2min)
      const timeout = 30000;
      const retryDelay = 2000;
      const lhTaskStatus = await new Promise((resolve, reject) => {
        const start = Date.now();
        const check = async () => {
          console.log(`Lighthouse task status: ${lhTask.status} ⏳`);
          const status = await this.readLHTask(lhTask.id);
          if (status.completed) {
            resolve(status);
          } else if (Date.now() - start > timeout) {
            reject(new Error('timeout'));
          } else {
            setTimeout(check, retryDelay);
          }
        };
        check();
      });

      // 3. get report
      const lhReportUrl = lhTaskStatus.scores?.pages[0]?.reportLink?.href;
      if (!lhReportUrl) {
        throw new Error(`no report url for eaas lh task ${lhTask.id}`);
      }

      const reportResp = await fetch(lhReportUrl);
      const report = await reportResp.text();

      return new Response(report, {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    } catch (e) {
      return new Response(e.message, {
        status: e.response?.status || 500,
      });
    }
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
          const lhTask = await this.readLHTask(lhTaskId);
          console.log(`Lighthouse task status: ${lhTask.status} ⏳`);
          if (lhTask.completed) {
            resolve(lhTask);
          } else if (Date.now() - start > timeout) {
            reject(new Error('timeout'));
          } else {
            setTimeout(check, retryDelay);
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
          console.log(`Fetching Lighthouse JSON report: ${reportResp.status} ⏳`);
          if (reportResp.ok) {
            const lighthouseResult = await reportResp.text();
            const report = `{ "lighthouseResult" : ${lighthouseResult} }`;  
            resolve(report);
          } else if (Date.now() - start > timeout) {
            reject(new Error('timeout'));
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
      return new Response(e.message, {
        status: e.response?.status || 500,
      });
    }
  }
}

export class EaaSClient {
  constructor(eaasEndpoint, auth) {
    this.eaasEndpoint = eaasEndpoint;
    this.auth = auth;
  }

  static #taskIdFromStartTaskResponse(response) {
    /* eslint-disable no-underscore-dangle */
    return response._links['lh:task'].href.replace('/v1/tasks/lh/', '').split('?')[0];
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
    const accessToken = await this.auth.obtainToken();
    const lhTaskUrl = `${this.eaasEndpoint}/v1/tasks/lh/${taskID}?status=pending`;

    const response = await fetch(lhTaskUrl, {
      headers: EaaSClient.#headers(accessToken),
    });

    EaaSClient.#checkStatus(response, 200);
    return response.json();
  }

  async startLHTask(url, options = {}) {
    const accessToken = await this.auth.obtainToken();
    const lhTasksUrl = `${this.eaasEndpoint}/v1/tasks/lh`;

    const u = new URL(url);
    const host = u.origin;
    const page = u.pathname + u.search + u.hash;

    const payload = {
      service: {
        type: 'Franklin',
        id: 'hlx-test',
        url: host,
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

    const response = await fetch(lhTasksUrl, {
      headers: EaaSClient.#headers(accessToken),
      method: 'post',
      body: JSON.stringify(payload),
    });

    EaaSClient.#checkStatus(response, 202);
    return this.readLHTask(EaaSClient.#taskIdFromStartTaskResponse(await response.json()));
  }
}
