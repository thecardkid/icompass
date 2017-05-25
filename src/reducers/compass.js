export default (state = {}, action) => {
    switch(action.type) {
        case 'setCompass':
            return Object.assign({}, action.compass, {notes: undefined}, {mode: action.mode});
        case 'removeCompass':
            return {};
        default:
            return state;
    }
}
