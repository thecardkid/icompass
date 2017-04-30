// from https://codepen.io/soulwire/pen/mErPAK

var TextScramble = function (el, speed) {
    this.el = el;
    this.speed = speed;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';

    this.update = this.update.bind(this);
    this.setText = this.setText.bind(this);
    this.randomChar = this.randomChar.bind(this);
}

TextScramble.prototype.setText = function(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(function(resolve) {this.resolve = resolve});
    this.queue = [];
    for (var i=0; i<length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * this.speed);
        const end = start + Math.floor(Math.random() * this.speed);
        this.queue.push({
            'from': from,
            'to': to,
            'start': start,
            'end': end
        });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
}

TextScramble.prototype.update = function() {
    var output = '';
    var complete = 0;
    for (var i=0, n=this.queue.length; i<n; i++) {
        var obj = this.queue[i];
        if (this.frame >= obj.end) {
            complete++;
            output += obj.to;
        } else if (this.frame >= obj.start) {
            if (!obj.char || Math.random() < 0.28) {
                obj.char = this.randomChar();
                this.queue[i].char = obj.char;
            }
            output += obj.char;
        } else {
            output += obj.from;
        }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
        this.resolve();
    } else {
        this.frameRequest = requestAnimationFrame(this.update.bind(this));
        this.frame++;
    }
}

TextScramble.prototype.randomChar = function() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
}

