import { DirectionalLight, AmbientLight, Scene, PerspectiveCamera, WebGLRenderer, Color, Vector3 } from "three";
import { CubesSurface, SurfaceColorMapper, RenderableSurface, PointsSurface, SpheresSurface, CapsulesSurface,
    ConesSurface, ShaderSurface, PlaneSurface } from "../js/3d-surface-components.js";
import {ThreeJsUtils} from "../js/three-js-extensions.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.getElementById("raindropsCanvas");
const scene = new Scene();

const camera = new PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(7.75, 2, 2.25);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({antialias: true, alpha: true, canvas: canvas});
renderer.setAnimationLoop(animate);
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
const controls = new OrbitControls( camera, canvas );

const light = new DirectionalLight(0xffffff, 2);
light.position.set(10, 5, 5);
scene.add(light);
scene.add(new AmbientLight(0xffffff, 0.4));

class Wave {
    constructor({
                    numVerticesX=250,
                    numVerticesY=250,
                    vertexDistance=10,
                    disturbanceIntensity=0.5
                } = {}) {
        this._numVerticesX = numVerticesX;
        this._numVerticesY = numVerticesY;
        this._vertexDistance = vertexDistance;
        this._old = [];
        this._current = [];
        this._next = [];
        this._disturbanceIntensity = disturbanceIntensity;

        this._dx = vertexDistance / (this._numVerticesX - 1);
        this._dy = vertexDistance / (this._numVerticesY - 1);
        const c = 1.5;                      // propagation velocity
        const dt = 0.4 * this._dx / c;      // stable timestep
        this._r = (c * dt / this._dx) * (c * dt / this._dy);
        this._init(numVerticesX, numVerticesY);
    }

    get numVerticesX() { return this._numVerticesX; }
    get numVerticesY() { return this._numVerticesY; }
    get amplitudes() { return this._current; }
    get vertexDistance() { return this._vertexDistance; }
    get minHeight() { return -this._disturbanceIntensity * .5; }
    get maxHeight() { return this._disturbanceIntensity * .5; }

    _init(numVerticesX, numVerticesY) {
        this._old = Array.from({length: numVerticesX}, () => new Float32Array(numVerticesY));
        this._current = Array.from({length: numVerticesX}, () => new Float32Array(numVerticesY));
        this._next = Array.from({length: numVerticesX}, () => new Float32Array(numVerticesY));
    }

    update(damping=0.995) {
        for(let i=1;i< this._numVerticesX-1;i++)
            for(let j=1;j< this._numVerticesY-1;j++) {
                this._next[i][j] = 2 * this._current[i][j] - this._old[i][j] + this._r * (
                    this._current[i + 1][j] + this._current[i - 1][j] + this._current[i][j + 1] + this._current[i][j - 1] - 4 * this._current[i][j]
                );
                this._next[i][j] *= damping;
            }

        // shift buffers
        let temp = this._old;
        this._old = this._current;
        this._current = this._next;
        this._next = temp;
    }

    normalAt(i, j) {
        const hL = this._current[i-1][j];
        const hR = this._current[i+1][j];
        const hD = this._current[i][j-1];
        const hU = this._current[i][j+1];

        const dHx = (hR - hL) / (2 * this._dx);
        const dHy = (hU - hD) / (2 * this._dy);

        const normal = new Vector3(-dHx, 1.0, -dHy).normalize();
        return normal;
    }

    placeRaindrop(disturbanceIntensity, sigma=0.015) {
        this._disturbanceIntensity = disturbanceIntensity ? disturbanceIntensity : this._disturbanceIntensity;
        const x = Math.floor(2 + Math.random() * (this._numVerticesX - 4));
        const y = Math.floor(2 + Math.random() * (this._numVerticesY - 4));
        const sigma2 = this._numVerticesX * sigma * this._numVerticesY * sigma;

        for (let i = x - 2; i <= x + 2; i++)
            for (let j = y - 2; j <= y + 2; j++) {
                const dx = i - x;
                const dy = j - y;
                const value = this._disturbanceIntensity * Math.exp(-(dx * dx + dy * dy) / sigma2);
                this._current[i][j] = value;
                this._old[i][j] = value;
            }
    }
}

const params = {
    frequency: 5,
    intensity: .5,
    colorMap: SurfaceColorMapper.Mode.WATER_ALTERNATIVE,
    surfaceType: RenderableSurface.Type.PLANE
};
class ControlsGui {
    constructor() {
        const gui = new GUI({width: "100%", autoPlace: false});
        document.getElementById("raindropsGui").appendChild(gui.domElement);

        gui.add(params, "frequency", 0, 10, 0.1).name("Frequency");
        gui.add(params, "intensity", 0.01, 1, 0.01).name("Intensity");
        gui.add(params, 'colorMap', Object.values(SurfaceColorMapper.Mode))
            .name("Color map")
            .onChange(value => {
                colorMapper = new SurfaceColorMapper(value);
                surface.colorMapper = colorMapper;
            });

        gui.add(params, 'surfaceType', Object.values(RenderableSurface.Type)).name("Surface type").onChange(value => {
            scene.remove(surface);
            switch (value) {
                case RenderableSurface.Type.SPHERES:
                    surface = new SpheresSurface(wave, colorMapper, {radius: 0.02});
                    break;
                case RenderableSurface.Type.CAPSULES:
                    surface = new CapsulesSurface(wave, colorMapper);
                    break;
                case RenderableSurface.Type.POINTS:
                    surface = new PointsSurface(wave, colorMapper, {radius: 0.01});
                    break;
                case RenderableSurface.Type.SHADER:
                    surface = new ShaderSurface(wave, colorMapper);
                    break;
                case RenderableSurface.Type.PLANE:
                    surface = new PlaneSurface(wave, colorMapper);
                    break;
                case RenderableSurface.Type.CONES:
                    surface = new ConesSurface(wave, colorMapper);
                    break;
                case RenderableSurface.Type.CUBES:
                    surface = new CubesSurface(wave, colorMapper);
                    break;
            }
            scene.add(surface);
        });

    }
}
new ControlsGui();

const wave = new Wave();
let colorMapper = new SurfaceColorMapper(SurfaceColorMapper.Mode.WATER_ALTERNATIVE);
let surface = new PlaneSurface(wave, colorMapper);
scene.add(surface);

function animate(){
    for (let subStep = 0; subStep < 4; subStep++) {
        wave.update();
        if (subStep % 3 === 0) surface.update();
    }

    surface.update();
    if (Math.random() < params.frequency * .01)
        wave.placeRaindrop(params.intensity);

    renderer.render(scene, camera);
    controls.update();
}
