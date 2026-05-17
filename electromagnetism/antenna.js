import { Vector3, Color } from "three";
import { AxialSymmetricBody, OneDimensionalPlaneWave } from "../js/phys/physics.js";
import {Simulation, Canvas, HtmlDiv, EventController, HtmlControl} from "../js/simulation.js";
import { Cylinder, ElectromagneticWave, ThreeJsRenderOptions, ThreeJsRenderer } from "../js/renderers/three/threesim.js";

//
// Physics model
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
        amplitude: 7.5
    }));

//
// View
//
const threeJsRendererOptions = new ThreeJsRenderOptions({
    cameraPosition: new Vector3(-1, 4, -9).multiplyScalar(2.5),
    fieldOfView: 25
});
const renderer = ThreeJsRenderer
    .on(HtmlDiv.withElementId("antennaCanvasWrapper").contains(Canvas.withElementId("antennaCanvas")))
    .with(threeJsRendererOptions);

const slit = new Vector3(0, 0, lambda)
for (let wave of planeWaves)
    renderer.add(wave.to(new ElectromagneticWave({
        numArrows: 120,
        arrowSize: 0.5,
        scalingFunction: position => 1 / (position.clone().sub(slit).length() + lambda / 10)
    })));

const antenna = new AxialSymmetricBody({
    position: new Vector3(0, -lambda, 0),
    axis: new Vector3(0, 2 * lambda, 0),
    radius: 0.5
});
renderer.asyncAdd(antenna.to(new Cylinder({color: new Color(0.7, 0.7, 0.7)})));

//
// Event controller
//
const eventController = new EventController();
for (let wave of planeWaves)
    eventController.attach(HtmlControl
        .withElementId("antennaFieldStrengthSlider")
        .forType("input")
        .withValueSpanId("antennaFieldStrengthSliderValue")
        .to(wave)
        .withProperty("amplitude"));

Simulation
    .with(renderer)
    .incrementsTimeBy(lambda / OneDimensionalPlaneWave.c / 100.0)
    .onScale(1)
    .run((realTime, simulatedTime) => {
        for (let wave of planeWaves)
            wave.propagate(simulatedTime);
    }, 2)
    .start();
