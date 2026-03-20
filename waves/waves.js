import { Group, SphereGeometry, MeshStandardMaterial, CylinderGeometry, Mesh, Vector3, PerspectiveCamera,
    WebGLRenderer, Color, Scene, DirectionalLight, AmbientLight, PCFShadowMap, Fog } from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeJsUtils, Ball, Spring } from "../js/three-js-extensions.js";

console.clear();
const canvas = document.getElementById("wavesCanvas");
const overlay = document.getElementById("wavesOverlayText");
const scene = new Scene();

const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.copy(new Vector3(-5, 2, 8).multiplyScalar(0.8));

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

class TransverseWave extends Group {
    constructor({
                    beadCount = 50,
                    radius = 0.05,
                    frequency = 0.25,
                    amplitude = 0.5
                } = {}) {
        super();

        this._beads = [];
        this._springs = [];

        this.frequency = frequency;
        this.amplitude = amplitude;
        this._springsVisible = false;

        for (let i = 0; i < beadCount; i++) {
            const ball = new Ball(this, {
                position: new Vector3(i * 0.2, 0, 0),
                radius,
                color: 0x00ff00
            });

            this._beads.push(ball);

            const spring = new Spring(this,
                ball.position.clone(),
                new Vector3(0, 0, 0),
                { visible: false }
            );

            this._springs.push(spring);
        }

        this._beads[0]._sphere.color = new Color(0xff0000);
    }

    update(time, t0) {
        const omega = 2 * Math.PI * this.frequency;

        for (let i = 0; i < this._beads.length; i++) {
            const bead = this._beads[i];
            const spring = this._springs[i];

            const x = bead.position.x;
            const phase = x * this.frequency;

            if (phase <= (time - t0)) {
                const y = this.amplitude * Math.sin(omega * (time - phase));

                bead.moveTo(new Vector3(x, y, 0));

                // spring update
                const anchor = new Vector3(x, y > 0 ? -0.05 : 0.05, 0);
                spring.moveTo(anchor);
                spring.updateAxis(bead.position.clone().sub(anchor));
                spring.visible = this._springsVisible;
            }
        }
    }

    reset() {
        for (let i = 0; i < this._beads.length; i++) {
            const x = i * 0.2;
            this._beads[i].moveTo(new Vector3(x, 0, 0));
            this._springs[i].visible = false;
        }
    }

    setSpringsVisible(v) {
        this._springsVisible = v;
    }
}

class LongitudinalWave extends Group {
    constructor({
                    beadCount = 50,
                    rows = 5,
                    radius = 0.03,
                    frequency = 0.25,
                    amplitude = 0.2
                } = {}) {
        super();

        this._beads = [];
        this.frequency = frequency;
        this.amplitude = amplitude;

        for (let i = 0; i < beadCount; i++) {
            const row = [];

            for (let j = 0; j < rows; j++) {
                const ball = new Ball(this, {
                    position: new Vector3(i * 0.2, j * 0.15 + 1, 0),
                    radius,
                    color: i === 0 ? 0xff0000 : 0x00ff00
                });

                row.push(ball);
            }

            this._beads.push(row);
        }
    }

    update(time, t0) {
        const omega = 2 * Math.PI * this.frequency;

        for (let i = 0; i < this._beads.length; i++) {
            const row = this._beads[i];
            const x0 = i * 0.2;
            const phase = x0 * this.frequency;

            if (phase <= (time - t0)) {
                const dx = this.amplitude * Math.sin(omega * (time - phase));

                for (const bead of row)
                    bead.moveTo(new Vector3(x0 + dx, bead.position.y, 0));
            }
        }
    }

    reset() {
        for (let i = 0; i < this._beads.length; i++)
            for (let j = 0; j < this._beads[i].length; j++) {
                const bead = this._beads[i][j];
                bead.moveTo(new Vector3(i * 0.2, j * 0.15 + 1, 0));
            }
    }
}


const transverse = new TransverseWave();
const longitudinal = new LongitudinalWave();

scene.add(transverse);
scene.add(longitudinal);

let paused = true;
canvas.addEventListener("click", () => {
    ThreeJsUtils.showOverlayMessage(overlay, paused ? "Started" : "Paused");
    paused = !paused;
});

let t = 0;
let t0 = 0;
renderer.setAnimationLoop((time) => {
    controls.update();
    renderer.render(scene, camera);

    if (paused) return;

    // console.log("camera.position:", camera.position);
    // console.log("controls.target:", controls.target);
    // camera.position: Vector3 { x: -6.12, y: 3.45, z: 8.91 }
    // controls.target: Vector3 { x: 0.2, y: 1.1, z: -2.3 }

    const dt = 0.01;

    transverse.update(t, t0);
    longitudinal.update(t, t0);

    t += dt;
});

function reset() {
    t = 0;
    t0 = 0;

    transverse.reset();
    longitudinal.reset();
}