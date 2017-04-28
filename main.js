var Colors = {
    black: 0x000000,
    silver: 0x9DACAD,
    table: 0xBDB380,
    tableLeg: 0x4C5454,
};

// var tableTexture = 'http://4.bp.blogspot.com/-06IPFRCgmH0/VDuFtXJZZNI/AAAAAAAAGjw/K1ew83hDI_c/s1600/seamless-wood-pattern.jpg'
const loader = new THREE.TextureLoader();
const NINETY = Math.PI / 2;
window.addEventListener('load', function() {
    TW.loadTextures(['images/table.jpeg', 'images/speakers.jpg'], init);
});

function init(textures) {
    // set up scene, camera, renderer
    createScene();
    createDesk(textures[0]);
    createLaptop(textures[1]);
	renderer.render(scene, camera);
}

var scene, camera, fieldOfView, aspectRatio, near, far, HEIGHT, WIDTH,
    renderer, container, light;

function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
    light = new THREE.DirectionalLight( 0xffffff  );
    light.position.set(0,1,1).normalize();
    scene.add(light);

    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    near = 1;
    far = 10000;
    camera = new THREE.PerspectiveCamera(fieldOfView,aspectRatio,near,far);

    camera.position.x = 0;
    camera.position.z = 30;
    camera.position.y = 20;
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer({
        // transparent to show gradient background
        // defined in css
        antialias: true
    });

    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;

    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

var Desk = function(texture) {
    this.mesh = new THREE.Object3D();

    var gTable = new THREE.BoxGeometry(30,60,1);
    gTable.vertices.push(new THREE.Vector3(15,-10,0.5));
    gTable.vertices.push(new THREE.Vector3(15,-10,-0.5));
    var mTable = new THREE.MeshPhongMaterial({
        color: Colors.table,
        map: texture
    });
    var table = new THREE.Mesh(gTable, mTable);
    table.rotation.z = NINETY;
    table.rotation.x = NINETY;
    this.mesh.add(table);

    var x = [28, 28, -28, -28];
    var z = [13, -13, 13, -13];

    for (var i=0; i<4; i++) {
        var gLeg = new THREE.CylinderGeometry(1,1,25);
        var mLeg = new THREE.MeshPhongMaterial({color: Colors.tableLeg,});
        var leg = new THREE.Mesh(gLeg, mLeg);
        leg.position.y = - 25 / 2;
        leg.position.x = x[i];
        leg.position.z = z[i];
        this.mesh.add(leg);
    }
}

function createDesk(texture) {
    var desk = new Desk(texture);
    scene.add(desk.mesh);
}

var Laptop = function(speakersTexture) {
    this.mesh = new THREE.Object3D();

    var gBase = new THREE.BoxGeometry(10,14,0.3);
    var mBase = new THREE.MeshPhongMaterial({color: Colors.silver});
    var base = new THREE.Mesh(gBase, mBase);
    base.rotation.x = NINETY;
    base.rotation.z = -NINETY;
    base.position.y = 0.85;
    this.mesh.add(base);

    var kb = new Keyboard();

    var gScreen = new THREE.BoxGeometry(10,13.8,0.1);
    var mScreen = new THREE.MeshPhongMaterial({color: Colors.black});
    var screen = new THREE.Mesh(gScreen, mScreen);
    screen.rotation.z = -NINETY;
    screen.rotation.x = - Math.PI / 6;
    screen.position.y = 5;
    screen.position.z = -7.5;
    var gWireFrame = new THREE.EdgesGeometry(screen.geometry);
    var mWireFrame = new THREE.LineBasicMaterial({color: Colors.silver, linewidth: 2});
    var wireframe = new THREE.LineSegments(gWireFrame, mWireFrame);
    screen.add(wireframe);
    this.mesh.add(screen);

    // used for both trackpad and keyboard base
    var mIndentation = new THREE.MeshPhongMaterial({color: 0x8D9c9d});

    var gTrackpad = new THREE.BoxGeometry(3,4,0.1);
    var tp = new THREE.Mesh(gTrackpad, mIndentation);
    tp.rotation.z = -NINETY;
    tp.rotation.x = NINETY;
    tp.position.y = 1;
    tp.position.z = 2.5;
    this.mesh.add(tp);

    var gKbBase = new THREE.BoxGeometry(4.2, 10.5, 0.1);
    var kbBase = new THREE.Mesh(gKbBase, mIndentation);
    kbBase.rotation.z = -NINETY;
    kbBase.rotation.x = NINETY;
    kbBase.position.y = 1;
    kbBase.position.z = -2;
    this.mesh.add(kbBase);
    this.mesh.add(kb.mesh);

    var gSpeakers = new THREE.BoxGeometry(3.8,1,0.01);
    var mSpeakers = new THREE.MeshPhongMaterial({
        color: Colors.silver,
        map: speakersTexture
    });

    for (var i=-1; i<2; i+=2) {
        var speaker = new THREE.Mesh(gSpeakers, mSpeakers);
        speaker.rotation.z = -NINETY;
        speaker.rotation.x = NINETY;
        speaker.position.y = 1.05;
        speaker.position.x = i * 6;
        speaker.position.z = -2;
        this.mesh.add(speaker);
    }

}

var Keyboard = function() {
    this.mesh = new THREE.Object3D();

    const fix = function(key) {
        key.rotation.x = NINETY;
        key.rotation.z = -NINETY;
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
    var z = -3.75; // z starting pos of all keys
    const m = new THREE.MeshBasicMaterial({color: Colors.black});
    const keys = [
        Array(14).fill('fn'),
        Array(13).fill('n').concat('tab'),
        ['tab'].concat(Array(13).fill('n')),
        ['enter'].concat(Array(11).fill('n')).concat('enter'),
        ['shift'].concat(Array(10).fill('n')).concat('shift'),
        ['n','n','n','cmd','space','cmd','n','arrow','n','arrow']
    ];

    var xpos, i, j, k, g, mesh;
    for (i=0; i<keys.length; i++) {
        xpos = -4.7;
        for (j=0; j<keys[i].length; j++) {
            k = keys[i][j];
            g = new THREE.BoxGeometry(
                (k == 'fn' || k == 'arrow') ? 0.3 : 0.5,
                keyLengths[k],
                0.1
            );
            mesh = new THREE.Mesh(g, m);
            fix(mesh);
            mesh.position.z = z + (k == 'arrow' ? 0.1 : 0);
            mesh.position.x = xpos + extra[k];
            xpos += 0.2 + keyLengths[k];
            this.mesh.add(mesh);
        }
        if (i == 0) z += 0.6;
        else z += 0.7;
    }
}

function createLaptop(speakersTexture) {
    var laptop = new Laptop(speakersTexture);
    laptop.mesh.rotation.y = - Math.PI / 4;
    laptop.mesh.position.x = 15;
    scene.add(laptop.mesh);
}

