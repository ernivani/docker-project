describe('WebSocket Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForSocket()
    cy.clearMessages()
    
    // Handle welcome modal
    cy.get('[data-testid="modal-name-input"]').type('Test User', { force: true })
    cy.get('[data-testid="accept-consent"]').click({ force: true })
  })

  it('should receive real-time messages', () => {
    const testMessage = {
      content: 'Real-time test message',
      sender: 'Test User',
      userUUID: '123'
    }

    cy.window().then((win) => {
      const socket = win.io()
      socket.emit('message', testMessage)
    })

    cy.get('[data-testid="message"]').last().should('contain', testMessage.content)
  })

  it('should handle message deletion', () => {
    // Create a message first
    cy.request('POST', '/api/messages', {
      content: 'Message to delete via WebSocket',
      sender: 'Test User',
      userUUID: '123'
    }).then((response) => {
      const messageId = response.body.id

      // Emit delete message command
      cy.window().then((win) => {
        const socket = win.io()
        socket.emit('deleteMessage', { id: messageId })
      })

      // Verify message is removed
      cy.get('[data-testid="message"]').should('not.contain', 'Message to delete via WebSocket')
    })
  })
}) 