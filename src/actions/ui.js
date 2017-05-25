export const showNewNote = () => {
    return {
        type: 'showNewNote'
    };
};

export const showEdit = (note) => {
    if (note.doodle) return;
    return {
        type: 'showEdit',
        note
    };
};

export const showDoodle = () => {
    return {
        type: 'showDoodle'
    };
};

export const closeForm = () => {
    return {
        type: 'closeForm'
    };
};

export const focusOnNote = (idx) => {
    return {
        type: 'focusOnNote',
        idx
    };
};

export const toggleCompactMode = () => {
    return {
        type: 'toggleCompactMode'
    };
};

export const toggleAbout = () => {
    return {
        type: 'toggleAbout'
    };
};

export const toggleChat = () => {
    return {
        type: 'toggleChat'
    };
};

export const toggleSidebar = () => {
    return {
        type: 'toggleSidebar'
    };
};

export const toggleFeedback = () => {
    return {
        type: 'toggleFeedback'
    };
};

export const resize = (e) => {
    return {
        type: 'resize',
        screenWidth: e.target.innerWidth,
        screenHeight: e.target.innerHeight
    };
};

export const setScreenSize = (vw, vh) => {
    return {
        type: 'resize',
        screenWidth: vw,
        screenHeight: vh
    };
};

