function makeSingleton(c) {
  let instance = null;

  return {
    getInstance: () => {
      if (!instance) {
        instance = new c();
        instance.constructor = null;
      }

      return instance;
    },
  };
}

module.exports = makeSingleton;
