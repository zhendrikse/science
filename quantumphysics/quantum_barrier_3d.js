import { Group, Vector3, Color, Scene, Box3, BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { Arrow, AxesController, AxesParameters, Plot3DView, ThreeJsUtils } from '../js/three-js-extensions.js';
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const canvasContainer = document.getElementById("barrier3dWrapper");
const canvas = document.getElementById("barrier3dCanvas");
const overlay = document.getElementById("barrier3dOverlayText");
const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);
let running = false;

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

const params = {
    k0Factor: 20, // k0 → determines group velocity
    a: 1,         // a → determines start width
    x0: 0
};

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
        k0Factor = 25, // k0 → determines group velocity
        a = 1,         // a → determines start width
        x0 = -L / 4       // Start left of the barrier, not _in_ the barrier!
    } = {}) {
        super();
        this._k0Factor = k0Factor;
        this._a = a;
        this._x0 = x0;
        this._N = numPoints;
        this._L = L;
        this._dx = L / numPoints;
        this._arrowScale = Math.sqrt(numPoints * this._dx * 2 * a) / 2; // as in VPython version
        this._arrows = [];
        this._values = [];
        this._V = new Array(this._N).fill(0); // Potential energy
        this._psi = { re: new Array(numPoints), im: new Array(numPoints) };
        this._phi = { re: new Array(numPoints), im: new Array(numPoints) };
        this._phi0 = { re: new Array(numPoints), im: new Array(numPoints) };

        // t = 0
        // → P_left ≈ 1
        // → P_right ≈ 0
        //
        // Tijdens botsing
        // → beide variëren
        //
        // Na lange tijd
        // → P_left → reflectiecoëfficiënt R
        // → P_right → transmissiecoëfficiënt T
        // → R + T ≈ 1
        //
        // Als dat niet ≈ 1 blijft, dan is je dt te groot.
        this._pLeft = 0;
        this._pRight = 0;

        // ---- k-space ----
        const n = new Array(this._N);
        for (let i = 0; i < this._N; i++)
            n[i] = i <= this._N / 2 ? i : i - this._N;

        this._k = n.map(n => 2 * Math.PI * n / L);
        this._omega = this._k.map(k => k * k / 2); // hbar = m = 1
        this._fft = new FFT(this._N);

        this._buildArrows(L);
        this._buildInitialPacket(k0Factor, a);
        this._buildBarrier();
    }

    _buildBarrier({ V0 = 10, a = 1 } = {}) {
        const halfWidth = a;
        for (let i = 0; i < this._N; i++) {
            const x = this._arrows[i].position.x;
            this._V[i] = Math.abs(x) < halfWidth ? V0 : 0;
        }
    }

    _buildArrows(L) {
        for (let i = 0; i < this._N; i++) {
            const x = -L / 2 + i * this._dx;
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
    }

    _buildInitialPacket(k0Factor, a) {
        const kMin = 2 * Math.PI / this._L;
        const k0 = this._k0Factor * kMin;

        for (let i = 0; i < this._N; i++) {
            const x = this._arrows[i].position.x;
            const gauss = Math.exp(-1 * ((x - this._x0) / (2 * this._a)) ** 2);
            const phase = k0 * x;

            this._psi.re[i] = gauss * Math.cos(phase);
            this._psi.im[i] = gauss * Math.sin(phase);
        }

        this._normalize();
        this._fft.transform(this._phi0.re, this._phi0.im, this._psi.re, this._psi.im);
    }

    _normalize() {
        let norm = 0;
        for (let i = 0; i < this._N; i++)
            norm += (this._psi.re[i] * this._psi.re[i] + this._psi.im[i] * this._psi.im[i]) * this._dx;
        norm = Math.sqrt(norm);

        for (let i = 0; i < this._N; i++) {
            this._psi.re[i] /= norm;
            this._psi.im[i] /= norm;
        }
    }

    #updateArrowAt(index) {
        const real = this._psi.re[index];
        const imag = this._psi.im[index];

        this._values[index] = { real, imag };
        const direction = new Vector3(0, imag, real);
        const length = direction.length();
        direction.normalize();
        this._arrows[index].updateAxis(direction.multiplyScalar(length * this._arrowScale));

        const phase = Math.atan2(imag, real);
        const hue = 1 - ((phase + Math.PI) / (2 * Math.PI));
        this._arrows[index].updateColor(new Color().setHSL(hue, 1.0, 0.5));

        return real * real + imag * imag;
    }

    rebuild({ k0Factor, a, x0 }) {
        this._k0Factor = k0Factor;
        this._a = a;
        this._x0 = - this._L / 4;
        this._buildInitialPacket();
        this._buildBarrier();
    }

    _halfPotentialStep(dt) {
        for (let i = 0; i < this._N; i++) {
            const phase = -this._V[i] * dt / 2;
            const cos = Math.cos(phase);
            const sin = Math.sin(phase);

            const re = this._psi.re[i];
            const im = this._psi.im[i];

            this._psi.re[i] = re * cos - im * sin;
            this._psi.im[i] = re * sin + im * cos;
        }
    }

    _kineticStep(dt) {
        for (let i = 0; i < this._N; i++) {
            const phase = -this._omega[i] * dt;
            const cos = Math.cos(phase);
            const sin = Math.sin(phase);

            const re = this._phi.re[i];
            const im = this._phi.im[i];

            this._phi.re[i] = re * cos - im * sin;
            this._phi.im[i] = re * sin + im * cos;
        }
    }

    step(dt) {
        this._halfPotentialStep(dt);
        this._fft.transform(this._phi.re, this._phi.im, this._psi.re, this._psi.im);
        this._kineticStep(dt);
        this._fft.inverseTransform(this._psi.re, this._psi.im, this._phi.re, this._phi.im);
        this._halfPotentialStep(dt);

        for (let i = 0; i < this._N; i++)
            this.#updateArrowAt(i);

        let pLeft = 0;
        let pRight = 0;
        for (let i = 0; i < this._N; i++) {
            const prob = this._psi.re[i] ** 2 + this._psi.im[i] ** 2;
            if (this._arrows[i].position.x < 0)
                pLeft += prob * this._dx;
            else
                pRight += prob * this._dx;
        }

        this._pLeft = pLeft;
        this._pRight = pRight;
    }
}

// Dus fysisch:
//
// breedte = 2a = 2
//
// hoogte = V0 = 10
const barrierHalfWidth = 1;
const V0 = 10;

const geometry = new BoxGeometry(2 * barrierHalfWidth, V0, 0.5);
const material = new MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.3
});

const barrier = new Mesh(geometry, material);
barrier.position.set(0, V0 / 2, 0);
worldGroup.add(barrier);

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
boundingBox.setFromObject(worldGroup);
axesController.createFromBoundingBox(boundingBox);

const plot3D = new Plot3DView(scene, canvas, boundingBox);
plot3D.frame(ThreeJsUtils.scaleBox3(boundingBox, 0.3), {
    viewDirection: new Vector3(.25, 1, 1),
    padding: 0.9
});

function resetWave() {
    time = 0;
    plotData[0] = [];
    plotData[1] = [];
    wave.rebuild(params);
}

const gui = new GUI({ width: "100%", autoPlace: false });
document.getElementById("barrier3dGui").appendChild(gui.domElement);
gui.add(params, "k0Factor", 0, 40, 1)
    .name("k₀ factor")
    .onChange(() => resetWave());

gui.add(params, "a", 0.3, 5, 0.1)
    .name("Width a")
    .onChange(() => resetWave());

gui.add(params, "x0", -10, 10, 0.5)
    .name("Initial position")
    .onChange(() => resetWave());

// Resizing for mobile devices
function resize() {
    ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
    axesController.resize();
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    }
});

const plotData = [
    [], // t
    [], // P_left
    []  // P_right
];

const plot = new uPlot({
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    title: "Expectation value and spreading",
    scales: { x: { time: false }, y: { auto: true } },
    series: [
        {},
        { label: "P_left", stroke: "blue" },
        { label: "P_right", stroke: "green" }
    ],
    axes: [
        { stroke: "#fff", grid: { stroke: "rgba(255,255,255,0.2)" } },
        { stroke: "#fff", grid: { stroke: "rgba(255,255,255,0.2)" } }
    ],
    bg: "transparent"
}, plotData, document.getElementById("expectationPlot"));

let time = 0;
const dt = 0.002;
const maxPoints = 200;
function animate() {
    plot3D.render();
    axesController.render(plot3D.camera);
    if (!running) return;

    for (let subStep = 0; subStep < 5; subStep++)
        wave.step(dt);

    plotData[0].push(time);
    plotData[1].push(wave._pLeft);
    plotData[2].push(wave._pRight);

    time += dt;

    if (plotData[0].length > maxPoints)
        plotData.forEach(arr => arr.shift());

    plot.setData(plotData);
}

plot3D.renderer.setAnimationLoop(animate);