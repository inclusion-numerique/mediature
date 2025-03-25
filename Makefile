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

lint-prepare:
	pnpm turbo lint:prepare

lint:
	pnpm turbo lint

test-prepare:
	pnpm turbo test:prepare

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

chromatic:
	pnpm run chromatic

simulate-cicd-with-push:
# Install `act` through a package manager to make it working
#
# Notes:
# - there is no way to specify the pipeline branch, you must locally change it
# - you can have weird issues like "unable to get git", try to set your local head to the remote one (with your changes uncommitted)
# - caching:
#   - for now the cache does not work and even if there is https://github.com/sp-ricard-valverde/github-act-cache-server it's a bit overheaded for a ponctual simulation
#   - using "--bind" is not ideal because `pnpm` will recreate the whole "node_modules" on the host, so we have to do `pnpm install` then (it would make sense for a computer dedicated to this)
#   - so we use "--reuse" that keeps using the existing docker container if any, to avoid downloading a new time each dependency. If you get weird behavior you can still remove the docker container from `act` and restart the command
# - we inject a meaningful commit SHA into "SOURCE_VERSION" otherwise a Jest process will fail since we use it for Sentry stuff in the Next.js app
# - the default image is missing browsers stuff for e2e tests and `docker-compose`, we added 2 steps in the workflow to not deal with a custom image not officially supported (and the full official image is around 15GB... we don't want that either)
# - `.actrc` breaks `act` commands in specific situations, we avoid using it to factorize commands
	act push --reuse --env-file .github/act/.env --env SOURCE_VERSION="$(git rev-parse @{upstream})" --eventpath .github/act/event.json
