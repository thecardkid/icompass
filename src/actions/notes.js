export const updateAll = (notes) => {
    return {
        type: 'updateAll',
        notes
    };
};

export const api = (data) => {
    return {
        type: 'updateAll',
        notes: data.compass.notes
    };
};

export const drag = (idx, x, y) => {
    return {
        type: 'drag',
        idx, x, y
    };
};

