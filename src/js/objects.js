var Phone = function() {
    this.mesh = new THREE.Object3D();

    var mDark = new THREE.MeshPhongMaterial({color: Colors.black});

	var sPhone = roundedRect(0, 0, 2.5, 5, 0.2);
    var extrudeSettings = {amount: 0.2, bevelEnabled: false};

    var gPhone = extrude(sPhone, 0.2);
    var mPhone = new THREE.MeshPhongMaterial({color: Colors.white});
    var phone = new THREE.Mesh(gPhone, mPhone);
    var gWireFrame = new THREE.EdgesGeometry(phone.geometry);
    var mWireFrame = new THREE.LineBasicMaterial({color: Colors.silver, linewidth: 4});
    var wireframe = new THREE.LineSegments(gWireFrame, mWireFrame);
    phone.add(wireframe);
    phone.rotation.x = NINETY;
    phone.position.set(-1.25, 1, -2.5);
    this.mesh.add(phone);

    var gScreen = new THREE.BoxGeometry(2.3, 3.8, 0.1);
    var screen = new THREE.Mesh(gScreen, mDark);
    screen.rotation.x = NINETY;
    screen.position.y = 1;
    this.mesh.add(screen);

    var extrudeAmount = 0.04;

    var gHome = extrude(circle(0.2), extrudeAmount);
    var home = new THREE.Mesh(gHome, new THREE.MeshPhongMaterial({color: 0xABABAB}));
    home.rotation.x = NINETY;
    home.position.set(0, 1.1, 2.15);
    this.mesh.add(home);

    var gCamera = extrude(circle(0.05), extrudeAmount);
    var phoneCamera = new THREE.Mesh(gCamera, mDark);
    phoneCamera.rotation.x = NINETY;
    phoneCamera.position.set(-0.4, 1.1, -2.15);
    this.mesh.add(phoneCamera);

    var gHole = extrude(circle(0.04), extrudeAmount);
    var hole = new THREE.Mesh(gHole, mDark);
    hole.rotation.x = NINETY;
    hole.position.set(0, 1.1, -2.35);
    this.mesh.add(hole);

    var gSpeakers = new THREE.BoxGeometry(0.05, 0.5, 0.1);
    var speakers = new THREE.Mesh(gSpeakers, mDark);
    speakers.rotation.set(NINETY, 0, NINETY);
    speakers.position.set(0, 1.1, -2.10);
    this.mesh.add(speakers);
}

var Laptop = function(speakersTexture) {
    this.mesh = new THREE.Object3D();

    var sBase = roundedRect(0, 0, 9, 14, 0.5);
    var gBase = extrude(sBase, 0.3);
    var mBase = new THREE.MeshPhongMaterial({color: Colors.silver});
    var base = new THREE.Mesh(gBase, mBase);
    base.rotation.set(NINETY, 0, -NINETY);
    base.position.set(-7, 0.85, 4);
    this.mesh.add(base);

    keyboard = new Keyboard();
    this.mesh.add(keyboard.mesh);

    var sScreen = roundedRect(0, 0, 9, 14, 0.5);
    // var gScreen = new THREE.BoxGeometry(10,13.8,0.1);
    var gScreen = extrude(sScreen, 0.1);
    var mScreen = new THREE.MeshPhongMaterial({color: Colors.black});
    var screen = new THREE.Mesh(gScreen, mScreen);
    screen.rotation.set(-NINETY/3, 0, -NINETY);
    screen.position.set(-7, 8.2, -9.5);
    var gWireFrame = new THREE.EdgesGeometry(screen.geometry);
    var mWireFrame = new THREE.LineBasicMaterial({color: Colors.silver, linewidth: 2});
    var wireframe = new THREE.LineSegments(gWireFrame, mWireFrame);
    screen.add(wireframe);
    screen.name = 'screen';
    this.mesh.add(screen);

    var gCamera = extrude(circle(0.05), 0.1);
    var cameraLight = new THREE.Mesh(gCamera, new THREE.MeshPhongMaterial({color: Colors.green}));
    cameraLight.position.set(0.5, 7.85, -9.1);
    cameraLight.rotation.set(-NINETY/3, 2*NINETY, 0);
    cameraLight.name = 'light';
    cameraLight.visible = false;
    this.mesh.add(cameraLight);

    // used for both trackpad and keyboard base
    var mIndentation = new THREE.MeshPhongMaterial({color: 0x8D9c9d});

    var sTp = roundedRect(-1.6, -2, 3, 4, 0.2);
    var gTrackpad = extrude(sTp, 0.1);
    var tp = new THREE.Mesh(gTrackpad, mIndentation);
    tp.rotation.set(NINETY, 0, -NINETY);
    tp.position.set(0, 0.9, 2);
    this.mesh.add(tp);

    var sKbBase = roundedRect(-2.15, -5.35, 4.2, 10.7, 0.2);
    var gKbBase = extrude(sKbBase, 0.1);
    var kbBase = new THREE.Mesh(gKbBase, mIndentation);
    kbBase.rotation.set(NINETY, 0, -NINETY);
    kbBase.position.set(0, 0.9, -2);
    this.mesh.add(kbBase);

    var gSpeakers = new THREE.BoxGeometry(3.8,1,0.01);
    var mSpeakers = new THREE.MeshPhongMaterial({
        color: Colors.silver,
        map: speakersTexture
    });

    for (var i=-1; i<2; i+=2) {
        var speaker = new THREE.Mesh(gSpeakers, mSpeakers);
        speaker.rotation.set(NINETY, 0, -NINETY);
        speaker.position.set(i*6, 0.9, -2);
        this.mesh.add(speaker);
    }
}

var Keyboard = function() {
    this.mesh = new THREE.Object3D();
    this.keyState = Array(77).fill(false);

    const fix = function(key) {
        key.rotation.set(NINETY, 0, -NINETY);
        key.position.y = 1.1;
    }
    const keyLengths = {
        'n': 0.5,
        'fn': 0.528,
        'tab': 0.9,
        'enter': 1.05,
        'shift': 1.38,
        'space': 3.3,
        'cmd': 0.7,
        'arrow': 0.5
    };
    const extra = {
        'n': 0,
        'fn': 0,
        'tab': 0.2,
        'enter': 0.3,
        'shift': 0.44,
        'space': 1.4,
        'cmd': 0.1,
        'arrow': 0
    };
    var z = -3.75; // z starting coordinate
    const m = new THREE.MeshBasicMaterial({color: Colors.black});
    const keys = [
        Array(14).fill('fn'),
        Array(13).fill('n').concat('tab'),
        ['tab'].concat(Array(13).fill('n')),
        ['enter'].concat(Array(11).fill('n')).concat('enter'),
        ['shift'].concat(Array(10).fill('n')).concat('shift'),
        ['n','n','n','cmd','space','cmd','n','arrow','n','arrow']
    ];

    var xpos, i, j, k, s, g, mesh, w, l;
    var mWf = new THREE.LineBasicMaterial({color: 0x1C1E1F, linewidth: 1});
    for (i=0; i<keys.length; i++) {
        xpos = -4.7;
        for (j=0; j<keys[i].length; j++) {
            k = keys[i][j];
            w = k == 'fn' || k == 'arrow' ? 0.3 : 0.5;
            l = keyLengths[k];
            s = roundedRect(-w/2, -l/2, w, l, 0.1);
            g = extrude(s, 0.1);
            mesh = new THREE.Mesh(g, m);
            mesh.name = k;
            fix(mesh);
            mesh.position.z = z + (k === 'arrow' ? 0.1 : 0);
            mesh.position.y += 0.01;
            mesh.position.x = xpos + extra[k];
            xpos += 0.2 + keyLengths[k];
            var gWf = new THREE.EdgesGeometry(mesh.geometry);
            var wf = new THREE.LineSegments(gWf, mWf);
            mesh.add(wf);
            this.mesh.add(mesh);
        }
        if (i === 0) z += 0.6;
        else z += 0.7;
    }

    $(document).on('keyup', this.release.bind(this));
    $(document).on('keydown', this.press.bind(this));
}

Keyboard.prototype.press = function(e) {
    var num = KEY_MAPS[e.which];
    if (!this.keyState[num]) {
        this.keyState[num] = true;
        var k = this.mesh.children[num];
        k.position.y -= 0.05;
        renderer.render(scene, camera);
    } else if (e.which == 20) {
        this.release(e);
    }
}

Keyboard.prototype.release = function(e) {
    var num = KEY_MAPS[e.which];
    if (this.keyState[num]) {
        this.keyState[num] = false;
        var k = this.mesh.children[num];
        k.position.y += 0.05;
        renderer.render(scene, camera);
    }
}

var Desk = function(texture) {
    this.mesh = new THREE.Object3D();

    var l = 20, w = 15;
    var lx = l/2 - 2, wx = w/2 - 2;

    var gTable = new THREE.BoxGeometry(w,l,1);
    var mTable = new THREE.MeshPhongMaterial({
        color: Colors.table,
        map: texture
    });
    var table = new THREE.Mesh(gTable, mTable);
    table.rotation.set(NINETY, 0, NINETY);
    this.mesh.add(table);

    var x = [lx, lx, -lx, -lx];
    var z = [wx, -wx, wx, -wx];

    for (var i=0; i<4; i++) {
        var gLeg = new THREE.CylinderGeometry(1,1,25);
        var mLeg = new THREE.MeshPhongMaterial({color: Colors.tableLeg,});
        var leg = new THREE.Mesh(gLeg, mLeg);
        leg.position.set(x[i], -25/2, z[i]);
        this.mesh.add(leg);
    }
}

var BTKeyboard = function() {
    this.mesh = new THREE.Object3D();

    var base = roundedRect(0, 0, 4.6, 10.7, 0.5);
    var gBase = extrude(base, 0.2);
    var mBase = new THREE.MeshPhongMaterial({color: 0x303536});
    var base = new THREE.Mesh(gBase, mBase);
    base.rotation.set(NINETY, 0, NINETY);
    base.position.set(5.4, 1, -2.4);
    this.mesh.add(base);

    var keys = new Keyboard();
    keys.mesh.position.set(0, 0.01, 2);
    this.mesh.add(keys.mesh);
}

