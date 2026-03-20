import { Group, Vector3, Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight,
    PCFShadowMap, Fog, Color } from "three";
import {Spring, Ball, Floor, ThreeJsUtils} from '../js/three-js-extensions.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// --- Scene setup ---
const canvas = document.getElementById("oscillatorCanvas");
const overlay = document.getElementById("oscillatorOverlayText");

const scene = new Scene();
const colorSky = 0x0088ff;
scene.background = new Color(colorSky);

const camera = new PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(17, 5, 17);

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;

const directionalLight = new DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 3, 0);
scene.add(directionalLight);

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

scene.add(new AmbientLight(0xffffff, 0.8));
scene.add(new Floor({type: Floor.Type.WOOD_WICKER}));
scene.fog = new Fog(colorSky, 1, 60);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

export class HarmonicOscillator extends Group {
    constructor({ damping = 0.2 } = {}) {
        super();
        this._masses = [];
        this._springs = [];
        this._damping = damping;
    }

    withMassAt(position, options = {}) {
        const ball = new Ball(this, { position, ...options });
        this._masses.push(ball);
        return this;
    }

    withSpringBetween(i, j, k, springColor = 0xffff4d) {
        const p1 = this._masses[i].position;
        const p2 = this._masses[j].position;

        const axis = p2.clone().sub(p1);
        const spring = new Spring(this, p1.clone(), axis, {
            k: k,
            color: springColor,
            castShadow: true
        });
        this._springs.push({ spring, i, j });

        return this;
    }

    moveMass(index, dx) {
        this._masses[index].shiftBy(new Vector3(dx, 0, 0));
    }

    update(dt = 0.01) {
        const forces = this._masses.map(() => new Vector3(0, 0, 0)); // force accumulator

        for (const { spring, i, j } of this._springs) {
            const m1 = this._masses[i];
            const m2 = this._masses[j];

            const axis = m2.position.clone().sub(m1.position);
            const direction = axis.clone().normalize();

            spring.moveTo(m1.position);
            spring.updateAxis(axis);

            const relativeVelocity = m2.velocity.clone().sub(m1.velocity);
            const dampingForce = relativeVelocity
                .projectOnVector(direction)
                .multiplyScalar(this._damping);

            const totalForce = spring.force.add(dampingForce);
            forces[i].add(totalForce);
            forces[j].add(totalForce.clone().negate());
        }

        this._masses.forEach((mass, index) => mass.step(forces[index], dt));
    }
}

let paused = true;
canvas.addEventListener("click", () => {
    ThreeJsUtils.showOverlayMessage(overlay, paused ? "Started" : "Paused");
    paused = !paused;
});

const oscillator = new HarmonicOscillator({ damping: 0.05 });
oscillator
    .withMassAt(new Vector3(-30, 2, 10), { mass: 1, color: 0xff0000, castShadow: true })
    .withMassAt(new Vector3(-20, 2, 10), { mass: 1, color: 0x3333ff, castShadow: true })
    .withMassAt(new Vector3(-10, 2, 10), { mass: 1, color: 0x3333ff, castShadow: true })
    .withMassAt(new Vector3(0, 2, 10), { mass: 1, color: 0x3333ff, castShadow: true })
    .withMassAt(new Vector3(10, 2, 10), { mass: 1, color: 0xff0000, castShadow: true })
    .withSpringBetween(0, 1, 50)
    .withSpringBetween(1, 2, 50)
    .withSpringBetween(2, 3, 50)
    .withSpringBetween(3, 4, 50);
scene.add(oscillator);
oscillator.moveMass(0, 7);
oscillator.moveMass(3, -7);

const opts = {
    title: "Kinetic Energy vs Time",
    width: canvas.clientWidth,
    height: canvas.clientHeight * 1.5,
    bg: "transparent",
    scales: { x: { auto: true }, y: { auto: true } },
    axes: [
        {
            stroke: "#ff0",
            font: "12px Arial",
            grid: { stroke: "rgba(255, 255, 255, 0.2)", width: 1 },
            label: "Time [s]"
        },
        {
            stroke: "#ff0",
            font: "12px Arial",
            grid: { stroke: "rgba(255, 255, 255, 0.2)", width: 1 },
            label: "Displacement"
        }
    ],
    series: [
        { label: "t" },
        { label: "ball 1", stroke: "red" },
        { label: "ball 2", stroke: "blue" },
        { label: "ball 3", stroke: "blue" },
        { label: "ball 4", stroke: "blue" },
        { label: "ball 5", stroke: "red" }
    ]
};

const positionData = [
    [0], // time
    [oscillator._masses[0].position.x], // ball 1
    [oscillator._masses[1].position.x], // ball 2
    [oscillator._masses[2].position.x], // ball 3
    [oscillator._masses[3].position.x], // ball 4
    [oscillator._masses[4].position.x]  // ball 5
];

const uplotChart = new uPlot(opts, positionData, document.getElementById("oscillatorPlot"));

const maxPoints = 500;
const dt = 0.005;
renderer.setAnimationLoop(time => {
    controls.update();
    renderer.render(scene, camera);

    if (paused) return;

    for (let subStep = 0; subStep < 3; subStep++) {
        oscillator.update(dt);

        positionData[0].push(time * 0.001);
        positionData[1].push(oscillator._masses[0].position.x);
        positionData[2].push(oscillator._masses[1].position.x);
        positionData[3].push(oscillator._masses[2].position.x);
        positionData[4].push(oscillator._masses[3].position.x);
        positionData[5].push(oscillator._masses[4].position.x);
    }

    if (positionData[0].length > maxPoints)
        positionData.forEach(arr => arr.shift());
    uplotChart.setData(positionData);
});

