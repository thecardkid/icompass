var Colors = {
    black: 0x000000,
    white: 0xCDCDCD,
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
    createPhone();
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

    camera.position.set(0,20,30);
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer();
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

function createDesk(texture) {
    var desk = new Desk(texture);
    scene.add(desk.mesh);
}

function createLaptop(speakersTexture) {
    var laptop = new Laptop(speakersTexture);
    laptop.mesh.rotation.y = - Math.PI / 4;
    laptop.mesh.position.x = 15;
    scene.add(laptop.mesh);
}

function createPhone() {
    var phone = new Phone();
    phone.mesh.rotation.y = NINETY / 5;
    phone.mesh.position.set(-20, 0, 10);
    scene.add(phone.mesh);
}

