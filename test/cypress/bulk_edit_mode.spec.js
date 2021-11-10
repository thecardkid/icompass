import {
  assertDraggable,
  assertNotDraggable,
  matchImageSnapshot,
  setup,
  selectColor,
  selectSubmenuOption,
} from './utils';
const { workspaceMenu } = require('./data_cy');

const toolbarSelector = '#ic-visual-toolbar';

function activateBulkEditMode() {
  selectSubmenuOption({
    submenu: workspaceMenu.modes,
    suboption: workspaceMenu.modesSubactions.bulk,
  });
}

function activateStandardViewMode() {
  selectSubmenuOption({
    submenu: workspaceMenu.modes,
    suboption: workspaceMenu.modesSubactions.standard,
  });
}

describe('workspace menu', () => {
  before(() => {
    cy.clearLocalStorage();
    setup();

    const positions = [
      ['#observations', 'center'],
      ['#principles', 'bottom'],
      ['#ideas', 'left'],
      ['#experiments', 'left'],
    ];
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      cy.get(`${p[0]} .interactable`).dblclick(p[1]);
      cy.get('#ic-form-text .ql-editor').type('this is a note');
      cy.get('button[name=ship]').click();
    }
  });

  it('visual mode toolbar is draggable', () => {
    cy.get(toolbarSelector).should('not.exist');
    activateBulkEditMode();
    assertDraggable(toolbarSelector, { deltaX: 100, deltaY: 100 });
  });

  it('escape key switches to normal mode', () => {
    cy.get('body').type('{esc}', { force: true });
    cy.get(toolbarSelector).should('not.exist');
  });

  it('editing disabled', () => {
    activateBulkEditMode();
    cy.get('#note0').dblclick('center');
    cy.get('.ic-toast-error').should('be.visible');
    cy.get('.ic-toast-message').should('contain', 'Can\'t make changes');
    cy.get('.ic-toast-close').click();
  });

  it('bulk deleting (even with 0 notes selected) returns to standard view', () => {
    cy.get('.bulk-edit-btn.delete').click();
    cy.get('#ic-modal-body').should('contain', 'Are you sure');
    cy.get('#ic-modal-confirm').click();
    cy.get(toolbarSelector).should('not.exist');
  });

  // TODO Figure out how drag select in cypress
  // describe('drag select', () => {
  //   it('shows selecting area', () => {
  //     cy.get('#select-area').should('not.exist');
  //     cy.get('#principles')
  //       .trigger('mousedown', { which: 1, pageX: 0, pageY: 0 })
  //       .trigger('mousemove', { which: 1, pageX: 1200, pageY: 1200 });
  //     cy.get('#select-area').should('be.visible');
  //     cy.get('#principles').trigger('mouseup', { which: 1 });
  //   });
  //
  //   it('select notes that intersect with the area', () => {
  //     expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(40,138,255)');
  //     expect(b.getCssProperty('#note1', 'border-color').value).to.equal('rgb(40,138,255)');
  //     expect(b.getCssProperty('#note2', 'border-color').value).to.equal('rgb(40,138,255)');
  //     expect(b.getCssProperty('#note3', 'border-color').value).to.equal('rgb(40,138,255)');
  //     expect(toolbarSelector).to.be.visible();
  //   });
  //
  //   it('can click off to exit bulk edit mode', () => {
  //     b.click('div#experiments');
  //     expect(b.getCssProperty('#note0', 'border-color').value).to.equal('rgb(0,0,0)');
  //     expect(b.getCssProperty('#note1', 'border-color').value).to.equal('rgb(0,0,0)');
  //     expect(b.getCssProperty('#note2', 'border-color').value).to.equal('rgb(0,0,0)');
  //     expect(b.getCssProperty('#note3', 'border-color').value).to.equal('rgb(0,0,0)');
  //     expect(toolbarSelector).to.not.be.visible();
  //   });
  // });

  describe('functionality', () => {
    describe('changing colors', () => {
      it('without submitting', () => {
        activateBulkEditMode();

        cy.get('#note0').click();
        cy.get('#note1').click();

        selectColor('#FFCCFF');
        cy.get('#note0 div.contents').should('have.css', 'background-color', 'rgb(255, 204, 255)');
        cy.get('#note1 div.contents').should('have.css', 'background-color', 'rgb(255, 204, 255)');

        matchImageSnapshot();

        // TODO test that these changes are not visible to another user.
      });

      it('update colors on submit', () => {
        cy.get('.bulk-edit-btn.submit').click();
        // TODO test that these changes are visible to another user.
      });
    });

    describe('dragging', () => {
      it('unselected note cannot be dragged', () => {
        activateBulkEditMode();
        assertNotDraggable('#note0');
      });

      it('selected note can be dragged', () => {
        // TODO why does clicking once not select the note?
        cy.get('#note0').click();
        cy.get('#note0').click();
        assertDraggable('#note0', { deltaX: -50, deltaY: -50 });
      });

      it('when multiple notes selected, dragging one drags all the others', () => {
        const originalPositions = [];
        const deltaX = 50, deltaY = 50;
        cy.get('#note0').click();
        cy.get('#note1').click();
        cy.get('#note2').click();

        cy.get('#note0').then($el => originalPositions.push($el.position()));
        cy.get('#note1').then($el => originalPositions.push($el.position()));
        cy.get('#note2').then($el => originalPositions.push($el.position()));

        cy.get('#note0').move({ deltaX, deltaY });

        for (let i = 0; i <= 2; i++) {
          cy.get(`#note${i}`).then($el => {
            const newPosition = $el.position();
            expect(newPosition.left).to.equal(originalPositions[i].left + deltaX);
            expect(newPosition.top).to.equal(originalPositions[i].top + deltaY);
          });
        }
      });

      it('note positions are reliable after drag', () => {
        cy.get('#note0').should('have.attr', 'data-x', '0');
        cy.get('#note0',).should('have.attr', 'data-y', '0');
        cy.get('#note1',).should('have.attr', 'data-x', '0');
        cy.get('#note1',).should('have.attr', 'data-y', '0');
        cy.get('.bulk-edit-btn.cancel').click();
      });

      it('dragging after standard is stable', () => {
        activateStandardViewMode();
        assertDraggable('#note0', { deltaX: 50, deltaY: 50 });
      });
    });

    describe('bulk delete', () => {
      it('works', () => {
        activateBulkEditMode();
        cy.get('#note0').click();
        cy.get('#note0').click(); // TODO why have to click twice?
        cy.get('#note1').click();
        cy.get('#note2').click();
        cy.get('#note3').click();
        cy.get('.bulk-edit-btn.delete').click();
        cy.get('#ic-modal-body').should('contain', 'Are you sure');
        cy.get('#ic-modal-confirm').click();

        cy.get(toolbarSelector).should('not.exist');
        cy.get('#note0').should('not.exist');
        cy.get('#note1').should('not.exist');
        cy.get('#note2').should('not.exist');
        cy.get('#note3').should('not.exist');
      });
    });
  });
});
