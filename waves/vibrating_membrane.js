import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { Scene, Group, Box3, Vector3 } from "three";
import { CubesSurface, SurfaceColorMapper, RenderableSurface, PointsSurface, SpheresSurface, CapsulesSurface,
    ConesSurface, ShaderSurface } from "../js/3d-surface-components.js";
import { AxesController, ThreeJsUtils, Plot3DView, AxesParameters } from '../js/three-js-extensions.js';

const canvasContainer = document.getElementById("membraneWrapper");
const canvas = document.getElementById("membraneCanvas");

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

const axesParameters = new AxesParameters({annotations: false});
const params = {
    axesParameters: axesParameters,
    omega: Math.PI,
    normalMode: 1,
    surfaceType: RenderableSurface.Type.SPHERES,
    colorMap: SurfaceColorMapper.Mode.RDYLBU_COLOR_MAP
};

class ControlsGui {
    constructor(membrane) {
        const gui = new GUI({width: "100%", autoPlace: false});
        this._membrane = membrane;

        gui.add(params, 'colorMap', Object.values(SurfaceColorMapper.Mode))
            .name("Color map")
            .onChange(value => {
                colorMapper = new SurfaceColorMapper(value);
                surface.colorMapper = colorMapper;
            });

        gui.add(params, 'normalMode', Object.values(Membrane.Mode))
            .name("Normal mode")
            .onChange(value => this._membrane.normalMode = value);

        gui.add(params, 'surfaceType', Object.values(RenderableSurface.Type))
            .name("Surface type")
            .onChange(value => {
                worldGroup.remove(surface);
                switch (value) {
                    case RenderableSurface.Type.SPHERES:
                        surface = new SpheresSurface(this._membrane, colorMapper);
                        break;
                    case RenderableSurface.Type.CAPSULES:
                        surface = new CapsulesSurface(this._membrane, colorMapper);
                        break;
                    case RenderableSurface.Type.POINTS:
                        surface = new PointsSurface(this._membrane, colorMapper);
                        break;
                    case RenderableSurface.Type.SHADER:
                        surface = new ShaderSurface(this._membrane, colorMapper);
                        break;
                    case RenderableSurface.Type.PLANE:
                        surface = new PlaneSurface(this._membrane, colorMapper);
                        break;
                    case RenderableSurface.Type.CONES:
                        surface = new ConesSurface(this._membrane, colorMapper);
                        break;
                    case RenderableSurface.Type.CUBES:
                        surface = new CubesSurface(this._membrane, colorMapper);
                        break;
                }
                worldGroup.add(surface);
            });

        this.#createAxesFolder(gui);
        document.getElementById("membraneControls").appendChild(gui.domElement);
    }


    #createAxesFolder(parentFolder) {
        const axesFolder = parentFolder.addFolder("Axes");
        const dummyToggle = {gridPlanes: true};
        axesFolder.add(params.axesParameters, 'frame')
            .name("Frame").onChange(value => axesController.updateSettings());
        axesFolder.add(dummyToggle, 'gridPlanes')
            .name("Layout").onChange(value => {
            params.axesParameters.xyPlane = value;
            params.axesParameters.xzPlane = value;
            params.axesParameters.yzPlane = value;
            axesController.updateSettings();
        });
        axesFolder.add(params.axesParameters, 'annotations')
            .name("Annotations").onChange(value => axesController.updateSettings());
        axesFolder.close();
    }
}

const axesController = new AxesController({
    parentGroup: worldGroup,
    canvasContainer: canvasContainer,
    axesParameters: params.axesParameters,
    scene: scene
});

class Membrane {
    static Mode = Object.freeze({
        NORMAL_MODE_1: "mode 1",
        NORMAL_MODE_2: "mode 2",
        NORMAL_MODE_3: "mode 3",
        NORMAL_MODE_4: "mode 4"
    });

    constructor({
                    numVerticesX=100,
                    numVerticesY=100,
                    vertexDistance=10,
                    omega=Math.PI,
                    amplitude=2.5
                } = {}) {
        this._numVerticesX = numVerticesX;
        this._numVerticesY = numVerticesY;
        this._vertexDistance = vertexDistance;
        this._omega = omega;
        this._amplitude = amplitude;
        this._waveCountX = 1;
        this._waveCountY = 1;
        this._amplitudes = [new Float32Array(numVerticesX), new Float32Array(numVerticesY)];
        this._f_x_y_t = (x, y, omega, t) => Math.cos(omega * t) *
            Math.sin(Math.PI * x * this._waveCountX / numVerticesX) *
            Math.sin(Math.PI * y * this._waveCountY / numVerticesY);
        this._dx = vertexDistance / numVerticesX;
        this._dy = vertexDistance / numVerticesY;
        this._init();
    }

    set normalMode(normalMode) {
        switch (normalMode) {
            case Membrane.Mode.NORMAL_MODE_1:
                this._waveCountX = 1; this._waveCountY = 1; break;
            case Membrane.Mode.NORMAL_MODE_2:
                this._waveCountX = 2; this._waveCountY = 1; break;
            case Membrane.Mode.NORMAL_MODE_3:
                this._waveCountX = 1; this._waveCountY = 2; break;
            case Membrane.Mode.NORMAL_MODE_4:
                this._waveCountX = 2; this._waveCountY = 2; break;
        }
    }
    set omega(omega) { this._omega = omega; }
    set amplitude(amplitude) { this._amplitude = amplitude; }

    get numVerticesX() { return this._numVerticesX; }
    get numVerticesY() { return this._numVerticesY; }
    get amplitudes() { return this._amplitudes; }
    get vertexDistance() { return this._vertexDistance; }
    get minHeight() { return 5 - this._amplitude; }
    get maxHeight() { return 5 + this._amplitude; }

    _init() {
        const Array2D = (r, c) => [...Array(r)].map(_ => Array(c).fill(0));
        this._amplitudes = Array2D(this._numVerticesX, this._numVerticesY);
    }

    update(t) {
        for (let i = 0; i < this._numVerticesX; i++)
            for (let j = 0; j < this._numVerticesY; j++)
                this._amplitudes[i][j] = 5 + this._amplitude * this._f_x_y_t(i, j, this._omega, t);
    }

    normalAt(i, j) {
        const clampX = (x) => Math.max(0, Math.min(x, this._numVerticesX - 1));
        const clampY = (y) => Math.max(0, Math.min(y, this._numVerticesY - 1));

        const hL = this._amplitudes[clampX(i-1)][j];
        const hR = this._amplitudes[clampX(i+1)][j];
        const hD = this._amplitudes[i][clampY(j-1)];
        const hU = this._amplitudes[i][clampY(j+1)];

        const dHx = (hR - hL) / (2 * this._dx);
        const dHy = (hU - hD) / (2 * this._dy);

        return new Vector3(-dHx, 1.0, -dHy).normalize();
    }
}

const membrane = new Membrane({
    numVerticesX: 100,
    numVerticesY: 100
});
let colorMapper = new SurfaceColorMapper(SurfaceColorMapper.Mode.RDYLBU_COLOR_MAP);
let surface = new SpheresSurface(membrane, colorMapper);
worldGroup.add(surface);

membrane.update(0);
surface.update();

const boundingBox = new Box3();
boundingBox.setFromObject(worldGroup);

// Scale scene according to current surface
axesController.createFromBoundingBox(boundingBox, false);
const plot3D = new Plot3DView(scene, canvas, boundingBox);
plot3D.frame(ThreeJsUtils.scaleBox3(boundingBox, .8), {translationY: -5});
plot3D.renderer.setAnimationLoop( animate );
const gui = new ControlsGui(membrane);

// Resizing for mobile devices
function resize() {
    ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
    axesController.resize();
}
window.addEventListener("resize", resize);
resize();

let t = 0;
const dt = 0.02;
function animate(){
    plot3D.render();
    axesController.render(plot3D.camera);
    membrane.update(t);
    surface.update();
    t += dt;
}
