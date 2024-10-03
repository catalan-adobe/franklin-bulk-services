ESaaS Azure Functions
===

## Bulk Import **V1**

Bulk import URLs using default import script

### Start Import Job

`POST /api/import/bulk/default/job`

#### Parameters

Provided as FORM Data

- `urls` array of urls to import

#### Examples

- `curl`

1. Start Job

```
curl -v -X POST \
  -d '{ "urls": [ "https://wknd.site/us/en.html", "https://wknd.site/us/en/adventures.html" ] }' \
  <FUNCTIONS_ENDPOINT>/api/import/bulk/default/job
```

Returns

```
{
  "jobId": "{jobId}",
  "status": "started",
  "message": "Bulk import job started successfully",
  "statusPath": "/job/{jobId}",
  "urls": [
    "https://wknd.site/us/en.html",
    "https://wknd.site/us/en/adventures.html"
  ]
}
```

2. Get Job Status

```
curl -v <FUNCTIONS_ENDPOINT>/api/import/bulk/default/job/{jobId}
```

Returns

* `pending`

  ```
  {
    "jobId": "{jobId}",
    "status": "running",
    "message": "Bulk import job still running"
  }
  ```

* `completed`

  ```
  {
    "jobId": "{jobId}",
    "status": "completed",
    "results": [
      {
        "url": "/us/en",
        "status": "ok",
        "location": "{sharepoint_root_folder}/{jobId}/esaas-bulk-imports/default-wknd/us/en.docx",
        "message": "Imported"
      },
      {
        "url": "/us/en/adventures",
        "status": "ok",
        "location": "{sharepoint_root_folder}/{jobId}/esaas-bulk-imports/default-wknd/us/en/adventures.docx",
        "message": "Imported"
      },
      {
        "url": "/us/en/faqs",
        "status": "ok",
        "location": "{sharepoint_root_folder}/{jobId}/esaas-bulk-imports/default-wknd/us/en/faqs.docx",
        "message": "Imported"
      },
      {
        "url": "/us/en/magazine",
        "status": "ok",
        "location": "{sharepoint_root_folder}/{jobId}/esaas-bulk-imports/default-wknd/us/en/magazine.docx",
        "message": "Imported"
      },
      {
        "url": "/us/en/magazine/western-australia",
        "status": "ok",
        "location": "{sharepoint_root_folder}/{jobId}/esaas-bulk-imports/default-wknd/us/en/magazine/western-australia.docx",
        "message": "Imported"
      }
    ],
    "message": "Bulk import job done"
  }
  ```





---



## Bulk Import **V2**

### Start Import Job

`POST /api/import/bulk/default/job`

#### Parameters

Provided as FORM Data

- **`urls`** array of urls to import
- `target` (optional) the Sharepoint target. Must be **`esaas`** or **`lpb`** (default: `esaas`)
- `username` (optional) the username used as subfolder in target Sharepoint

#### Examples

- `curl`

1. Start Job

```
curl -v -X POST \
  -d '{ "urls": [ "https://wknd.site/us/en.html", "https://wknd.site/us/en/faqs.html" ], "target": "lpb", "username": "simon" }' \
  <FUNCTIONS_ENDPOINT>/api/import/bulk/default/job
```

Returns

```
{
  "jobId": "lpb_simon_7e704e45-XXXX-47e4-XXXX-82faae297425",
  "status": "started",
  "message": "Bulk import job started successfully",
  "target": "lpb",
  "username": "simon",
  "statusPath": "http://localhost:7071/api/v2/import/bulk/default/job/lpb_simon_7e704e45-XXXX-47e4-XXXX-82faae297425",
  "urls": [
    "https://wknd.site/us/en.html",
    "https://wknd.site/us/en/faqs.html"
  ]
}
```

2. Get Job Status

```
curl -v <FUNCTIONS_ENDPOINT>/api/import/bulk/default/job/{jobId}
```

Returns

* `pending`

    ```
    {
      "jobId": "{jobId}",
      "status": "running",
      "message": "Bulk import job still running"
    }
    ```

* `completed`

    ```
    {
      "jobId": "{jobId}",
      "status": "completed",
      "results": [
        {
          "url": "/us/en",
          "status": "ok",
          "location": "{sharepoint_root_folder}/${username}/${jobId}/docx/us/en.docx",
          "message": "Imported"
        },
        {
          "url": "/us/en/faqs",
          "status": "ok",
          "location": "{sharepoint_root_folder}/${username}/${jobId}/docx/us/en/faqs.docx",
          "message": "Imported"
        }
      ],
      "message": "Bulk import job done"
    }
    ```
