import {
    Vector3,
    Color
} from "three";

import {
    ThreeSim,
    VectorField,
    Sphere,
    Arrow,
    Body,
} from "../js/threesim.js";

const canvas = document.getElementById("dipoleCanvas");
const autoRotateCheckbox = document.getElementById("autoRotate");
const fieldStrengthSlider = document.getElementById("fieldStrength");

const scale = 1e15;
const ec = 1.6e-19;

//
// ─────────────────────────────
// Physics model (pure)
// ─────────────────────────────
//

class Dipole {
    constructor(distance = 1.2e-14, charge = ec) {
        this.positive = new ChargeBody(new Vector3(distance, 0, 0), +charge);
        this.negative = new ChargeBody(new Vector3(-distance, 0, 0), -charge);
    }

    fieldAt(p) {
        const f = new Vector3();
        f.add(this.positive.fieldAt(p));
        f.add(this.negative.fieldAt(p));
        return f;
    }
}

class ChargeBody {
    constructor(position, charge) {
        this.position = position.clone();
        this.charge = charge;
    }

    fieldAt(p) {
        const r = p.clone().sub(this.position);
        const r2 = r.lengthSq();

        if (r2 < 1e-30) return new Vector3();

        return r.normalize().multiplyScalar(this.charge / r2);
    }
}

//
// ─────────────────────────────
// Field wrapper (ThreeSim style)
// ─────────────────────────────
//

class DipoleField extends VectorField {
    constructor(dipole) {
        super();
        this._dipole = dipole;
        this._fieldStrength = Number(fieldStrengthSlider.value);
    }

    set fieldStrength(v) {
        this._fieldStrength = v;
    }

    sample(p) {
        return this._dipole
            .fieldAt(p.clone())
            .multiplyScalar(this._fieldStrength);
    }
}

//
// ─────────────────────────────
// Simulation setup (ThreeSim only)
// ─────────────────────────────
//

const simulation = new ThreeSim({
    canvas,
    cameraPosition: new Vector3(0, 0, 40),
    fieldOfView: 40,
    scale: 1e14
});

const dipole = new Dipole(1e-14);
const dipoleField = new DipoleField(dipole);

//
// ─────────────────────────────
// Visual bodies (physics ↔ view separation)
// ─────────────────────────────
//

// + charge
simulation.attach(
    new Body({ position: new Vector3(1e-14, 0, 0) }),
    to(new Sphere({
        radius: 1e-15 * 0.05 * scale,
        color: new Color("red")
    }))
);

// - charge
simulation.attach(
    new Body({ position: new Vector3(-1e-14, 0, 0) }),
    to(new Sphere({
        radius: 1e-15 * 0.05 * scale,
        color: new Color("blue")
    }))
);

//
// ─────────────────────────────
// Vector field (same pattern as solenoid)
// ─────────────────────────────
//

for (let x = -22 / scale; x <= 22 / scale; x += 2 / scale)
    for (let y = -12 / scale; y <= 12 / scale; y += 2 / scale)
        for (let z = -12 / scale; z <= 12 / scale; z += 2 / scale) {

            const position = new Vector3(x, y, z);

            simulation.attach(
                new Body({
                    position,
                    direction: () => dipoleField.sample(position)
                }),
                to(new Arrow({
                    color: 0x00ffff,
                    size: 1,
                    round: false
                }))
            );
        }

//
// ─────────────────────────────
// UI
// ─────────────────────────────
//

fieldStrengthSlider.addEventListener("input", () => {
    dipoleField.fieldStrength = Number(fieldStrengthSlider.value);
});

simulation.run(() => {
    if (autoRotateCheckbox.checked) {
        simulation.autoRotate = true;
    }
});