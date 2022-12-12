# Mediature

## Technical setup

### AlwaysData

This helps for DNS delegation (to configure domains, emails...).

### GitHub

#### Apps & Actions

- [CodeCov](https://github.com/marketplace/codecov): code coverage reports _(we have CodeQL in addition in the CI/CD... pick just one in the future)_
- [Lighthouse](https://github.com/apps/lighthouse-ci): accessibility reports _(we also have an accessibility plugin for Storybook, but this one only helps while developping)_

#### Environments

You must configure 2 environments in the CI/CD settings:

- `global` (to restrict to `dev` and `main` branches only)
- `dev` (to restrict to `dev` branch only)
- `prod` (to restrict to `main` branch only)

#### Secrets

The following ones must be repository secrets (not environment ones):

- `CHROMATIC_PROJECT_TOKEN`: [SECRET]
- `LHCI_GITHUB_APP_TOKEN`: [SECRET]
- `SENTRY_URL`: [SECRET] _(format `https://xxx.yyy.zzz/`)_
- `SENTRY_AUTH_TOKEN`: [SECRET]
- `SENTRY_ORG`: [SECRET]
- `SENTRY_PROJECT`: [SECRET]

#### Default branch

The default branch is `dev`.

#### Branch protection rules

1.  Pattern: `main`
    Checked:

    - Require status checks to pass before merging
    - Do not allow bypassing the above settings

2.  Pattern: `dev`
    Checked:

    - Require linear history
    - Do not allow bypassing the above settings
    - Allow force pushes (+ "Specify who can force push" and leave for administrators)

### Sentry

#### Upload sourcemaps

To upload sourcemaps to Sentry you need a specific "auth token", it must have these scopes:

- `project:releases`
- `org:read`

You can create this token at https://${SENTRY_URL}/settings/account/api/auth-tokens/ ;)

### Scalingo

#### Global

We enabled the Postgres addon and the "review apps" feature.

#### Postgres

##### Extensions

- uuid-ossp

##### Tooling

When using Docker you will be able to use `pgAdmin 4`, and for your local workspace just choose the software that fits your need. Preferences for:

- pgAdmin 4 (specific to Postgres)
- DBeaver (RDBMS-agnostic)

#### Environment variables

Scalingo is used as a PaaS to host our builds.

For each build and runtime (since they are shared), you should have set some environment variables.

##### For the "main" app

- `BUILDPACK_URL`: `https://github.com/TheSecurityDev/heroku-buildpack-nodejs-pnpm`
- `BUILD_APP_NAME`: `main` _(it would be `docs` if you wanted to deploy the other app)_
- `APP_MODE`: `prod` or `dev` _(depending on the instance you deploy)_
- `DATABASE_URL`: `$SCALINGO_POSTGRESQL_URL` _(filled by Scalingo automatically when adding a database)_
- `NEXT_AUTH_SECRET`: [SECRET] _(random string that can be generated with `openssl rand -base64 32`. Note that if this secret is lost, all users will have to log in again)_
- `NEXT_PUBLIC_APP_BASE_URL`: [TO_DEFINE] _(must be the root URL to access the application, format `https://xxx.yyy.zzz`)_
- `NEXT_PUBLIC_SENTRY_DSN`: [SECRET] _(format `https://xxx.yyy.zzz/nn`)_

#### Review apps

Those are temporary environments, different than `dev` and `prod`. Since they have their own random generated IDs, we use the `scalingo.json` file to:

- adjust environment variables
- seed the database to have some data to test on

#### Debug

To debug scalingo apps you may prefer using their CLI with some commands like:

```
scalingo login --api-token ${SCALINGO_API_TOKEN}
scalingo -a ${SCALINGO_APP_NAME} addons
scalingo -a ${SCALINGO_APP_NAME} logs
scalingo -a ${SCALINGO_APP_NAME} logs --addon ${SCALING_ADDON_ID}
scalingo -a ${SCALINGO_APP_NAME} run bash
scalingo -a ${SCALINGO_APP_NAME} db-tunnel ${SCALINGO_DATABASE_URL}
```

### Tips

#### Frontend development

##### Hydratation issue

When developing a frontend it's likely you will have client hydratation according to the server content. It will fail if some browser extensions are enabled and modify the DOM. You need to identify the source of the issue and then, either disable the extension, or request it to not modify the DOM when developing on `http://localhost:xxxx/`.

From our experience, this can be caused by:

- Password managers _(make sure to have no credentials that match your development URL)_
- Cookie banner automatic rejection _(in their settings you're likely to be able to exclude your development URL from being analyzed)_

_(in React the error was `Extra attributes from the server: xxxxx`)_

##### Cannot fetch specific files

As for any `hydratation issue` it worths taking a look at your browser extensions, some may block outgoing requests.

For example:

- Ad blockers _(whitelist the blocked URL in your extension)_
