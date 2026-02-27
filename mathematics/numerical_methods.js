import { Vector3, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Scene } from "three";
import {Integrators, MassSpringSystem, ThreeJsUtils} from '../js/three-js-extensions.js';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

// --- Scene setup ---
const canvas = document.getElementById("springCanvas");
const overlay = document.getElementById("overlayText");
let running = false;

const scene = new Scene();
const g = 9.8; // gravitational constant

const camera = new PerspectiveCamera(50, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({canvas, antialias:true, alpha: true});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setAnimationLoop(animate);

const controls = new OrbitControls( camera, canvas );

const dirLight = new DirectionalLight(0xffffff, 5);
dirLight.position.set(20, 20, 20);
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

const massSpringSystem = new MassSpringSystem({
    suspensionPoint: new Vector3(-15, -7.5, 0),
    axis: new Vector3(15, 0, 0),
    massPosition: new Vector3(7, -7.5, 0),
    coils: 25,
    massColor: "cyan",
});
scene.add(massSpringSystem);

const massSpringSystemRK4 = new MassSpringSystem({
    suspensionPoint: new Vector3(-15, 2.5, 0),
    axis: new Vector3(15, 0, 0),
    massPosition: new Vector3(7, 2.5, 0),
    coils: 25,
    massColor: "red"
});
scene.add(massSpringSystemRK4);

const massSpringSystemRK2 = new MassSpringSystem({
    suspensionPoint: new Vector3(-15, -2.5, 0),
    axis: new Vector3(15, 0, 0),
    massPosition: new Vector3(7, -2.5, 0),
    coils: 25,
    massColor: "green"
});
scene.add(massSpringSystemRK2);

const massSpringSystemSymplectic = new MassSpringSystem({
    suspensionPoint: new Vector3(-15, 7.5, 0),
    axis: new Vector3(15, 0, 0),
    massPosition: new Vector3( 7, 7.5, 0),
    coils: 25,
    massColor: "yellow",
});
scene.add(massSpringSystemSymplectic);

const plotData = [
    [], // x-axis = time
    [], // Euler
    [], // Symplectic
    [], // RK2
    []  // RK4
];

const plot = new uPlot({
    width: canvas.clientWidth,
    height: canvas.clientHeight * .5,
    title: "Slinky energies",
    scales: { x: { time: false }, y: { auto: true } },
    series: [
        {}, // x-axis
        { label: "Euler", stroke: "cyan" },
        { label: "Symplectic", stroke: "yellow" },
        { label: "RK2", stroke: "green" },
        { label: "RK4", stroke: "red" }
    ],
    axes: [
        { stroke: "#fff", grid: { stroke: "rgba(255,255,255,0.2)" } },
        { stroke: "#fff", grid: { stroke: "rgba(255,255,255,0.2)" } }
    ],
    bg: "transparent"
}, plotData, document.getElementById("plot"));

const kHorizontal = 100;
let time = 0;
const maxPoints = 500;
const dt = 0.0025;
function animate() {
    renderer.render(scene, camera);
    controls.update();
    if (!running) return;

    for (let subStep = 0; subStep < 10; subStep++) {
        time += dt;
        massSpringSystem.step(dt, Integrators.eulerStep, 0, time);
        massSpringSystemSymplectic.step(dt, Integrators.symplecticEulerStep, 0, time);
        massSpringSystemRK2.step(dt, Integrators.rk2Step, 0, time);
        massSpringSystemRK4.step(dt, Integrators.rk4Step, 0, time);
    }

    plotData[0].push(time); // x-axis = time
    plotData[1].push(massSpringSystem.mass.position.x);
    plotData[2].push(massSpringSystemSymplectic.mass.position.x);
    plotData[3].push(massSpringSystemRK2.mass.position.x);
    plotData[4].push(massSpringSystemRK4.mass.position.x);

    if (plotData[0].length > maxPoints)
        plotData.forEach(arr => arr.shift());
    plot.setData(plotData);
}

animate();

