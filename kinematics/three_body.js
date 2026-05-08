import {ThreeSim, Sphere, TrailProperties, Integrators, Body, G} from "../js/threesim.js";
import { Vector3 } from "three";

const canvas = document.getElementById("threeBodyCanvas");
const overlay = document.getElementById("overlayText");
const scale = 1e-9;

const astronomical_unit = 1.49e11;
const mass = 1e30;

const radiusA = 0.1 * astronomical_unit;
const radiusB = radiusA / 0.8;
const velocityA = Math.sqrt(G * 0.8 * mass * radiusA) / (radiusA + radiusB);

const bodyA = new Body({
    position: new Vector3(radiusA, 0, 0),
    velocity: new Vector3(0, velocityA, 0),
    mass
});

const bodyB = new Body({
    position: new Vector3(-radiusB, 0, 0),
    velocity: new Vector3(0, -velocityA / 0.8, 0),
    mass: mass * 0.8
});

const bodyC = new Body({
    position: new Vector3(0, 0, radiusA),
    velocity: new Vector3(0, 0, 0),
    mass: mass * 0.5
});

const trailProperties = new TrailProperties({ maxPoints: 500 })
const sphereRadius = 1.9e9;
const sphereA = new Sphere({
    body: bodyA,
    radius: sphereRadius,
    color: "yellow",
    trailProperties
});

const sphereB = new Sphere({
    body: bodyB,
    radius: sphereRadius,
    color: "cyan",
    trailProperties
});

const sphereC = new Sphere({
    body: bodyC,
    radius: sphereRadius,
    color: "magenta",
    trailProperties
});

function iterate(subSteps, dt) {
    const force_BA = Body.gravitationalForceBetween(bodyA, bodyB);
    const force_CB = Body.gravitationalForceBetween(bodyB, bodyC);
    const force_AC = Body.gravitationalForceBetween(bodyC, bodyA);

    bodyA.step(force_BA.clone().sub(force_AC), dt / subSteps, Integrators.symplecticEulerStep);
    bodyB.step(force_CB.clone().sub(force_BA), dt / subSteps, Integrators.symplecticEulerStep);
    bodyC.step(force_AC.clone().sub(force_CB), dt / subSteps, Integrators.symplecticEulerStep);
}

const simulation = new ThreeSim({ canvas, overlay, scale });
simulation.add(sphereA, sphereB, sphereC);

const dt = 5000;
const subSteps = 50;
simulation.run(() => {
    for (let i = 0; i < subSteps; i++)
        iterate(subSteps, dt);
});