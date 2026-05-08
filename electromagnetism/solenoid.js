import { Vector3, Color } from "three";
import { ThreeSim, Arrow, VectorField, Cylinder, Body, LogarithmicVectorBody, to } from "../js/threesim.js";

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
            segments.push({
                position: p1.clone().add(p2).multiplyScalar(0.5),
                axis: direct ? p2.clone().sub(p1) : p1.clone().sub(p2)
            });
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

            const contribution = segment.axis.clone()
                .cross(r.clone().normalize())
                .multiplyScalar(
                    MU0 * CURRENT /
                    (4 * Math.PI) *
                    segment.axis.length() / r2
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

class SegmentBody extends Body {
    constructor(segment) {
        super({ position: segment.position});
        this._axis = segment.axis;
    }

    direction() { return this._axis; }
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
    cameraPosition: new Vector3(32, 16, 48),
    fieldOfView: 45
});

// Solenoid view
for (const segment of solenoid.segments)
    simulation.attach(new SegmentBody(segment), to(new Cylinder({
            radius: 0.4,
            color: new Color("yellow")
        })));

// Magnetic field view
for (let x = -20; x <= 20; x += 4)
    for (let y = -20; y <= 20; y += 4)
        for (let z = -20; z <= 20; z += 4)
            simulation.attach(new LogarithmicVectorBody(magneticField, new Vector3(x, y, z)), to(new Arrow({
                color: 0x00ffff,
                size: 1,
                round: false
            })));



fieldStrengthSlider.addEventListener("input", () =>
    magneticField.fieldStrength = Number(fieldStrengthSlider.value));

autoRotateCheckbox.addEventListener("input", () => simulation.autoRotate = autoRotateCheckbox.checked);

simulation.run(() => {});