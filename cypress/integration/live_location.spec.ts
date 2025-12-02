describe('Live location flow', () => {
  it('opens shared link and shows viewer', () => {
    cy.visit('/live-location/test123');
    cy.get('[data-testid="map-root"]').should('exist');
  });
});
