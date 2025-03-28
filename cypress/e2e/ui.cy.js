describe('UI Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSocket()
    cy.clearMessages()
    
    // Handle welcome modal
    cy.get('[data-testid="modal-name-input"]').type('Test User', { force: true })
    cy.get('[data-testid="accept-consent"]').click({ force: true })
  })

  it('should display the message input form', () => {
    cy.get('[data-testid="message-form"]').should('be.visible')
    cy.get('[data-testid="message-form"] input[type="text"]').should('be.visible')
    cy.get('[data-testid="message-form"] button[type="submit"]').should('be.visible')
  })

  it('should handle message submission', () => {
    const testMessage = 'Test message from UI'
    
    // Type and submit message
    cy.get('[data-testid="message-form"] input[type="text"]').type(testMessage)
    cy.get('[data-testid="message-form"] button[type="submit"]').click()

    // Verify message appears in the list
    cy.get('[data-testid="message"]').last().should('contain', testMessage)
  })
}) 