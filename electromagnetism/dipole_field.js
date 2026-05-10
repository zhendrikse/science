import { Vector3, Color } from "three";
import { ThreeSim, VectorField, ArrowField, Sphere, Range, Particle } from "../js/threesim.js";

const canvas = document.getElementById("dipoleCanvas");
const autoRotateCheckbox = document.getElementById("autoRotate");
const fieldStrengthSlider = document.getElementById("fieldStrength");

const scale = 1e15;
const ec = 1.6e-19;

class Dipole {
    constructor(distance = 1.2e-14, charge = ec) {
        this.positive = new Particle({
            position: new Vector3(distance, 0, 0),
            radius: .1e-14,
            charge: +charge
        });
        this.negative = new Particle({
            position: new Vector3(-distance, 0, 0),
            radius: 1e-14 * 0.05,
            charge: -charge
        });
    }

    fieldAt(position) {
        return this.positive
            .fieldAt(position)
            .add(this.negative.fieldAt(position));
    }
}

class DipoleField extends VectorField {
    constructor(dipole) {
        super();

        this._dipole = dipole;
        this._fieldStrength = 1;
    }

    sample(position) {
        return this._dipole
            .fieldAt(position)
            .multiplyScalar(this._fieldStrength);
    }

    set fieldStrength(value) { this._fieldStrength = value; }
}

//
//  Physics objects
//
const dipole = new Dipole(1e-14);
const dipoleField = new DipoleField(dipole);
dipoleField.fieldStrength = Number(fieldStrengthSlider.value) * .5;

//
// Simulation
//
const simulation = new ThreeSim({
    canvas,
    scale,
    cameraPosition: new Vector3(32, 16, 48).multiplyScalar(0.75),
    fieldOfView: 40
});

const positiveSphere = new Sphere({ color: new Color("red") });
const negativeSphere = new Sphere({color: new Color("blue" )});
const arrowField = new ArrowField({
    xRange: new Range(-20 / scale, 20 / scale, 2 / scale),
    yRange: new Range(-12 / scale, 12 / scale, 2 / scale),
    zRange: new Range(-12 / scale, 12 / scale, 2 / scale),
    scaleFactor: 3e-5,
    round: false,
    magnitudeMap: magnitude => Math.sqrt(magnitude),
});

simulation.attach(dipole.positive.to(positiveSphere));
simulation.attach(dipole.negative.to(negativeSphere));
simulation.attach(dipoleField.to(arrowField));

//
// Event listeners
//
fieldStrengthSlider.addEventListener("input", () =>
    dipoleField.fieldStrength = Number(fieldStrengthSlider.value) * .5);

autoRotateCheckbox.addEventListener("input", () =>
    simulation.autoRotate = autoRotateCheckbox.checked);

simulation.autoRotate = autoRotateCheckbox.checked;
simulation.run(() => {});