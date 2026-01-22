import * as THREE from "three";
import { ParametricGeometry} from "three/addons/geometries/ParametricGeometry";
import { Arrow, Interval, ComplexNumber }
    from 'https://www.hendrikse.name/science/js/three-js-extensions.js';
import { BufferGeometry, Mesh, Vector3, Group, DoubleSide, MeshStandardMaterial, PlaneGeometry, Box3,
    MeshPhongMaterial } from "three";

export const Category = Object.freeze({
    BASIC: "Basic",
    CONIC: "Conic",
    FUNCTION: "Functions",
    MISC: "Miscellaneous",
    NATURE: "Nature",
    NON_ORIENTABLE: "Non-Orientable",
    OBJECT: "Object",
    SPIRAL: "Spiral",
    TOROID: "Toroid"
});

export const ContourType = Object.freeze({
    CURVATURE: "Curvature",
    ISO_PARAMETRIC: "Isoparametric",
    NONE: "None"
});

export class ColorMapper {
    static ColorMode = Object.freeze({
        BASE: "Base",
        GAUSSIAN: "Gaussian curvature",
        HEIGHT: "Height",
        MEAN: "Mean curvature",
        K1: "Principal curvature k₁",
        K2: "Principal curvature k₂"
    });

    apply(geometry) {
        throw new Error("apply() not implemented");
    }
}

/**
 * This class contains a function F(u, v) => (x, y, z) used to create a Surface instance.
 * It is instantiated using a SurfaceSpecification instance.
 */
export class SurfaceDefinition {
    sample(u, v, target) {
        throw new Error("Abstract class: sample() not implemented!");
    }
}

/**
 * This class is used to build a SurfaceDefinition.
 * The latter is used to construct a Surface.
 */
export class SurfaceSpecification {
    constructor({ meta, parametrization, intervals }) {
        this.meta = meta;
        this.parametrization = Object.freeze({ ...parametrization });
        this.intervals = Object.freeze(intervals);
        Object.freeze(this);
    }

    withParametrization(patch) {
        return new SurfaceSpecification({
            meta: this.meta,
            intervals: this.intervals,
            parametrization: {
                ...this.parametrization,
                ...patch
            }
        });
    }
}

export class SurfaceView {
    constructor(parentGroup, surface) {
        this.parentGroup = parentGroup;
        this.surface = surface;
        this.group = new Group();
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

    boundingBox() { return new Box3().setFromObject(this.group).clone(); }
    definition() { return this.surface.definition(); }
    hide() { this.group.visible = false; }
    moveTo(positionAsVector) { this.group.position.copy(positionAsVector); }
    material = (showWireframe, opacity) =>
        new MeshPhongMaterial({
            vertexColors: true,
            side: DoubleSide,
            wireframe: showWireframe,
            transparent: true,
            opacity: opacity,
       });
    position() { return this.group.position.clone(); }
    rotateBy = (delta) => this.group.rotation.y += delta;
    show() { this.group.visible = true; }
}

export class ComplexColorMapper extends ColorMapper {
    apply(geometry) {
        const phaseAttr   = geometry.attributes.phase;
        const modulusAttr = geometry.attributes.modulus;

        if (!phaseAttr || !modulusAttr)
            throw new Error("Geometry needs phase and modulus attributes");

        const count = phaseAttr.count;

        let colorAttr = geometry.attributes.color;
        if (!colorAttr) {
            colorAttr = new THREE.BufferAttribute(
                new Float32Array(count * 3), 3
            );
            geometry.setAttribute("color", colorAttr);
        }

        // --- determine modulus range ---
        let mMin = Infinity, mMax = -Infinity;
        for (let i = 0; i < count; i++) {
            const m = modulusAttr.getX(i);
            if (m < mMin) mMin = m;
            if (m > mMax) mMax = m;
        }

        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const phase = phaseAttr.getX(i);
            const m     = modulusAttr.getX(i);

            // --- phase → hue ---
            const hue = ((phase + Math.PI) / (2 * Math.PI) + 1) % 1;

            // --- modulus → brightness ---
            const t = (m - mMin) / (mMax - mMin);
            color.setHSL(hue, 1.0, 0.25 + 0.5 * t);

            colorAttr.array[3*i]     = color.r;
            colorAttr.array[3*i + 1] = color.g;
            colorAttr.array[3*i + 2] = color.b;
        }

        colorAttr.needsUpdate = true;
    }
}

export class ComplexSurfaceView extends SurfaceView {
    constructor(parentGroup, surface, {showWireframe=false, resolution=100, baseColor="#4f6"} = {}) {
        super(parentGroup, surface);
        this.baseColor = baseColor;
        this.geometry = surface.createGeometryWith(resolution);
        this.material = this.material(showWireframe, 1);
        this.colorMapper = new ComplexColorMapper();
        this.mesh = new Mesh(this.geometry, this.material);
        this.group.add(this.mesh);
        this.colorMapper.apply(this.geometry);
    }

    selectableObject = () => this.mesh;
}

export class ComplexParametricGeometry extends BufferGeometry {
    constructor(definition, slices, stacks) {
        super();

        const vertices = [];
        const phases   = [];
        const indices  = [];
        const moduli   = [];
        for (let i = 0; i <= slices; i++) {
            const u = i / slices;

            for (let j = 0; j <= stacks; j++) {
                const v = j / stacks;

                const target = new Vector3();
                const phase = definition.sample(u, v, target);
                vertices.push(target.x, target.y, target.z);
                moduli.push(target.y);
                phases.push(phase);
            }
        }

        for (let i = 0; i < slices; i++)
            for (let j = 0; j < stacks; j++) {
                const a = i * (stacks + 1) + j;
                const b = a + stacks + 1;
                const c = b + 1;
                const d = a + 1;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }

        this.setIndex(indices);
        this.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        this.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));
        this.setAttribute("modulus", new THREE.Float32BufferAttribute(moduli, 1));

        this.computeVertexNormals();
    }
}

export class ComplexSurfaceDefinition extends SurfaceDefinition {
    constructor(specification) {
        super();
        this._specification = specification;
    }

    sample(u, v, target) {
        const re = this._specification.reInterval.scaleUnitParameter(u);
        const im = this._specification.imInterval.scaleUnitParameter(v);
        const z = new ComplexNumber(re, im);
        const value = this._specification.func(z);
        target.set(re, Math.log1p(value.abs()), im); // Log scale for complex functions
        return value.phase();
    }

    get specification() { return this._specification; }
}

export class ComplexSurfaceSpecification {
    constructor(func, reInterval, imInterval, latexString, textString) {
        this.func = func;
        this.reInterval = reInterval;
        this.imInterval = imInterval;
        this.latexString = latexString;
        this.textString = textString;
    }
}

/**
 * Using this class, a ComplexSurfaceView can be realized.
 */
export class ComplexSurface {
    constructor(surfaceDefinition) {
        this._definition = surfaceDefinition;
    }

    createGeometryWith(resolution) {
        return new ComplexParametricGeometry(
            this._definition,
            resolution,
            resolution
        );
    }

    definition() { return this._definition; }
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
    constructor(surfaceDefinition) {
        super();
        this.curvature = new DifferentialGeometry(surfaceDefinition);
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

        const curvature = new DifferentialGeometry(this.surface.definition());
        const points = [];
        for (let i = 0; i <= uCount; i++)
            for (let j = 0; j <= vCount; j++) {
                const u = i / uCount;
                const v = j / vCount;
                const {N, K, H} = curvature.normalMeanGaussian(u, v);
                if (Math.abs(H) <= threshold) continue;

                const point = new THREE.Vector3();
                this.surface.definition().sample()(u, v, point);
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

/**
 * matrix = representation of the shape operator S in the basis
 * of the derivative vectors (Xu, Xv).
 *
 * The base = genuine 3D-vectors in ℝ³
 *
 * normal = handy for visualization & checks
 */
export class ShapeOperator {
    constructor({
                    matrix,     // 2×2 matrix in tangent basis
                    basis,      // { Xu, Xv }
                    normal
                }) {
        this.matrix = matrix;
        this.basis  = basis;
        this.normal = normal;
        Object.freeze(this);
    }
}

export class PrincipalFrame {
    constructor({
                    position,
                    normal,
                    k1, k2,
                    d1, d2
                }) {
        this.position = position; // Vector3
        this.normal   = normal;   // Vector3
        this.k1 = k1;
        this.k2 = k2;
        this.d1 = d1;             // tangent direction
        this.d2 = d2;
        Object.freeze(this);
    }
}

export class DifferentialGeometry {
    constructor(surfaceDefinition, { eps = 1e-4 } = {}) {
        this.surfaceDefinition = surfaceDefinition;
        this.eps = eps;
    }

    derivatives(u, v) {
        const e = this.eps;
        const sample = (du, dv) => {
            const position = new Vector3();
            this.surfaceDefinition.sample(u + du, v + dv, position);
            return position;
        };

        const p00 = sample(0, 0),
            pu1 = sample(+e, 0),
            pu0 = sample(-e, 0),
            pv1 = sample(0, +e),
            pv0 = sample(0, -e),
            pu1v1 = sample(+e, +e),
            pu1v0 = sample(+e, -e),
            pu0v1 = sample(-e, +e),
            pu0v0 = sample(-e, -e);

        const Xu = pu1.clone().sub(pu0).multiplyScalar(1 / (2 * e));
        const Xv = pv1.clone().sub(pv0).multiplyScalar(1 / (2 * e));

        const Xuu = pu1.clone().sub(p00.clone().multiplyScalar(2)).add(pu0).multiplyScalar(1 / (e * e));
        const Xvv = pv1.clone().sub(p00.clone().multiplyScalar(2)).add(pv0).multiplyScalar(1 / (e * e));
        const Xuv = pu1v1.clone().sub(pu1v0).sub(pu0v1).add(pu0v0).multiplyScalar(1 / (4 * e * e));

        return { Xu, Xv, Xuu, Xuv, Xvv };
    }

    fundamentalForms(u, v) {
        const { Xu, Xv, Xuu, Xuv, Xvv } = this.derivatives(u, v);
        const N = Xu.clone().cross(Xv).normalize();

        const E = Xu.dot(Xu), F = Xu.dot(Xv), G = Xv.dot(Xv);
        const e = Xuu.dot(N), f = Xuv.dot(N), g = Xvv.dot(N);

        const detI = E * G - F * F;
        const invI = detI !== 0 ? [[G / detI, -F / detI], [-F / detI, E / detI]] : null;
        const S = invI ? [
            [invI[0][0] * e + invI[0][1] * f, invI[0][0] * f + invI[0][1] * g],
            [invI[1][0] * e + invI[1][1] * f, invI[1][0] * f + invI[1][1] * g]
        ] : null;

        return { Xu, Xv, Xuu, Xuv, Xvv, N, E, F, G, e, f, g, detI, invI, S };
    }

    normalMeanGaussian(u, v) {
        const f = this.fundamentalForms(u, v);
        const EG_F2 = f.E * f.G - f.F * f.F;
        const H = EG_F2 !== 0 ? (f.e * f.G - 2 * f.f * f.F + f.g * f.E) / (2 * EG_F2) : 0;
        const K = EG_F2 !== 0 ? (f.e * f.g - f.f * f.f) / EG_F2 : 0;
        return { N: f.N, H, K };
    }

    principals(u, v) {
        const { H, K } = this.normalMeanGaussian(u, v);
        const disc = Math.max(0, H * H - K);
        const sqrtDisc = Math.sqrt(disc);
        return { k1: H + sqrtDisc, k2: H - sqrtDisc };
    }

    principalDirections(u, v) {
        const f = this.fundamentalForms(u, v);
        if (!f.S) return null;

        const S = f.S;
        const trace = S[0][0] + S[1][1];
        const det = S[0][0] * S[1][1] - S[0][1] * S[1][0];
        const disc = Math.sqrt(Math.max(0, trace * trace / 4 - det));

        const k1 = trace / 2 + disc, k2 = trace / 2 - disc;
        const v1 = Math.abs(S[0][1]) > 1e-6 ? [k1 - S[1][1], S[0][1]] : [1, 0];
        const v2 = Math.abs(S[0][1]) > 1e-6 ? [k2 - S[1][1], S[0][1]] : [0, 1];

        const d1 = f.Xu.clone().multiplyScalar(v1[0]).add(f.Xv.clone().multiplyScalar(v1[1])).normalize();
        const d2 = f.Xu.clone().multiplyScalar(v2[0]).add(f.Xv.clone().multiplyScalar(v2[1])).normalize();

        return { k1, k2, d1, d2 };
    }

    principalFrame(u, v) {
        const { Xu, Xv } = this.derivatives(u, v);
        const N = Xu.clone().cross(Xv).normalize();
        const result = this.principalDirections(u, v);
        if (!result) return null;

        const position = new THREE.Vector3();
        this.surfaceDefinition.sample(u, v, position);

        return new PrincipalFrame({
            position,
            normal: N,
            k1: result.k1,
            k2: result.k2,
            d1: result.d1,
            d2: result.d2
        });
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
                this.surface.definition().sample(u, v, target);
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
                this.surface.definition().sample(u, v, target);
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

export class LiteralStringBasedSurfaceDefinition
    extends SurfaceDefinition {

    constructor(surfaceSpecification) {
        super();
        this._surfaceSpecification = surfaceSpecification;

        const parametrization = surfaceSpecification.parametrization;
        this.xFn = Utils.functionFrom(parametrization.xFn);
        this.yFn = Utils.functionFrom(parametrization.yFn);
        this.zFn = Utils.functionFrom(parametrization.zFn);

        this.uInterval = new Interval(
            this.#evaluateConstant(surfaceSpecification.intervals[0][0]),
            this.#evaluateConstant(surfaceSpecification.intervals[0][1])
        );

        this.vInterval = new Interval(
            this.#evaluateConstant(surfaceSpecification.intervals[1][0]),
            this.#evaluateConstant(surfaceSpecification.intervals[1][1])
        );

        Object.freeze(this);
    }

    #evaluateConstant = (exprString) => Utils.functionFrom(exprString)(0, 0);

    sample(u, v, target) {
        const U = this.uInterval.scaleUnitParameter(u);
        const V = this.vInterval.scaleUnitParameter(v);

        target.set(
            this.xFn(U, V),
            this.yFn(U, V),
            this.zFn(U, V)
        );
    }

    specification() { return this._surfaceSpecification; }
}

export class MinimalSurfaceView extends SurfaceView {
    constructor(parentGroup, surface, {showWireframe=true, resolution=20, baseColor="#4f6"}) {
        super(parentGroup, surface);
        this.baseColor = baseColor;
        this.geometry = surface.createGeometryWith(resolution);
        this.material = this.material(showWireframe, 1);
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
        which = ColorMapper.ColorMode.K1,
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
            const k = this.which === ColorMapper.ColorMode.K1 ? k1 : k2;

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

/**
 * Using this class, various SurfaceView (sub)types can be realized.
 */
export class Surface {
    constructor(surfaceDefinition) {
        this._definition = surfaceDefinition;
    }

    createGeometryWith(resolution) {
        return new ParametricGeometry(
            (u, v, target) => this._definition.sample(u, v, target),
            resolution,
            resolution
        );
    }

    definition() { return this._definition; }
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
            case ColorMapper.ColorMode.HEIGHT:
                this.colorMapper = new HeightColorMapper({ useBaseColor: false });
                break;
            case ColorMapper.ColorMode.MEAN:
                this.colorMapper = new CurvatureColorMapper(this.surface);
                break;
            case ColorMapper.ColorMode.K1:
            case ColorMapper.ColorMode.K2:
                this.colorMapper = new PrincipalCurvatureColorMapper(this.surface, { which: mode, scale: 3.0 });
                break;
            case ColorMapper.ColorMode.GAUSSIAN:
                this.colorMapper =
                    new GaussianCurvatureColorMapper(this.surface, {
                        scale: 3.0 // Scale determines how "fast" the color saturates. For sphere/torus -> [1 .. 3]
                    });
                break;
            case ColorMapper.ColorMode.BASE:
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
                    baseColor = "#4cf",
                    category = Category.MISC,
                    colorMode = ColorMapper.ColorMode.HEIGHT,
                    contourParameters = new ContourParameters(),
                    normals = false,
                    opacity = 0.9,
                    resolution = 75,
                    tangentFrameParameters = new TangentFrameParameters(),
                    wireframe = false
                } ={}) {
        this.autoRotate = autoRotate;
        this.baseColor = baseColor;
        this.category = category;
        this.colorMode = colorMode;
        this.contourParameters = contourParameters;
        this.normals = normals;
        this.opacity = opacity;
        this.resolution = resolution;
        this.tangentFrameParameters = tangentFrameParameters;
        this.wireframe = wireframe;
    }
}

export class TangentFrameParameters {
    constructor({
                    u=0.25,
                    v=0.5,
                    showAxes=true,
                    showPrincipals=false,
                    wireframe=false,
                    scale = 0.7,
                    opacity = 0.5,
                    color = 0x8888ff
                } = {}) {
        this.u = u;
        this.v = v;
        this.color = color;
        this.showAxes = showAxes;
        this.showPrincipals = showPrincipals;
        this.wireframe = wireframe;
        this.scale = scale;
        this.opacity = opacity;
    }
}

export class TangentFrameView extends Group {
    constructor(surfaceDefinition, tangentFrameParameters) {
        super();
        this.diffGeometry = new DifferentialGeometry(surfaceDefinition);
        this.scaleFactor = tangentFrameParameters.scale;

        this.axes = { // Arrows in (u, v) directions + normal vector
            uArrow: new Arrow(new Vector3(), new Vector3(), { color: 0xff0000 }),
            vArrow: new Arrow(new Vector3(), new Vector3(), { color: 0x00ff00 }),
            normalArrow: new Arrow(new Vector3(), new Vector3(), { color: 0x00aaff })
        }
        tangentFrameParameters.showAxes ? this.showAxes() : this.hideAxes();

        this.principals = { // Principal direction vectors
            k1Arrow: new Arrow(new Vector3(), new Vector3(), { color: 0xffaa00 }),
            k2Arrow: new Arrow(new Vector3(), new Vector3(), { color: 0xaa00ff })
        }
        tangentFrameParameters.showPrincipals ? this.showPrincipals() : this.hidePrincipals();

        this.tangentPlane = new Mesh(
            new PlaneGeometry(1, 1, 10, 10),
            new MeshStandardMaterial({
                color: tangentFrameParameters.color,
                side: DoubleSide,
                transparent: true,
                opacity: tangentFrameParameters.opacity,
                wireframe: tangentFrameParameters.wireframe
            })
        );

        this.add(
            this.axes.uArrow, this.axes.vArrow, this.axes.normalArrow,
            this.tangentPlane,
            this.principals.k1Arrow,
            this.principals.k2Arrow
        );
        this.update(tangentFrameParameters.u, tangentFrameParameters.v);
    }

    update(u, v) {
        const frame = this.diffGeometry.principalFrame(u, v);
        if (!frame) return;

        this.axes.uArrow.updateAxis(frame.d1.clone().multiplyScalar(this.scaleFactor * .5));
        this.axes.uArrow.moveTo(frame.position);

        this.axes.vArrow.updateAxis(frame.d2.clone().multiplyScalar(this.scaleFactor * .5));
        this.axes.vArrow.moveTo(frame.position);

        this.axes.normalArrow.updateAxis(frame.normal.clone().multiplyScalar(this.scaleFactor * .5));
        this.axes.normalArrow.moveTo(frame.position);

        this.principals.k1Arrow.updateAxis(frame.d1.clone().multiplyScalar(this.scaleFactor * .5));
        this.principals.k1Arrow.moveTo(frame.position);

        this.principals.k2Arrow.updateAxis(frame.d2.clone().multiplyScalar(this.scaleFactor * .5));
        this.principals.k2Arrow.moveTo(frame.position);

        this.tangentPlane.position.copy(frame.position);
        this.tangentPlane.lookAt(frame.position.clone().add(frame.normal));
        this.tangentPlane.scale.set(this.scaleFactor, this.scaleFactor, 1);
    }

    dispose() {
        this.diffGeometry = null;

        Object.values(this.axes).forEach(arrow => arrow.dispose());
        Object.values(this.principals).forEach(arrow => arrow.dispose());
        this.axes = null;
        this.principals = null;

        if (this.tangentPlane) {
            if (this.tangentPlane.geometry) this.tangentPlane.geometry.dispose();
            if (this.tangentPlane.material) this.tangentPlane.material.dispose();
            this.remove(this.tangentPlane);
            this.tangentPlane = null;
        }

        this.clear();
    }

    showAxes = () => Object.values(this.axes).forEach(arrow => arrow.visible = true);
    hideAxes = () => Object.values(this.axes).forEach(arrow => arrow.visible = false);
    showPrincipals = () => Object.values(this.principals).forEach(arrow => arrow.visible = true);
    hidePrincipals = () => Object.values(this.principals).forEach(arrow => arrow.visible = false);
}

const surfaceDefinitions = [{
    meta: {name: "Apple", category: Category.NATURE},
    parametrization: {
        xFn: "cos(u) * (4 + 3.8 * cos(v))",
        yFn: "(cos(v) + sin(v) - 1) * (1 + sin(v)) * log(1 - pi * v /10) + 7.5 * sin(v)",
        zFn: "sin(u) * (4 + 3.8 * cos(v))"
    },
    intervals: [["0", "2 * pi"], ["pi", "-pi"]]
}, {
    meta: {name: "Arc", category: Category.MISC},
    parametrization: {
        xFn: "cos(u)",
        yFn: "3 * sin(v)",
        zFn: "sin(u) + cos(v)"
    },
    intervals: [["0", "pi"], ["pi", "0"]]
}, {
    meta: {name: "Astroceras", category: Category.NATURE},
    parametrization: {
        xFn: "(3.5 + 1.25 * cos(v)) * exp(0.12 * u) * cos(1 * u)",
        yFn: "(0 + 1.25 * sin(v)) * exp(0.12 * u)",
        zFn: "(3.5 + 1.25 * cos(v)) * exp(0.12 * u) * sin(1 * u)"
    },
    intervals: [["-40", "-1"], ["2 * pi", "0"]]
}, {
    meta: {name: "Astroidal helix", category: Category.MISC},
    parametrization: {
        xFn: "cos(u) * cos(u) * cos(u) * cos(v) * cos(v) * cos(v)",
        yFn: "sin(v) * sin(v) * sin(v)",
        zFn: "sin(u) * sin(u) * sin(u) * cos(v) * cos(v) * cos(v)"
    },
    intervals: [["0", "pi"], ["2 * pi", "0"]]
}, {
    meta: {name: "Bellerophina", category: Category.NATURE},
    parametrization: {
        xFn: "(0.75 + 0.85 * cos(v)) * exp(0.06 * u) * cos(1 * u)",
        yFn: "(0  +  1.2  * sin(v)) * exp(0.06 * u)",
        zFn: "(0.75 + 0.85 * cos(v)) * exp(0.06 * u) * sin(1 * u)"
    },
    intervals: [["-10", "-1"], ["2 * pi", "0"]]
}, {
    meta: {name: "Bohemian dome", category: Category.TOROID},
    parametrization: {
        xFn: "7 * cos(u)",
        yFn: "7 * sin(u) + 3 * cos(v)",
        zFn: "6 * sin(v)"
    },
    intervals: [["0", "2 * pi"], ["2 * pi", "0"]]
}, {
    meta: {name: "Bow curve", category: Category.TOROID},
    parametrization: {
        xFn: "(1 * sin(u) + 2) * sin(v)",
        yFn: "(1 * sin(u) + 2) * cos(v)",
        zFn: "1 * cos(u) + 2 * cos(1/2 * v)"
    },
    intervals: [["0", "2 * pi"], ["4 * pi", "0"]]
}, {
    meta: {name: "Bow tie", category: Category.MISC},
    parametrization: {
        xFn: "sin(u)/ (sqrt(2) + sin(v))",
        yFn: "sin(u)/ (sqrt(2) + cos(v))",
        zFn: "cos(u)/ (sqrt(2) + 1)"
    },
    intervals: [["-pi", "pi"], ["pi", "-pi"]]
}, {
    meta: {name: "Conchoidal", category: Category.NATURE},
    parametrization: {
        xFn: "1.2 ^u * (1 + cos(v)) * cos(u)",
        yFn: "1.2 ^u * sin(v) - 1.5 * 1.2 ^u",
        zFn: "1.2 ^u * (1 + cos(v)) * sin(u)"
    },
    intervals: [["0", "6 * pi"], ["2 * pi", "0"]]
}, {
    meta: {name: "Cross cap", category: Category.NON_ORIENTABLE},
    parametrization: {
        xFn: "sin(2 * v) * cos(u)",
        yFn: "-cos(v) * cos(v) + 0.5  * cos(u) * cos(u) * sin(v) * sin(v)",
        zFn: "sin(2 * v) * sin(u)"
    },
    intervals: [["0", "1 * pi"], ["1 * pi", "0"]]
}, {
    meta: {name: "Cone", category: Category.CONIC},
    parametrization: {
        xFn: "v * cos(u)",
        yFn: "v",
        zFn: "v * sin(u)"
    },
    intervals: [["0", "2 * pi"], ["1/2", "-1/2 + 1e-4"]]
}, {
    meta: {name: "Cylinder", category: Category.BASIC},
    parametrization: {
        xFn: "1 * cos(u)",
        yFn: "v",
        zFn: "1 * sin(u)"
    },
    intervals: [["0", "2 * pi"], ["3", "0"]]
}, {
    meta: {name: "Crescent", category: Category.SPIRAL},
    parametrization: {
        xFn: "(2 + sin(2 * pi * u) * sin(2 * pi * v)) * sin(3 * pi * v)",
        yFn: "(2 + sin(2 * pi * u) * sin(2 * pi * v)) * cos(3 * pi * v)",
        zFn: "cos(2 * pi * u) sin(2 * pi * v) + 4 * v - 2"
    },
    intervals: [["0", "1"], ["1", "0"]]
}, {
    meta: {name: "Dini\'s spiral", category: Category.SPIRAL},
    parametrization: {
        xFn: "1.5 * cos(u) * sin(v)",
        yFn: "(cos(v) + log(tan(v / 2))) + 1 / 10 * u",
        zFn: "1.5 * sin(u) * sin(v)"
    },
    intervals: [["0", "4 * pi"], ["2 - 0.1", "0 + 0.1"]]
}, {
    meta: {name: "Egg", category: Category.OBJECT},
    parametrization: {
        xFn: "1 * sqrt(u * (u - 0.5) * (u - 1)) * sin(v)",
        yFn: "u",
        zFn: "1 * sqrt(u * (u - 0.5) * (u - 1)) * cos(v)",
    },
    intervals: [["1e-4", "1/2-1e-4"], ["2 * pi", "0"]]
}, {
    meta: {name: "Eight surface", category: Category.BASIC},
    parametrization: {
        xFn: "cos(u) * sin(2 * v)",
        yFn: "sin(v)",
        zFn: "sin(u) * sin(2 * v)",
    },
    intervals: [["-pi/2", "pi/2"], ["2 * pi - 1e-4", "1e-4"]]
}, {
    meta: {name: "Ellipsoid", category: Category.CONIC},
    parametrization: {
        xFn: "2 * sin(u) * sin(v)",
        yFn: "1 * cos(u) * sin(v)",
        zFn: "3 * cos(v)"
    },
    intervals: [["-pi/2", "pi/2"], ["2 * pi - 1e-4", "1e-4"]]
}, {
    meta: {name: "Elliptic torus", category: Category.TOROID},
    parametrization: {
        xFn: "(1 * cos(v) + 3) * cos(u)",
        yFn: "1 * (cos(v) + sin(v))",
        zFn: "(1 * cos(v) + 3) * sin(u)"
    },
    intervals: [["0", "2 * pi"], ["2 * pi", "0"]]
}, {
    meta: {name: "Enneper surface", category: Category.MISC},
    parametrization: {
        xFn: "u - u * u * u / 3 + u * v * v",
        yFn: "u * u - v * v",
        zFn: "v - v * v * v / 3 + v * u * u"
    },
    intervals: [["-2", "2"], ["-2", "2"]]
}, {
    meta: {name: "Euhoplites", category: Category.NATURE},
    parametrization: {
        xFn: "(0.9 + 0.6 * cos(v)) * exp(0.1626 * u) * cos(1 * u)",
        yFn: "(0  +  0.4 * sin(v)) * exp(0.1626 * u)",
        zFn: "(0.9 + 0.6 * cos(v)) * exp(0.1626 * u) * sin(1 * u)"
    },
    intervals: [["-40", "-1"], ["2 * pi", "0"]]
}, {
    meta: {name: "Folium", category: Category.MISC},
    parametrization: {
        yFn: "cos(u) * (2 * v/pi - tanh(v))",
        zFn: "cos(u - 2 * pi/3) / cosh(v)",
        xFn: "cos(u + 2 * pi/3) / cosh(v)"
    },
    intervals: [["-pi", "pi"], ["pi", "-pi"]]
}, {
    meta: {name: "Funnel", category: Category.BASIC},
    parametrization: {
        xFn: "u * cos(v)",
        yFn: "log(u)",
        zFn: "u * sin(v)"
    },
    intervals: [["0.1", "2"], ["0", "2 * pi"]]
}, {
    meta: {name: "Goblet", category: Category.OBJECT},
    parametrization: {
        xFn: "cos(u) * cos(2 * v)",
        yFn: "-sin(v)",
        zFn: "sin(u) * cos(2 * v)"
    },
    intervals: [["0", "2 * pi"], [".5 * pi", "0"]]
}, {
    meta: {name: "Heart", category: Category.NATURE},
    parametrization: {
        xFn: "(4 * sin(u) - sin(3 * u)) * sin(v)",
        yFn: "1.2 * (4 * cos(u) - cos(2 * u) - cos(3 * u)/2) * sin(v)",
        zFn: "2 * cos(v)"
    },
    intervals: [["0", "2 * pi"], ["pi - 1e-5", "1e-5"]]
}, {
    meta: {name: "Helicoid", category: Category.SPIRAL},
    parametrization: {
        xFn: "1.25 * u * cos(v)",
        yFn: "0.6 * v",
        zFn: "1.25 * u * sin(v)"
    },
    intervals: [["-2", "2"], ["3 * pi", "0"]]
}, {
    meta: {name: "Horn", category: Category.OBJECT},
    parametrization: {
        xFn: "(2 + u * cos(v)) * sin (2 * pi * u)",
        yFn: "(2 + u * cos(v)) * cos (2 * pi * u) + u",
        zFn: "u * sin(v)"
    },
    intervals: [["0", "1"], ["2 * pi", "0"]]
}, {
    meta: {name: "Hyperbolic paraboloid", category: Category.CONIC},
    parametrization: {
        xFn: "u",
        yFn: "u * v",
        zFn: "v"
    },
    intervals: [["-1", "1"], ["1", "-1"]]
}, {
    meta: {name: "Hyperboloid / Catenoid", category: Category.CONIC},
    parametrization: {
        xFn: "cosh(4 * v / 5) * cos(u)",
        yFn: "5 * v /4",
        zFn: "cosh(4 * v / 5) * sin(u)"
    },
    intervals: [["0", "2 * pi"], ["2", "-2"]]
}, {
    meta: {name: "Klein", category: Category.NON_ORIENTABLE},
    parametrization: {
        xFn: "(2+cos(u/2)*sin(v)-sin(u/2)*sin(2*v))*cos(u)",
        yFn: "sin(u/2)*sin(v)+cos(u/2)*sin(2*v)",
        zFn: "(2+cos(u/2)*sin(v)-sin(u/2)*sin(2*v))*sin(u)"
    },
    intervals: [["0", "2 * pi"], ["2 * pi", "0"]]
}, {
    meta: {name: "Limpet torus", category: Category.TOROID},
    parametrization: {
        xFn: "cos(u) / (sqrt(2) + sin(v))",
        yFn: "1 / (sqrt(2) + cos(v))",
        zFn: "sin(u) / (sqrt(2) + sin(v))",
    },
    intervals: [["0", "2 * pi"], ["0", "2 * pi"]]
}, {
    meta: {name: "Möbius strip", category: Category.NON_ORIENTABLE},
    parametrization: {
        xFn: "(2 + u * cos(v / 2)) * cos(v)",
        yFn: "(2 + u * cos(v / 2)) * sin(v)",
        zFn: "u * sin(v / 2)",
    },
    intervals: [["-1", "1"], ["0", "2 * pi"]]
}, {
    meta: {name: "Monkey saddle", category: Category.BASIC},
    parametrization: {
        xFn: "u",
        yFn: "0.55 * (u * u * u - 3 * v * v * u)",
        zFn: "v",
    },
    intervals: [["-1.1", "1.1"], ["-1.1", "1.1"]]
}, {
    meta: {name: "Mya arenaria", category: Category.NATURE},
    parametrization: {
        xFn: "(0.9 + 0.85 * cos(v)) * exp(2.5 * u) * cos(3 * u)",
        yFn: "(0  + 1.6 * sin(v)) * exp(2.5 * u)",
        zFn: "(0.9 + 0.85 * cos(v)) * exp(2.5 * u) * sin(3 * u)"
    },
    intervals: [["-1", "0.52"], ["2 * pi", "0"]]
}, {
    meta: {name: "Nautilus", category: Category.NATURE},
    parametrization: {
        xFn: "(1 + 1 * cos(v)) * exp(0.18 * u) * cos(1 * u)",
        yFn: "(0 + 0.6 * sin(v)) * exp(0.12 * u)",
        zFn: "(1 + 1 * cos(v)) * exp(0.18 * u) * sin(1 * u)"
    },
    intervals: [["-20", "1"], ["2 * pi", "0"]]
}, {
    meta: {name: "Paraboloid", category: Category.CONIC},
    parametrization: {
        xFn: "2 * sqrt(u / 1) * cos(v)",
        yFn: "3 * u",
        zFn: "2 * sqrt(u / 1) * sin(v)"
    },
    intervals: [["1e-5", "1 - 1e-5"], ["0", "2 * pi"]]
}, {
    meta: {name: "Peak", category: Category.FUNCTION},
    parametrization: {
        xFn: "u",
        yFn: "5 * exp(-u*u - v*v)",
        zFn: "v"
    },
    intervals: [["-3", "3"], ["3", "-3"]]
},{
    meta: {name: "Pillow", category: Category.OBJECT},
    parametrization: {
        xFn: "cos(u)",
        yFn: "0.5 * sin(u) * sin(v)",
        zFn: "cos(v)"
    },
    intervals: [["0", "pi"], ["2 * pi", "0"]]
}, {
    meta: {name: "Plane", category: Category.BASIC},
    parametrization: {
        xFn: "1.5 * u - 1 * v + 1",
        yFn: "-u - v - 0.5",
        zFn: "u + v + 1"
    },
    intervals: [["-3/2", "3/2"], ["3/2", "-3/2"]]
}, {
    meta: {name: "Polynomial", category: Category.FUNCTION},
    parametrization: {
        xFn: "u",
        yFn: ".3 * (v*v*v*u - u*u*u*v)",
        zFn: "v"
    },
    intervals: [["-2", "2"], ["2", "-2"]]
},{
    meta: {name: "Pseudoheliceras subcatenatum", category: Category.NATURE},
    parametrization: {
        xFn: "(1.5 + 1.6 * cos(v)) * exp(0.075 * u) * cos(1 * u)",
        yFn: "(-7  + 1.6 * sin(v)) * exp(0.075 * u)",
        zFn: "(1.5 + 1.6 * cos(v)) * exp(0.075 * u) * sin(1 * u)"
    },
    intervals: [["-50", "-1"], ["2 * pi", "0"]]
}, {
    meta: {name: "Ricker wavelet", category: Category.FUNCTION},
    parametrization: {
        xFn: "u",
        yFn: "3 * (1 - 2 * (u*u + v*v))*exp(-2 * (u*u + v*v))",
        zFn: "v"
    },
    intervals: [["-2", "2"], ["2", "-2"]]
},{
    meta: {name: "Ripple", category: Category.FUNCTION},
    parametrization: {
        xFn: "u",
        yFn: ".5 * sin(pi * u * v)",
        zFn: "v"
    },
    intervals: [["-3", "3"], ["3", "-3"]]
},{
    meta: {name: "Roman/Steiner surface", category: Category.NON_ORIENTABLE},
    parametrization: {
        xFn: "cos(u) * cos(v) * sin(v)",
        yFn: "cos(u) * sin(u) * cos(v) * cos(v)",
        zFn: "sin(u) * cos(v) * sin(v)"
    },
    intervals: [["0", "pi"], ["pi", "0"]]
}, {
    meta: {name: "Saddle", category: Category.FUNCTION},
    parametrization: {
        xFn: "u",
        yFn: "0.3 * (u * u - v * v)",
        zFn: "v"
    },
    intervals: [["-3", "3"], ["3", "-3"]]
},{
    meta: {name: "Saddle / hyperbolic paraboloid", category: Category.BASIC},
    parametrization: {
        xFn: "u * sin(v)",
        yFn: "1.25 * u * cos(v) * u * sin(v)",
        zFn: "u * cos(v)"
    },
    intervals: [["1e-3", "1 - 1e-3"], ["0", "2 * pi"]]
}, {
    meta: {name: "Sea shell", category: Category.NATURE},
    parametrization: {
        xFn: "2 * (1 - v / (2 * pi)) * cos(3 * v) * (1 + cos(u)) + 0.25 * cos(3 * v)",
        yFn: "(7 * v / (2 * pi)) + 2 * (1 - v / (2 * pi)) * sin(u)",
        zFn: "2 * (1 - v / (2 * pi)) * sin(3 * v) * (1 + cos(u)) + 0.25 * sin(3 * v)"
    },
    intervals: [["0", "2 * pi"], ["0", "2 * pi"]]
}, {
    meta: {name: "Self intersecting disc", category: Category.NON_ORIENTABLE},
    parametrization: {
        xFn: "1.0 * v * cos(2 * u)",
        yFn: "-1.0 * v * cos(u)",
        zFn: "1.0 * v * sin(2 * u)"
    },
    intervals: [["0", "2 * pi"], ["0", "1"]]
}, {
    meta: {name: "Sine", category: Category.MISC},
    parametrization: {
        xFn: "sin(u)",
        yFn: "sin(v)",
        zFn: "sin(u + v)"
    },
    intervals: [["0", "2 * pi"], ["2 * pi", "0"]]
}, {
    meta: {name: "Sinusoidal cone", category: Category.CONIC},
    parametrization: {
        xFn: "u * cos(v)",
        yFn: ".5 * u * cos(5 * v)",
        zFn: "u * sin(v)"
    },
    intervals: [["-10", "10"], ["2 * pi - 1e-4", "-2 * pi + 1e-4"]]
}, {
    meta: {name: "Sphere", category: Category.BASIC},
    parametrization: {
        xFn: "1 * cos(u) * sin(v)",
        yFn: "1 * sin(u) * sin(v)",
        zFn: "1 * cos(v)"
    },
    intervals: [["0", "2 * pi"], ["pi - 1e-4", "1e-4"]]
}, {
    meta: {name: "Spring", category: Category.SPIRAL},
    parametrization: {
        xFn: "(1 - 1/5 * cos(v)) * cos(u)",
        yFn: "1/4 * (sin(v) + 2 * u / pi)",
        zFn: "(1 - 1/5 * cos(v)) * sin(u)"
    },
    intervals: [["0", "8 * pi"], ["0", "2 * pi"]]
}, {
    meta: {name: "Torus", category: Category.BASIC},
    parametrization: {
        xFn: "cos(u) * (3 + 1.5 * cos(v))",
        yFn: "1.5 * sin(v)",
        zFn: "sin(u) * (3 + 1.5 * cos(v))"
    },
    intervals: [["0", "2 * pi"], ["2 * pi", "0"]]
}, {
    meta: {name: "Torus 2", category: Category.TOROID},
    parametrization: {
        xFn: "cos(u) * (3 + 1.5 * cos(v))",
        yFn: "2.75 * sin(v)",
        zFn: "sin(u) * (3 + 1.5 * cos(v))"
    },
    intervals: [["0", "2 * pi"], ["2 * pi", "0"]]
}, {
    meta: {name: "Trash can", category: Category.OBJECT},
    parametrization: {
        xFn: "(1 + v) * cos(u)",
        yFn: "1 * v * v",
        zFn: "v * sin(u)"
    },
    intervals: [["0", "2 * pi"], ["2", "0"]]
}, {
    meta: {name: "Trefoil knot", category: Category.TOROID},
    parametrization: {
        xFn: "(6 * (1 + 1/4 * sin(3 * v)) + cos(u)) * cos(2 * v)",
        yFn: "(6 * (1 + 1/4 * sin(3 * v)) + cos(u)) * sin(2 * v)",
        zFn: "sin(u) + 2 * cos(3 * v)"
    },
    intervals: [["0", "2 * pi"], ["2 * pi", "0"]]
},{
    meta: {name: "Trianguloid Trefoil knot", category: Category.TOROID},
    parametrization: {
        xFn: "1.5 * sin(3 * u) / (2 + cos(v))",
        yFn: "1.5 * (sin(u) + 2 * sin(2 * u)) / (2 + cos(v + pi * 2 / 3))",
        zFn: "1.0 * (cos(u) - 2 * cos(2 * u)) * (2 + cos(v)) * (2 + cos(v + pi * 2 / 3)) / 4"
    },
    intervals: [["-pi", "pi"], ["pi", "-pi"]]
},{
    meta: {name: "Twisted torus", category: Category.TOROID},
    parametrization: {
        xFn: "(2 + sin(v) + cos(u)) * cos(2 * v)",
        yFn: "(2 + sin(v) + cos(u)) * sin(2 * v)",
        zFn: "sin(u) + 3 * cos(v)"
    },
    intervals: [["0", "2 * pi"], ["2 * pi", "0"]]
},{
    meta: {name: "Umbrella", category: Category.OBJECT},
    parametrization: {
        xFn: "u^(1/3) * ((4 - 4/9) * cos(v) + 4/9 * cos((9 - 1) * v))",
        yFn: "3 * (1 - u)",
        zFn: "u^(1/3) * ((4 - 4/9) * sin(v) + 4/9 * sin((9 - 1) * v))"
    },
    intervals: [["1e-5", "1 - 1e-5"], ["2 * pi", "0"]]
},{
    meta: {name: "Wavelet", category: Category.FUNCTION},
    parametrization: {
        xFn: "u",
        yFn: "sin(4 * sqrt(u*u + v*v)) / sqrt(u*u + v*v +1e-3)",
        zFn: "v"
    },
    intervals: [["-2", "2"], ["2", "-2"]]
},{
    meta: {name: "Waves", category: Category.FUNCTION},
    parametrization: {
        xFn: "u",
        yFn: "cos(pi * u + pi/6) * sin(pi * v + pi/6)",
        zFn: "v"
    },
    intervals: [["-2", "2"], ["2", "-2"]]
},{
    meta: {name: "Whitney umbrella", category: Category.MISC},
    parametrization: {
        xFn: "u * v",
        yFn: "2 * v * v",
        zFn: "u"
    },
    intervals: [["-2", "2"], ["-2", "2"]]
}];

function deepFreeze(obj) {
    Object.freeze(obj);
    Object.values(obj).forEach(v => {
        if (typeof v === 'object' && v !== null && !Object.isFrozen(v)) {
            deepFreeze(v);
        }
    });
    return obj;
}

export const SurfaceDefinitions = surfaceDefinitions.map(s => deepFreeze(s));
