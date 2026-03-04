import { Scene, Color, PerspectiveCamera, WebGLRenderer, BufferAttribute, CanvasTexture,
    BufferGeometry, PointsMaterial, AdditiveBlending, Points, Vector3 } from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import { SkyDome } from '../js/astro-extensions.js';

const G = 6.673e-11;
const SOLAR_MASS = 2e30;

const MIN_SOLAR_MASS = SOLAR_MASS * 0.5;
const MAX_SOLAR_MASS = SOLAR_MASS * 250;
const AVG_SOLAR_MASS = SOLAR_MASS * 3.0;

const DIST_SCALE = 1e20;

const MAX_ORBITAL_RADIUS = DIST_SCALE * 10;
const MIN_ORBITAL_RADIUS = DIST_SCALE * 0.15;

const MILKY_WAY_THICKNESS = DIST_SCALE * 0.9;
const ANDROMEDA_THICKNESS = DIST_SCALE * 0.2;

const NUM_STARS_MW = 1400;
const NUM_STARS_AND = 2800;

const STAR_SIZE = 0.03;

/* =======================
   Utilities
======================= */

// Limit x between lower and upper
function clamp(x, lower, upper) {
    return Math.max(lower, Math.min(upper, x));
}

// Box–Muller
function normalDistribution(mu, sigma) {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * sigma + mu;
}

// Return the acceleration due to gravity on an object.
function gAccel(mass, r) {
    r = Math.max(r, MIN_ORBITAL_RADIUS);
    return G * mass / (r * r);
}

// Calculate acceleration on an object caused by galaxy
function accel(starPos, galaxy) {
    const r = galaxy.position.clone().sub(starPos);
    return r.normalize().multiplyScalar(gAccel(galaxy.mass, r.length()));
}

/* =======================
   Data buffers
======================= */

const TOTAL_STARS = NUM_STARS_MW + NUM_STARS_AND;

const positions  = new Float32Array(3 * TOTAL_STARS);
const velocities = new Float32Array(3 * TOTAL_STARS);
const masses     = new Float32Array(TOTAL_STARS);
const colors     = new Float32Array(3 * TOTAL_STARS);

class Galaxy {
    constructor({ start, num_stars, position, velocity, radius, thickness, color }) {
        this._start = start;
        this._count = num_stars;
        this._position = position.clone();
        this._velocity = velocity.clone();
        this._mass = 0;

        const up = new Vector3(0, 1, 0);

        // Generate all masses
        const sigma_mass = AVG_SOLAR_MASS / 3.0;
        const localMasses = [];

        for (let i = 0; i < num_stars; i++) {
            const m = clamp(
                normalDistribution(AVG_SOLAR_MASS, sigma_mass),
                MIN_SOLAR_MASS,
                MAX_SOLAR_MASS
            );
            localMasses.push(m);
            this._mass += m;
        }

        // Generate all positions
        const sigma_x = radius * 0.1;
        const sigma_y = thickness * 0.1;
        const sigma_z = radius * 0.1;

        const localPositions = [];

        for (let i = 0; i < num_stars; i++) {
            const x = clamp(normalDistribution(0, sigma_x), -radius, radius);
            const y = clamp(normalDistribution(0, sigma_y), -thickness, thickness);
            const z = clamp(normalDistribution(0, sigma_z), -radius, radius);

            const pos = new Vector3(x, y, z);

            if (pos.length() < MIN_ORBITAL_RADIUS)
                pos.setLength(MIN_ORBITAL_RADIUS);

            localPositions.push(pos);
        }

        // Create stars with correct velocity
        for (let i = 0; i < num_stars; i++) {
            const index = start + i;

            const localPosition = localPositions[i];
            const absolutePos = localPosition.clone().add(this._position);

            absolutePos.toArray(positions, 3 * index);

            masses[index] = localMasses[i];

            // v = sqrt(G * M_total / r)
            const orbitalDir = localPosition.clone().cross(up).normalize();
            const speed = Math.sqrt(G * this._mass / localPosition.length());

            const absoluteVelocity =
                orbitalDir.multiplyScalar(speed).add(this._velocity);

            absoluteVelocity.toArray(velocities, 3 * index);

            colors.set([color.r, color.g, color.b], 3 * index);
        }
    }

    update(dt, otherGalaxy) {
        this._velocity.add(accel(this._position, otherGalaxy).multiplyScalar(dt));
        this._position.add(this._velocity.clone().multiplyScalar(dt));
    }

    get position() { return this._position; }
    get mass() { return this._mass; }
    get start() { return this._start; }
    get count() { return this._count; }
}

/* =======================
   Scene setup
======================= */
const canvas = document.getElementById("galacticCollisionCanvas");

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.setAnimationLoop( animate );

const scene = new Scene();
scene.background = new Color(0x05070f);

const camera = new PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
camera.position.set(10, 20, 30);

const controls = new OrbitControls(camera, canvas);
controls.enableRotate = false;
controls.enableZoom   = false;
controls.enablePan    = false;
controls.autoRotate   = false;
controls.enableDamping = false;

/* =======================
   Galaxies
======================= */
const milkyWay = new Galaxy({
    start: 0,
    num_stars: NUM_STARS_MW,
    position: new Vector3(-10, 0, 0).multiplyScalar(DIST_SCALE),
    velocity: new Vector3(0, 0, 0),
    radius: MAX_ORBITAL_RADIUS,
    thickness: MILKY_WAY_THICKNESS,
    color: new Color(0.9, 0.9, 1)
});

const andromeda = new Galaxy({
    start: NUM_STARS_MW,
    num_stars: NUM_STARS_AND,
    position: new Vector3(10, 0, 0).multiplyScalar(DIST_SCALE),
    velocity: new Vector3(0, 9, 0),
    radius: MAX_ORBITAL_RADIUS,
    thickness: ANDROMEDA_THICKNESS,
    color: new Color(0.0, 0.5, 1.0)
});

const skyDome = new SkyDome({
    starDensity: 1,
    skyRadius: 200,
    glowStarCount: 200
});
scene.add(skyDome);

/* =======================
   Points cloud
======================= */
const geometry = new BufferGeometry();
geometry.setAttribute("position", new BufferAttribute(positions, 3));
geometry.setAttribute("color", new BufferAttribute(colors, 3));

const material = new PointsMaterial({
    size: STAR_SIZE,
    vertexColors: true,
    depthWrite: false,
    blending: AdditiveBlending
});

const stars = new Points(geometry, material);
stars.scale.setScalar(1 / DIST_SCALE);
scene.add(stars);

/* =======================
   Animation loop
======================= */

/*
    For performance, we don't use normalize():
    a = G M / r²  · r̂
      = G M · r / r³
 */
const tmpRadius = new Vector3();
function accelFrom(starPos, galaxyPos, galaxyMass) {
    tmpRadius.subVectors(galaxyPos, starPos);
    const radius = Math.max(tmpRadius.length(), MIN_ORBITAL_RADIUS);
    return tmpRadius.multiplyScalar(G * galaxyMass / (radius * radius * radius));
}

let tmpPositionVector = new Vector3();
let tmpVelocityVector = new Vector3();
function updateStars(dt, galaxyA, galaxyB) {
    const galPosA = galaxyA.position;
    const galPosB = galaxyB.position;

    for (let i = galaxyA.start; i < galaxyA.start + galaxyA.count; i++) {
        tmpPositionVector.fromArray(positions, 3 * i);
        tmpVelocityVector.fromArray(velocities, 3 * i);

        tmpVelocityVector.addScaledVector(accelFrom(tmpPositionVector, galPosA, galaxyA.mass), dt);
        tmpVelocityVector.addScaledVector(accelFrom(tmpPositionVector, galPosB, galaxyB.mass), dt);

        tmpPositionVector.addScaledVector(tmpVelocityVector, dt);

        tmpPositionVector.toArray(positions, 3 * i);
        tmpVelocityVector.toArray(velocities, 3 * i);
    }
}

function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

function nextSimulationStep(time, dt=1e16, substeps=10) {
    for (let i = 0; i < substeps; i++) {
        updateStars(dt, milkyWay, andromeda);
        updateStars(dt, andromeda, milkyWay);
        milkyWay.update(dt, andromeda);
        andromeda.update(dt, milkyWay);
    }

    geometry.attributes.position.needsUpdate = true;

    return time;
}

window.addEventListener("resize", resize);

const frame_rate = 20; // updates per second
let lastTime = 0;
function animate(time) {
    if (time - lastTime >= 1000 / frame_rate)
        lastTime = nextSimulationStep(time);

    controls.update();
    skyDome.update(time * .001, camera);
    renderer.render(scene, camera);
}
