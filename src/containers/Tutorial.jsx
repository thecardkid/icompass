import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { browserHistory } from 'react-router';

import CompassEdit from 'Containers/CompassEdit.jsx';
import Shared from 'Utils/Shared.jsx';

import DefaultCompass from 'Models/defaultCompass.js';

const USERS = {usernameToColor: {'sandbox': '#CCFFFF'}};
const STEPS = [
    {
        header: 'Welcome to iCompass',
        text: 'In this short tour, we\'ll cover a few things to help you make informed decisions about this workspace.',
        prep: () => $('#ic-tutorial-cover').fadeOut()
    },
    {
        header: 'Your workspace',
        text: 'This tutorial is not for the compass itself, but for this app. Feel free to drag this blurb around so you can see everything.',
        prep: () => {
            $('#ic-sidebar').css('left', '-240px');
            $('#ic-chat').css('bottom', '-265px');
        }
    },
    {
        header: 'The compass',
        text: 'This is the compass structure that you know and love. You will be asked to fill out the center when you create a new compass.',
        prep: () => {
            $('#ic-tutorial-cover').fadeIn();
            $('#ic-sidebar').css({'left': '0px', 'z-index': 4});
        }
    },
    {
        header: 'The Sidebar',
        text: 'The sidebar is your best reference for everything.',
        prep: (root) => root.showOnly(0)
    },
    {
        header: 'Sharing your compass',
        text: 'Share with editing or view-only access, or export it to a pdf, or tweet the view-only link with the hashtag #innovatorscompass.',
        prep: (root) => root.showOnly(1)
    },
    {
        header: 'Key bindings',
        text: 'Each of these keys is associated with a special action. For example, press "s" twice to toggle the sidebar.',
        prep: () => $('#ic-tutorial-cover').fadeOut()
    },
    {
        header: 'Creating notes',
        text: 'Press "n" to bring up the new note form. You can put up to 300 characters in a note. Drag this blurb to see the from.',
        prep: () => $('#ic-form-text').val('https://s-media-cache-ak0.pinimg.com/736x/73/de/32/73de32f9e5a0db66ec7805bb7cb3f807.jpg')
    },
    {
        header: 'Linking images',
        text: 'If you enter a hyperlink, I can import that image for you.',
        prep: () => $('button[name=nvm]').click()
    },
    {
        header: 'Working with notes',
        text: 'Click once to bring a sticky to the foreground, twice to edit its contents. Stickies are draggable by default.',
        prep: () => {}
    },
    {
        header: 'Doodling',
        text: 'Press "d" to make a doodle, if you\'re more visual. The more doodles in a compass, the more lag there might be, though.',
        prep: (root) => {
            $('#ic-tutorial-cover').fadeIn();
            $('button[name=nvm]').click();
            root.showOnly(2);
        }
    },
    {
        header: 'Active users',
        text: 'Each person in your current compass session is listed here, associated with a unique color. This is the color of stickies they make and their chat bubble.',
        prep: (root) => root.showOnly(3)
    },
    {
        header: 'Connection status',
        text: 'When you disconnect from the server, the sidebar will open and you will see a red "Disconnected". If it\'s green you\'re all set.',
        prep: (root) => root.showOnly(4)
    },
    {
        header: 'Reduce',
        text: 'I would appreciate if you could clean up server space by deleting a compass you know you won\'t need again!',
        prep: (root) => root.showOnly(5)
    },
    {
        header: 'People who made this Stuff.',
        text: 'Do check us out!',
        prep: () => {
            $('#ic-sidebar').css('left', '-240px');
            $('#ic-chat').css({'bottom': '0px', 'z-index': 4});
        }
    },
    {
        header: 'Chat',
        text: 'Send messages to anyone who is online. Messages are cleared when you log out.',
        prep: () => {
            $('#ic-chat').css('bottom', '-265px');
            $('#ic-show-chat').css('z-index', 4);
            $('#ic-show-sidebar').css('z-index', 4);
        }
    },
    {
        header: 'Buttons',
        text: 'If you forget the key bindings "s" for sidebar and "c" for chat, use these buttons to get them back.',
        prep: () => {
            $('#ic-show-chat').css('z-index', 2);
            $('#ic-show-sidebar').css('z-index', 2);
            $('#ic-compact').css('z-index', 4);
        }
    },
    {
        header: 'Compact mode',
        text: 'When things get crowded, use compact mode in the top right corner to give yourself more space. Compact mode only applies to your view.',
        prep: () => {}
    },
    {
        header: 'That\'s it!',
        text: 'You\'re ready to try out the real thing :)'
    }
];

export default class Tutorial extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {vw: window.innerWidth, vh: window.innerHeight, i: 0};

        this.compass = DefaultCompass;
        this.compass.center = 'Your People Group';
        this.compass.editCode = '1s5a2nd0';
        this.compass.viewCode = 'd147bo5x';

        this.center = Shared.center.bind(this);
        this.next = this.next.bind(this);
    }

    componentDidMount() {
        $(window).on('resize', () => {
            this.setState({vw: window.innerWidth, vh: window.innerHeight});
        });
        this.lists = $('.ic-sidebar-list');
    }

    showOnly(x) {
        let opacity;
        for (let i=0; i<this.lists.length; i++) {
            opacity = i === x ? 1 : 0.1;
            $(this.lists[i]).fadeTo('slow', opacity);
        }
    }

    next() {
        let curr = this.state.i;
        if (curr < STEPS.length-1) {
            STEPS[curr].prep(this);
            this.setState({i: curr+1});
        } else {
            browserHistory.push('/');
        }
    }

    render() {
        return (
            <div id="ic-tutorial">
                <div className="ic-screen" id="ic-tutorial-cover"></div>
                <div className="ic-screen" id="ic-tutorial-prevent"></div>
                <Draggable>
                    <div id="ic-tutorial-text" style={this.center(300,200)}>
                        <h1>{STEPS[this.state.i].header}</h1>
                        <h3>{STEPS[this.state.i].text}</h3>
                        <button name="next-step" className="ic-button" onClick={this.next}>
                            {this.state.i === STEPS.length-1 ? 'finish' : 'next'}
                        </button>
                    </div>
                </Draggable>
                <CompassEdit compass={this.compass} username={'sandbox'} users={USERS} />
            </div>
        );
    }
}

