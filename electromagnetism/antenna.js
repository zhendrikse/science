import { Vector3, Color } from "three";
import { AxialSymmetricBody, Simulation, Cylinder, OneDimensionalPlaneWave, ElectromagneticWave } from "../js/simulation.js";

const canvas = document.getElementById("antennaCanvas");
const fieldStrengthSlider = document.getElementById("antennaFieldStrengthSlider");
const fieldStrengthSliderValue = document.getElementById("antennaFieldStrengthSliderValue");

//
// Physics
//
const lambda = 2.0;  // 1e-10

const range = [];
for (let theta = 0; theta < 2 * Math.PI; theta += Math.PI / 3)
    range.push(new Vector3(Math.cos(theta), 0, Math.sin(theta)).multiplyScalar(lambda));

const planeWaves = [];
for (let position of range)
    planeWaves.push(new OneDimensionalPlaneWave({
        position,
        lambda,
        amplitude: Number(fieldStrengthSlider.value)
    }));

//
// Simulation
//
const simulation = new Simulation({ canvas, cameraPosition: new Vector3(-1, 4, -9) });

const slit = new Vector3(0, 0, lambda)
for (let wave of planeWaves)
    simulation.attach(wave.to(new ElectromagneticWave({
        numArrows: 120,
        arrowSize: 0.5,
        scalingFunction: position => 1 / (position.clone().sub(slit).length() + lambda / 10)
    })));

const antenna = new AxialSymmetricBody({
    position: new Vector3(0, -lambda, 0),
    axis: new Vector3(0, 2 * lambda, 0),
    radius: 0.5
});
simulation.attachStatically(antenna.to(new Cylinder({color: new Color(0.7, 0.7, 0.7)})));

//
// Even listeners
//
fieldStrengthSlider.addEventListener("input", () => {
    for (let wave of planeWaves)
        wave.amplitude = Number(fieldStrengthSlider.value);
    fieldStrengthSliderValue.textContent = fieldStrengthSlider.value;
});

let time = 0;
const dt = lambda / OneDimensionalPlaneWave.c / 100.0;
simulation.run(() => {
    for (let substeps = 0; substeps < 2; substeps++) {
        for (let wave of planeWaves)
            wave.propagate(time);
        time += dt;
    }
});