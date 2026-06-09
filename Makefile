# Portfolio — task runner
# Usage: `make serve` (or just `make`)

.DEFAULT_GOAL := serve
.PHONY: serve dev install build preview clean

## serve: install deps if needed, then start the dev server
serve: node_modules
	npm run dev

## dev: alias for serve
dev: serve

## install: install dependencies
install:
	npm install

# install deps only when missing (package.json newer than node_modules)
node_modules: package.json
	npm install
	@touch node_modules

## build: type-check and build for production into dist/
build: node_modules
	npm run build

## preview: serve the production build locally
preview: build
	npm run preview

## clean: remove build output and installed deps
clean:
	rm -rf dist node_modules
