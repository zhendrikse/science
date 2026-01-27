import * as THREE from "three";
import { ParametricGeometry} from "three/addons/geometries/ParametricGeometry";
import { Arrow, Interval, ThreeJsUtils }
    from 'https://www.hendrikse.name/science/js/three-js-extensions.js';
import { Mesh, Vector3, Group, DoubleSide, MeshStandardMaterial, PlaneGeometry, Box3,
    MeshPhongMaterial, MathUtils, Color, BufferAttribute } from "three";

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

    colorFor(u, v, value) {
        throw new Error("colorFor() not implemented");
    }

    apply(geometry) {
        if (!geometry.attributes.position) {
            console.warn("Geometry has no positions, cannot apply colors.");
            return;
        }

        const pos = geometry.attributes.position;
        const uv  = geometry.attributes.uv;
        const color = new Color();

        let colorAttr = geometry.attributes.color;
        if (!colorAttr) {
            const colors = new Float32Array(pos.count * 3);
            colorAttr = new BufferAttribute(colors, 3);
            geometry.setAttribute("color", colorAttr);
        }

        for (let i = 0; i < pos.count; i++) {
            let u = 0, v = 0;
            if (uv) {
                u = uv.getX(i);
                v = uv.getY(i);
            }
            this.colorFor(u, v, color);
            colorAttr.array[3 * i]     = color.r;
            colorAttr.array[3 * i + 1] = color.g;
            colorAttr.array[3 * i + 2] = color.b;
        }

        colorAttr.needsUpdate = true;
    }
}

export class GaussianCurvatureColorMapper extends ColorMapper {
    constructor(surfaceDefinition, { scale = 1.0 } = {}) {
        super();
        this.curvature = new DifferentialGeometry(surfaceDefinition);
        this.scale = scale;
    }

    colorFor(u, v, color) {
        const { K } = this.curvature.normalMeanGaussian(u, v);
        const t = Math.tanh(K * this.scale);
        if (t > 0) color.setHSL(0.0, 0.85, 0.5 + 0.2 * t);
        else       color.setHSL(0.6, 0.85, 0.5 - 0.2 * t);
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

export class SignedColorMapper extends ColorMapper {
    /**
     * @param {function(u,v):number} valueFn - function that determines the sign
     * @param {Color} positiveColor - color for positive values
     * @param {Color} negativeColor - color for negative values
     */
    constructor(valueFn, positiveColor = new Color(0x0077ff), negativeColor = new Color(0xff3300)) {
        super();
        this._valueFn = valueFn;
        this._positiveColor = positiveColor;
        this._negativeColor = negativeColor;
    }

    colorFor(u, v, color) {
        const val = this._valueFn(u, v);
        if (val >= 0) {
            color.copy(this._positiveColor);
        } else {
            color.copy(this._negativeColor);
        }
    }
}

export class SignedOpacityColorMapper extends ColorMapper {
    constructor(valueFn, {
        positiveColor = new Color(0x3366ff),
        negativeColor = new Color(0xff4444),
        opacityScale = 1.0
    } = {}) {
        super();
        this._valueFn = valueFn;
        this._pos = positiveColor;
        this._neg = negativeColor;
        this._opacityScale = opacityScale;
    }

    colorFor(u, v, color) {
        const val = this._valueFn(u, v);
        const a = Math.tanh(Math.abs(val) * this._opacityScale);

        color.copy(val >= 0 ? this._pos : this._neg);
        color.multiplyScalar(0.4 + 0.6 * a); // visual punch
        color.a = a;
    }
}

export class PrincipalCurvatureColorMapper extends ColorMapper {
    constructor(surfaceDefinition, { which = ColorMapper.ColorMode.K1, scale = 1.0 } = {}) {
        super();
        this.curvature = new DifferentialGeometry(surfaceDefinition);
        this.which = which;
        this.scale = scale;
    }

    colorFor(u, v, color) {
        const { k1, k2 } = this.curvature.principals(u, v);
        const k = this.which === ColorMapper.ColorMode.K1 ? k1 : k2;
        const t = Math.tanh(k * this.scale);

        if (t > 0)
            color.setHSL(0.0, 0.85, 0.5 + 0.25 * t); // red
        else
            color.setHSL(0.6, 0.85, 0.5 - 0.25 * t); // blue
    }
}

export class CurvatureColorMapper extends ColorMapper {
    constructor(surfaceDefinition) {
        super();
        this._diffGeometry = new DifferentialGeometry(surfaceDefinition);
    }

    colorFor(u, v, color) {
        const { N, H, K } = this._diffGeometry.normalMeanGaussian(u, v);
        const t = MathUtils.clamp(Math.abs(H) * 2.0, 0, 1);
        color.setHSL(0.6 - 0.6 * t, 0.9, 0.5);
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

export class LiteralStringBasedSurfaceDefinition extends SurfaceDefinition {
    constructor(surfaceSpecification) {
        super();
        this._surfaceSpecification = surfaceSpecification;

        const parametrization = surfaceSpecification.parametrization;
        this._xFn = Utils.functionFrom(parametrization.xFn);
        this._yFn = Utils.functionFrom(parametrization.yFn);
        this._zFn = Utils.functionFrom(parametrization.zFn);

        this._uInterval = new Interval(
            this.#evaluateConstant(surfaceSpecification.intervals[0][0]),
            this.#evaluateConstant(surfaceSpecification.intervals[0][1])
        );

        this._vInterval = new Interval(
            this.#evaluateConstant(surfaceSpecification.intervals[1][0]),
            this.#evaluateConstant(surfaceSpecification.intervals[1][1])
        );

        Object.freeze(this);
    }

    #evaluateConstant = (exprString) => Utils.functionFrom(exprString)(0, 0);

    sample(u, v, target) {
        const U = this._uInterval.scaleUnitParameter(u);
        const V = this._vInterval.scaleUnitParameter(v);

        target.set(
            this._xFn(U, V),
            this._yFn(U, V),
            this._zFn(U, V)
        );
    }

    specification() { return this._surfaceSpecification; }
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
        this._group = new Group();
        parentGroup.add(this._group);
        this._surface = surface;
        this._children = new Set();
    }

    #disposeSubViews = () => {
        for (const child of this._children) child.dispose?.();
        this._children.clear();
    }

    #disposeChild(child) {
        if (child._geometry) child._geometry.dispose();

        if (!child._material) return;
        if (Array.isArray(child._material))
            child._material.forEach(m => m.dispose());
        else
            child._material.dispose();
    }

    registerChild(view) {
        this._children.add(view);
        return view;
    }

    dispose() {
        this.#disposeSubViews();
        this._disposeObject(this._group);
        this._group.removeFromParent();
        this._group.clear();
    }

    /** Deep Three.js cleanup */
    _disposeObject(object) {
        object.traverse(child => { if (child.isMesh) this.#disposeChild(child); });
        object.clear();
    }

    boundingBox() { this._group.updateMatrixWorld(true); return new Box3().setFromObject(this._group).clone(); }
    definition() { return this._surface.definition(); }
    get group() { return this._group; }
    hide() { this._group.visible = false; }
    moveTo(positionAsVector) { this._group.position.copy(positionAsVector); }
    material = (showWireframe, opacity) =>
        new MeshPhongMaterial({
            vertexColors: true,
            side: DoubleSide,
            wireframe: showWireframe,
            transparent: true,
            opacity: opacity,
       });
    position() { return this._group.position.clone(); }
    rotateBy = (delta) => this._group.rotation.y += delta;
    show() { this._group.visible = true; }
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

export class CurvatureContoursView extends SurfaceView {
    constructor(parentGroup, surface) {
        super(parentGroup, surface);
        this._diffGeometry = new DifferentialGeometry(surface.definition());
        this._pointsObject = null;
        this._material = null;
    }

    buildWith({
                  threshold = 0.05,
                  uCount = 100,
                  vCount = 100,
                  color = 0xffaa00,
                  opacity = 0.8
              } = {}) {
        this.clear();

        const points = [];
        for (let i = 0; i <= uCount; i++)
            for (let j = 0; j <= vCount; j++) {
                const u = i / uCount;
                const v = j / vCount;
                const {N, K, H} = this._diffGeometry.normalMeanGaussian(u, v);
                if (Math.abs(H) <= threshold) continue;

                const point = new Vector3();
                this._surface.definition().sample(u, v, point);
                points.push(point);
            }

        if (points.length === 0) return;
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this._material = new THREE.PointsMaterial({
            size: 0.04,
            color: color,
            opacity: opacity,
            transparent: true
        });

        this._pointsObject = new THREE.Points(geometry, this._material);
        this._group.add(this._pointsObject);
    }

    clear() {
        if (this._pointsObject) {
            this._group.remove(this.pointsObject);
            this._pointsObject.geometry.dispose();
            this._pointsObject.material.dispose();
            this._pointsObject = null;
            this._material = null;
        }
    }

    dispose() {
        this.clear();       // eigen GPU resources
        super.dispose();    // group uit parent + refs los
        this._geometry = null;
        this._surface = null;
    }
}

export class IsoparametricContoursView extends SurfaceView {
    constructor(parentGroup, surface) {
        super(parentGroup, surface)
        this._material = null;
        this._lines = [];
    }

    #addLine(points, material) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this._group.add(line);
        this._lines.push(line);
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
                this._surface.definition().sample(u, v, target);
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
                this._surface.definition().sample(u, v, target);
                points.push(target.clone());
            }

            this.#addLine(points, material);
        }
    }

    clear() {
        for (const line of this._lines) {
            this._group.remove(line);
            line.geometry.dispose();
        }

        this._lines = [];

        if (this._material) {
            this._material.dispose();
            this._material = null;
        }
    }

    visible() {
        return this._lines.length !== 0;
    }

    dispose() {
        this.clear();        // eigen GPU-resources
        super.dispose();     // group uit parent + refs los
        this._surfaceDefinition = null;
    }
}

export class MinimalSurfaceView extends SurfaceView {
    constructor(parentGroup, surface, {showWireframe=true, resolution=20, baseColor="#4f6"}) {
        super(parentGroup, surface);
        this._baseColor = baseColor;
        this._geometry = surface.createGeometryWith(resolution);
        this._material = this.material(showWireframe, 1);
        this._colorMapper = new HeightColorMapper({ baseColor: baseColor });
        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._group.add(this._mesh);
        this._colorMapper.apply(this._geometry);
    }

    onSelect = () => {
        this._material.wireframe = false;
        this._colorMapper = new HeightColorMapper({ baseColor: "#f90"});
        this._colorMapper.apply(this._geometry); }
    onDeselect = () => {
        this._material.wireframe = true;
        this._colorMapper = new HeightColorMapper({ baseColor: this._baseColor });
        this._colorMapper.apply(this._geometry); }
    selectableObject = () => this._mesh;
}

export class NormalsView extends SurfaceView {
    constructor(parentGroup, surfaceView) {
        super(parentGroup, surfaceView);
        this._geometry = surfaceView._geometry;
    }

    #deriveScaleFromMesh(k, curvatureGain, normalScale) {
        this._geometry.computeBoundingSphere();
        const baseScale = this._geometry.boundingSphere.radius * normalScale;
        const maxScale  = baseScale * 2.5;
        return Math.min(baseScale * (1 + curvatureGain * k), maxScale); // Scale with clamp
    }

    #createLineSegments(positions, colors) {
        const normalsGeometry = new THREE.BufferGeometry();
        normalsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        normalsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const material = new THREE.LineBasicMaterial({vertexColors: true, depthTest: false});
        return new THREE.LineSegments(normalsGeometry, material);
    }

    #createNormalLines(normalScale, curvatureGain, stride) {
        const pos = this._geometry.attributes.position;
        const uv  = this._geometry.attributes.uv;
        const curvature = new DifferentialGeometry(this._surface.definition());

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
        this._helper = this.#createNormalLines(normalScale, curvatureGain, stride);
        this._group.add(this._helper);
    }

    clear() {
        if (!this._helper) return;

        this._group.remove(this._helper);
        this._helper.geometry.dispose();
        this._helper.material.dispose();
        this._helper = null;
    }

    dispose() {
        this.clear();       // alleen eigen resources
        super.dispose();    // verwijdert group uit parent
        this._geometry = null;
        this._surface = null;
    }
}

export class StandardSurfaceView extends SurfaceView {
    constructor(parentGroup, mathSurface, surfaceParameters, colorMapper, contoursView) {
        super(parentGroup, mathSurface);
        this._geometry = mathSurface.createGeometryWith(surfaceParameters.resolution);
        this._material = this.material(surfaceParameters.wireframe, surfaceParameters.opacity);
        this._mesh = new Mesh(this._geometry, this._material);
        this._group.add(this._mesh);

        this._contours = null;
        this._colorMapper = null;

        this.updateColorMapper(colorMapper);
        this.updateContoursView(contoursView);
        this.updateContours(surfaceParams.contourParameters)
        this.updateOpacity(surfaceParameters.opacity);
    }

    updateContours(contourParameters) {
        this._contours?.clear();
        this._contours?.buildWith(contourParameters);
    }

    updateContoursView = (contoursView) => {
        this._contours = contoursView;
        if (contoursView)
            this.registerChild(this._contours);
    }

    updateColorMapper = (mapper) => { this._colorMapper = mapper; this._colorMapper.apply(this._geometry); }
    updateColor() { this._colorMapper.apply(this._geometry); }
    updateOpacity = (value) => this._material.opacity = value;

    resampleWith(resolution) {
        this._geometry.dispose();
        this._geometry = this._surface.createGeometryWith(resolution);
        this._mesh.geometry = this._geometry;
        this._colorMapper.apply(this._geometry);
    }

    toggleWireframe = (value) => this._material.wireframe = value;
    rotateBy = (delta) => { this._group.rotation.y += delta; this._contours.group.rotation.y += delta; }
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
        this._surfaceDefinition = surfaceDefinition;
        this.eps = eps;
    }

    derivatives(u, v) {
        const e = this.eps;
        const sample = (du, dv) => {
            const position = new Vector3();
            this._surfaceDefinition.sample(u + du, v + dv, position);
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
        this._surfaceDefinition.sample(u, v, position);

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

/**
 * Abstract surface base class, with which various SurfaceView (sub)types can be realized.
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

export class SurfaceSelector extends Group {
    constructor(boundingBox, {
        ringRadius = 2,
        verticalOffset = -1,
        activeCategory = Category.MISC,
        rotationSpeed=0.01,
        selectionLerp=0.08
    } = {}) {
        super();
        this._surfaces = [];
        this._boundingBox = boundingBox;
        this._ringRadius = ringRadius;
        this._activeCategory = activeCategory;
        this._rotationSpeed = rotationSpeed;
        this._selectionLerp = selectionLerp;
        this._verticalOffset = verticalOffset;
        this._ringTargetRotation = null;
        this._selectedSurface = null;
    }

    #onSelectedSurface(selectedRingSurface) {
        this.#setTargetRotation(selectedRingSurface);
        if (this._selectedSurface) this._selectedSurface.onDeselect();
        selectedRingSurface.onSelect();
        this._selectedSurface = selectedRingSurface;
    }

    #placeAndShowSurface = (surface, index) => {
        const angle = 2 * Math.PI * index / this.visibleRingItems().length;
        const position = new Vector3(
            this._ringRadius * Math.cos(angle), this._verticalOffset, this._ringRadius * Math.sin(angle));
        surface.moveTo(position);
        surface.show();
    };

    #redistribute() {
        this._surfaces.forEach(surface => surface.hide());
        this.visibleRingItems().forEach((surface, index) => this.#placeAndShowSurface(surface, index));
    }

    #rotate() {
        const delta = this._ringTargetRotation - this.rotation.y;
        const shortest = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
        this.rotation.y += shortest * this._selectionLerp;

        if (Math.abs(shortest) < 0.001) {
            this.rotation.y = this._ringTargetRotation;
            this._ringTargetRotation = null;
        }
    }

    #rotateRingToSelectedSurface = () => { if (this.#rotationToTargetSurfaceIsNeeded()) this.#rotate(); };
    #rotateSurfaces = () => this.visibleRingItems().forEach(surface => surface.rotateBy(this._rotationSpeed));
    #rotationToTargetSurfaceIsNeeded = () => this._ringTargetRotation !== null;

    #setTargetRotation(selectedSurface) {
        const local = selectedSurface.position();
        const angle = Math.atan2(local.x, local.z);
        this._ringTargetRotation = -angle + Math.PI * .25;
    }

    append(surfaces) {
        surfaces.forEach(surfaceDataAsString => {
            const surfaceSpecification = new SurfaceSpecification(surfaceDataAsString);
            const surfaceDefinition = new LiteralStringBasedSurfaceDefinition(surfaceSpecification);
            const selectorSurface = new MinimalSurfaceView(this, new Surface(surfaceDefinition), {});
            ThreeJsUtils.fitGroupToBox(
                selectorSurface.group,
                selectorSurface.boundingBox(),
                this._boundingBox,
                {alignY: "min", padding: 1.1}
            );
            this._surfaces.push(selectorSurface);
        });
        this.#redistribute();
    }

    changeActiveCategoryTo(category) {
        this._activeCategory = category;
        this.#redistribute();
    }

    findSurfaceByName = (name) => this._surfaces.find(surface => surface.definition().specification().meta.name === name);

    findSurfaceByMesh = (mesh) => this._surfaces.find(surface => surface.selectableObject() === mesh);

    render = () => { this.#rotateRingToSelectedSurface(); this.#rotateSurfaces(); }

    selectableObjects = () => this.visibleRingItems().map(surface => surface.selectableObject());

    onSelectTo = (selectedRingSurface) => this.#onSelectedSurface(selectedRingSurface);

    visibleRingItems = () => this._surfaces.filter(
        surface => surface.definition().specification().meta.category === this._activeCategory);
}

export class SurfaceController {
    constructor(parentGroup, surfaceView, surfaceParams) {
        this._parentGroup = parentGroup;
        this._surface = null;
        this._tangentFrame = null;
        this._normals = null;

        this.changeSurface(surfaceView, surfaceParams);
        this.updateContours(surfaceParams.contourParameters);
        this.updateColor(surfaceParams);
    }

    updateColorMapper = (colorMapper) => this._surface.updateColorMapper(colorMapper);
    updateContoursView = (contoursView, contourParameters) => {
        this._surface.updateContoursView(contoursView);
        this.updateContours(contourParameters);
    }

    updateColor = () => this._surface.updateColor();
    updateContours = (contourParameters) => this._surface.updateContours(contourParameters);
    surfaceBoundingBox = () => this._surface.boundingBox();

    #disposeCurrentSurface() {
        this._surface?.dispose();
        this._tangentFrame?.dispose();
        this._normals?.clear();
    }

    #createNormals() {
        this._normals = new NormalsView(this._parentGroup, this._surface);
        this._normals.group.position.copy(this._surface.group.position);
        this._normals.group.scale.set(
            this._surface.group.scale.x, this._surface.group.scale.y, this._surface.group.scale.z);
    }

    #createTangentFrameFrom(surfaceParams) {
        surfaceParams.tangentFrameParameters.scale = this._surface.boundingBox().max.length() * .4;
        this._tangentFrame = new TangentFrameView(this._surface.definition(), surfaceParams.tangentFrameParameters);
        this.updateTangentFrame(surfaceParams.tangentFrameParameters);
        this._parentGroup.add(this._tangentFrame);
    }

    changeSurface(surfaceView, surfaceParams) {
        this.#disposeCurrentSurface();
        this._surface = surfaceView;
        this.#createNormals();
        this.#createTangentFrameFrom(surfaceParams);
    }

    get surface() { return this._surface; }

    updateTangentFrame(tangentFrameParameters) {
        this._tangentFrame.visible = tangentFrameParameters.visible;
        this._tangentFrame.update(tangentFrameParameters);
        this._tangentFrame.position.copy(this._surface.group.position);
        this._tangentFrame.scale.set(this._surface.group.scale.x, this._surface.group.scale.y, this._surface.group.scale.z);
    }

    changeBaseColorTo = (color) => this._surface.changeBaseColorTo(color);
    updateOpacity = (value) => this._surface.updateOpacity(value);
    toggleWireframe = (value) => this._surface.toggleWireframe(value);
    toggleNormals = (visible, surfaceParams) => {
        if (visible) {
            this._normals.buildWith({});
            this._surface.updateOpacity(0.3);
        } else {
            this._normals.clear();
            this._surface.updateOpacity(surfaceParams.opacity);
        }
    }
    rotateBy = (value) => {
        this._surface.rotateBy(value);
        this._tangentFrame.rotation.y += value;
        this._normals.rotateBy(value);
    }
    resampleWith = (resolution) => this._surface.resampleWith(resolution);
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
                    color = 0x8888ff,
                    visible = true
                } = {}) {
        this.u = u;
        this.v = v;
        this.color = color;
        this.showAxes = showAxes;
        this.showPrincipals = showPrincipals;
        this.wireframe = wireframe;
        this.scale = scale;
        this.opacity = opacity;
        this.visible = visible;
    }
}

export class TangentFrameView extends Group {
    constructor(surfaceDefinition, tangentFrameParameters) {
        super();
        this._diffGeometry = new DifferentialGeometry(surfaceDefinition);
        this._scaleFactor = tangentFrameParameters.scale;

        this._axes = { // Arrows in (u, v) directions + normal vector
            uArrow: new Arrow(new Vector3(), new Vector3(), { color: 0xff0000 }),
            vArrow: new Arrow(new Vector3(), new Vector3(), { color: 0x00ff00 }),
            normalArrow: new Arrow(new Vector3(), new Vector3(), { color: 0x00aaff })
        }

        this._principals = { // Principal direction vectors
            k1Arrow: new Arrow(new Vector3(), new Vector3(), { color: 0xffaa00 }),
            k2Arrow: new Arrow(new Vector3(), new Vector3(), { color: 0xaa00ff })
        }

        this._tangentPlane = new Mesh(
            new PlaneGeometry(1, 1, 10, 10),
            new MeshStandardMaterial({
                color: tangentFrameParameters.color,
                side: DoubleSide,
                transparent: true,
                depthTest: true,
                depthWrite: true,
                opacity: tangentFrameParameters.opacity,
                wireframe: tangentFrameParameters.wireframe
            })
        );

        this.add(
            this._axes.uArrow, this._axes.vArrow, this._axes.normalArrow,
            this._tangentPlane,
            this._principals.k1Arrow,
            this._principals.k2Arrow
        );
        this.update(tangentFrameParameters);
        this.visible = tangentFrameParameters.visible;
    }

    update(tangentFrameParameters) {
        const frame = this._diffGeometry.principalFrame(tangentFrameParameters.u, tangentFrameParameters.v);
        if (!frame) return;

        this._axes.uArrow.updateAxis(frame.d1.clone().multiplyScalar(this._scaleFactor * .5));
        this._axes.uArrow.moveTo(frame.position);

        this._axes.vArrow.updateAxis(frame.d2.clone().multiplyScalar(this._scaleFactor * .5));
        this._axes.vArrow.moveTo(frame.position);

        this._axes.normalArrow.updateAxis(frame.normal.clone().multiplyScalar(this._scaleFactor * .5));
        this._axes.normalArrow.moveTo(frame.position);

        this._principals.k1Arrow.updateAxis(frame.d1.clone().multiplyScalar(this._scaleFactor * .5));
        this._principals.k1Arrow.moveTo(frame.position);

        this._principals.k2Arrow.updateAxis(frame.d2.clone().multiplyScalar(this._scaleFactor * .5));
        this._principals.k2Arrow.moveTo(frame.position);

        this._tangentPlane.position.copy(frame.position);
        this._tangentPlane.lookAt(frame.position.clone().add(frame.normal));
        this._tangentPlane.scale.set(this._scaleFactor, this._scaleFactor, 1);

        tangentFrameParameters.showPrincipals ? this.showPrincipals() : this.hidePrincipals();
        tangentFrameParameters.showAxes ? this.showAxes() : this.hideAxes();
    }

    dispose() {
        this.diffGeometry = null;

        Object.values(this._axes).forEach(arrow => arrow.dispose());
        Object.values(this._principals).forEach(arrow => arrow.dispose());
        this._axes = null;
        this._principals = null;

        if (this._tangentPlane) {
            if (this._tangentPlane.geometry) this._tangentPlane.geometry.dispose();
            if (this._tangentPlane.material) this._tangentPlane.material.dispose();
            this.remove(this._tangentPlane);
            this._tangentPlane = null;
        }

        this.clear();
    }

    boundingBox() { return new Box3().setFromObject(this).clone(); }
    showAxes = () => Object.values(this._axes).forEach(arrow => arrow.visible = true);
    hideAxes = () => Object.values(this._axes).forEach(arrow => arrow.visible = false);
    showPrincipals = () => Object.values(this._principals).forEach(arrow => arrow.visible = true);
    hidePrincipals = () => Object.values(this._principals).forEach(arrow => arrow.visible = false);
}
