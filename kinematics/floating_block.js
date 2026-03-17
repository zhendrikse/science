import { Scene, Color, Vector3, PerspectiveCamera, BoxGeometry, MeshStandardMaterial, Mesh, WebGLRenderer, AmbientLight, DirectionalLight } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {ThreeJsUtils} from "../js/three-js-extensions.js";

// --- Scene setup ---
const canvas = document.getElementById("floatingBlockCanvas");
const scene = new Scene();

const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(1.5, 1.5, 3);

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

scene.add(new AmbientLight(0xffffff, 0.6));
const light = new DirectionalLight(0xffffff, 2);
light.position.set(5, 10, 5);
scene.add(light);

class Liquid {
    constructor({ density = 1000, size = new Vector3(2, 2, 0.75) } = {}) {
        this.mesh = new Mesh(
            new BoxGeometry(size.x, size.y, size.z),
            new MeshStandardMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.4 })
        );
        scene.add(this.mesh);
        this.density = density;
        this.size = size;
    }
    pos() { return this.mesh.position; }
}

class WoodenBlock {
    constructor({ density = 500, size = new Vector3(0.4, 0.4, 0.1) } = {}) {
        this.mesh = new Mesh(
            new BoxGeometry(size.x, size.y, size.z),
            new MeshStandardMaterial({ color: 0xdeb887 })
        );
        scene.add(this.mesh);
        this.size = size;
        this.density = density;
        this.velocity = new Vector3();
        this.mesh.position.y = 0; // start at water surface
    }

    mass() {
        return this.density * this.size.x * this.size.y * this.size.z;
    }

    submergedVolume(water) {
        const topFluid = water.pos().y + water.size.y / 2;
        const topBlock = this.mesh.position.y + this.size.y / 2;
        const bottomBlock = this.mesh.position.y - this.size.y / 2;

        let hSubmerged = 0;
        if (topBlock <= topFluid) hSubmerged = this.size.y;
        else if (bottomBlock >= topFluid) hSubmerged = 0;
        else hSubmerged = topFluid - bottomBlock;

        return this.size.x * hSubmerged * this.size.z;
    }

    buoyancyForce(water) {
        const g = -9.8;
        return water.density * -g * this.submergedVolume(water);
    }

    dragForce() {
        const dragCoefficient = -5.0;
        return dragCoefficient * this.velocity.y;
    }

    netForce(water) {
        const g = -9.8;
        const Fg = this.mass() * g;
        return Fg + this.buoyancyForce(water) + this.dragForce();
    }

    step(water, dt) {
        const a = this.netForce(water) / this.mass();
        this.velocity.y += a * dt;
        this.mesh.position.y += this.velocity.y * dt;
    }
}

// --- Initialize objects ---
const water = new Liquid();
const block = new WoodenBlock();

// --- uPlot chart ---
const MAX_POINTS = 500;
let data = [
    [0],                              // time
    [block.buoyancyForce(water)],     // magenta
    [block.dragForce()]               // blue
];

const opts = {
    width: canvas.clientWidth, height: canvas.clientHeight * .5,
    transparent: true,
    title: "Buoyancy & drag forces",
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
        { label: "t [s]" },
        { label: "buoyancy", stroke: "magenta" },
        { label: "drag", stroke: "blue" }
    ]
};
const chart = new uPlot(opts, data, document.getElementById("forceChart"));
const overlay = document.getElementById("floatingBlockOverlayText");

let running = false;
canvas.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    }
});

// --- Simulation ---
let t = 0;
const dt = 0.001;

renderer.setAnimationLoop( () => {
    controls.update();
    renderer.render(scene, camera);

    if (!running) return;

    for (let subStep = 0; subStep < 20; subStep++) {
        block.step(water, dt);
        t += dt;
    }

    data[0].push(t);
    data[1].push(block.buoyancyForce(water));
    data[2].push(block.dragForce());

    if(data[0].length > MAX_POINTS){
        data[0].shift();
        data[1].shift();
        data[2].shift();
    }

    chart.setData(data);
});
