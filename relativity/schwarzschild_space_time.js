import { Vector3, Line, Scene, Color, Group, AmbientLight, DirectionalLight, Box3, Mesh,
    LineBasicMaterial, BufferGeometry } from "three";
import { Plot3DView, ThreeJsUtils, Ball } from '../js/three-js-extensions.js';
import {
    SurfaceDefinition, SurfaceController, IsoparametricContoursView, Surface,
    CustomColorColorMapper, ViewParameters
} from "../js/3d-surface-components.js";
import { SkyDome, Sun } from '../js/astro-extensions.js';

const canvasContainer = document.getElementById("spaceTimeCanvasWrapper");
const canvas = document.getElementById("spaceTimeCanvas");
const distanceSlider = document.getElementById("distanceSlider");
const orbitButton = document.getElementById("orbitButton");
const overlay = document.getElementById("spaceTimeOverlayText");

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);
// const light = new DirectionalLight(0xffffff, 2)
// light.position.set(5, 5, 5)
// scene.add(light);
// scene.add(new AmbientLight(0xffffff));

class SchwarzschildSurfaceDefinition extends SurfaceDefinition {
    static yOffset = -10;
    static zAsFunctionOf = (r, M) => Math.sqrt(Math.max(0, 8 * M * r - 16 * M * M));
    static surfacePointAt = (r, phi, M) => new Vector3(
        r * Math.cos(phi),
        SchwarzschildSurfaceDefinition.zAsFunctionOf(r, M),
        r * Math.sin(phi)
    );
    static gridPointAt = (r, phi) => new Vector3(
        r * Math.cos(phi),
        SchwarzschildSurfaceDefinition.yOffset,
        r * Math.sin(phi)
    );

    constructor(M) {
        super();
        this.M = M;
    }

    get rMin() { return 2 * this.M }
    get rMax() { return 13 * this.M; }

    sample(u, v, target) {
        const eps = 0.01;
        const r = this.rMin + u * (this.rMax - (this.rMin + eps));
        const phi = v * 2 * Math.PI;

        target.set(
            r * Math.cos(phi),
            SchwarzschildSurfaceDefinition.zAsFunctionOf(r, this.M),
            r * Math.sin(phi)
        );
    }
}

class Comet extends Ball {
    static initialPosition = (distance) =>
        new Vector3(distance, SchwarzschildSurfaceDefinition.zAsFunctionOf(distance, sun.mass), 0);
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

    _derivative(state, M) {
        const t     = state[0];
        const r     = state[1];
        const phi   = state[2];
        const tDot  = state[3];
        const rDot  = state[4];
        const phiDot= state[5];

        const bracket = r - 2 * M;
        if (bracket <= 0.01)
            return [0, 0, 0, 0, 0, 0]; // of clamp

        return [
            tDot,
            rDot,
            phiDot,
            (-M / (r * bracket * bracket)) * tDot * rDot,
            (-M * bracket / (r*r*r)) * tDot*tDot + (M / (r * bracket)) * rDot*rDot + bracket * phiDot*phiDot,
            (-2 / r) * rDot * phiDot
        ];
    }

    _rk4Step(state, M, dt) {
        const f = (s) => this._derivative(s, M);

        const k1 = f(state);

        const s2 = state.map((v,i) => v + 0.5 * dt * k1[i]);
        const k2 = f(s2);

        const s3 = state.map((v,i) => v + 0.5 * dt * k2[i]);
        const k3 = f(s3);

        const s4 = state.map((v,i) => v + dt * k3[i]);
        const k4 = f(s4);

        return state.map((v,i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    }

    updateRealMotion(M, dt) {
        if (!this._isMoving) return;

        if (this._stateVector[1] <= 2*M + 0.01) {
            this.stop();
            return;
        }

        this._stateVector = this._rk4Step(this._stateVector, M, dt);
    }

    update(M, dt) {
        if (!this._isMoving) return;

        // const t = this._stateVector[0] is not used here!
        const r = this._stateVector[1];
        const phi = this._stateVector[2];
        // const tDot = this._stateVector[3] is not used here!
        const rDot = this._stateVector[4];
        const phiDot = this._stateVector[5];
        const bracket = r - 2.0 * M;
        const buff = [0, 0, 0, 0];

        // symmetric midpoint integration (kick-drift-kick structure)

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
        this._stateVector[4] += dt * (M / r_b / (bracket_b * bracket_b) * buff[2] * buff[2] + bracket_b * buff[3] * buff[3]);
        this._stateVector[5] += -dt * (2.0 / r_b * buff[2] * buff[3]);
    }

    get r() { return this._stateVector[1]; }
    get phi() { return this._stateVector[2]; }
    get distance() { return Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z); }
    get isMoving() { return this._isMoving; }

    start() { this._isMoving = true; }
    stop() { this._isMoving = false; }
    reset(distance) {
        this.moveTo(Comet.initialPosition(distance));
        this.disableTrail();
        this.enableTrail({ color: this._color, maxPoints: 1000 });
        this._stateVector = this._startStateVector ? [...this._startStateVector] : null;
        if (this._stateVector) {
            this._stateVector[1] = distance;
        }
    }
}

class Grid extends Group {
    constructor(size = 80, divisions = 20, y = SchwarzschildSurfaceDefinition.yOffset, color = 0x00ff00) {
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
worldGroup.add(grid);
const skyDome = new SkyDome({starDensity: 1, skyRadius: 500, glowStarCount: 500});
worldGroup.add(skyDome);

const sunRadius = 7;
const sun = new Sun({
    "name": "sun",
    "radius": 1,
    "mass": 5.0,
    "spin": 3600 * 2.8653290845717256e-06,
    "tilt": 0.1265363707695889
}, 1 / sunRadius);
sun.position.set(0, SchwarzschildSurfaceDefinition.yOffset, 0);
worldGroup.add(sun);

function createStateVector(isOrbit) {
    const t = 0;
    const r = Number(distanceSlider.value);
    const phi = 0;
    const tDot = 1 / Math.sqrt(1 - 3 * sun.mass / r);
    const phiDot = isOrbit ? Math.sqrt(sun.mass) / (r ** 1.5 * Math.sqrt(1 - 3 * sun.mass / r)) : 0.489374;
    const rDot = isOrbit ? 0 : -25.2;
    return [t, r, phi, tDot, rDot, phiDot];
}

// Comets
const comet = new Comet(scene, {
    position: Comet.initialPosition(Number(distanceSlider.value)),
    radius: 1.75,
    color: new Color(0x00ffff),
    stateVector: createStateVector(orbitButton.checked)
});

const flatComet = new Comet(scene, {
    position: new Vector3(Number(distanceSlider.value), SchwarzschildSurfaceDefinition.yOffset, 0),
    radius: 1.75,
    color: new Color(0xff0000),
    stateVector: null // important: no own dynamics, just follows comet
});

const realComet = new Comet(scene, {
    position: new Vector3(Number(distanceSlider.value), SchwarzschildSurfaceDefinition.yOffset, 0),
    radius: 1.75,
    color: new Color(0xff8800),
    stateVector: createStateVector(orbitButton.checked)
});

const mathSurface = new Surface(new SchwarzschildSurfaceDefinition(5));
const surfaceParams = new ViewParameters();
const surfaceController = new SurfaceController(
    mathSurface,
    surfaceParams,
    new CustomColorColorMapper(),
    new IsoparametricContoursView(mathSurface)
);
worldGroup.add(surfaceController);
const plot3D = new Plot3DView(scene, canvas, surfaceController.surfaceBoundingBox());
// const gui = new ControlsGui();

// Resizing for mobile devices
const resize = () => ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
resize();

// Event listeners
window.addEventListener("resize", resize);
document.getElementById('gridButton').addEventListener('click',
    () => grid.visible = !grid.visible );
document.getElementById('coneButton').addEventListener('click',
    () => surface.visible = !surface.visible );
distanceSlider.addEventListener('input',
    () => document.getElementById('distanceSliderValue').textContent = distanceSlider.value);
distanceSlider.addEventListener('input', () => {
    realComet.reset(Number(distanceSlider.value));
    comet.reset(Number(distanceSlider.value));
    flatComet.reset(Number(distanceSlider.value));
});
orbitButton.addEventListener('click', (e) => {
    realComet.reset(Number(distanceSlider.value));
    realComet._stateVector = createStateVector(orbitButton.checked);
    comet.reset(Number(distanceSlider.value));
    comet._stateVector = createStateVector(orbitButton.checked);
    flatComet.reset(Number(distanceSlider.value));
    distanceSlider.disabled = orbitButton.checked;
});
window.addEventListener("click", () => {
    if (comet.isMoving) {
        realComet.stop();
        comet.stop();
        ThreeJsUtils.showOverlayMessage(overlay, "Stopped", 500);
    } else {
        realComet.start();
        comet.start();
        ThreeJsUtils.showOverlayMessage(overlay, "Started", 500);
    }
});

plot3D.renderer.setAnimationLoop( (now) => {
    sun.update(now * .025);
    skyDome.update(now * .001, plot3D.camera);
    plot3D.render();

    const subSteps = orbitButton.checked ? 1000 : 20;
    for (let subStep = 0; subStep < subSteps; subStep++) {
        if (mathSurface.definition().rMin < comet.distance && comet.distance < mathSurface.definition().rMax)
            comet.update(sun.mass, 0.001); // 3D geodesic

        realComet.updateRealMotion(sun.mass, 0.001);
    }
    comet.moveTo(SchwarzschildSurfaceDefinition.surfacePointAt(comet.r, comet.phi, sun.mass));
    realComet.moveTo(SchwarzschildSurfaceDefinition.gridPointAt(realComet.r, realComet.phi));
    flatComet.moveTo(new Vector3(comet.position.x, SchwarzschildSurfaceDefinition.yOffset, comet.position.z));
});
