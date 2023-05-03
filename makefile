#
# Init
#

# variables
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

# Check Requirements
EXECUTABLES = az func node npm
K := $(foreach exec,$(EXECUTABLES),\
        $(if $(shell which $(exec)),some string,$(error "Missing command '$(exec)' in PATH")))

# Check that given variables are set and all have non-empty values,
# die with an error otherwise.
#
# Params:
#   1. Variable name(s) to test.
#   2. (optional) Error message to print.
check_defined = \
    $(strip $(foreach 1,$1, \
        $(call __check_defined,$1,$(strip $(value 2)))))
__check_defined = \
    $(if $(value $1),, \
      $(error Undefined $1$(if $2, ($2))))

#SHELL := /bin/bash
AZ_LOGGED_IN=$(shell az account show > /dev/null 2>&1 ; echo $$?)



#
# Azure
#

az-login:
ifeq ($(AZ_LOGGED_IN),1)
	@echo "Login to Azure ..."
	@az login --only-show-errors --output none
	@echo "Force Subscription to DMa/AEM Engineering (AZR0022) ..."
	@az account set --subscription "DMa/AEM Engineering (AZR0022)"
else
	@echo "Already logged in to Azure"
endif



#
# Azure Function Apps
#

az-fapp-clean:
	$(call check_defined, build-dir)
	@echo "Cleaning local Azure Function App build in ${build-dir}"
	@rm -rf ${build-dir}

az-fapp-build: #az-login
	$(call check_defined, function-app)
	$(call check_defined, build-dir)
	$(call check_defined, fapp-folder)

	@echo "Generating Azure Functions in ${build-dir} (from function app folder ${fapp-folder})"
	@mkdir -p ${build-dir}

	@cp ${fapp-folder}/package.json ${build-dir}/package.json
	@cp ${fapp-folder}/host.json ${build-dir}/host.json
	@cp ${fapp-folder}/.funcignore ${build-dir}/.funcignore
	@cp ${fapp-folder}/.npmrc ${build-dir}/.npmrc

	@echo "Getting function app settings from ${function-app}"
	@cd ${build-dir}; \
	func azure functionapp fetch-app-settings '${function-app}'

	@echo "Build project"
	@cd ${build-dir}; \
	npm install;

	@echo "Copy code"
	@cp -R ${fapp-folder}/src/* ${build-dir}/

az-fapp-copy-code:
	$(call check_defined, build-dir)
	$(call check_defined, fapp-folder)

	@echo "Copy code"
	@cp -R ${fapp-folder}/src/* ${build-dir}/

az-fapp-deploy:
	$(call check_defined, function-app)
	$(call check_defined, build-dir)

	@echo "Deploying Azure Functions to function app ${function-app} ..."
	@cd ${build-dir}; \
	func azure functionapp publish ${function-app} --build remote --nozip
