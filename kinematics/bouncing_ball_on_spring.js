import { Vector3, Color } from "three";
import {Helix, Spring, ThreeSim, Ball, Sphere, Floor, Arrow } from "../js/threesim.js";

const canvas = document.getElementById("ballSpringCanvas");
const overlay = document.getElementById("overlayText");

//
// Physics
//
const floor = new Floor({
    position: new Vector3(0, -1, 0),
    type: Floor.Type.PAVING,
});
const spring = new Spring({
    position: new Vector3(0, floor.level, 0),
    axis: new Vector3(0, 0.6, 0),
    k: 450
});
const springTopAtRest = spring.endPosition;

const ball = new Ball({
    position: new Vector3(0, 1.5, 0),
    radius: 0.15,
    mass: 1.5
});

const ballHitsSpring = (epsilon=1e-2) => springTopAtRest.clone().sub(ball.position).length() < epsilon;
const gravitationalForce = new Vector3(0, -9.8 * ball.mass, 0);

function timeStep(dt) {
    const totalForce = gravitationalForce.clone().add(spring.force);
    ball.apply(totalForce, dt);
    if (ballHitsSpring() || spring.isCompressed)
        spring.axis = spring.positionVectorTo(ball);
}

//
// Simulation
//
const simulation = new ThreeSim({
    canvas,
    overlay,
    cameraPosition: new Vector3(1, 0.4, 2).multiplyScalar(1.7),
});

const helix = new Helix({
    coils: 15,
    color: "yellow"
});

const sphere = new Sphere({ color: "red" });
const arrow = new Arrow({ Color: "red", size: .1 });
simulation.attach(ball.to(sphere));
simulation.attach(ball.to(arrow));
simulation.attach(spring.to(helix));
simulation.addThreeJsObject(floor);

const dt = 1e-3;
simulation.run(() => {
    for (let subStep = 0; subStep < 15; subStep++)
        timeStep(dt);
});
