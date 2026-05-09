import { Vector3 } from "three";
import {Helix, Spring, ThreeSim, Body, Sphere, Floor } from "../js/threesim.js";

const canvas = document.getElementById("ballSpringCanvas");
const overlay = document.getElementById("ballSpringOverlayText");

//
// Physics
//
const spring = new Spring({
    position: new Vector3(0, -1, 0),
    direction: new Vector3(0, 0.6, 0),
    k: 450
});
const springTopAtRest = spring.endPosition;

const ball = new Body({
    position: new Vector3(0, 1.5, 0),
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
    cameraPosition: new Vector3(4, 2, 4).multiplyScalar(0.7),
});

simulation.attach(spring.to(new Helix({
    coils: 15,
    color: "yellow"
})));

simulation.attach(ball.to(new Sphere({
    radius: 0.15,
    color: "red"
})));

simulation.addThreeJsObject(new Floor({positionY: -1}))

const dt = 1e-3;
simulation.run(() => {
    for (let subStep = 0; subStep < 20; subStep++)
        timeStep(dt);
});
