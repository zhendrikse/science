const canvasWrapper = document.getElementById('canvas-wrapper');
const canvas = document.getElementById('coralCanvas');
const display = canvas.getContext("2d");

let maxDistance = 0;
const PARTICLES_PER_10K_PIXELS = 75;
let swarmSize = 0;

function circle(x, y, radius, fillColor="#DDDD00", outline=false) {
    display.fillStyle = fillColor;
    display.strokeStyle = "#000000";
    display.beginPath();
    display.arc(x, y, radius, 0, Math.PI * 2, true);
    display.closePath();
    display.fill();
    if (outline)
        display.stroke(); // Gives outline to particle

}

function scientificColorCodingFor(value, minVal, maxVal) {
    value = Math.min(Math.max(value, minVal), maxVal - 0.0001);
    const range = maxVal - minVal;
    value = range === 0.0 ? 0.5 : (value - minVal) / range;
    const num = Math.floor(4 * value);
    const s = 4 * (value - num / 4);

    switch (num) {
        case 0 :
            return "rgba(0, " + 255 * s + ", 255, 255)";
        case 1 :
            return "rgba(0, 255, " + 255 * (1 - s) + ", 255)";
        case 2 :
            return "rgba(" + 255 * s + ", 255, 0, 255)";
        case 3 :
            return "rgba(255, " +  255 * (1 - s)  + ", 0, 255)";
    }
}

const swarm = [];
let thresholdDistance = 5;
let thresholdDistanceSquared = thresholdDistance * thresholdDistance;
const dpr = window.devicePixelRatio || 1;
const noise = 10 / dpr;
const verticalDrift = 1.5 / dpr;
function updateThreshold() {
    const dpr = window.devicePixelRatio || 1;
    thresholdDistance = 5 * dpr;
    thresholdDistanceSquared = thresholdDistance * thresholdDistance;
}

class Particle {
    constructor() {
        this.x = canvas.width * Math.random();
        this.y = canvas.height * Math.random();
        this.radius = this.#computeParticleRadius();
        this.frozen = false;
        this.colour = scientificColorCodingFor(0, 0, maxDistance);
    }

    #computeParticleRadius() {
        const dpr = window.devicePixelRatio || 1;
        return Math.max(1, 2 * dpr);
    }

    makeSeed() {
        this.frozen = true;
        this.x = canvas.width * .5;
        // this.y = canvas.height * .5;
        this.y = canvas.height - 2;
    }

    distanceSquaredTo(otherParticle) {
        const dx = this.x - otherParticle.x;
        const dy = this.y - otherParticle.y;
        return dx * dx + dy * dy;
    }

    distanceTo(otherParticle) {
        return Math.sqrt(this.distanceSquaredTo(otherParticle));
    }

    freeze() {
        this.frozen = true;
        this.colour = scientificColorCodingFor(1.5 * this.distanceTo(swarm[0]), 0, maxDistance);
    }

    hasCollisionWith(otherParticle) {
        if (!otherParticle.frozen)
            return false;

        return this.distanceSquaredTo(otherParticle) < thresholdDistanceSquared;
    }

    checkForFreezing() {
        for (let i = 0; i < swarmSize; i++)
            if(this.hasCollisionWith(swarm[i])) {
                this.freeze();
                return;
            }
    }

    update() {
        if (this.frozen)
            return;

        const dx = Math.random() * noise;
        const dy = Math.random() * noise;
        this.x += Math.random() < 0.5 ? dx : -dx;
        this.y += verticalDrift + (Math.random() < 0.5 ? dy : -dy);

        this.x = (this.x + canvas.width) % canvas.width;
        //this.y = (this.y + canvas.height) % canvas.height;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = canvas.width * Math.random();
        }

        this.checkForFreezing();
    }

    display() {
        circle(this.x, this.y, this.radius, this.colour);
    }
}

function updateMaxDistance() {
    maxDistance = Math.sqrt(
        canvas.width * canvas.width +
        canvas.height * canvas.height
    );
}

function computeSwarmSize() {
    const cssWidth  = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    const areaCSS = cssWidth * cssHeight;

    swarmSize = Math.floor(
        areaCSS / 10_000 * PARTICLES_PER_10K_PIXELS
    );
}

function setup() {
    swarm.length = 0;
    for (let i = 0; i < swarmSize; i++) {
        swarm.push(new Particle());
    }
    swarm[0].makeSeed();
}

function draw() {
    for (let i = 0; i < swarmSize; i++)
        swarm[i].update();
    for (let i = 0; i < swarmSize; i++)
        swarm[i].display();
}

function resizeCanvasToWrapper() {
    const wrapper = document.getElementById("canvas-wrapper");
    const rectangle = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = Math.floor(rectangle.width * dpr);
    canvas.height = Math.floor(rectangle.height * dpr);

    canvas.style.width  = rectangle.width + "px";
    canvas.style.height = rectangle.height + "px";
}

function resizeAndResetSimulation() {
    resizeCanvasToWrapper();
    updateMaxDistance();
    updateThreshold();
    computeSwarmSize();
    setup();
}

window.addEventListener('resize', () => {
    resizeAndResetSimulation();
});

resizeAndResetSimulation();
window.requestAnimationFrame(function loop() {
    display.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    window.requestAnimationFrame(loop);
});
