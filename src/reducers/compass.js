export default (state = {}, action) => {
    switch(action.type) {
        case 'set':
            return Object.assign({}, action.compass, {notes: undefined});
        case 'remove':
            return {};
        default:
            return state;
    }
}
