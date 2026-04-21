import {
    Scene, Color, PerspectiveCamera, WebGLRenderer, Vector3, BufferGeometry, LineBasicMaterial, Line, Group,
    AmbientLight, DirectionalLight
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SkyDome, Sun } from '../js/astro-extensions.js';
import { Ball, ThreeJsUtils } from "../js/three-js-extensions.js"

const yOffset = -10;
const canvas = document.getElementById("spaceTimeCanvas");
const scene = new Scene();
const light = new DirectionalLight(0xffffff, 2)
light.position.set(5, 5, 5)
scene.add(light);
scene.add(new AmbientLight(0xffffff));

const camera = new PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
);

camera.position.set(90, 90, 120);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({ antialias: true, canvas: canvas });
renderer.setAnimationLoop( animate );
// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
window.addEventListener('resize', () => {
    ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
});

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
    constructor(parent, {
        position,
        radius = 1.25,
        color = new Color(0xffff00),
        sour = null
    } = {}) {
        super(parent, {
            position: position,
            radius: radius,
            color: color,
            makeTrail: true
        });

        this._sour = sour ? [...sour] : null;
        this._startSour = sour ? [...sour] : null;
        this._startPosition = position.clone();

        this._isMoving = false;
    }

    _updateMeshFromSour(M) {
        const r = this._sour[0];
        const phi = this._sour[1];

        const x = r * Math.cos(phi);
        const z = r * Math.sin(phi);
        const y = SchwarzschildSurface.zAsFunctionOf(r, M);

        this.moveTo(new Vector3(x, y, z));
    }

    update(M, dt) {
        if (!this._isMoving || !this._sour) return;

        const r = this._sour[0];
        const rDot = this._sour[2];
        const phi = this._sour[1];
        const phiDot = this._sour[3];
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

        this._sour[0] += dt * buff[2];
        this._sour[1] += dt * buff[3];
        this._sour[2] += dt * (M / r_b / (bracket_b * bracket_b) * buff[2] * buff[2] + bracket_b * buff[3] * buff[3]);
        this._sour[3] += -dt * (2.0 / r_b * buff[2] * buff[3]);

        this._updateMeshFromSour(M);
    }

    get r() { return Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z); }

    start() {
        this._isMoving = true;
    }

    stop() {
        this._isMoving = false;
    }

    reset() {
        this.moveTo(this._startPosition.clone());
        this._sour = this._startSour ? [...this._startSour] : null;
    }
}

class RealComet extends Ball {
    constructor(parent, { position, radius = 1.25, color = 0xff8800, sour = null } = {}) {
        super(parent, { position, radius, color, makeTrail: true });

        // [r, phi, t_dot, r_dot, phi_dot]
        this._sour = sour ? [...sour] : null;
        this._startSour = sour ? [...sour] : null;
        this._isMoving = false;
    }

    updateReal(M, dt) {
        if (!this._isMoving || !this._sour) return;

        const r = this._sour[0];
        const phi = this._sour[1];
        const tDot = this._sour[2];
        const rDot = this._sour[3];
        const phiDot = this._sour[4];

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

        this._sour[0] += dt * buff[3];
        this._sour[1] += dt * buff[4];
        this._sour[2] += dt * (-M / r_b / (bracket_b * bracket_b) * buff[2] * buff[3]);
        this._sour[3] += dt * (
            -M * bracket_b / (r_b ** 3) * buff[2] ** 2 +
            M / r_b / bracket_b * buff[3] ** 2 +
            bracket_b * buff[4] ** 2
        );

        this._sour[4] += dt * (-2.0 / r_b * buff[3] * buff[4]);
        this.updateMesh();
    }

    updateMesh() {
        const r = this._sour[0];
        const phi = this._sour[1];

        const x = r * Math.cos(phi);
        const z = r * Math.sin(phi);

        this.moveTo(new Vector3(x, yOffset, z)); // flat embedding baseline
    }

    start() { this._isMoving = true; }
    stop() { this._isMoving = false; }
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

scene.add(new Grid());
const surface = new SchwarzschildSurface(sun.mass);
scene.add(surface);
scene.add(sun);
const skyDome = new SkyDome({starDensity: 1, skyRadius: 500, glowStarCount: 500});
scene.add(skyDome);

const startR = 31;
const startPos = new Vector3(startR, SchwarzschildSurface.zAsFunctionOf(startR, sun.mass), 0);

const phi = 0;
const rDot = -25.2;
const phiDot = 0.49;
const comet = new Comet(scene, {
    position: startPos,
    radius: 1.25,
    color: new Color(0x00ffff),
    sour: [startR, phi, rDot, phiDot]
});

const flatComet = new Comet(scene, {
    position: new Vector3(startR, yOffset, 0),
    radius: 1.25,
    color: new Color(0xff0000),
    sour: null // important: no own dynamics, just projected motion onto plane
});

const realComet = new RealComet(scene, {
    position: new Vector3(startR, yOffset, 0),
    radius: 1.25,
    color: new Color(0xff8800),
    sour: [startR, 0, 1, -25.2, 0.49]
});

realComet.enableTrail({
    color: 0xff8800,
    maxPoints: 1000
});
comet.enableTrail({
    color: 0x00ffff,
    maxPoints: 1000
});

realComet.start();
comet.start();
scene.add(comet._sphere._mesh);

function updateFlatMotion() {
    const r = comet._sour[0];
    const phi = comet._sour[1];

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
