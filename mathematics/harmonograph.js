import { Scene, Color, PerspectiveCamera, Line, BufferGeometry, Float32BufferAttribute, WebGLRenderer,
    LineBasicMaterial, AdditiveBlending, Group } from "three";
import { normalDistribution, randomArbitrary, randomInt } from "../js/math-utils.js";
import {ThreeJsUtils} from "../js/three-js-extensions.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

const canvas = document.getElementById("harmonographCanvas");
const rotateButton = document.getElementById("rotateButton");

const width = canvas.clientWidth;
const height = canvas.clientHeight;
const mx = 4;

const scene = new Scene();

const camera = new PerspectiveCamera(60, width/height, 0.1, 2000);
camera.position.z = 300;

const renderer = new WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
const controls = new OrbitControls( camera, canvas );

function scale(length) {
    let scale_factor = 5.0;
    let a1, a2, max;
    while (true) {
        a1 = randomInt(-mx, mx);
        a2 = randomInt(-mx, mx);
        max = Math.abs(a1) + Math.abs(a2);
        if (max > 0) break;
    }
    return [a1, a2, length / (scale_factor * max)];
}

class Harmonograph extends Group {
    constructor({
                    depth=width,
                    trail_thickness=0.5,
                    hueIncrement=0.159,
                    decayFactor=0.9999,
                    iters=150} ={}) {
        super();
        this._depth = depth;
        this._iterations = iters;
        this._trailThickness = trail_thickness;
        this._hueIncrement = hueIncrement;
        this._decayFactor = decayFactor;
        this._lines = [];
    }

    clear() {
        this._lines.forEach(line => this.remove(line));
        this._lines = [];
    }

    draw(standardDeviation = 0.002) {
        this.clear();

        const [ax1, ax2, xscale] = scale(width);
        const [ay1, ay2, yscale] = scale(height);
        const [az1, az2, zscale] = scale(this._depth);

        const fx1 = randomInt(1, mx) + normalDistribution(0, standardDeviation);
        const fx2 = randomInt(1, mx) + normalDistribution(0, standardDeviation);
        const fy1 = randomInt(1, mx) + normalDistribution(0, standardDeviation);
        const fy2 = randomInt(1, mx) + normalDistribution(0, standardDeviation);
        const fz1 = randomInt(1, mx) + normalDistribution(0, standardDeviation);
        const fz2 = randomInt(1, mx) + normalDistribution(0, standardDeviation);

        const px1 = randomArbitrary(0, 2 * Math.PI);
        const px2 = randomArbitrary(0, 2 * Math.PI);
        const py1 = randomArbitrary(0, 2 * Math.PI);
        const py2 = randomArbitrary(0, 2 * Math.PI);
        const pz1 = randomArbitrary(0, 2 * Math.PI);
        const pz2 = randomArbitrary(0, 2 * Math.PI);

        const dt = 0.02;
        let hue = 0;

        for (let j = 0; j < this._iterations; j++) {
            const positions = [];
            const colors = [];
            let t = j * this._iterations * dt;
            let k = Math.pow(this._decayFactor, j * this._iterations);

            for (let i = 0; i < this._iterations; i++) {
                const x = xscale * k * (ax1 * Math.sin(t * fx1 + px1) + ax2 * Math.sin(t * fx2 + px2));
                const y = yscale * k * (ay1 * Math.sin(t * fy1 + py1) + ay2 * Math.sin(t * fy2 + py2));
                const z = zscale * k * (az1 * Math.sin(t * fz1 + pz1) + az2 * Math.sin(t * fz2 + pz2));
                positions.push(x, y, z);

                const color = new Color();
                color.setHSL((hue % 360) / 360, 1, 0.5);
                colors.push(color.r, color.g, color.b);

                hue += dt * this._hueIncrement * 50;
                t += dt;
                k *= this._decayFactor;
            }

            let geometry = new BufferGeometry();
            geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

            let material = new LineBasicMaterial({
                vertexColors: true,
                linewidth: this._trailThickness,
                transparent: true,
                opacity: .9,
                blending: AdditiveBlending
            });

            let line = new Line(geometry, material);
            this.add(line);
            this._lines.push(line);
        }
    }
}

const harmonograph = new Harmonograph();
scene.add(harmonograph);
harmonograph.draw();

document.getElementById("generateButton").addEventListener('click', () => harmonograph.draw());

renderer.setAnimationLoop(() => {
    if (rotateButton.checked)
        harmonograph.rotation.y += 0.002;
    controls.update();
    renderer.render(scene, camera);
});
