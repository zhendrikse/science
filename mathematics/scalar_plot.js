import { Range, AxesParameters, ThreeJsUtils, AxesController, Plot3DView } from '../js/three-js-extensions.js';
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import {  Scene, Color, Group, SphereGeometry, MeshStandardMaterial, Vector3, Mesh, Box3 } from "three";

const canvasContainer = document.getElementById("scalarContainer");
const canvas = document.getElementById("scalarCanvas");

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

const params = {
    axesParameters: new AxesParameters({axisLabels: false}),
    opacity: 0.3,
    radius: 0.1
};

const axesController = new AxesController({
    parentGroup: worldGroup,
    canvasContainer,
    axesParameters: params.axesParameters,
    scene
});

class ControlsGui {
    constructor() {
        const gui = new GUI({width: "100%", autoPlace: false});

        gui.add(params, "opacity", 0, 1, .01).name("Opacity").onChange(value => field.setOpacity(value));
        gui.add(params, "radius", 0, 1, .01).name("Radius").onFinishChange(value => field.setRadius(value));

        const axesFolder = gui.addFolder("Axes");
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

        document.getElementById("gui-container").appendChild(gui.domElement);
    }
}

class Scalar {
    constructor(position, radius, opacity, value) {
        this.position = position;
        this.value = value;
        const geometry = new SphereGeometry(radius, 12, 12);
        const material = new MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: opacity
        });
        this.sphere = new Mesh(geometry, material);
        this.sphere.position.copy(position);
    }

    setColor(color) { this.sphere.material.color.set(color); }
    setOpacity(value) { this.sphere.material.opacity = value; }
    setRadius(radius) {
        this.sphere.geometry.dispose();
        this.sphere.geometry = new SphereGeometry(radius, 12, 12);
    }
}

class ScalarField {
    constructor(range, func) {
        this.scalars = [];
        this.opacity = 0.3;

        for (const x of range)
            for (const y of range)
                for (const z of range) {
                    const position = new Vector3(x, y, z);
                    const value = func(position);
                    const scalar = new Scalar(position, range.stepSize *.25, this.opacity, value);
                    scalar.setColor(this._colorFor(value));
                    this.scalars.push(scalar);
                }
    }

    _colorFor(value) {
        const t = Math.log1p(value * 10);

        const color = new Color();
        color.setHSL(0.66 * (1 - t), 1.0, 0.5);
        return color;
    }
    setOpacity(v) { this.opacity = v; this.scalars.forEach(s => s.setOpacity(v)); }
    setRadius(r) { this.scalars.forEach(s => s.setRadius(r * .25)); }
}



export class ScalarFieldView extends Group {

    constructor(xRange, yRange, zRange, scalarField, {
        scaleFactor = 0.3,
        radius       = 1
    } = {}) {
        super();
        this.positions = [];
        this.xRange = xRange;
        this.yRange = yRange;
        this.zRange = zRange;
        this.scaleFactor = scaleFactor;
        this.scalarField = scalarField;
        this.colorMode = colorMode;

        const shaftGeometry = round ? shaftGeometryRound : shaftGeometrySquare;
        const headGeometry  = round ? headGeometryRound  : headGeometrySquare;
        const shaftMaterial = new MeshStandardMaterial();
        const headMaterial  = new MeshStandardMaterial();

        this.#initializePositions();

        this._shaftMesh = new InstancedMesh(shaftGeometry, shaftMaterial, this.positions.length);
        this._headMesh  = new InstancedMesh(headGeometry,  headMaterial,  this.positions.length);
        this.add(this._shaftMesh, this._headMesh);

        // per-instance color
        const colors = new Float32Array(this.positions.length * 3);
        this._shaftMesh.instanceColor = new InstancedBufferAttribute(colors, 3);
        this._headMesh.instanceColor  = this._shaftMesh.instanceColor;

        // temp objects (no allocations per frame)
        this.tmpMatrix = new Matrix4();
        this.tmpQuaternion = new Quaternion();
        this.tmpScale      = new Vector3();
        this.tmpPosition   = new Vector3();
        this.tmpAxis       = new Vector3();
        this.tmpDirection  = new Vector3();

        // initial build
        this.updateFieldWith(vectorField);
    }

    #collapseArrow(index, position) {
        this.tmpScale.set(0, 0, 0);
        this.tmpMatrix.compose(position, new Quaternion(), this.tmpScale);
        this._shaftMesh.setMatrixAt(index, this.tmpMatrix);
        this._headMesh.setMatrixAt(index, this.tmpMatrix);
    }

    #arrowSizes(axis) {
        const length = axis.length();
        const shaftRadius = length * this._shaftWidth;
        const headLength  = this._headLength * shaftRadius;
        const shaftLength = Math.max(length - headLength, 1e-6);
        return {shaftRadius, shaftLength, headLength};
    }

    #initializePositions() {
        this.positions = [];
        for (const x of this.xRange)
            for (const y of this.yRange)
                for (const z of this.zRange)
                    this.positions.push(new Vector3(x, z, y));
    }

    #magnitudeToColor(magnitude, scalarRange) {
        if (scalarRange.to <= scalarRange.from) return new Color(0x00ffff);

        const t = MathUtils.clamp(scalarRange.scaleValue(magnitude), 0, 1);
        const hue = (1 - t) * 0.66; // Hue: 0.66 (blue) → 0.0 (red)

        return new Color().setHSL(hue, 1.0, 0.5);
    }

    #scalarField() {
        return this.positions.map(position => {
            switch (this.colorMode) {
                case ArrowField.ColorMode.DIVERGENCE:
                    return this.vectorField.divergence(position);
                case ArrowField.ColorMode.CURL:
                    return this.vectorField.curlMagnitude(position);
                default:
                    return this.vectorField.sample(position).length();
            }
        });
    }

    #scalarToColor(value, scalarRange) {
        const t = MathUtils.clamp(
            scalarRange.scaleValue(value) * 2 - 1,
            -1, 1
        );

        if (t < 0) // blue → white
            return new Color().lerpColors(
                new Color(0x0000ff),
                new Color(0xffffff),
                1 + t
            );
        else // white → red
            return new Color().lerpColors(
                new Color(0xffffff),
                new Color(0xff0000),
                t
            );
    }

    #updateShaft(index, position, axis) {
        const {shaftRadius, shaftLength} = this.#arrowSizes(axis);
        this.tmpScale.set(shaftRadius, shaftLength, shaftRadius);
        this.tmpPosition.copy(position).addScaledVector(axis, 0.5);

        this.tmpMatrix.compose(this.tmpPosition, this.tmpQuaternion, this.tmpScale);
        this._shaftMesh.setMatrixAt(index, this.tmpMatrix);
    }

    #updateHead(index, position, axis) {
        const {shaftRadius, headLength} = this.#arrowSizes(axis);
        this.tmpScale.set(
            this._headWidth * shaftRadius,
            headLength,
            this._headWidth * shaftRadius
        );
        this.tmpPosition.copy(position).addScaledVector(axis, 1.0);
        this.tmpMatrix.compose(this.tmpPosition, this.tmpQuaternion, this.tmpScale);
        this._headMesh.setMatrixAt(index, this.tmpMatrix);
    }

    #updateArrowColor(index, axis, scalars, scalarRange) {
        switch (this.colorMode) {
            case ArrowField.ColorMode.DIVERGENCE:
                this._shaftMesh.setColorAt(index, this.#scalarToColor(scalars[index], scalarRange));
                break;
            case ArrowField.ColorMode.CURL:
                if (scalarRange.to - scalarRange.from < 1e-12) {
                    scalarRange.from -= 1;
                    scalarRange.to   += 1;
                }
                const t = MathUtils.clamp(scalarRange.scaleValue(scalars[index]), 0, 1);
                const hue = (1 - t) * 0.66;
                this._shaftMesh.setColorAt(index, new Color().setHSL(hue, 1, 0.5));
                break;
            default:
                const mag = axis.length() / this.scaleFactor;
                this._shaftMesh.setColorAt(index, this.#magnitudeToColor(mag, scalarRange));
        }
    }

    #updateArrowInstance(index, position, axis, scalars, scalarRange) {
        const length = axis.length();
        if (length < 1e-6) {
            this.#collapseArrow(index, position);
            return;
        }

        // rotation: Y-axis → axis direction
        this.tmpDirection.copy(axis).normalize();
        this.tmpQuaternion.setFromUnitVectors(UnitVectorE2, this.tmpDirection);

        this.#updateShaft(index, position, axis);
        this.#updateHead(index, position, axis);
        this.#updateArrowColor(index, axis, scalars, scalarRange);
    }

    changeColorModeTo = (newColorMode) => this.colorMode = newColorMode;

    euler(dt = 0.01) {
        this.positions.forEach(position => position.addScaledVector(this.vectorField.sample(position), dt));
        this.updateFieldWith(this.vectorField);
    }

    reset() {
        this.#initializePositions();
        this.updateFieldWith(this.vectorField);
    }

    updateFieldWith(newVectorField) {
        this.vectorField = newVectorField;

        const scalars = this.#scalarField();
        const scalarRange = new Interval(Math.min(...scalars), Math.max(...scalars));
        if (this.colorMode === ArrowField.ColorMode.DIVERGENCE) {
            const maxAbs = Math.max(
                Math.abs(scalarRange.from),
                Math.abs(scalarRange.to)
            );
            scalarRange.from = -maxAbs;
            scalarRange.to   =  maxAbs;
        }

        this.positions.forEach((position, index) => {
            this.tmpAxis
                .copy(newVectorField.sample(position))
                .multiplyScalar(this.scaleFactor);

            this.#updateArrowInstance(index, position, this.tmpAxis, scalars, scalarRange);
        });

        this._shaftMesh.instanceMatrix.needsUpdate = true;
        this._headMesh.instanceMatrix.needsUpdate  = true;
        this._shaftMesh.instanceColor.needsUpdate  = true;
    }
}


// Temperature at center
function temperatureAt(position, t) {
    const rSquared = position.lengthSq();
    const tEffective = Math.max(t, 0.01);
    const inv = 1 / Math.sqrt(4 * Math.PI * kappa * tEffective);
    return inv * Math.exp(-rSquared / (4 * kappa * tEffective));
}

// Temperature on edge
// const source = new THREE.Vector3(3, 0, 0);
// function temperatureAt(pos, t) {
//     const r2 = pos.clone().sub(source).lengthSq();
//     return Math.exp(-r2 / (4 * kappa * t));
// }

const field = new ScalarField(new Range(-3, 3, .4), position => Math.exp(-0.3 * position.lengthSq()));
field.scalars.forEach(scalar => worldGroup.add(scalar.sphere));

const boundingBox = new Box3();
boundingBox.setFromObject( worldGroup );

axesController.createFromBoundingBox(boundingBox);

const plot3D = new Plot3DView(scene, canvas, boundingBox);
plot3D.frame(ThreeJsUtils.scaleBox3(boundingBox, .9));
plot3D.renderer.setAnimationLoop(animate);
const gui = new ControlsGui();

// Resizing for mobile devices
function resize() {
    ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
    axesController.resize();
}
window.addEventListener("resize", resize);
resize();

let time = 0;
const kappa = 0.3;

function animate() {
    time += 0.02;

    field.scalars.forEach((scalar) => {
        const T = temperatureAt(scalar.position, time + 0.05);
        scalar.setColor(field._colorFor(T));
    });

    axesController.render(plot3D.camera);
    plot3D.render();
}
