import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { BufferGeometry, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight, Vector3, Color,
    MathUtils, CylinderGeometry, BoxGeometry, ConeGeometry, Group, AxesHelper, GridHelper, Mesh, PlaneGeometry,
    MeshPhongMaterial, DoubleSide, Box3, MeshStandardMaterial, Quaternion, Matrix4, Curve, SphereGeometry, Line,
    InstancedMesh, InstancedBufferAttribute, BufferAttribute, LineBasicMaterial, TubeGeometry, MeshBasicMaterial,
    CircleGeometry, Vector2 } from "three";

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

export class AxesParameters {
    constructor({
                    layoutType = Axes.Type.MATLAB,
                    divisions = 10,
                    frame = true,
                    annotations = true,
                    xyPlane = true,
                    xzPlane = true,
                    yzPlane = true,
                    axisLabels = ["X", "Y", "Z"]
                } = {}) {
        this.layoutType = layoutType;
        this.divisions = divisions;
        this.frame = frame;
        this.annotations = annotations;
        this.xyPlane = xyPlane;
        this.xzPlane = xzPlane;
        this.yzPlane = yzPlane;
        this.axisLabels = axisLabels;
    }
}

export class Axes extends Group {
    static Type = Object.freeze({
        CLASSICAL: "classical",
        MATLAB: "MatLab"
    });

    static toCartesian(radius, theta, phi) {
        return new Vector3(
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(theta)
        );
    }

    static from(boundingBox, divisions, padding=1.1) {
        const sizeVec = boundingBox.getSize(new Vector3());
        const maxSize = padding * Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
        return new Axes(maxSize, divisions);
    }

    constructor(size, divisions) {
        super();
        this._size = size;
        this._divisions = divisions;
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

    withSettings({
                     frame=true,
                     annotations=true,
                     xyPlane=true,
                     xzPlane=true,
                     yzPlane=true } = {}) {
        this._layout.frame.visible = frame;
        this._annotations.visible = annotations;
        this._layout.xy.visible = xyPlane;
        this._layout.xz.visible = xzPlane;
        this._layout.yz.visible = yzPlane;
        return this;
    }

    withLayout(type) {
        this._layout?.dispose?.();
        this._layout = type === Axes.Type.MATLAB ?
            new MatlabAxesLayout(this._size, this._divisions) :
            new ClassicalAxesLayout(this._size, this._divisions);
        this.add(this._layout);

        return this;
    }

    frameTo(boundingBox, bottomAlign=true) {
        this.updateMatrixWorld(true);
        const scaledBox = new Box3().setFromObject(this);
        let center = new Vector3();
        boundingBox.getCenter(center);
        // this.position.copy(center);
        const deltaY = boundingBox.min.y - scaledBox.min.y;
        this.position.y = bottomAlign? this.position.y + deltaY : this.position.y;
        this.position.x = center.x;
        this.position.z = center.z;
    }

    withAnnotations(container, type, axisLabels=["X", "Y", "Z"]) {
        this._annotations?.dispose?.();
        this._annotations = (type === Axes.Type.MATLAB ) ?
            new MatlabAnnotations(container, this._size, this._divisions, axisLabels) :
            new ClassicalAnnotations(container, this._size, this._divisions, axisLabels);
        this.add(this._annotations);
        return this;
    }

    get annotations() { return this._annotations; }
    get layout() { return this._layout; }

    onWindowResize = () => this._annotations?.onWindowResize()
    render = (scene, camera) => this._annotations?.render(scene, camera);

    shiftBy(translationVector) {
        this._annotations?.shiftBy(translationVector);
        this._layout?.shiftBy(translationVector);
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
        this._container = container;
        this._renderer = new CSS2DRenderer();
        this._renderer.domElement.style.position = "absolute";
        this._renderer.domElement.style.top = 0;
        this._renderer.domElement.style.left = 0;
        this._renderer.domElement.style.width = "100%";
        this._renderer.domElement.style.height = "100%";
        this._renderer.domElement.style.pointerEvents = "none"; // do not process mouse events
        this._renderer.domElement.style.zIndex = "5"; // on top of canvas

        this._labels = [];

        this._container.appendChild(this._renderer.domElement);
        this.onWindowResize();
    }

    onWindowResize() {
        this._renderer.setSize(this._container.clientWidth, this._container.clientHeight);
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
        this._frame = null; // to be created in concrete subclasses
        this._xy = new Group();
        this._xz = new Group();
        this._yz = new Group();
        this.add(this._xy, this._xz, this._yz);
    }

    _createFrame(position, size) {
        const eps = 0.025;
        this._frame = new AxesHelper(size);
        this._frame.position.copy(position.add(new Vector3(eps, eps, eps)));
        this.add(this._frame);
    }

    _createPlane(color, rotate, gridPos, planePos) {
        const grid = new GridHelper(this._size, this._divisions, 0x333333, 0x333333);
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
    get frame() { return this._frame; }
    get xy() { return this._xy; }
    get xz() { return this._xz; }
    get yz() { return this._yz; }

    shiftBy(translationVector) {
        this._xy.position.add(translationVector);
        this._xz.position.add(translationVector);
        this._yz.position.add(translationVector);
    }
}

class ClassicalAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        this._createFrame(new Vector3(0, 0, 0), 0.5 * size);
        const [xyGrid, xzPlane] = this._createPlane(0x4444ff, v => v.rotateX(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        const [xzGrid, yzPlane] = this._createPlane(0x44ff44, v => v.rotateY(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        const [yzGrid, xyPlane] = this._createPlane(0xff4444, v => v.rotateZ(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        this._xy.add(xyPlane, xyGrid);
        this._xz.add(xzPlane, xzGrid);
        this._yz.add(yzPlane, yzGrid);
    }
}

class MatlabAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        this._createFrame(new Vector3(-0.5 * size, 0, -0.5 * size), size);
        const [xyGrid, xzPlane] = this._createPlane(0x4444ff, v => v.rotateX(Math.PI / 2), [0, 1, -1], [0, 0, 0]);
        const [xzGrid, yzPlane] = this._createPlane(0x44ff44, v => v.rotateY(Math.PI / 2), [0, 0, 0], [-1, 1, 0]);
        const [yzGrid, xyPlane] = this._createPlane(0xff4444, v => v.rotateZ(Math.PI / 2), [-1, 1, 0], [0, 1, -1]);
        this._xy.add(xyPlane, xyGrid);
        this._xz.add(xzPlane, xzGrid);
        this._yz.add(yzPlane, yzGrid);
    }
}

class ClassicalAnnotations extends AxesAnnotation {
    constructor(container, size, divisions, axisLabels) {
        super(container);

        const step = size / divisions;
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
    constructor(container, size, divisions, axisLabels) {
        super(container);

        const step = (2 * size) / divisions;
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

/**
 * Use this class to create axes and manage its life cycle.
 */
export class AxesController {
    constructor({
                    parentGroup,
                    canvasContainer,
                    axesParameters,
                    scene
                }) {
        this._parentGroup = parentGroup;
        this._canvasContainer = canvasContainer;
        this._axesParameters = axesParameters;
        this._scene = scene;
        this._axes = null;
    }

    createFromBoundingBox(boundingBox, bottomAlign=true) {
        if (this._axes) {
            this._axes.dispose();
            this._parentGroup.remove(this._axes);
        }

        const { layoutType, divisions, axisLabels } = this._axesParameters;
        const { frame, annotations, xyPlane, xzPlane, yzPlane } = this._axesParameters;

        this._axes = Axes.from(boundingBox, divisions)
            .withLayout(layoutType)
            .withAnnotations(this._canvasContainer, layoutType, axisLabels)
            .withSettings(
                { frame, annotations, xyPlane, xzPlane, yzPlane });

        if (layoutType === Axes.Type.MATLAB) // center the MatLab axes around the object to be displayed
            this._axes.frameTo(boundingBox, bottomAlign);
        this._axes.onWindowResize();
        this._parentGroup.add(this._axes);
    }

    updateSettings() {
        if (!this._axes) return;

        const { frame, annotations, xyPlane, xzPlane, yzPlane } = this._axesParameters;
        this._axes.withSettings(
            { frame, annotations, xyPlane, xzPlane, yzPlane });
    }

    render = (camera) => this._axes?.render(this._scene, camera);
    resize = () => this._axes?.onWindowResize();

    dispose() {
        if (!this._axes) return;
        this._axes.dispose();
        this._parentGroup.remove(this._axes);
        this._axes = null;
    }
}

export class Plot3DView {
    constructor(scene, canvas, boundingBox) {
        this._scene = scene;
        this._camera = new PerspectiveCamera(45, 1, 0.1, 100);
        this._renderer = new WebGLRenderer({ alpha: true, antialias: true, canvas: canvas });
        this._controls = new OrbitControls(this._camera, canvas);
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.08;
        //this.controls.screenSpacePanning = false;
        //this.controls.maxPolarAngle = Math.PI * 0.95;

        this.#setupLights();
        this.frame(boundingBox);
    }

    #setupLights() {
        this._scene.add(
            new HemisphereLight(0xffffff, 0xeeeeee, 0.6),
            new DirectionalLight(0xffffff, 0.9)
        );
    }

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
    get renderer() { return this._renderer; }

    render() {
        this._controls.update();
        this._renderer.render(this._scene, this._camera);
    }
}

class TrailLine {
    constructor({
                    maxPoints = 200,
                    color = 0xffffff,
                    linewidth = 1,
        } = {}) {
        this._maxPoints = maxPoints;
        this._positions = [];
        this._geometry = new BufferGeometry();
        this._material = new LineBasicMaterial({color, linewidth});
        this._line = new Line(this._geometry, this._material);
    }

    addPoint(position) {
        const localPos = this._line.worldToLocal(position.clone());
        this._positions.push(localPos);

        if (this._positions.length > this._maxPoints)
            this._positions.shift();

        const array = new Float32Array(this._positions.length * 3);
        this._positions.forEach((pos, i) => {
            array[3 * i]     = pos.x;
            array[3 * i + 1] = pos.y;
            array[3 * i + 2] = pos.z;
        });

        this._geometry.setAttribute('position', new BufferAttribute(array, 3));
        this._geometry.computeBoundingSphere();
    }

    clear() {
        this._positions.length = 0;
        this._geometry.setAttribute('position', new BufferAttribute(new Float32Array(0), 3));
    }
}

export class Trail {
    constructor(attachedToObject) {
        this._parent = attachedToObject;
        this._trailStep = 10;
        this._trailAccumulator = 0;
        this._trail = null;
    }

    update(increment=1) {
        if (!this._trail) return;
        this._trailAccumulator += increment;
        if (this._trailAccumulator >= this._trailStep) {
            this._trail.addPoint(this._parent.getWorldPosition(new Vector3()));
            this._trailAccumulator = 0;
        }
    }

    enable({
           maxPoints = 200,
           color = 0xffffff,
           trailStep = 10,
           linewidth = 1
    } = {}) {
        this._trail = new TrailLine({ maxPoints, color, linewidth });
        this._trailAccumulator = 0;
        this._trailStep = trailStep;

        if (this._parent)
            this._parent.parent.add(this._trail._line);
    }

    dispose() {
        if (!this._trail) return;
        if (this._trail._line) {
            if (this._trail._line.geometry)
                this._trail._line.geometry.dispose();
            if (this._trail._line.material)
                this._trail._line.material.dispose();
            this.remove(this._trail._line);
        }
        this._trail = null;
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
        color=0xffff00,
        makeTrail=false,
        {
            segments=24,
            material=new MeshStandardMaterial({
                color: color,
                opacity: 1,
                transparent: true,
                wireframe: false,
                metalness:0.7,
                roughness:0.2
            })
        } = {}) {
        this._mesh = new Mesh(new SphereGeometry(radius, segments, segments), material);
        this._mesh.position.copy(position);
        this._mesh.castShadow = true;
        this._group = group;
        this._group.add(this._mesh);
        this._trail = null;
        if (makeTrail) this.enableTrail();
    }

    enableTrail({
                    maxPoints = 200,
                    color = this._mesh.material.color
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
        this._mesh.position.copy(newPosition);
        this._trail?.addPoint(this._mesh.position);
    }
}

export class Cylinder {
    constructor(
        group,
        position = new Vector3(0, 0, 0),
        axis = new Vector3(0, 1, 0),   // richting + lengte
        radius = 1,
        makeTrail = false,
        {
            radialSegments = 24,
            heightSegments = 1,
            openEnded = false,
            material = new MeshStandardMaterial({
                color: "yellow",
                opacity: 1,
                transparent: true,
                wireframe: false,
                metalness: 0.7,
                roughness: 0.2
            })
        } = {}
    ) {
        const height = axis.length();
        const direction = axis.clone().normalize();

        this._cylinder = new Mesh(
            new CylinderGeometry(
                radius,
                radius,
                height,
                radialSegments,
                heightSegments,
                openEnded
            ),
            material
        );

        const yAxis = new Vector3(0, 1, 0);
        const quaternion = new Quaternion().setFromUnitVectors(yAxis, direction);
        this._cylinder.quaternion.copy(quaternion);

        // position is the start of the cylinder
        const centerOffset = direction.clone().multiplyScalar(height / 2);
        this._cylinder.position.copy(position).add(centerOffset);

        this._cylinder.castShadow = true;

        this._group = group;
        this._group.add(this._cylinder);

        this._trail = null;
        if (makeTrail) this.enableTrail();
    }

    updateAxis(newAxis) {
        this._axis = newAxis;
    }

    enableTrail({ maxPoints=1000, color=0xffff00, lineWidth=1, trailStep=10 } = {}) {
        this._trail = new Trail(this);
        this._trail.enable({maxPoints, color, lineWidth, trailStep });
    }

    updateTrail(dt) { this._trail?.update(dt); }
    disposeTrail() { this._trail?.dispose(); }

    moveTo(newPosition) {
        this._cylinder.position.copy(newPosition);
        if (this._trail)
            this._trail.addPoint(this._cylinder.position);
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

    get axis() { return this._axis.clone(); }


    enableTrail({ maxPoints=1000, color=0xffff00, lineWidth=1, trailStep=10 } = {}) {
        this._trail = new Trail(this);
        this._trail.enable({maxPoints, color, lineWidth, trailStep });
    }

    updateTrail(dt) { this._trail?.update(dt); }
    disposeTrail() { this._trail?.dispose(); }

    dispose() {
        this.disposeTrail();

        // DO NOT dispose shared geometries
        if (this._shaft) {
            if (this._shaft.material)
                this._shaft.material.dispose();
            this.remove(this._shaft);
            this._shaft = null;
        }

        if (this._head) { // head.material is the same object as share.material, so has already been disposed
            this.remove(this._head);
            this._head = null;
        }

        this.clear();
        this._axis = null;
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

    updateOpacity = (opacity) => {
        this._shaft.material.opacity = opacity;
        this._head.material.opacity = opacity;
    }

    updateColor = (color) => this._shaft.material.color = color;
    moveTo(newPositionVector) { this.position.copy(newPositionVector); }
    positionVectorTo = (other) => other.position.clone().sub(this.position);
    distanceToSquared = (other) => this.position.distanceToSquared(other.position);
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
        this._position.addScaledVector(this._velocity, dt).addScaledVector(a, 0.5 * dt * dt);
        const a2 = force.multiplyScalar(1 / this._mass);
        this._velocity.addScaledVector(a.add(a2), 0.5 * dt);
    }

    get position() { return this._position.clone(); }

    get velocity() { return this._velocity.clone(); }

    get mass() { return this._mass; }

    moveTo(newPosition) { this._position.copy(newPosition); }

    accelerateTo(newVelocity) { this._velocity.copy(newVelocity); }

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
        this._sphere = new Sphere(parent, position, radius, color, makeTrail,{segments: segments, material: material});
        this._ball = new PhysicalObject(position, velocity, mass);
        this._trail = null;
        if (makeTrail) this.enableTrail();
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

    enableTrail({ maxPoints=1000, color=0xffff00, lineWidth=1, trailStep=10 } = {}) {
        this._trail = new Trail(this);
        this._trail.enable({maxPoints, color, lineWidth, trailStep });
    }

    updateTrail(dt) { this._trail?.update(dt); }
    disposeTrail() { this._trail?.dispose(); }
    accelerateTo = (newVelocity) => this._ball.accelerateTo(newVelocity);

    get position() { return this._ball.position; }
    get velocity() { return this._ball.velocity; }
    get mass() { return this._ball.mass; }
    get kineticEnergy() { return this._ball.kineticEnergy(); }
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
        this._longtudinalOscillation = longitudinalOscillation;
        this._radius = radius;
        this._curve = new Helix(position, axis, coils, radius);
        this._tubularSegments = tubularSegments;
        this._radialSegments = radialSegments;
        this._coilRadius = coilRadius;
        this._restLength = axis.length();
        this._k = k;
        this._position = position;
        this._axis = axis;

        this._geometry = new TubeGeometry(this._curve, tubularSegments, coilRadius, radialSegments, false);
        const material = new MeshStandardMaterial({color: color, metalness:0.3, roughness:0.4});
        this._mesh = new Mesh(this._geometry, material);
        parent.add(this._mesh);
    }

    #regenerateTube() {
        this._mesh.geometry.dispose();
        this._mesh.geometry = new TubeGeometry(
            this._curve, this._tubularSegments, this._coilRadius, this._radialSegments, false
        );
    }

    updatePosition(newPosition) { this._curve.start.copy(newPosition); }

    updateAxis(newAxis) {
        this._axis = newAxis;
        this._curve.updateAxis(this._axis);
        this._longtudinalOscillation ?
            this.#updateWithLongitudinal() :
            this.#updateWithoutLongitudinal();
    }

    update = (time) => this._curve.wavePhase = time * 4;

    #updateWithoutLongitudinal() {
        this.#regenerateTube();
    }

    #updateWithLongitudinal(time) {
        // Longitudinal wave amplitude coupled to spring elongation
        const displacement = this._axis.y - this._curve.start.y;
        this._curve.waveAmp = Math.min(Math.abs(displacement) / 10, 0.3); // max amplitude 0.3
        this.#regenerateTube();
    }

    get position() { return this._position; }
    get axis() { return this._axis; }
    get k() { return this._k; }
    get force() { return -this._k * this.displacement; }
    get displacement() {return this._restLength - this._axis.length(); }
}

class Particle {
    constructor(position, radius, color, mass=1, temperature=0.5, k=1) {
        this._position = position;
        this._radius = radius;
        this._mass = mass;
        this._k = k;
        this._temperature = temperature;
        this._mesh = null;     // subclass should set this
        this._velocity = null; // subclass should set this
    }

    show = () => this._mesh.visible = true;
    hide = () => this._mesh.visible = false;

    get position() { return this._position; }
    get velocity() { return this._velocity; }
    get radius() { return this._radius; }
    get mass() { return this._mass; }

    speed = () => this._velocity.length();
    kineticEnergy = () => 0.5 * this._mass * this._velocity.lengthSq();
    scaleVelocity = (scale) => this._velocity.multiplyScalar(scale);

    isCollidingWith(otherBall) {
        const r = this.radius + otherBall.radius;
        return this.position.distanceToSquared(otherBall.position) < r * r;
    }

    collideWith(other) {
        const r = other.position.clone().sub(this.position);
        const distSq = r.lengthSq();
        const minDist = this.radius + other.radius;

        if (distSq === 0 || distSq >= minDist * minDist) return;

        const dist = Math.sqrt(distSq);
        const n = r.clone().divideScalar(dist);

        // Disentangle
        const overlap = minDist - dist;
        this._position.addScaledVector(n, -overlap / 2);
        other._position.addScaledVector(n, overlap / 2);

        const vRel = this._velocity.clone().sub(other._velocity);
        const velocityAlongNormal = vRel.dot(n);

        if (velocityAlongNormal > 0) return;

        const impulse = (2 * velocityAlongNormal) / (this.mass + other.mass);
        this._velocity.addScaledVector(n, -impulse * other.mass);
        other._velocity.addScaledVector(n, impulse * this.mass);
    }
}

export class Particle2D extends Particle {
    constructor(parent, {
        position = new Vector2(0, 0),
        radius = 1,
        color = "0xffff00",
        mass = 1,
        temperature = 0.5,
        k = 1
    } ={}) {
        super(position, radius, mass, temperature, k);
        this.reset();

        const geometry = new CircleGeometry(radius, 24);
        const material = new MeshBasicMaterial({color});
        this._mesh = new Mesh(geometry, material);
        parent.add(this._mesh);
    }

    updateMesh = () => this._mesh.position.set(this.position.x, this.position.y, 0);

    reset() {
        this._position.set(0, 0);
        // Init speed based on temperature: v_rms^2 = 2 k T / m (2D)
        const averageKineticEnergy = Math.sqrt(2 * this._k * this._temperature / this._mass);
        const angle = Math.random() * 2 * Math.PI;
        this._velocity = new Vector2(Math.cos(angle), Math.sin(angle)).multiplyScalar(averageKineticEnergy);
    }

    #confineToBox(size) {
        const half = size / 2;
        ["x","y"].forEach(axis => {
            if(this._position[axis] > half - this._radius) this._velocity[axis] = -Math.abs(this._velocity[axis]);
            if(this._position[axis] < -half + this._radius) this._velocity[axis] =  Math.abs(this._velocity[axis]);
        });
    }

    moveWithin(boxSize) {
        this._position.add(this._velocity);
        this.#confineToBox(boxSize);
    }
}

export class ParticleTrail2D {
    constructor(parent, nPath = 500000) {
        this._dust = new Array(nPath);
        this._pushIndex = -1;
        this._index = -1;

        for (let i = 0; i < nPath; i++)
            this._dust[i] = new Vector2(0, 0);

        this._positions = new Float32Array(nPath * 3);
        this._colors    = new Float32Array(nPath * 3);

        this._geometry = new BufferGeometry();
        this._geometry.setAttribute("position", new BufferAttribute(this._positions, 3));
        this._geometry.setAttribute("color", new BufferAttribute(this._colors, 3));

        this._material = new LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 1,
            depthWrite: false
        });

        this._line = new Line(this._geometry, this._material);
        parent.add(this._line);
    }

    reset() {
        this._index = -1;
        this._pushIndex = -1;
    }

    increment(ball) {
        if (this._index++ > 400 && this._pushIndex === -1)
            this._pushIndex = 0;

        if (this._pushIndex <= -1) return;

        this._dust[this._pushIndex].copy(ball.position);
    }

    draw(fadeLength=1000) {
        if (this._pushIndex <= -1) return;

        const startIndex = Math.max(0, this._pushIndex - fadeLength);
        for (let i = startIndex; i <= this._pushIndex; i++) {
            const pos = this._dust[i];
            this._positions[i * 3]     = pos.x;
            this._positions[i * 3 + 1] = pos.y;
            this._positions[i * 3 + 2] = 0;

            // fade factor: 0 = old, 1 = new
            const t = (i - startIndex) / (this._pushIndex - startIndex);
            this._colors[i * 3]     = 0.8 * t;  // R
            this._colors[i * 3 + 1] = 0.0;      // G
            this._colors[i * 3 + 2] = 1.0 * t;  // B
        }

        this._geometry.setDrawRange(startIndex, this._pushIndex - startIndex + 1);
        this._geometry.attributes.position.needsUpdate = true;
        this._geometry.attributes.color.needsUpdate = true;

        this._pushIndex = (this._pushIndex + 1) % this._dust.length;        }
}

export class Particle3D extends Particle {
    constructor(parent, {
        position = new Vector3(0, 0, 0),
        radius = 1,
        color = "0xffff00",
        mass = 1,
        temperature = 0.5,
        k = 1
    } ={}) {
        super(position, radius, mass, temperature, k);
        this.reset();

        const geometry = new SphereGeometry(radius, 16, 16);
        const material = new MeshBasicMaterial({ color });
        this._mesh = new Mesh(geometry, material);
        parent.add(this._mesh);
    }

    updateMesh() { this._mesh.position.copy(this._position); }

    reset() {
        this._position.set(0, 0, 0);
        const averageKineticEnergy = Math.sqrt(3 * this._k * this._temperature / this._mass);
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        this._velocity = new Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi)
        ).multiplyScalar(averageKineticEnergy);
    }

    #confineToBox(size) {
        const half = size / 2;
        ["x","y","z"].forEach(axis => {
            if(this._position[axis] > half - this._radius) this._velocity[axis] = -Math.abs(this._velocity[axis]);
            if(this._position[axis] < -half + this._radius) this._velocity[axis] =  Math.abs(this._velocity[axis]);
        });
    }

    moveWithin(boxSize) {
        this._position.add(this._velocity);
        this.#confineToBox(boxSize);
    }
}

export class ParticleTrail3D {
    constructor(parent, nPath=20000){
        this._dust = new Array(nPath).fill().map(_=>new Vector3());
        this._positions = new Float32Array(nPath*3);
        this._colors = new Float32Array(nPath*3);
        this._pushIndex=-1; this._index=-1;

        this._geometry = new BufferGeometry();
        this._geometry.setAttribute("position", new BufferAttribute(this._positions,3));
        this._geometry.setAttribute("color", new BufferAttribute(this._colors,3));

        this._material = new LineBasicMaterial({
            vertexColors:true,
            transparent:true,
            opacity:1,
            depthWrite:false
        });
        this._line = new Line(this._geometry, this._material);
        parent.add(this._line);
    }

    reset() {
        this._index = -1;
        this._pushIndex = -1;
    }

    increment(ball) {
        if (this._index++ > 400 && this._pushIndex === -1)
            this._pushIndex = 0;

        if (this._pushIndex <= -1) return;

        this._dust[this._pushIndex].copy(ball.position);
    }

    draw(fadeLength=1000) {
        if (this._pushIndex <= -1) return;

        const startIndex = Math.max(0, this._pushIndex - fadeLength);
        for (let i = startIndex; i <= this._pushIndex; i++) {
            const pos = this._dust[i];
            this._positions[i * 3]     = pos.x;
            this._positions[i * 3 + 1] = pos.y;
            this._positions[i * 3 + 2] = pos.z;

            // fade factor: 0 = old, 1 = new
            const t = (i - startIndex) / (this._pushIndex - startIndex);
            this._colors[i * 3]     = 0.8 * t;  // R
            this._colors[i * 3 + 1] = 0.0;      // G
            this._colors[i * 3 + 2] = 1.0 * t;  // B
        }

        this._geometry.setDrawRange(startIndex, this._pushIndex - startIndex + 1);
        this._geometry.attributes.position.needsUpdate = true;
        this._geometry.attributes.color.needsUpdate = true;

        this._pushIndex = (this._pushIndex + 1) % this._dust.length;
    }
}
