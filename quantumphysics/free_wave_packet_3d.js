import { Group, Vector3, Color, Scene, Box3 } from "three";
import { Arrow, AxesController, AxesParameters, Plot3DView, ThreeJsUtils } from '../js/three-js-extensions.js';
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const canvasContainer = document.getElementById("freePacketWrapper");
const canvas = document.getElementById("freePacketCanvas");
const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

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

// js/fft-esm.js
// ESM-versie van fft.js suitable for browser
class FFT {
    constructor(size) {
        this.size = size | 0;
        if (this.size <= 1) throw new Error("Size must be > 1");

        this._twiddles = new Array(this.size);
        for (let i = 0; i < this.size; i++) {
            const phase = -2 * Math.PI * i / this.size;
            this._twiddles[i] = [Math.cos(phase), Math.sin(phase)];
        }

        this._bitReverse = new Array(this.size);
        const n = this.size;
        const bits = Math.floor(Math.log2(n));
        for (let i = 0; i < n; i++) {
            let x = i;
            let y = 0;
            for (let j = 0; j < bits; j++) {
                y = (y << 1) | (x & 1);
                x >>= 1;
            }
            this._bitReverse[i] = y;
        }
    }

    transform(outRe, outIm, inRe, inIm) {
        const n = this.size;
        for (let i = 0; i < n; i++) {
            outRe[i] = inRe[this._bitReverse[i]];
            outIm[i] = inIm[this._bitReverse[i]];
        }

        for (let size = 2; size <= n; size <<= 1) {
            const half = size >> 1;
            const step = n / size;
            for (let i = 0; i < n; i += size) {
                for (let j = 0; j < half; j++) {
                    const k = j * step;
                    const [twRe, twIm] = this._twiddles[k];
                    const l = i + j;
                    const r = i + j + half;

                    const tRe = outRe[r] * twRe - outIm[r] * twIm;
                    const tIm = outRe[r] * twIm + outIm[r] * twRe;

                    outRe[r] = outRe[l] - tRe;
                    outIm[r] = outIm[l] - tIm;
                    outRe[l] += tRe;
                    outIm[l] += tIm;
                }
            }
        }
    }

    inverseTransform(outRe, outIm, inRe, inIm) {
        const n = this.size;
        // conjugate
        const tempRe = inRe.slice();
        const tempIm = inIm.map(x => -x);
        this.transform(outRe, outIm, tempRe, tempIm);
        // normalize and conjugate back
        for (let i = 0; i < n; i++) {
            outRe[i] /= n;
            outIm[i] = -outIm[i] / n;
        }
    }
}

class FreeWavePacket extends Group {
    constructor({
                    numPoints = 256,
                    L = 30,
                    k0Factor = 25,
                    a = 1
                } = {}) {
        super();

        this._N = numPoints;
        this._L = L;
        this._dx = L / numPoints;
        this._arrowScale = Math.sqrt(this._N * this._dx * 2 * a) / 0.8; // as in VPython version
        this._x = [];
        this._arrows = [];
        this._values = [];

        for (let i = 0; i < this._N; i++) {
            const x = -L / 2 + i * this._dx;
            this._x.push(x);

            const arrow = new Arrow(
                new Vector3(x, 0, 0),
                new Vector3(0, .01, 0),
                {
                    color: 0xff0000,
                    shaftWidth: 0.05
                }
            );

            this._arrows.push(arrow);
            this._values.push({ real: 0, imag: 0 });
            this.add(arrow);
        }

        // ---- k-space ----
        this._n = new Array(this._N);
        for (let i = 0; i < this._N; i++)
            this._n[i] = i <= this._N / 2 ? i : i - this._N;

        this._k = this._n.map(n => 2 * Math.PI * n / L);

        this._omega = this._k.map(k => k * k / 2); // hbar = m = 1

        this._fft = new FFT(this._N);

        this._psi_re = new Array(this._N).fill(0);
        this._psi_im = new Array(this._N).fill(0);

        this._phi0_re = new Array(this._N).fill(0);
        this._phi0_im = new Array(this._N).fill(0);

        this._phi_re = new Array(this._N).fill(0);
        this._phi_im = new Array(this._N).fill(0);

        this._buildInitialPacket(k0Factor, a);
    }

    _buildInitialPacket(k0Factor, a) {
        const kMin = 2*Math.PI / this._L;
        const k0 = k0Factor * kMin;

        for (let i = 0; i < this._N; i++) {
            const x = this._x[i];
            const gauss = Math.exp(-1 * ((x + this._L/4)/(2*a))**2);
            const phase = k0 * x;

            this._psi_re[i] = gauss * Math.cos(phase);
            this._psi_im[i] = gauss * Math.sin(phase);
        }

        this._normalize();
        this._fft.transform(this._phi0_re, this._phi0_im, this._psi_re, this._psi_im);
    }

    _normalize() {
        let norm = 0;
        for (let i = 0; i < this._N; i++)
            norm += this._psi_re[i]**2 + this._psi_im[i]**2;

        norm = Math.sqrt(norm);

        for (let i = 0; i < this._N; i++) {
            this._psi_re[i] /= norm;
            this._psi_im[i] /= norm;
        }
    }

    #evolveInKspace(index, t) {
        const phase = -this._omega[index] * t;
        const cos = Math.cos(phase);
        const sin = Math.sin(phase);

        const re = this._phi0_re[index];
        const im = this._phi0_im[index];

        this._phi_re[index] = re * cos - im * sin;
        this._phi_im[index] = re * sin + im * cos;
    }

    #updateArrowAt(index) {
        const real = this._psi_re[index];
        const imag = this._psi_im[index];

        this._values[index] = {real, imag};
        const direction = new Vector3(0, imag, real);
        this._arrows[index].updateAxis(direction.clone().multiplyScalar(this._arrowScale));
        direction.normalize();

        this._arrows[index].updateAxis(direction.multiplyScalar(length));

        const phase = Math.atan2(imag, real);
        const hue = 1 - ((phase + Math.PI) / (2 * Math.PI));
        this._arrows[index].updateColor(new Color().setHSL(hue, 1.0, 0.5));

        return real * real + imag * imag;
    }

    update(t) {
        for (let i = 0; i < this._N; i++)
            this.#evolveInKspace(i, t);

        this._fft.inverseTransform(this._psi_re, this._psi_im, this._phi_re, this._phi_im);

        let psiSum = 0;
        let expectationX = 0;
        for (let i = 0; i < this._N; i++) {
            const probability = this.#updateArrowAt(i);
            psiSum += probability;
            expectationX += this._x[i] * probability;
        }

        return expectationX / psiSum;
    }
}

const wave = new FreeWavePacket({
    numPoints: 256,
    L: 30
});
worldGroup.add(wave);

const axesController = new AxesController({
    parentGroup: worldGroup,
    canvasContainer,
    axesParameters: axesParams,
    scene: worldGroup
});

const boundingBox = new Box3();
boundingBox.setFromObject( worldGroup );
axesController.createFromBoundingBox(boundingBox);

const plot3D = new Plot3DView(scene, canvas, boundingBox);
plot3D.frame(ThreeJsUtils.scaleBox3(boundingBox, 0.3), {
    viewDirection: new Vector3(.25, 1, 1),
    padding: 0.9
});

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
    axesController.render(plot3D.camera);
    time += dt;
    if (plotData[0].length > maxPoints)
        plotData.forEach(arr => arr.shift());
    plot.setData(plotData);
    plot3D.render();
}

plot3D.renderer.setAnimationLoop(animate);