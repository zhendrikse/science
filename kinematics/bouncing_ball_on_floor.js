import { Vector3, Vector2 } from "three";
import {ThreeSim, Ball, Sphere, Floor, Trail } from "../js/threesim.js";

const canvas = document.getElementById("bouncingBallOnFloorCanvas");
const overlay = document.getElementById("bouncingBallOnFloorOverlayText");

class BouncingBall extends Ball {
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
const floor = new Floor({
    type: Floor.Type.GRID,
    planeSizeXy: new Vector2(5, 5),
    opacity: 0.3,
    granularity: 20
});

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
const simulation = new ThreeSim({
    canvas,
    overlay,
    cameraPosition: new Vector3(2, 1, 0.5).multiplyScalar(2.25),
});

const sphere = new Sphere({
    color: "cyan"
});
simulation.attach(ball.to(sphere));
simulation.attach(ball.to(new Trail({ color: sphere.color})));
simulation.addThreeJsObject(floor);

//
// Graph
//
let simTime = 0;
let timeData = [simTime];
let positionData = [ball.position.y];
let kineticData = [ball.kineticEnergy];
let potentialData = [ball.potentialEnergy];
const data = [timeData, positionData, kineticData, potentialData];
simulation.resetFunction = () => {
    timeData = [simTime];
    positionData = [ball.position.y];
    kineticData = [ball.kineticEnergy];
    potentialData = [ball.potentialEnergy];
};

const opts = {
    title: "Bouncing Ball",
    width: canvas.clientWidth,
    height: canvas.clientHeight * .5,
    background: "transparent",
    scales: {
        x: { time: false },
        y: { auto: true }
    },
    axes: [
        {
            stroke: "#ff0",
            font: "12px Arial",
            grid: {stroke: "rgba(255, 255, 255, 0.2)", width: 1}
        },
        {
            stroke: "#ff0",
            font: "12px Arial",
            grid: {stroke: "rgba(255, 255, 255, 0.2)", width: 1}
        }
    ],
    series: [
        {},                         // x (time)
        { label: "Y-position", stroke: "cyan" },
        { label: "Kinetic Energy", stroke: "red" },
        { label: "Potential Energy", stroke: "green" }
    ]
};

function updateGraph(dt) {
    simTime += dt;

    timeData.push(simTime);
    positionData.push(ball.position.y);
    kineticData.push(ball.kineticEnergy);
    potentialData.push(ball.potentialEnergy);
}

const uplot = new uPlot(opts, data, document.getElementById("chart"));

const dt = 2.5e-3;
simulation.run(() => {
    if (ball.position.x > 2.5)
        return;

    for (let subStep = 0; subStep < 10; subStep++)
        ballStep(dt);

    uplot.setData([timeData, positionData, kineticData, potentialData]);
    updateGraph(dt);
});
