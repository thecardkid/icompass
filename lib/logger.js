'use strict';

module.exports = {
    error: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(new Date() + ' [ERROR]');
        // eslint-disable-next-line no-console
        console.log.apply(console, args);
    },

    info: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(new Date() + ' [INFO]');
        // eslint-disable-next-line no-console
        console.log.apply(console, args);
    },

    debug: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(new Date() + ' [DEBUG]');
        // eslint-disable-next-line no-console
        console.log.apply(console, args);
    }
};
