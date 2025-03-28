describe('WebSocket Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for socket connection
    cy.window().should('have.property', 'io')
  })

  it('should connect to WebSocket server', () => {
    cy.window().then((win) => {
      expect(win.io).to.be.a('function')
      const socket = win.io()
      expect(socket).to.be.an('object')
      expect(socket.connected).to.be.true
    })
  })

  it('should receive real-time messages', () => {
    cy.window().then((win) => {
      const socket = win.io()
      
      // Listen for messages
      socket.on('message', (message) => {
        expect(message).to.have.property('content', 'Real-time test message')
        expect(message).to.have.property('sender', 'Test User')
      })

      // Send a message
      socket.emit('message', {
        content: 'Real-time test message',
        sender: 'Test User',
        userUUID: '123'
      })
    })
  })

  it('should handle message deletion', () => {
    cy.window().then((win) => {
      const socket = win.io()
      let messageId

      // Create a message first
      cy.request('POST', '/api/messages', {
        content: 'Message to delete',
        sender: 'Test User',
        userUUID: '123'
      }).then((response) => {
        messageId = response.body.id

        // Listen for message deletion
        socket.on('messageDeleted', (deletedId) => {
          expect(deletedId).to.equal(messageId)
        })

        // Delete the message
        socket.emit('deleteMessage', {
          messageId: messageId,
          userUUID: '123'
        })
      })
    })
  })

  it('should handle disconnection gracefully', () => {
    cy.window().then((win) => {
      const socket = win.io()
      socket.disconnect()
      expect(socket.connected).to.be.false
    })
  })
}) 