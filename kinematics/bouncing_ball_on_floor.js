import { Vector3, Vector2 } from "three";
import { Simulation, RadialSymmetricBody, Sphere, Floor, Overlay, ThreeJsRenderOptions,
    Trail, UPlotGraph, ThreeJsRenderer, Canvas } from "../js/simulation.js";

class BouncingBall extends RadialSymmetricBody {
    constructor({position, velocity, radius, mass}) {
        super({position, velocity, radius, mass});
    }

    liesOnFloor({ floorLevel = 0, epsilon = 1e-1 } = {}) {
        return this.position.y - this.radius <= epsilon + floorLevel;
    }

    bounceOffOfFloor(dt, elasticity=1, epsilon=1e-1) {
        this.velocity.y *= -elasticity;
        this.position.addScaledVector(this.velocity, dt);

        // if the velocity is too slow, stay on the ground
        if (this.velocity.y <= epsilon)
            this.velocity.y = this.radius + this.radius * epsilon;
    }
}

//
// Physics
//
const ball = new BouncingBall({
    position: new Vector3(-1.5, 1.5, 1.5),
    velocity: new Vector3(.5, 0, -.4),
    radius: 0.1,
    mass: 1
});

const gravitationalForce = new Vector3(0, -9.8 * ball.mass, 0);
function ballStep(dt) {
    ball.apply(gravitationalForce, dt);
    if (ball.liesOnFloor())
        ball.bounceOffOfFloor(dt, 0.9);
}

//
// Simulation
//
const canvas = new Canvas("bouncingBallOnFloorCanvas");
const overlay = new Overlay("bouncingBallOnFloorOverlayText");
const threeJsRendererOptions = new ThreeJsRenderOptions({
    cameraPosition: new Vector3(2, 1, 0.5).multiplyScalar(2.25)
});
const renderer = ThreeJsRenderer.on(canvas.with(overlay)).and(threeJsRendererOptions);
const simulation = Simulation.on(canvas.with(overlay)).and(renderer);

const sphere = new Sphere({ color: "cyan" });
simulation.add(ball.to(sphere));
simulation.add(ball.to(new Trail({ color: sphere.color})));

renderer.add(new Floor({
    type: Floor.Type.GRID,
    planeSizeXy: new Vector2(5, 5),
    opacity: 0.3,
    granularity: 20
}));

//
// Graph
//
const plot = new UPlotGraph({
    plotDiv: document.getElementById("chart"),
    dataDefinition: [
        {label: "t"}, {label: "ball1", color: "blue"},
        { label: "Y-position", color: "cyan" },
        { label: "Kinetic Energy", color: "red" },
        { label: "Potential Energy", color: "green" }
    ],
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    title: "Bouncing ball",
    xLabel: "Simulation time",
    yLabel: "Displacement"
});

let simTime = 0;
function updateGraph(dt) {
    simTime += dt;

    plot.graphData[0].push(simTime);
    plot.graphData[1].push(ball.position.y);
    plot.graphData[2].push(ball.kineticEnergy);
    plot.graphData[3].push(ball.potentialEnergy);
    plot.update();
}

const dt = 2.5e-3;
simulation.run(() => {
    if (ball.position.x > 2.5)
        return;

    for (let subStep = 0; subStep < 10; subStep++)
        ballStep(dt);

    updateGraph(dt);
});
