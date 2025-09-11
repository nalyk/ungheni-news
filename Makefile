.PHONY: dev build pagefind check validate docs setup

HUGO ?= hugo

dev:
	$(HUGO) server -D

build:
	HUGO_ENV=production $(HUGO) --gc --minify

PAGEFIND_NPM_CACHE ?= .cache/npm

pagefind:
	@mkdir -p $(PAGEFIND_NPM_CACHE)
	@echo "[pagefind] using npm cache at $(PAGEFIND_NPM_CACHE)"
	npm_config_cache=$(PAGEFIND_NPM_CACHE) npx -y pagefind \
	  --site public \
	  --output-subdir pagefind \
	  --root-selector "main" \
	  --exclude-selectors "nav,header,footer,.sidebar" \
	  || echo "Pagefind not installed; skipping"

check:
	$(HUGO) --printI18nWarnings --panicOnWarning || exit 1

validate:
	bash scripts/validate_content.sh

docs:
	bash scripts/update_agents.sh

setup:
	mkdir -p .git/hooks scripts/hooks
	cp -f scripts/hooks/pre-commit .git/hooks/pre-commit || true
	chmod +x .git/hooks/pre-commit || true
