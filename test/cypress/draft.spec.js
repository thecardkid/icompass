import { waitForVisible } from './utils';

const { setup, selectSubmenuOption, testImageURL } = require('./utils');
const { workspaceMenu } = require('./data_cy');

describe('draft mode', () => {
  before(() => {
    setup();
    // insert some test notes
    const positions = [{ x: 400, y: 200 }, { x: 500, y: 200 }];
    for (let i = 0; i < positions.length; i++) {
      let p = positions[i];
      cy.get('body').dblclick(p.x, p.y);
      cy.get('#ic-form-text .ql-editor').type('This is a note');
      cy.get('button[name=ship]').click();
    }
  });

  // drafts are saved in local storage, so we need to persist the storage between tests
  beforeEach(cy.restoreLocalStorage);
  afterEach(cy.saveLocalStorage);

  describe('text draft', () => {
    it('create', () => {
      cy.get('body').dblclick(200, 500);
      cy.get('#ic-form-text .ql-editor').type('draft 0');
      cy.get('button[name=draft]').click();
      cy.get('.ic-sticky-note').should('have.length', 3);
      cy.get('.draft').should('have.length', 1);
      cy.get('.draft div.contents').should('have.css', 'background-color', 'rgb(128, 128, 128)');
    });

    it('form has correct heading', () => {
      cy.get('#note0').dblclick(10, 10);
      cy.get('h1.title').should('contain', 'Edit this draft');
      cy.get('.ic-form-palette').should('not.exist');
    });

    it('can edit draft', () => {
      cy.get('#ic-form-text .ql-editor').clear().type('Edited draft');
      cy.get('button[name=ship]').click();
      cy.get('#note0').should('contain', 'Edited draft');
    });

    it.skip('can drag draft', () => {
      // TODO implement when cypress supports dragging
    });
  });

  describe('can still edit non-draft', () => {
    it('form has correct title and does not have draft button', () => {
      cy.get('#note1').dblclick(10, 10);
      cy.get('h1.title').should('contain', 'Edit this note');
      cy.get('button[name=draft]').should('not.exist');
    });

    it('can make edit', () => {
      cy.get('#ic-form-text .ql-editor').clear().type('Edited note');
      cy.get('button[name=ship]').click();
      cy.get('#note1').should('contain', 'Edited note');
    });

    it.skip('can drag', () => {
      // TODO implement when cypress supports dragging
    });
  });

  describe('image draft', () => {
    it('image form should render correctly', () => {
      cy.get('body').dblclick(400, 500, { shiftKey: true });
      cy.get('#ic-form-text').type(testImageURL);
      cy.get('button[name=draft]').click();
      cy.get('.ic-sticky-note').should('have.length', 4);
      cy.get('.draft').should('have.length', 2);
      cy.get('.ic-img').should('have.length', 1);
    });

    it('renders draft with image', () => {
      waitForVisible('#note1 div.contents img');
      waitForVisible('#note1 div.contents button.submit');
    });

    it('edit image draft', () => {
      cy.get('div.ic-img').dblclick(20, 20);
      cy.get('h1.title').should('contain', 'Edit photo draft');
      cy.get('.ic-form-palette').should('not.exist');
      cy.get('#ic-form-text').should('contain', testImageURL);
      cy.get('button[name=draft]').should('not.exist');
      cy.get('button[name=nvm]').click();
    });

    it.skip('can drag', () => {
      // TODO
    });
  });
  //
  // describe('doodle draft', () => {
  //   it('create doodle draft', () => {
  //     b.keys('Alt');
  //     b.keys('d');
  //     b.keys('Alt');
  //     b.waitForVisible('#ic-doodle-form');
  //     b.moveToObject('#ic-doodle', 155, 75);
  //     b.buttonDown(0);
  //     b.moveToObject('#ic-doodle', 255, 175);
  //     b.buttonUp(0);
  //     cy.wait(1000);
  //     cy.get('button[name=draft]').click();
  //     cy.wait(200);
  //     expect('.ic-sticky-note').to.have.count(5);
  //     expect('.draft').to.have.count(3);
  //     expect('.ic-img').to.have.count(2);
  //     expect(b.getAttribute('#note2 div.contents img', 'src')).to.contain('data:image/png;base64');
  //   });
  //
  //   it('cannot edit doodle', () => {
  //     b.moveToObject('#note2', 10, 10);
  //     b.doDoubleClick();
  //     b.waitForVisible('#ic-toast span');
  //     expect(b.getAttribute('#ic-toast span', 'class')).to.equal('warning');
  //     expect('#ic-toast span').to.have.text(/Sketches cannot be edited/);
  //   });
  //
  //   it('can drag', () => {
  //     const oldPos = b.getLocation('#note2');
  //     b.moveToObject('#note2', 10, 10);
  //     b.buttonDown(0);
  //     b.moveToObject('#note2', 30, 30);
  //     b.buttonUp(0);
  //     const newPosition = b.getLocation('#note2');
  //
  //     expect(oldPos.x - newPosition.x).to.equal(-20);
  //     expect(oldPos.y - newPosition.y).to.equal(-20);
  //   });
  // });
  //
  // it('drafts are saved in local storage', () => {
  //   b.refresh().pause(5000);
  //   b.waitForVisible('.ic-sticky-note');
  //   expect('.ic-sticky-note').to.have.count(5);
  //   expect('.draft').to.have.count(3);
  // });
  //

  describe('bulk edit mode', () => {
    it('does not discard drafts', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.modes,
        suboption: workspaceMenu.modesSubactions.bulk,
      });
      cy.get('.ic-sticky-note').should('have.length', 4); // TODO should be 5 after enabling doodles
    });

    it('cannot select draft in bulk mode', () => {
      cy.get('#note3').click(); // drafts come last in bulk mode
      cy.get('#ic-toast').should('contain', 'Cannot select drafts');
      cy.get('#ic-toast').click({ force: true });
    });

    it('cannot submit drafts in bulk mode', () => {
      cy.get('#note3 div.contents button.submit').click();
      cy.get('#ic-toast').should('contain', 'Cannot select drafts');
    });
  });

  describe('compact mode', () => {
    it('does not discard drafts', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.modes,
        suboption: workspaceMenu.modesSubactions.compact,
      });
      cy.get('.compact').should('have.length', 4); // TODO should be 5 after enabling doodles
    });
  });

  describe('submit drafts', () => {
    it('submit text note', () => {
      cy.get('#note0 div.contents button.submit').click();
      cy.get('.ic-sticky-note').should('have.length', 4);
      cy.get('.draft').should('have.length', 1);
      cy.get('.ic-img').should('have.length', 1);
    });

    it.skip('submit image note', () => {
      cy.get('#note0 div.contents button.submit').click();
      cy.get('.ic-sticky-note').should('have.length', 5);
      cy.get('.draft').should('have.length', 1);
      cy.get('.ic-img').should('have.length', 2);
    });
  });

  describe('others', () => {
    it('has correct prompt when deleting draft', () => {
      selectSubmenuOption({
        submenu: workspaceMenu.modes,
        suboption: workspaceMenu.modesSubactions.standard,
      });
      cy.get('#note0 .ic-close-window').click({ force: true });
      cy.get('#ic-modal-body').should('contain', 'discard this draft');
    });

    it('can discard draft', () => {
      cy.get('#ic-modal-confirm').click();
      cy.get('.ic-sticky-note').should('have.length', 3);
      cy.get('.draft').should('have.length', 0);
    });
  });
});
