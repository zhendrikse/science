import { Scene, Vector2, Group, Vector3, AmbientLight, PerspectiveCamera, WebGLRenderer, DirectionalLight} from "three";
import { Raycaster, Mesh, MeshStandardMaterial, CylinderGeometry, BufferGeometry, Line, LineBasicMaterial } from "three";
import { HarmonicOscillator, ThreeJsUtils} from '../js/three-js-extensions.js';

const canvas = document.getElementById("applicationCanvas");

const scene = new Scene();
const worldGroup = new Group();
scene.add(worldGroup);

const camera = new PerspectiveCamera(50, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
camera.position.set(0, 0, 25);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({canvas, antialias:true, alpha: true});
renderer.setAnimationLoop(animate);

scene.add(new AmbientLight(0xffffff, 0.6));
const dirLight = new DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
window.addEventListener('resize', () => ThreeJsUtils.resizeRendererToCanvas(renderer, camera));

// PARAMETERS
const ks = 1.2;
const L0 = 5;
const ballMass = 0.5;

class Well extends Group{
    constructor({
        ks = 1.2,
        yOffset = -4,
        color = 0xffff00
    } = {}) {
        super();
        this._ks = ks;
        this._yOffset = yOffset;
        this._energyLevels = [];
        this._currentLevel = null;

        this.#drawVerticalEquilibriumLine(yOffset);
        this.#drawParabolicCurve(yOffset, color);
        this.#drawEnergyLevels(yOffset);

        // Turning point lines
        const vGeom = new CylinderGeometry(0.05, 0.05, 8,16);
        const vMat  = new MeshStandardMaterial({ color: 0x999999 });

        this._vline1 = new Mesh(vGeom, vMat);
        this._vline2 = new Mesh(vGeom, vMat);
        this.verticalLines(false);

        this.add(this._vline1);
        this.add(this._vline2);
    }

    #drawEnergyLevels(yOffset) {
        const dU = 2;
        for(let U = 1; U <= 14; U += dU) {
            const s = Math.sqrt(2 * U / this._ks);
            const levelGeom = new CylinderGeometry(0.1, 0.1, 2 * s, 16);
            const levelMat  = new MeshStandardMaterial({color: 0xffffff});
            const level = new Mesh(levelGeom, levelMat);

            // rotate cylinder horizontally
            level.rotation.z = Math.PI/2;
            level.position.set(0, U + yOffset, 0);

            this.add(level);
            this._energyLevels.push(level);
        }
    }

    #drawParabolicCurve(yOffset, color) {
        const points = [];
        for(let x = -5; x <= 5; x += 0.1) {
            const y = 0.5 * ks * x * x + yOffset;
            points.push(new Vector3(x, y, 0));
        }

        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({color: color, linewidth: 3});
        const curve = new Line(geometry, material);
        this.add(curve);
    }

    #drawVerticalEquilibriumLine(yOffset) {
        const axisGeom = new CylinderGeometry(0.075, 0.075, 10, 16);
        const axisMat  = new MeshStandardMaterial({ color: 0x00ff00 });
        const axisLine = new Mesh(axisGeom, axisMat);
        axisLine.position.set(0, yOffset + 5, 0);
        this.add(axisLine);
    }

    verticalLines(show){
        this._vline1.visible = show;
        this._vline2.visible = show;
    }

    setCurrentLevel(level){
        if(this._currentLevel)
            this._currentLevel.material.color.set(0xffffff);

        this._currentLevel = level;
        level.material.color.set(0xff0000);

        const halfWidth = level.geometry.parameters.height / 2; // energy level cylinder has been rotated!
        this._vline1.position.set(-halfWidth, level.position.y, 0);
        this._vline2.position.set(halfWidth, level.position.y, 0);

        this.verticalLines(true);
    }

    get energyLevels(){ return this._energyLevels; }
}

const raycaster = new Raycaster();
const mouse = new Vector2();
window.addEventListener("click", onMouseClick);

function onMouseClick(event){
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(well.energyLevels);
    if (intersects.length <= 0) return;

    const selectedLevel = intersects[0].object;
    well.setCurrentLevel(selectedLevel);

    // determine amplitude from size of selected level
    const halfWidth = selectedLevel.geometry.parameters.height / 2; // energy level cylinder has been rotated!
    oscillator.reset();
    oscillator.compress(halfWidth);
}

const oscillator = new HarmonicOscillator({
    position: new Vector3(0, 10, 0),
    length: L0 / 2,
    springConstant: ks,
    ballRadius: 0.5,
    ballMass: ballMass,
    color: 0xff4444
});
worldGroup.add(oscillator);

oscillator.compress(3);
const well = new Well({
    ks: ks,
    yOffset: -6
});
worldGroup.add(well);

const dt = 0.005;
function animate(time){
    for (let subStep = 0; subStep < 10; subStep++)
        oscillator.update(dt);
    renderer.render(scene, camera);
}
