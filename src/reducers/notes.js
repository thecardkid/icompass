export default (state = [], action) => {
    switch(action.type) {
        case 'updateAll':
            return action.notes;
        case 'drag':
            let n = state[action.idx];
            let dragged = Object.assign({}, n, { x: action.x, y: action.y });
            return [
                ...state.slice(0, action.idx),
                dragged,
                ...state.slice(action.idx + 1)
            ];
        default:
            return state;
    }
};

