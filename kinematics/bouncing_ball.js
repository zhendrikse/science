import {Box3, Scene, Group, Vector3 } from "three";
import {
    Sphere,
    Axes,
    AxesController,
    AxesParameters,
    ThreeJsUtils,
    Plot3DView,
    TrailProperties
} from '../js/three-js-extensions.js';

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

class Ball extends Sphere {
    constructor({
                    position = new Vector3(0, 0, 0),
                    velocity = new Vector3(0, 0, 0),
                    mass = 1,
                    charge = 0,
                    radius = 1,
                    color = 0xffff00,
                    visible = true,
                    scale = 1,
                    segments = 24,
                    opacity = 1,
                    castShadow = false,
                    wireframe = false,
                    trailProperties = new TrailProperties(),
                } = {}) {
        super({position, velocity, mass, charge, radius, color, visible, scale, segments, opacity, castShadow, wireframe, trailProperties});
    }

    liesOnFloor({ floorLevel = 0, epsilon = 1e-1 } = {}) {
        return this.physicsPosition.y - this.radius <= epsilon + floorLevel;
    }

    bounceOffOfFloor(dt, elasticity=1, epsilon=1e-1) {
        this._body.velocity.y *= -elasticity;
        this._body.position.addScaledVector(this.velocity, dt);
        this.physicsPosition = this._body.position;

        // if the velocity is too slow, stay on the ground
        if (this.velocity.y <= epsilon)
            this._body.velocity.y = this.radius + this.radius * epsilon;
    }
}

const ball = new Ball({
    position: new Vector3(-1.5, 1, 1.5),
    velocity: new Vector3(.5, 0, -.4),
    color: "cyan",
    radius: 0.1,
    trailProperties: new TrailProperties({makeTrail: true})
});

worldGroup.add(ball);

const boundingBox = new Box3(new Vector3(0, 0, 0), new Vector3(3.25, 3.25, 3.25));
axesController.createFromBoundingBox(boundingBox);

const plot3D = new Plot3DView(scene, canvas, boundingBox);
plot3D.frame(ThreeJsUtils.scaleBox3(boundingBox, .4), {translationY: -1, padding: 0.9});

// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
window.addEventListener('resize', () => ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera));
canvas.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    } else {
        ThreeJsUtils.showOverlayMessage(overlay, "Reset");
        ball.reset();
        running = false;
        timeData = [simTime];
        positionData = [ball.position.y];
        kineticData = [ball.kineticEnergy];
        potentialData = [ball.mass * g * ball.position.y];
    }
});

let simTime = 0;
const g = 9.8;
let timeData = [simTime];
let positionData = [ball.position.y];
let kineticData = [ball.kineticEnergy];
let potentialData = [ball.mass * g * ball.position.y];

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
        ball.bounceOffOfFloor(dt, 0.9);

    updateGraph(dt);
}

function updateGraph(dt) {
    simTime += dt;

    timeData.push(simTime);
    positionData.push(ball.position.y);
    kineticData.push(ball.kineticEnergy);
    potentialData.push(ball.mass * g * ball.position.y);
}

plot3D.renderer.setAnimationLoop( (time) => {
    for (let subStep = 0; subStep < 10; subStep++)
        ballStep(0.0025);

    uplot.setData([timeData, positionData, kineticData, potentialData]);
    plot3D.render();
    axesController.render(plot3D.camera);
});
