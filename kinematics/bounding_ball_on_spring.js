import { Vector3 } from "three";
import {Helix, Spring, ThreeSim, Body, Sphere, Floor, Ceiling} from "../js/threesim.js";

const canvas = document.getElementById("ballSpringCanvas");
const overlay = document.getElementById("ballSpringOverlayText");

//
// Physics
//
const spring = new Spring({
    position: new Vector3(0, 0, 0),
    direction: new Vector3(0, 0.6, 0),
    k: 450
});

const ball = new Body({
    position: new Vector3(0, 2.5, 0),
    mass: 1.5
});

const gravitationalForce = new Vector3(0, -9.8 * ball.mass, 0);
const ballHitsSpring = () => ball.distanceTo(spring) < spring.restLength;

function timeStep(dt) {
    const totalForce = gravitationalForce.clone().add(spring.force);
    ball.apply(totalForce, dt);
    if (ballHitsSpring() || spring.isCompressed)
        spring.axis = ball.position.clone();
}

//
// Simulation
//
const simulation = new ThreeSim({
    canvas,
    overlay,
    cameraPosition: new Vector3(4, 2, 4)
});

simulation.attach(spring.to(new Helix({
    coils: 15,
    color: "yellow"
})));

simulation.attach(ball.to(new Sphere({
    radius: 0.15,
    color: "red"
})));

simulation.addThreeJsObject(new Floor({repeat: false}))

const dt = 1e-3;
simulation.run(() => {
    for (let subStep = 0; subStep < 20; subStep++)
        timeStep(dt);
});


