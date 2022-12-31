import { composeNote } from '../../actions/compose-note'

// clears IndexedDb storage
export function clearIndexedDb() {
  return indexedDB.deleteDatabase('localforage')
}

context('Timeline', () => {
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
      cy.setLocalStorage(
        'data/localDB/preferences',
        '{"state":{"use24hour":false,"useMetric":false,"theme":"auto","fontSize":"md","language":"en-us","weekStarts":"sunday","compactTrackers":false,"hideBackupMessage":false,"hideMessages":false,"allowFileEdit":false,"alwaysLocate":true,"storageType":"local"}}'
      )
      cy.visit('http://localhost:3000/timeline')
    })
    it('should create a couple notes', () => {
      const randomTag = `r${Math.random()}`.replace('0.', '')
      composeNote(
        `This is a #${randomTag}(1.5) #${randomTag}(4) and @person and +context and while we are at it some more text to fill the voice`
      )
      cy.get(`#id-${randomTag}-items > .trackable-pill > .title-value > .font-bold`).should('contain', '5.5')
    })
  })
})
