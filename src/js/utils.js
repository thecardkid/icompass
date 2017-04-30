
function roundedRect(x, y, width, height, radius) {
    var ctx = new THREE.Shape();
	ctx.moveTo(x, y + radius);
	ctx.lineTo(x, y + height-radius);
	ctx.quadraticCurveTo(x, y+height, x+radius, y+height);
	ctx.lineTo(x+width-radius, y+height);
	ctx.quadraticCurveTo(x+width, y+height, x+width, y+height-radius);
	ctx.lineTo(x+width, y+radius);
	ctx.quadraticCurveTo(x+width, y, x+width-radius, y);
	ctx.lineTo(x+radius, y);
	ctx.quadraticCurveTo(x, y, x, y+radius);
	return ctx;
}

function circle(r) {
    var ctx = new THREE.Shape();
    ctx.moveTo(0, r);
    ctx.quadraticCurveTo(r, r, r, 0);
    ctx.quadraticCurveTo(r, -r, 0, -r);
    ctx.quadraticCurveTo(-r, -r, -r, 0);
    ctx.quadraticCurveTo(-r, r, 0, r);
    return ctx;
}

function extrude(shape, amount) {
    return new THREE.ExtrudeGeometry(shape, {amount: amount, bevelEnabled: false});
}

function animateEntrance() {
    setTimeout(function() {
        $('#world').removeClass('hidden');
    }, 1000);
    setTimeout(function() {
        $('#screen').removeClass('hidden');
        setTimeout(function() {
            $('#search').focus();
        }, 1400);
        $('#loading').addClass('hidden');
    }, 3000);
}

function setCss() {
    var w = WIDTH * 0.33;
    var h = HEIGHT * 0.365;
    var left = (WIDTH-w) / 2;
    $('#duckduckgo').css({
        'top': HEIGHT * 0.13,
        'height': h,
        'left': left,
        'width': w
    });

    var searchW = WIDTH * 0.23;
    $('#search').css({
        'top': 354 * HEIGHT / H,
        'height': 35 * HEIGHT / H,
        'left': left + (w - searchW - 60) / 2,
        'width': searchW
    });

    $('#fake-text').css({
        'top': 405 * HEIGHT / H,
        'left': left,
        'width': w,
    });

    $('#fake-title').css({
        'top': 287 * HEIGHT/H,
        'left': left,
        'width': w
    });
}

function cameraLightToggle() {
    cameraOn = !cameraOn;
}

function flashCameraLight() {
    laptop.mesh.children[3].visible = cameraOn;
    renderer.render(scene, camera);
}

const KEY_MAPS = {
    27: 0, // esc
    192: 14, // ~
    49: 15, // 1
    50: 16,
    51: 17,
    52: 18,
    53: 19,
    54: 20,
    55: 21,
    56: 22,
    57: 23, // 9
    48: 24, // 0
    173: 25, // -
    61: 26, // +
    8: 27, // delete
    9: 28, // tab
    // q->p
    81: 29, 87: 30,
    69: 31,
    82: 32,
    84: 33,
    89: 34,
    85: 35,
    73: 36,
    79: 37,
    80: 38,
    219: 39, // [
    221: 40, // ]
    220: 41, // \
    20: 42, // caps lock
    // a->l
    65: 43,
    83: 44,
    68: 45,
    70: 46,
    71: 47,
    72: 48,
    74: 49,
    75: 50,
    76: 51,
    59: 52, // ;
    222: 53, // '
    13: 54, // enter
    16: 55, // shift
    // z->m
    90: 56,
    88: 57,
    67: 58,
    86: 59,
    66: 60,
    78: 61,
    77: 62,
    188: 63, // ,
    190: 64, // .
    191: 65, // /
    // 66 is right shift
    17: 67, // caps lock
    18: 69, // alt/option
    224: 70, // cmd
    32: 71, // space
    37: 74, // left
    38: 75, // up
    39: 76, // right
    40: 75, //down
};

