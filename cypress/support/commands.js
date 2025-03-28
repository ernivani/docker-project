// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// ***********************************************
// Custom commands for chat application testing
// ***********************************************

// Create a new message via API
Cypress.Commands.add('createMessage', (content) => {
  return cy.request('POST', '/api/messages', {
    content,
    sender: 'Test User',
    userUUID: '123'
  })
})

// Delete all messages (for test cleanup)
Cypress.Commands.add('clearMessages', () => {
  return cy.request('GET', '/api/messages').then((response) => {
    if (response.body && response.body.length > 0) {
      response.body.forEach((message) => {
        cy.request({
          method: 'DELETE',
          url: `/api/messages/${message.id}`,
          failOnStatusCode: false
        })
      })
    }
  })
})

// Wait for WebSocket connection
Cypress.Commands.add('waitForSocket', () => {
  cy.window().should('have.property', 'io')
  cy.wait(1000)
})

// Send a message via WebSocket
Cypress.Commands.add('sendSocketMessage', (content) => {
  cy.window().then((win) => {
    win.io().emit('message', {
      content,
      sender: 'Test User',
      userUUID: '123'
    })
  })
})

// Wait for a message to appear in the UI
Cypress.Commands.add('waitForMessage', (content) => {
  cy.get('[data-testid="message"]').should('contain', content)
})

// Check if an element is in the viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height()
  const rect = subject[0].getBoundingClientRect()
  expect(rect.top).to.be.lessThan(bottom)
  expect(rect.bottom).to.be.greaterThan(0)
  return subject
})

// Load more messages by scrolling
Cypress.Commands.add('loadMoreMessages', () => {
  cy.get('[data-testid="messages-container"]').scrollTo('bottom')
  cy.wait(1000)
}) 