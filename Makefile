VERSION := $(shell node -e "fs=require('fs');console.log(JSON.parse(fs.readFileSync(process.argv[1])).version)" ./extension/manifest.json)

all:
	@echo "Version: $(VERSION) - use \"make zip\" to build ..."

dist:
	@mkdir -p dist
	@cp -r extension dist

zip: dist
	cd dist && zip ../nextcloud-spreed-screensharing-$(VERSION).zip extension/*

.PHONY: dist
