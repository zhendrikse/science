import { Vector3, Vector2 } from "three";
import {Helix, Simulation, RadialSymmetricBody, Sphere, HarmonicOscillator, Floor, UPlotGraph} from "../js/simulation.js";

const canvas = document.getElementById("oscillatorCanvas");
const overlay = document.getElementById("oscillatorOverlayText");

//
// Physics
//
function createBallsAndSprings(numBalls = 5, k = 300) {
    const balls = [];
    const springs = [];

    for (let i = 0; i < numBalls; i++) {
        balls.push(new RadialSymmetricBody({
            position: new Vector3(i * 10 - 30, 3, 0),
            radius: 1,
            mass: 1.5
        }));
        if (i !== 0)
            springs.push(HarmonicOscillator.between(balls[i - 1].and(balls[i]), k, 0.5));
    }

    return { balls, springs };
}

function initialDisturbance(displacement=5) {
    balls[0].position.add(new Vector3(displacement, 0, 0));
    springs[0].bond.position.copy(balls[0].position);
}

const {balls, springs} = createBallsAndSprings();
initialDisturbance(7);

//
// Simulation
//
const simulation = new Simulation({
    canvas,
    overlay,
    cameraPosition: new Vector3(17, 6, 17),
    light: true,
    shadowsEnabled: true,
    fieldOfView: 45,
    background: Simulation.Background.FOG
});

// Floor
simulation.addThreeJsObject(new Floor({
    type: Floor.Type.WOOD_WICKER,
    planeSizeXy: new Vector2(200, 200),
    granularity: 5
}));

// Attach spheres and helices to balls and springs
for (let i = 0; i < balls.length; i++) {
    const color = i ===0 || i === balls.length - 1 ? 0x3333ff : 0xff0000;
    const sphere = new Sphere({ color, castShadow: true });
    simulation.attach(balls[i].to(sphere));
    if (i === 0)
        continue;

    const helix = new Helix({
        thickness: 0.075,
        coils: 30,
        color: 0xffff4d,
        castShadow: true
    });
    simulation.attach(springs[i - 1].to(helix));
}

//
// Graph
//
const plot = new UPlotGraph({
    plotDiv: document.getElementById("oscillatorPlot"),
    dataDefinition: [
        {label: "t"}, {label: "ball1", color: "blue"},
        {label: "ball2", color: "red"},
        {label: "ball3", color: "red"},
        {label: "ball4", color: "red"},
        {label: "ball5", color: "blue"},
    ],
    width: canvas.clientWidth,
    height: canvas.clientHeight * 1.5,
    title: "Kinetic Energy vs Time",
    xLabel: "Time [s]",
    yLabel: "Displacement"
});

const dt = 1e-3;
simulation.run((time) => {
    for (let substep = 0; substep < 10; substep++) {
        for (let i = 0; i < balls.length - 1; i++)
            springs[i].oscillate(dt);

        plot.graphData[0].push(time * 0.001);
        for (let i = 0; i < balls.length; i++)
            plot.graphData[i + 1].push(balls[i].position.x);
    }
    plot.update();
});

