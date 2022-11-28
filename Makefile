define HELP_TEXT

  Makefile commands

	make deps       - Install dependent programs and libraries
	make ...     	  - (see the Makefile)

endef

help:
	$(info $(HELP_TEXT))

build:
	pnpm turbo build
#--mode prod

build-dev:
	pnpm turbo build
#--mode dev

serve:
	pnpm turbo dev
#--mode test

serve-dev:
	pnpm turbo dev
#--mode dev

lint:
	pnpm turbo lint

test-unit:
	pnpm turbo test:unit

test-unit-watch:
	pnpm turbo test:unit:watch

test-e2e:
	pnpm turbo test:e2e:headless

clean:
	pnpm turbo clean

accessibility:
	pnpm turbo accessibility

accessibility-open:
	pnpm turbo accessibility:open

deps:
	pnpm install

tools-up:
	docker-compose up -d

tools-down:
	docker-compose down

format:
	pnpm run format

format-check:
	pnpm run format:check
