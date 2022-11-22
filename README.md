# Mediature

## Setup

### GitHub

#### Environments

You must configure 2 environments in the CI/CD settings:

- global (to restrict to `dev` and `main` branches only)
- dev (to restrict to `dev` branch only)
- prod (to restrict to `main` branch only)

#### Secrets

- CHROMATIC_PROJECT_TOKEN: this must be a repository secret (not an environment one)
