import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer";
import {ParametricGeometry} from "three/addons/geometries/ParametricGeometry";

export class MatlabAxes {
    constructor(parentGroup, document, gridSize=4, gridDivisions=10) {
        this.group = new THREE.Group();
        this.document = document;
        parentGroup.add(this.group);

        this.allGrids = [].concat(
            this.#xyPlane(gridSize, gridDivisions, new THREE.Vector3(.5 * gridSize, 0, .5 * gridSize)),
            this.#yzPlane(gridSize, gridDivisions, new THREE.Vector3(0, .5 * gridSize, .5 * gridSize)),
            this.#zxPlane(gridSize, gridDivisions, new THREE.Vector3(.5 * gridSize, .5 * gridSize, 0))
        );
        this.tickLabels = this.#createTickLabels(gridSize, gridDivisions);
        this.axisLabels = this.#createAxisLabels(gridSize);
        this.allGrids.forEach(obj => this.group.add(obj));
        this.tickLabels.forEach(obj => this.group.add(obj));
        this.axisLabels.forEach(obj => this.group.add(obj));
    }

    #createPlane(size, divisions, position, colour) {
        const grid = new THREE.GridHelper(size, divisions, 0x333333, 0x333333);
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size),
            new THREE.MeshPhongMaterial({ color: colour, transparent:true, opacity:0.1, side:THREE.DoubleSide })
        );
        plane.position.copy(position);
        grid.position.copy(position);
        return [grid, plane];
    }

    #xyPlane(size, divisions, position) {
        const gridPlane = this.#createPlane(size, divisions, position, 0x4444ff);
        gridPlane[1].rotateX(Math.PI/2);
        gridPlane[0].rotateY(Math.PI/2);
        return gridPlane;
    }

    #yzPlane(size, divisions, position) {
        const gridPlane = this.#createPlane(size, divisions, position, 0x44ff44);
        gridPlane[1].rotateY(Math.PI/2);
        gridPlane[0].rotateZ(Math.PI/2);
        return gridPlane;
    }

    #zxPlane(size, divisions, position) {
        const gridPlane = this.#createPlane(size, divisions, position, 0xff4444);
        gridPlane[1].rotateZ(Math.PI/2);
        gridPlane[0].rotateX(Math.PI/2);
        return gridPlane;
    }

    #makeLabel(text, pos, color="yellow") {
        const div = this.document.createElement("div");
        div.style.color = color;
        div.style.fontSize = "15px";
        div.textContent = text;
        const label = new CSS2DObject(div);
        label.position.copy(pos);
        return label;
    }

    #createTickLabels(size, divisions) {
        const labels = [];
        const step = (2 * size) / divisions;
        const offset = 0.1;

        for (let v = 0; v <= size; v += step) {
            labels.push(this.#makeLabel(v.toFixed(1), new THREE.Vector3(v, 0, size + offset)));
            labels.push(this.#makeLabel(v.toFixed(1), new THREE.Vector3(0, v, size + offset)));
            labels.push(this.#makeLabel(v.toFixed(1), new THREE.Vector3(size + offset, 0, v)));
        }
        return labels;
    }

    #createAxisLabels(size) {
        const offset = 0.2 * size;
        return [
            this.#makeLabel("X-axis", new THREE.Vector3(size + offset, 0, .5 * size), "white"),
            this.#makeLabel("Y-axis", new THREE.Vector3(0, size + offset * .5, 0), "white"),
            this.#makeLabel("Z-axis", new THREE.Vector3(.5 * size, 0 ,size + offset), "white"),
        ];
    }

    setTickLabelVisibilityTo(checked) {
        this.tickLabels.forEach(label => label.visible = checked);
    }

    setPlaneVisibilityTo(checked) {
        this.allGrids.forEach(grid => grid.visible = checked);
    }

    setAxesLabelVisibilityTo(checked) {
        this.axisLabels.forEach(label => label.visible = checked);
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
