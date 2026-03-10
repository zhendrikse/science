import { Scene, PerspectiveCamera, WebGLRenderer, TextureLoader, PlaneGeometry, ShaderMaterial,
    Vector2, Mesh, MathUtils } from "three";

const canvas = document.getElementById("spaceTimeBendingCanvas");
const scene = new Scene();

const width = canvas.clientWidth;
const height = canvas.clientHeight;
const aspectRatio = width / height;

const camera = new PerspectiveCamera(75, aspectRatio, 0.1, 1000);
camera.position.z = 1;

const renderer = new WebGLRenderer({antialias: true, canvas: canvas});
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

const fovRadians = MathUtils.degToRad(camera.fov);
const yFov = camera.position.z * Math.tan(fovRadians / 2) * 2;
const spaceTexture = new TextureLoader()
    .load("https://upload.wikimedia.org/wikipedia/commons/8/85/Solarsystemscope_texture_8k_stars_milky_way.jpg", () =>
    renderer.render(scene, camera)
    );

const vertexShader = `
    varying vec2 vUv;

    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
    }
    `;

const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D uSpaceTexture;
    uniform vec2 uResolution;
    #define MAX_ITERATIONS 160
    #define STEP_SIZE 0.04

    const float GM = 0.15;

    vec3 camPos = vec3(0, 0, -3.0);
    vec3 blackholePos = vec3(0, 0, 0);
    vec4 raytrace(vec3 rayDir, vec3 rayPos) {
      vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
      for (int i = 0; i < MAX_ITERATIONS; i++) {
        float dist = length(rayPos - blackholePos);
        vec3 r = rayPos - blackholePos;
        float r3 = dist * dist * dist;
        vec3 accel =-3.0 * GM * cross(rayDir, cross(r, rayDir)) / r3;

        rayDir += accel * STEP_SIZE;
        rayDir = normalize(rayDir);
        rayPos += rayDir * STEP_SIZE;
        if (dist > 0.1) {
            vec2 tex = normalize(rayDir).xy * 0.5 + 0.5;
            color = texture2D(uSpaceTexture, tex);
        }
      }

      return color;
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0 * vec2(uResolution.x / uResolution.y, 1.0);
      vec3 rayDir = normalize(vec3(uv, 1.0));
      vec3 rayPos = camPos;
      gl_FragColor = raytrace(rayDir, rayPos);
    }
`;

const canvasGeometry = new PlaneGeometry(yFov * camera.aspect, yFov);
const canvasMaterial = new ShaderMaterial({
    uniforms: {
        uSpaceTexture: { value: spaceTexture },
        uResolution: { value: new Vector2(width, height) }
    },
    vertexShader,
    fragmentShader
});

const canvasMesh = new Mesh(canvasGeometry, canvasMaterial);
scene.add(canvasMesh);

renderer.render(scene, camera);

