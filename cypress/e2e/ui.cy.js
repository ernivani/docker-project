describe('UI Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for socket connection
    cy.window().should('have.property', 'io')
  })

  it('should display the message input form', () => {
    cy.get('form').should('exist')
    cy.get('input[type="text"]').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('should display messages in chronological order', () => {
    // Create test messages
    const messages = [
      { content: 'First message', sender: 'User 1', userUUID: '123' },
      { content: 'Second message', sender: 'User 2', userUUID: '456' },
      { content: 'Third message', sender: 'User 1', userUUID: '123' }
    ]

    // Send messages sequentially
    cy.wrap(messages).each((message) => {
      cy.request('POST', '/api/messages', message)
    })

    // Refresh the page to load messages
    cy.reload()

    // Check messages are displayed in order
    cy.get('.message').should('have.length', messages.length)
    cy.get('.message').each(($el, index) => {
      cy.wrap($el).should('contain', messages[index].content)
      cy.wrap($el).should('contain', messages[index].sender)
    })
  })

  it('should handle message submission', () => {
    const testMessage = 'Test message from UI'
    
    // Type and submit message
    cy.get('input[type="text"]').type(testMessage)
    cy.get('button[type="submit"]').click()

    // Verify message appears in the list
    cy.get('.message').last().should('contain', testMessage)
  })

  it('should handle message deletion', () => {
    // Create a message
    cy.request('POST', '/api/messages', {
      content: 'Message to delete',
      sender: 'Test User',
      userUUID: '123'
    })

    cy.reload()

    // Find and click delete button
    cy.get('.message').last().find('.delete-button').click()

    // Verify message is removed
    cy.get('.message').last().should('not.contain', 'Message to delete')
  })

  it('should load more messages on scroll', () => {
    // Create 15 messages
    const messages = Array.from({ length: 15 }, (_, i) => ({
      content: `Scroll message ${i}`,
      sender: 'Test User',
      userUUID: '123'
    }))

    // Send messages sequentially
    cy.wrap(messages).each((message) => {
      cy.request('POST', '/api/messages', message)
    })

    cy.reload()

    // Initial load should show 10 messages
    cy.get('.message').should('have.length', 10)

    // Scroll to bottom
    cy.get('.messages-container').scrollTo('bottom')

    // Should load more messages
    cy.get('.message').should('have.length.greaterThan', 10)
  })

  it('should show error message on failed submission', () => {
    // Disconnect WebSocket to simulate error
    cy.window().then((win) => {
      win.io().disconnect()
    })

    // Try to send message
    cy.get('input[type="text"]').type('This should fail')
    cy.get('button[type="submit"]').click()

    // Check for error message
    cy.get('.error-message').should('be.visible')
  })
}) 