import {
    Scene, Group, WebGLRenderer, PerspectiveCamera, DirectionalLight, AmbientLight, BoxGeometry,
    MeshStandardMaterial, Mesh, Vector3
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeJsUtils } from "../js/three-js-extensions.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import {
    CubesSurface, SurfaceColorMapper, RenderableSurface, PointsSurface, SpheresSurface, CapsulesSurface,
    ConesSurface, ShaderSurface, PlaneSurface
} from "../js/3d-surface-components.js";

const canvas = document.getElementById("canvas");
const overlay = document.getElementById("poolOverlayText");
const scene = new Scene();

const camera = new PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(1.75, 1.5, 4.0);

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

const controls = new OrbitControls(camera, renderer.domElement);

window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
})
let running = false
canvas.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    } else {
        ThreeJsUtils.showOverlayMessage(overlay, "Reset");
        wave.reset();
        time = 0;
    }
});

scene.add(new AmbientLight(0xffffff, .4));
const light = new DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

class Wave {
    constructor(nx, ny, size) {
        this._numVerticesX = nx;
        this._numVerticesY = ny;
        this.vertexDistance = size;

        this._dx = size / (nx - 1);
        this._dy = size / (ny - 1);

        const c = 1.5;
        const dt = 0.4 * this._dx / c;

        this._r = (c * dt / this._dx) * (c * dt / this._dy);

        this.minHeight = -0.2;
        this.maxHeight = 0.2;

        this._old = [];
        this._next = [];
        this._current = [];
        this.reset();
    }

    reset() {
        this._old = Array.from({ length: this._numVerticesX }, () => new Float32Array(this._numVerticesY));
        this._current = Array.from({ length: this._numVerticesX }, () => new Float32Array(this._numVerticesY));
        this._next = Array.from({ length: this._numVerticesX }, () => new Float32Array(this._numVerticesY));
    }

    get amplitudes() { return this._current }
    get numVerticesX() { return this._numVerticesX; }
    get numVerticesY() { return this._numVerticesY; }

    _shiftBuffers() {
        let temp = this._old;
        this._old = this._current;
        this._current = this._next;
        this._next = temp;
    }

    update(obstacle, damping = 0.9995) {
        const boxStart = 1;
        const boxWidth = 2;
        const boxYstart = 1;
        const boxYend = 1;

        for (let i = 1; i < this._numVerticesX - 1; i++)
            for (let j = 1; j < this._numVerticesY - 1; j++) {
                if (boxStart <= i && boxStart <= boxStart + boxWidth && boxYstart <= j && boxYstart <= boxYend) {
                    // Inside the box, create a wave disturbance, putting the amplitude on the same
                    this._next[i][j] = .05 * obstacle.speed() * Math.sin(2 * Math.PI * i); // just the x spacial coordinates this time
                    //self._surface[i][j].visible = false;
                } else {
                    //self._surface[i][j].visible = true;
                    this._next[i][j] = 2 * this._current[i][j] - this._old[i][j] + this._r * (
                        this._current[i + 1][j] + this._current[i - 1][j] + this._current[i][j + 1] + this._current[i][j - 1] - 4 * this._current[i][j]
                    ) * damping;
                }
            }

        this._shiftBuffers();
    }

    disturb() {
        const x = Math.floor(this._numVerticesX / 5);
        const y = Math.floor(this._numVerticesY / 5);

        this._current[x][y] += 0.95;
    }

    normalAt(i, j) {
        const clampX = (x) => Math.max(0, Math.min(x, this._numVerticesX - 1));
        const clampY = (y) => Math.max(0, Math.min(y, this._numVerticesY - 1));

        const hL = this._current[clampX(i - 1)][j];
        const hR = this._current[clampX(i + 1)][j];
        const hD = this._current[i][clampY(j - 1)];
        const hU = this._current[i][clampY(j + 1)];

        const dHx = (hR - hL) / (2 * this._dx);
        const dHy = (hU - hD) / (2 * this._dy);

        return new Vector3(-dHx, 1.0, -dHy).normalize();
    }
}

class Obstacle {
    constructor(xRange, yRange) {
        this._obstacle = [];
        this._createObstacle(xRange, yRange);
    }

    _createObstacle(xRange, yRange) {
        for (let i = Math.floor(xRange / 3); i < 2 * Math.floor(xRange / 3); i++)
            for (let j = Math.floor(yRange / 3); j < 2 * Math.floor(yRange / 3); j++)
                this._obstacle[i][j] = true;

        // # Create a green rectangle for the obstacle region
        // obstacle_width = (2 * len(x) // 3 - len(x) // 3) * dx
        // obstacle_height = (2 * len(y) // 3 - len(y) // 3) * dy
        // obstacle_center_x = (len(x) // 3 + (2 * len(x) // 3 - len(x) // 3) / 2) * dx
        // obstacle_center_y = (len(y) // 3 + (2 * len(y) // 3 - len(y) // 3) / 2) * dy
        // # The visuals
        // obstacle_box = box(pos=vector(obstacle_center_x, obstacle_center_y, 0),
        //     size=vector(obstacle_width, obstacle_height, 1),
        //     color=color.green,
        //     opacity=0.8)

    }

    contains = (x, y) => this._obstacle(x, y);

    speed = () => 0;
}

class Pool extends Group {
    constructor(Lx, Ly) {
        super();

        const wallMaterial = new MeshStandardMaterial({ color: 0xffff00 });
        const waterMaterial = new MeshStandardMaterial({
            color: 0x0099ff,
            transparent: true,
            opacity: .5
        });

        const depth = .3;
        const thickness = .05;

        const water = new Mesh(new BoxGeometry(Lx, depth, Ly), waterMaterial);
        water.position.y = -depth / 2;
        this.add(water);

        const back = new Mesh(new BoxGeometry(Lx, .65, thickness), wallMaterial);
        back.position.set(0, -.15, -Ly / 2);
        this.add(back);

        const left = new Mesh(new BoxGeometry(thickness, .65, Ly), wallMaterial);
        left.position.set(-Lx / 2, -0.15, 0);
        this.add(left);

        const right = left.clone();
        right.position.x = Lx / 2;
        this.add(right);

        const bottom = new Mesh(new BoxGeometry(Lx, thickness, Ly), wallMaterial);
        bottom.position.y = -depth;
        this.add(bottom);
    }
}

const wave = new Wave(250, 250, 4);
let colorMapper = new SurfaceColorMapper(SurfaceColorMapper.Mode.WATER);
let surface = new PointsSurface(wave, colorMapper, { radius: 0.025 });
scene.add(surface);
surface.update();
const pool = new Pool(4, 4)
scene.add(pool)
const obstacle = new Obstacle();

class ControlsGui {
    constructor() {
        const gui = new GUI({ width: "100%", autoPlace: false });

        const params = {
            colorMap: SurfaceColorMapper.Mode.WATER,
            surfaceType: RenderableSurface.Type.PLANE
        }

        gui.add(params, 'colorMap', Object.values(SurfaceColorMapper.Mode))
            .name("Color map")
            .onChange(value => {
                colorMapper = new SurfaceColorMapper(value);
                surface.colorMapper = colorMapper;
            });

        gui.add(params, 'surfaceType', Object.values(RenderableSurface.Type))
            .name("Surface type")
            .onChange(value => {
                scene.remove(surface);
                switch (value) {
                    case RenderableSurface.Type.SPHERES:
                        surface = new SpheresSurface(wave, colorMapper, { radius: 0.0075 });
                        break;
                    case RenderableSurface.Type.CAPSULES:
                        surface = new CapsulesSurface(wave, colorMapper, { radius: 0.0050, height: 0.025});
                        break;
                    case RenderableSurface.Type.POINTS:
                        surface = new PointsSurface(wave, colorMapper, { radius: 0.025 });
                        break;
                    case RenderableSurface.Type.SHADER:
                        surface = new ShaderSurface(wave, colorMapper);
                        break;
                    case RenderableSurface.Type.PLANE:
                        surface = new PlaneSurface(wave, colorMapper);
                        break;
                    case RenderableSurface.Type.CONES:
                        surface = new ConesSurface(wave, colorMapper, { radius: 0.0075, height: 0.03});
                        break;
                    case RenderableSurface.Type.CUBES:
                        surface = new CubesSurface(wave, colorMapper, {blockSize: 0.01});
                        break;
                }
                surface.update();
                scene.add(surface);
            });

        document.getElementById("poolControls").appendChild(gui.domElement);
    }
}

new ControlsGui();

let time = 0;
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    controls.update();
    if (!running)
        return;

    wave.update(obstacle); wave.update(obstacle); wave.update(obstacle);

    if (Math.abs(time - .25) < .01)
        wave.disturb();

    surface.update();
    time += .01;
});

