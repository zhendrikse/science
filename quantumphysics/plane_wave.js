import {Box3, Scene, Color, Group, Vector3} from "three";
import { Arrow, Axes, AxesController, AxesParameters, ThreeJsUtils, Plot3DView } from '../js/three-js-extensions.js';
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const canvasContainer = document.getElementById("planeWaveContainer");
const canvas = document.getElementById("planeWaveCanvas");

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

const params = {
    amplitude: 3,
    omega: 2,
    waveNumber: 0.4,
    axesParameters: new AxesParameters({
        layoutType: Axes.Type.CLASSICAL,
        xyPlane: false,
        yzPlane: false,
        divisions: 10,
        axisLabels: ["X", "Im(Ψ)", "Re(Ψ)"],
        annotations: false})
};

const axesController = new AxesController({
    parentGroup: worldGroup,
    canvasContainer,
    axesParameters: params.axesParameters,
    scene
});

class ControlsGui {
    constructor(planeWave) {
        const gui = new GUI({width: "100%", autoPlace: false});
        gui.add(params, "amplitude", 1, 6, 0.1)
            .name("Amplitude")
            .onChange(value => planeWave.set_amplitude_to(value));
        gui.add(params, "omega", 0, 6, 0.1)
            .name("Omega")
            .onChange(value => planeWave.set_omega_to(value * Math.PI));
        gui.add(params, "waveNumber", -2/3, 2/3, 0.01)
            .name("Wave number k")
            .onChange(value => planeWave.set_k_to(value * Math.PI));


        const axesFolder = gui.addFolder("Axes");
        axesFolder.add(params.axesParameters, 'frame')
            .name("Frame").onChange(value => axesController.updateSettings());
        axesFolder.add(params.axesParameters, 'xzPlane')
            .name("Layout").onChange(value => axesController.updateSettings());
        axesFolder.add(params.axesParameters, 'annotations')
            .name("Annotations").onChange(value => axesController.updateSettings());
        axesFolder.close();

        document.getElementById("gui-container").appendChild(gui.domElement);
    }
}

class PlaneWave extends Group {
    constructor(k=2 * Math.PI / 5, omega=2 * Math.PI, amplitude=3) {
        super();
        this._arrows = [];
        for (let x = -10; x < 10; x += 0.3)
            this._arrows.push(
                new Arrow(new Vector3(x, 0, 0), new Vector3(0, amplitude, 0),
                    {color: 0xff0000, shaftWidth: 0.03, headLength: 6}));
        this._amplitude = amplitude;
        this._k = k;
        this._omega = omega;
        this._arrows.forEach(arrow => this.add(arrow));
    }

    set_k_to = (value) => this._k = value;

    set_omega_to = (value) => this._omega = value;

    set_amplitude_to = (value) => this._amplitude = value;

    update(t) {
        this._arrows.forEach(arrow => {
            const x = arrow.position.x;
            const k = this._k;
            const w = this._omega;
            const phase = k * x - w * t;
            let cycles = phase / (2 * Math.PI);
            cycles -= Math.floor(cycles);
            const cphase = 2 * Math.PI * cycles;

            const y = -Math.sin(phase) * this._amplitude;
            const z = -Math.cos(phase) * this._amplitude;
            arrow.updateAxis(new Vector3(arrow.axis.x, y, z));
            arrow.updateColor(new Color().setHSL(1.0 - cphase / (2 * Math.PI), 1.0, 0.5));
        });
    }
}

const planeWave = new PlaneWave();
worldGroup.add(planeWave);

const boundingBox = new Box3();
boundingBox.setFromObject( worldGroup );

axesController.createFromBoundingBox(boundingBox);

const plot3D = new Plot3DView(scene, canvas, boundingBox);
plot3D.frame(ThreeJsUtils.scaleBox3(boundingBox, .5));
plot3D.renderer.setAnimationLoop(animate);
const gui = new ControlsGui(planeWave);

// Resizing for mobile devices
function resize() {
    ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
    axesController.resize();
}
window.addEventListener("resize", resize);
resize();

let time = 0;
const dt = 0.01;
function animate() {
    planeWave.update(time);
    plot3D.render();
    axesController.render(plot3D.camera);
    time += dt;
}
