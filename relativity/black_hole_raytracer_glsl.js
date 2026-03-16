import { PerspectiveCamera, WebGLRenderer, ACESFilmicToneMapping, SRGBColorSpace, MathUtils, PlaneGeometry,
    ShaderMaterial, Vector2, Vector3, Mesh, Scene }  from "three";
import vertexShader from "./black_hole_vertex_shader.js";
import fragmentShader from "./black_hole_fragment_shader.js";

const canvas = document.getElementById("glslBlackHoleCanvas");
const scene = new Scene();

const width = canvas.clientWidth;
const height = canvas.clientHeight;
const aspectRatio = width / height;

let maxIterations = 1200;

const MIN_ITER = 300;
const MAX_ITER = 2000;

const TARGET_FPS = 15;
const FPS_TOLERANCE = 3;

let frameCount = 0;
let fpsTimer = 0;

const camera = new PerspectiveCamera(75, aspectRatio, 0.1, 1000);
camera.position.z = 1;

const renderer = new WebGLRenderer({antialias: true, canvas: canvas, alpha: false });
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.2;
renderer.outputColorSpace = SRGBColorSpace;

// --- throttle pixel ratio ---
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(width, height);

const fovRadians = MathUtils.degToRad(camera.fov);
const yFov = camera.position.z * Math.tan(fovRadians / 2) * 2;

const canvasGeometry = new PlaneGeometry(yFov * camera.aspect, yFov);
const canvasMaterial = new ShaderMaterial({
    uniforms: {
        uResolution:   { value: new Vector2(width, height)},
        uTime:         { value: 0 },
        uCamPos:       { value: new Vector3(0, 0, -8)},
        uBlackHolePos: { value: new Vector3(0, 0, 0)},
        uRotation:     { value: new Vector3(MathUtils.degToRad(-4), 0, MathUtils.degToRad(-15))},
        uMaxIterations: { value: maxIterations }
    },
    vertexShader,
    fragmentShader,
});

const blackHoleMesh = new Mesh(canvasGeometry, canvasMaterial);
scene.add(blackHoleMesh);

// FPS throttling ---
let lastTime = 0;
const targetFPS = 15; // mobielvriendelijk
const interval = 1000 / targetFPS;
let animate = true;

function adjustQuality(fps) {
    if (fps < TARGET_FPS - FPS_TOLERANCE)
        maxIterations *= 0.8;
    else if (fps > TARGET_FPS + FPS_TOLERANCE)
        maxIterations *= 1.15;

    maxIterations = Math.round(Math.min(MAX_ITER, Math.max(MIN_ITER, maxIterations)));
    canvasMaterial.uniforms.uMaxIterations.value = maxIterations;
}

renderer.setAnimationLoop((time) => {
    if (!animate) return;

    if (time - lastTime < interval)
        return;

    const delta = time - lastTime;
    lastTime = time;

    canvasMaterial.uniforms.uTime.value = time * 0.001;
    renderer.render(scene, camera);

    // --- FPS measurement ---
    frameCount++;
    fpsTimer += delta;
    if (fpsTimer > 1000) {
        const fps = frameCount;
        adjustQuality(fps);

        frameCount = 0;
        fpsTimer = 0;
    }
});

const downloadButton = document.createElement("button");
downloadButton.textContent = "Download image";
document.body.appendChild(downloadButton);

downloadButton.addEventListener("click", () => {
    renderer.render(scene, camera); // laatste frame renderen
    const link = document.createElement("a");
    link.download = "blackhole.png";
    link.href = renderer.domElement.toDataURL("image/png");
    link.click();
});