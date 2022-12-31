/// <reference types="Cypress" />

import { createATracker } from '../../actions/create-a-tracker'

// loads an external script
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    script.src = src
    document.head.appendChild(script)
  })
}

// clears IndexedDb storage
export function clearIndexedDb() {
  return indexedDB.deleteDatabase('localforage')
}

const doOnBoard = () => {
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
}

const createContextTrackable = () => {
  const label = `ctx${Math.random().toString(16).replace('0.', '')}`.toLowerCase()
  cy.get('#add-menu-button').click()
  cy.wait(100)
  cy.get('#dropdown-store-menu > .pop-button-2').click()
  cy.wait(400)
  cy.get('#trackable-label-input').type(label)
  cy.wait(100)
  // Open Visualizer Modal
  cy.get('.visuals-editor > .bg-primary-500').click()
  cy.wait(400)
  // Pick Emoju
  cy.get('.grid > :nth-child(18)').click()
  cy.wait(500)
  // Select color Tap
  cy.get('#visualizer-btn-group > .btn-1').click()
  cy.wait(500)
  // Pick Color
  cy.get('.asGrid > :nth-child(2)').click()
  cy.wait(500)
  // Click Done
  cy.get('.left > .nbtn').click()
  cy.wait(500)
  // Click Save
  cy.get('.flex > [slot="right"]').click()
  // Should Get Creator Award
  cy.wait(500)
  cy.get('#accept-award-button').click()
  cy.wait(200)
  cy.get(`#context-${label}`).click()
  cy.wait(500)
  cy.get('#save-log-button').click()
  cy.wait(500)
}

const createPersonTrackable = () => {
  const label = `person${Math.random().toString(16).replace('0.', '')}`.toLowerCase()
  cy.get('.add-menu-button').click()
  cy.wait(100)
  cy.get('#headlessui-menu-item-16 > .pop-button').click()
  cy.wait(400)
  cy.get('#trackable-label-input').type(label)
  cy.wait(100)
  // Open Visualizer Modal
  cy.get('.visuals-editor > .bg-primary-500').click()
  cy.wait(400)
  // Pick Emoju
  cy.get('.grid > :nth-child(20)').click()
  cy.wait(500)
  // Select color Tap
  cy.get('#visualizer-btn-group > .btn-1').click()
  cy.wait(500)
  // Pick Color
  cy.get('.asGrid > :nth-child(5)').click()
  cy.wait(500)
  // Click Done
  cy.get('.left > .nbtn').click()
  cy.wait(500)
  // Click Save
  cy.get('.flex > [slot="right"]').click()
  // No Award Here
  cy.get(`#person-${label}`).click()
  cy.wait(500)
  cy.get('#save-log-button').click()
  cy.wait(500)
  it('It should have added the tag to the capturelog', () => {
    cy.get('#textarea-capture-note').should('contain.value', `#${label}`)
  })
}

context('App', () => {
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

  describe('skip the setup', () => {
    it('should load the app', () => {
      cy.visit('http://localhost:3000/?bypass')
    })
  })

  describe('creating trackables', () => {
    it('should create tick Tracker', () => {
      createATracker({
        isFirst: true,
        type: 'tick',
      })
    })
    it('should create Value Tracker', () => {
      createATracker({
        isFirst: false,
        type: 'value',
      })
    })
    it('should create Range Tracker', () => {
      createATracker({
        isFirst: false,
        type: 'range',
      })
    })
    // it('should create context', () => {
    //   cy.visit('http://localhost:3000/')
    //   cy.wait(1000)
    //   createContextTrackable()
    // })
    // it('should create Person', () => {
    //   createPersonTrackable()
    // })
  })

  // describe('Testing Routes', () => {
  //   it('should go to settings', () => {
  //     cy.visit('http://localhost:3000/settings')
  //     cy.wait(2000)
  //     // cy.get('.ntitle').should('be.true')
  //   })
  // it('should go to awards', () => {
  //   cy.visit('http://localhost:3000/awards')
  //   cy.wait(2000)
  //   cy.get('.ntitle').should('be.true')
  // })
  // it('should go to goals', () => {
  //   cy.visit('http://localhost:3000/goals')
  //   cy.wait(2000)
  //   cy.get('.ntitle').should('be.true')
  // })
  // it('should go to timeline', () => {
  //   cy.visit('http://localhost:3000/timeline')
  //   cy.wait(2000)
  //   cy.get('.letter-ticker').should('be.true')
  // })
  // })
})
