import { Scene, Color, Group, BufferGeometry, Vector3, Mesh, Float32BufferAttribute, BufferAttribute } from "three";
import { AxesController, Interval, ThreeJsUtils, Plot3DView, AxesParameters, MathWrapper, ComplexNumber }
    from '../js/three-js-extensions.js';
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import {  ColorMapper, Surface, SurfaceView, SurfaceDefinition }
    from '../js/3d-surface-components.js';

const canvasContainer = document.getElementById("complexPlotContainer");
const canvas = document.getElementById("complexPlotCanvas");

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

class ComplexColorMapper extends ColorMapper {
    apply(geometry) {
        const phaseAttr   = geometry.attributes.phase;
        const modulusAttr = geometry.attributes.modulus;

        if (!phaseAttr || !modulusAttr)
            throw new Error("Geometry needs phase and modulus attributes");

        const count = phaseAttr.count;
        let colorAttr = geometry.attributes.color;
        if (!colorAttr) {
            colorAttr = new BufferAttribute(new Float32Array(count * 3), 3);
            geometry.setAttribute("color", colorAttr);
        }

        // --- determine modulus range ---
        let mMin = Infinity, mMax = -Infinity;
        for (let i = 0; i < count; i++) {
            const modulus = modulusAttr.getX(i);
            if (modulus < mMin) mMin = modulus;
            if (modulus > mMax) mMax = modulus;
        }

        const color = new Color();
        for (let i = 0; i < count; i++) {
            const phase = phaseAttr.getX(i);
            const modulus = modulusAttr.getX(i);

            // --- phase → hue ---
            const hue = ((phase + Math.PI) / (2 * Math.PI) + 1) % 1;

            // --- modulus → brightness ---
            const t = (modulus - mMin) / (mMax - mMin);
            color.setHSL(hue, 1.0, 0.25 + 0.5 * t);

            colorAttr.array[3*i]     = color.r;
            colorAttr.array[3*i + 1] = color.g;
            colorAttr.array[3*i + 2] = color.b;
        }

        colorAttr.needsUpdate = true;
    }
}

class ComplexSurfaceView extends SurfaceView {
    constructor(parentGroup, surface, {showWireframe=false, resolution=100, baseColor="#4f6"} = {}) {
        super(parentGroup, surface);
        this._baseColor = baseColor;
        this._geometry = surface.createGeometryWith(resolution);
        this._material = this.material(showWireframe, 1);
        this._colorMapper = new ComplexColorMapper();
        this._mesh = new Mesh(this._geometry, this._material);
        this._group.add(this._mesh);
        this._colorMapper.apply(this._geometry);
    }

    selectableObject = () => this._mesh;
}

class ComplexParametricGeometry extends BufferGeometry {
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
        this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
        this.setAttribute("phase", new Float32BufferAttribute(phases, 1));
        this.setAttribute("modulus", new Float32BufferAttribute(moduli, 1));

        this.computeVertexNormals();
    }
}

class ComplexSurfaceDefinition extends SurfaceDefinition {
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

class ComplexSurfaceSpecification {
    constructor(func, reInterval, imInterval, latexString, textString) {
        this.func = func;
        this.reInterval = reInterval;
        this.imInterval = imInterval;
        this.latexString = latexString;
        this.textString = textString;
    }
} // TODO Make this inherit form SurfaceSpecification

/**
 * Using this class, a ComplexSurfaceView can be realized.
 */
export class ComplexSurface extends Surface {
    constructor(surfaceDefinition) {
        super(surfaceDefinition);
    }

    createGeometryWith(resolution) {
        return new ComplexParametricGeometry(
            this._definition,
            resolution,
            resolution
        );
    }
}

const math = new MathWrapper();
const zSquaredPlusTwo = new ComplexSurfaceDefinition(new ComplexSurfaceSpecification(
    (z) => math.add(math.multiply(z, z), math.complex(2, 0)),
    new Interval(-2, 2),
    new Interval(-2, 2),
    "$$\\psi(z) = \\big(z^2 + 2\\big)$$",
    "z * z + 2"
));
const zAbsSquared = new ComplexSurfaceDefinition(new ComplexSurfaceSpecification(
    (z) => math.multiply(z, new ComplexNumber(z.re, -z.im)),
    new Interval(-2, 2),
    new Interval(-2, 2),
    "$$\\psi(z) = z\\bar{z}$$",
    "z * z_bar"
));
const zCubed = new ComplexSurfaceDefinition(new ComplexSurfaceSpecification(
    (z) => math.add(math.multiply(z, math.multiply(z, z)), new ComplexNumber(2, 0)),
    new Interval(-2, 2),
    new Interval(-2, 2),
    "$$\\psi(z) = \\big(z^3 + 2\\big)$$",
    "z * z * z + 2"
));
const sqrtZ = new ComplexSurfaceDefinition(new ComplexSurfaceSpecification(
    (z) => math.sqrt(math.add(z, math.complex(0.0001, 0.0001))),
    new Interval(-1, 1),
    new Interval(-1, 1),
    "$$\\psi(z) = \\sqrt(z)$$",
    "sqrt(z)"
));
const expZ = new ComplexSurfaceDefinition(new ComplexSurfaceSpecification(
    (z) => math.exp(math.multiply(z, z)),
    new Interval(-1, 1),
    new Interval(-1, 1),
    "$$\\psi(z) = \\exp(z * z)$$",
    "exp(z * z)"
));
const logZ = new ComplexSurfaceDefinition(new ComplexSurfaceSpecification(
    (z) => math.log(math.add(z, math.complex(0.0001, 0.0001))),
    new Interval(-Math.PI, Math.PI),
    new Interval(-Math.PI, Math.PI),
    "$$\\psi(z) = \\log(z)$$",
    "log(z)"
));
const sinZ = new ComplexSurfaceDefinition(new ComplexSurfaceSpecification(
    (z) => math.sin(z),
    new Interval(-Math.PI, Math.PI),
    new Interval(-Math.PI, Math.PI),
    "$$\\psi(z) = \\sin(z)$$",
    "sin(z)"
));
const zPlusOneOverZMinusOne = new ComplexSurfaceDefinition(new ComplexSurfaceSpecification(
    (z) => math.divide(math.add(math.complex(1, 0), z), math.add(math.complex(-1, 0), z)),
    new Interval(-4, 4),
    new Interval(-4, 4),
    "$$\\psi(z) = \\bigg(\\dfrac{z + 1}{z - 1} \\bigg)$$",
    "(z + 1) / (z - 1)"
));
const zPlusOneOverZ = new ComplexSurfaceDefinition(new ComplexSurfaceSpecification(
    (z) => math.add(z, math.divide(math.complex(1, 0), math.add(z, math.complex(0.01, 0)))),
    new Interval(-3, 3),
    new Interval(-3, 3),
    "$$\\psi(z) = z + \\bigg(\\dfrac{1}{z}\\bigg)$$",
    "z + 1 / z"
));
const ComplexFunctions = Object.freeze({
    ZSquaredPlusTwo: zSquaredPlusTwo.specification.textString,
    ZAbsSquared: zAbsSquared.specification.textString,
    ZCubed: zCubed.specification.textString,
    SinZ: sinZ.specification.textString,
    logZ: logZ.specification.textString,
    expZ: expZ.specification.textString,
    sqrtZ: sqrtZ.specification.textString,
    ZPlusOneOverZMinusOne: zPlusOneOverZMinusOne.specification.textString,
    ZPlusOneOverZ: zPlusOneOverZ.specification.textString
});

class ControlsGui {
    constructor() {
        const gui = new GUI({width: "100%", autoPlace: false});
        gui.add(params, 'function', Object.values(ComplexFunctions))
            .name("F(z) = ")
            .onChange(value => {
                switch (value) {
                    case zSquaredPlusTwo.specification.textString:
                        this.#updateSurface(zSquaredPlusTwo);
                        break;
                    case zAbsSquared.specification.textString:
                        this.#updateSurface(zAbsSquared);
                        break;
                    case zCubed.specification.textString:
                        this.#updateSurface(zCubed);
                        break;
                    case expZ.specification.textString:
                        this.#updateSurface(expZ);
                        break;
                    case logZ.specification.textString:
                        this.#updateSurface(logZ);
                        break;
                    case sqrtZ.specification.textString:
                        this.#updateSurface(sqrtZ);
                        break;
                    case sinZ.specification.textString:
                        this.#updateSurface(sinZ);
                        break;
                    case zPlusOneOverZMinusOne.specification.textString:
                        this.#updateSurface(zPlusOneOverZMinusOne);
                        break;
                    case zPlusOneOverZ.specification.textString:
                        this.#updateSurface(zPlusOneOverZ);
                        break;
                }
            });

        this.#createAxesFolder(gui);
        this.#updateSurface(zCubed);
        document.getElementById("gui-container").appendChild(gui.domElement);
    }

    #createAxesFolder(parentFolder) {
        const axesFolder = parentFolder.addFolder("Axes");
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
    }

    #updateSurface(definition) {
        surface.dispose();
        surface = new ComplexSurfaceView(worldGroup, new ComplexSurface(definition));
        axesController.createFromBoundingBox(surface.boundingBox());
        plot3D.frame(surface.boundingBox());
    }
}

const params = {
    axesParameters: new AxesParameters({axisLabels: ["Re(z)", "log|z|", "Im(z)"]}),
    function: ComplexFunctions.ZCubed
};

const axesController = new AxesController({
    parentGroup: worldGroup,
    canvasContainer: canvasContainer,
    axesParameters: params.axesParameters,
    scene: scene
});

let surface = new ComplexSurfaceView(worldGroup, new ComplexSurface(zCubed), {showWireframe: false});

const boundingBox = surface.boundingBox();
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

function animate() {
    plot3D.render();
    axesController.render(plot3D.camera);
}

