import { Vector3, Color } from "three";
import { Simulation, AxialSymmetricBody, VectorField, Cylinder,
    ArrowField, Range, Canvas, ThreeJsRenderOptions, ThreeJsRenderer
} from "../js/simulation.js";

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
        const points = Array.from({ length: totalSegments }, (_, i) =>
            new Vector3(
                L / 2 - i * L / totalSegments,
                radius * Math.cos(2 * Math.PI / totalSegments * turns * i),
                radius * Math.sin(2 * Math.PI / totalSegments * turns * i)
            ));

        const segments = [];
        for (let i = 0; i < totalSegments - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const position = p1.clone().add(p2).multiplyScalar(0.5);
            const axis = direct ? p2.clone().sub(p1) : p1.clone().sub(p2);
            segments.push(new AxialSymmetricBody({position, axis, radius: 0.5 }));
        }

        return segments;
    }

    _contributionFrom(segment, position) {
        const r = position.clone().sub(segment.position);
        const r2 = r.lengthSq();

        return (r2 < 1e-6) ? new Vector3() : segment.axis.clone()
            .cross(r.clone().normalize())
            .multiplyScalar(
                MU0 * CURRENT /
                (4 * Math.PI) *
                segment.axis.length() / r2
            );
    }

    fieldAt(position) {
        const field = new Vector3();

        for (const segment of this._segments)
            field.add(this._contributionFrom(segment, position));

        return field;
    }

    get segments() { return this._segments; }
}

class SolenoidField extends VectorField {
    constructor(solenoid) {
        super();
        this._solenoid = solenoid;
        this._fieldStrength = 1;
    }

    vectorAt(position) {
        return this._solenoid.fieldAt(position).multiplyScalar(this._fieldStrength);
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
magneticField.fieldStrength = Number(fieldStrengthSlider.value);

//
// Simulation
//
const canvas = new Canvas("solenoidCanvas");
const threeJsRendererOptions = new ThreeJsRenderOptions({
    cameraPosition: new Vector3(32, 16, 48).multiplyScalar(1.25),
    fieldOfView: 45
});
const renderer = ThreeJsRenderer.on(canvas).and(threeJsRendererOptions);
const simulation = Simulation.on(canvas).and(renderer);

for (const segment of solenoid.segments)
    simulation.add(segment.to(new Cylinder({ color: new Color("yellow") })));

simulation.add(magneticField.to(new ArrowField({
    xRange: new Range(-20, 20, 4),
    yRange: new Range(-20, 20, 4),
    zRange: new Range(-20, 20, 4),
    scaleFactor:  1.25
})));

fieldStrengthSlider.addEventListener("input", () =>
    magneticField.fieldStrength = Number(fieldStrengthSlider.value));

autoRotateCheckbox.addEventListener("input", () => renderer.autoRotate = autoRotateCheckbox.checked);

renderer.autoRotate = autoRotateCheckbox.checked;
simulation.run(() => {});