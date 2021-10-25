const {
  matchImageSnapshot,
  setup,
  selectColor,
  testImageURL,
} = require('./utils');

const driveUrl = 'https://drive.google.com/file/d/12345/view?usp=sharing';
const expectedDriveUrl = 'https://drive.google.com/thumbnail?id=12345';


describe('forms', () => {
  before(() => {
    cy.clearLocalStorage();
    setup();
  });

  describe('text', () => {
    it('create', () => {
      cy.get('#observations .interactable').dblclick('center');
      cy.get('#ic-form-text .ql-editor').type('text note');
      selectColor('#FFFFCC');
      cy.get('button[name=ship]').click();
      // matchImageSnapshot();
    });

    it('edit', () => {
      cy.get('#note0').dblclick('center');
      cy.get('#ic-form-text .ql-editor').should('contain', 'text note');
      selectColor('#FFCCFF');
      cy.get('#ic-form-text .ql-editor').clear().type('edited note');
      cy.get('button[name=ship]').click();
      matchImageSnapshot();
    });

    it('edit: can\'t submit empty note', () => {
      cy.get('#note0').dblclick('center');
      cy.get('#ic-form-text .ql-editor').clear();
      cy.get('button[name=ship]').click();
      cy.get('#ic-form-text').should('be.visible');
      cy.get('#note0').should('contain', 'edited note');
      cy.get('button[name=nvm]').click();
    });

    it('drag', () => {
      cy.get('#note0').move({ deltaX: 100, deltaY: 100 });
      matchImageSnapshot();
    });
  });

  describe('image', () => {
    it('shows form', () => {
      cy.get('#principles .interactable').dblclick('center', { shiftKey: true });
      cy.get('.ic-form-palette').should('be.visible');
    });

    it('can toggle alt text', () => {
      cy.get('#ic-image-alt-text').should('not.exist');
      cy.get('#toggle-alt').click();
      cy.get('#ic-image-alt-text').should('be.visible');
      cy.get('#toggle-alt').click();
      cy.get('#ic-image-alt-text').should('not.exist');
    });

    it('create', () => {
      cy.get('#ic-form-text').type(testImageURL);
      selectColor('#FFFFCC');
      cy.get('button[name=ship]').click();
      matchImageSnapshot();
    });

    it('editing an image (without alt text) does not show alt text field', () => {
      cy.get('#note1').dblclick('center');
      cy.get('#ic-image-alt-text').should('not.exist');
      cy.get('button[name=nvm]').click();
    });

    it('edit', () => {
      cy.get('#note1').dblclick('center');
      cy.get('.ic-form-palette').should('be.visible');
      cy.get('#ic-form-text').should('contain', testImageURL);
      selectColor('#FFCCFF');
      cy.get('#toggle-alt').click();
      cy.get('#ic-image-alt-text').type('alternative text');
      cy.get('button[name=ship]').click();
      matchImageSnapshot();
    });

    it('alt tag is there', () => {
      cy.get('#note1 div.contents img',).should('have.attr', 'alt', 'alternative text');
    });

    it('converts drive link to thumbnail', () => {
      cy.get('#note1').dblclick('center');
      cy.get('#ic-form-text').clear().type(driveUrl);
      cy.get('#ic-form-text').should('contain', expectedDriveUrl);
      cy.get('button[name=nvm]').click();
    });

    it('drag', () => {
      cy.get('#note1').move({ deltaX: 100, deltaY: 100 });
      matchImageSnapshot();
    });

    describe('s3 upload', () => {
      it('file too large', () => {
        cy.get('#principles .interactable').dblclick('center', { shiftKey: true });
        cy.get('input[name=s3-uploader]').attachFile('toolarge.jpg');
        cy.wait(500);
        cy.get('#ic-toast .error').should('be.visible');
        cy.get('#ic-toast .error').should('contain', 'cannot be larger than 1MB');
        cy.get('button[name=nvm]').click();
      });

      // it('upload success', () => {
      //   b.chooseFile('input[name=s3-uploader]', path.join('./test/e2e/files/shouldpass.jpg'));
      //   b.waitForVisible('div.preview img');
      //   expect(b.getText('#ic-form-text')).to.include('https://s3.us-east-2.amazonaws.com/innovatorscompass');
      //   b.click('button[name=nvm]');
      // });
    });
  });

  describe('doodle', () => {
    it('create', () => {
      cy.get('#ideas .interactable').dblclick('center', { altKey: true });
      cy.get('.ic-form-palette').should('be.visible');

      // draw doodle
      cy.get('#ic-doodle')
        .trigger('mousedown', { force: true })
        .trigger('mousemove', -50, 50, { force: true })
        .trigger('mouseup', { force: true });

      selectColor('#FFFFCC');
      cy.get('button[name=ship]').click();
      matchImageSnapshot();
    });

    it('edit', () => {
      cy.get('#note2').dblclick('center');
      cy.get('#ic-toast .warning').should('contain', 'Sketches cannot be edited');
      cy.get('#ic-toast').click({ force: true });
    });

    it('drag', () => {
      cy.get('#note2').move({ deltaX: 100, deltaY: 100 });
      matchImageSnapshot();
    });
  });

  describe('form switching', () => {
    it('text to image', () => {
      cy.get('#experiments .interactable').dblclick('center');
      cy.get('.switch-form').should('have.length', 2);
      cy.get('.switch-image').click();
      cy.get('#ic-note-form').should('not.exist');
      cy.get('#ic-image-form').should('be.visible');
    });

    it('image to doodle', () => {
      cy.get('.switch-doodle').click();
      cy.get('#ic-image-form').should('not.exist');
      cy.get('#ic-doodle-form').should('be.visible');
    });

    it('doodle to text', () => {
      cy.get('.switch-text').click();
      cy.get('#ic-doodle-form').should('not.exist');
      cy.get('#ic-note-form').should('be.visible');
    });

    it('text to doodle', () => {
      cy.get('.switch-doodle').click();
      cy.get('#ic-text-form').should('not.exist');
      cy.get('#ic-doodle-form').should('be.visible');
    });

    it('doodle to image', () => {
      cy.get('.switch-image').click();
      cy.get('#ic-doodle-form').should('not.exist');
      cy.get('#ic-image-form').should('be.visible');
    });

    it('image to text', () => {
      cy.get('.switch-text').click();
      cy.get('#ic-image-form').should('not.exist');
      cy.get('#ic-note-form').should('be.visible');
      cy.get('button[name=nvm]').click();
    });

    it('switching form maintains note position', () => {
      cy.get('#experiments .interactable').dblclick('center');
      cy.get('.switch-image').click();
      cy.get('#ic-form-text').type(testImageURL);
      cy.get('button[name=ship]').click();
      cy.get('div.ic-sticky-note').should('have.length', 4);
      matchImageSnapshot();
    });

    it('switching form after changing note color retains that color', () => {
      cy.get('#experiments .interactable').dblclick('top');
      selectColor('#FFCCFF');
      cy.get('#ic-form-text').should('have.css', 'background-color', 'rgb(255, 204, 255)');

      cy.get('.switch-doodle').click();
      cy.get('#ic-doodle').should('have.css', 'background-color', 'rgb(255, 204, 255)');

      cy.get('.switch-image').click();
      cy.get('#ic-form-text').should('have.css', 'background-color', 'rgb(255, 204, 255)');
      cy.get('#toggle-alt').click();
      cy.get('#ic-image-alt-text').should('have.css', 'background-color', 'rgb(255, 204, 255)');

      cy.get('#ic-form-text').type(testImageURL);
      cy.get('button[name=ship]').click();
      cy.get('div.ic-sticky-note').should('have.length', 5);
      cy.get('#note4 div.contents').should('have.css', 'background-color', 'rgb(255, 204, 255)');
    });

    it('editing image does not allow switching', () => {
      cy.get('#note3').dblclick('center');
      cy.get('.switch-form').should('have.length', 0);
      cy.get('button[name=nvm]').click();
    });

    it('editing text does not allow switching', () => {
      cy.get('#note0').dblclick('center');
      cy.get('.switch-form').should('have.length', 0);
      cy.get('button[name=nvm]').click();
    });
  });

  describe('clicking backdrop closes form', () => {
    it('closes text form', () => {
      cy.get('#observations .interactable').dblclick('top');
      cy.get('#ic-backdrop').click('left');
      cy.get('#ic-note-form').should('not.exist');
    });

    it('closes image form', () => {
      cy.get('#observations .interactable').dblclick('top', { shiftKey: true });
      cy.get('#ic-backdrop').click('left');
      cy.get('#ic-image-form').should('not.exist');
    });

    it('closes doodle form', () => {
      cy.get('#observations .interactable').dblclick('top', { altKey: true });
      cy.get('#ic-backdrop').click('left');
      cy.get('#ic-doodle-form').should('not.exist');
    });
  });
});
