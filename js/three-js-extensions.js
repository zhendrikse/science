import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export const ZeroVector = new THREE.Vector3();
export const UnitVectorE1 = new THREE.Vector3(1, 0, 0);
export const UnitVectorE2 = new THREE.Vector3(0, 1, 0);
export const UnitVectorE3 = new THREE.Vector3(0, 0, 1);

export class ThreeJsUtils {
    static scaleBox3(box, factor) {
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

        box.getCenter(center);
        box.getSize(size);

        size.multiplyScalar(factor).multiplyScalar(0.5);

        box.min.copy(center).sub(size);
        box.max.copy(center).add(size);

        return box;
    }

    static fitGroupToBox(
        group,     // 👈 This object moves
        sourceBox,
        targetBox,
        { alignY = "min", padding = 1.0 } = {}
    ) {
        const sourceSize = new THREE.Vector3();
        const targetSize = new THREE.Vector3();
        const sourceCenter = new THREE.Vector3();
        const targetCenter = new THREE.Vector3();

        sourceBox.getSize(sourceSize);
        targetBox.getSize(targetSize);
        sourceBox.getCenter(sourceCenter);
        targetBox.getCenter(targetCenter);

        const scale = Math.min(
            targetSize.x / sourceSize.x,
            targetSize.y / sourceSize.y,
            targetSize.z / sourceSize.z
        ) / padding;

        group.scale.setScalar(scale);

        sourceCenter.multiplyScalar(scale);
        group.position.copy(targetCenter).sub(sourceCenter);

        if (alignY === "min") {
            group.updateMatrixWorld(true);
            const scaledBox = new THREE.Box3().setFromObject(group);
            const deltaY = targetBox.min.y - scaledBox.min.y;
            group.position.y += deltaY;
        }
    }

    static resizeRendererToCanvas(renderer, camera) {
        const canvas = renderer.domElement;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        if (!w || !h) return;

        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        const width  = Math.floor(w * pixelRatio);
        const height = Math.floor(h * pixelRatio);

        if (canvas.width !== width || canvas.height !== height) {
            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
    }
}

export class Range {
    constructor(from, to, stepSize) {
        this.from = from;
        this.to = to;
        this.stepSize = stepSize || 0.1;
    }

    /**
     * Use:
     *   for (const x of range)
     *     console.log(x);
     *
     * @returns {Generator<*, void, *>}
     */
    *[Symbol.iterator]() {
        if (!isFinite(this.from) || !isFinite(this.to))
            throw new Error("Cannot iterate over an infinite interval.");
        if (this.stepSize <= 0)
            throw new Error("stepSize must be > 0");

        const n = Math.floor((this.to - this.from) / this.stepSize);
        for (let i = 0; i <= n; i++) {
            yield this.from + i * this.stepSize;
        }
    }
}

export class Interval {
    constructor(from=-Infinity, to=Infinity) {
        this.from = from;
        this.to = to;
    }

    shrinkTo(value) {
        if (this.from < value) this.from = value;
        if (this.to > value) this.to = value;
    }

    scaleValue = (value) => this.to === this.from ? 0: (value - this.from) / this.range();
    range = () => (this.from === Infinity || this.to === Infinity) ? Infinity : this.to - this.from;
    /**
     * Scale a unit parameter [0, 1] up to this interval
     * @param unitParameter the parameter that runs from [0, 1]
     * @returns {number} the scaled parameter
     */
    scaleUnitParameter = (unitParameter) => this.range() * (unitParameter + this.from / this.range());
}

export class Axes extends THREE.Group {
    constructor() {
        super();
        this._layout = null;
        this._annotations = null;
    }

    static toCartesian(radius, theta, phi) {
        return new THREE.Vector3(
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(theta)
        );
    }

    setLayout(layout) {
        this._layout?.dispose?.();
        this._layout = layout;
        this.add(layout);
    }

    setAnnotations(annotations) {
        this._annotations?.dispose?.();
        this._annotations = annotations;
        this.add(annotations);
    }

    render(scene, camera) {
        this._annotations.render(scene, camera);
    }

    boundingBox() {
        const axesBoundingBox = new THREE.Box3();
        axesBoundingBox.setFromObject(this);
        return axesBoundingBox;
    }
}

export class AxesParameters {
    constructor({
                    axesLines = true,
                    axesLabels = true,
                    xyPlane = true,
                    xzPlane = true,
                    yzPlane = true
                } = {}) {
        this.axesLines = axesLines;
        this.axesLabels = axesLabels;
        this.xyPlane = xyPlane;
        this.xzPlane = xzPlane;
        this.yzPlane = yzPlane;
    }
}

export class AxesAnnotation extends THREE.Group {
    constructor(container) {
        super();
        this._renderer = new CSS2DRenderer();
        this._renderer.domElement.style.position = "absolute";
        this._renderer.domElement.style.top = 0;
        this._renderer.domElement.style.left = 0;
        this._renderer.domElement.style.width = "100%";
        this._renderer.domElement.style.height = "100%";
        this._renderer.domElement.style.pointerEvents = "none"; // do not process mouse events
        this._renderer.domElement.style.zIndex = "5"; // on top of canvas

        container.appendChild(this._renderer.domElement);
        this.#resize(container);
    }

    #resize(container) {
        this._renderer.setSize(container.clientWidth, container.clientHeight);
    }

    label(text, pos, color = "yellow") {
        const div = document.createElement("div");
        div.textContent = text;
        div.style.color = color;
        div.style.fontSize = "16px";

        const label = new CSS2DObject(div);
        label.position.copy(pos);
        return label;
    }

    render(scene, camera) {
        this._renderer.render(scene, camera);
    }
}

export class AxesLayout extends THREE.Group {
    constructor(size=5, divisions=10) {
        super();
        this._size = size;
        this._divisions = divisions;
    }

    createPlane(color, rotate, gridPos, planePos) {
        const grid = new THREE.GridHelper(
            this._size,
            this._divisions,
            0x333333,
            0x333333
        );

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(this._size, this._size),
            new THREE.MeshPhongMaterial({
                color,
                transparent: true,
                opacity: 0.1,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );

        grid.position.copy(new THREE.Vector3(gridPos[0], gridPos[1], gridPos[2]).multiplyScalar(.5 * this._size));
        plane.position.copy(new THREE.Vector3(planePos[0], planePos[1], planePos[2]).multiplyScalar(.5 * this._size));

        rotate(grid);
        rotate(plane);

        return [grid, plane];
    }

    get divisions() { return this._divisions; }
    get size() { return this._size; }

    showAxes() { this.axes.visible = true; }
    hideAxes() { this.axes.visible = false; }
    showXY() { this.xyGrid.visible = true; this.xyPlane.visible = true; }
    hideXY() { this.xyGrid.visible = false; this.xyPlane.visible = false; }
    showXZ() { this.xzGrid.visible = true; this.xzPlane.visible = true; }
    hideXZ() { this.xzGrid.visible = false; this.xzPlane.visible = false; }
    showYZ() { this.yzGrid.visible = true; this.yzPlane.visible = true; }
    hideYZ() { this.yzGrid.visible = false; this.yzPlane.visible = false; }
}

export class ClassicalAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        const eps = 0.025;
        this.axes = new THREE.AxesHelper(size * .5);
        this.axes.position.set(eps, eps, eps);

        const [xyGrid, xzPlane] = this.createPlane(0x4444ff, v => v.rotateX(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        const [xzGrid, yzPlane] = this.createPlane(0x44ff44, v => v.rotateY(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        const [yzGrid, xyPlane] = this.createPlane(0xff4444, v => v.rotateZ(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        this.xyGrid = xyGrid;
        this.xyPlane = xyPlane;
        this.yzGrid = yzGrid;
        this.yzPlane = yzPlane;
        this.xzGrid = xzGrid;
        this.xzPlane = xzPlane;
        this.add(this.axes, this.xyGrid, this.xyPlane, this.xzGrid, this.xzPlane, this.yzPlane, this.yzGrid);
    }
}

export class MatlabAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        const eps = 0.025;
        this.axes = new THREE.AxesHelper(size);
        this.axes.position.set(-0.5 * size + eps, eps, -0.5 * size + eps);

        const [xyGrid, xzPlane] = this.createPlane(0x4444ff, v => v.rotateX(Math.PI / 2), [0, 1, -1], [0, 0, 0]);
        const [xzGrid, yzPlane] = this.createPlane(0x44ff44, v => v.rotateY(Math.PI / 2), [0, 0, 0], [-1, 1, 0]);
        const [yzGrid, xyPlane] = this.createPlane(0xff4444, v => v.rotateZ(Math.PI / 2), [-1, 1, 0], [0, 1, -1]);
        this.xyGrid = xyGrid;
        this.xyPlane = xyPlane;
        this.yzGrid = yzGrid;
        this.yzPlane = yzPlane;
        this.xzGrid = xzGrid;
        this.xzPlane = xzPlane;
        this.add(this.axes, this.xyGrid, this.xyPlane, this.xzGrid, this.xzPlane, this.yzPlane, this.yzGrid);
    }
}

export class ClassicalAnnotations extends AxesAnnotation {
    constructor(container, axesLayout, axisLabels=["X", "Y", "Z"]) {
        super(container);

        const size = axesLayout.size;
        const step = size / axesLayout.divisions;
        for (let v = -size * .5 ; v <= size * .5; v += step)
            this.add(
                this.label(v.toFixed(1), new THREE.Vector3(v, 0, 0.525 * size)),
                this.label(v.toFixed(1), new THREE.Vector3(0.525 * size, 0, v)));
        for (let v = 0 ; v <= size * .5; v += step)
            this.add(this.label(v.toFixed(1), new THREE.Vector3(0, v, 0)));

        this.add(
            this.label(axisLabels[0], new THREE.Vector3(0.575 * size, 0, 0), "red"),
            this.label(axisLabels[1], new THREE.Vector3(0, 0.575 * size, 0), "green"),
            this.label(axisLabels[2], new THREE.Vector3(0, 0, 0.575 * size), "blue"));
    }
}

export class MatlabAnnotations extends AxesAnnotation {
    constructor(container, axesLayout, axisLabels=["X", "Y", "Z"]) {
        super(container);

        const size = axesLayout.size;
        const step = (2 * size) / axesLayout.divisions;
        for (let v = 0 ; v <= size; v += step)
            this.add(
                this.label(v.toFixed(1), new THREE.Vector3(v - 0.5 * size, 0, 0.525 * size)),
                this.label(v.toFixed(1), new THREE.Vector3(-0.525 * size, v, 0.5 * size)),
                this.label(v.toFixed(1), new THREE.Vector3(0.525 * size, 0, v - 0.5 * size)));

        this.add(
            this.label(axisLabels[0], new THREE.Vector3(0.6 * size, 0, -0.5 * size), "red"),
            this.label(axisLabels[1], new THREE.Vector3(-0.5 * size, 1.05 * size, -0.5 * size), "green"),
            this.label(axisLabels[2], new THREE.Vector3(-0.5 * size, 0, 0.6 * size), "blue"));
    }
}

export class Plot3D {
    constructor(canvas, scene, axes) {
        this.scene = scene;
        this.axes = axes;
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

        // Resizing for mobile devices
        ThreeJsUtils.resizeRendererToCanvas(this.renderer, this.camera);
        window.addEventListener('resize', () => {
            ThreeJsUtils.resizeRendererToCanvas(this.renderer, this.camera);
        });

        this.#createLights();
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;

        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI * 0.95;
    }

    #createLights() {
        const hemiLight = new THREE.HemisphereLight(
            0xffffff, // sky
            0xeeeeee, // ground
            0.6
        );
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(3, 5, 4);
        dirLight.target.position.set(0, 0, 0);
        this.scene.add(dirLight);
        this.scene.add(dirLight.target);
    }

    #calculateCenter(boundingBox) {
        const size = new THREE.Vector3();
        let center = new THREE.Vector3();
        boundingBox.getSize(size);
        boundingBox.getCenter(center);
        return {center, size};
    }

    fitToBoundingBox(boundingBox, {
        padding = 1.5,
        translationY = 0,
        minDistance = 2,
        viewDirection = new THREE.Vector3(1, 1, 1)
    } = {}) {
        const {center, size} = this.#calculateCenter(boundingBox);

        // distance so that bounding box is always in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const verticalFieldOfView = THREE.MathUtils.degToRad(this.camera.fov);
        let distance = maxDim / Math.tan(verticalFieldOfView / 2);
        distance = Math.max(distance * padding, minDistance);

        const direction = viewDirection.clone().normalize();
        this.camera.position
            .copy(new THREE.Vector3(center.x, center.y + translationY, center.z))
            .addScaledVector(direction, distance);
        this.camera.near = distance / 100;
        this.camera.far  = distance * 10;
        this.camera.updateProjectionMatrix();

        this.controls.target.copy(center);
        this.controls.update();
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.axes.render(this.scene, this.camera);
    }
}

const shaftGeometryRound = new THREE.CylinderGeometry(1, 1, 1, 16);
const shaftGeometrySquare = new THREE.BoxGeometry(1, 1, 1);
const headGeometryRound = new THREE.ConeGeometry(1, 1, 16);
const headGeometrySquare = new THREE.ConeGeometry(1, 1, 4);

export class VectorField {
    constructor() {}

    range(positions) {
        let min = Infinity;
        let max = -Infinity;

        for (const position of positions) {
            const mag = this.sample(position).length();
            min = Math.min(min, mag);
            max = Math.max(max, mag);
        }

        return { min, max };
    }

    sample(positionVector) {
        throw new Error("You invoked the method of an abstract base class. Please create a subclass first.");
    }

    #centralDifferences(position, h) {
        const dx = new THREE.Vector3(h, 0, 0);
        const dy = new THREE.Vector3(0, h, 0);
        const dz = new THREE.Vector3(0, 0, h);

        const Fx1 = this.sample(position.clone().add(dx));
        const Fx0 = this.sample(position.clone().sub(dx));

        const Fy1 = this.sample(position.clone().add(dy));
        const Fy0 = this.sample(position.clone().sub(dy));

        const Fz1 = this.sample(position.clone().add(dz));
        const Fz0 = this.sample(position.clone().sub(dz));
        return {Fx0, Fy0, Fz0, Fx1, Fy1, Fz1};
    }

    divergence(position, h = 1e-2) {
        const {Fx0, Fy0, Fz0, Fx1, Fy1, Fz1} = this.#centralDifferences(position, h);

        return (
            (Fx1.x - Fx0.x) +
            (Fy1.y - Fy0.y) +
            (Fz1.z - Fz0.z)
        ) / (2 * h);
    }

    curl(position, h = 1e-2) {
        const {Fx0, Fy0, Fz0, Fx1, Fy1, Fz1} = this.#centralDifferences(position, h);

        return new THREE.Vector3(
            (Fy1.z - Fy0.z - (Fz1.y - Fz0.y)) / (2 * h),
            (Fz1.x - Fz0.x - (Fx1.z - Fx0.z)) / (2 * h),
            (Fx1.y - Fx0.y - (Fy1.x - Fy0.x)) / (2 * h)
        );
    }

    curlMagnitude(position, h=1e-2) {
        return this.curl(position, h).length();
    }
}

export class ArrowField extends THREE.Group {
    static ColorMode = Object.freeze({
        MAGNITUDE: "magnitude",
        DIVERGENCE: "divergence",
        CURL: "curl"
    });

    constructor(xRange, yRange, zRange, vectorField, {
        scaleFactor = 0.3,
        shaftWidth  = 0.08,  // relative to axis length
        headWidth   = 2.0,   // times shaft width
        headLength  = 4.0,   // times shaft width
        colorMode    = ArrowField.ColorMode.MAGNITUDE,
        round       = false
    } = {}) {
        super();
        this.positions = [];
        this.xRange = xRange;
        this.yRange = yRange;
        this.zRange = zRange;
        this.scaleFactor = scaleFactor;
        this.vectorField = vectorField;
        this.colorMode = colorMode;
        this.shaftWidth = shaftWidth;
        this.headWidth  = headWidth;
        this.headLength = headLength;

        const shaftGeometry = round ? shaftGeometryRound : shaftGeometrySquare;
        const headGeometry  = round ? headGeometryRound  : headGeometrySquare;
        const shaftMaterial = new THREE.MeshStandardMaterial();
        const headMaterial  = new THREE.MeshStandardMaterial();

        this.#initializePositions();

        this.shaftMesh = new THREE.InstancedMesh(shaftGeometry, shaftMaterial, this.positions.length);
        this.headMesh  = new THREE.InstancedMesh(headGeometry,  headMaterial,  this.positions.length);
        this.add(this.shaftMesh, this.headMesh);

        // per-instance color
        const colors = new Float32Array(this.positions.length * 3);
        this.shaftMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
        this.headMesh.instanceColor  = this.shaftMesh.instanceColor;

        // temp objects (no allocations per frame)
        this.tmpMatrix = new THREE.Matrix4();
        this.tmpQuaternion = new THREE.Quaternion();
        this.tmpScale      = new THREE.Vector3();
        this.tmpPosition   = new THREE.Vector3();
        this.tmpAxis       = new THREE.Vector3();
        this.tmpDirection  = new THREE.Vector3();

        // initial build
        this.updateFieldWith(vectorField);
    }

    #collapseArrow(index, position) {
        this.tmpScale.set(0, 0, 0);
        this.tmpMatrix.compose(position, new THREE.Quaternion(), this.tmpScale);
        this.shaftMesh.setMatrixAt(index, this.tmpMatrix);
        this.headMesh.setMatrixAt(index, this.tmpMatrix);
    }

    #arrowSizes(axis) {
        const length = axis.length();
        const shaftRadius = length * this.shaftWidth;
        const headLength  = this.headLength * shaftRadius;
        const shaftLength = Math.max(length - headLength, 1e-6);
        return {shaftRadius, shaftLength, headLength};
    }

    #initializePositions() {
        this.positions = [];
        for (const x of this.xRange)
            for (const y of this.yRange)
                for (const z of this.zRange)
                    this.positions.push(new THREE.Vector3(x, z + 1, y));
    }

    #magnitudeToColor(magnitude, scalarRange) {
        if (scalarRange.to <= scalarRange.from) return new THREE.Color(0x00ffff);

        const t = THREE.MathUtils.clamp(scalarRange.scaleValue(magnitude), 0, 1);
        const hue = (1 - t) * 0.66; // Hue: 0.66 (blue) → 0.0 (red)

        return new THREE.Color().setHSL(hue, 1.0, 0.5);
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
        const t = THREE.MathUtils.clamp(
            scalarRange.scaleValue(value) * 2 - 1,
            -1, 1
        );

        if (t < 0) // blue → white
            return new THREE.Color().lerpColors(
                new THREE.Color(0x0000ff),
                new THREE.Color(0xffffff),
                1 + t
            );
        else // white → red
            return new THREE.Color().lerpColors(
                new THREE.Color(0xffffff),
                new THREE.Color(0xff0000),
                t
            );
    }

    #updateShaft(index, position, axis) {
        const {shaftRadius, shaftLength} = this.#arrowSizes(axis);
        this.tmpScale.set(shaftRadius, shaftLength, shaftRadius);
        this.tmpPosition.copy(position).addScaledVector(axis, 0.5);

        this.tmpMatrix.compose(this.tmpPosition, this.tmpQuaternion, this.tmpScale);
        this.shaftMesh.setMatrixAt(index, this.tmpMatrix);
    }

    #updateHead(index, position, axis) {
        const {shaftRadius, headLength} = this.#arrowSizes(axis);
        this.tmpScale.set(
            this.headWidth * shaftRadius,
            headLength,
            this.headWidth * shaftRadius
        );
        this.tmpPosition.copy(position).addScaledVector(axis, 1.0);
        this.tmpMatrix.compose(this.tmpPosition, this.tmpQuaternion, this.tmpScale);
        this.headMesh.setMatrixAt(index, this.tmpMatrix);
    }

    #updateArrowColor(index, axis, scalars, scalarRange) {
        switch (this.colorMode) {
            case ArrowField.ColorMode.DIVERGENCE:
                this.shaftMesh.setColorAt(index, this.#scalarToColor(scalars[index], scalarRange));
                break;
            case ArrowField.ColorMode.CURL:
                if (scalarRange.to - scalarRange.from < 1e-12) {
                    scalarRange.from -= 1;
                    scalarRange.to   += 1;
                }
                const t = THREE.MathUtils.clamp(scalarRange.scaleValue(scalars[index]), 0, 1);
                const hue = (1 - t) * 0.66;
                this.shaftMesh.setColorAt(index, new THREE.Color().setHSL(hue, 1, 0.5));
                break;
            default:
                const mag = axis.length() / this.scaleFactor;
                this.shaftMesh.setColorAt(index, this.#magnitudeToColor(mag, scalarRange));
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

        this.shaftMesh.instanceMatrix.needsUpdate = true;
        this.headMesh.instanceMatrix.needsUpdate  = true;
        this.shaftMesh.instanceColor.needsUpdate  = true;
    }
}

export class Sphere {
    constructor(
        group,
        position=new THREE.Vector3(0, 0, 0),
        radius=1,
        {
            segments=24,
            material=new THREE.MeshStandardMaterial({
                color: "yellow",
                opacity: 1,
                transparent: true,
                wireframe: false,
                metalness:0.7,
                roughness:0.2
            })
        }) {
        this._sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments), material);
        this._sphere.position.copy(position);
        this._sphere.castShadow = true;
        this._group = group;
        this._group.add(this._sphere);
    }

    moveTo(newPosition) {
        this._sphere.position.copy(newPosition);
    }
}

export class Arrow extends THREE.Group {
    constructor(position, axis, {
        color = 0xff0000,
        shaftWidth = 0.1, // times the length of the axis
        headWidth = 2,    // times the width of the shaft
        headLength = 5,   // times the width of the shaft
        opacity = 1,
        round = false,
        visible = true
    } = {}) {
        super();

        this.headLength = headLength;
        this.shaftWidth = shaftWidth;
        this.headWidth = headWidth;
        this.axis = axis;

        const shaftGeometry = round ? shaftGeometryRound : shaftGeometrySquare;
        const headGeometry  = round ? headGeometryRound  : headGeometrySquare;
        const material = new THREE.MeshStandardMaterial({
            color: color,
            opacity: opacity,
            transparent: true
        });

        this.shaft = new THREE.Mesh(shaftGeometry, material);
        this.head = new THREE.Mesh(headGeometry, material);
        if (!round)
            this.head.rotation.y = Math.PI / 4; // By default, the rotation of square-shaped head is 45 degrees off

        this.add(this.shaft, this.head);
        this.position.copy(position);
        this.updateAxis(axis);
        this.visible = visible;
    }

    updateAxis(newAxis) {
        this.axis.copy(newAxis);
        const totalLength = newAxis.length();
        if (totalLength < 1e-6)
            return;

        const quaternion = new THREE.Quaternion().setFromUnitVectors(
            UnitVectorE2,
            newAxis.clone().normalize()
        );
        this.setRotationFromQuaternion(quaternion);

        const shaftWidth = totalLength * this.shaftWidth;
        const headLength = this.headLength * shaftWidth;
        const shaftLength = Math.max(totalLength - headLength, 1e-6);

        this.shaft.scale.set(shaftWidth, shaftLength, shaftWidth);
        this.shaft.position.y = shaftLength * 0.5;
        this.head.scale.set(this.headWidth * shaftWidth, headLength, this.headWidth * shaftWidth);
        this.head.position.y = shaftLength + headLength * 0.5;
    }

    updateColor = (color) => this.shaft.material.color = color;

    updateOpacity = (opacity) => {
        this.shaft.material.opacity = opacity;
        this.head.material.opacity = opacity;
    }

    moveTo = (newPositionVector) => this.position.copy(newPositionVector);

    positionVectorTo = (other) => new THREE.Vector3().copy(other.position).sub(this.position);

    distanceToSquared = (other) => this.position.distanceToSquared(other.position);
}

export class Graph {
    constructor(canvas, {
        maxPoints = 300,
        dt = 0.02,
        scaleY = 1,
        offsetY = null,
        background = "#131313",
        gridColor = "#333",
        axisColor = "#888",
        textColor = "#aaa",
        font = "12px sans-serif"
    } = {}) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.maxPoints = maxPoints;
        this.dt = dt;
        this.scaleY = scaleY;
        this.offsetY = offsetY ?? canvas.height * 0.9;

        this.gridColor = gridColor;
        this.axisColor = axisColor;
        this.textColor = textColor;
        this.font = font;

        this.series = new Map();
        this.time = 0;

        this.canvas.style.backgroundColor = background;
    }

    addSeries(name, color) {
        this.series.set(name, { data: [], color });
    }

    push(values) {
        this.time += this.dt;

        for (const [name, value] of Object.entries(values)) {
            const s = this.series.get(name);
            if (!s) continue;

            s.data.push({ t: this.time, v: value });
            if (s.data.length > this.maxPoints) s.data.shift();
        }
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.clear();
        this._drawGrid();
        this._drawAxes();

        for (const series of this.series.values()) {
            this._drawLine(series);
        }
    }

    _drawLine(series) {
        const { data, color } = series;
        if (data.length === 0) return;

        const t0 = data[0].t;
        const t1 = data[data.length - 1].t;
        const span = t1 - t0 || 1;

        const context = this.context;
        context.beginPath();
        context.strokeStyle = color;

        data.forEach((point, index) => {
            const x = (point.t - t0) / span * this.canvas.width;
            const y = this.offsetY - point.v * this.scaleY;
            if (index === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        });

        context.stroke();
    }

    _drawGrid() {
        const context = this.context;
        context.strokeStyle = this.gridColor;
        context.lineWidth = 1;

        const w = this.canvas.width;
        const h = this.canvas.height;

        const { tMin, tMax } = this._getTimeRange();
        const span = tMax - tMin;

        const tStep = this._niceStep(span / 10);

        for (let t = Math.ceil(tMin / tStep) * tStep; t <= tMax; t += tStep) {
            const x = (t - tMin) / span * w;
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, h);
            context.stroke();
        }

        // horizontale grid (Y blijft hetzelfde)
        const yStep = this._niceStep(h / (this.scaleY * 6));
        for (let v = -1000; v <= 1000; v += yStep) {
            const y = this.offsetY - v * this.scaleY;
            if (y < 0 || y > h) continue;
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(w, y);
            context.stroke();
        }
    }

    _drawAxes() {
        const context = this.context;
        context.strokeStyle = this.axisColor;
        context.fillStyle = this.textColor;
        context.font = this.font;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // X axis (time)
        const { tMin, tMax } = this._getTimeRange();
        const span = tMax - tMin;
        const tStep = this._niceStep(span / 5);

        for (let t = Math.ceil(tMin / tStep) * tStep; t <= tMax; t += tStep) {
            const x = (t - tMin) / span * width;
            context.fillText(`${t.toFixed(1)} s`, x + 2, height - 5);
        }

        // Y labels
        const yStep = this._niceStep(height / (this.scaleY * 6));
        for (let v = -1000; v <= 1000; v += yStep) {
            const y = this.offsetY - v * this.scaleY;
            if (y < 0 || y > height) continue;
            context.fillText(v.toFixed(0), 4, y - 2);
        }
    }

    _niceStep(raw) {
        const exp = Math.floor(Math.log10(raw));
        const f = raw / Math.pow(10, exp);
        const nice =
            f < 1.5 ? 1 :
                f < 3   ? 2 :
                    f < 7   ? 5 : 10;
        return nice * Math.pow(10, exp);
    }

    _getTimeRange() {
        let tMin = Infinity;
        let tMax = -Infinity;

        for (const { data } of this.series.values()) {
            if (data.length === 0) continue;
            tMin = Math.min(tMin, data[0].t);
            tMax = Math.max(tMax, data[data.length - 1].t);
        }

        if (!isFinite(tMin) || tMax === tMin) {
            return { tMin: 0, tMax: 1 };
        }

        return { tMin, tMax };
    }
}

class Helix extends THREE.Curve {
    constructor(position, axis, coils=25, radius=0.4, waveAmp=0.05, wavePhase=0){
        super();
        this.start = position.clone();
        this.coils = coils;
        this.axis = axis;
        this.radius = radius;
        this.waveAmp = waveAmp;
        this.wavePhase = wavePhase;
    }

    updateAxis = (newAxis) => this.axis.copy(newAxis);

    getPoint(t){
        const length = this.axis.length();
        const angle = t * this.coils * Math.PI * 2;
        const x = Math.cos(angle) * this.radius;
        const y = Math.sin(angle) * this.radius;

        // Longitudinal wave across spring
        const z = t * length + this.waveAmp * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * t * 3 - this.wavePhase);

        const point = new THREE.Vector3(x, y, z);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.axis.clone().normalize());
        point.applyQuaternion(quaternion);

        return point.add(this.start);
    }
}

export class PhysicalObject {
    constructor(position, velocity, mass) {
        this._position = position;
        this._velocity = velocity;
        this._mass = mass;
    }

    semiImplicitEulerUpdate(force, dt=0.01) {
        this._velocity.addScaledVector(force, dt / this._mass);
        this._position.addScaledVector(this._velocity, dt);
    }

    verletUpdate(force, dt=0.01) {
        const a = force.multiplyScalar(1 / this._mass);

        this._position.addScaledVector(this._velocity, dt)
            .addScaledVector(a, 0.5 * dt * dt);

        const a2 = force.multiplyScalar(1 / this._mass);
        this._velocity.addScaledVector(a.add(a2), 0.5 * dt);
    }


    get position() {
        return this._position.clone();
    }

    get velocity() {
        return this._velocity.clone();
    }

    get mass() {
        return this._mass;
    }

    moveTo(newPosition) {
        this._position.copy(newPosition);
    }

    accelerateTo(newVelocity) {
        this._velocity.copy(newVelocity);
    }

    kineticEnergy = () => 0.5 * this._mass * this._velocity.dot(this._velocity);
}

export class Ball {
    constructor(parent, {
        position = new THREE.Vector3(0, 0, 0),
        radius=1,
        velocity = new THREE.Vector3(0, 0, 0),
        mass=1,
        opacity = 1,
        wireframe = false,
        color=0xffff00,
        segments = 24})
    {
        const material = new THREE.MeshStandardMaterial({
            color: color,
            opacity: opacity,
            transparent: true,
            wireframe: wireframe,
            metalness:0.7,
            roughness:0.2
        });
        this._sphere = new Sphere(parent, position, radius, {segments: segments, material: material});
        this._ball = new PhysicalObject(position, velocity, mass);
    }

    semiImplicitEulerUpdate(force, dt=0.01) {
        this._ball.semiImplicitEulerUpdate(force, dt);
        this._sphere.moveTo(this._ball.position);
    }

    verletUpdate(force, dt=0.01) {
        this._ball.verletUpdate(force, dt);
        this._sphere.moveTo(this._ball.position);
    }

    moveTo(newPosition) {
        this._ball.moveTo(newPosition);
        this._sphere.moveTo(this._ball.position);
    }

    position = () => this._ball.position;
    velocity = () => this._ball.velocity;
    accelerateTo = (newVelocity) => this._ball.accelerateTo(newVelocity);
    mass = () => this._ball.mass;
    kineticEnergy = () => this._ball.kineticEnergy();
}

export class Spring {
    constructor(parent, position, axis, {
        k=200,
        color=0x00ffff,
        coils=30,
        longitudinalOscillation=false,
        tubularSegments=400,
        radialSegments=12,
        radius=0.5,
        coilRadius=0.075
    } = {}) {
        this.longtudinalOscillation = longitudinalOscillation;
        this.radius = radius;
        this.curve = new Helix(position, axis, coils, radius);
        this.tubularSegments = tubularSegments;
        this.radialSegments = radialSegments;
        this.coilRadius = coilRadius;
        this.restLength = axis.length();
        this.k = k;
        this.position = position;
        this.axis = axis;

        this.geometry = new THREE.TubeGeometry(this.curve, tubularSegments, coilRadius, radialSegments, false);
        const material = new THREE.MeshStandardMaterial({color: color, metalness:0.3, roughness:0.4});
        this.spring = new THREE.Mesh(this.geometry, material);
        parent.add(this.spring);
    }

    #regenerateTube() {
        this.spring.geometry.dispose();
        this.spring.geometry = new THREE.TubeGeometry(
            this.curve, this.tubularSegments, this.coilRadius, this.radialSegments, false
        );
    }

    updateAxis(newAxis) {
        this.axis = newAxis;
        this.curve.updateAxis(this.axis);
        this.longtudinalOscillation ?
            this.#updateWithLongitudinal() :
            this.#updateWithoutLongitudinal();
    }

    update = (time) => this.curve.wavePhase = time * 4;

    #updateWithoutLongitudinal() {
        this.#regenerateTube();
    }

    #updateWithLongitudinal(time) {
        // Longitudinal wave amplitude coupled to spring elongation
        const displacement = this.axis.y - this.curve.start.y;
        this.curve.waveAmp = Math.min(Math.abs(displacement) / 10, 0.3); // max amplitude 0.3
        this.#regenerateTube();
    }

    force = () => -this.k * this.displacement();
    displacement = () => this.restLength - this.axis.length();
}
