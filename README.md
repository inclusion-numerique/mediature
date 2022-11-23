# Mediature

## Technical setup

### AlwaysData

This helps for DNS delegation (to configure domains, emails...).

### GitHub

#### Environments

You must configure 2 environments in the CI/CD settings:

- global (to restrict to `dev` and `main` branches only)
- dev (to restrict to `dev` branch only)
- prod (to restrict to `main` branch only)

#### Secrets

- CHROMATIC_PROJECT_TOKEN: this must be a repository secret (not an environment one)

### Scalingo

#### Global

We enabled the Postgres addon and the "review apps" feature.

#### Environment variables

Scalingo is used as a PaaS to host our builds.

For each build and runtime (since they are shared), you should have set:

- BUILDPACK_URL: `https://github.com/TheSecurityDev/heroku-buildpack-nodejs-pnpm`
- BUILD_APP_NAME: `main` \*(it would be `docs` if you wanted to deploy the other app)
- DATABASE_URL: `$SCALINGO_POSTGRESQL_URL` \*(filled by Scalingo automatically when adding a database)\_
