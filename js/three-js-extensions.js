import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import { BufferGeometry, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight, Vector3,
    MathUtils, CylinderGeometry, BoxGeometry, ConeGeometry, Group, AxesHelper, GridHelper, Mesh, PlaneGeometry,
    MeshPhongMaterial, DoubleSide, Box3, MeshStandardMaterial, Quaternion, Matrix4, Curve, SphereGeometry, Line,
    InstancedMesh, InstancedBufferAttribute, BufferAttribute, LineBasicMaterial, TubeGeometry } from "three";

export const ZeroVector = new Vector3();
export const UnitVectorE1 = new Vector3(1, 0, 0);
export const UnitVectorE2 = new Vector3(0, 1, 0);
export const UnitVectorE3 = new Vector3(0, 0, 1);

export class ThreeJsUtils {
    static scaleBox3(box, factor) {
        const center = new Vector3();
        const size = new Vector3();

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
        const sourceSize = new Vector3();
        const targetSize = new Vector3();
        const sourceCenter = new Vector3();
        const targetCenter = new Vector3();

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
            const scaledBox = new Box3().setFromObject(group);
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

export class ComplexNumber {
    constructor(re, im) {
        this._re = re
        this._im = im
    }

    get re() { return this._re; }
    get im() { return this._im; }

    phase = () => Math.atan2(this.im, this.re);
    abs = () => Math.sqrt(this.re * this.re + this.im * this.im);
}

export class MathWrapper {
    constructor() {
        this.complex = this._complex;
        this.add = this._add;
        this.subtract = this._subtract;
        this.multiply = this._multiply;
        this.divide = this._divide;
        this.sqrt = this._sqrt;
        this.log = this._log;
        this.exp = this._exp;
        this.sin = this._sin;
        this.cos = this._cos;
    }

    _complex = (re, im) => new ComplexNumber(re, im);
    _add = (z1, z2) => new ComplexNumber(z1.re + z2.re, z1.im + z2.im);
    _subtract = (z1, z2) => new ComplexNumber(z1.re - z2.re, z1.im - z2.im);
    _log = (z) => new ComplexNumber(Math.log(z.abs()), Math.atan2(z.im, z.re));
    _exp = (z) => new ComplexNumber(Math.exp(z.re) * Math.cos(z.im), Math.exp(z.re) * Math.sin(z.im))
    _sin = (z) => {
        const i_z = this.multiply(z, new ComplexNumber(0, 1));
        const min_i_z = this.multiply(z, new ComplexNumber(0, -1));
        return this.multiply(new ComplexNumber(0, -.5), this.exp(this.subtract(i_z, min_i_z)));
    }
    _cos = (z) => {
        const i_z = this.multiply(z, new ComplexNumber(0, 1));
        const min_i_z = this.multiply(z, new ComplexNumber(0, -1));
        return this.multiply(new ComplexNumber(.5, 0), this.exp(this.add(i_z, min_i_z)));
    }
    _multiply = (z1, z2) => new ComplexNumber(z1.re * z2.re - z1.im * z2.im, z1.im * z2.re + z1.re * z2.im);

    _divide = (z1, z2) => {
        const denominator = z2.re * z2.re + z2.im * z2.im;
        const re = z1.re * z2.re + z1.im * z2.im;
        const im = z1.im * z2.re - z1.re * z2.im;
        return new ComplexNumber(re / denominator, im / denominator);
    }
    _sqrt = (z) => {
        const factor = Math.sqrt((z.abs() + z.re) / 2);
        return new ComplexNumber(factor, factor * (z.im / Math.abs(z.im)));
    }
}
export class AxesView extends Group {
    static Type = Object.freeze({
        CLASSICAL: "classical",
        MATLAB: "MatLab"
    });

    constructor() {
        super();
        this._layout = null;
        this._annotations = null;
    }

    #disposeLayout() {
        if (this._layout) {
            this._layout.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) object.material.dispose();
            });
            this.remove(this._layout);
            this._layout = null;
        }
    }

    #disposeAnnotations() {
        if (this._annotations) {
            this._annotations._labels.forEach(label => this._annotations.remove(label));
            if (this._annotations._renderer?.domElement?.parentNode)
                this._annotations._renderer.domElement.parentNode.removeChild(this._annotations._renderer.domElement);
            this._annotations = null;
        }
    }

    dispose() {
        this.#disposeLayout();
        this.#disposeAnnotations();
        this.clear();
    }

    static toCartesian(radius, theta, phi) {
        return new Vector3(
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

    get annotations() { return this._annotations; }
    get layout() { return this._layout; }

    render(scene, camera) {
        this._annotations.render(scene, camera);
    }

    shiftBy(translationVector) {
        if (this._annotations) this._annotations.shiftBy(translationVector);
        if (this._layout) this._layout.shiftBy(translationVector);
    }

    boundingBox() {
        const axesBoundingBox = new Box3();
        axesBoundingBox.setFromObject(this);
        return axesBoundingBox;
    }
}

class AxesAnnotation extends Group {
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

        this._labels = [];

        container.appendChild(this._renderer.domElement);
        this.#resize(container);
    }

    #resize(container) {
        this._renderer.setSize(container.clientWidth, container.clientHeight);
    }

    createLabel(text, pos, color = "yellow", fontSize = "16px") {
        const div = document.createElement("div");
        div.textContent = text;
        div.style.color = color;
        div.style.fontSize = fontSize;

        const label = new CSS2DObject(div);
        label.position.copy(pos);
        return label;
    }

    render(scene, camera) {
        this._renderer.render(scene, camera);
    }

    shiftBy(translationVector) {
        this._labels.forEach((label) => label.position.add(translationVector));
    }
}

class AxesLayout extends Group {
    constructor(size, divisions) {
        super();
        this._size = size;
        this._divisions = divisions;
        this._axes = null; // to be created in concrete subclasses
    }

    createPlane(color, rotate, gridPos, planePos) {
        const grid = new GridHelper(
            this._size,
            this._divisions,
            0x333333,
            0x333333
        );

        const plane = new Mesh(
            new PlaneGeometry(this._size, this._size),
            new MeshPhongMaterial({
                color,
                transparent: true,
                opacity: 0.1,
                depthWrite: false,
                side: DoubleSide
            })
        );

        grid.position.copy(new Vector3(gridPos[0], gridPos[1], gridPos[2]).multiplyScalar(.5 * this._size));
        plane.position.copy(new Vector3(planePos[0], planePos[1], planePos[2]).multiplyScalar(.5 * this._size));

        rotate(grid);
        rotate(plane);

        return [grid, plane];
    }

    get divisions() { return this._divisions; }
    get size() { return this._size; }
    get axes() { return this._axes; }

    shiftBy(translationVector) {
        this.xyGrid.position.add(translationVector);
        this.xyPlane.position.add(translationVector);
        this.yzGrid.position.add(translationVector);
        this.yzPlane.position.add(translationVector);
        this.xzGrid.position.add(translationVector);
        this.xzPlane.position.add(translationVector);
        this._axes.position.add(translationVector);
    }

    showXY() { this.xyGrid.visible = true; this.xyPlane.visible = true; }
    hideXY() { this.xyGrid.visible = false; this.xyPlane.visible = false; }
    showXZ() { this.xzGrid.visible = true; this.xzPlane.visible = true; }
    hideXZ() { this.xzGrid.visible = false; this.xzPlane.visible = false; }
    showYZ() { this.yzGrid.visible = true; this.yzPlane.visible = true; }
    hideYZ() { this.yzGrid.visible = false; this.yzPlane.visible = false; }
    show() { this.showXY(); this.showXZ(); this.showYZ(); }
    hide() { this.hideXY(); this.hideXZ(); this.hideYZ(); }
}

class ClassicalAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        const eps = 0.025;
        this._axes = new AxesHelper(size * .5);
        this._axes.position.set(eps, eps, eps);

        const [xyGrid, xzPlane] = this.createPlane(0x4444ff, v => v.rotateX(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        const [xzGrid, yzPlane] = this.createPlane(0x44ff44, v => v.rotateY(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        const [yzGrid, xyPlane] = this.createPlane(0xff4444, v => v.rotateZ(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        this.xyGrid = xyGrid;
        this.xyPlane = xyPlane;
        this.yzGrid = yzGrid;
        this.yzPlane = yzPlane;
        this.xzGrid = xzGrid;
        this.xzPlane = xzPlane;
        this.add(this._axes, this.xyGrid, this.xyPlane, this.xzGrid, this.xzPlane, this.yzPlane, this.yzGrid);
    }
}

class MatlabAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        const eps = 0.025;
        this._axes = new AxesHelper(size);
        this._axes.position.set(-0.5 * size + eps, eps, -0.5 * size + eps);

        const [xyGrid, xzPlane] = this.createPlane(0x4444ff, v => v.rotateX(Math.PI / 2), [0, 1, -1], [0, 0, 0]);
        const [xzGrid, yzPlane] = this.createPlane(0x44ff44, v => v.rotateY(Math.PI / 2), [0, 0, 0], [-1, 1, 0]);
        const [yzGrid, xyPlane] = this.createPlane(0xff4444, v => v.rotateZ(Math.PI / 2), [-1, 1, 0], [0, 1, -1]);
        this.xyGrid = xyGrid;
        this.xyPlane = xyPlane;
        this.yzGrid = yzGrid;
        this.yzPlane = yzPlane;
        this.xzGrid = xzGrid;
        this.xzPlane = xzPlane;
        this.add(this._axes, this.xyGrid, this.xyPlane, this.xzGrid, this.xzPlane, this.yzPlane, this.yzGrid);
    }
}

class ClassicalAnnotations extends AxesAnnotation {
    constructor(container, axesLayout, axisLabels=["X", "Y", "Z"]) {
        super(container);

        const size = axesLayout.size;
        const step = size / axesLayout.divisions;
        for (let v = -size * .5 ; v <= size * .5; v += step)
            this._labels.push(
                this.createLabel(v.toFixed(1), new Vector3(v, 0, 0.525 * size)),
                this.createLabel(v.toFixed(1), new Vector3(0.525 * size, 0, v)));
        for (let v = 0 ; v <= size * .5; v += step)
            this._labels.push(this.createLabel(v.toFixed(1), new Vector3(0, v, 0)));

        this._labels.push(
            this.createLabel(axisLabels[0], new Vector3(0.575 * size, 0, 0), "red", "20px"),
            this.createLabel(axisLabels[1], new Vector3(0, 0.575 * size, 0), "green", "20px"),
            this.createLabel(axisLabels[2], new Vector3(0, 0, 0.575 * size), "blue", "20px"));

        this._labels.forEach(label => this.add(label));
    }
}

class MatlabAnnotations extends AxesAnnotation {
    constructor(container, axesLayout, axisLabels=["X", "Y", "Z"]) {
        super(container);

        const size = axesLayout.size;
        const step = (2 * size) / axesLayout.divisions;
        for (let v = 0 ; v <= size; v += step)
            this._labels.push(
                this.createLabel(v.toFixed(1), new Vector3(-0.525 * size, v, 0.5 * size)),
                this.createLabel(v.toFixed(1), new Vector3(0.525 * size, 0, v - 0.5 * size)));

        for (let v = step ; v < size; v += step)
            this._labels.push(
                this.createLabel(v.toFixed(1), new Vector3(v - 0.5 * size, 0, 0.525 * size)));

        this._labels.push(
            this.createLabel(axisLabels[0], new Vector3(0.65 * size, 0, -0.5 * size), "red", "20px"),
            this.createLabel(axisLabels[1], new Vector3(-0.5 * size, 1.1 * size, -0.5 * size), "green", "20px"),
            this.createLabel(axisLabels[2], new Vector3(-0.5 * size, 0, 0.65 * size), "blue", "20px"));

        this._labels.forEach(label => this.add(label));
    }
}

export class Plot3DView {
    constructor(canvas, canvasContainer, scene, axesBoundingBox, axesParameters) {
        this._scene = scene;
        this._canvas = canvas;
        this._axesParameters = axesParameters;
        this._canvasContainer = canvasContainer;
        this._axes = this.#createAxes(axesBoundingBox);
        this._scene.add(this.axes);
        this._camera = new PerspectiveCamera(45, 1, 0.1, 100);
        this._renderer = new WebGLRenderer({ antialias: true, canvas });

        // Resizing for mobile devices
        ThreeJsUtils.resizeRendererToCanvas(this._renderer, this._camera);
        window.addEventListener("resize", () => this.#resize());

        this._controls = new OrbitControls(this._camera, canvas);
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.08;
        //this.controls.screenSpacePanning = false;
        //this.controls.maxPolarAngle = Math.PI * 0.95;

        this.#setupLights();
        this.#resize();
        this.frame(axesBoundingBox);
        this.applyAxesParameters();
    }

    #resize() {
        ThreeJsUtils.resizeRendererToCanvas(this._renderer, this._camera);
        this.axes?._annotations._renderer.setSize(
            this._canvasContainer.clientWidth,
            this._canvasContainer.clientHeight
        );
    }

    #setupLights() {
        this._scene.add(
            new HemisphereLight(0xffffff, 0xeeeeee, 0.6),
            new DirectionalLight(0xffffff, 0.9)
        );
    }

    #createAxes(boundingBox, padding=1.1) {
        const sizeVec = boundingBox.getSize(new Vector3());
        const maxSize = padding * Math.max(sizeVec.x, sizeVec.y, sizeVec.z);

        const layout = this._axesParameters.layoutType === AxesView.Type.MATLAB ?
            new MatlabAxesLayout(maxSize, this._axesParameters.divisions) :
            new ClassicalAxesLayout(maxSize, this._axesParameters.divisions);

        const annotations = (this._axesParameters.layoutType === AxesView.Type.MATLAB ) ?
            new MatlabAnnotations(this._canvasContainer, layout, this._axesParameters.axisLabels) :
            new ClassicalAnnotations(this._canvasContainer, layout, this._axesParameters.axisLabels);

        const axes = new AxesView();
        axes.setLayout(layout);
        axes.setAnnotations(annotations);
        return axes;
    }

    applyAxesParameters() {
        const { axes, gridPlanes, annotations } = this._axesParameters;
        this._axes.layout.axes.visible = axes;
        this._axes.annotations.visible = annotations;
        gridPlanes ? this._axes.layout.show() : this._axes.layout.hide();
    }

    get axes() { return this._axes; }

    #calculateCenter(boundingBox) {
        const size = new Vector3();
        let center = new Vector3();
        boundingBox.getSize(size);
        boundingBox.getCenter(center);
        return {center, size};
    }

    frame(boundingBox, {
        padding = 1.2,
        translationY = 0,
        minDistance = 2,
        viewDirection = new Vector3(1, 1, 1)
    } = {}) {
        const {center, size} = this.#calculateCenter(boundingBox);

        // distance so that bounding box is always in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const verticalFieldOfView = MathUtils.degToRad(this._camera.fov);
        let distance = maxDim / Math.tan(verticalFieldOfView / 2);
        distance = Math.max(distance * padding, minDistance);

        const direction = viewDirection.clone().normalize();
        this._camera.position
            .copy(new Vector3(center.x, center.y + translationY, center.z))
            .addScaledVector(direction, distance);
        this._camera.near = distance / 100;
        this._camera.far = distance * 10;
        this._camera.updateProjectionMatrix();

        this._controls.target.copy(center);
        this._controls.update();
    }

    get camera() { return this._camera; }

    updateAxes(newBoundingBox) {
        this._axes.dispose();
        this._scene.remove(this._axes);
        this._axes = this.#createAxes(newBoundingBox);
        this._scene.add(this._axes);
        this.frame(newBoundingBox);
        this.applyAxesParameters();
    }

    render() {
        this._controls.update();
        this._renderer.render(this._scene, this._camera);
        this._axes.render(this._scene, this._camera);
    }
}

class Trail {
    constructor({
                    maxPoints = 200,
                    color = 0xffffff,
                    linewidth = 1
                } = {}) {
        this.maxPoints = maxPoints;
        this.positions = [];

        this.geometry = new BufferGeometry();
        this.material = new LineBasicMaterial({
            color,
            linewidth
        });

        this.line = new Line(this.geometry, this.material);
    }

    addPoint(vec3) {
        this.positions.push(vec3.clone());

        if (this.positions.length > this.maxPoints)
            this.positions.shift();

        const array = new Float32Array(this.positions.length * 3);
        this.positions.forEach((p, i) => {
            array[3 * i]     = p.x;
            array[3 * i + 1] = p.y;
            array[3 * i + 2] = p.z;
        });

        this.geometry.setAttribute(
            'position',
            new BufferAttribute(array, 3)
        );
        this.geometry.computeBoundingSphere();
    }

    clear() {
        this.positions.length = 0;
        this.geometry.setAttribute(
            'position',
            new BufferAttribute(new Float32Array(0), 3)
        );
    }
}

const shaftGeometryRound = new CylinderGeometry(1, 1, 1, 16);
const shaftGeometrySquare = new BoxGeometry(1, 1, 1);
const headGeometryRound = new ConeGeometry(1, 1, 16);
const headGeometrySquare = new ConeGeometry(1, 1, 4);

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
        const dx = new Vector3(h, 0, 0);
        const dy = new Vector3(0, h, 0);
        const dz = new Vector3(0, 0, h);

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

        return new Vector3(
            (Fy1.z - Fy0.z - (Fz1.y - Fz0.y)) / (2 * h),
            (Fz1.x - Fz0.x - (Fx1.z - Fx0.z)) / (2 * h),
            (Fx1.y - Fx0.y - (Fy1.x - Fy0.x)) / (2 * h)
        );
    }

    curlMagnitude(position, h=1e-2) {
        return this.curl(position, h).length();
    }
}

export class ArrowField extends Group {
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
        this._shaftWidth = shaftWidth;
        this._headWidth  = headWidth;
        this._headLength = headLength;

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

export class Sphere {
    constructor(
        group,
        position=new Vector3(0, 0, 0),
        radius=1,
        makeTrail=false,
        {
            segments=24,
            material=new MeshStandardMaterial({
                color: "yellow",
                opacity: 1,
                transparent: true,
                wireframe: false,
                metalness:0.7,
                roughness:0.2
            })
        }) {
        this._sphere = new Mesh(new SphereGeometry(radius, segments, segments), material);
        this._sphere.position.copy(position);
        this._sphere.castShadow = true;
        this._group = group;
        this._group.add(this._sphere);
        this._trail = null;
        if (makeTrail) this.enableTrail();
    }

    enableTrail({
                    maxPoints = 200,
                    color = this._sphere.material.color
                } = {}) {
        this._trail = new Trail({ maxPoints, color });
        this._group.add(this._trail.line);
    }

    disableTrail() {
        if (!this._trail) return;
        this._group.remove(this._trail.line);
        this._trail = null;
    }

    moveTo(newPosition) {
        this._sphere.position.copy(newPosition);
        if (this._trail)
            this._trail.addPoint(this._sphere.position);
    }
}

export class Arrow extends Group {
    constructor(position, axis, {
        color = 0xff0000,
        shaftWidth = 0.1, // times the length of the axis
        headWidth = 2,    // times the width of the shaft
        headLength = 5,   // times the width of the shaft
        opacity = 1,
        round = false,
        visible = true,
        makeTrail = false
    } = {}) {
        super();

        this._headLength = headLength;
        this._shaftWidth = shaftWidth;
        this._headWidth = headWidth;
        this._axis = axis;

        const shaftGeometry = round ? shaftGeometryRound : shaftGeometrySquare;
        const headGeometry  = round ? headGeometryRound  : headGeometrySquare;
        const material = new MeshStandardMaterial({
            color: color,
            opacity: opacity,
            transparent: true
        });

        this._shaft = new Mesh(shaftGeometry, material);
        this._head = new Mesh(headGeometry, material);
        if (!round)
            this._head.rotation.y = Math.PI / 4; // By default, the rotation of square-shaped head is 45 degrees off

        this.add(this._shaft, this._head);
        this.position.copy(position);
        this.updateAxis(axis);
        this.visible = visible;
        this._trail = null;
        if (makeTrail) this.enableTrail();
    }

    enableTrail({
                    maxPoints = 200,
                    color = this._shaft.material.color
                } = {}) {
        this._trail = new Trail({ maxPoints, color });
        this.add(this._trail.line);
    }

    get axis() { return this._axis.clone(); }

    disableTrail() {
        if (!this._trail) return;
        this.remove(this._trail.line);
        this._trail = null;
    }

    updateAxis(newAxis) {
        this._axis.copy(newAxis);
        const totalLength = newAxis.length();
        if (totalLength < 1e-6)
            return;

        const quaternion = new Quaternion().setFromUnitVectors(
            UnitVectorE2,
            newAxis.clone().normalize()
        );
        this.setRotationFromQuaternion(quaternion);

        const shaftWidth = totalLength * this._shaftWidth;
        const headLength = this._headLength * shaftWidth;
        const shaftLength = Math.max(totalLength - headLength, 1e-6);

        this._shaft.scale.set(shaftWidth, shaftLength, shaftWidth);
        this._shaft.position.y = shaftLength * 0.5;
        this._head.scale.set(this._headWidth * shaftWidth, headLength, this._headWidth * shaftWidth);
        this._head.position.y = shaftLength + headLength * 0.5;
    }

    updateColor = (color) => this._shaft.material.color = color;

    updateOpacity = (opacity) => {
        this._shaft.material.opacity = opacity;
        this._head.material.opacity = opacity;
    }

    moveTo(newPositionVector) {
        this.position.copy(newPositionVector);
        if (this._trail)
            this._trail.addPoint(this.position);
    }

    positionVectorTo = (other) => new Vector3().copy(other.position).sub(this.position);

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
            const series = this.series.get(name);
            if (!series) continue;

            series.data.push({ t: this.time, v: value });
            if (series.data.length > this.maxPoints) series.data.shift();
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

        const width = this.canvas.width;
        const height = this.canvas.height;

        const { tMin, tMax } = this._getTimeRange();
        const span = tMax - tMin;

        const tStep = this._niceStep(span / 10);

        for (let t = Math.ceil(tMin / tStep) * tStep; t <= tMax; t += tStep) {
            const x = (t - tMin) / span * width;
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }

        // horizontale grid (Y blijft hetzelfde)
        const yStep = this._niceStep(height / (this.scaleY * 6));
        for (let v = -1000; v <= 1000; v += yStep) {
            const y = this.offsetY - v * this.scaleY;
            if (y < 0 || y > height) continue;
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
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

class Helix extends Curve {
    constructor(position, axis, coils=25, radius=0.4, waveAmp=0.05, wavePhase=0){
        super();
        this.start = position.clone();
        this.coils = coils;
        this._axis = axis;
        this.radius = radius;
        this.waveAmp = waveAmp;
        this.wavePhase = wavePhase;
    }

    updateAxis = (newAxis) => this._axis.copy(newAxis);

    getPoint(t){
        const length = this._axis.length();
        const angle = t * this.coils * Math.PI * 2;
        const x = Math.cos(angle) * this.radius;
        const y = Math.sin(angle) * this.radius;

        // Longitudinal wave across spring
        const z = t * length + this.waveAmp * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * t * 3 - this.wavePhase);

        const point = new Vector3(x, y, z);
        const quaternion = new Quaternion();
        quaternion.setFromUnitVectors(new Vector3(0, 0, 1), this._axis.clone().normalize());
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
        position = new Vector3(0, 0, 0),
        radius=1,
        velocity = new Vector3(0, 0, 0),
        mass=1,
        opacity = 1,
        wireframe = false,
        color=0xffff00,
        makeTrail=false,
        segments = 24})
    {
        const material = new MeshStandardMaterial({
            color: color,
            opacity: opacity,
            transparent: true,
            wireframe: wireframe,
            metalness:0.7,
            roughness:0.2
        });
        this._sphere = new Sphere(parent, position, radius, makeTrail,
            {segments: segments, material: material});
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
        this._axis = axis;

        this.geometry = new TubeGeometry(this.curve, tubularSegments, coilRadius, radialSegments, false);
        const material = new MeshStandardMaterial({color: color, metalness:0.3, roughness:0.4});
        this.spring = new Mesh(this.geometry, material);
        parent.add(this.spring);
    }

    #regenerateTube() {
        this.spring.geometry.dispose();
        this.spring.geometry = new TubeGeometry(
            this.curve, this.tubularSegments, this.coilRadius, this.radialSegments, false
        );
    }

    updateAxis(newAxis) {
        this._axis = newAxis;
        this.curve.updateAxis(this._axis);
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
        const displacement = this._axis.y - this.curve.start.y;
        this.curve.waveAmp = Math.min(Math.abs(displacement) / 10, 0.3); // max amplitude 0.3
        this.#regenerateTube();
    }

    force = () => -this.k * this.displacement();
    displacement = () => this.restLength - this._axis.length();
}
