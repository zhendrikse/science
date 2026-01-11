import * as THREE from "three";
import {ParametricGeometry} from "three/addons/geometries/ParametricGeometry";
import {ThreeJsUtils, AxesParameters } from 'https://www.hendrikse.name/science/js/three-js-extensions.js';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export const Category = Object.freeze({
    BASIC: "Basic",
    CONIC: "Conic",
    MISC: "Miscellaneous",
    NATURE: "Nature",
    NON_ORIENTABLE: "Non-Orientable",
    OBJECT: "Object",
    SPIRAL: "Spiral",
    TOROID: "Toroid"
});

export const ColorMode = Object.freeze({
    BASE: "Base",
    GAUSSIAN: "Gaussian curvature",
    HEIGHT: "Height",
    MEAN: "Mean curvature",
    K1: "Principal curvature k₁",
    K2: "Principal curvature k₂"
});

export const ContourType = Object.freeze({
    CURVATURE: "Curvature",
    ISO_PARAMETRIC: "Isoparametric",
    NONE: "None"
});

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

export class ColorMapper {
    apply(geometry) {
        throw new Error("apply() not implemented");
    }
}

export class SurfaceDefinition {
    constructor(meta, parametrization, intervals) {
        this.meta = meta;
        this.parametrization = Object.freeze({ ...parametrization });
        this.intervals = Object.freeze(intervals);
        Object.freeze(this);
    }

    withParametrization(parametrizationPatch) {
        return new SurfaceDefinition({
            meta: this.meta,
            intervals: this.intervals,
            parametrization: {
                ...this.parametrization,
                ...parametrizationPatch
            }
        });
    }

    sample(u, v, target) {
        throw new Error("sample() not implemented");
    }
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
        new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            wireframe: showWireframe,
            transparent: true,
            opacity: opacity,
       });
    parametrization() { return this.surface.parametrization(); }
    position() { return this.group.position.clone(); }
    rotateBy = (delta) => this.group.rotation.y += delta;
    show() { this.group.visible = true; }
}

export class ContourParameters {
    constructor({
                    color = "#dd0",
                    contourType = ContourType.ISO_PARAMETRIC,
                    uCount = 20,
                    vCount = 40
                } = {}) {
        this.color = color;
        this.contourType = contourType;
        this.uCount = uCount;
        this.vCount = vCount;
    }
}

export class CurvatureColorMapper extends ColorMapper {
    constructor(surface) {
        super();
        this.curvature = new DifferentialGeometry(surface);
    }

    #setColorFromCurvature(u, v, color) {
        const { N, H, K } = this.curvature.normalMeanGaussian(u, v);
        const t = THREE.MathUtils.clamp(Math.abs(H) * 2.0, 0, 1);
        color.setHSL(0.6 - 0.6 * t, 0.9, 0.5);
    }

    apply(geometry) {
        const pos = geometry.attributes.position;
        const uv = geometry.attributes.uv;
        const color = new THREE.Color();
        let colorAttr = geometry.attributes.color;
        if (!colorAttr) {
            const colors = new Float32Array(pos.count * 3);
            colorAttr = new THREE.BufferAttribute(colors, 3);
            geometry.setAttribute("color", colorAttr);
        }

        for (let i = 0; i < pos.count; i++) {
            const u = uv.getX(i), v = uv.getY(i);
            this.#setColorFromCurvature(u, v, color);
            colorAttr.array[3 * i] = color.r;
            colorAttr.array[3 * i + 1] = color.g;
            colorAttr.array[3 * i + 2] = color.b;
        }
        colorAttr.needsUpdate = true;
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

export class GaussianCurvatureColorMapper extends ColorMapper {
    constructor(surface, {
        scale = 1.0,
        clamp = 1.0
    } = {}) {
        super();
        this.curvature = new DifferentialGeometry(surface);
        this.scale = scale;
        this.clamp = clamp;
    }

    #colorFromK(K, color) {
        // Symmetric scale around 0
        const t = Math.tanh(K * this.scale);
        if (t > 0)
            color.setHSL(0.0, 0.85, 0.5 + 0.2 * t); // positive (elliptic): red
        else
            color.setHSL(0.6, 0.85, 0.5 - 0.2 * t); // negative (hyperbolic): blue
    }

    apply(geometry) {
        const pos = geometry.attributes.position;
        const uv  = geometry.attributes.uv;

        let colorAttr = geometry.attributes.color;
        if (!colorAttr) {
            const colors = new Float32Array(pos.count * 3);
            colorAttr = new THREE.BufferAttribute(colors, 3);
            geometry.setAttribute("color", colorAttr);
        }

        const color = new THREE.Color();
        const epsilon = 1e-4;

        for (let i = 0; i < pos.count; i++) {
            const u = uv.getX(i);
            const v = uv.getY(i);

            const { N, H, K } = this.curvature.normalMeanGaussian(u, v);
            if (Math.abs(K) < epsilon) continue; // black where Gaussian curvature equals zero
            this.#colorFromK(K, color);

            colorAttr.array[3 * i]     = color.r;
            colorAttr.array[3 * i + 1] = color.g;
            colorAttr.array[3 * i + 2] = color.b;
        }

        colorAttr.needsUpdate = true;
    }
}

export class HeightColorMapper extends ColorMapper {
    constructor({ baseColor="#ff4", useBaseColor=true } = {}) {
        super();
        this.baseColor = baseColor;
        this.useBaseColor = useBaseColor;
    }

    #computeYRange(posAttr) {
        const yRange = new Interval();
        for (let i = 0; i < posAttr.count; i++)
            yRange.shrinkTo(posAttr.getY(i));

        return yRange;
    }

    apply(geometry) {
        const posAttr = geometry.attributes.position;
        const count = posAttr.count;

        let colorAttr = geometry.attributes.color;
        if (!colorAttr) {
            const colors = new Float32Array(count * 3);
            colorAttr = new THREE.BufferAttribute(colors, 3);
            geometry.setAttribute("color", colorAttr);
        }

        const yRange = this.#computeYRange(posAttr);
        const color = new THREE.Color();
        const hsl = {};

        for (let i = 0; i < count; i++) {
            const y = posAttr.getY(i);
            const t = yRange.scaleValue(y);

            if (this.useBaseColor) {
                color.setStyle(this.baseColor);
                color.getHSL(hsl);
                hsl.l = 0.1 + 0.4 * (1 - t);
            } else {
                hsl.h = t * 0.5 - 0.025;
                hsl.s = 0.9;
                hsl.l = 0.4 + 0.3 * (1 - t);
            }

            color.setHSL(hsl.h, hsl.s, hsl.l);
            colorAttr.array[3*i]     = color.r;
            colorAttr.array[3*i + 1] = color.g;
            colorAttr.array[3*i + 2] = color.b;
        }

        colorAttr.needsUpdate = true;
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

export class MinimalSurfaceView extends SurfaceView {
    constructor(parentGroup, surface, {resolution=20, baseColor="#4f6"}) {
        super(parentGroup, surface);
        this.baseColor = baseColor;
        this.geometry = surface.createGeometryWith(resolution);
        this.material = this.material(true, 1);
        this.colorMapper = new HeightColorMapper({ baseColor: baseColor });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);
        this.colorMapper.apply(this.geometry);
    }

    onSelect = () => {
        this.material.wireframe = false;
        this.colorMapper = new HeightColorMapper({ baseColor: "#f90"});
        this.colorMapper.apply(this.geometry); }
    onDeselect = () => {
        this.material.wireframe = true;
        this.colorMapper = new HeightColorMapper({ baseColor: this.baseColor });
        this.colorMapper.apply(this.geometry); }
    selectableObject = () => this.mesh;
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

export class PrincipalCurvatureColorMapper extends ColorMapper {
    constructor(surface, {
        which = ColorMode.K1,
        scale = 1.0
    } = {}) {
        super();
        this.curvature = new DifferentialGeometry(surface);
        this.which = which;
        this.scale = scale;
    }

    apply(geometry) {
        const pos = geometry.attributes.position;
        const uv  = geometry.attributes.uv;

        let colorAttr = geometry.attributes.color;
        if (!colorAttr) {
            colorAttr = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
            geometry.setAttribute("color", colorAttr);
        }

        const color = new THREE.Color();

        for (let i = 0; i < pos.count; i++) {
            const u = uv.getX(i);
            const v = uv.getY(i);

            let { k1, k2 } = this.curvature.principals(u, v);
            const k = this.which === ColorMode.K1 ? k1 : k2;

            // diverging color map
            const t = Math.tanh(k * this.scale);

            if (t > 0)
                color.setHSL(0.0, 0.85, 0.5 + 0.25 * t); // red
            else
                color.setHSL(0.6, 0.85, 0.5 - 0.25 * t); // blue

            colorAttr.array[3 * i]     = color.r;
            colorAttr.array[3 * i + 1] = color.g;
            colorAttr.array[3 * i + 2] = color.b;
        }

        colorAttr.needsUpdate = true;
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

export class StandardSurfaceView extends SurfaceView {
    constructor(parentGroup, surface, visualizationParameters) {
        super(parentGroup, surface);
        this.baseColor = visualizationParameters.baseColor;
        this.opacity = visualizationParameters.opacity;
        this.geometry = surface.createGeometryWith(visualizationParameters.resolution);
        this.material = this.material(visualizationParameters.wireframe, this.opacity);
        this.changeOpacityTo(this.opacity);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);
        this.colorMapper = null;
        this.colorMode = visualizationParameters.colorMode;
        this.changeColorModeTo(visualizationParameters.colorMode);
        this.contours = null;
        this.contourParameters = visualizationParameters.contourParameters;
        this.modifyContours({
            mode: this.contourParameters.contourType,
            resolution: visualizationParameters.resolution,
            color: this.contourParameters.color,
            uCount: this.contourParameters.uCount,
            vCount: this.contourParameters.vCount
        });
        this.normals = this.registerChild(new NormalsView(this.group, surface, this.geometry));
        if (visualizationParameters.normals) this.addNormalsWith({});
    }

    addNormalsWith = (normalParameters) => this.normals.buildWith(normalParameters);
    changeColorModeTo(mode) {
        switch (mode) {
            case ColorMode.HEIGHT:
                this.colorMapper = new HeightColorMapper({ useBaseColor: false });
                break;
            case ColorMode.MEAN:
                this.colorMapper = new CurvatureColorMapper(this.surface);
                break;
            case ColorMode.K1:
            case ColorMode.K2:
                this.colorMapper = new PrincipalCurvatureColorMapper(this.surface, { which: mode, scale: 3.0 });
                break;
            case ColorMode.GAUSSIAN:
                this.colorMapper =
                    new GaussianCurvatureColorMapper(this.surface, {
                        scale: 3.0 // Scale determines how "fast" the color saturates. For sphere/torus -> [1 .. 3]
                    });
                break;
            case ColorMode.BASE:
            default:
                this.colorMapper = new HeightColorMapper({ baseColor: this.baseColor, useBaseColor: true});
        }
        this.colorMapper.apply(this.geometry);
    }

    #modifyContourType(mode) {
        switch (mode) {
            case ContourType.NONE:
                break;
            case ContourType.CURVATURE:
                this.contours = this.registerChild(new CurvatureContoursView(this.group, this.surface));
                break;
            case ContourType.ISO_PARAMETRIC:
                this.contours = this.registerChild(new IsoparametricContoursView(this.group, this.surface));
                break;
        }
    }

    modifyContours({
                       mode = this.contourParameters.mode,
                       color = this.baseColor,
                       uCount = this.contourParameters.uCount,
                       vCount = this.contourParameters.vCount,
                       segments = this.resolution
                   } = {}) {
        this.baseColor = color;
        if (this.contours) this.contours.clear();
        if (mode !== this.contourType)
            this.#modifyContourType(mode);
        if (this.contours && mode !== ContourType.NONE)
            this.contours.buildWith({color: color, uCount: uCount, vCount: vCount, segments: segments});
    }

    changeBaseColorTo = (value) => {
        this.baseColor = value;
        this.changeColorModeTo(this.colorMode);
        if (this.contours && this.contours.visible()) {
            this.contours.dispose();
            this.modifyContours();
        }
    };
    changeOpacityTo = (value) => { this.material.opacity = value; this.material.transparent = value < 1; }
    clearNormals = () => this.normals.clear();

    resampleWith(resolution) {
        this.geometry.dispose();
        this.geometry = this.surface.createGeometryWith(resolution);
        this.mesh.geometry = this.geometry;
        this.colorMapper.apply(this.geometry);
    }

    resetTransform() {
        this.group.position.set(0, 0, 0);
        this.group.rotation.set(0, 0, 0);
        this.group.scale.set(1, 1, 1);
    }

    toggleWireframe = (value) => this.material.wireframe = value;
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

export class ViewParameters {
    constructor({
                    autoRotate = false,
                    axesParameters = new AxesParameters(),
                    baseColor = "#4cf",
                    category = Category.MISC,
                    colorMode = ColorMode.HEIGHT,
                    contourParameters = new ContourParameters(),
                    normals = false,
                    opacity = 0.9,
                    resolution = 75,
                    wireframe = false
                } ={}) {
        this.autoRotate = autoRotate;
        this.axesParameters = axesParameters;
        this.baseColor = baseColor;
        this.category = category;
        this.colorMode = colorMode;
        this.contourParameters = contourParameters;
        this.wireframe = wireframe;
        this.normals = normals;
        this.resolution = resolution;
        this.opacity = opacity;
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