import { Vector3, Color } from "three";
import { AxialSymmetricBody, ThreeSim, Cylinder, OneDimensionalPlainWave, ElectromagneticWave} from "../js/threesim.js";

const canvas = document.getElementById("antennaCanvas");
const fieldStrengthSlider = document.getElementById("antennaFieldStrengthSlider");
const fieldStrengthSliderValue = document.getElementById("antennaFieldStrengthSliderValue");

const lambda = 2.0;  // 1e-10

const range = [];
for (let theta = 0; theta < 2 * Math.PI; theta += Math.PI / 3)
    range.push(new Vector3(Math.cos(theta), 0, Math.sin(theta)).multiplyScalar(lambda));

const plainWaves = [];
for (let position of range)
    plainWaves.push(new OneDimensionalPlainWave({
        position,
        lambda,
        amplitude: Number(fieldStrengthSlider.value)
    }));

const simulation = new ThreeSim({ canvas, cameraPosition: new Vector3(-1, 4, -9), });

const slit = new Vector3(0, 0, lambda)
for (let wave of plainWaves)
    simulation.attachStatically(wave.to(new ElectromagneticWave({
        length: 120,
        arrowSize: 0.5,
        scalingFunction: position => 1 / (position.clone().sub(slit).length() + lambda / 10)
    })));

const antenna = new AxialSymmetricBody({
    position: new Vector3(0, -lambda, 0),
    axis: new Vector3(0, 2 * lambda, 0),
    radius: 0.5
});
simulation.attachStatically(antenna.to(new Cylinder({color: new Color(0.7, 0.7, 0.7)})));

fieldStrengthSlider.addEventListener("input", () => {
    for (let wave of plainWaves)
        wave.amplitude = Number(fieldStrengthSlider.value);
    fieldStrengthSliderValue.textContent = fieldStrengthSlider.value;
});

let time = 0;
const dt = lambda / OneDimensionalPlainWave.c / 100.0;
simulation.run(() => {
    for (let substeps = 0; substeps < 2; substeps++) {
        for (let wave of plainWaves)
            wave.update(time);
        time += dt;
    }
});