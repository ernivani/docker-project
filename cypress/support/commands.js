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
Cypress.Commands.add('createMessage', (content, sender = 'Test User', userUUID = '123') => {
  return cy.request('POST', '/api/messages', {
    content,
    sender,
    userUUID
  })
})

// Delete all messages (for test cleanup)
Cypress.Commands.add('clearMessages', () => {
  return cy.request('GET', '/api/messages').then((response) => {
    response.body.forEach((message) => {
      cy.request('DELETE', `/api/messages/${message.id}`)
    })
  })
})

// Wait for WebSocket connection
Cypress.Commands.add('waitForSocket', () => {
  return cy.window().should('have.property', 'io').then((io) => {
    const socket = io()
    return new Cypress.Promise((resolve) => {
      socket.on('connect', () => {
        resolve(socket)
      })
    })
  })
})

// Send message via WebSocket
Cypress.Commands.add('sendSocketMessage', (content, sender = 'Test User', userUUID = '123') => {
  return cy.window().then((win) => {
    const socket = win.io()
    socket.emit('message', { content, sender, userUUID })
  })
})

// Wait for message to appear in the UI
Cypress.Commands.add('waitForMessage', (content) => {
  cy.get('.message').should('contain', content)
})

// Check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height()
  const rect = subject[0].getBoundingClientRect()

  expect(rect.top).to.be.lessThan(bottom)
  expect(rect.bottom).to.be.greaterThan(0)
  
  return subject
})

// Load more messages by scrolling
Cypress.Commands.add('loadMoreMessages', () => {
  cy.get('.messages-container').scrollTo('bottom')
  cy.wait(1000) // Wait for potential loading
}) 