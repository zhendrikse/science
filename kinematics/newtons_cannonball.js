import { DirectionalLight, TextureLoader, Scene, PerspectiveCamera, Vector3, WebGLRenderer, AmbientLight,
    PointLight, ACESFilmicToneMapping, SRGBColorSpace, MathUtils } from "three";
import { ThreeJsUtils, Ball } from '../js/three-js-extensions.js';
import { SkyDome, Earth, PLANET_SCALE } from '../js/astro-extensions.js';

const planetsCanvas = document.getElementById('earthCanvas');
console.clear();

const earthScene = new Scene();
const earth = new Earth({opacity: 0.1});
earthScene.add(earth);
const earthRadiusScaled = earth.radius / PLANET_SCALE;

earthScene.add(new AmbientLight(0xffffff, .2));
const sunLight = new DirectionalLight(0xffffff, 1);
sunLight.position.copy(new Vector3(1, 1, 1).multiplyScalar(5 * earthRadiusScaled));
earthScene.add(sunLight);

// --- CAMERA ---
const cameraStart = {
    position: new Vector3(0 * earthRadiusScaled, 1 * earthRadiusScaled, 4 * earthRadiusScaled),
    target: new Vector3(0, 0, 0)
};
const planetCamera = new PerspectiveCamera(50, 1, .05 * earthRadiusScaled, 20 * earthRadiusScaled);
planetCamera.position.copy(cameraStart.position);
planetCamera.lookAt(cameraStart.target);

const planetRenderer = new WebGLRenderer( {antialias: true, canvas: planetsCanvas, alpha: true} );
planetRenderer.shadowMap.enabled = false;
planetRenderer.setAnimationLoop( animate );
planetRenderer.toneMapping = ACESFilmicToneMapping;
planetRenderer.toneMappingExposure = 1.5;
planetRenderer.outputColorSpace = SRGBColorSpace;

// Resizing for mobile devices
ThreeJsUtils.resizeRendererToCanvas(planetRenderer, planetCamera);
window.addEventListener('resize', () => {
    ThreeJsUtils.resizeRendererToCanvas(planetRenderer, planetCamera);
});


const skyDome = new SkyDome({
    starDensity: 1,
    skyRadius: 18 * earthRadiusScaled,
    glowStarCount: 500});
earthScene.add(skyDome);

export class CannonBall {
    constructor(scene, earth, speed = 7800) {
        this._speed = speed;
        const r0 = earth.radius * 1.05;
        this._initialPosition = new Vector3(0, r0, 0);

        this._ball = new Ball(scene, {
            position: this._initialPosition.clone(),
            radius: earth.radius * 0.05,
            mass: 1,
            scale: 1 / PLANET_SCALE,
            color: "cyan",
            makeTrail: true
        });

        this.reset();
    }

    reset() {
        this._ball.moveTo(this._initialPosition.clone());
        const radial = this._initialPosition.clone().normalize();

        // tangentiële snelheid
        const tangential = new Vector3(-radial.y, radial.x, 0);
        this._velocity = tangential.multiplyScalar(this._speed);
    }

    update(dt, gravityFunction) {
        // acceleration = - 9.8 * norm(self._ball.pos)
        // self._velocity += acceleration * dt
        // self._ball.pos += self._velocity * dt + 0.5 * acceleration * dt * dt

        const position = this._ball.position.clone();
        const acceleration = gravityFunction(position);

        this._velocity.addScaledVector(acceleration, dt);
        position.addScaledVector(this.velocity, dt).add(acceleration.multiplyScalar(0.5 * dt * dt));

        this._ball.moveTo(position);
    }

    get position() { return this._ball.position; }
    get velocity() { return this._velocity; }
}

export function constantGravity(position, g = 9.81) {
    return position.clone()
        .normalize()
        .multiplyScalar(-g);
}

const cannon = new CannonBall(earthScene, earth, 7800);
// const uniformBall = new CannonBall(earthScene, earth, 0);
// const pointBall   = new CannonBall(earthScene, earth, 0);

const dt = 5;
function animate(now) {
    cannon.update(dt, (pos) => constantGravity(pos, 9.81));

    skyDome.update(now * .001, planetCamera);
    planetRenderer.render(earthScene, planetCamera);
}
