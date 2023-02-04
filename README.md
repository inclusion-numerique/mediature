# Mediature

## Technical setup

### AlwaysData

This helps for DNS delegation (to configure domains, emails...). Configuration steps will be specified below for each service that needs specific DNS records.

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

#### Domains

For each environment you need to configure the domain DNS records to target the Scalingo instance when accessing the domain. It should look like:

- Type: `CNAME`
- Hostname: `www`
- Value: `xxxxxxxxxx.scalingo.io` _(depending on the environment)_

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
- `MAILER_DEFAULT_DOMAIN`: [TO_DEFINE] _(format `xxx.yyy.zzz` depending on the environment application URL)_
- `MAILER_DOMAINS_TO_CATCH`: `domain.demo` _(this should only be set in the development environment)_
- `MAILER_SMTP_HOST`: [SECRET]
- `MAILER_SMTP_PORT`: [SECRET]
- `MAILER_SMTP_USER`: [SECRET]
- `MAILER_SMTP_PASSWORD`: [SECRET]
- `MAILER_FALLBACK_SMTP_HOST`: [SECRET]
- `MAILER_FALLBACK_SMTP_PORT`: [SECRET]
- `MAILER_FALLBACK_SMTP_USER`: [SECRET]
- `MAILER_FALLBACK_SMTP_PASSWORD`: [SECRET]

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

### Emails

We use 2 providers to send emails:

- the main one (Mailjet)
- the fallback one (SendInBlue) in case the main one is not reachable it keeps our delivary reactive

Sending verified emails must be taken seriously so they don't end into the spam inbox. Keeping a good reputation by sending necessary content so users don't flag you as spam.

Also you need to configure your DNS records to handle from both providers on the 2 environments (development and production): DMARC/DKIM/SPF. It's well explained when adding sending domains on their interface. It will make your emails signed according to your domain.

When creating SMTP credentials make sure sure to use different ones between the development and the production environment.

### IDE

Since the most used IDE as of today is Visual Studio Code we decided to go we it. Using it as well will make you benefit from all the settings we set for this project.

#### Manual steps

Every settings should work directly when opening the project with `vscode`, except for TypeScript.

Even if your project uses a TypeScript program located inside your `node_modules`, the IDE generally uses its own. Which may imply differences since it's not the same version. We do recommend using the exact same, for this it's simple:

1. Open a project TypeScript file
2. Open the IDE command input
3. Type `TypeScript` and click on the item `TypeScript: Select TypeScript Version...`
4. Then select `Use Workspace Version`

In addition, using the workspace TypeScript will load `compilerOptions.plugins` specified in your `tsconfig.json` files, which is not the case otherwise. Those plugins will bring more confort while developing!

### Tips

#### Frontend development

##### i18n

Currently we only use i18n to help displaying ENUM values. We use the `i18n Ally` VSCode extension to improve a bit the usage but everything can be written manually in `.json` files :)

##### Storybook

###### Use it first

Developing a UI component by launching the whole application is annoying because you may have to do specific interactions to end viewing the right state of the component you are building.

We advise when doing some UI to only run Storybook locally, so you do not worry about other stuff. You can also mock your API calls! At the end splitting your component into different stories makes easy for non-technical people of the team to view deepest details. They will be able to review the visual changes with Chromatic, and also from the Storybook they will save too their time avoiding complex interactions to see specific state of the application.

It's not magical, it does not replace unit and end-to-end testing, but it helps :)

###### Advantages

- Accessibility reports
- See almost all tests of your application
- Helps architecturing your components split
- Their rendering is tested in the CI/CD, so it's very likely your components are valid at runtime

###### How we test stories

You can do UI testing scoped to components (I mean, not full end-to-end), and if so, it's recommended to reuse the stories to benefit from their mocking set up.

A decision we took to keep in mind: it's common to create a `.test.js` file to test that a component renders correctly (thanks to Jest, Playwright or Cypress), but since we have "Storybook test runners" already in place that pop each component, we feel it's better to use the story `play` function concept (also used by the interaction addon) to make sure they are rendering correctly.

- It avoids rendering each component one more time
- It saves 1 file and it's clearer since from Storybook you can see in the "Interactions" tab if the expected behavior is matched

Those kind of tests may be useful to:

- Make sure for an atomic component the data is displayed correctly (but it's likely the work of your team to review visual changes)
- Guarantee the sequences when mocking (e.g. first a loader, then the form is displayed), it helps also the "Storybook test runners" to wait the right moment to take a screenshot/snapshot of the final state (through Chromatic in this case), not intermediate ones since the runner doesn't know when the component is fully loaded otherwise

_(in case you have specific needs of testing that should not pollute the Storybook stories, go with a `.test.js` file, see examples [here](https://storybook.js.org/docs/react/writing-tests/importing-stories-in-tests))_

_Tip: during the testing you could `findByText` but it's recommended to `findByRole`. It helps thinking and building for accessibility from scratch (because no, accessibility is not done/advised by an accessibility automated check unfortunately)._

###### Testing performance

During the test we render the story, we test the light theme accessibility and then we switch to the dark theme to test it too. The re-rendering for color change over the entire DOM is unpredictable, it depends on the CPU saturation. We had some leakage of previous theme rendered over the new one.

We evaluated 2 solutions:

- limit the number of Jest workers with `--maxWorkers`
- increase the amount of time we wait after triggering a theme change

After dozens of tests it appears the most reliable and the fastest is by keeping parallelism (no worker limitation), but increase the amount of time. But this latter depends on the environment:

- when testing headless: there is less work done, the delay is shorter
- when testing with a browser rendering: it is in higher demand, to avoid color style leakage we need to increase the delay (tests duration is +50%, which is fine)

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
