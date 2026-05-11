import { Vector3, Vector2 } from "three";
import {Helix, ThreeSim, Ball, Sphere, HarmonicOscillator, Floor} from "../js/threesim.js";

const canvas = document.getElementById("oscillatorCanvas");
const overlay = document.getElementById("oscillatorOverlayText");

//
// Physics
//
function createBallsAndSprings(numBalls = 5, k = 300) {
    const balls = [];
    const springs = [];

    for (let i = 0; i < numBalls; i++) {
        balls.push(new Ball({
            position: new Vector3(i * 10 - 30, 5, 0),
            radius: 1,
            mass: 1.5
        }));
        if (i !== 0)
            springs.push(HarmonicOscillator.between(balls[i - 1].and(balls[i]), k));
    }

    return {balls, springs};
}

function initialDisturbance(displacement=5) {
    balls[0].position.add(new Vector3(displacement, 0, 0));
    springs[0].bond.position.copy(balls[0].position);
}

const {balls, springs} = createBallsAndSprings();
initialDisturbance();

const floor = new Floor({
    type: Floor.Type.WOOD_WICKER,
    planeSizeXy: new Vector2(200, 200),
    granularity: 5
});

//
// Simulation
//
const simulation = new ThreeSim({
    canvas,
    overlay,
    cameraPosition: new Vector3(17, 9, 5).multiplyScalar(1.15),
    light: true,
    shadowsEnabled: true,
    fieldOfView: 60,
    background: ThreeSim.Background.FOG
});
simulation.addThreeJsObject(floor);

// Attach spheres and helices to balls and springs
for (let i = 0; i < balls.length; i++) {
    const sphere = new Sphere({ color: 0x3333ff, castShadow: true });
    simulation.attach(balls[i].to(sphere));
    if (i === 0)
        continue;

    const helix = new Helix({
        radius: 0.5,
        thickness: 0.075,
        coils: 30,
        color: 0xffff4d,
        castShadow: true
    });
    simulation.attach(springs[i - 1].to(helix));
}
balls[0].color = 0xff0000;
balls[balls.length - 1].color = 0xff0000;

function uPlotData() {
    const uPlotOptions = {
        title: "Kinetic Energy vs Time",
        width: canvas.clientWidth,
        height: canvas.clientHeight * 1.5,
        bg: "transparent",
        scales: { x: { auto: true }, y: { auto: true } },
        axes: [
            {
                stroke: "#ff0",
                font: "12px Arial",
                grid: { stroke: "rgba(255, 255, 255, 0.2)", width: 1 },
                label: "Time [s]"
            },
            {
                stroke: "#ff0",
                font: "12px Arial",
                grid: { stroke: "rgba(255, 255, 255, 0.2)", width: 1 },
                label: "Displacement"
            }
        ],
        series: [
            { label: "t" },
            { label: "ball 1", stroke: "red" },
            { label: "ball 2", stroke: "blue" },
            { label: "ball 3", stroke: "blue" },
            { label: "ball 4", stroke: "blue" },
            { label: "ball 5", stroke: "red" }
        ]
    };

    const graphData = [
        [0] // time
    ];
    for (let ball of balls) graphData.push([ball.position.x]);

    return {uPlotOptions, graphData};
}

let {uPlotOptions, graphData} = uPlotData();
simulation.onReset = () => {
    graphData = [[0]];
    for (let ball of balls) graphData.push([ball.position.x]);
};

const uplotChart = new uPlot(uPlotOptions, graphData, document.getElementById("oscillatorPlot"));
const maxPoints = 500;
const dt = 1e-3;
simulation.run((time) => {
    for (let substep = 0; substep < 10; substep++) {
        for (let i = 0; i < balls.length - 1; i++)
            springs[i].oscillate(dt);

        graphData[0].push(time * 0.001);
        for (let i = 0; i < balls.length; i++)
            graphData[i + 1].push(balls[i].position.x);
    }

    if (graphData[0].length > maxPoints)
        graphData.forEach(arr => arr.shift());
    uplotChart.setData(graphData);
});

