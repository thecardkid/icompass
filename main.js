
var Colors = {
    black: 0x000000,
    white: 0xCDCDCD,
    silver: 0x9DACAD,
    table: 0xBDB380,
    tableLeg: 0x4C5454,
    green: 0x00FF41, //4BFF00,
};

setInterval(flashCameraLight, 6000);
setInterval(cameraLightToggle, 4000);

// var tableTexture = 'http://4.bp.blogspot.com/-06IPFRCgmH0/VDuFtXJZZNI/AAAAAAAAGjw/K1ew83hDI_c/s1600/seamless-wood-pattern.jpg'
const loader = new THREE.TextureLoader();
const NINETY = Math.PI / 2;
const W = 1916, H = 978;
const ASPECT_RATIO = W / H;
$(document).ready(loadTextures);
$(document).on('keyup', releaseKey);
$(document).on('keydown', pressKey);
var laptop;
var cameraOn = false;
var KEY_STATE = Array(77).fill(false);

function loadTextures() {
    TW.loadTextures(['images/table.jpeg', 'images/speakers.jpg'], init);
}

function cameraLightToggle() {
    console.log('toggling');
    cameraOn = !cameraOn;
}

function flashCameraLight() {
    console.log('render');
    laptop.mesh.children[3].visible = cameraOn;
    renderer.render(scene, camera);
}

function init(textures) {
    // set up scene, camera, renderer
    createScene();
    createDesk(textures[0]);
    createLaptop(textures[1]);
	renderer.render(scene, camera);
    $('#text').removeClass('hidden');
    setCss();
}

function setCss() {
    var w = WIDTH * 0.33;
    var h = HEIGHT * 0.365;
    var left = (WIDTH-w) / 2;
    $('#text').css({
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
}

function pressKey(e) {
    var num = KEY_MAPS[e.which];
    if (!KEY_STATE[num]) {
        KEY_STATE[num] = true;
        var key = laptop.mesh.children[1].children[num];
        key.position.y -= 0.05;
        renderer.render(scene, camera);
    } else if (e.which === 20) {
        releaseKey(e);
    }
}

function releaseKey(e) {
    var num = KEY_MAPS[e.which];
    if (KEY_STATE[num]) {
        KEY_STATE[num] = false;
        var key = laptop.mesh.children[1].children[num];
        key.position.y += 0.05;
        renderer.render(scene, camera);
    } else if (e.which === 20) {
        pressKey(e);
    }
}

var scene, camera, fieldOfView, aspectRatio, near, far, HEIGHT, WIDTH,
    renderer, container, light;

function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    if (WIDTH < ASPECT_RATIO * HEIGHT) {
        HEIGHT = WIDTH / ASPECT_RATIO;
    } else if (HEIGHT < WIDTH / ASPECT_RATIO) {
        WIDTH = HEIGHT * ASPECT_RATIO;
    }

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
    light = new THREE.DirectionalLight( 0xffffff  );
    light.position.set(0,6,2).normalize();
    scene.add(light);

    fieldOfView = 60;
    near = 1;
    far = 10000;
    camera = new THREE.PerspectiveCamera(fieldOfView,ASPECT_RATIO,near,far);

    camera.position.set(0,10,15);
    camera.lookAt(new THREE.Vector3(0,0,-2));

    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;

    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
}

function handleWindowResize() {
    if (window.innerWidth > WIDTH) {
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
        setCss();
    }
}

function createDesk(texture) {
    var desk = new Desk(texture);
    desk.mesh.position.z += 2.2;
    scene.add(desk.mesh);
}

function createLaptop(speakersTexture) {
    laptop = new Laptop(speakersTexture);
    laptop.mesh.position.z = 5;
    scene.add(laptop.mesh);
}

