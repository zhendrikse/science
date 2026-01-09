import * as THREE from "three";
import * as math from "mathjs";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer";
import {ParametricGeometry} from "three/addons/geometries/ParametricGeometry";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import { ThreeJsUtils } from 'https://www.hendrikse.name/science/js/three-js-utils.js';

export class Axes {
    constructor(parentGroup) {
        this.group = new THREE.Group();
        parentGroup.add(this.group);

        this.layout = null;
        this.annotations = null;
    }

    static toCartesian(radius, theta, phi) {
        return new THREE.Vector3(
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            1 + radius * Math.cos(theta)
        );
    }

    setLayout(layout) {
        this.layout?.dispose?.();
        this.layout = layout;
        this.group.add(layout.group);
    }

    setAnnotations(annotations) {
        this.annotations?.dispose?.();
        this.annotations = annotations;
        this.group.add(annotations.group);
    }

    show() {
        this.group.visible = true;
    }

    hide() {
        this.group.visible = false;
    }

    boundingBox() {
        this.group.updateMatrixWorld(true);
        return new THREE.Box3().setFromObject(this.group).clone();
    }

    render(scene, camera) {
        this.annotations?.render(scene, camera);
    }
}

export class AxesLayout {
    constructor(size = 5, divisions = 10) {
        this.size = size;
        this.divisions = divisions;
        this.group = new THREE.Group();
    }

    dispose() {
        this.group.clear();
    }
}

export class ClassicalAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        const eps = 0.025;

        const axes = new THREE.AxesHelper(size);
        axes.position.set(-0.5 * size + eps, eps, -0.5 * size + eps);
        this.group.add(axes);

        this.#addPlane(0x4444ff, v => v.rotateX(Math.PI / 2)); // XZ
        this.#addPlane(0x44ff44, v => v.rotateY(Math.PI / 2)); // YZ
        this.#addPlane(0xff4444, v => v.rotateZ(Math.PI / 2)); // XY
    }

    #addPlane(color, rotate) {
        const grid = new THREE.GridHelper(
            2 * this.size,
            this.divisions,
            0x333333,
            0x333333
        );

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(2 * this.size, 2 * this.size),
            new THREE.MeshPhongMaterial({
                color,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            })
        );

        rotate(grid);
        rotate(plane);

        grid.position.set(-0.5 * this.size, 0, -0.5 * this.size);
        plane.position.copy(grid.position);

        this.group.add(grid, plane);
    }
}

export class MatlabAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        const eps = 0.025;

        const axes = new THREE.AxesHelper(size);
        axes.position.set(-0.5 * size + eps, eps, -0.5 * size + eps);
        this.group.add(axes);

        this.#addPlane(0x4444ff, v => v.rotateX(Math.PI / 2), [0, 1, -1], [0, 0, 0]); // XZ
        this.#addPlane(0x44ff44, v => v.rotateY(Math.PI / 2), [0, 0, 0], [-1, 1, 0]);  // YZ
        this.#addPlane(0xff4444, v => v.rotateZ(Math.PI / 2), [-1, 1, 0], [0, 1, -1]); // XY
    }

    #addPlane(color, rotate, gridPos, planePos) {
        const grid = new THREE.GridHelper(
            this.size,
            this.divisions,
            0x333333,
            0x333333
        );

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(this.size, this.size),
            new THREE.MeshPhongMaterial({
                color,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            })
        );

        grid.position.set(
            gridPos[0] * 0.5 * this.size, gridPos[1] * 0.5 * this.size, gridPos[2] * 0.5 * this.size);
        plane.position.set(
            planePos[0] * 0.5 * this.size, planePos[1] * 0.5 * this.size, planePos[2] * 0.5 * this.size);

        rotate(grid);
        rotate(plane);

        this.group.add(grid, plane);
    }
}

export class AxesAnnotation {
    constructor(container) {
        this.group = new THREE.Group();

        this.renderer = new CSS2DRenderer();
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.top = "0";
        this.renderer.domElement.style.pointerEvents = "none";

        container.appendChild(this.renderer.domElement);
        this.#resize(container);
    }

    #resize(container) {
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    show() { this.group.visible = true; }
    hide() { this.group.visible = false; }
}

export class StandardAxesAnnotations extends AxesAnnotation {
    constructor(container, size=5, divisions=10, includeNegative=true) {
        super(container);

        const step = (2 * size) / divisions;
        for (let v = includeNegative ? -size : 0 ; v <= size; v += step) {
            this.group.add(this.#label(v.toFixed(1), new THREE.Vector3(v - 0.5 * size, 0, -0.5 * size)));
            this.group.add(this.#label(v.toFixed(1), new THREE.Vector3(-0.5 * size, v, -0.5 * size)));
            this.group.add(this.#label(v.toFixed(1), new THREE.Vector3(-0.5 * size, 0, v - 0.5 * size)));
        }

        this.group.add(
            this.#label("X", new THREE.Vector3(0.65 * size, 0, -0.5 * size), "white"),
            this.#label("Y", new THREE.Vector3(-0.5 * size, 1.1 * size, -0.5 * size), "white"),
            this.#label("Z", new THREE.Vector3(-0.5 * size, 0, 0.65 * size), "white")
        );
    }

    #label(text, pos, color = "yellow") {
        const div = document.createElement("div");
        div.textContent = text;
        div.style.color = color;
        div.style.fontSize = "14px";

        const obj = new CSS2DObject(div);
        obj.position.copy(pos);
        return obj;
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
        this.axes.render(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);
    }
}

export class Utils {
    static functionFrom(functionString) {
        try {
            return (u, v) => math.compile(functionString).evaluate({ u, v });
        } catch (err) {
            alert("Math.js parse error: " + err.message);
            return null;
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

    scaleValue = (value) => this.to !== this.from ? (value - this.from) / this.range() : 0;
    range = () => (this.from === Infinity || this.to === Infinity) ? Infinity : this.to - this.from;
    scaleParameter = (a) => this.range() * (a + this.from / this.range());
}

export class SurfaceDefinition {
    sample(u, v, target) {
        throw new Error("sample() not implemented");
    }
}

export class LiteralStringBasedSurfaceDefinition extends SurfaceDefinition {
    constructor(surfaceFunctions, xInterval, yInterval) {
        super();

        this.xFnCompiled = Utils.functionFrom(surfaceFunctions.xFn);
        this.yFnCompiled = Utils.functionFrom(surfaceFunctions.yFn);
        this.zFnCompiled = Utils.functionFrom(surfaceFunctions.zFn);

        this.xInterval = new Interval(this.#evaluateConstant(xInterval[0]), this.#evaluateConstant(xInterval[1]));
        this.yInterval = new Interval(this.#evaluateConstant(yInterval[0]), this.#evaluateConstant(yInterval[1]));
    }

    #evaluateConstant = (exprString) => Utils.functionFrom(exprString)(0, 0);

    sample(u, v, target) {
        const theta = this.xInterval.scaleParameter(u);
        const phi = this.yInterval.scaleParameter(v);

        target.set(
            this.xFnCompiled(theta, phi),
            this.yFnCompiled(theta, phi),
            this.zFnCompiled(theta, phi)
        );
    }
}

export class Surface {
    constructor(surfaceData) {
        this.surfaceData = surfaceData;
        const definition = new LiteralStringBasedSurfaceDefinition(
            surfaceData.parametrization,
            surfaceData.intervals[0],
            surfaceData.intervals[1]);

        this.surfaceFunction = (u, v, target) => definition.sample(u, v, target);
    }

    createGeometryWith = (resolution) =>
        new ParametricGeometry((u, v, target) => this.surfaceFunction(u, v, target), resolution, resolution);

    data = () => this.surfaceData;
    parametrization = () => this.surfaceFunction;
}

export class SurfaceView {
    constructor(parentGroup, surface) {
        this.parentGroup = parentGroup;
        this.surface = surface;
        this.group = new THREE.Group();
        this.parentGroup?.add(this.group);
        this._children = new Set();
    }

    #disposeSubViews = () => {
        for (const child of this._children) child.dispose?.();
        this._children.clear();
    }

    #disposeChild(child) {
        if (child.geometry) child.geometry.dispose();

        if (!child.material) return;
        if (Array.isArray(child.material))
            child.material.forEach(m => m.dispose());
        else
            child.material.dispose();
    }

    registerChild(view) {
        this._children.add(view);
        return view;
    }

    dispose() {
        this.#disposeSubViews();
        this._disposeObject(this.group);
        if (this.parentGroup) this.parentGroup.remove(this.group);
        this.group = null;
        this.parentGroup = null;
    }

    /** Deep Three.js cleanup */
    _disposeObject(object) {
        object.traverse(child => { if (child.isMesh) this.#disposeChild(child); });
        object.clear();
    }

    boundingBox() { return new THREE.Box3().setFromObject(this.group).clone(); }
    data() { return this.surface.data(); }
    hide() { this.group.visible = false; }
    moveTo(positionAsVector) { this.group.position.copy(positionAsVector); }
    material = (showWireframe, opacity) =>
        new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
            vertexColors: true,
            transparent: opacity < 1,
            opacity: opacity,
            metalness: 0.1,
            wireframe: showWireframe,
            roughness: 0.5
        });
    parametrization() { return this.surface.parametrization(); }
    position() { return this.group.position.clone(); }
    rotateBy = (delta) => this.group.rotation.y += delta;
    show() { this.group.visible = true; }
}

export class DifferentialGeometry {
    constructor(surface, { eps = 1e-4 } = {}) {
        this.parametrization = surface.parametrization();
        this.eps = eps;
    }

    derivatives(u, v) {
        const e = this.eps;

        // positions
        const p   = new THREE.Vector3();

        const pu1 = new THREE.Vector3();
        const pu0 = new THREE.Vector3();
        const pv1 = new THREE.Vector3();
        const pv0 = new THREE.Vector3();

        const pu1v1 = new THREE.Vector3();
        const pu1v0 = new THREE.Vector3();
        const pu0v1 = new THREE.Vector3();
        const pu0v0 = new THREE.Vector3();

        // sample
        this.parametrization(u, v, p);

        this.parametrization(u + e, v, pu1);
        this.parametrization(u - e, v, pu0);
        this.parametrization(u, v + e, pv1);
        this.parametrization(u, v - e, pv0);

        this.parametrization(u + e, v + e, pu1v1);
        this.parametrization(u + e, v - e, pu1v0);
        this.parametrization(u - e, v + e, pu0v1);
        this.parametrization(u - e, v - e, pu0v0);

        // first order derivatives (central difference)
        const Xu = pu1.clone().sub(pu0).multiplyScalar(1 / (2 * e));
        const Xv = pv1.clone().sub(pv0).multiplyScalar(1 / (2 * e));

        // second order derivatives (central difference)
        const Xuu = pu1.clone()
            .sub(p.clone().multiplyScalar(2))
            .add(pu0)
            .multiplyScalar(1 / (e * e));

        const Xvv = pv1.clone()
            .sub(p.clone().multiplyScalar(2))
            .add(pv0)
            .multiplyScalar(1 / (e * e));

        const Xuv = pu1v1.clone()
            .sub(pu1v0)
            .sub(pu0v1)
            .add(pu0v0)
            .multiplyScalar(1 / (4 * e * e));

        return { Xu, Xv, Xuu, Xuv, Xvv };
    }

    normalMeanGaussian(u, v) {
        const d = this.derivatives(u, v);
        const Xu = d.Xu, Xv = d.Xv;
        const N  = Xu.clone().cross(Xv).normalize();

        // First fundamental form
        const E = Xu.dot(Xu);
        const F = Xu.dot(Xv);
        const G = Xv.dot(Xv);

        // Second fundamental form
        const e = d.Xuu.dot(N);
        const f = d.Xuv.dot(N);
        const g = d.Xvv.dot(N);

        const EG_F2 = E * G - F * F;
        const H = EG_F2 !== 0  ? (e * G - 2 * f * F + g * E) / (2 * EG_F2) : 0; // Mean curvature
        const K = EG_F2 !== 0 ? (e * g - f * f) / EG_F2 : 0; // Gaussian curvature
        return { N, H, K };
    }

    principals(u, v) {
        const {N, K, H} = this.normalMeanGaussian(u, v);
        const disc = Math.max(0, H * H - K);
        const squareRoot = Math.sqrt(disc);
        const k1 = H + squareRoot, k2 = H - squareRoot; // Principal curvatures
        return { k1, k2 };
    }
}

export class IsoparametricContoursView extends SurfaceView {
    constructor(parentGroup, surface) {
        super(parentGroup, surface)
        this.material = null;
        this.lines = [];
    }

    #addLine(points, material) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.group.add(line);
        this.lines.push(line);
    }

    buildWith({
                  uCount = 20,
                  vCount = 20,
                  segments = 100,
                  color = 0xffffff
              } = {}) {
        const material = new THREE.LineBasicMaterial({ color: color, transparent: true, depthWrite: true, depthTest: true });
        const target = new THREE.Vector3();

        // u = constant, v varies
        for (let i = 0; i <= uCount; i++) {
            const u = i / uCount;
            const points = [];

            for (let j = 0; j <= segments; j++) {
                const v = j / segments;
                this.surface.parametrization()(u, v, target);
                points.push(target.clone());
            }

            this.#addLine(points, material);
        }

        // v = constant, u varies
        for (let i = 0; i <= vCount; i++) {
            const v = i / vCount;
            const points = [];

            for (let j = 0; j <= segments; j++) {
                const u = j / segments;
                this.surface.parametrization()(u, v, target);
                points.push(target.clone());
            }

            this.#addLine(points, material);
        }
    }

    clear() {
        for (const line of this.lines) {
            this.group.remove(line);
            line.geometry.dispose();
        }

        this.lines = [];

        if (this.material) {
            this.material.dispose();
            this.material = null;
        }
    }

    visible() {
        return this.lines.length !== 0;
    }

    dispose() {
        this.clear();        // eigen GPU-resources
        super.dispose();     // group uit parent + refs los
        this.surfaceDefinition = null;
    }
}

export class CurvatureContoursView extends SurfaceView {
    constructor(parentGroup, surface) {
        super(parentGroup, surface);
        this.pointsObject = null;
        this.material = null;
    }

    buildWith({
                  threshold = 0.05,
                  uCount = 100,
                  vCount = 100,
                  color = 0xffaa00,
                  opacity = 0.8
              } = {}) {
        this.clear();

        const curvature = new DifferentialGeometry(this.surface);
        const points = [];
        for (let i = 0; i <= uCount; i++)
            for (let j = 0; j <= vCount; j++) {
                const u = i / uCount;
                const v = j / vCount;
                const {N, K, H} = curvature.normalMeanGaussian(u, v);
                if (Math.abs(H) <= threshold) continue;

                const point = new THREE.Vector3();
                this.surface.parametrization()(u, v, point);
                points.push(point);
            }

        if (points.length === 0) return;
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.material = new THREE.PointsMaterial({
            size: 0.04,
            color: color,
            opacity: opacity,
            transparent: true
        });

        this.pointsObject = new THREE.Points(geometry, this.material);
        this.group.add(this.pointsObject);
    }

    clear() {
        if (this.pointsObject) {
            this.group.remove(this.pointsObject);
            this.pointsObject.geometry.dispose();
            this.pointsObject.material.dispose();
            this.pointsObject = null;
            this.material = null;
        }
    }

    dispose() {
        this.clear();       // eigen GPU resources
        super.dispose();    // group uit parent + refs los
        this.geometry = null;
        this.surface = null;
    }
}

export class NormalsView extends SurfaceView {
    constructor(parentGroup, surface, geometry) {
        super(parentGroup, surface);
        this.geometry = geometry;
    }

    #deriveScaleFromMesh(k, curvatureGain, normalScale) {
        this.geometry.computeBoundingSphere();
        const baseScale = this.geometry.boundingSphere.radius * normalScale;
        const maxScale  = baseScale * 2.5;
        // schaal met clamp
        return Math.min(baseScale * (1 + curvatureGain * k), maxScale);
    }

    #createLineSegments(positions, colors) {
        const normalsGeometry = new THREE.BufferGeometry();
        normalsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        normalsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const material = new THREE.LineBasicMaterial({vertexColors: true, depthTest: false});
        return new THREE.LineSegments(normalsGeometry, material);
    }

    #createNormalLines(normalScale, curvatureGain, stride) {
        const pos = this.geometry.attributes.position;
        const uv  = this.geometry.attributes.uv;
        const curvature = new DifferentialGeometry(this.surface);

        const positions = [];
        const colors    = [];
        for (let i = 0; i < pos.count; i += stride) {
            const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            const u = uv.getX(i), v = uv.getY(i);

            let { N, H, K } = curvature.normalMeanGaussian(u, v);
            if (!Number.isFinite(K)) K = 0;
            const k = Math.min(Math.abs(K), 1.0);
            const scale = this.#deriveScaleFromMesh(k, curvatureGain, normalScale);

            positions.push(
                x, y, z,
                x + scale * N.x,
                y + scale * N.y,
                z + scale * N.z
            );

            // color encodes normal direction
            const color = new THREE.Color(0.5 * (N.x + 1), 0.5 * (N.y + 1), 0.5 * (N.z + 1));
            colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
        }

        return this.#createLineSegments(positions, colors);
    }

    buildWith({ normalScale = 0.25, curvatureGain = 1.0, stride = 4 }) {
        this.clear();
        this.helper = this.#createNormalLines(normalScale, curvatureGain, stride);
        this.group.add(this.helper);
    }

    clear() {
        if (!this.helper) return;

        this.group.remove(this.helper);
        this.helper.geometry.dispose();
        this.helper.material.dispose();
        this.helper = null;
    }

    dispose() {
        this.clear();       // alleen eigen resources
        super.dispose();    // verwijdert group uit parent
        this.geometry = null;
        this.surface = null;
    }
}
