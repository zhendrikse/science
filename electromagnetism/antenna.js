import { Vector3, Color } from "three";
import {AxialSymmetricBody, ThreeSim, Arrow, Cylinder, VectorFieldVector} from "../js/threesim.js";

const canvas = document.getElementById("antennaCanvas");
const fieldStrengthSlider = document.getElementById("antennaFieldStrengthSlider");
const fieldStrengthSliderValue = document.getElementById("antennaFieldStrengthSliderValue");
const decreaseButton = document.getElementById("decreaseButton");

const lambda = 2.0;  // 1e-10
const k = 2 * Math.PI / lambda;
const c = 3e8;
const omega = 2 * Math.PI * c / lambda;
const i_hat = new Vector3(1, 0, 0);

const ds = lambda / 10.0;
const dt = lambda / c / 100.0;
const distanceToScreen = 4.0 * lambda;

const d = 2 * lambda;
const slit = new Vector3(0, 0, -d / 2);

class ElectromagneticWave {
    constructor(E0) {
        this._E0 = E0;
        this._electricField = [];
        this._magneticField = [];

        const range = [];
        const R = distanceToScreen;
        for (let theta = 0; theta < 2 * Math.PI; theta += Math.PI / 3)
            range.push(new Vector3(R * Math.cos(theta), 0, R * Math.sin(theta)));

        for (let position of range)
            this._createEmWaveAt(position);

        this._tempPosition = new Vector3();
        this._tempAxis = new Vector3();
    }

    _createEmWaveAt(position) {
        const dr1 = position.normalize().multiplyScalar(ds);
        const rr1 = slit.clone().add(dr1.clone().multiplyScalar(10)); //vector(0,0,0) ## current loc along wave 1
        for (let ct = 0; ct < 120; ct++) {
            const y = this._plainWave(this._E0, k, rr1.clone().sub(slit).length(), omega, 0);
            const axis = new Vector3(0, y, 0);
            this._magneticField.push(new VectorFieldVector({position: rr1, axis: axis }));
            this._electricField.push(new VectorFieldVector({position: rr1, axis: new Vector3()}));
            rr1.add(dr1);
        }
    }

    _plainWave(amplitude, k, x, omega, t) {
        return amplitude * Math.cos(k * x - omega * t);
    }

    update(t) {
        for (let index = 0; index < this._electricField.length; index++) {
            const fieldArrow = this._electricField[index];
            const scaling = decreaseButton.checked ? 1 / (fieldArrow.position.length() + lambda / 10) : 0.25;
            const amplitude = this._E0 * scaling;
            const x = this._tempPosition.copy(fieldArrow.position).sub(slit).length();
            fieldArrow.axis.y = this._plainWave(amplitude, k, x, omega, t);
            this._magneticField[index].axis.copy(this._tempAxis.copy(fieldArrow.axis).cross(i_hat));
        }
    }

    set magnitude(strength) { this._E0 = strength; }
    get electricField() { return this._electricField; }
    get magneticField() { return this._magneticField; }
}

const emWave = new ElectromagneticWave(Number(fieldStrengthSlider.value));

const simulation = new ThreeSim({
    canvas,
    cameraPosition: new Vector3(-1, 4, -9).multiplyScalar(1.4),
});

for (let fieldVector of emWave.electricField)
    simulation.attachStatically(fieldVector.to(new Arrow({
        color: new Color("orange"),
        size: .5,
        round: true
    })));

for (let fieldVector of emWave.magneticField)
    simulation.attachStatically(fieldVector.to(new Arrow({
        color: new Color("cyan"),
        size: .5,
        round: true
    })));

const antenna = new AxialSymmetricBody({
    position: new Vector3(0, -lambda, 0),
    axis: new Vector3(0, 2 * lambda, 0),
    radius: 0.5
});
simulation.attachStatically(antenna.to(new Cylinder({color: new Color(0.7, 0.7, 0.7)})));

fieldStrengthSlider.addEventListener("input", () => {
    emWave.magnitude = Number(fieldStrengthSlider.value);
    fieldStrengthSliderValue.textContent = fieldStrengthSlider.value;
});

let time = 0;
simulation.run(() => {
    emWave.update(time);
    time += dt;
});