// import {toColorString} from "./2d-quantum-extensions.js";
//
// const theCanvas = document.getElementById("theCanvas");
// const theContext = theCanvas.getContext("2d");
// const pauseButton = document.getElementById("pauseButton");
// const momentumSlider = document.getElementById("momentumSlider");
// const realImag = document.getElementById("realImag");

import { Simulation, Canvas } from "../js/simulation.js";
import { Canvas2DRenderer, OneDimensionalComplexPlaneWave2D } from "../js/renderers/canvas2d/canvassim.js";
import {OneDimensionalComplexPlaneWave} from "../js/phys/physics.js";

const planeWave = new OneDimensionalComplexPlaneWave({
    amplitude: 5,
    omega: -3 * Math.PI,
    lambda: 5
});

const canvas = new Canvas("planeWaveCanvas");
const renderer = new Canvas2DRenderer({ canvas: canvas.canvas });
const simulation = Simulation.on(canvas).with(renderer);

const waveView = new OneDimensionalComplexPlaneWave2D({
    scaleY: 10,
    width: canvas.clientWidth,
    height: canvas.clientHeight
});
waveView.attachTo(planeWave);
renderer.add(waveView, true);

// Toggle mode
document.getElementById("realImag").addEventListener("click", () =>
    waveView.mode = OneDimensionalComplexPlaneWave2D.Mode.REAL_IMAG
);
document.getElementById("densityPhase").addEventListener("click", () =>
    waveView.mode = OneDimensionalComplexPlaneWave2D.Mode.DENSITY_PHASE
);

let time = 0;
const dt = 0.01;

simulation.run(() => {
    planeWave.propagate(time);
    time += dt;
});

// document.getElementById("pauseButton").addEventListener("click", () => {
//     running = !running;
//     pauseButton.innerHTML = running ? "Pause" : "Resume";
//     animate();
// });


