import { Scene, Color, PerspectiveCamera, Line, BufferGeometry, Float32BufferAttribute, WebGLRenderer,
    LineBasicMaterial, AdditiveBlending } from "three";
import { normalDistribution, randomArbitrary, randomInt } from "../js/math-utils.js";
import {ThreeJsUtils} from "../js/three-js-extensions.js";

const canvas = document.getElementById("harmonographCanvas");

let width = canvas.clientWidth;
let height = canvas.clientHeight;
let mx = 4;

const scene = new Scene();

const camera = new PerspectiveCamera(60, width/height, 0.1, 2000);
camera.position.z = 300;

const renderer = new WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

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

class Harmonograph {
    constructor(depth=width, trail_thickness=0.5, hue_increment=0.159, decay_factor=0.9999, iters=150) {
        this.depth = depth;
        this.iters = iters;
        this.trail_thickness = trail_thickness;
        this.hue_increment = hue_increment;
        this.decay_factor = decay_factor;
        this.lines = [];
    }

    clear() {
        this.lines.forEach(l => scene.remove(l));
        this.lines = [];
    }

    draw() {
        this.clear();

        let [ax1, ax2, xscale] = scale(width);
        let [ay1, ay2, yscale] = scale(height);
        let [az1, az2, zscale] = scale(this.depth);

        let sd = 0.002;

        let fx1 = randomInt(1, mx) + normalDistribution(0, sd);
        let fx2 = randomInt(1, mx) + normalDistribution(0, sd);
        let fy1 = randomInt(1, mx) + normalDistribution(0, sd);
        let fy2 = randomInt(1, mx) + normalDistribution(0, sd);
        let fz1 = randomInt(1, mx) + normalDistribution(0, sd);
        let fz2 = randomInt(1, mx) + normalDistribution(0, sd);

        let px1 = randomArbitrary(0, 2*Math.PI);
        let px2 = randomArbitrary(0, 2*Math.PI);
        let py1 = randomArbitrary(0, 2*Math.PI);
        let py2 = randomArbitrary(0, 2*Math.PI);
        let pz1 = randomArbitrary(0, 2*Math.PI);
        let pz2 = randomArbitrary(0, 2*Math.PI);

        let dt = 0.02;
        let hue = 0;

        for (let j = 0; j < this.iters; j++) {
            let positions = [];
            let colors = [];
            let t = j * this.iters * dt;
            let k = Math.pow(this.decay_factor, j * this.iters);

            for (let i = 0; i < this.iters; i++) {
                let x = xscale * k * (ax1 * Math.sin(t * fx1 + px1) + ax2 * Math.sin(t * fx2 + px2));
                let y = yscale * k * (ay1 * Math.sin(t * fy1 + py1) + ay2 * Math.sin(t * fy2 + py2));
                let z = zscale * k * (az1 * Math.sin(t * fz1 + pz1) + az2 * Math.sin(t * fz2 + pz2));

                positions.push(x, y, z);

                let color = new Color();
                color.setHSL((hue % 360) / 360, 1, 0.5);
                colors.push(color.r, color.g, color.b);

                hue += dt * this.hue_increment * 50;
                t += dt;
                k *= this.decay_factor;
            }

            let geometry = new BufferGeometry();
            geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

            let material = new LineBasicMaterial({
                vertexColors: true,
                linewidth: this.trail_thickness,
                transparent: true,
                opacity: .9,
                blending: AdditiveBlending
            });

            let line = new Line(geometry, material);
            scene.add(line);
            this.lines.push(line);
        }
    }
}

const harmonograph = new Harmonograph();
harmonograph.draw();

window.addEventListener('click', () => harmonograph.draw());

renderer.setAnimationLoop(() => {
    scene.rotation.y += 0.002;
    renderer.render(scene, camera);
});
