import { VectorField, Range, ArrowField, ThreeJsUtils, Charge } from '../js/three-js-extensions.js';
import { Vector3, Scene, DirectionalLight, Group, PerspectiveCamera, AmbientLight, WebGLRenderer, Color } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.getElementById("dipoleCanvas");
const autoRotateCheckbox = document.getElementById("autoRotate");
const scale = 1e15;
const ec = 1.6e-19;

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);
const light = new DirectionalLight(0xffffff, 2)
light.position.set(5, 5, 5)
scene.add(light);
scene.add(new AmbientLight(0xffffff));

const R = 40;
const camera = new PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 500);
camera.position.set(0, 0, R);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, canvas);
const renderer = new WebGLRenderer({antialias: true, alpha: true, canvas: canvas});
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);


export class Dipole extends Group {
    constructor(distance = 1.2e-14, charge = ec) {
        super();

        this._positiveCharge = new Charge({
            position: new Vector3(distance, 0, 0),
            charge: +charge,
            radius: distance * .05,
            color: new Color("red"),
            scale: scale
        });
        this._negativeCharge = new Charge({
            position: new Vector3(-distance, 0, 0),
            charge: -charge,
            radius: distance * .05,
            color: new Color("blue"),
            scale: scale
        });

        this.add(this._positiveCharge, this._negativeCharge);
    }

    fieldAt(position) {
        const field = new Vector3();
        field.add(this._negativeCharge.fieldAt(position));
        field.add(this._positiveCharge.fieldAt(position));
        return field;
    }
}

export class DipoleField extends VectorField {
    constructor(dipole) {
        super();
        this._dipole = dipole;
    }

    sample(position) {
        return this._dipole.fieldAt(position.clone());
    }
}

const dipole = new Dipole(1e-14);
worldGroup.add(dipole);

const arrowField = new ArrowField(
    new Range(-22 / scale, 22 / scale, 2 / scale),
    new Range(-12 / scale, 12 / scale, 2 / scale),
    new Range(-12 / scale, 12 / scale, 2 / scale),
    new DipoleField(dipole),
    {
        scale: scale,
        arrowScale: 1e-9,
        round: false
    }
);

worldGroup.add(arrowField);

let theta = Math.PI / 2;
let phi = 0;
function autoRotate() {
    theta += -Math.PI / (7.5 * 100);
    phi += Math.PI / (7.5 * 100) * 2;

    camera.position.set(
        R * Math.sin(theta) * Math.sin(phi),
        R * Math.cos(theta),
        R * Math.sin(theta) * Math.cos(phi)
    );
}

renderer.setAnimationLoop( () => {
    controls.update();
    renderer.render(scene, camera);

    if (autoRotateCheckbox.checked)
        autoRotate();
});
