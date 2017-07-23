'use strict';

export default class Toaster {
    getSpan(clazz, msg) {
        return "<span class='" + clazz + "'>" + msg + "</span>";
    }

    success(msg) {
        $('#ic-toast').empty().append(this.getSpan('success', msg));
        setTimeout(this.clear, 5000);
    }

    warn(msg) {
        $('#ic-toast').empty().append(this.getSpan('warning', msg));
        setTimeout(this.clear, 5000);
    }

    error(msg) {
        $('#ic-toast').empty().append(this.getSpan('error', msg));
    }

    clear() {
        $('#ic-toast').empty();
    }
};