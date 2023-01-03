export {};

describe('Home boundaries', () => {
  it('should visit', () => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(111111111);
      console.log(err);
      console.log(JSON.stringify(err));
      console.log(err.message);
      console.log(err.name);
      console.log(222222);
    });

    cy.on('fail', () => {
      console.log(33333333);
      console.log(33333333);
      console.log(33333333);
    });

    cy.on('test:before:run', () => {
      console.log(44444444);
      console.log(44444444);
      console.log(44444444);
    });

    cy.visit('/');
    throw new Error('dsodsosodso');
    // TODO: put logic in Cypress Custom Commands
  });
});
