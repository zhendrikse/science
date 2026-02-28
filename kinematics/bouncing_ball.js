import {Box3, Scene, Color, Group, Vector3 } from "three";
import { Ball, Axes, AxesController, AxesParameters, ThreeJsUtils, Plot3DView } from '../js/three-js-extensions.js';

const canvasContainer = document.getElementById("bouncingBallWrapper");
const canvas = document.getElementById("bouncingBallCanvas");
const overlay = document.getElementById("overlayText");
let running = false;

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

const params = {
    axesParameters: new AxesParameters({
        layoutType: Axes.Type.CLASSICAL,
        xyPlane: false,
        yzPlane: false,
        divisions: 20,
        annotations: true,
        tickLabels: false
    })
};

const axesController = new AxesController({
    parentGroup: worldGroup,
    canvasContainer,
    axesParameters: params.axesParameters,
    scene
});

const ball = new Ball(worldGroup, {
    position: new Vector3(-1.5, 1, 1.5),
    velocity: new Vector3(.5, 0, -.4),
    color: "cyan",
    radius: 0.1,
    elasticity: 0.9,
    makeTrail: true
});

const boundingBox = new Box3(new Vector3(0, 0, 0), new Vector3(3.25, 3.25, 3.25));
axesController.createFromBoundingBox(boundingBox);

const plot3D = new Plot3DView(scene, canvas, boundingBox);
plot3D.frame(ThreeJsUtils.scaleBox3(boundingBox, .4), {translationY: -1});
plot3D.renderer.setAnimationLoop(animate);

// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
window.addEventListener('resize', () => ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera));
window.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    }
});

let timeData = [];
let positionData = [];
let kineticData = [];
let potentialData = [];

let simTime = 0;
const g = 9.8;

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

const data = [
    timeData,
    positionData,
    kineticData,
    potentialData
];

const uplot = new uPlot(opts, data, document.getElementById("chart"));

function ballStep(dt) {
    if (ball.position.x > 1.75 || !running) return;
    const force = new Vector3(0, -9.8, 0).multiplyScalar(ball.mass);
    ball.step(force, dt);
    if (ball.liesOnFloor())
        ball.bounceOffOfFloor(dt);

    updateGraph(dt);
}

function updateGraph(dt) {
    simTime += dt;

    timeData.push(simTime);
    positionData.push(ball.position.y);
    kineticData.push(ball.kineticEnergy());
    potentialData.push(ball.mass * g * ball.position.y);
}

function animate(time) {
    for (let subStep = 0; subStep < 10; subStep++)
        ballStep(0.0025);

    uplot.setData([timeData, positionData, kineticData, potentialData]);
    plot3D.render();
    axesController.render(plot3D.camera);
}
