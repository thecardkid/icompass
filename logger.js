module.exports = {
    error: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(new Date() + " [ERROR]");
        console.log.apply(console, args);
    },

    info: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(new Date() + " [INFO]");
        console.log.apply(console, args);
    },

    debug: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(new Date() + " [DEBUG]");
        console.log.apply(console, args);
    }
};
