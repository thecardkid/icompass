const chai = require('chai');
const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const expect = chai.expect;
const b = browser;

describe('tutorial', () => {
    it('can drag blurb', () => {
        b.url('http://localhost:8080');
        b.waitForVisible('body');
        b.click('#ic-tour a');
        b.waitForVisible('#ic-tutorial');

        const transformBefore = b.getCssProperty('#ic-tutorial-text', 'transform').value;

        b.moveToObject('#ic-tutorial-text', 10, 10);
        b.buttonDown(0);
        b.moveTo(null, 300, -100);
        b.buttonUp(0);

        const transformAfter = b.getCssProperty('#ic-tutorial-text', 'transform').value;

        expect(transformAfter).to.not.deep.equal(transformBefore);
    });

    it('goes through tutorial', () => {
        for (let i = 0; i < 20; i++) {
            browser.click('button[name="next-step"]');
        }

        expect('#ic-landing').to.be.visible();
    });
});
