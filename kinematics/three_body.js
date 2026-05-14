import {Simulation, Sphere, Integrators, RadialSymmetricBody, G, gravitationalForceBetween, Trail,
    ThreeJsRenderer, Canvas, Overlay, ThreeJsRenderOptions
} from "../js/simulation.js";
import { Vector3 } from "three";

//
// Physics
//
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

function make(subSteps, dt) {
    const force_BA = gravitationalForceBetween(bodyA.and(bodyB));
    const force_CB = gravitationalForceBetween(bodyB.and(bodyC));
    const force_AC = gravitationalForceBetween(bodyC.and(bodyA));

    bodyA.apply(force_BA.clone().sub(force_AC), dt / subSteps, Integrators.symplecticEulerStep);
    bodyB.apply(force_CB.clone().sub(force_BA), dt / subSteps, Integrators.symplecticEulerStep);
    bodyC.apply(force_AC.clone().sub(force_CB), dt / subSteps, Integrators.symplecticEulerStep);
}

//
// Simulation
//
const canvas = new Canvas("threeBodyCanvas");
const overlay = new Overlay("overlayText");
const threeJsRendererOptions = new ThreeJsRenderOptions({
    cameraPosition: new Vector3(30, 30, 30)
});
const renderer = ThreeJsRenderer.on(canvas.with(overlay)).and(threeJsRendererOptions);
const simulation = Simulation.on(canvas.with(overlay)).and(renderer);
simulation.scale = 1e-9;

simulation.add(bodyA.to(new Sphere({ color: "yellow" })));
simulation.add(bodyA.to(new Trail({ maxPoints: 500, color: "yellow" })));
simulation.add(bodyB.to(new Sphere({ color: "cyan" })));
simulation.add(bodyB.to(new Trail({ maxPoints: 500, color: "cyan" })));
simulation.add(bodyC.to(new Sphere({ color: "magenta" })));
simulation.add(bodyC.to(new Trail({ maxPoints: 500, color: "magenta"})));

const dt = 5000;
const subSteps = 50;
simulation.run(() => {
    for (let i = 0; i < subSteps; i++)
        make(subSteps, dt);
});