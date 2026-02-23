import { Group, Vector3, Color, Scene, Box3 } from "three";
import { Arrow, AxesController, AxesParameters, Plot3DView, ThreeJsUtils } from '../js/three-js-extensions.js';
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const canvasContainer = document.getElementById("infiniteWellContainer");
const canvas = document.getElementById("infiniteWellCanvas");
const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

const L = 20;
const dt = 0.01;

const params = {
    groundState: 1,
    firstState: 1,
    secondState: 0,
    thirdState: 0
};

const axesParams = new AxesParameters({
    layoutType: 0,
    xyPlane: false,
    xzPlane: true,
    yzPlane: false,
    divisions: 10,
    axisLabels: ["x", "Im(Ψ)", "Re(Ψ)"],
    annotations: true,
    tickLabels: false
});

class InfiniteWellWave extends Group {
    constructor(numPoints = 40) {
        super();
        this._numPoints = numPoints;
        this._xVals = [];
        this._arrows = [];
        const dx = L / numPoints;
        for (let i = 0; i < numPoints; i++) {
            const x = i * dx - L/2;   // <-- shift to middle of frame of axes, just for nice visuals
            this._xVals.push(x);
            const arrow = new Arrow(new Vector3(x, 0, 0), new Vector3(0, 1, 0), {
                color: 0xff0000,
                shaftWidth: 0.05
            });
            this._arrows.push(arrow);
            this.add(arrow);
        }

        this._weights = {ground: 1, first: 1, second: 0, third: 0};
        this._k = Math.PI / L;
        this._omega = 2 * Math.PI;
        this._amplitude = 4;
    }

    setWeights(weights) { this._weights = weights; }
    setAmplitude(value) { this._amplitude = value; }
    setOmega(value) { this._omega = value * Math.PI; }
    setK(value) { this._k = value * Math.PI; }

    _computePsiAt(x, t) {
        const k = this._k;
        const w = this._omega;

        function phaseFactor(n) { return -n*n * w * t; }
        function state(n) { return Math.sin((n+1) * k * x); }

        const real = this._weights.ground * state(0) * Math.cos(phaseFactor(1))
            + this._weights.first  * state(1) * Math.cos(phaseFactor(2))
            + this._weights.second * state(2) * Math.cos(phaseFactor(3))
            + this._weights.third  * state(3) * Math.cos(phaseFactor(4));

        const imag = this._weights.ground * state(0) * Math.sin(phaseFactor(1))
            + this._weights.first  * state(1) * Math.sin(phaseFactor(2))
            + this._weights.second * state(2) * Math.sin(phaseFactor(3))
            + this._weights.third  * state(3) * Math.sin(phaseFactor(4));

        return {real, imag};
    }

    update(t) {
        for (let i = 0; i < this._numPoints; i++) {
            const x = this._xVals[i];
            const {real, imag} = this._computePsiAt(x, t);
            this._arrows[i].updateAxis(new Vector3(0, imag * this._amplitude, real * this._amplitude));

            const phase = Math.atan2(imag, real);
            const h = 1 - ((phase + Math.PI) / (2 * Math.PI));
            this._arrows[i].updateColor(new Color().setHSL(h, 1.0, 0.5));
        }
    }
}

// GUI
const gui = new GUI({width: "100%", autoPlace: false});
gui
    .add(params, "groundState", 0, 1, 0.01)
    .name("Ground state").onChange(value => wave.setWeights({...wave._weights, ground: value}));
gui
    .add(params, "firstState", 0, 1, 0.01)
    .name("1st excited").onChange(value => wave.setWeights({...wave._weights, first: value}));
gui
    .add(params, "secondState", 0, 1, 0.01)
    .name("2nd excited").onChange(value => wave.setWeights({...wave._weights, second: value}));
gui
    .add(params, "thirdState", 0, 1, 0.01)
    .name("3rd excited").onChange(value => wave.setWeights({...wave._weights, third: value}));
document.getElementById("infiniteWellGui").appendChild(gui.domElement);

const axesController = new AxesController({
    parentGroup: worldGroup,
    canvasContainer,
    axesParameters: axesParams,
    scene
});

const wave = new InfiniteWellWave();
worldGroup.add(wave);

const boundingBox = new Box3();
boundingBox.setFromObject( worldGroup );
axesController.createFromBoundingBox(boundingBox);

const plot3D = new Plot3DView(scene, canvas, boundingBox);
plot3D.frame(ThreeJsUtils.scaleBox3(boundingBox, 0.5));

// Resizing for mobile devices
function resize() {
    ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
    axesController.resize();
}
window.addEventListener("resize", resize);
resize();

let time = 0;
function animate() {
    wave.update(time);
    plot3D.render();
    axesController.render(plot3D.camera);
    time += dt;
}

plot3D.renderer.setAnimationLoop(animate);