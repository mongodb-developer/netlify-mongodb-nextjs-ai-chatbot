// ***********************************************************
// This example support/e2e.js is processed and
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

describe('sample test', () => {
    beforeEach(() => {
      cy.visit('/')
    })
  
    it('displays the history', () => {
      cy.get('h2')
      .contains('Conversation History ');
    })
 

    
  })

  describe('Chat message sending and response check', () => {
    beforeEach(() => {
        cy.visit('/');

        // Listen for console errors and fail the test if one occurs
        cy.on('window:console', (msg) => {
            expect(msg.type()).not.to.eq('error');
        });
    });

    it('should send a message and check for a response without console errors', () => {
        const testMessage = 'Hello, how are you?';

        cy.get('textarea[name="content"]')
          .type(testMessage);
        cy.get('button[type="submit"]')
          .click();
        cy.wait(3000);
        cy.get('.chat-area')
          .should('contain', testMessage);
        cy.get("#message-3").should('exist');
        // Additional assertions or actions can be performed here
    });
});