import {Vector3, Color, PerspectiveCamera, WebGLRenderer, DirectionalLight, Group, Scene,
    Mesh, CylinderGeometry, MeshStandardMaterial} from "three";
import {ThreeJsUtils, Arrow, Sphere} from "../js/three-js-extensions.js";

const canvas = document.getElementById("inertiaCanvas");
const scene = new Scene();

const camera = new PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(2, 2, 4);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

const light = new DirectionalLight(0xffffff, 3);
light.position.set(4, 4, 4);
scene.add(light);

class Cylinder extends Group {
    constructor(R=1, zMin=0, zMax=1) {
        super();

        this._atoms = [];
        this._omega = new Vector3(0, 0, 0);
        for (let z = zMin; z <= zMax; z += 0.1)
            this._createRing(z, R);

        this._momentOfInertia = this._calculateMomentOfInertia(1);
        this._atoms.forEach(atom => this.add(atom));

        // Mark one atom with a different color
        this._atoms[this._atoms.length - 1].material.color = new Color(0xffff00);

        const axisGeom = new CylinderGeometry(0.02, 0.02, 3);
        const axisMat = new MeshStandardMaterial({color: 0x22ff22, roughness: 0.2, metalness: 0.8});
        const axis = new Mesh(axisGeom, axisMat);
        axis.rotation.x = Math.PI / 2;
        this.add(axis);
    }

    _createRing(z, R) {
        const ds = 0.1;
        let theta = 0;

        while (theta < Math.PI * 2) {
            const x = R * Math.cos(theta);
            const y = R * Math.sin(theta);
            this._atoms.push(new Sphere({
                color: 0xff0000,
                position: new Vector3(x, y, z),
                radius: 0.05,
                segments: 16
            }));
            theta += ds / R;
        }
    }

    _calculateMomentOfInertia(mass) {
        const dm = mass / this._atoms.length;
        let momentOfInertia = 0;
        this._atoms.forEach(atom => momentOfInertia += dm * (atom.position.x**2 + atom.position.y**2));
        // console.log("Moment of inertia:", momentOfInertia);
        return momentOfInertia;
    }

    _rotate(dt) {
        const angle = this._omega.length() * dt;
        if (angle <= 0)
            return

        const axis = this._omega.clone().normalize();
        this.rotateOnAxis(axis, angle);
    }

    update(torque, dt) {
        this._omega.add(torque.clone().multiplyScalar(dt / this._momentOfInertia));
        this._rotate(dt);
    }
}

const cylinderRadius = 1
const forceLocation = new Vector3(cylinderRadius, 0, 0);
const forceArrow = new Arrow({
        position: new Vector3().addVectors(forceLocation, new Vector3(0, 0, cylinderRadius * .5)),
        axis: new Vector3(0, 1, 0),
        color: 0x00ffff,
        shaftWidth: 0.05,
        headWidth: 3,
        headLength: 4
    }
);

const cylinderGroup = new Cylinder(cylinderRadius);
scene.add(cylinderGroup, forceArrow);

let t = 0;
const dt = 0.05; // animation speed
const force = (t) => new Vector3(0, Math.cos(t), 0);
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);

    // torque = r x F
    const torque = new Vector3().crossVectors(forceLocation, force(t));
    cylinderGroup.update(torque, dt);
    t += dt;

    forceArrow.axis = force(t);
});
