import { Scene, Vector3, Group, AmbientLight, PerspectiveCamera, WebGLRenderer, DirectionalLight,
    BoxGeometry, Mesh, MeshLambertMaterial, DoubleSide } from "three";
import { Cylinder, Ball, Spring, ThreeJsUtils} from '../js/three-js-extensions.js';

const canvas = document.getElementById("slinkyCanvas");
const overlay = document.getElementById("overlayText");
let running = false;

// Scene, camera en renderer setup
const scene = new Scene();
const experimentGroup = new Group();
scene.add(experimentGroup);

const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(-5, 0, 15);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({antialias:true, alpha: true, canvas: canvas});
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

const light = new DirectionalLight(0xffffff, 2);
light.position.set(-5, 0, 15);
scene.add(light);
scene.add(new AmbientLight(0x404040, 0.7));

// Parameters
const g = new Vector3(0, -9.8, 0);
const L0 = 2;
const k = 100;

const floorGeometry = new BoxGeometry(5 * L0, .1, 3.5 * L0);
const floorMaterial = new MeshLambertMaterial({transparent: true, color: 0x00bb00, side: DoubleSide });
const floor = new Mesh(floorGeometry, floorMaterial);
floor.position.set(0, -3.5 * L0, 0);
experimentGroup.add(floor);

const ball1 = new Ball(experimentGroup, {
    position: new Vector3(0, L0 / 2, 0),
    mass: 5,
    radius: 0.3,
    color: 0xff0000
});
const ball2 = new Ball(experimentGroup, {
    position: new Vector3(0, L0 / 2 - L0 - ball1.mass * g.length() / k, 0),
    mass: 5,
    radius: 0.3,
    color: 0x00ffff
});
const ball3 = new Ball(experimentGroup, {
    position: ball2.position.clone().add(new Vector3(L0, 0, 0)),
    mass: 5,
    radius: 0.3,
    color: 0xffff00
});

// Spring
const spring = new Spring(experimentGroup, ball1.position, ball1.positionVectorTo(ball2), {
    k,
    coils: 15,
    radius: 0.2,
    thickness: 0.025
});

// Stick
const stick = new Cylinder(experimentGroup, ball2.position.clone().sub(new Vector3(L0, 2.75 * L0, 0)), new Vector3(0, 3 * L0, 0), {
    radius: L0/15,
    color: 0x00ffff
});
const stick2 = new Cylinder(experimentGroup, ball2.position.clone().sub(new Vector3(L0, 0, 0)), new Vector3(L0/2, 0, 0), {
    radius: L0/15,
    color: 0x00ffff
});
experimentGroup.position.y = 2 * L0;
experimentGroup.position.x -= 1.5 * L0;

function iterate(dt) {
    if (ball2.liesOnFloor({floorLevel: -3.5 * L0}) || ball3.liesOnFloor({floorLevel: -3.5 * L0})) return;
    const springLength = ball1.positionVectorTo(ball2);
    const springForce = springLength.clone().normalize().multiplyScalar(-k * (springLength.length() - L0));
    const forceOnBall1 = g.clone().multiplyScalar(ball1.mass).sub(springForce);
    const forceOnBall2 = g.clone().multiplyScalar(ball2.mass).add(springForce);

    ball1.step(forceOnBall1, dt);
    ball2.step(forceOnBall2, dt);
    ball3.step(g.clone().multiplyScalar(ball3.mass), dt);

    spring.moveTo(ball1.position);
    spring.updateAxis(ball1.positionVectorTo(ball2));
}

// Animatie loop
let t = 0;
const dt = 0.005;
function animate() {
    if (running)
        iterate(dt);
    renderer.render(scene, camera);
    t += dt;
}
