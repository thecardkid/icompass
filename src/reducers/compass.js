export default (state = {}, action) => {
  switch (action.type) {
    case 'setCompass':
      // return Object.assign({}, action.compass, { notes: undefined }, { viewOnly: action.viewOnly });
      return {
        ...action.compass,
        notes: undefined,
        viewOnly: action.viewOnly,
      };

    case 'resetCompass':
      return {};

    case 'setTopic':
      return {
        ...state,
        topic: action.topic,
      };

    case 'setCenter':
      return {
        ...state,
        center: action.center,
    };

    case 'setCenterPosition':
      return {
        ...state,
        centerPosition: {
          x: action.x,
          y: action.y,
        },
      };

    default:
      return state;
  }
};
