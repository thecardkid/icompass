const defaultState = {
    selected: []
};

export default (state = {}, action) => {
    switch(action.type) {
        case 'visualMode':
            return {
                selected: (new Array(action.n)).fill(false)
            };

        case 'selectNote':
            return {
                selected: [
                    ...state.selected.slice(0, action.idx),
                    // TODO
                    true,
                    ...state.selected.slice(action.idx + 1)
                ]
            };

        default:
            return state;
    }
}
