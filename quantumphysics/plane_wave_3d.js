import { Vector3 } from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OneDimensionalComplexPlaneWave, ThreeSim, OneDimensionalComplexPlaneWave3D } from "../js/threesim.js";

const canvasContainer = document.getElementById("planeWaveContainer");
const canvas = document.getElementById("planeWaveCanvas");

class ControlsGui {
    constructor(planeWave) {
        const gui = new GUI({width: "100%", autoPlace: false});
        gui.add(params, "amplitude", 1, 6, 0.1)
            .name("Amplitude")
            .onChange(value => planeWave.amplitude = value);
        gui.add(params, "omega", 0, 6, 0.1)
            .name("Omega")
            .onChange(value => planeWave.omega = value * Math.PI);
        gui.add(params, "waveNumber", -2/3, 2/3, 0.01)
            .name("Wave number k")
            .onChange(value => planeWave.k = value * Math.PI);


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

const planeWave = new OneDimensionalComplexPlaneWave({
    position: new Vector3(-25, 0, 0),
    amplitude: 5,
    omega: -3 * Math.PI,
    lambda: 15
});

const simulation = new ThreeSim({
    canvas,
    cameraPosition: new Vector3(0, 0, 50)
});

simulation.attach(planeWave.to(new OneDimensionalComplexPlaneWave3D({size: .8, numArrows: 100})));

//
// const gui = new ControlsGui(planeWave);

let time = 0;
const dt = 0.01;
simulation.run(() => {
    planeWave.propagate(time);
    time += dt;
});

