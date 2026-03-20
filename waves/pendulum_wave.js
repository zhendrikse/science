import { Group, SphereGeometry, MeshStandardMaterial, CylinderGeometry, Mesh, Vector3, PerspectiveCamera,
    WebGLRenderer, Color, Scene, DirectionalLight, AmbientLight, PCFShadowMap, Fog } from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeJsUtils, Floor } from "../js/three-js-extensions.js";

const g = 9.8; // gravitational constant
const canvas = document.getElementById('pendulumCanvas');
const overlay = document.getElementById('pendulumOverlay');

class Pendulum extends Group {
    constructor({T, position, color, theta0 = Math.PI / 6, mass = 1, pivotY=1} = {}) {
        super();
        this._xPosition = position;
        this._length = (T * T * g) / (4 * Math.PI * Math.PI);
        this._omega = 0;
        this._theta = theta0;
        this._mass = mass;
        this._pivotY = pivotY;
        this._inertia = mass * this._length ** 2

        const ballGeometry = new SphereGeometry(0.1);
        const ballMaterial = new MeshStandardMaterial({
            color: color,
            roughness: 0.2,
            metalness: 0.8
        });
        this._ball = new Mesh(ballGeometry, ballMaterial);
        this._ball.castShadow = true;

        const ropeGeometry = new CylinderGeometry(0.01, 0.01, this._length);
        const ropeMaterial = new MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0,
            metalness: 0.2
        });
        this._rope = new Mesh(ropeGeometry, ropeMaterial);

        this.add(this._ball, this._rope);
        this.updatePosition();
    }

    update(dt) {
        const alpha = -this._mass * g * this._ball.position.z / this._inertia;
        this._omega += alpha * dt;
        this._theta += this._omega * dt;

        this.updatePosition();
    }

    updatePosition() {
        const x = this._xPosition;
        const y = this._pivotY - this._length * Math.cos(this._theta);
        const z = this._length * Math.sin(this._theta);
        this._ball.position.set(x, y, z);

        const top = new Vector3(x, this._pivotY, 0); // rope attachment
        const axis = new Vector3().subVectors(this._ball.position, top);

        this._rope.scale.set(1, axis.length() / this._length, 1);
        this._rope.position.copy(top).add(axis.clone().multiplyScalar(0.5));
        this._rope.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), axis.clone().normalize());
    }
}

const scene = new Scene();
let colorSky = 0x0088ff;
scene.background = new Color(colorSky);
scene.add(new Floor({positionY: -5}));

const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.set(-5.5, -3.15, 1.8);

const renderer = new WebGLRenderer({ antialias: true, canvas: canvas });
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0.2, -3.3, -0.4);
controls.update();

let paused = true;
canvas.addEventListener("click", () => {
    ThreeJsUtils.showOverlayMessage(overlay, paused ? "Started" : "Paused");
    paused = !paused;
});

const light = new AmbientLight(0xffffff, 0.4);
scene.add(light);
const directionalLight = new DirectionalLight(0xffffff, 4);
directionalLight.position.set(2, 5, 2);

// Adjust shadow camera settings
directionalLight.shadow.camera.near = 0.5; // Default is 0.5
directionalLight.shadow.camera.far = 50; // Default is 500
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.bottom = -20;
directionalLight.shadow.camera.left = -20;
directionalLight.castShadow = true;

// Adjust shadow map settings
directionalLight.shadow.mapSize.width = 2048; // Default is 512
directionalLight.shadow.mapSize.height = 2048; // Default is 512

// Set shadow map type
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;

scene.add(directionalLight);
scene.add(new Floor());
scene.fog = new Fog(colorSky, 1, 60);

const pendulums = [];

const Tpw = 50;
const N = 15;
const total_balls = 20;

const Tmax = Tpw / N;
const Lmax = Tmax ** 2 * g / (4 * Math.PI ** 2);
const width = Lmax;
const size = .75 * (width / total_balls)

for (let i = 0; i < total_balls; i++) {
    const T = Tpw / (N + i);
    const loc = width * (-0.5 + i / (total_balls - 1));

    const color = new Color();
    color.setHSL(i / (total_balls - 1), 1, 0.5); // HSV with full saturation and 50% lightness
    const pendulum = new Pendulum({
        T: T,
        position: loc,
        color: color,
        pivotY: -2
    });
    scene.add(pendulum);
    pendulums.push(pendulum);
}

const dt = 0.001;
renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
    if (paused) return;

    for (let pendulum of pendulums)
        for (let subStep = 0; subStep < 25; subStep++)
            pendulum.update(dt);
});