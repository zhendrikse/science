import {
    Scene, Color, PerspectiveCamera, WebGLRenderer, Vector3, BufferGeometry, LineBasicMaterial, Line, Group,
    AmbientLight, DirectionalLight
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SkyDome, Sun } from '../js/astro-extensions.js';
import { Ball, ThreeJsUtils } from "../js/three-js-extensions.js"

const yOffset = -10;

const canvas = document.getElementById("spaceTimeCanvas");
const overlay = document.getElementById("spaceTimeOverlayText");
const distanceSlider = document.getElementById("distanceSlider");

const scene = new Scene();
const light = new DirectionalLight(0xffffff, 2)
light.position.set(5, 5, 5)
scene.add(light);
scene.add(new AmbientLight(0xffffff));

const camera = new PerspectiveCamera(
    60,
    canvas.width / canvas.height,
    0.1,
    1000
);

camera.position.set(90, 90, 120);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({ antialias: true, canvas: canvas });
renderer.setAnimationLoop( animate );
// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

const sunRadius = 7;
const sun = new Sun({
    "name": "sun",
    "radius": 1,
    "mass": 5.0,
    "spin": 3600 * 2.8653290845717256e-06,
    "tilt": 0.1265363707695889
}, 1 / sunRadius);
sun.position.set(0, yOffset, 0);

class Comet extends Ball {
    static initialPosition = (distance) =>
        new Vector3(distance, SchwarzschildSurface.zAsFunctionOf(distance, sun.mass), 0);
    constructor(parent, {
        distance,
        radius = 1.25,
        color = new Color(0xffff00),
        stateVector = null
    } = {}) {
        super(parent, {
            position: stateVector ? Comet.initialPosition(distance) : new Vector3(distance, yOffset, 0),
            radius: radius,
            color: color,
            makeTrail: true
        });

        this._stateVector = stateVector ? [...stateVector] : null;
        this._startStateVector = stateVector ? [...stateVector] : null;
        this._color = color;

        this._isMoving = false;
        this.enableTrail({ color: color, maxPoints: 1000 });
    }

    _updateMeshFromSour(M) {
        const r = this._stateVector[0];
        const phi = this._stateVector[1];

        const x = r * Math.cos(phi);
        const z = r * Math.sin(phi);
        const y = SchwarzschildSurface.zAsFunctionOf(r, M);

        this.moveTo(new Vector3(x, y, z));
    }

    update(M, dt) {
        if (!this._isMoving || !this._stateVector) return;

        const r = this._stateVector[0];
        const rDot = this._stateVector[2];
        const phi = this._stateVector[1];
        const phiDot = this._stateVector[3];
        const bracket = r - 2.0 * M;
        const buff = [0, 0, 0, 0];

        // symmetrische midpoint integration (kick-drift-kick structure)

        // ───── HALF STEP ─────
        buff[0] = r + 0.5 * dt * rDot;
        buff[1] = phi + 0.5 * dt * phiDot;
        buff[2] = rDot + 0.5 * dt * (M / r / (bracket * bracket) * rDot * rDot + bracket * phiDot * phiDot);
        buff[3] = phiDot - 0.5 * dt * (2.0 / r * rDot * phiDot);

        // ───── FULL STEP ─────
        const r_b = buff[0];
        const phi_b = buff[1];
        const bracket_b = r_b - 2.0 * M;

        this._stateVector[0] += dt * buff[2];
        this._stateVector[1] += dt * buff[3];
        this._stateVector[2] += dt * (M / r_b / (bracket_b * bracket_b) * buff[2] * buff[2] + bracket_b * buff[3] * buff[3]);
        this._stateVector[3] += -dt * (2.0 / r_b * buff[2] * buff[3]);

        this._updateMeshFromSour(M);
    }

    get r() { return Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z); }
    get isMoving() { return this._isMoving; }

    start() { this._isMoving = true; }
    stop() { this._isMoving = false; }
    reset(distance) {
        this.moveTo(Comet.initialPosition(distance));
        this.disableTrail();
        this.enableTrail({ color: this._color, maxPoints: 1000 });
        this._stateVector = this._startStateVector ? [...this._startStateVector] : null;
        if (this._stateVector)
            this._stateVector[0] = distance;
    }
}

class RealComet extends Ball {
    constructor(parent, { distance, radius = 1.25, color = 0xff8800, stateVector = null } = {}) {
        super(parent, { position: new Vector3(distance, yOffset, 0), radius, color, makeTrail: true });

        // [r, phi, t_dot, r_dot, phi_dot]
        this._stateVector = [...stateVector];
        this._startStateVector = [...stateVector];
        this._isMoving = false;
        this._color = color;
        this.enableTrail({ color: color, maxPoints: 1000 });
    }

    updateReal(M, dt) {
        if (!this._isMoving || !this._stateVector) return;

        const r = this._stateVector[0];
        const phi = this._stateVector[1];
        const tDot = this._stateVector[2];
        const rDot = this._stateVector[3];
        const phiDot = this._stateVector[4];

        const bracket = r - 2.0 * M;
        const buff = [0, 0, 0, 0, 0];

        // ───── HALF STEP ─────
        buff[0] = r + 0.5 * dt * rDot;
        buff[1] = phi + 0.5 * dt * phiDot;
        buff[2] = tDot + 0.5 * dt * (-M / r / (bracket * bracket) * tDot * rDot);
        buff[3] = rDot + 0.5 * dt * (
            -M * bracket / (r ** 3) * tDot * tDot +
            M / r / bracket * rDot * rDot +
            bracket * phiDot * phiDot
        );
        buff[4] = phiDot + 0.5 * dt * (-2.0 / r * rDot * phiDot);

        // ───── FULL STEP ─────
        const r_b = buff[0];
        const bracket_b = r_b - 2.0 * M;

        this._stateVector[0] += dt * buff[3];
        this._stateVector[1] += dt * buff[4];
        this._stateVector[2] += dt * (-M / r_b / (bracket_b * bracket_b) * buff[2] * buff[3]);
        this._stateVector[3] += dt * (
            -M * bracket_b / (r_b ** 3) * buff[2] ** 2 +
            M / r_b / bracket_b * buff[3] ** 2 +
            bracket_b * buff[4] ** 2
        );

        this._stateVector[4] += dt * (-2.0 / r_b * buff[3] * buff[4]);
        this.updateMesh();
    }

    updateMesh() {
        const r = this._stateVector[0];
        const phi = this._stateVector[1];

        const x = r * Math.cos(phi);
        const z = r * Math.sin(phi);

        this.moveTo(new Vector3(x, yOffset, z)); // flat embedding baseline
    }

    start() { this._isMoving = true; }
    stop() { this._isMoving = false; }
    reset(distance) {
        this.moveTo(Comet.initialPosition(distance));
        this.disableTrail();
        this.enableTrail({ color: this._color, maxPoints: 1000 });
        this._stateVector = this._startStateVector ? [...this._startStateVector] : null;
        this._stateVector[0] = distance;
    }
}

class SchwarzschildSurface extends Group {
    static zAsFunctionOf = (r, M) => Math.sqrt(Math.max(0, 8 * M * r - 16 * M * M));

    constructor(M) {
        super();
        this._mass = M;

        const createCircleAt = (i) => {
            const r = this.rMin + (i / 14) * (this.rMax - this.rMin);
            this.add(this.#createCircle(r, M));
        }

        const createRadialLineAt = (i) => {
            const phi = (i / 12) * Math.PI * 2;
            this.add(this.#createRadialLine(phi, this.rMin, this.rMax, M));
        }

        for (let i = 0; i < 15; i++)
            createCircleAt(i);

        for (let i = 0; i < 12; i++)
            createRadialLineAt(i);
    }

    get mass() { return this._mass; }
    get rMin() { return 2 * this._mass + 0.1; }
    get rMax() { return 13 * this._mass; }

    #createCircle(r, M, segments = 200) {
        const points = [];

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI * 2;

            points.push(
                new Vector3(
                    r * Math.cos(t),
                    SchwarzschildSurface.zAsFunctionOf(r, M),
                    r * Math.sin(t)
                )
            );
        }

        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({ color: 0xffff00 });
        return new Line(geometry, material);
    }

    #createRadialLine(phi, rMin, rMax, M, segments = 100) {
        const points = [];

        for (let i = 0; i <= segments; i++) {
            const r = rMin + (i / segments) * (rMax - rMin);

            points.push(
                new Vector3(
                    r * Math.cos(phi),
                    SchwarzschildSurface.zAsFunctionOf(r, M),
                    r * Math.sin(phi)
                )
            );
        }

        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({ color: 0xffff00 });
        return new Line(geometry, material);
    }
}

class Grid extends Group {
    constructor(size = 80, divisions = 20, y = -10, color = 0x00ff00) {
        super();

        const step = (size * 2) / divisions;
        for (let i = 0; i <= divisions; i++) {
            const x = -size + i * step;

            const vertical = new BufferGeometry().setFromPoints([
                new Vector3(x, y, -size),
                new Vector3(x, y, size)
            ]);

            const horizontal = new BufferGeometry().setFromPoints([
                new Vector3(-size, y, x),
                new Vector3(size, y, x)
            ]);

            const material = new LineBasicMaterial({color: color});
            this.add(new Line(vertical, material));
            this.add(new Line(horizontal, material));
        }
    }
}

// Scenery
const grid = new Grid();
scene.add(grid);
const surface = new SchwarzschildSurface(sun.mass);
scene.add(surface);
scene.add(sun);
const skyDome = new SkyDome({starDensity: 1, skyRadius: 500, glowStarCount: 500});
scene.add(skyDome);

// Comets
const phi = 0;
const rDot = -25.2;
const phiDot = 0.49;
const comet = new Comet(scene, {
    distance: Number(distanceSlider.value),
    radius: 1.75,
    color: new Color(0x00ffff),
    stateVector: [Number(distanceSlider.value), phi, rDot, phiDot]
});

const flatComet = new Comet(scene, {
    distance: Number(distanceSlider.value),
    radius: 1.75,
    color: new Color(0xff0000),
    stateVector: null // important: no own dynamics, just projected motion onto plane
});

const tDot = 1;
const realComet = new RealComet(scene, {
    distance: Number(distanceSlider.value),
    radius: 1.75,
    color: new Color(0xff8800),
    stateVector: [Number(distanceSlider.value), phi, tDot, rDot, phiDot]
});

// Event listeners
window.addEventListener('resize', () => {
    ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
});
document.getElementById('gridButton').addEventListener('click', (e) => grid.visible = !grid.visible );
document.getElementById('coneButton').addEventListener('click', (e) => surface.visible = !surface.visible );
window.addEventListener("click", () => {
    if (comet.isMoving) {
        realComet.stop();
        comet.stop();
        realComet.reset(Number(distanceSlider.value));
        comet.reset(Number(distanceSlider.value));
        flatComet.reset(Number(distanceSlider.value));
    } else {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        realComet.start();
        comet.start();
    }
});

function updateFlatMotion() {
    const r = comet._stateVector[0];
    const phi = comet._stateVector[1];

    const x = r * Math.cos(phi);
    const z = r * Math.sin(phi);

    flatComet.moveTo(new Vector3(x, yOffset, z));
}

function animate(now) {
    for (let subStep = 0; subStep < 10; subStep++)
        if (surface.rMin < comet.r && comet.r < surface.rMax) {
            comet.update(sun.mass, 0.001); // 3D geodesic
            realComet.updateReal(sun.mass, 0.001);
        }
    updateFlatMotion();

    sun.update(now * .025);
    skyDome.update(now * .001, camera);
    renderer.render(scene, camera);
}
