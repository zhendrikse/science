import { Vector3, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight,
    Raycaster, Vector2, Plane, Scene } from "three";
import {MassSpringSystem, Ceiling, ThreeJsUtils, Integrators} from '../js/three-js-extensions.js';

// --- Scene setup ---
const canvas = document.getElementById("springCanvas");
const overlay = document.getElementById("overlayText");
let running = false;

const scene = new Scene();
const g = 9.8; // gravitational constant

const camera = new PerspectiveCamera(50, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
camera.position.set(36, 18, 36);
camera.lookAt(0, 10, 0);

const renderer = new WebGLRenderer({canvas, antialias:true, alpha: true});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setAnimationLoop(animate);

scene.add(new AmbientLight(0xffffff, 0.6));
const dirLight = new DirectionalLight(0xffffff, 1);
dirLight.position.set(30, 20, 30);
scene.add(dirLight);

// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
window.addEventListener('resize', () => ThreeJsUtils.resizeRendererToCanvas(renderer, camera));
window.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    }
});

new Ceiling(scene, {position: new Vector3(0, 30, 0)})
const massSpringSystem = new MassSpringSystem({
    massPosition: new Vector3(
        (Math.random() - 0.5) * 5,  // ±0.25 in X
        15,
        (Math.random() - 0.5) * 5   // ±0.25 in Z
    ),
    gravity: 9.8,
    horizontalK: 100,
    makeTrail: false
});
scene.add(massSpringSystem);

// --- Mouse click & drag ---
let dragging = false;
const raycaster = new Raycaster();
const mouse = new Vector2();
const dragPlane = new Plane(new Vector3(1, 0, 1), 0);

function mousePos(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

canvas.addEventListener('mousedown', (e) => {
    mousePos(e);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(massSpringSystem.mass.rayCastHandle);
    dragging = intersects.length > 0;
});

canvas.addEventListener('mousemove', e => {
    if (!dragging) return;

    mousePos(e);
    raycaster.setFromCamera(mouse, camera);
    const intersection = new Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);

    massSpringSystem.moveMassTo(intersection);
});

canvas.addEventListener('mouseup', () => dragging = false);

const plotData = [
    [], // x-axis = time
    [], // KE
    [], // PE
    [], // E
    []  // Y
];

const plot = new uPlot({
    width: canvas.clientWidth,
    height: canvas.clientHeight * .75,
    title: "Spring energies",
    scales: { x: { time: false }, y: { auto: true } },
    series: [
        {}, // x-axis
        { label: "KE", stroke: "red" },
        { label: "PE", stroke: "lime" },
        { label: "E", stroke: "cyan" },
        { label: "Y", stroke: "yellow" }
    ],
    axes: [
        { stroke: "#fff", grid: { stroke: "rgba(255,255,255,0.2)" } },
        { stroke: "#fff", grid: { stroke: "rgba(255,255,255,0.2)" } }
    ],
    bg: "transparent"
}, plotData, document.getElementById("plot"));

let time = 0;
const maxPoints = 500;
const dt = 0.02;
function animate() {
    renderer.render(scene, camera);
    if (!running) return;

    time += dt;
    if (!dragging)
        massSpringSystem.step(dt, Integrators.rk4Step, 1, time);

    const potentialGravity = massSpringSystem.mass.mass * g * massSpringSystem.mass.position.y;
    plotData[0].push(time); // x-axis = time
    plotData[1].push(massSpringSystem.kineticEnergy());
    plotData[2].push(massSpringSystem.potentialEnergy() + potentialGravity);
    plotData[3].push(massSpringSystem.kineticEnergy() + massSpringSystem.potentialEnergy() + potentialGravity);
    plotData[4].push((5 + massSpringSystem.mass.position.y) * 100);

    if (plotData[0].length > maxPoints)
        plotData.forEach(arr => arr.shift());
    plot.setData(plotData);
}

animate();

