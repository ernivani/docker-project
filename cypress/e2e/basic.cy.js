describe('Basic test', () => {
  it('should check if the app is running and API endpoints are working', () => {
    cy.visit('/')
    
    // Check if the API endpoint is working
    cy.request('/api/messages').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
    })

    // Check if the WebSocket connection works
    cy.window().then((win) => {
      expect(win.io).to.be.a('function')
    })
  })
}) 