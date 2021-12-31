import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as uiX from '@actions/ui';

class Tutorial extends Component {
  steps = [{
    heading: 'Jumping in',
    body: (
      <div>
        <p>Let's get you acquainted with the app!</p>
        <p>First, fill out the topic you're working on, and your name. Then, click "Get started".</p>
      </div>
    ),
  }, {
    heading: 'Think of the people',
    body: <p>Who's working on this with you, and who's going to be touched by your work?</p>
  }, {
    heading: 'More = merrier',
    body: (
      <div>
        <p>Invite others to collaborate with you by sending them the page URL.</p>
        <p>If you want to test this yourself, simply open a new tab with the same URL.</p>
      </div>
    ),
    showNext: true,
  }, {
    heading: 'Create notes',
    body: (
      <div>
        <p>To create a note, double-click anywhere on the page.</p>
        <p>Or, you can right-click, and select "Add note here".</p>
      </div>
    ),
  }, {
    heading: 'Drafts are for your eyes only..',
    body: (
      <div>
        <p>Now let's do that again, but instead of "Submit", click "Draft".</p>
        <p>Drafts are invisible to other collaborators.</p>
      </div>
    ),
  }, {
    heading: '..Until submitted',
    body: (
      <div>
        <p>Click the green "submit" button on top of your draft note.</p>
      </div>
    ),
  }, {
    heading: 'Update your thoughts',
    body: (
      <div>
        <p>To edit a note, double-click on it and make your changes, then click "Save".</p>
        <p><b>Pro-tip</b>: double-clicking also lets you edit PEOPLE (center) and TOPIC (top-right).</p>
      </div>
    ),
  }, {
    heading: 'Update efficiently',
    body: (
      <div>
        <p>To update multiple notes, hold down left click and drag across the workspace.</p>
        <p>This will put you in multi-edit mode. In this mode, you can click notes to select/deselect them.</p>
      </div>
    ),
    showNext: true,
  }, {
    heading: 'Menus',
    body: (
      <div>
        <p>Use the top-left icon to open the main menu and discover more features.</p>
        <p>Use the bottom-right icon to open the help menu.</p>
      </div>
    ),
    showNext: true,
  }, {
    heading: 'Consider yourself onboarded',
    body: (
      <div>
        <p>That's it, you made it to the end 🎉 You can restart the tutorial from the help menu.</p>
        <p>We hope you have fun using the app!</p>
      </div>
    ),
  }];

  render() {
    const { active, step } = this.props.tutorial;
    if (!active) {
      return null;
    }
    const s = this.steps[step];
    const isLastStep = step === this.steps.length - 1;

    return (
      <div className={'ic-tutorial-container'}>
        <div className={'guider'}>
          <h2>{s.heading}</h2>
          <div className={'body'}>
            {s.body}
          </div>
          <div className={'footer'}>
            <button className={'leave'} onClick={this.props.uiX.endTutorial}>End Tutorial</button>
            {(s.showNext && !isLastStep) && (
              <button className={'next'} onClick={this.props.uiX.tutorialNextStep}>Next</button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    tutorial: state.ui.tutorial,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Tutorial);
