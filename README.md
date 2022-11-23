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

- global (to restrict to `dev` and `main` branches only)
- dev (to restrict to `dev` branch only)
- prod (to restrict to `main` branch only)

#### Secrets

- CHROMATIC_PROJECT_TOKEN: this must be a repository secret (not an environment one)
- LHCI_GITHUB_APP_TOKEN: this must be a repository secret (not an environment one)

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

For each build and runtime (since they are shared), you should have set:

- BUILDPACK_URL: `https://github.com/TheSecurityDev/heroku-buildpack-nodejs-pnpm`
- BUILD_APP_NAME: `main` \*(it would be `docs` if you wanted to deploy the other app)
- DATABASE_URL: `$SCALINGO_POSTGRESQL_URL` \*(filled by Scalingo automatically when adding a database)\_
