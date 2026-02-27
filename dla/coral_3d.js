import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeJsUtils, Aquarium } from '../js/three-js-extensions.js';

const canvas = document.getElementById('aquariumCanvas');
canvas.focus();
const canvasWidth = canvas.getAttribute('width');
const canvasHeight = canvas.getAttribute('height');
const cubeSize = 10;
const maxDistance = Math.sqrt(3 * cubeSize * cubeSize);

const swarm = [];
const size_swarm = 3000;
const noise = .2;
const thresholdDistance = 0.25
const thresholdDistanceSquared = thresholdDistance * thresholdDistance;

const renderer = createRenderer();
const scene = new THREE.Scene();
const vector = THREE.Vector3;

lights();
const camera = initCamera();
const box = new Aquarium(scene, {size: cubeSize});
const controls = new OrbitControls( camera, canvas );

// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
window.addEventListener('resize', () => {
    ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
});

let aquariumVisible = true;
document.getElementById("aquariumToggle").checked = aquariumVisible;
document.getElementById("aquariumToggle").addEventListener("click", function(){
    if (aquariumVisible) {
        aquariumVisible = false;
        box.hide();
    } else {
        aquariumVisible = true;
        box.show();
    }
});

function initCamera() {
    const camera = new THREE.PerspectiveCamera(
        70,
        canvasWidth / canvasHeight,
        0.1,
        1000
    );
    camera.rotateY(Math.PI / 6);
    camera.position.z = cubeSize * 1.2;
    camera.position.x = cubeSize * .7;
    return camera;
}

function lights() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(3, 3, 3);
    scene.add(light);
}

function createRenderer() {
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas, alpha: true});
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setAnimationLoop( animate );
    return renderer;
}

function scientificColorCodingFor(value, minVal, maxVal) {
    value = Math.min(Math.max(value, minVal), maxVal - 0.0001);
    const range = maxVal - minVal;
    value = range === 0.0 ? 0.5 : (value - minVal) / range;
    const num = Math.floor(4 * value);
    const s = 4 * (value - num / 4);

    switch (num) {
        case 0 :
            return new THREE.Color(0, s, 1);
        case 1 :
            return new THREE.Color(0, 1, 1 - s);
        case 2 :
            return new THREE.Color(s, 1, 0);
        case 3 :
            return new THREE.Color(1, 1 - s, 0);
    }
}

class Sphere {
    constructor(positionVector, radius=0.05, colour="white", opacity=1) {
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshStandardMaterial({ color: colour, opacity: opacity });
        this.sphere = new THREE.Mesh(geometry, material);
        this.sphere.position.copy(positionVector);
        scene.add(this.sphere);
    }

    moveTo(newPositionVector) { this.sphere.position.copy(newPositionVector); }

    setRadiusTo(radius) { this.sphere.scale.set(radius); }

    setColorTo(colour) { this.sphere.material.color.set(colour); }

    position() { return this.sphere.position; }

    positionVectorTo(other) { return other.sphere.position.clone().sub(this.sphere.position); }

    distanceToSquared(other) { return this.sphere.position.distanceToSquared(other.sphere.position); }

    distanceTo(other) { return this.sphere.position.distanceTo(other.sphere.position); }
}

class Particle {
    constructor(group, radius = .125) {
        const position = new vector(this.#randomPosition(), this.#randomPosition(), this.#randomPosition());
        this.sphere = new Sphere(position.multiplyScalar(cubeSize * .5), radius, "#00a000");
        this.frozen = false;
    }

    #randomPosition = () => Math.random() < 0.5 ? -Math.random(): Math.random();

    makeSeed() {
        this.frozen = true;
        this.sphere.moveTo(new vector(0, -cubeSize / 2, 0))
        this.sphere.setRadiusTo(1);
    }

    distanceTo(otherParticle) {
        return this.sphere.distanceTo(otherParticle.sphere);
    }

    freeze() {
        this.frozen = true;
        this.sphere.setColorTo(scientificColorCodingFor(1.5 * this.distanceTo(swarm[0]), 0, maxDistance));
    }

    hasCollisionWith(otherParticle) {
        if (!otherParticle.frozen)
            return false;

        return this.sphere.distanceToSquared(otherParticle.sphere) < thresholdDistanceSquared;
    }

    checkForFreezing() {
        for (let i = 0; i < size_swarm; i++)
            if(this.hasCollisionWith(swarm[i])) {
                this.freeze();
                return;
            }
    }

    redistributeParticleFromTopPosition() {
        const newPosition = new vector(
            Math.random() < 0.5 ? -Math.random(): Math.random(),
            1,
            Math.random() < 0.5 ? -Math.random(): Math.random());
        this.sphere.moveTo(newPosition.multiplyScalar(.5 * cubeSize));
    }

    update() {
        if (this.frozen)
            return;

        let delta = new vector().random().multiplyScalar(noise);
        delta = new vector(
            Math.random() < 0.5 ? delta.x : -delta.x,
            .25 + Math.random() < 0.5 ? delta.y : -delta.y,
            Math.random() < 0.5 ? delta.z: -delta.z);
        this.sphere.moveTo(this.sphere.position().add(delta));

        if (Math.abs(this.sphere.position().x) > cubeSize * .5)
            this.sphere.position().x *= -1 * cubeSize;
        if (Math.abs(this.sphere.position().z) > cubeSize * .5)
            this.sphere.position().z *= -1 * cubeSize;

        if (this.sphere.position().y < -cubeSize * .5)
            this.redistributeParticleFromTopPosition();
        this.checkForFreezing();
    }
}

// Animation loop
function animate() {
    for (let j = 0; j < size_swarm; j++)
        swarm[j].update();

   renderer.render(scene, camera);
}

for (let j = 0; j < size_swarm; j++)
    swarm.push(new Particle(scene));
swarm[0].makeSeed();
