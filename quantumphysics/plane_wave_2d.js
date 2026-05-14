// const pauseButton = document.getElementById("pauseButton");
// const momentumSlider = document.getElementById("momentumSlider");
// const realImag = document.getElementById("realImag");

import { Vector3 } from "three";
import {Simulation, Canvas, CompositeRenderer} from "../js/simulation.js";
import { Canvas2DRenderer, OneDimensionalComplexPlaneWave2D } from "../js/renderers/canvas2d/canvassim.js";
import {OneDimensionalComplexPlaneWave} from "../js/phys/physics.js";
import {OneDimensionalComplexPlaneWave3D, ThreeJsRenderer, ThreeJsRenderOptions } from "../js/renderers/three/threesim.js";

//
// Physics: definition of plane wave
//
const planeWave = new OneDimensionalComplexPlaneWave({
    amplitude: 5,
    omega: -3 * Math.PI,
    lambda: 5
});

//
// Simulation and rendering
//

// Renderer for 2D canvas
const canvas2d = new Canvas("planeWaveCanvas2d");
const renderer2d = Canvas2DRenderer.on(canvas2d);
const waveView2d = new OneDimensionalComplexPlaneWave2D({
    scaleY: 10,
    width: canvas2d.clientWidth,
    height: canvas2d.clientHeight
});
renderer2d.add(planeWave.to(waveView2d));

// Renderer for 3D canvas
const canvas3d = new Canvas("planeWaveCanvas3d");
const threeJsRendererOptions = new ThreeJsRenderOptions({
    cameraPosition: new Vector3(0, 0, 50)
});
const renderer3d = ThreeJsRenderer.on(canvas3d).and(threeJsRendererOptions);
renderer3d.add(planeWave.to(new OneDimensionalComplexPlaneWave3D({size: .8, numArrows: 100})));

// Composite renderer and simulation
const renderer = new CompositeRenderer([renderer2d, renderer3d]);
const simulation = Simulation.on(canvas2d).with(renderer);

// Toggle mode
document.getElementById("realImag").addEventListener("click", () =>
    waveView2d.mode = OneDimensionalComplexPlaneWave2D.Mode.REAL_IMAG
);
document.getElementById("densityPhase").addEventListener("click", () =>
    waveView2d.mode = OneDimensionalComplexPlaneWave2D.Mode.DENSITY_PHASE
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


