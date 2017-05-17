
var editCode, viewCode;

module.exports = {
    'creating compass' : function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)
        .assert.title('The Innovators\' Compass')
        .setValue('input[id=username]', 'Hieu')
        .setValue('input[id=compass-center]', 'DSA')
        .click('button[name=cMake]')
        .pause(500)
        .acceptAlert()
        .pause(500)
        .assert.elementPresent('#ic-sidebar')
            .assert.cssProperty('#ic-sidebar', 'left', '0px')
        .assert.elementPresent('span[name=edit-code]')
            .getText('span[name=edit-code]', function(result) {
                this.assert.equal(typeof result, "object");
                this.assert.equal(result.status, 0);
                this.assert.equal(result.value.length, 8);
                editCode = result.value;
            })
        .assert.elementPresent('span[name=view-code]')
            .getText('span[name=view-code]', function(result) {
                this.assert.equal(typeof result, "object");
                this.assert.equal(result.status, 0);
                this.assert.equal(result.value.length, 8);
                editCode = result.value;
            })
        .assert.elementPresent('#ic-chat')
            .assert.cssProperty('#ic-chat', 'bottom', '0px')
        .assert.elementPresent('#center')
            .assert.containsText('#center', 'DSA')
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
    },

    'keystrokes': function(browser) {
        browser
        .keys('s').pause(500)
        .assert.cssProperty('#ic-sidebar', 'left', '-240px')
        .keys('c').pause(500)
        .assert.cssProperty('#ic-chat', 'bottom', '-265px')
        .keys('h').pause(500)
        .assert.elementPresent('#help-screen')
        .keys('w').pause(500)
        .assert.elementPresent('#explanation')
    },

    'note events': function(browser) {
        browser
        // open and close form
        .keys(['w','h','n'])
        .waitForElementVisible('#ic-note-form', 500)
        .click('button[name=nvm]')
        .assert.elementNotPresent('ic-note-form')
        // reopen form and submit sticky
        .keys('n')
        .assert.elementNotPresent('ic-sticky-note')
        .setValue('textarea[id=ic-form-text]', 'An observation')
        .click('button[name=ship]')
        .waitForElementVisible('.ic-sticky-note', 500)
        .assert.containsText('.ic-sticky-note', 'An observation')
        // edit sticky
        .click('.ic-sticky-note')
        .pause(500)
        .clearValue('textarea[id=ic-form-text]')
        .setValue('textarea[id=ic-form-text]', 'A principle')
        .click('button[name=ship]')
        .pause(500)
        .assert.containsText('.ic-sticky-note', 'A principle')
    },

    'chat sends message': function(browser) {
        browser
        .keys('c').pause(500)
        .assert.cssProperty('#ic-chat', 'bottom', '0px')
        .setValue('textarea[id=message-text]', 'Hello world!')
        .keys(browser.Keys.ENTER)
        .waitForElementVisible('.bubble', 500)
        .assert.containsText('.bubble', 'Hello world!')
        .end();
    }
//
    // 'can find compass': function(browser) {
        // browser
        // .url('http://localhost:8080')
        // .waitForElementVisible('body', 1000)
        // .assert.title('The Innovators\' Compass')
        // .setValue('input[id=username]', 'Hieu')
        // .setValue('input[id=compass-center]', 'DSA')
        // .click('button[name=cMake]')
        // .pause(500)
        // .end();
    // }
}
