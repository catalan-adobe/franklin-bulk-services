Franklin Importer Service
===

## Azure Service

Set of Azure functions dedicated to Franklin Import tasks

### Local Setup

Requires
* Azure subscription
* Azure [CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli#install)
* Azure Functions [CLI](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local#install-the-azure-functions-core-tools)

1. Build the functions

  ```
  make az-fapp-build function-app=<AZURE_FUNCTION_APP_NAME> build-dir=<FN_TARGET_FOLDER> fapp-folder=<ORIGIN_FUNCTIONS_SRC_FOLDER>
  ```

2. Run the functions locally

  ```
  func start --verbose --enable-json-output --javascript
  ```