import { Vector3, Color } from "three";
import { ThreeSim, VectorField, ArrowField, Sphere, Particle, Range, EC, Trail } from "../js/threesim.js";

const canvas = document.getElementById("protonInFieldCanvas");
const overlay = document.getElementById("protonInFieldOverlayText");
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

    sampleAt(position) {
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
    const fieldVector = magneticField.sampleAt(proton.position);
    const force = fieldVector.cross(proton.velocity).multiplyScalar(proton.charge);
    proton.apply(force, dt);
}

//
// Simulation
//
const simulation = new ThreeSim({
    canvas,
    overlay,
    cameraPosition: new Vector3(0, 5, -10)
});

const sphere = new Sphere({ color: new Color("red")});
simulation.attach(proton.to(sphere));
simulation.attach(proton.to(new Trail({ maxPoints: 300, color: sphere.color })));

const arrowField = new ArrowField({
    xRange: new Range(-6, 6, .5),
    yRange: new Range(0, 0, .5),
    zRange: new Range(-6, 6, .5),
    scaleFactor: .9,
    round: false
});
simulation.attachStatically(magneticField.to(arrowField));

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
