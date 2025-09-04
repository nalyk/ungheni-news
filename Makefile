.PHONY: dev build pagefind check validate docs setup

HUGO ?= hugo

dev:
	$(HUGO) server -D

build:
	HUGO_ENV=production $(HUGO) --gc --minify

pagefind:
	npx -y pagefind --source public || echo "Pagefind not installed; skipping"

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
