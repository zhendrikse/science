import { Vector3 } from "three";
import {Simulation, Canvas, CompositeRenderer} from "../js/simulation.js";
import { Canvas2DRenderer, OneDimensionalComplexPlaneWave2D } from "../js/renderers/canvas2d/canvassim.js";
import {OneDimensionalComplexPlaneWave} from "../js/phys/physics.js";
import {OneDimensionalComplexPlaneWave3D, ThreeJsRenderer, ThreeJsRenderOptions } from "../js/renderers/three/threesim.js";

//
// Physics: definition of plane wave
//
const planeWave = new OneDimensionalComplexPlaneWave({
    position: new Vector3(-25, 0, 0),
    amplitude: 5,
    omega: -3 * Math.PI,
    lambda: 2 * Math.PI
});

//
// Renderer for 2D canvas
//
const canvas2d = new Canvas("planeWaveCanvas2d");
const renderer2d = Canvas2DRenderer.on(canvas2d);
const waveView2d = new OneDimensionalComplexPlaneWave2D({
    scaleY: 10,
    width: canvas2d.clientWidth,
    height: canvas2d.clientHeight
});
renderer2d.add(planeWave.to(waveView2d));

//
// Renderer for 3D canvas
//
const canvas3d = new Canvas("planeWaveCanvas3d");
const threeJsRendererOptions = new ThreeJsRenderOptions({
    cameraPosition: new Vector3(75, 75, 75),
    fieldOfView: 10
});
const renderer3d = ThreeJsRenderer.on(canvas3d).and(threeJsRendererOptions);
renderer3d.add(planeWave.to(new OneDimensionalComplexPlaneWave3D({size: .8, numArrows: 100})));

// Composite renderer and simulation
const renderer = new CompositeRenderer([renderer2d, renderer3d]);
const simulation = Simulation.on(canvas3d).with(renderer);

//
// Event listeners
//
document.getElementById("realImag").addEventListener("click", () =>
    waveView2d.mode = OneDimensionalComplexPlaneWave2D.Mode.REAL_IMAG
);
document.getElementById("densityPhase").addEventListener("click", () =>
    waveView2d.mode = OneDimensionalComplexPlaneWave2D.Mode.DENSITY_PHASE
);
document.getElementById("waveNumberSlider").addEventListener("input", function () {
     planeWave.k = (Number(this.value) - 50) / 100 * Math.PI;
});
document.getElementById("amplitudeSlider").addEventListener("input", function () {
    planeWave.amplitude = .5 + Number(this.value) * 7 / 100;
});
document.getElementById("omegaSlider").addEventListener("input", function () {
    planeWave.omega = Number(this.value) * 6 / 100 * Math.PI;
});

let time = 0;
const dt = 0.01;

simulation.run(() => {
    planeWave.propagate(time);
    time += dt;
});



