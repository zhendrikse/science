import { Vector3, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Scene } from "three";
import {MassSpringSystem, ThreeJsUtils} from '../js/three-js-extensions.js';
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

const massSpringSystem = new MassSpringSystem({
    suspensionPoint: new Vector3(-15, 0, 0),
    axis: new Vector3(15, 0, 0),
    massPosition: new Vector3(35, 0, 0),
    coils: 25
});
scene.add(massSpringSystem);

const massSpringSystemRK4 = new MassSpringSystem({
    suspensionPoint: new Vector3(-15, 5, 0),
    axis: new Vector3(15, 5, 0),
    massPosition: new Vector3(35, 5, 0),
    coils: 25,
    massColor: "red"
});
scene.add(massSpringSystemRK4);

const plotData = [
    [], // x-axis = time
    [], // KE
    [], // PE
    [], // E
    []  // Y
];

const plot = new uPlot({
    width: canvas.clientWidth,
    height: canvas.clientHeight * .5,
    title: "Slinky energies",
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

const kHorizontal = 100;
let time = 0;
const maxPoints = 500;
const dt = 0.02;
function animate() {
    renderer.render(scene, camera);
    controls.update();
    if (!running) return;

    for (let subStep = 0; subStep < 2; subStep++) {
        time += dt;
        massSpringSystem.semiImplicitEulerUpdate(time, dt);
        massSpringSystemRK4.rk4Update(time, dt);
    }

    plotData[0].push(time); // x-axis = time
    plotData[1].push(massSpringSystem.kineticEnergy());
    plotData[2].push(massSpringSystem.potentialEnergy());
    plotData[3].push(massSpringSystem.kineticEnergy() + massSpringSystem.potentialEnergy());
    plotData[4].push((5 + massSpringSystem.mass.position.y) * 1000);

    if (plotData[0].length > maxPoints)
        plotData.forEach(arr => arr.shift());
    plot.setData(plotData);
}

animate();

