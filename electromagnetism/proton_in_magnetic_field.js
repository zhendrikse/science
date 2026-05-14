import { Vector3, Color } from "three";
import { Particle } from "../js/phys/physics.js";
import { VectorField, Range } from "../js/math/math.js";
import { Simulation, Canvas, Overlay } from "../js/simulation.js";
import { Sphere, ArrowField, ThreeJsRenderOptions, ThreeJsRenderer, Trail } from "../js/renderers/three/threesim.js";

const speedSlider = document.getElementById("protonInFieldSpeedSlider");
const strengthSlider = document.getElementById("protonInFieldStrengthSlider");
const speedSliderReadout = document.getElementById("protonInFieldSpeedSliderValue");
const strengthSliderReadout = document.getElementById("protonInFieldStrengthSliderValue");

class MagneticField extends VectorField {
    constructor(fieldStrength) {
        super();
        this._strength = fieldStrength;
    }
    
    set magnitude(newValue) { this._strength = newValue; }

    vectorAt(position) {
        const yComponent = Math.sqrt(position.x * position.x + position.z * position.z);
        // b_z = 5 if (abs(abs(position.x)-1) < 0.2 and abs(abs(position.y)-1) < 0.2) else 0
        return new Vector3(0, yComponent, 0).multiplyScalar(this._strength);
    }
}

//
// Physics
//
const proton = new Particle({
    position: new Vector3(0, 1, 0),
    velocity: new Vector3(Number(speedSlider.value) * .01, 0, 0),
    mass: 1,
    radius: .125,
    charge: 1
});

const magneticField = new MagneticField(Number(strengthSlider.value) * .1);

function timeStep(dt) {
    const fieldVector = magneticField.vectorAt(proton.position);
    const force = fieldVector.cross(proton.velocity).multiplyScalar(proton.charge);
    proton.apply(force, dt);
}

//
// Simulation
//
const canvas = new Canvas("protonInFieldCanvas");
const overlay = new Overlay("protonInFieldOverlayText");
const threeJsRendererOptions = new ThreeJsRenderOptions({
    cameraPosition: new Vector3(0, 5, -10)
});
const renderer = ThreeJsRenderer.on(canvas.with(overlay)).and(threeJsRendererOptions);
const simulation = Simulation.on(canvas.with(overlay)).with(renderer);

const sphere = new Sphere({ color: new Color("red")});
renderer.add(proton.to(sphere));
renderer.add(proton.to(new Trail({ maxPoints: 300, color: sphere.color })));

const arrowField = new ArrowField({
    xRange: new Range(-6, 6, .5),
    yRange: new Range(0, 0, .5),
    zRange: new Range(-6, 6, .5),
    scaleFactor: .9,
    round: false
});
renderer.add(magneticField.to(arrowField));

//
// Event listeners
//
speedSlider.addEventListener("input", () => {
    proton.velocity.x = Number(speedSlider.value) * .01;
    speedSliderReadout.textContent = speedSlider.value;
});

strengthSlider.addEventListener("input", () => {
    magneticField.magnitude = Number(strengthSlider.value) * .1;
    strengthSliderReadout.textContent = strengthSlider.value;
});

simulation.onReset = () => proton.velocity.x = Number(speedSlider.value) * .01;

const dt = 2.5e-3;
const subSteps = 100;
simulation.run(() => {
    for (let i = 0; i < subSteps; i++)
        timeStep(dt);
});
