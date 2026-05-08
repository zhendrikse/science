import {Vector3, Color} from "three";
import {Arrow, Body, ThreeSim} from '../js/threesim.js';

console.clear( );

const canvas = document.getElementById('birdsCanvas');
const overlay = document.getElementById('overlayText');

// Simulation parameters
const speed = 6;  // initial horizontal speed
const size = 1;   // length of a bird vector
const threshold = (5 * size) ** 2
const dt = 0.02;

class Flock {
    constructor(bird_count, simulation) {
        this._birds = [];
        this._arrows = [];
        this._bird_count = bird_count;
        this._random_weight = 5;
        this._center_weight = 0.1;
        this._direction_weight = 0.05;
        this._avoid_weight = 0.5;

        const initialPhysicalFlockRadius= 3;
        for (let i = 0; i < bird_count; i++) {
            const position = new Vector3().random().multiplyScalar(initialPhysicalFlockRadius);
            const velocity = new Vector3(speed, 0, 0).add(new Vector3().random().multiplyScalar(speed));
            const birdBody = new Body({ position, velocity });

            this._birds.push(birdBody);
            this._arrows.push(new Arrow({
                body: birdBody,
                axis: velocity.clone().normalize().multiplyScalar(speed * .2),
                round: true,
                color: new Color(.5, 1, .5),
                size: .2
            }));
        }
        this._arrows.forEach((arrow) => simulation.add(arrow));
    }

    // avoid nearest birds (A BETTER VERSION WOULD ANTICIPATE COLLISIONS)
    avoidNearestBirds() {
        const avoid = []
        for (let i = 0; i < this._bird_count; i++) {
            avoid.push(new Vector3(0, 0, 0));
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

    updateBird(count, avoid, center, direction) {
        let acceleration = new Vector3().randomDirection().multiplyScalar(this._random_weight);
        const bird = this._birds[count];

        let diff = center.clone().sub(bird.position);
        acceleration.add(diff.multiplyScalar(this._center_weight));

        diff = direction.clone().sub(bird.velocity);
        acceleration.add(diff.multiplyScalar(this._direction_weight));

        diff = avoid[count].clone().normalize().sub(bird.position);
        acceleration.add(diff.multiplyScalar(this._avoid_weight));

        bird.step(acceleration, dt)
        this._arrows[count].axis = bird.velocity;
    }

    updateBirds(avoid, center, direction, dt) {
        for (let count = 0; count < this._bird_count; count++)
            this.updateBird(count, avoid, center, direction);
    }

    update(dt) {
        // compute average position and direction
        let center = new Vector3(0, 0, 0);
        let direction = new Vector3(0, 0, 0);
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
            this._birds[i].velocity = new Vector3().random().multiplyScalar(2 * speed);
    }
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

const simulation = new ThreeSim({
    canvas,
    cameraPosition: new Vector3(15, 0, 30),
    fieldOfView: 30
});
const flock = new Flock(250, simulation);
simulation.run(() => flock.update(dt));
