import { Vector3, Color, AmbientLight, PointLight } from "three";
import { Simulation, VectorField, ArrowField, Sphere, Particle, Range, EC, Trail } from "../js/simulation.js";

const canvas = document.getElementById("capacitorCanvas");
const speedSlider = document.getElementById("speedSlider");
const chargeSlider = document.getElementById("chargeSlider");
const speedSliderValue = document.getElementById("speedSliderValue");
const chargeSliderValue = document.getElementById("chargeSliderValue");
const overlay = document.getElementById("movingChargeOverlayText");

const K = 9e9;
const scale = 1e14;

class Capacitor {
    constructor(topY = 10e-14, bottomY = -10e-14) {
        this.charges = [];

        for (let x = -20; x <= 20; x += 2)
            for (let z = -20; z <= 20; z += 2)
                for (const y of [topY, bottomY])
                    this.charges.push(new Particle({
                        position: new Vector3(x / scale, y, z / scale),
                        radius: 1e-14,
                        charge: EC * (y > 0 ? 1 : -1)
                    }));
    }

    fieldAt(position, out=new Vector3()) {
        out.set(0, 0, 0);
        for (const charge of this.charges)
            out.add(charge.fieldAt(position).multiplyScalar(K));

        return out;
    }
}

class CapacitorField extends VectorField {
    constructor(capacitor) {
        super();
        this._capacitor = capacitor;
    }

    vectorAt(position) {
        return this._capacitor.fieldAt(position);
    }
}

//
// Physics objects
//
const capacitor = new Capacitor();
const capacitorField = new CapacitorField(capacitor);
const movingCharge = new Particle({
    position: new Vector3(-30, 4, 0).divideScalar(scale),
    velocity: new Vector3(Number(speedSlider.value), 0, 0).divideScalar(scale),
    mass: 1.6e-27,
    radius: 1.2e-14,
    charge: Number(chargeSlider.value) * 5e-42 * EC
});

//
// Simulation
//
const simulation = new Simulation({
    canvas,
    overlay,
    scale,
    light: false,
    cameraPosition: new Vector3(-50, 0, 75).multiplyScalar(0.5),
    fieldOfView: 60
});

const dirLight = new PointLight(0xffffff, 2e3);
dirLight.position.set(0, 0, 0);
simulation.addThreeJsObject(dirLight);
simulation.addThreeJsObject(new AmbientLight(0xffffff, 0.8));

for (const charge of capacitor.charges) {
    const sphere = new Sphere({
        color: charge.charge > 0 ? new Color(0x4444ff) : new Color(0xff0000)
    });
    simulation.attachStatically(charge.to(sphere)); // Important: attach statically to prevent unnecessary updates!
}

const sphere = new Sphere({ color: new Color(0x44ff44)});
simulation.attach(movingCharge.to(sphere));
simulation.attach(movingCharge.to(new Trail({ maxPoints: 400, color: sphere.color })));

const arrowField = new ArrowField({
    xRange: new Range(-18 / scale, 18 / scale, 8 / scale),
    yRange: new Range(-9 / scale, 9 / scale, 4 / scale),
    zRange: new Range(-18 / scale, 18 / scale, 8 / scale),
    scaleFactor: 8e-10,
    round: false,
    magnitudeMap: magnitude => Math.sqrt(magnitude),
    colorMap: magnitude => new Color(1, .25 * magnitude, 0)
});
simulation.attachStatically(capacitorField.to(arrowField));

//
// Event listeners
//
speedSlider.addEventListener("input", () => {
    movingCharge.velocity.copy(new Vector3(Number(speedSlider.value), 0, 0).divideScalar(scale));
    speedSliderValue.innerText = speedSlider.value + " x 1E-14 m/s";
});

chargeSlider.addEventListener("input", () => {
    movingCharge.charge = Number(chargeSlider.value) * 5e-42 * EC;
    chargeSliderValue.innerText = chargeSlider.value + " electron charge(s)";
});

const dt = 0.01;
const subSteps = 3;

simulation.run(() => {
    if (movingCharge.position.x > 60 / scale)
        return;

    for (let i = 0; i < subSteps; i++) {
        const field = capacitor.fieldAt(movingCharge.position)
        const force = field.multiplyScalar(movingCharge.charge);
        movingCharge.apply(force, dt);
    }
});
