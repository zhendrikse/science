import { Vector3, Color } from "three";
import { ThreeSim, PlainVector, VectorField, Cylinder, Body, ArrowField, Range } from "../js/threesim.js";

const canvas = document.getElementById("solenoidCanvas");
const autoRotateCheckbox = document.getElementById("autoRotate");
const fieldStrengthSlider = document.getElementById("fieldStrength");

const MU0 = 4 * Math.PI * 1e-7;
const CURRENT = 1e8;
const L = 40;

class Solenoid {
    constructor({
        radius = 10,
        segments = 500,
        turns = 10,
        direct = true
    } = {}) {
        this._segments = this._createSegments(radius, segments, turns, direct);
    }

    _createSegments(radius, totalSegments, turns, direct) {
        const points = [];
        for (let i = 0; i < totalSegments; i++)
            points.push(new Vector3(
                L / 2 - i * L / totalSegments,
                radius * Math.cos(2 * Math.PI / totalSegments * turns * i),
                radius * Math.sin(2 * Math.PI / totalSegments * turns * i)
            ));

        const segments = [];
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const position = p1.clone().add(p2).multiplyScalar(0.5);
            const direction = direct ? p2.clone().sub(p1) : p1.clone().sub(p2);
            segments.push(new PlainVector({position, direction}));
        }

        return segments;
    }

    fieldAt(position) {
        const field = new Vector3();

        for (const segment of this._segments) {
            const r = position.clone().sub(segment.position);
            const r2 = r.lengthSq();

            if (r2 < 1e-6)
                continue;

            const contribution = segment.direction().clone()
                .cross(r.clone().normalize())
                .multiplyScalar(
                    MU0 * CURRENT /
                    (4 * Math.PI) *
                    segment.direction().length() / r2
                );

            field.add(contribution);
        }

        return field;
    }

    get segments() { return this._segments; }
}

class SolenoidField extends VectorField {
    constructor(solenoid) {
        super();
        this._solenoid = solenoid;
        this._fieldStrength = Number(fieldStrengthSlider.value);
    }

    sample(position) {
        return this._solenoid
            .fieldAt(position)
            .multiplyScalar(this._fieldStrength);
    }

    set fieldStrength(value) { this._fieldStrength = value; }
}

//
// Physics
//
const solenoid = new Solenoid({
    radius: 10,
    segments: 500,
    turns: 10
});
const magneticField = new SolenoidField(solenoid);

//
// Simulation
//
const simulation = new ThreeSim({
    canvas,
    cameraPosition: new Vector3(32, 16, 48).multiplyScalar(1.25),
    fieldOfView: 45
});

// Solenoid view
for (const segment of solenoid.segments)
    simulation.attach(segment.to(new Cylinder({
            radius: 0.4,
            color: new Color("yellow")
        })));

// Magnetic field view
const arrowField = new ArrowField({
    xRange: new Range(-20, 20, 4),
    yRange: new Range(-20, 20, 4),
    zRange: new Range(-20, 20, 4)
});
simulation.attach(magneticField.to(arrowField))

fieldStrengthSlider.addEventListener("input", () =>
    magneticField.fieldStrength = Number(fieldStrengthSlider.value));

autoRotateCheckbox.addEventListener("input", () => simulation.autoRotate = autoRotateCheckbox.checked);

simulation.autoRotate = autoRotateCheckbox.checked;
simulation.run(() => {});