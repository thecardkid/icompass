
var Colors = {
    black: 0x000000,
    white: 0xCDCDCD,
    silver: 0x9DACAD,
    table: 0xBDB380,
    tableLeg: 0x4C5454,
    green: 0x00FF41, //4BFF00,
};

// var tableTexture = 'http://4.bp.blogspot.com/-06IPFRCgmH0/VDuFtXJZZNI/AAAAAAAAGjw/K1ew83hDI_c/s1600/seamless-wood-pattern.jpg'
const loader = new THREE.TextureLoader();
const NINETY = Math.PI / 2;
const W = 1916, H = 978;
const ASPECT_RATIO = W / H;
var laptop, keyboard;
var cameraOn = false;
var scene, camera, fieldOfView, aspectRatio, near, far, HEIGHT, WIDTH,
    renderer, container, light;
var title, text, span;
var pressed = false;

$(document).ready(function loadTextures() {
    TW.loadTextures(['images/table.jpeg', 'images/speakers.jpg'], init);
});

function init(textures) {
    // set up scene, camera, renderer
    createScene();
    createDesk(textures[0]);
    createLaptop(textures[1]);
	renderer.render(scene, camera);

    animateEntrance();
    setInterval(flashCameraLight, 6000);
    setInterval(cameraLightToggle, 4000);
    setCss();
    var speed = 10;
    title = new TextScramble(document.getElementById('fake-title'), speed);
    text = new TextScramble(document.getElementById('fake-text'), speed);
    span = new TextScramble(document.getElementById('learn-more'), speed);
    setInterval(function() {
        if (pressed) return;

        text.setText('The camera is blinking at you.');
        setTimeout(function() {
            text.setText('The search engine that doesn\'t track you.');
        }, 2500);
    }, 15000);
}

function enterPress() {
    pressed = true;
    title.setText('Duck It!');
    text.setText('I told you not to search didn\'t I?');

    setTimeout(function() {
        title.setText('DuckDuckGo');
        text.setText('The search engine that doesn\'t track you.');
        pressed = false;
    }, 3000);
}

function createScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    if (WIDTH < ASPECT_RATIO * HEIGHT) HEIGHT = WIDTH / ASPECT_RATIO;
    else if (HEIGHT < WIDTH / ASPECT_RATIO) WIDTH = HEIGHT * ASPECT_RATIO;

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
    speakersTexture.wrapS = speakersTexture.wrapT = THREE.RepeatWrapping;
    speakersTexture.repeat.set(5,2);
    laptop = new Laptop(speakersTexture);
    laptop.mesh.position.z = 5;
    scene.add(laptop.mesh);
}

