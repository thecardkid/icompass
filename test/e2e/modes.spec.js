
var editCode, viewCode;

module.exports = {
    'creates successfully': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)
        .click('button[name=make]')
        .setValue('#compass-center', 'nightwatchjs')
        .setValue('#username', 'sandbox')
        .click('button[name=next]')
        .waitForElementVisible('.third', 1000)
        .click('button[name=to-workspace]')
        .waitForElementVisible('#ic-sidebar', 1000);
    },

    'retrieve codes': function(browser) {
        browser
        .getText('span[name=edit-code]', function(result) {
            this.assert.equal(result.value.length, 8);
            editCode = result.value;
        })
        .getText('span[name=view-code]', function(result) {
            this.assert.equal(result.value.length, 8);
            viewCode = result.value;
        })
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/compass/edit/'+editCode+'/sandbox');
        });
    },

    'view-only access from url': function(browser) {
        browser
        .url('http://localhost:8080/compass/view/'+viewCode+'/sandbox')
        .pause(1000)
        .assert.elementPresent('#center')
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
        .assert.elementPresent('#ic-compact')
        .assert.elementNotPresent('#ic-sidebar')
        .assert.elementNotPresent('#ic-chat')
        .assert.elementNotPresent('#ic-show-chat')
        .assert.elementNotPresent('#ic-show-sidebar');
    },

    'view-only from login page': function(browser) {
        browser
        .url('http://localhost:8080')
        .waitForElementVisible('body', 1000)
        .click('button[name=find]')
        .setValue('#compass-code', viewCode)
        .setValue('#username', 'sandbox')
        .click('button[name=next]')
        .waitForElementVisible('.third', 1000)
        .assert.containsText('.third h1', 'view access')
        .assert.containsText('.third h2', 'You will be logged in as sandbox')
        .click('button[name=to-workspace]')
        .pause(1000)
        .assert.elementPresent('#center')
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
        .assert.elementPresent('#ic-compact')
        .assert.elementNotPresent('#ic-sidebar')
        .assert.elementNotPresent('#ic-chat')
        .assert.elementNotPresent('#ic-show-chat')
        .assert.elementNotPresent('#ic-show-sidebar');
    },

    'url with bad params is rejected': function(browser) {
        browser
        .url('http://localhost:8080/compass/edit/' + editCode.substring(1,5) + '/,,,')
        .pause(2000)
        .getAlertText(function(result) {
            this.assert.equal(result.value.indexOf('There was a problem with your login info') > -1, true);
            this.assert.equal(result.value.indexOf('Your code is not valid') > -1, true);
            this.assert.equal(result.value.indexOf('Username can only contain a-zA-Z') > -1, true);
        })
        .acceptAlert()
        .pause(500)
        .assert.elementPresent('#ic-landing')
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/');
        });
    },

    'view url with wrong editCode is rejected': function(browser) {
        browser
        .url('http://localhost:8080/compass/view/'+editCode+'/sandbox')
        .pause(2000)
        .getAlertText(function(result) {
            this.assert.equal(result.value.indexOf('I couldn\'t find your compass'), 0);
        })
        .acceptAlert()
        .pause(1000)
        .assert.elementPresent('#ic-landing')
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/');
        });
    },

    'edit access from url': function(browser) {
        browser
        .url('http://localhost:8080/compass/edit/'+editCode+'/sandbox')
        .pause(1000)
        .assert.elementPresent('#center')
        .assert.elementPresent('#vline')
        .assert.elementPresent('#hline')
        .assert.elementPresent('#ic-sidebar')
        .assert.elementPresent('#ic-chat')
        .assert.elementPresent('#ic-show-chat')
        .assert.elementPresent('#ic-show-sidebar')
        .assert.elementPresent('#ic-compact')
        .click('#ic-sidebar button[name=destroyer]')
        .acceptAlert()
        .pause(500)
        .acceptAlert()
        .pause(500)
        .url(function(result) {
            this.assert.equal(result.value, 'http://localhost:8080/');
        })
        .end();
    }
};



