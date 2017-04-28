
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

