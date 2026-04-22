import {
    Scene, Color, PerspectiveCamera, WebGLRenderer, Vector3, BufferGeometry, LineBasicMaterial, Line, Group,
    AmbientLight, DirectionalLight
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SkyDome, Sun } from '../js/astro-extensions.js';
import { Ball, ThreeJsUtils } from "../js/three-js-extensions.js"

const yOffset = -10;

const canvas = document.getElementById("spaceTimeCanvas");
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

camera.position.set(70, 70, 90);
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
        position,
        radius = 1.25,
        color = new Color(0xffff00),
        stateVector = null
    } = {}) {
        super(parent, {
            position: position,
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

    updateRealMotion(M, dt) {
        if (!this._isMoving) return;

        const t     = this._stateVector[0];
        const r     = this._stateVector[1];
        const phi   = this._stateVector[2];
        const tDot  = this._stateVector[3];
        const rDot  = this._stateVector[4];
        const phiDot= this._stateVector[5];
        const bracket = r - 2.0 * M;
        const buff = [0, 0, 0, 0, 0, 0];

        if (r <= 2.0 * M + 0.01) {
            this.stop();
            return;
        }

        // HALF STEP
        buff[1] = r   + 0.5 * dt * rDot;
        buff[2] = phi + 0.5 * dt * phiDot;
        buff[3] = tDot + 0.5 * dt * (-M / r / (bracket*bracket) * tDot * rDot);
        buff[4] = rDot + 0.5 * dt * (
            -M * bracket / (r*r*r) * tDot*tDot +
            M / r / bracket * rDot*rDot +
            bracket * phiDot*phiDot
        );
        buff[5] = phiDot + 0.5 * dt * (-2.0 / r * rDot * phiDot);

        const r_b = buff[1];
        const bracket_b = r_b - 2.0 * M;

        // FULL STEP
        this._stateVector[0] += dt * buff[3]; // t
        this._stateVector[1] += dt * buff[4]; // r
        this._stateVector[2] += dt * buff[5]; // phi
        this._stateVector[3] += -dt * (M / r_b / (bracket_b*bracket_b) * buff[3] * buff[4]);
        this._stateVector[4] += dt * (
            -M * bracket_b / (r_b*r_b*r_b) * buff[3]*buff[3] +
            M / r_b / bracket_b * buff[4]*buff[4] +
            bracket_b * buff[5]*buff[5]
        );
        this._stateVector[5] += -dt * (2.0 / r_b * buff[4] * buff[5]);
        this.moveTo(SchwarzschildSurface.gridPointAt(this._stateVector[1], this._stateVector[2]));
    }

    update(M, dt) {
        if (!this._isMoving) return;

        // const t = this._stateVector[0] is not used here!
        const r = this._stateVector[1];
        const rDot = this._stateVector[3];
        const phi = this._stateVector[2];
        const phiDot = this._stateVector[4];
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
        const bracket_b = r_b - 2.0 * M;
        this._stateVector[1] += dt * buff[2];
        this._stateVector[2] += dt * buff[3];
        this._stateVector[3] += dt * (M / r_b / (bracket_b * bracket_b) * buff[2] * buff[2] + bracket_b * buff[3] * buff[3]);
        this._stateVector[4] += -dt * (2.0 / r_b * buff[2] * buff[3]);

        this.moveTo(SchwarzschildSurface.surfacePointAt(this._stateVector[1], this._stateVector[2], M));
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
            this._stateVector[1] = distance;
    }
}

class SchwarzschildSurface extends Group {
    static zAsFunctionOf = (r, M) => Math.sqrt(Math.max(0, 8 * M * r - 16 * M * M));
    static surfacePointAt = (r, phi, M) => new Vector3(
        r * Math.cos(phi),
        SchwarzschildSurface.zAsFunctionOf(r, M),
        r * Math.sin(phi)
    );
    static gridPointAt = (r, phi) => new Vector3(
        r * Math.cos(phi),
        yOffset,
        r * Math.sin(phi)
    );

    constructor(M) {
        super();
        this._mass = M;

        const createCircleAt = (i) => {
            const r = this.rMin + (i / 14) * (this.rMax - this.rMin);
            this.add(this.#createCircle(r));
        }

        const createRadialLineAt = (i) => {
            const phi = (i / 12) * Math.PI * 2;
            this.add(this.#createRadialLine(phi, this.rMin, this.rMax));
        }

        for (let i = 0; i < 15; i++)
            createCircleAt(i);

        for (let i = 0; i < 12; i++)
            createRadialLineAt(i);
    }

    get mass() { return this._mass; }
    get rMin() { return 2 * this._mass + 0.1; }
    get rMax() { return 13 * this._mass; }

    #createCircle(r, segments = 200) {
        const points = [];

        for (let i = 0; i <= segments; i++) {
            const phi = (i / segments) * Math.PI * 2;
            points.push(SchwarzschildSurface.surfacePointAt(r, phi, this._mass));
        }

        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({ color: 0xffff00 });
        return new Line(geometry, material);
    }

    #createRadialLine(phi, rMin, rMax, segments = 100) {
        const points = [];

        for (let i = 0; i <= segments; i++) {
            const r = rMin + (i / segments) * (rMax - rMin);
            points.push(SchwarzschildSurface.surfacePointAt(r, phi, this._mass));
        }

        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({ color: 0xffff00 });
        return new Line(geometry, material);
    }
}

class Grid extends Group {
    constructor(size = 80, divisions = 20, y = yOffset, color = 0x00ff00) {
        super();

        const step = (size * 2) / divisions;
        for (let i = 0; i <= divisions; i++) {
            const x = -size + i * step;
            const material = new LineBasicMaterial({ color: color });
            this.add(new Line(this.#verticalLine(x, y, size), material));
            this.add(new Line(this.#horizontalLine(x, y, size), material));
        }
    }

    #verticalLine(x, y, size) {
        return new BufferGeometry().setFromPoints([new Vector3(x, y, -size), new Vector3(x, y, size)]);
    }

    #horizontalLine(x, y, size) {
        return new BufferGeometry().setFromPoints([new Vector3(-size, y, x), new Vector3(size, y, x)]);
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
const t = 0;
const r = Number(distanceSlider.value);
const phi = 0;
const rDot = -25.2;
const phiDot = 0.49;
const comet = new Comet(scene, {
    position: Comet.initialPosition(r),
    radius: 1.75,
    color: new Color(0x00ffff),
    stateVector: [t, r, phi, rDot, phiDot]
});

const flatComet = new Comet(scene, {
    position: new Vector3(r, yOffset, 0),
    radius: 1.75,
    color: new Color(0xff0000),
    stateVector: null // important: no own dynamics, just follows comet
});

const tDot = Math.sqrt(
    (1 + (rDot * rDot) / (1 - 2 * sun.mass / r) + r * r * phiDot * phiDot) /
    (1 - 2 * sun.mass / r)
);
const realComet = new Comet(scene, {
    position: new Vector3(r, yOffset, 0),
    radius: 1.75,
    color: new Color(0xff8800),
    stateVector: [t, r, phi, tDot, rDot, phiDot]
});

// Event listeners
window.addEventListener('resize', () => {
    ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
});
document.getElementById('gridButton').addEventListener('click',
    (e) => grid.visible = !grid.visible );
document.getElementById('coneButton').addEventListener('click',
    (e) => surface.visible = !surface.visible );
document.getElementById('distanceSlider').addEventListener('input',
    () => document.getElementById('distanceSliderValue').textContent = distanceSlider.value);
document.getElementById('distanceSlider').addEventListener('input', () => {
    realComet.reset(Number(distanceSlider.value));
    comet.reset(Number(distanceSlider.value));
    flatComet.reset(Number(distanceSlider.value));
});
window.addEventListener("click", () => {
    if (comet.isMoving) {
        realComet.stop();
        comet.stop();
    } else {
        realComet.start();
        comet.start();
    }
});

function animate(now) {
    for (let subStep = 0; subStep < 20; subStep++)
        if (surface.rMin < comet.r && comet.r < surface.rMax) {
            comet.update(sun.mass, 0.001); // 3D geodesic
            realComet.updateRealMotion(sun.mass, 0.001);
            flatComet.moveTo(new Vector3(comet.position.x, yOffset, comet.position.z));
        }

    sun.update(now * .025);
    skyDome.update(now * .001, camera);
    renderer.render(scene, camera);
}
