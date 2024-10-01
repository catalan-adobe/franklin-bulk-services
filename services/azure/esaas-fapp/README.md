ESaaS Azure Functions
===

## Bulk Import 

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