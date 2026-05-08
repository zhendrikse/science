import { Scene, PerspectiveCamera, WebGLRenderer, Vector3, Color, AmbientLight, DirectionalLight, Group } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ArrowField, VectorField, Range, Sphere, Cylinder, ThreeJsUtils} from "../js/three-js-extensions.js";

const canvas = document.getElementById("solenoidCanvas");
const autoRotateCheckbox = document.getElementById("autoRotate");
const fieldStrength = document.getElementById("fieldStrength");
const scene = new Scene();

const worldGroup = new Group();
scene.add(worldGroup);

const renderer = new WebGLRenderer({canvas, antialias: true, alpha: true});
const camera = new PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.copy(new Vector3(40, 20, 60).multiplyScalar(0.8));

const controls = new OrbitControls(camera, canvas);
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

scene.add(new AmbientLight(0xffffff, 1));

const light = new DirectionalLight(0xffffff, 2);
light.position.set(20, 20, 20);
scene.add(light);

const MU0 = 4 * Math.PI * 1e-7;
const CURRENT = 1e8;
const SCALE = 1;
const L = 40;

class Solenoid extends Group {
    constructor({
                    radius = 10,
                    segments = 500,
                    turns = 10,
                    direct = true
                } = {}) {
        super();

        this._segments = [];
        this._points = [];

        for (let i = 0; i < segments; i++) {
            const point = new Vector3(
                L / 2 - i * L / segments,
                radius * Math.cos(2 * Math.PI / segments * turns * i),
                radius * Math.sin(2 * Math.PI / segments * turns * i)
            );

            this._points.push(point);

            const marker = new Sphere({
                position: point,
                radius: 0.12,
                color: 0x44ffff
            });

            this.add(marker);
        }

        for (let i = 0; i < this._points.length - 1; i++) {
            const p1 = this._points[i];
            const p2 = this._points[i + 1];

            const axis = direct
                ? p2.clone().sub(p1)
                : p1.clone().sub(p2);

            const midpoint = p1.clone()
                .add(p2)
                .multiplyScalar(0.5);

            const segment = new Cylinder({
                position: midpoint,
                axis,
                radius: 0.4,
                color: new Color("yellow")
            });

            this._segments.push(segment);
            this.add(segment);
        }
    }

    fieldAt(position) {
        const field = new Vector3();

        for (const segment of this._segments) {
            const r = position.clone().sub(segment.position);
            const r2 = r.lengthSq();
            if (r2 < 1e-6)
                continue;

            const contribution = segment.axis.clone()
                .cross(r.clone().normalize())
                .multiplyScalar(MU0 * CURRENT / (4 * Math.PI) * segment.axis.length() / r2);

            field.add(contribution);
        }

        return field;
    }
}

class SolenoidField extends VectorField {
    constructor(solenoid) {
        super();
        this._solenoid = solenoid;
        this._fieldStrength = 1;
    }

    set fieldStrength(value) { this._fieldStrength = value; }

    sample(position) {
        return this._solenoid
            .fieldAt(position)
            .multiplyScalar(this._fieldStrength);
    }
}

const solenoid = new Solenoid({
    radius: 10,
    segments: 500,
    turns: 10
});

const magneticField = new SolenoidField(solenoid);
const arrowField = new ArrowField(
    new Range(-20, 20, 4),
    new Range(-20, 20, 4),
    new Range(-20, 20, 4),
    magneticField,
    {
        scale: SCALE,
        arrowScale: 3,
        round: false
    }
);

worldGroup.add(arrowField, solenoid);

let theta = Math.PI / 2;
let phi = 0;
const R = 60;

function autoRotate() {
    theta += -Math.PI / (7.5 * 100);
    phi += Math.PI / (7.5 * 100) * 2;

    camera.position.set(
        R * Math.sin(theta) * Math.sin(phi),
        R * Math.cos(theta),
        R * Math.sin(theta) * Math.cos(phi)
    );

    camera.lookAt(0, 0, 0);
}

renderer.setAnimationLoop(() => {
    controls.update();
    if (autoRotateCheckbox.checked)
        autoRotate();
    renderer.render(scene, camera);
});

fieldStrength.addEventListener("input", () => {
    magneticField.fieldStrength = Number(fieldStrength.value);
    arrowField.updateFieldWith(magneticField);
});