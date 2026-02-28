import { Scene, Color, Group } from "three";
import { AxesController, ThreeJsUtils, Plot3DView, AxesParameters, Interval } from '../js/three-js-extensions.js';
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { SignedOpacityColorMapper, ViewParameters, ContourType, TangentFrameParameters, ContourParameters,
    SurfaceSpecification, Surface, SurfaceController, SurfaceDefinition }
    from 'https://www.hendrikse.name/science/js/3d-surface-components.js';

const canvasContainer = document.getElementById("orbitalsContainer");
const canvas = document.getElementById("orbitalsCanvas");

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

const surfaceData = [{
    meta: { name: "1s" },
    parametrization: {
        xFn: (u, v) => Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.cos(u),
        zFn: (u, v) => Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => 1 },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "2pₓ" },
    parametrization: {
        xFn: (u, v) => Math.abs(Math.sin(u) * Math.cos(v)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(Math.sin(u) * Math.cos(v)) * Math.cos(u),
        zFn: (u, v) => Math.abs(Math.sin(u) * Math.cos(v)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.sin(u) * Math.cos(v) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
},{
    meta: { name: "2pᵧ" },
    parametrization: {
        xFn: (u, v) => Math.abs(Math.cos(u)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(Math.cos(u)) * Math.cos(u),
        zFn: (u, v) => Math.abs(Math.cos(u)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.cos(u) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "2p_z" },
    parametrization: {
        xFn: (u, v) => Math.abs(Math.sin(u) * Math.sin(v)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(Math.sin(u) * Math.sin(v)) * Math.cos(u),
        zFn: (u, v) => Math.abs(Math.sin(u) * Math.sin(v)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.sin(u) * Math.sin(v) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "3d_z²" },
    parametrization: {
        xFn: (u, v) => Math.abs(3 * Math.cos(u)**2 - 1) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(3 * Math.cos(u)**2 - 1) * Math.cos(u),
        zFn: (u, v) => Math.abs(3 * Math.cos(u)**2 - 1) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => 3 * Math.cos(u)**2 - 1 },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "3d_xz" },
    parametrization: {
        xFn: (u, v) => Math.abs(Math.sin(u) * Math.cos(u) * Math.cos(v)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(Math.sin(u) * Math.cos(u) * Math.cos(v)) * Math.cos(u),
        zFn: (u, v) => Math.abs(Math.sin(u) * Math.cos(u) * Math.cos(v)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.sin(u) * Math.cos(u) * Math.cos(v) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "3d_yz" },
    parametrization: {
        xFn: (u, v) => Math.abs(Math.sin(u) * Math.cos(u) * Math.sin(v)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(Math.sin(u) * Math.cos(u) * Math.sin(v)) * Math.cos(u),
        zFn: (u, v) => Math.abs(Math.sin(u) * Math.cos(u) * Math.sin(v)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.sin(u) * Math.cos(u) * Math.sin(v) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "3d_x²₋z²" },
    parametrization: {
        xFn: (u, v) => Math.abs(Math.sin(u)**2 * Math.cos(2 * v)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(Math.sin(u)**2 * Math.cos(2 * v)) * Math.cos(u),
        zFn: (u, v) => Math.abs(Math.sin(u)**2 * Math.cos(2 * v)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.sin(u)**2 * Math.cos(2*v) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "3d_xy" },
    parametrization: {
        xFn: (u, v) => Math.abs(Math.sin(u)**2 * Math.sin(2 * v)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(Math.sin(u)**2 * Math.sin(2 * v)) * Math.cos(u),
        zFn: (u, v) => Math.abs(Math.sin(u)**2 * Math.sin(2 * v)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.sin(u)**2 * Math.sin(2*v) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "4f_z³" },
    parametrization: {
        xFn: (u, v) => Math.abs(5 * Math.cos(u)**3 - 3 * Math.cos(u)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(5 * Math.cos(u)**3 - 3 * Math.cos(u)) * Math.cos(u),
        zFn: (u, v) => Math.abs(5 * Math.cos(u)**3 - 3 * Math.cos(u)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => 5 * Math.cos(u)**3 - 3 * Math.cos(u) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "4f_xyz" },
    parametrization: {
        xFn: (u, v) => 2 * Math.abs(Math.sin(u)**2 * Math.cos(u) * Math.sin(2 * v)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => 2 * Math.abs(Math.sin(u)**2 * Math.cos(u) * Math.sin(2 * v)) * Math.cos(u),
        zFn: (u, v) => 2 * Math.abs(Math.sin(u)**2 * Math.cos(u) * Math.sin(2 * v)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.sin(u)**2 * Math.cos(u) * Math.sin(2 * v) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "4f_x(x²−3z²)" },
    parametrization: {
        xFn: (u, v) => Math.abs(Math.sin(u)**3 * Math.cos(3 * v)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(Math.sin(u)**3 * Math.cos(3 * v)) * Math.cos(u),
        zFn: (u, v) => Math.abs(Math.sin(u)**3 * Math.cos(3 * v)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.sin(u)**3 * Math.cos(3 * v) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}, {
    meta: { name: "4f_z(x²−z²)" },
    parametrization: {
        xFn: (u, v) => Math.abs(Math.sin(u)**3 * Math.sin(3 * v)) * Math.sin(u) * Math.cos(v),
        yFn: (u, v) => Math.abs(Math.sin(u)**3 * Math.sin(3 * v)) * Math.cos(u),
        zFn: (u, v) => Math.abs(Math.sin(u)**3 * Math.sin(3 * v)) * Math.sin(u) * Math.sin(v)
    },
    signedField: { field: (u, v) => Math.sin(u)**3 * Math.sin(3 * v) },
    intervals: [[-Math.PI, Math.PI], [0, Math.PI]]
}];

class OrbitalSurfaceSpecification extends SurfaceSpecification {
    constructor({ meta, parametrization, intervals, signedField }) {
        super({meta, parametrization, intervals});
        this._signedField = signedField;
        Object.freeze(this);
    }

    get signedFieldFunction() { return this._signedField.field; }

    withParametrization(patch) {
        return new OrbitalSurfaceSpecification({
            meta: this._meta,
            intervals: this._intervals,
            signedField: this._signedField,
            parametrization: {
                ...this._parametrization,
                ...patch
            }
        });
    }
}

class OrbitalSurfaceDefinition extends SurfaceDefinition {
    constructor(surfaceSpecification) {
        super();

        this._xFn = surfaceSpecification.parametrization.xFn;
        this._yFn = surfaceSpecification.parametrization.yFn;
        this._zFn = surfaceSpecification.parametrization.zFn;

        this._uInterval = new Interval(surfaceSpecification.intervals[0][0], surfaceSpecification.intervals[0][1]);
        this._vInterval = new Interval(surfaceSpecification.intervals[1][0], surfaceSpecification.intervals[1][1]);
    }

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


class ControlsGui {
    constructor(surfaceController, axesController, plot3d) {
        const gui = new GUI({width: "100%", autoPlace: false});

        const OrbitalPresets = Object.fromEntries(surfaceData.map((surface, index) => [surface.meta.name, index]));

        this._axesController = axesController;
        this._surfaceController = surfaceController;
        this._plot3d = plot3d;

        gui.add(params, "surfacePreset", OrbitalPresets)
            .name("Orbital")
            .onChange(index => {
                const data = surfaceData[index];
                const spec = new OrbitalSurfaceSpecification(data);
                this.#updateSurface(spec);
            });


        this.#createContourFolder(gui);
        this.#createAxesFolder(gui);
        document.getElementById("gui-container").appendChild(gui.domElement);
    }

    #isValidColor() {
        const style = new Option().style;
        style.color = surfaceParams.baseColor;
        return style.color !== '';
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

    #createContourFolder(folder) {
        const contourFolder = folder.addFolder("Contours");
        contourFolder.add(surfaceParams.contourParameters, "contourType", Object.values(ContourType))
            .name("Contour type")
            .onChange(value => this._surfaceController.onContourTypeChange(surfaceParams.contourParameters));
        contourFolder.add(surfaceParams.contourParameters, 'color')
            .name("Color")
            .onChange(() => {if (this.#isValidColor()) this._surfaceController.onContourSettingsChange(surfaceParams.contourParameters);});
        contourFolder.add(surfaceParams.contourParameters, "uCount", 1, 50, 1)
            .name("U contours")
            .onFinishChange(value => this._surfaceController.onContourSettingsChange(surfaceParams.contourParameters));
        contourFolder.add(surfaceParams.contourParameters, "vCount", 1, 50, 1)
            .name("V contours")
            .onFinishChange(value => this._surfaceController.onContourSettingsChange(surfaceParams.contourParameters));
        contourFolder.close();
    }

    #updateSurface(surfaceSpecification) {
        const surfaceDef = new OrbitalSurfaceDefinition(surfaceSpecification);
        this._surfaceController.onSurfaceChange(new Surface(surfaceDef), surfaceParams);
        this._surfaceController.onColorMapperChange(new SignedOpacityColorMapper(surfaceSpecification.signedFieldFunction));
        this._axesController.createFromBoundingBox(surfaceController.surfaceBoundingBox());
        this._plot3d.frame(ThreeJsUtils.scaleBox3(surfaceController.surfaceBoundingBox(), .7));
    }
}

const surfaceParams = new ViewParameters({
    contourParameters: new ContourParameters({
        contourType: ContourType.NONE
    }),
    tangentFrameParameters: new TangentFrameParameters({
        visible: false
    }),
    opacity: 0.95,
    resolution: 125
});

const params = {
    axesParameters: new AxesParameters({annotations: false}), //, xyPlane: false, xzPlane: false, yzPlane: false}),
    surfacePreset: "4f_z³"
};
const axesController = new AxesController({
    parentGroup: worldGroup,
    canvasContainer: canvasContainer,
    axesParameters: params.axesParameters,
    scene: scene
});

const defaultSurfaceSpec = new OrbitalSurfaceSpecification(surfaceData[9]);
const surfaceDef = new OrbitalSurfaceDefinition(defaultSurfaceSpec);
const orbitalColorMapper = new SignedOpacityColorMapper(defaultSurfaceSpec.signedFieldFunction);
const surfaceController = new SurfaceController(worldGroup, new Surface(surfaceDef), surfaceParams, orbitalColorMapper);

// Scale scene according to current surface
axesController.createFromBoundingBox(surfaceController.surfaceBoundingBox());
const plot3D = new Plot3DView(scene, canvas, surfaceController.surfaceBoundingBox());
plot3D.frame(ThreeJsUtils.scaleBox3(surfaceController.surfaceBoundingBox(), .7));
const gui = new ControlsGui(surfaceController, axesController, plot3D);

// Resizing for mobile devices
function resize() {
    ThreeJsUtils.resizeRendererToCanvas(plot3D.renderer, plot3D.camera);
    axesController.resize();
}
window.addEventListener("resize", resize);
resize();

function animate() {
    requestAnimationFrame(animate);
    plot3D.render();
    axesController.render(plot3D.camera);
}
animate();