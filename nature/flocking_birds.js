import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeJsUtils, Arrow } from '../js/three-js-extensions.js';

console.clear( );

const birdsCanvas = document.getElementById('birdsCanvas');
birdsCanvas.focus();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 30, 1, 1, 100 );
camera.position.set( 0, 0, 50 );
camera.lookAt( scene.position );

const renderer = new THREE.WebGLRenderer( {antialias: true, canvas: birdsCanvas, alpha: true} );
renderer.setAnimationLoop( animationLoop );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
window.addEventListener('resize', () => {
    ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
});

const controls = new OrbitControls( camera, birdsCanvas );
// controls.enableDamping = true;
// controls.autoRotate = true;

const ambientLight = new THREE.AmbientLight( 'white', 1 );
scene.add( ambientLight );

const light = new THREE.DirectionalLight( 'white', 1 );
light.position.set( 50, 50, 50 );
scene.add( light );

// Simulation parameters
const speed = 6;  // initial horizontal speed
const size = 1;   // length of a bird vector
const threshold = (5 * size) ** 2
const dt = 0.02;

class Bird extends Arrow {
    constructor(velocity, initialPhysicalFlockRadius=3) {
        const pos = new THREE.Vector3().random().multiplyScalar(initialPhysicalFlockRadius);
        super({
            position: pos,
            axis: velocity.clone().normalize().multiplyScalar(speed * .2),
            round: true,
            color: new THREE.Color(.5, 1, .5)
        });
        this._velocity = velocity;
        scene.add(this);
    }

    update(acceleration, dt) {
        this._velocity.add(acceleration.multiplyScalar(dt));
        this.position.add(this._velocity.clone().multiplyScalar(dt));
        this.render();
    }

    get velocity() { return this._velocity; }

    startle = () => this._velocity = new THREE.Vector3().random().multiplyScalar(2 * speed);

    render() {
        this.axis = this.velocity.clone().normalize().multiplyScalar(size);
    }
}

class Flock {
    constructor(bird_count, random_weight=5, center_weight=0.1, direction_weight=0.05, avoid_weight=0.5) {
        this._birds = []
        this._bird_count = bird_count
        this._random_weight = random_weight
        this._center_weight = center_weight
        this._direction_weight = direction_weight
        this._avoid_weight = avoid_weight

        for (let i = 0; i < bird_count; i++)
            this._birds.push(new Bird(new THREE.Vector3(speed, 0, 0).add(new THREE.Vector3().random().multiplyScalar(speed))));
    }

    // avoid nearest birds (A BETTER VERSION WOULD ANTICIPATE COLLISIONS)
    avoidNearestBirds() {
        const avoid = []
        for (let i = 0; i < this._bird_count; i++) {
            avoid.push(new THREE.Vector3(0, 0, 0));
            for (let j = 0; j < i; j++) {
                const distanceSquared = this._birds[i].distanceToSquared(this._birds[j]);
                if (distanceSquared < threshold) {
                    const separation_dist = this._birds[i].positionVectorTo(this._birds[j]);
                    avoid[i].sub(separation_dist.divideScalar(distanceSquared));
                    avoid[j].add(separation_dist.divideScalar(distanceSquared));
                }
            }
        }
        return avoid;
    }

    updateBirds(avoid, center, direction, dt) {
        for (let count = 0; count < this._bird_count; count++) {
            let acceleration = new THREE.Vector3().randomDirection().multiplyScalar(this._random_weight);

            let diff = new THREE.Vector3().copy(center).sub(this._birds[count].position);
            acceleration.add(diff.multiplyScalar(this._center_weight));

            diff = new THREE.Vector3().copy(direction).sub(this._birds[count].velocity);
            acceleration.add(diff.multiplyScalar(this._direction_weight));

            diff = new THREE.Vector3().copy(avoid[count]).normalize().sub(this._birds[count].position);
            acceleration.add(diff.multiplyScalar(this._avoid_weight));

            this._birds[count].update(acceleration, dt)
        }
    }

    update(dt) {
        // compute average position and direction
        let center = new THREE.Vector3(0, 0, 0);
        let direction = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < this._bird_count; i++) {
            const bird = this._birds[i];
            center.add(bird.position);
            direction.add(bird.velocity);
        }

        center.divideScalar(this._bird_count);
        direction.divideScalar(this._bird_count);

        this.updateBirds(this.avoidNearestBirds(), center, direction, dt);
    }

    set randomWeight(value) { this._random_weight = value; }
    set centeringWeight(value) { this._center_weight = value; }
    set directionWeight(number) { this._direction_weight = number; }
    set avoidWeight(number) { this._avoid_weight = number; }

    startleBirds() {
        for (let i = 0; i < this._bird_count; i++)
            this._birds[i].startle();
    }
}

const flock = new Flock(250);
function animationLoop() {
    flock.update(dt);
    renderer.render( scene, camera );
    controls.update();
}

// GUI controls
document.getElementById('randomWeightSlider').addEventListener("input", (e) =>
    flock.randomWeight = e.target.value);

document.getElementById('centerWeightSlider').addEventListener("input", (e) =>
    flock.centeringWeight = e.target.value / 10);

document.getElementById('directionWeightSlider').addEventListener("input", (e) =>
    flock.directionWeight = e.target.value / 10);

document.getElementById('avoidWeightSlider').addEventListener("input", (e) =>
    flock.avoidWeight = e.target.value / 10);

document.getElementById("startleButton").addEventListener("click", () => flock.startleBirds());
