describe('Basic test', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSocket()
    cy.clearMessages()
  })

  it('should check if the app is running and basic functionality works', () => {
    // Test message creation
    cy.createMessage('Test message 1')
      .then(() => {
        cy.waitForMessage('Test message 1')
      })

    // Test WebSocket messaging
    cy.sendSocketMessage('Test message 2')
    cy.waitForMessage('Test message 2')

    // Test message loading
    cy.get('.messages-container').should('exist')
    cy.get('.message').should('have.length', 2)

    // Test form submission
    cy.get('input[type="text"]').type('Test message 3')
    cy.get('button[type="submit"]').click()
    cy.waitForMessage('Test message 3')
  })
}) 