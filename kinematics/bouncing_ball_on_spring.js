import { Vector3, Color } from "three";
import {Helix, Spring, ThreeSim, Ball, Sphere, Floor, Arrow, PlainVector} from "../js/threesim.js";

const canvas = document.getElementById("ballSpringCanvas");
const overlay = document.getElementById("ballSpringOverlayText");
const velocityArrowButton = document.getElementById("velocityArrow");
const forceArrowButton = document.getElementById("forceArrow");
//
// Physics
//
const floor = new Floor({
    position: new Vector3(0, -1, 0),
    type: Floor.Type.PAVING,
});
const spring = new Spring({
    position: new Vector3(0, floor.level, 0),
    axis: new Vector3(0, 0.75, 0),
    k: 225
});
const springTopAtRest = spring.endPosition;

const ball = new Ball({
    position: new Vector3(0, 1.5, 0),
    radius: 0.15,
    mass: 1.5
});

const ballHitsSpring = (epsilon=1e-2) => springTopAtRest.clone().sub(ball.position).length() < epsilon;
const gravitationalForce = new Vector3(0, -9.8 * ball.mass, 0);
const totalForce = new PlainVector();

function timeStep(dt) {
    const netForce = gravitationalForce.clone().add(spring.force);
    ball.apply(netForce, dt);
    totalForce.position = ball.position;
    totalForce.direction = ball.acceleration;
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

const sphere = new Sphere({ color: "orange" });
const velocityArrow = new Arrow({ color: "cyan", size: .1 });
const forceArrow = new Arrow({ color: "red", size: .03 });
simulation.attach(ball.to(sphere));
simulation.attach(ball.to(velocityArrow));
simulation.attach(spring.to(helix));
simulation.addThreeJsObject(floor);
simulation.attach(totalForce.to(forceArrow));

velocityArrowButton.addEventListener("click", () => velocityArrow.visible = velocityArrowButton.checked);
forceArrowButton.addEventListener("click", () => forceArrow.visible = forceArrowButton.checked);

const dt = 1e-3;
simulation.run(() => {
    for (let subStep = 0; subStep < 10; subStep++)
        timeStep(dt);
});
