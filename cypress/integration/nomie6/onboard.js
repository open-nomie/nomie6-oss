context('Onboard', () => {
  before(() => {
    clearIndexedDb()
    cy.clearLocalStorageSnapshot()
  })

  beforeEach(() => {
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  describe('Should do the Onboarding', () => {
    it('should load the app', () => {
      cy.visit('http://localhost:3000')

      cy.wait(200)
      cy.get('#next-button').click()
      cy.wait(200)
      cy.get('#next-button').click()
      cy.wait(200)
      cy.get('#next-button').click()
      cy.wait(200)
      cy.get('#next-button').click()
      // On Location
      cy.wait(200)
      cy.get('#next-button').click()
      // On the Plan Sselector
      cy.wait(4000)
      cy.get('#plan-local').click()
      cy.wait(500)
      cy.get('#continue-button').click()
      cy.wait(1000)
      cy.get('#alert-ok').click()
      cy.wait(1000)
      return true
    })
  })
})
