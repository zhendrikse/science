import { Group, Vector3, Color, Scene, Box3 } from "three";
import { Arrow, AxesController, AxesParameters, Plot3DView, ThreeJsUtils } from '../js/three-js-extensions.js';
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const canvasContainer = document.getElementById("shoContainer");
const canvas = document.getElementById("shoCanvas");
const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

const params = {
    alpha: 2
};

const axesParams = new AxesParameters({
    layoutType: 0,
    xyPlane: false,
    xzPlane: true,
    yzPlane: false,
    divisions: 10,
    axisLabels: ["x", "Im(Ψ)", "Re(Ψ)"],
    positiveXZ: false,
    annotations: true,
    tickLabels: false
});

class HarmonicOscillatorWave extends Group {
    constructor(numPoints=80, L=7, maxStates=20) {
        super();

        this._maxStates = maxStates;

        this._arrows = [];
        this._values = [];

        this._xValues = [];
        const dx = L / numPoints;

        for (let i = 0; i < numPoints; i++) {
            const x = -L / 2 + i * dx;
            this._xValues.push(x);

            const arrow = new Arrow(
                new Vector3(x, 0, 0),
                new Vector3(0, 1, 0),
                {
                    color: 0xff0000,
                    shaftWidth: 0.05
                }
            );

            this._arrows.push(arrow);
            this._values.push({real: 0, imag: 0});
            this.add(arrow);
        }

        this._amplitude = 8;
        this._omega = 5;
        this._weights = [1, 1, 1]; // default coherent-ish

        this._computeHermiteStates();
    }

    set weights(w) {
        this._weights = w;
    }

    _computeHermiteStates() {
        const N = this._maxStates;
        const xs = this._xValues;

        this._psis = [];

        const H = [];
        H[0] = xs.map(() => 1);
        H[1] = xs.map(x => 2 * x);

        for (let n = 1; n < N-1; n++)
            H[n+1] = xs.map((x,i) => 2 * x * H[n][i] - 2 * n * H[n-1][i]);

        let normFactor = 1 / Math.pow(Math.PI, 0.25);

        this._psis[0] = xs.map(x => normFactor * Math.exp(-x*x / 2));

        for (let n = 1; n < N; n++) {
            normFactor /= Math.sqrt(2 * n);
            this._psis[n] = xs.map((x, i) => normFactor * H[n][i] * Math.exp(-x*x / 2));
        }
    }

    _computePsiAt(index, t) {
        const xIndex = index;
        let real = 0;
        let imag = 0;

        for (let n = 0; n < this._weights.length; n++) {
            const coef = this._weights[n] || 0;
            const psi_n = this._psis[n][xIndex];

            const phase = -(n + 0.5) * this._omega * t;

            real += coef * psi_n * Math.cos(phase);
            imag += coef * psi_n * Math.sin(phase);
        }

        return {real, imag};
    }

    update(t) {
        // eerst psi berekenen
        let temp = [];
        let norm = 0;

        for (let i = 0; i < this._arrows.length; i++) {
            const val = this._computePsiAt(i, t);
            temp.push(val);
            norm += val.real*val.real + val.imag*val.imag;
        }
        norm = Math.sqrt(norm);

        for (let i = 0; i < this._arrows.length; i++) {
            const real = temp[i].real / norm;
            const imag = temp[i].imag / norm;

            const arrow = this._arrows[i];
            arrow.updateAxis(new Vector3(0, imag * this._amplitude, real * this._amplitude));

            const phase = Math.atan2(imag, real);
            const hue = 1 - ((phase + Math.PI)/(2*Math.PI));
            arrow.updateColor(new Color().setHSL(hue,1,0.5));
        }

        // expectation value <x>
        let psiSum = 0;
        let expectation = 0;
        for (let i = 0; i < this._arrows.length; i++) {
            const real = temp[i].real / norm;
            const imag = temp[i].imag / norm;

            const abs2 = real*real + imag*imag;
            psiSum += abs2;
            expectation += this._xValues[i] * abs2;
        }

        return expectation / psiSum;
    }
}

// GUI
const gui = new GUI({width: "100%", autoPlace: false});
gui.add(params, "alpha", 0, 4, 0.01).onChange(value => wave.setCoherentState(value));
document.getElementById("shoGui").appendChild(gui.domElement);

const axesController = new AxesController({
    parentGroup: worldGroup,
    canvasContainer,
    axesParameters: axesParams,
    scene
});

const wave = new HarmonicOscillatorWave();
worldGroup.add(wave);

const boundingBox = new Box3();
boundingBox.setFromObject( worldGroup );
axesController.createFromBoundingBox(boundingBox);

const plot3D = new Plot3DView(scene, canvas, boundingBox);
plot3D.frame(ThreeJsUtils.scaleBox3(boundingBox, 0.525));

// Resizing for mobile devices
function resize() {
    ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
    axesController.resize();
}
window.addEventListener("resize", resize);
resize();

const plotData = [
    [], // x-axis = time
    [] // Expectation
];

const plot = new uPlot({
    width: canvas.clientWidth,
    height: canvas.clientHeight * .5,
    title: "Probability finding the particle at x",
    scales: { x: { time: false }, y: { auto: true } },
    series: [
        {}, // x-axis
        { label: "Expectation", stroke: "yellow" }
    ],
    axes: [
        { stroke: "#fff", grid: { stroke: "rgba(255,255,255,0.2)" } },
        { stroke: "#fff", grid: { stroke: "rgba(255,255,255,0.2)" } }
    ],
    bg: "transparent"
}, plotData, document.getElementById("expectationPlot"));

let time = 0;
const dt = 0.01;
const maxPoints = 100;
function animate() {
    plotData[0].push(time); // x-axis = time
    plotData[1].push(wave.update(time));
    plot3D.render();
    axesController.render(plot3D.camera);
    time += dt;
    if (plotData[0].length > maxPoints)
        plotData.forEach(arr => arr.shift());
    plot.setData(plotData);
}

plot3D.renderer.setAnimationLoop(animate);