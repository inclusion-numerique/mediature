// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
// Import commands.js using ES2015 syntax:
import '@mediature/main/tests/support/commands';

Cypress.on('uncaught:exception', (err, runnable) => {
  debugger;

  // For some reason sometimes the hydratation fails randomly (maybe coming from Next.js since already saw that)
  // We silent this error to make the e2e test passes
  // Details: https://reactjs.org/docs/error-decoder.html?invariant=418
  // Note: I wanted to log the error from there but it's not possible, I did a lot of attempts but no success (ref: https://github.com/cypress-io/cypress/issues/6316#issuecomment-1369893841)
  if (err.message.includes('Minified React error #418')) {
    return false;
  }

  return true;
});

Cypress.on('fail', () => {
  debugger;
});
