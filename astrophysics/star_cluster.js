import { Scene, Color, PerspectiveCamera, WebGLRenderer, BufferAttribute, CanvasTexture,
    BufferGeometry, PointsMaterial, AdditiveBlending, Points, Vector3 } from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {ImprovedNoise} from 'three/addons/math/ImprovedNoise.js';
import { ThreeJsUtils } from '../js/three-js-extensions.js';
import { SkyDome } from '../js/astro-extensions.js';

const canvas = document.getElementById('starClusterCanvas');
const scene = new Scene();
scene.background = new Color(0x131313);

const camera = new PerspectiveCamera(30, 1, 0.1, 3000);
camera.position.set(10, 20, 30);
camera.lookAt(scene.position);
camera.updateProjectionMatrix();

const renderer = new WebGLRenderer({ antialias: true, canvas: canvas, alpha: true });
renderer.setAnimationLoop( animationLoop );
console.clear();

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = true;

ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

class StarCluster {
    constructor(N=40000) {
        const positions = new BufferAttribute(new Float32Array(3 * N), 3),
            colors = new BufferAttribute(new Float32Array(3 * N), 3),
            perlin = new ImprovedNoise();

        let count = 0;
        while (count < N)
            if (this.starCreated(count, positions, colors, perlin))
                count++;

        const texture = new CanvasTexture(canvas);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', positions);
        geometry.setAttribute('color', colors);
        const material = new PointsMaterial({
            color: 'white',
            vertexColors: true,
            size: 0.15,
            sizeAttenuation: true,
            map: texture,
            transparent: true,
            blending: AdditiveBlending,
            depthTest: false,
        });
        const cloud = new Points(geometry, material);
        scene.add(cloud);
    }

    starCreated(i, position, color, perlin) {
        const pos = new Vector3().randomDirection().setLength(5 * Math.pow(Math.random(), 1 / 3));
        pos.x = pos.x * (1 + 0.4 * Math.sin(3 * pos.y) + 0.4 * Math.sin(2 * pos.z));
        pos.y = pos.y * (1 + 0.4 * Math.sin(3 * pos.z) + 0.4 * Math.sin(2 * pos.x));
        pos.z = pos.z * (1 + 0.4 * Math.sin(3 * pos.x) + 0.4 * Math.sin(2 * pos.y));

        const noise = perlin.noise(pos.x, pos.y, pos.z) + perlin.noise(pos.y, pos.z, pos.x) + perlin.noise(pos.z, pos.x, pos.y);
        if (noise < 0.5)
            return false;

        const colour = new Color().setHSL(0.5 + 0.15 * Math.random(), 0.5 + 0.5 * Math.random(), Math.random());
        color.setXYZ(i, colour.r, colour.g, colour.b);
        position.setXYZ(i, pos.x, pos.y, pos.z);
        return true;
    }
}

new StarCluster();
const skyDome = new SkyDome({skyRadius: 750});
scene.add(skyDome);

function animationLoop(time) {
    controls.update();
    renderer.render(scene, camera);
    skyDome.update(time * 0.001, camera);
}
