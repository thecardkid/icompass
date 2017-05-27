const defaultState = {
    newNote: false,
    editNote: false,
    doodleNote: false,
    focusedNote: -1,
    compact: false,
    showAbout: false,
    showChat: true,
    showSidebar: true,
    showFeedback: false,
    vw: 0,
    vh: 0
};

export default (state = defaultState, action) => {
    switch(action.type) {
        case 'showNewNote':
            let newNote = true;
            let e = action.event;
            if (e) {
                // mobile touch events come with touches[] array
                let touchX = e.clientX || e.touches[0].clientX,
                    touchY = e.clientY || e.touches[0].clientY;
                newNote = {
                    x: touchX / state.vw,
                    y: touchY / state.vh
                };
            }
            return {...state,
                editNote: false, doodleNote: false,
                newNote
            };
        case 'showEdit':
            return {...state,
                newNote: false, doodleNote: false,
                editNote: action.note
            };
        case 'showDoodle':
            return {...state,
                newNote: false, editNote: false,
                doodleNote: true
            };
        case 'closeForm':
            return {...state,
                newNote: false, editNote: false, doodleNote: false
            };
        case 'focusOnNote':
            return {...state, focusedNote: action.idx};
        case 'toggleCompactMode':
            return {...state, compact: !state.compact};
        case 'toggleAbout':
            return {...state, showAbout: !state.showAbout};
        case 'toggleChat':
            return {...state, showChat: !state.showChat};
        case 'setChat':
            return {...state, showChat: action.value};
        case 'toggleSidebar':
            return {...state, showSidebar: !state.showSidebar};
        case 'setSidebar':
            return {...state, showSidebar: action.value};
        case 'toggleFeedback':
            return {...state, showFeedback: !state.showFeedback};
        case 'resize':
            return {...state,
                vw: action.screenWidth,
                vh: action.screenHeight
            };
        case 'resetUI':
            return defaultState;
        default:
            return state;
    }
};

