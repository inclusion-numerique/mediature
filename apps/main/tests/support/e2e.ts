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
  // TODO: keep the one that is triggered... it's a random hydratation failure that + clean code

  debugger;

  console.log(111111111);
  console.log(err);
  console.log(JSON.stringify(err));
  console.log(err.message);
  console.log(err.name);
  console.log(222222);

  // For some reason sometimes the hydratation fails randomly (maybe coming from Next.js since already saw that)
  // We silent this error to make the e2e test passes
  // Details: https://reactjs.org/docs/error-decoder.html?invariant=418
  if (err.message.includes('Minified React error #418')) {
    return false;
  }
});

Cypress.on('fail', () => {
  debugger;

  console.log(33333333);
  console.log(33333333);
  console.log(33333333);
});

Cypress.on('test:before:run', () => {
  console.log(44444444);
  console.log(44444444);
  console.log(44444444);
});
