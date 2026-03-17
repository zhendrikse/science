import { Scene, Color, Vector3, PerspectiveCamera, SphereGeometry, MeshStandardMaterial, Mesh, WebGLRenderer, BoxGeometry, AmbientLight, DirectionalLight, Group } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Ball, Bond, ThreeJsUtils } from "../js/three-js-extensions.js";

// --- Scene setup ---
const canvas = document.getElementById("chainDropCanvas");
const overlay = document.getElementById("chainDropOverlayText");
const scene = new Scene();

const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 10);
camera.position.set(1, 1.8, 2.2);

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

scene.add(new AmbientLight(0xffffff, 0.6));
const light = new DirectionalLight(0xffffff, 1);
light.position.set(1, 2, 1);
scene.add(light);

// --- Constants ---
const g = new Vector3(0, -9.8, 0);

// --- Chain class ---
class Chain extends Group {
    constructor({
        totalBalls = 30,
        length = 1,
        mass = 0.1,
        amountHanging = 0.1 } = {}) {
        super();
        this._balls = [];
        this._forces = [];
        this._bonds = [];
        this._length = length;
        this._interBallLength = length / (totalBalls - 1);
        this._mass = mass;
        this._springK = 300 / totalBalls;

        this.#initBalls(amountHanging, length, mass, totalBalls);
        this.#initBonds();
        this.reset();
        this._initialPositions = this._balls.map(ball => ball.position.clone());
    }

    #initBalls(amountHanging, length, mass, totalBalls) {
        // create horizontal part
        let pos = new Vector3(-length + amountHanging, 0, 0);
        for (let i = 0; i < totalBalls; i++) {
            if (pos.x > 0) break;
            const ball = new Ball(this, {
                radius: this.ballRadius,
                color: new Color(0x00ffff),
                mass: mass / totalBalls,
                position: pos.clone()
            });
            this._balls.push(ball);
            this._forces.push(new Vector3());
            pos.x += this._interBallLength;
        }

        // Vertical pending part
        pos = this._balls[this._balls.length - 1].position.clone();
        while (pos.y > -amountHanging) {
            pos.y -= this._interBallLength;
            const ball = new Ball(this, {
                radius: this.ballRadius,
                color: new Color(0x00ffff),
                mass: mass / totalBalls,
                position: pos.clone()
            });
            this._balls.push(ball);
            this._forces.push(new Vector3());
        }
    }

    #initBonds() {
        for (let i = 0; i < this._balls.length - 1; i++) {
            this._bonds.push(new Bond(
                this,
                this._balls[i],
                this._balls[i + 1],
                {
                    k_bond: this._springK,
                    radius: this.ballRadius * 0.6,
                    thickness: this.ballRadius * 0.4,
                    color: "yellow",
                    type: Bond.Type.SPRING
                }
            ));
        }
    }

    get ballRadius() { return this._length / 40; }

    reset() {
        for (let i = 0; i < this._balls.length; i++) {
            const ball = this._balls[i];
            ball.position = this._initialPositions[i].clone();
            ball.accelerateTo(new Vector3());

            this._forces[i].set(0, 0, 0);
        }

        for (const bond of this._bonds)
            bond.update();
    }

    update(dt) {
        this._chainForces();
        this._pivotForces();

        for (let i = 0; i < this._balls.length; i++)
            this._balls[i].step(this._forces[i], dt);

        for (const bond of this._bonds)
            bond.update();
    }

    _chainForces() {
        for (let i = 0; i < this._balls.length; i++) {
            const ball = this._balls[i];
            this._forces[i].set(0, 0, 0);

            if (i > 0) {
                const delta = ball.positionVectorTo(this._balls[i - 1]);
                const stretch = delta.length() - this._interBallLength;
                this._forces[i].add(delta.normalize().multiplyScalar(this._springK * stretch));
            }

            if (i < this._balls.length - 1) {
                const delta = ball.positionVectorTo(this._balls[i + 1]);
                const stretch = delta.length() - this._interBallLength;
                this._forces[i].add(delta.normalize().multiplyScalar(this._springK * stretch));
            }

            this._forces[i].add(g.clone().multiplyScalar(ball.mass));
        }
    }

    _pivotForces() {
        for (let i = 0; i < this._balls.length; i++) {
            const ball = this._balls[i];
            const pos = ball.position;

            let correction = new Vector3(0, 0, 0);
            const d = this._interBallLength / 2;

            if (pos.y < 0 && pos.y > -d && pos.x < -d)
                correction.set(0, -pos.y, 0);

            if (pos.x < 0 && pos.x > -d && pos.y < -d)
                correction.set(-pos.x, 0, 0);

            if (pos.x < 0 && pos.x > -d && pos.y < 0 && pos.y > -d)
                correction.set(-pos.x, -pos.y, 0);

            this._forces[i].add(correction.multiplyScalar((this._balls.length / 2) * this._springK));
        }
    }
}

const table = new Mesh(
    new BoxGeometry(1, 0.1, 0.3),
    new MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.3 })
);
table.position.set(-1.5, 1.1, 0);
scene.add(table);

const chain = new Chain({ totalBalls: 20, length: 1, amountHanging: 0.2 });
scene.add(chain);
chain.position.x -= 1;
chain.position.y += 1.15;

let running = false;
canvas.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
        startTime = currentTime;
    } else {
        ThreeJsUtils.showOverlayMessage(overlay, "Reset");

        chain.reset();
        resetPlot();
        startTime = currentTime;
        running = false;
    }
});

const MAX_POINTS = 500;
let acceleration = 0;
let plotData = [[0], [acceleration], [g.y]]; // t, accel, g

function resetPlot() {
    plotData = [[0], [0], [g.y]];
    plot.setData(plotData);
}

const plotOpts = {
    title: "Acceleration of chain end",
    width: canvas.clientWidth,
    height: canvas.clientHeight * 0.75,
    transparent: true,
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
        { label: "t" },
        { label: "a (chain end)", stroke: "cyan" },
        { label: "g", stroke: "red", dash: [5,5] }
    ]
};

const plot = new uPlot(plotOpts, plotData, document.getElementById("chainPlot"));

const dt = 0.001;
let startTime = 0;
let currentTime = 0;
renderer.setAnimationLoop( (time) => {
    currentTime = time;
    controls.update();
    renderer.render(scene, camera);

    if (!running || time - startTime > 10000) return;
    for (let subStep = 0; subStep < 5; subStep++)
        chain.update(dt);

    const lastIndex = chain._balls.length - 1;
    const forceY = chain._forces[lastIndex].y;
    const mass = chain._balls[lastIndex].mass;
    acceleration = forceY / mass;

    plotData[0].push(time * .001);
    plotData[1].push(acceleration);
    plotData[2].push(g.y);

    if (plotData[0].length > MAX_POINTS) {
        plotData[0].shift();
        plotData[1].shift();
        plotData[2].shift();
    }

    plot.setData(plotData);
});
