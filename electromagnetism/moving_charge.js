import {
    Scene, PerspectiveCamera, WebGLRenderer,
    Vector3, Color, AmbientLight, Group, PointLight
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {Sphere, Arrow, TrailProperties, ThreeJsUtils, Range} from "../js/three-js-extensions.js";

const canvas = document.getElementById("capacitorCanvas");
const speedSlider = document.getElementById("speedSlider");
const chargeSlider = document.getElementById("chargeSlider");
const chargeSliderValue = document.getElementById("chargeSliderValue");
const speedSliderValue = document.getElementById("speedSliderValue");
const overlay = document.getElementById("movingChargeOverlayText");
const scene = new Scene();

const EC = 1.6e-19;
const scaleFactor = 1e14;
const K = 9E9;
let running = false;

class Field extends Group {
    constructor(charges = []) {
        super();
        this.charges = charges;
        this.arrows = [];
    }

    fieldAt(position, out=new Vector3()) {
        out.set(0, 0, 0);
        for (const charge of this.charges)
            out.add(charge.fieldAt(position).multiplyScalar(K));

        return out;
    }

    _fieldArrowAt(position) {
        const colorFactor = 1 - Math.exp(-.5 * EC * this.fieldAt(position).length());
        // console.log(colorFactor);
        const color = new Color(1, colorFactor, 0);
        const axis = this.fieldAt(position).clone().normalize().multiplyScalar(2);
        return new Arrow({
            position: position.clone().multiplyScalar(scaleFactor),
            axis: axis,
            color: color
        });
    }

    show(xRange, yRange, zRange) {
        this.arrows.forEach(arrow => this.remove(arrow));
        this.arrows = [];

        for (let x of xRange)
            for (let y of yRange)
                for (let z of zRange)
                    this.arrows.push(this._fieldArrowAt(new Vector3(x, y, z).divideScalar(scaleFactor)));

        this.arrows.forEach(arrow => this.add(arrow));
    }
}

class Capacitor extends Group {
    constructor() {
        super();
        this.charges = [];

        const topY = 10e-14;
        const bottomY = -10e-14;

        for (let x = -20; x <= 20; x += 2)
            for (let z = -20; z <= 20; z += 2)
                for (let y of [topY, bottomY]) {
                    const sign = y > 0 ? 1 : -1;
                    const charge = new Sphere({
                        position: new Vector3(x / scaleFactor, y, z / scaleFactor),
                        radius: 1e-14,
                        charge: sign * EC,
                        color: sign > 0 ? 0x4444ff : 0xff0000,
                        scale: 1e14
                    });

                    this.charges.push(charge);
                    this.add(charge);
                }

        this.field = new Field(this.charges);
        this.add(this.field);
    }

    fieldAt(position) {
        return this.field.fieldAt(position);
    }

    showField() {
        this.field.show(
            new Range(-18, 18, 8),
            new Range(-9, 9, 4),
            new Range(-18, 18, 8)
        );
    }
}

const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.copy(new Vector3(-50, 0, 75).multiplyScalar(0.5));

const controls = new OrbitControls(camera, canvas);
const renderer = new WebGLRenderer({antialias: true, alpha: true, canvas: canvas});
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

const dirLight = new PointLight(0xffffff, 2e3);
dirLight.position.set(0, 0, 0);
scene.add(dirLight);
scene.add(new AmbientLight(0xffffff, 0.8));

const movingCharge = new Sphere({
    position: new Vector3(-30, 4, 0).divideScalar(scaleFactor),
    velocity: new Vector3(15, 0, 0).divideScalar(scaleFactor),
    mass: 1.6e-27,
    charge: 5e-42 * EC,
    radius: 1.2e-14,
    scale: scaleFactor,
    color: 0x44ff44,
    trailProperties: new TrailProperties({ makeTrail: true })
});

const capacitor = new Capacitor();
scene.add(movingCharge, capacitor);
capacitor.showField();

const dt = 0.01;
renderer.setAnimationLoop( () => {
    controls.update();
    renderer.render(scene, camera);

    if (movingCharge.physicsPosition.x > 60 / scaleFactor || !running)
        return;

    for (let substep = 0; substep < 3; substep++) {
        const field = capacitor.fieldAt(movingCharge.physicsPosition);
        const force = field.clone().multiplyScalar(movingCharge.charge);
        movingCharge.step(force, dt);
    }
});

function reset() {
    movingCharge.reset();
    movingCharge.velocity = new Vector3(parseFloat(speedSlider.value) / scaleFactor, 0, 0);
    movingCharge.charge = parseFloat(chargeSlider.value) * 5e-42 * EC;
}

canvas.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        reset();
        running = true;
    } else {
        ThreeJsUtils.showOverlayMessage(overlay, "Reset");
        reset();
        running = false;
    }
});

speedSlider.addEventListener("input", e => {
    movingCharge.velocity = new Vector3(parseFloat(e.target.value) / scaleFactor, 0, 0);
    speedSliderValue.innerText = speedSlider.value + " x 1E-14 m/s";
});

chargeSlider.addEventListener("input", e => {
    movingCharge.charge = parseFloat(e.target.value) * 5e-42 * EC;
    chargeSliderValue.innerText = chargeSlider.value + " electron charge(s)";
});