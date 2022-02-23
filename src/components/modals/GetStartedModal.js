import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as uiX from '@actions/ui';
import { MODAL_NAME } from '@utils/constants';
import DynamicModal from './DynamicModal';

class GetStartedModal extends Component {
  render() {
    return (
      <DynamicModal
        modalName={MODAL_NAME.GET_STARTED_PROMPT}
        heading={'The Innovators\' Compass'}
        width={500}
      >
        <p>
          Starting something or feeling stuck? Use five powerful questions to make things better.
        </p>
        <h4>Tips for each question</h4>
        <p>
          <b>1. PEOPLE: Who could be involved?</b> ...including you? For and with everyone involved, explore...
        </p>
        <p>
          <b>2. OBSERVATIONS: What's happening? Why?</b> Details and all sides of what people are doing, saying, thinking, and feeling.
        </p>
        <p>
          <b>3. PRINCIPLES: What matters most for everyone involved?</b> Different, maybe competing things here. That's the challenge!
        </p>
        <p>
          <b>4. IDEAS: What ways are there?</b> Different who/what/when/where/hows. Anyone and anything can help. Look around for ideas!
        </p>
        <p>
          <b>5. EXPERIMENTS: What's a step to try?</b> Small, with real details so you DO it! What happens? (back to #2)
        </p>
        <p>
          Really explore. Look, listen, feel; use words, draw, move, or make. In this order or any way they you forward. Guesses are fine—just add ? marks and go find out!
        </p>

      <h4>Tips for organizing</h4>
      <p>
        Cluster related stickies together and add a label with a sticky that stands out—e.g. in bold capitals, and/or a different color.
      </p>
      <p>
        Zoom out to make stickies take up less space on your screen.
      </p>

      <h4>Tips for groups</h4>
      <p>
        Divide up the time you have to work on each part. For each part of the compass...
      </p>
      <p>
        1. Give everyone a little quiet time to write their own stickies as drafts, one thought per sticky.  If they have thoughts about other parts, they can draft those too.
      </p>
      <p>
        2. One person publishes one sticky, and reads out just what it says.
      </p>
      <p>
        3. Others publish any similar notes they have, clustering them around the first.
      </p>
      <p>
        4. Then someone else publishes and reads a different note to start a new cluster, and so on
      </p>
      <p>
        For more information, visit <a href="http://innovatorscompass.org" target="_blank" rel="noopener noreferrer">innovatorscompass.org</a>.
      </p>
  </DynamicModal>
  );
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GetStartedModal);
