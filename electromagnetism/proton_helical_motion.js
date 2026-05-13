import { Vector3, Color } from "three";
import { Simulation, VectorField, ArrowField, Sphere, Particle, Range, EC, Trail } from "../js/simulation.js";

const canvas = document.getElementById("helicalProtonCanvas");
const overlay = document.getElementById("helicalProtonOverlayText");
const speedSlider = document.getElementById("helicalProtonSpeedSlider");
const strengthSlider = document.getElementById("helicalProtonSpeedSliderValue");
const speedSliderReadout = document.getElementById("helicalProtonFieldStrengthSlider");
const strengthSliderReadout = document.getElementById("helicalProtonFieldStrengthSliderValue");

class MagneticField extends VectorField {
    constructor(fieldStrength) {
        super();
        this._strength = fieldStrength;
    }

    set magnitude(newValue) { this._strength = newValue; }

    vectorAt(position) { return new Vector3(0, -this._strength, 0); }
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
const simulation = new Simulation({
    canvas,
    overlay,
    cameraPosition: new Vector3(0, 8, -9)
});

const sphere = new Sphere({ color: new Color("red")});
simulation.attach(proton.to(sphere));
simulation.attach(proton.to(new Trail({ maxPoints: 300, color: sphere.color })));

const arrowField = new ArrowField({
    xRange: new Range(-6, 6, 1),
    yRange: new Range(-6, 6, 1),
    zRange: new Range(-6, 6, 1),
    scaleFactor: .9,
    round: false
});
simulation.attachStatically(magneticField.to(arrowField));

//
// Event listeners
//
// speedSlider.addEventListener("input", () => {
//     proton.velocity.x = Number(speedSlider.value) * .01;
//     speedSliderReadout.textContent = speedSlider.value;
// });
//
// strengthSlider.addEventListener("input", () => {
//     magneticField.magnitude = Number(strengthSlider.value) * .1;
//     strengthSliderReadout.textContent = strengthSlider.value;
// });
//
// simulation.onReset = () => proton.velocity.x = Number(speedSlider.value) * .01;

const dt = 0.01;
const subSteps = 25;
simulation.run(() => {
    for (let i = 0; i < subSteps; i++)
        timeStep(dt);
});
