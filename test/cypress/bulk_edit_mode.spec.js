import {
  assertDraggable,
  assertNotDraggable,
  matchImageSnapshot,
  setup,
  selectColor,
  selectMenuOption,
} from './utils';
const { workspaceMenu } = require('./data_cy');

const toolbarSelector = '#ic-visual-toolbar';

function activateBulkEditMode() {
  selectMenuOption(workspaceMenu.modesSubactions.bulk);
}

function activateStandardViewMode() {
  cy.get('body').type('{esc}', { force: true });
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
    activateBulkEditMode();
    // Warns if zero notes.
    cy.get('.ic-modal-warning').should('contain', 'first create');
    cy.get('.toolbar-close').click();

    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      cy.get(`${p[0]} .interactable`).dblclick(p[1]);
      cy.get('#ic-form-text .ql-editor').type('this is a note');
      cy.get('button[name=ship]').click();
    }
    activateBulkEditMode();
    cy.get('.ic-modal-warning').should('contain', 'cannot be undone');
    cy.get('.toolbar-close').click();
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
    cy.get('.ic-dynamic-modal .title').should('contain', 'Are you sure');
    cy.get('#ic-modal-confirm').click();
    cy.get(toolbarSelector).should('not.exist');
  });

  describe('conditional text', () => {
    it('displays how-to-use if toolbar accessed via menu', () => {
      activateBulkEditMode();
      cy.get('#explanation').should('contain', 'Select notes by holding Shift');
    });

    it('selecting a note should hide', () => {
      cy.get('#note0').click();
      cy.get('#explanation').should('not.contain', 'Select notes by holding Shift');
    });

    it('selecting a note should hide', () => {
      cy.get('.toolbar-close').click();
      cy.get('#note0').click({ shiftKey: true });
      cy.get('#explanation').should('not.contain', 'Select notes by holding Shift');
      cy.get('.toolbar-close').click();
    });
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
    describe('bulk updates', () => {
      it('change colors', () => {
        activateBulkEditMode();

        cy.get('#note0').click();
        cy.get('#note1').click();

        selectColor('#FFCCFF');
        cy.get('#note0 div.contents').should('have.css', 'background-color', 'rgb(255, 204, 255)');
        cy.get('#note1 div.contents').should('have.css', 'background-color', 'rgb(255, 204, 255)');

        matchImageSnapshot();
      });

      it('align left', () => {
        cy.get('#note1').click(); // Deselect.
        cy.get('#note2').click(); // Select.

        cy.get('#note0').then($note0 => {
          cy.get('#note2').then($note2 => {
            expect($note0.position().left).to.not.equal($note2.position().left);
          });
        });
        cy.get('.align .left').click();
        cy.get('#note0').then($note0 => {
          cy.get('#note2').then($note2 => {
            expect($note0.position().left).to.equal($note2.position().left);
          });
        });
      });

      it('align top', () => {
        cy.get('#note0').click(); // Deselect.
        cy.get('#note2').click(); // Deselect.
        cy.get('#note1').click(); // Select.
        cy.get('#note3').click(); // Select.

        cy.get('#note1').then($note1 => {
          cy.get('#note3').then($note3 => {
            expect($note1.position().top).to.not.equal($note3.position().top);
          });
        });
        cy.get('.align .top').click();
        cy.get('#note1').then($note1 => {
          cy.get('#note3').then($note3 => {
            expect($note1.position().top).to.equal($note3.position().top);
          });
        });
      });

      const expectTag = function(noteID, tag) {
        cy.get(`${noteID} .contents .text`).then($note => {
          expect($note.html()).to.contain(tag);
        });
      };

      const expectNoTag = function(noteID, tag) {
        cy.get(`${noteID} .contents .text`).then($note => {
          expect($note.html()).to.not.contain(tag);
        });
      };

      it('format bold', () => {
        expectNoTag('#note1', '<strong>');
        cy.get('.formatting .bold').click();
        expectTag('#note1', '<strong>');
        cy.get('.formatting .bold').click();
        expectNoTag('#note1', '<strong>');
      });

      it('format italic', () => {
        expectNoTag('#note1', '<em>');
        cy.get('.formatting .italic').click();
        expectTag('#note1', '<em>');
        cy.get('.formatting .italic').click();
        expectNoTag('#note1', '<em>');
      });

      it('format underline', () => {
        expectNoTag('#note1', '<u>');
        cy.get('.formatting .underline').click();
        expectTag('#note1', '<u>');
        cy.get('.formatting .underline').click();
        expectNoTag('#note1', '<u>');
      });

      it('format strikethrough', () => {
        expectNoTag('#note1', '<s>');
        cy.get('.formatting .strikethrough').click();
        expectTag('#note1', '<s>');
        cy.get('.formatting .strikethrough').click();
        expectNoTag('#note1', '<s>');
      });

      it('format mixed', () => {
        cy.get('.formatting .bold').click();
        cy.get('.formatting .italic').click();
        expectTag('#note1', '<strong>');
        expectTag('#note1', '<em>');
        cy.get('.toolbar-close').click();
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
        cy.get('.toolbar-close').click();
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
        cy.get('.ic-dynamic-modal .title').should('contain', 'Are you sure');
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
