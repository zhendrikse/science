import {
    Scene, Group, WebGLRenderer, PerspectiveCamera, DirectionalLight, AmbientLight, BoxGeometry,
    MeshStandardMaterial, Mesh, Vector3
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeJsUtils } from "../js/three-js-extensions.js";
import { Pool, Wave } from "./pool_library.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import {
    CubesSurface, SurfaceColorMapper, RenderableSurface, PointsSurface, SpheresSurface, CapsulesSurface,
    ConesSurface, ShaderSurface, PlaneSurface
} from "../js/3d-surface-components.js";

const canvas = document.getElementById("emptyPoolCanvas");
const overlay = document.getElementById("emptyPoolOverlayText");
const scene = new Scene();

const camera = new PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(1.75, 1.5, 4.0);

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

const controls = new OrbitControls(camera, renderer.domElement);

window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
})
let running = false
canvas.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    } else {
        ThreeJsUtils.showOverlayMessage(overlay, "Reset");
        wave.reset();
        time = 0;
    }
});

scene.add(new AmbientLight(0xffffff, .4));
const light = new DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const pool = new Pool(4, 4)
scene.add(pool)
const wave = new Wave(250, 250, 4);
let colorMapper = new SurfaceColorMapper(SurfaceColorMapper.Mode.WATER_ALTERNATIVE);
let surface = new PointsSurface(wave, colorMapper, { radius: 0.025 });
scene.add(surface);
surface.update();

class ControlsGui {
    constructor() {
        const gui = new GUI({ width: "100%", autoPlace: false });

        const params = {
            colorMap: SurfaceColorMapper.Mode.WATER_ALTERNATIVE,
            surfaceType: RenderableSurface.Type.POINTS
        }

        gui.add(params, 'colorMap', Object.values(SurfaceColorMapper.Mode))
            .name("Color map")
            .onChange(value => {
                colorMapper = new SurfaceColorMapper(value);
                surface.colorMapper = colorMapper;
            });

        gui.add(params, 'surfaceType', Object.values(RenderableSurface.Type))
            .name("Surface type")
            .onChange(value => {
                scene.remove(surface);
                this.#changeSurfaceTo(value);
                surface.update();
                scene.add(surface);
            });

        document.getElementById("emptyPoolControls").appendChild(gui.domElement);
    }

    #changeSurfaceTo(surfaceType) {
        switch (surfaceType ) {
            case RenderableSurface.Type.SPHERES:
                surface = new SpheresSurface(wave, colorMapper, { radius: 0.0075 });
                break;
            case RenderableSurface.Type.CAPSULES:
                surface = new CapsulesSurface(wave, colorMapper, { radius: 0.0050, height: 0.025});
                break;
            case RenderableSurface.Type.POINTS:
                surface = new PointsSurface(wave, colorMapper, { radius: 0.025 });
                break;
            case RenderableSurface.Type.SHADER:
                surface = new ShaderSurface(wave, colorMapper);
                break;
            case RenderableSurface.Type.PLANE:
                surface = new PlaneSurface(wave, colorMapper);
                break;
            case RenderableSurface.Type.CONES:
                surface = new ConesSurface(wave, colorMapper, { radius: 0.0075, height: 0.03});
                break;
            case RenderableSurface.Type.CUBES:
                surface = new CubesSurface(wave, colorMapper, {blockSize: 0.01});
                break;
        }
    }
}

new ControlsGui();

let time = 0;
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    controls.update();
    if (!running)
        return;

    wave.update(); wave.update(); wave.update();

    if (Math.abs(time - .25) < .01)
        wave.disturbAt(0.5, 0.5);

    surface.update();
    time += .01;
});

