import { PerspectiveCamera, WebGLRenderer, ACESFilmicToneMapping, SRGBColorSpace, MathUtils, PlaneGeometry,
    ShaderMaterial, Vector2, Vector3, Mesh, Scene }  from "three";
import vertexShader from "./black_hole_vertex_shader.js";
import fragmentShader from "./black_hole_fragment_shader.js";
import {SkyDome} from "../js/astro-extensions.js";

const canvas = document.getElementById("glslBlackHoleCanvas");
const scene = new Scene();

const width = canvas.clientWidth;
const height = canvas.clientHeight;
const aspectRatio = width / height;

const camera = new PerspectiveCamera(75, aspectRatio, 0.1, 1000);
camera.position.z = 1;

const renderer = new WebGLRenderer({antialias: true, canvas: canvas });

renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.2;
// renderer.toneMappingExposure = 1.5; // lagere exposure → sterren dimmer
// renderer.toneMappingExposure = 2.0; // hogere exposure → sterren helderder
renderer.outputColorSpace = SRGBColorSpace;

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

const fovRadians = MathUtils.degToRad(camera.fov);
const yFov = camera.position.z * Math.tan(fovRadians / 2) * 2;

const canvasGeometry = new PlaneGeometry(yFov * camera.aspect, yFov);
const canvasMaterial = new ShaderMaterial({
    uniforms: {
        uResolution:   { value: new Vector2(width, height)},
        uTime:         { value: 0,},
        uCamPos:       { value: new Vector3(0, 0, -8)},
        uBlackHolePos: { value: new Vector3(0, 0, 0)},
        uRotation:     { value: new Vector3(MathUtils.degToRad(-4), 0, MathUtils.degToRad(-15))},
    },
    vertexShader,
    fragmentShader,
});

const blackHoleMesh = new Mesh(canvasGeometry, canvasMaterial);
const skyDome = new SkyDome();
scene.add(skyDome);
scene.add(blackHoleMesh);
// blackHoleMesh.renderOrder = 1;
// skyDome._glowStars.renderOrder = 0;

renderer.setAnimationLoop(time => {
    skyDome.update(time, camera);
    canvasMaterial.uniforms.uTime.value = time * 0.001;
    renderer.render(scene, camera);
});

const downloadButton = document.createElement("button");
downloadButton.textContent = "Download image";
document.body.appendChild(downloadButton);

downloadButton.addEventListener("click", () => {
    renderer.render(scene, camera); // make sure last frame has been rendered

    const link = document.createElement("a");
    link.download = "blackhole.png";
    link.href = renderer.domElement.toDataURL("image/png");
    link.click();
});
