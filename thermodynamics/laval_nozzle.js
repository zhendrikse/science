import { Scene, OrthographicCamera, WebGLRenderer, BufferGeometry, Vector3, BufferAttribute,
    Line, LineBasicMaterial, Points, Group, ShaderMaterial } from "three";
import {ThreeJsUtils} from "../js/three-js-extensions.js";


const canvasContainer = document.getElementById("nozzleCanvasContainer");
const canvas = document.getElementById("nozzleCanvas");

// TODO
// - echte isentropic nozzle equations
// - shock diamond simulation
// - GPU particle integration (100k particles)
// - temperature glow

const particlesCount = 25000;
const simSpeed = 0.5;

const scene = new Scene();

const camera = new OrthographicCamera(-4, 4, 2, -2, 0.1, 100);
camera.position.z = 5;

const renderer = new WebGLRenderer({antialias:true, alpha: true, canvas: canvas});
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
renderer.setAnimationLoop( animate );

// --------------------
// NOZZLE GEOMETRY
// --------------------
class Nozzle extends Group {
    constructor(ratio = 0.25) {
        super();
        this._ratio = ratio;

        const ptsTop=[];
        const ptsBottom=[];
        for(let i = 0; i < 200; i++) {
            const x = -2 + i * (5 / 199);
            const r = this.radius(x);

            ptsTop.push(new Vector3(x, r, 0));
            ptsBottom.push(new Vector3(x, -r, 0));
        }

        const geo1 = new BufferGeometry().setFromPoints(ptsTop);
        const geo2 = new BufferGeometry().setFromPoints(ptsBottom);

        const mat = new LineBasicMaterial({ color: "cyan"} );
        this.add(new Line(geo1, mat));
        this.add(new Line(geo2, mat));
    }

    get ratio () { return this._ratio; }

    radius(x){
        if(x < 0)
            return this._ratio + (0.5 - this._ratio/2)/(1 + Math.exp(5 * x + 5)) + 0.057;

        return this._ratio + (1 - this._ratio)/(1 + Math.exp(-3 * x + 4.5)) + 0.05;
    }
}

const nozzle = new Nozzle();
scene.add(nozzle);

// --------------------
// PARTICLES
// --------------------
const positions = new Float32Array(particlesCount * 3)

for(let i = 0; i < particlesCount; i++) {
    let x = -2 - Math.random() * 3;
    let y = (Math.random() - 0.5) * (1 + nozzle.ratio);

    positions[i * 3]     = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = 0;
}

const colors = new Float32Array(particlesCount * 3);
const particlesGeometry = new BufferGeometry();
particlesGeometry.setAttribute('position', new BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new BufferAttribute(colors, 3));

const particlesMaterial = new ShaderMaterial({
    vertexShader: `
    attribute vec3 color;
    varying vec3 vColor;

    void main() {
        vColor = color;
        gl_PointSize = 3.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
`,
    fragmentShader: `
    varying vec3 vColor;

    void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;

        gl_FragColor = vec4(vColor,1.0);
    }
`,
    transparent:false
});
const particles = new Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// --------------------
// VELOCITY FIELD
// --------------------
function velocity(x, y) {
    const r = nozzle.radius(x);
    const exp = x < 0
        ? Math.exp(5 * x + 5)
        : Math.exp(-3 * x + 4.5);

    const denom = (1 + exp) * (1 + exp);
    const dadx = x < 0 ?
        -0.5 * (1 - nozzle.ratio) / denom *  5 * exp * y / r :
        -1.0 * (1 - nozzle.ratio) / denom * -3 * exp * y / r;

    const norm = Math.sqrt(1 + dadx * dadx);
    const vx = 1 / norm;
    const vy = dadx / norm;

    // simple acceleration through throat
    const speed = 1 + 2 * Math.exp(-x * x);
    return [vx * speed, vy * speed];
}

function flowColor(x, y) {
    const A = nozzle.radius(x) * 2
    const Athroat = nozzle.ratio * 2

    const areaRatio = A/Athroat

    const mach = Math.min(3.0, 0.3 + 2.7*(1 - Math.exp(-x*x)))

    const T = 1/(1 + 0.2*mach*mach)
    const rho = Math.pow(T,2.5)

    const densityColor = rho
    const machColor = mach/3.0

    return [
        machColor,
        densityColor,
        1.0-densityColor
    ]
}

// --------------------
// SIMULATION
// --------------------
function updateParticles(){
    const pos = particlesGeometry.attributes.position.array
    const col = particlesGeometry.attributes.color.array

    for(let i = 0; i < particlesCount; i++) {
        const x = pos[i * 3];
        const y = pos[i * 3 + 1];
        const v = velocity(x,y);

        pos[i * 3] += v[0] * 0.01 * simSpeed;
        pos[i * 3 + 1] += v[1] * 0.01 * simSpeed;

        // reset
        if(pos[i * 3] > 3) {
            pos[i * 3] = -2 - Math.random() * 2;
            pos[i * 3 + 1] = (Math.random()-0.5) * (1 + nozzle.ratio);
        }

        const c = flowColor(pos[i*3],pos[i*3+1]);
        col[i*3] = c[0];
        col[i*3+1] = c[1];
        col[i*3+2] = c[2];
    }

    particlesGeometry.attributes.position.needsUpdate=true;
    particlesGeometry.attributes.color.needsUpdate = true;
}

function animate() {
    for (let subStep = 0; subStep < 5; subStep++)
        updateParticles();
    renderer.render(scene, camera);
}
