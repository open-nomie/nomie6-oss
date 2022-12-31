export const composeNote = (note, save = true) => {
  cy.get('#textarea-capture-note').type(note)
  cy.get('#positivity-button').click()
  cy.wait(400)
  cy.get('.pop-button-0').click()
  cy.wait(200)
  if (save) {
    cy.get('#save-log-button').click()
  }
}
