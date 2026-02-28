import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Syntactic helpers
const Array2D = (r, c, value = 0) => [...Array(r)].map(_ => Array(c).fill(value));
const vector = THREE.Vector3;
Number.prototype.between = function (a, b, inclusive) {
    const min = Math.min(a, b),
        max = Math.max(a, b);

    return inclusive ? this >= min && this <= max : this > min && this < max;
}

// Our display
const doubleSlitCanvas = document.getElementById('doubleSlitCanvas');
doubleSlitCanvas.focus();

// GUI controls
document.getElementById("resetButton").addEventListener("click", function(){
    u = [Array2D(dim_x, dim_y), Array2D(dim_x, dim_y), Array2D(dim_x, dim_y)];
    time = 0;
});

let slitSize = 6;
const slider = document.getElementById("slitSizeSlider");
slider.oninput = function () {
    slitSize = Math.ceil(this.value);
    u = [Array2D(dim_x, dim_y), Array2D(dim_x, dim_y), Array2D(dim_x, dim_y)];
    time = 0;
}

//
// Simulation constants
//
const dim_x = 300;
const dim_y = 300;
const dx = 0.07, dy = 0.07;
const dt = .02; //  time step width
const velocitySource = 0.065 / dt / 1.5;
const velocitySourceSquared = velocitySource * velocitySource;

const wall_x = 70;
const color_range = 3;
const floor = -0.5;

const dx_2 = dx * dx;
const dy_2 = dy * dy;
const pi_2 = Math.PI / 2;

let u = [Array2D(dim_x, dim_y), Array2D(dim_x, dim_y), Array2D(dim_x, dim_y)];  // The 3D simulation grid

//
// Class definitions
//
class Surface {
    constructor() {
        this.geometry = new THREE.PlaneGeometry(2, 2, dim_x, dim_y).toNonIndexed();
        const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });

        const colours = [];
        const position = this.geometry.attributes.position;
        const numVertices = position.count;
        for (let i = 0; i < numVertices; i++)
            colours.push(0, 0, 0);
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));

        this.surface = new THREE.Mesh(this.geometry, material);
        scene.add(this.surface);

    }

    colour(x, range) {
        const red = Math.max(0, Math.min(510 / range * x, 255))
        const blue = Math.max(0, Math.min(510 - 510 / range * x, 255))
        return x >= wall_x - 1 ? new THREE.Color(0, 0, 0) : new THREE.Color(red / 255, 50 / 255, blue / 255);
    }

    updateColorAt(x, y) {
        const quadIndex = y * dim_x + x;
        const vertexStart = quadIndex * 6;

        const c = this.colour(u[0][x][y] - floor, color_range);
        const colors = this.geometry.attributes.color.array;
        for (let i = 0; i < 6; i++) {
            const idx = (vertexStart + i) * 3;
            colors[idx]     = c.r;
            colors[idx + 1] = c.g;
            colors[idx + 2] = c.b;
        }
    }

    update() {
        for (let x = 0; x < dim_x; x++)
            for (let y = 0; y < dim_y; y++)
                this.updateColorAt(x, y);

        this.geometry.attributes.color.needsUpdate = true;
    }

    rotateX = (angle) => this.surface.rotateX(angle);
    translate = (translationVector) => this.surface.position.copy(translationVector);
}

// Set up scene
const scene = new THREE.Scene();
const doubleSlitCamera = initCamera();
const controls = new OrbitControls(doubleSlitCamera, doubleSlitCanvas);
const doubleSlitRenderer = createRenderer();
window.addEventListener('resize', () => resizeRendererToCanvas(doubleSlitRenderer, doubleSlitCamera));

lights();
const surface = new Surface();
surface.rotateX(7 * Math.PI / 8);
surface.translate(new vector(0, 0, 0));

function initCamera() {
    const camera = new THREE.PerspectiveCamera(70, 1, 1, 1000);
    camera.position.set(0, 0, 1.8);
    return camera;
}

function lights() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
}

function createRenderer() {
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas: doubleSlitCanvas, alpha: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.setAnimationLoop( animate );
    return renderer;
}

function resizeRendererToCanvas(moleculeRenderer, moleculeCamera) {
    const w = doubleSlitCanvas.clientWidth;
    const h = doubleSlitCanvas.clientHeight;

    if (w === 0 || h === 0) return;

    if (doubleSlitCanvas.width !== w || doubleSlitCanvas.height !== h) {
        moleculeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        moleculeRenderer.setSize(w, h, false);
        moleculeCamera.aspect = w / h;
        moleculeCamera.updateProjectionMatrix();
    }
}

function applyBoundaryConditions() {
    for (let m = 1; m < dim_x - 1; m++) {
        u[0][m][0] = u[0][m][1];
        u[0][m][dim_y - 1] = u[0][m][dim_y - 2];
    }

    for (let n = 1; n < dim_y - 1; n++) {
        u[0][0][n] = u[0][1][n];
        u[0][dim_x - 1][n] = u[0][dim_x - 2][n];
    }

    u[0][0][0] = u[0][1][1];
    u[0][0][dim_y - 1] = u[0][1][dim_y - 2];
    u[0][dim_x - 1][0] = u[0][dim_x - 2][1];
    u[0][dim_x - 1][dim_y - 1] = u[0][dim_x - 2][dim_y - 2];
}

function slitCoordinates() {
    const slitDistance = 10;
    const inter1 = dim_y / 2 - slitDistance - slitSize;
    const mid_up = dim_y / 2 - slitDistance;
    const mid_down = dim_y / 2 + slitDistance;
    const inter2 = dim_y / 2 + slitDistance + slitSize - 1;
    return [inter1, inter2, mid_up, mid_down];
}

function placeSlitsAt(x) {
    const coordinates = slitCoordinates();
    const inter1 = coordinates[0],
        inter2 = coordinates[1],
        mid_up = coordinates[2],
        mid_down = coordinates[3];

    for (let n = 0; n < dim_y; n++)
        if (n.between(0, inter1, true) || n.between(mid_up, mid_down, true) || n.between(inter2, dim_y, true)) {
            u[0][x][n] = x - 1;
            u[0][x - 1][n] = u[0][x - 2][n];
            u[0][x + 1][n] = u[0][x + 2][n];
        }

    u[0][x][inter1] =     (u[0][x - 1][inter1] +     u[0][x + 1][inter1] +     u[0][x][inter1 + 1]) / 3;
    u[0][x][mid_up - 1] = (u[0][x - 1][mid_up - 1] + u[0][x + 1][mid_up - 1] + u[0][x][mid_up - 2]) / 3;
    u[0][x][mid_down] =   (u[0][x - 1][mid_down] +   u[0][x + 1][mid_down] +   u[0][x][mid_down + 1]) / 3;
    u[0][x][inter2] =     (u[0][x - 1][inter2] +     u[0][x + 1][inter2] +     u[0][x][inter2 - 1]) / 3;
}

function initialDisturbance() {
    if (time > pi_2) return;
    for (let n = 0; n < dim_y; n++)
        u[0][0][n] = -Math.cos(20 * time) + 1;
}

function centralFiniteDifferenceMethodTimestep() {
    for (let m = 1; m < dim_x - 1; m++)
        for (let n = 1; n < dim_y - 1; n++)
            u[2][m][n] = velocitySourceSquared * ((u[0][m][n - 1] + u[0][m][n + 1] - 2 * u[0][m][n]) / dx_2 + (
                u[0][m - 1][n] + u[0][m + 1][n] - 2 * u[0][m][n]) / dy_2);

    for (let m = 1; m < dim_x - 1; m++)
        for (let n = 1; n < dim_y - 1; n++) {
            u[1][m][n] += u[2][m][n] * dt;
            u[0][m][n] += u[1][m][n] * dt;
        }

    applyBoundaryConditions();
    initialDisturbance();
    placeSlitsAt(wall_x);
}

function updatePixels() {
    centralFiniteDifferenceMethodTimestep();
    surface.update();
}

let time = 0;
function animate() {
    updatePixels();
    controls.update();
    doubleSlitRenderer.render(scene, doubleSlitCamera);
    time += dt;
}
