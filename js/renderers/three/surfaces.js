import { Group, Vector3, LineBasicMaterial, Line, BufferGeometry } from "three";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry";

/**
 * Abstract base class for parametric surfaces, with which various SurfaceView (sub)types can be realized.
 */
export class ParametricSurfaceGeometry {
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

    get definition() { return this._definition; }
}

export class IsoparametricContoursSurfaceView extends Group {
    constructor({
        surfaceGeometry,
        uCount = 20,
        vCount = 20,
        segments = 100,
        color = 0xffffff
    } = {}) {
        super();
        this._lines = [];
        const material = new LineBasicMaterial({ color: color, transparent: true, depthWrite: true, depthTest: true });
        const target = new Vector3();

        // u = constant, v varies
        for (let i = 0; i <= uCount; i++) {
            const u = i / uCount;
            const points = [];

            for (let j = 0; j <= segments; j++) {
                const v = j / segments;
                surfaceGeometry.definition.sample(u, v, target);
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
                surfaceGeometry.definition.sample(u, v, target);
                points.push(target.clone());
            }

            this.#addLine(points, material);
        }
    }

    #addLine(points, material) {
        const geometry = new BufferGeometry().setFromPoints(points);
        const line = new Line(geometry, material);
        this.add(line);
        this._lines.push(line);
    }
}
