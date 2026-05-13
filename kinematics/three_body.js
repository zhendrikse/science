import { ThreeSim, Sphere, Integrators, RadialSymmetricBody, G, gravitationalForceBetween, Trail } from "../js/threesim.js";
import { Vector3 } from "three";

const canvas = document.getElementById("threeBodyCanvas");
const overlay = document.getElementById("overlayText");
const scale = 1e-9;

const astronomical_unit = 1.49e11;
const mass = 1e30;

const radiusA = 0.1 * astronomical_unit;
const radiusB = radiusA / 0.8;
const velocityA = Math.sqrt(G * 0.8 * mass * radiusA) / (radiusA + radiusB);

const radius = 1.9e9;
const bodyA = new RadialSymmetricBody({
    position: new Vector3(radiusA, 0, 0),
    velocity: new Vector3(0, velocityA, 0),
    radius,
    mass
});

const bodyB = new RadialSymmetricBody({
    position: new Vector3(-radiusB, 0, 0),
    velocity: new Vector3(0, -velocityA / 0.8, 0),
    radius,
    mass: mass * 0.8
});

const bodyC = new RadialSymmetricBody({
    position: new Vector3(0, 0, radiusA),
    velocity: new Vector3(0, 0, 0),
    radius,
    mass: mass * 0.5
});

const simulation = new ThreeSim({
    canvas, overlay, scale,
    cameraPosition: new Vector3(30, 30, 30),
});

simulation.attach(bodyA.to(new Sphere({ color: "yellow" })));
simulation.attach(bodyA.to(new Trail({ maxPoints: 500, color: "yellow" })));
simulation.attach(bodyB.to(new Sphere({ color: "cyan" })));
simulation.attach(bodyB.to(new Trail({ maxPoints: 500, color: "cyan" })));
simulation.attach(bodyC.to(new Sphere({ color: "magenta" })));
simulation.attach(bodyC.to(new Trail({ maxPoints: 500, color: "magenta"})));

function make(subSteps, dt) {
    const force_BA = gravitationalForceBetween(bodyA.and(bodyB));
    const force_CB = gravitationalForceBetween(bodyB.and(bodyC));
    const force_AC = gravitationalForceBetween(bodyC.and(bodyA));

    bodyA.apply(force_BA.clone().sub(force_AC), dt / subSteps, Integrators.symplecticEulerStep);
    bodyB.apply(force_CB.clone().sub(force_BA), dt / subSteps, Integrators.symplecticEulerStep);
    bodyC.apply(force_AC.clone().sub(force_CB), dt / subSteps, Integrators.symplecticEulerStep);
}

const dt = 5000;
const subSteps = 50;
simulation.run(() => {
    for (let i = 0; i < subSteps; i++)
        make(subSteps, dt);
});