describe('API Tests', () => {
  beforeEach(() => {
    // Reset database before each test
    cy.request('POST', '/api/messages', {
      content: 'Test message',
      sender: 'Test User',
      userUUID: '123'
    }).then(() => {
      cy.request('GET', '/api/messages').as('messages')
    })
  })

  it('should create a new message', () => {
    const message = {
      content: 'Hello, World!',
      sender: 'Test User',
      userUUID: '123'
    }

    cy.request('POST', '/api/messages', message)
      .then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('content', message.content)
        expect(response.body).to.have.property('sender', message.sender)
        expect(response.body).to.have.property('userUUID', message.userUUID)
      })
  })

  it('should retrieve messages with pagination', () => {
    // Create multiple messages
    const messages = Array.from({ length: 15 }, (_, i) => ({
      content: `Message ${i}`,
      sender: 'Test User',
      userUUID: '123'
    }))

    // Send messages sequentially
    cy.wrap(messages).each((message) => {
      cy.request('POST', '/api/messages', message)
    })

    // Test first page
    cy.request('/api/messages?limit=10')
      .then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.length(10)
      })

    // Test with cursor
    cy.request('/api/messages?limit=10')
      .then((response) => {
        const lastMessage = response.body[response.body.length - 1]
        return cy.request(`/api/messages?cursor=${lastMessage.id}&limit=10`)
      })
      .then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.length).to.be.greaterThan(0)
      })
  })

  it('should handle invalid message creation', () => {
    cy.request({
      method: 'POST',
      url: '/api/messages',
      body: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(500)
    })
  })
}) 