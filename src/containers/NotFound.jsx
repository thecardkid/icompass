import * as React from 'react';
import { browserHistory } from 'react-router';

export default class NotFound extends React.Component {
  constructor(props) {
    super(props);

    this.state ={ secondsLeft: 5 };
    this.decreaseSecond();
  }

  decreaseSecond = () => {
    if (this.state.secondsLeft === 0) {
      browserHistory.push('/');
      return;
    }
    const secondsLeft = this.state.secondsLeft - 1;
    setTimeout(() => this.setState({ secondsLeft }, this.decreaseSecond), 1000);
  };

  render() {
    return (
      <div id={'ic-404'}>
        <div id={'text'}>
          <p>
            There is nothing here. You will be redirected to the home page in {this.state.secondsLeft}.
          </p>
      </div>
      </div>
    );
  }
}
