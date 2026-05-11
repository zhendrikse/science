import { OrthographicCamera, AmbientLight, DirectionalLight, Vector3, WebGLRenderer, Scene, Group } from "three";
import {VectorField, Arrow, Sphere, ThreeJsUtils} from '../js/three-js-extensions.js';

const canvas = document.getElementById("divCurlCanvas");
const overlay = document.getElementById("overlayText");

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

const renderer = new WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});

const x_max = 2,
    x_min = -x_max,
    y_max = 0.75 * x_max,
    y_min = -y_max;

const camera = new OrthographicCamera(
    x_min, x_max,
    y_max, y_min,
    -10, 10
);

camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

scene.add(new AmbientLight(0xffffff, 0.6));
const dir = new DirectionalLight(0xffffff, 0.8);
dir.position.set(1, 3, 2);
scene.add(dir);

class DemoVectorField extends VectorField {
    constructor(source, sink, curl=null) {
        super();
        this.source = source; // Ball object
        this.sink = sink;     // Ball object
        this.curl = curl;     // Ball object or null
    }

    sample(position) {
        let vector = new Vector3(0, 0, 0);

        // Source: repelling
        const radiusToSource = position.clone().sub(this.source.position);
        const distanceToSource = Math.max(radiusToSource.length(), 0.05);
        vector.add(radiusToSource.multiplyScalar(1 / (distanceToSource * distanceToSource)));

        // Sink: attracting
        const radiusToSink = this.sink.position.clone().sub(position);
        const distanceToSink = Math.max(radiusToSink.length(), 0.05);
        vector.add(radiusToSink.multiplyScalar(1 / (distanceToSink * distanceToSink)));

        // Curl effect (optional)
        if (this.curl) {
            const radiusToCurl = position.clone().sub(this.curl.position);
            const curlV =
                new Vector3(-radiusToCurl.y, radiusToCurl.x, 0).multiplyScalar(0.3 / (radiusToCurl.length() + 0.1));
            vector.add(curlV);
        }

        // Limit velocity
        const maxLen = 2;
        if (vector.length() > maxLen) vector.multiplyScalar(maxLen / vector.length());

        return vector;
    }
}

class OriginalDemoVectorField extends VectorField {
    constructor(source, sink, curl=null) {
        super();
        this.source = source; // Ball object
        this.sink = sink;     // Ball object
        this.curl = curl;     // Ball object or null
    }

    sample(position, radius=.75, a=new Vector3(1, .5, 0), b=new Vector3(-1, -.5, 0), c=new Vector3(-1, .5, 0)) {
        if (a.x - radius <= position.x &&
            position.x <= a.x + radius &&
            a.y - radius <= position.y &&
            position.y <= a.y + radius)
        {
            const theta = Math.atan2((position.y - a.y), (position.x - a.x));
            return new Vector3(-Math.sin(theta), Math.cos(theta), 0);
        } else if (b.x - radius <= position.x &&
            position.x <= b.x + radius &&
            b.y - radius <= position.y &&
            position.y <= b.y + radius)
        {
            const theta = Math.atan2((position.y - b.y), (position.x - b.x));
            return new Vector3(-Math.cos(theta), -Math.sin(theta), 0);
        } else if (c.x - radius <= position.x &&
            position.x <= c.x + radius &&
            c.y - radius <= position.y &&
            position.y <= c.y + radius)
        {
            const theta = Math.atan2((position.y - c.y), (position.x - c.x));
            return new Vector3(Math.cos(theta), Math.sin(theta), 0);
        } else if ((x_max - position.x <= 0.2 || position.x - x_min <= 0.2) &&
            (y_max - position.y <= 0.2 || position.y - y_min <= 0.2))
        {
            const vx = (x_max - position.x <= 0.2) ? -1 : 1;
            const vy = (y_max - position.y <= 0.2) ? -1 : 1;
            return new Vector3(vx, vy, 0)
        } else if (x_max - position.x <= 0.2)
            return new Vector3(0, 1, 0);
        else if (position.x - x_min <= 0.2)
            return new Vector3(0, -1, 0);
        else if (y_max - position.y <= 0.2)
            return new Vector3(-1, 0, 0);
        else if (position.y - y_min <= 0.2)
            return new Vector3(1, 0, 0);
        else
            return new Vector3(0.5, 1.5, 0);
    }
}

function createParticles() {
    const particles = [];
    for (let x = x_min; x <= x_max; x += 0.25)
        for (let y = y_min; y <= y_max; y += 0.25)
            particles.push(new Sphere({position: new Vector3(x, y, 0), radius: 0.05, color: "orange"}));
    particles.forEach((particle) => worldGroup.add(particle));
    return particles;
}

function createArrows() {
    const arrows = [];
    for (let x = x_min; x <= x_max; x += 0.25)
        for (let y = y_min; y <= y_max; y += 0.25) {
            const axis = vectorField.sample(new Vector3(x, y, 0)).multiplyScalar(.2),
                shift = axis.clone().multiplyScalar(-0.1),
                position = new Vector3(x, y, 0).add(shift),
                arrow = new Arrow( {
                    position: position,
                    axis: axis,
                    color: "yellow",
                    opacity: 0,
                    round: true,
                    shaftWidth: 0.05
                });
            arrows.push(arrow);
            worldGroup.add(arrow);
        }
    return arrows;
}

function resetSimulation(particles, arrows) {
    for (const particle of particles)
        worldGroup.remove(particle);
    for (const arrow of arrows)
        worldGroup.remove(arrow);

    time = 0;
    opacity = 0;

    for (const arrow of arrows)
        arrow.opacity = 0;
}

function onResize() {
    const rect = canvas.getBoundingClientRect();

    const width  = Math.round(rect.width);
    const height = Math.round(rect.height);

    renderer.setSize(width, height, true); // <-- true is cruciaal

    const aspect = width / height;
    const viewHeight = y_max - y_min;
    const viewWidth  = viewHeight * aspect;

    camera.top    =  viewHeight / 1.4;
    camera.bottom = -viewHeight / 1.4;
    camera.right  =  viewWidth / 1.4;
    camera.left   = -viewWidth / 1.4;

    camera.updateProjectionMatrix();
}

function showOverlayMessage(message, duration=1000) {
    overlay.textContent = message;
    overlay.style.display = "block";
    setTimeout(() => {
        overlay.style.display = "none";
    }, duration);
}

const source = new Sphere({position: new Vector3(-1, 0.5, 0), radius: 0.25, opacity: 0.4, color: "red"});
const sink = new Sphere({position:  new Vector3(-1, -0.5, 0), radius: 0.25, opacity: 0.4, color: "green"});
const curl = new Sphere({position:  new Vector3(1, 0.5, 0), radius: 0.25, opacity: 0.4, color: "cyan"});
worldGroup.add(source, sink, curl);

let vectorField = new OriginalDemoVectorField(source, sink, curl);
let particles = createParticles();
let arrows = createArrows();

let started = false;
let clickCounter = 0;
window.addEventListener("resize", onResize);
canvas.addEventListener("click", () => {
    if (!started) {
        showOverlayMessage("Start");
        started = true;
    } else {
        showOverlayMessage("Restart with the other vector field!");
        resetSimulation(particles, arrows); // reset animation with extra click
        vectorField = (clickCounter++ % 2 === 0) ?
            new DemoVectorField(source, sink, curl) : new OriginalDemoVectorField(source, sink, curl);
        particles = createParticles();
        arrows = createArrows();
    }
});

renderer.render(scene, camera);
onResize();

let time = 0;
let opacity = 0;
const dt = 0.0025;
const d_o = 0.0025;

renderer.render(scene, camera);
renderer.setAnimationLoop( () => {
    if(!started) {
        overlay.style.display = "block";
        return;
    }

    time += dt;

    // Update particles
    for (const particle of particles) {
        const position = particle.position;
        const velocity = vectorField.sample(position);
        position.addScaledVector(velocity, dt);
        particle.physicsPosition.copy(position);
    }

    // Fading effect for arrows
    if (opacity < 1 && time > 0.1) {
        opacity += d_o;
        for (const arrow of arrows)
            arrow.opacity = opacity;
    }

    renderer.render(scene, camera);
});
