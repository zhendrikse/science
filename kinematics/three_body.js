import {Scene, PerspectiveCamera, DirectionalLight, WebGLRenderer, Vector3 } from "three";
import {Ball, Integrators, ThreeJsUtils} from '../js/three-js-extensions.js';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

//const canvasContainer = document.getElementById("threeBodyWrapper");
const canvas = document.getElementById("threeBodyCanvas");
const overlay = document.getElementById("overlayText");
let running = false;

const G = 6.67e-11
const astronomical_unit = 1.49e11
const mass = 1e30
const rA = 0.1 * astronomical_unit
const rB = rA / 0.8
const vA = Math.sqrt(G * 0.8 * mass * rA) / (rA + rB)
const sphereRadius = 190e7;
const scale = 1E-9;

const scene = new Scene();

const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
camera.position.set(30, 30, 30);

const controls = new OrbitControls( camera, canvas );
const renderer = new WebGLRenderer({antialias: true, canvas: canvas, alpha: true});
renderer.setAnimationLoop( animate );

// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
window.addEventListener('resize', () => ThreeJsUtils.resizeRendererToCanvas(renderer, camera));
window.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    }
});

const light = new DirectionalLight(0xffffff, 1);
light.position.set(30, 30, 30);
scene.add(light);

const sphereA = new Ball(scene, {
    position: new Vector3(rA, 0, 0),
    velocity: new Vector3(0, vA, 0),
    radius: sphereRadius,
    mass: mass,
    color: "yellow",
    scale: scale
});

const sphereB = new Ball(scene, {
    position: new Vector3(-rB, 0, 0),
    velocity: new Vector3(0, -vA / 0.8, 0),
    radius: sphereRadius,
    mass: mass * 0.8,
    color: "cyan",
    scale: scale
});

const sphereC = new Ball(scene, {
    position: new Vector3(0, 0, rA),
    velocity: new Vector3(0, 0, 0),
    radius: sphereRadius,
    mass: mass * 0.5,
    color: "magenta",
    scale: scale
});

sphereA.enableTrail({maxPoints: 1000, trailStep: 20, lineWidth: 3, color: "yellow"});
sphereB.enableTrail({maxPoints: 1000, trailStep: 20, lineWidth: 3, color: "cyan"});
sphereC.enableTrail({maxPoints: 1000, trailStep: 20, lineWidth: 3, color: "magenta"});

function forceBetween(self, other) {
    const radius = other.position.clone().sub(self.position);
    const r2 = radius.lengthSq();
    const r = Math.sqrt(r2);
    return radius.multiplyScalar(G * self.mass * other.mass / (r2 * r));
}

function iterate(subSteps, dt) {
    if(!running) return;

    const force_BA = forceBetween(sphereA, sphereB);
    const force_CB = forceBetween(sphereB, sphereC);
    const force_AC = forceBetween(sphereC, sphereA);

    sphereA.step(force_BA.clone().sub(force_AC), dt / subSteps, Integrators.symplecticEulerStep);
    sphereB.step(force_CB.clone().sub(force_BA), dt / subSteps, Integrators.symplecticEulerStep);
    sphereC.step(force_AC.clone().sub(force_CB), dt / subSteps, Integrators.symplecticEulerStep);
}

const dt = 5000;
const subSteps = 50;
function animate(time) {
    for (let i = 0; i < subSteps; i++)
    iterate(subSteps, dt);

    renderer.render(scene, camera);
    controls.update();
}
