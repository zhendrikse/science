import { Vector3, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, BoxGeometry,
    MeshStandardMaterial, DoubleSide, Mesh, Scene, Group } from "three";
import {Spring, Ball, ThreeJsUtils} from '../js/three-js-extensions.js';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

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
//const controls = new OrbitControls( camera, canvas );

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
    } else
        ThreeJsUtils.showOverlayMessage(overlay, "Click to start the animation!");
});

const ceilingSize = 12;
const ceilingGeometry = new BoxGeometry(ceilingSize, ceilingSize, .75);
const ceilingMaterial = new MeshStandardMaterial({
    color: 0x8a8a8a,
    metalness: 0.05,
    roughness: 0.95,
    side: DoubleSide
});
ceilingMaterial.bumpScale = 0.05;
const ceiling = new Mesh(ceilingGeometry, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 30;
scene.add(ceiling);

class MassSpringSystem extends Group {
    constructor({
                    suspensionPoint=new Vector3(0, 30, 0),
                    axis=new Vector3(0, 25, 0),
                    positionMass=axis.clone()
    } = {}) {
        super();
        this._suspensionPoint = suspensionPoint;
        this._slinky = new Spring(this, suspensionPoint, axis, {
            radius: 1,
            k: 200,
            coils: 40,
            longitudinalOscillation: true,
            thickness: 0.125
        });

        this._mass = new Ball(this, {
            position: suspensionPoint.clone().sub(axis).add(positionMass),
            radius: 2,
            mass: 10,
            color: "orange"
        });
        this.updateWith(new Vector3(0, 0, 0), 0, 0, false);
    }

    gravitationalForce(g=9.8) { return new Vector3(0, -this._mass.mass * g, 0); }

    force(kHorizontal = 100, damping = 1) { // horizontal spring constant
        const pos = this._mass.position.clone();
        const vel = this._mass.velocity;

        const fx = -kHorizontal * pos.x - damping * vel.x;
        const fy = this._slinky.force - damping * vel.y;
        const fz = -kHorizontal * pos.z - damping * vel.z;

        return new Vector3(fx, fy, fz).add(this.gravitationalForce());
    }

    moveMassTo(newPosition) {
        this._mass.moveTo(newPosition);
        this._mass.accelerateTo(new Vector3(0, 0, 0));
    }

    updateWith(force, time, dt, dragging=false) {
        if (!dragging) this._mass.semiImplicitEulerUpdate(force, dt);
        this._slinky.updateAxis(this._mass.position.clone().sub(this._suspensionPoint));
        this._slinky.update(time);
    }

    get mass() { return this._mass; }
    kineticEnergy() { return this._mass.kineticEnergy(); }
    potentialEnergy() { return this._slinky.potentialEnergy(); }
}

const massSpringSystem = new MassSpringSystem({
    positionMass: new Vector3(
        (Math.random() - 0.5) * 5,  // ±0.25 in X
        10,
        (Math.random() - 0.5) * 5   // ±0.25 in Z
    )
});
scene.add(massSpringSystem);

// --- Mouse click & drag ---
let dragging = false;
let mouseY = 0;
canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1; // niet exact nodig voor nu
    dragging = true;
});
canvas.addEventListener('mouseup', e => dragging = false);
canvas.addEventListener('mousemove', e => {
    if(dragging) {
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left)/rect.width - 0.5) * 20; // scale to scene
        const y = 10 - ((e.clientY - rect.top) / rect.height) * 20;
        massSpringSystem.moveMassTo(new Vector3(x, y, 0));
    }
});

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

let time = 0;
const maxPoints = 500;
const dt = 0.02;
function animate() {
    renderer.render(scene, camera);
    //controls.update();

    if (!running) return;

    time += dt;
    massSpringSystem.updateWith(massSpringSystem.force(), time, dt, dragging);

    const potentialGravity = massSpringSystem.mass * g * massSpringSystem.mass.position.y;
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

