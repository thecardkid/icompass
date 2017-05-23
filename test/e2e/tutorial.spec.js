
var originalTranslation;
var STEPS = 18;

module.exports = {
    'creates successfully': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)
        .click('#ic-tour a')
        .pause(1000)
        .assert.elementPresent('#ic-tutorial');
    },

    'can drag blurb': function(browser) {
        browser
        .getCssProperty('#ic-tutorial-text', 'transform', function(result) {
            originalTranslation = result.value;
        })
        .moveToElement('#ic-tutorial-text', 10, 10, function() {
            browser
            .mouseButtonDown(0, function() {
                browser.moveTo(null,300,-100);
            })
            .mouseButtonUp(0, function() {
                browser.getCssProperty('#ic-tutorial-text', 'transform', function(result) {
                    this.assert.equal(result.value !== originalTranslation, true);
                });
            });
        });
    },

    'exits correctly': function(browser) {
        for (var i=0; i<STEPS; i++)
            browser.click('button[name=next-step]').pause(500);

        browser
        .assert.elementPresent('#ic-landing')
        .end();
    }
};

