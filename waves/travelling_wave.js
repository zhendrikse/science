import {
    Scene, Color, Vector3, PerspectiveCamera, Group,
    WebGLRenderer, DirectionalLight, AmbientLight
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {Ball, Bond, ThreeJsUtils} from "../js/three-js-extensions.js";

console.clear();
const canvas = document.getElementById("travellingWaveCanvas");
const overlay = document.getElementById("travellingWaveOverlayText");
const scene = new Scene();

const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.copy(new Vector3(-5, 2, 8).multiplyScalar(0.8));

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

scene.add(new AmbientLight(0xffffff, 1));

const light = new DirectionalLight(0xffffff, 5);
light.position.set(0, 2, 8);
scene.add(light);

class String1D extends Group {
    constructor({
        count = 80,
        length = 10,
        totalMass = 0.025,
        amplitude = 0.8,
        omega = 45 } = {})
    {
        super();
        this._amplitude = amplitude;
        this._omega = omega;
        this._balls = [];
        this._forces = [];
        this._bonds = [];
        this._count = count;
        this._length = length;
        this._l0 = 0.9 * length / (count - 1);

        this.#createBalls(totalMass, count);
        this.#createBonds(count);
        for (let i = 0; i < count; i++)
            this._forces.push(new Vector3());
    }

    #createBalls(totalMass, count) {
        const dx = this._length / (count - 1);
        const mass = totalMass / count;
        const left = -this._length / 2;

        for (let i = 0; i < count; i++)
            this._balls.push(new Ball(this, {
                radius: 0.035,
                color: new Color(0xffcc11),
                mass: mass,
                position: new Vector3(left + i * dx, 0, 0)
            }));
    }

    #createBonds(count) {
        for (let i = 0; i < count - 1; i++)
            this._bonds.push(new Bond(
                this,
                this._balls[i],
                this._balls[i + 1],
                {
                    k_bond: 1.64 * (count - 1),
                    radius: 0.02,
                    color: "red",
                    type: Bond.Type.CYLINDER
                })
            );
    }

    #driveFirstBall(t) {
        const firstBall = this._balls[0];
        const x = -this._length / 2;
        firstBall.position = new Vector3(x, 0, 0);

        const halfWaveTime = 2 * Math.PI / this._omega;
        if (t < halfWaveTime)
            firstBall.position = new Vector3(x, this._amplitude * Math.sin(this._omega * t), 0);
    }

    #updateForces() {
        for (let i = 1; i < this._count - 1; i++) {
            const left = this._balls[i - 1];
            const right = this._balls[i + 1];

            this._forces[i].set(0, 0, 0);

            // left
            const deltaL = this._balls[i].positionVectorTo(left);
            const stretchL = deltaL.length() - this._l0;
            this._forces[i].add(deltaL.normalize().multiplyScalar(this._bonds[i - 1].bondConstant * stretchL));

            // right
            const deltaR = this._balls[i].positionVectorTo(right);
            const stretchR = deltaR.length() - this._l0;
            this._forces[i].add(deltaR.normalize().multiplyScalar(this._bonds[i].bondConstant * stretchR));
        }
    }

    #integrate(dt) {
        for (let i = 1; i < this._count - 1; i++)
            this._balls[i].step(this._forces[i], dt);
    }

    update(t, dt) {
        this.#driveFirstBall(t);
        this.#updateForces();
        this.#integrate(dt);

        for (const bond of this._bonds)
            bond.update(t);
    }

    reset() {
        const dx = this._length / (this._count - 1);
        const left = -this._length / 2;
        for (let i = 0; i < this._count; i++) {
            this._balls[i].moveTo(new Vector3(left + i * dx, 0, 0));
            this._balls[i].accelerateTo(new Vector3(0, 0, 0));
            this._forces[i].set(0, 0, 0);
        }

        for (const bond of this._bonds)
            bond.update(0);
    }
}

const string = new String1D({
    count: 100,
    length: 12
});
scene.add(string);

// ---- uPlot setup ----
const MAX_POINTS = 500;
let uplotData = [
    [0], // time
    [0]  // max Y
];
const uplotOpts = {
    title: "Crest of wave",
    width: canvas.clientWidth,
    height: canvas.clientHeight,
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
            label: "y [m]"
        }
    ],
    series: [
        { label:"t [s]" },
        { label:"y max", stroke:"red" }
    ]
};
const uplotChart = new uPlot(uplotOpts, uplotData, document.getElementById("waveChart"));

let running = false;
canvas.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    } else {
        ThreeJsUtils.showOverlayMessage(overlay, "Reset");
        string.reset();      // zet snaar terug naar rustpositie
        time = 0;            // reset simulatie-tijd

        // reset uPlot data
        uplotData[0] = [];
        uplotData[1] = [];
        uplotChart.setData(uplotData);

        running = false;
    }
});

const dt = 0.0001;
let time = 0;
renderer.setAnimationLoop( () => {
    controls.update();
    renderer.render(scene, camera);

    if (!running) return;

    for (let subStep = 0; subStep < 40; subStep++) {
        string.update(time, dt);
        time += dt;
    }

    const yMax = Math.max(...string._balls.map(ball => ball.position.y));

    uplotData[0].push(time);
    uplotData[1].push(yMax);

    if(uplotData[0].length > MAX_POINTS){
        uplotData[0].shift();
        uplotData[1].shift();
    }

    uplotChart.setData(uplotData);
});
