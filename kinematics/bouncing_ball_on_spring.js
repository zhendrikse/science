import { Vector3 } from "three";
import {
    Helix,
    Spring,
    Simulation,
    RadialSymmetricBody,
    Sphere,
    Floor,
    Arrow,
    Canvas,
    Overlay, ThreeJsRenderOptions, ThreeJsRenderer
} from "../js/simulation.js";

const velocityArrowButton = document.getElementById("velocityArrow");
const forceArrowButton = document.getElementById("forceArrow");
const dampingSlider = document.getElementById("dampingSlider");

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
    radius: 0.125,
    k: 225
});
const springTopAtRest = spring.endPosition;

const ball = new RadialSymmetricBody({
    position: new Vector3(0, 1.5, 0),
    radius: 0.15,
    mass: 1.5
});

const ballHitsSpring = (epsilon=1e-2) => springTopAtRest.clone().sub(ball.position).length() < epsilon;
const gravitationalForce = new Vector3(0, -9.8 * ball.mass, 0);
const netForce = new Vector3();

function timeStep(dt) {
    netForce.y = spring.force.y + gravitationalForce.y;
    netForce.y -= Number(dampingSlider.value) * ball.velocity.y;
    ball.apply(netForce, dt);

    if (ballHitsSpring() || spring.isCompressed)
        spring.axis = spring.positionVectorTo(ball);
}

//
// Simulation
//
const canvas = new Canvas("ballSpringCanvas");
const overlay = new Overlay("ballSpringOverlayText");
const threeJsRendererOptions = new ThreeJsRenderOptions({
    cameraPosition: new Vector3(1, 0.4, 2).multiplyScalar(1.7)
});
const renderer = ThreeJsRenderer.on(canvas.with(overlay)).and(threeJsRendererOptions);
const simulation = Simulation.on(canvas.with(overlay)).and(renderer);

const helix = new Helix({ coils: 15, color: "yellow" });
const sphere = new Sphere({ color: "orange" });
const velocityArrow = new Arrow({ color: "cyan", size: .125 });
const forceArrow = new Arrow({ color: "red", size: .03 });
renderer.add(ball.to(sphere));
renderer.add(ball.velocityVector.to(velocityArrow));
renderer.add(ball.accelerationVector.to(forceArrow));
renderer.add(spring.to(helix));
renderer.addPlainObject(floor);

velocityArrowButton.addEventListener("click", () => velocityArrow.visible = velocityArrowButton.checked);
forceArrowButton.addEventListener("click", () => forceArrow.visible = forceArrowButton.checked);

const dt = 1.5e-3;
simulation.run(() => {
    for (let subStep = 0; subStep < 10; subStep++)
        timeStep(dt);
});
