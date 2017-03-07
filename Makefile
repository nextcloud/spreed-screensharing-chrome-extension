SRC := ./extension
DIST := ./dist
ZIP := $(shell which zip)

PACKAGE_NAME := nextcloud-video-calls-screensharing
PACKAGE_VERSION := $(shell node -e "fs=require('fs');console.log(JSON.parse(fs.readFileSync(process.argv[1])).version)" ./extension/manifest.json)

build:
	rm -rf $(DIST); \
	mkdir -p $(DIST); \
	cd $(SRC); \
	find . -type f -print | $(ZIP) ../$(DIST)/$(PACKAGE_NAME)-$(PACKAGE_VERSION).zip -@

