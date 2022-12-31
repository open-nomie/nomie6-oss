export const createATracker = (props) => {
  const isFirst = props.isFirst ? true : false
  const type = props.type || 'tick'

  const label = `${type || 'tick'}${Math.random().toString(16).replace('0.', '')}`.toLowerCase()
  cy.get('.add-menu-button').click()
  cy.wait(100)
  cy.get('.add-menu-button-0').click()
  cy.get('#trackable-label-input').type(label)
  cy.wait(100)

  if (type !== 'tick') {
    cy.get('#tracker-type-selector').click()
    cy.wait(300)
    cy.get(`.n-list button#${type}`).click()
    cy.wait(300)
  }

  cy.get('#save-button').click()

  // Add to the Main Board
  cy.wait(100)
  cy.get('#alert-ok').click()
  if (isFirst) {
    // Accept the Creator Award
    cy.wait(1000)
    cy.get('#accept-award-button').click()
    cy.wait(300)
  }

  let expectedValue = '1'

  // Let's Track with the new Tracker
  cy.get(`#tracker-${label}`).click()
  if (type == 'tick') {
    cy.get('#textarea-capture-note').should('contain.value', `#${label}`)
  } else if (type == 'range') {
    expectedValue = '6'
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    cy.get('.tracker-input-slider input').then(($range) => {
      // get the DOM node
      const range = $range[0]
      // set the value manually
      nativeInputValueSetter.call(range, expectedValue)
      // now dispatch the event
      range.dispatchEvent(new Event('change', { value: expectedValue, bubbles: true }))
    })

    // Hi Insert
    cy.get('#input-insert-button').click()
  } else if (type === 'value') {
    expectedValue = '76'
    cy.get('#calc-button-7').click()
    cy.get('#calc-button-6').click()
    cy.get('#input-insert-button').click()
  }
  cy.wait(500)
  cy.get('#save-log-button').click()
  cy.wait(200)
  cy.get(`#tracker-${label} .value`).should('contain.text', expectedValue)
}
