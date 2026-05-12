/**
 * An educational/scientific simulation environment with clear separation between model and visualization.
 * The simulation physics are realized independently of the view objects. These view objects are synchronized
 * transparently by the simulation environment.
 *
 * Core ideas:
 *
 * - clear separation of responsibilities
 * - low cognitive load
 * - code reveals (scientific) intention, so you can literally use: simulation.attach(physics.to(view))
 **/

import {
    Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, Group, Vector3, BufferAttribute, Fog,
    MeshStandardMaterial, SphereGeometry, Mesh, BufferGeometry, LineBasicMaterial, Line, TubeGeometry,
    CylinderGeometry, ConeGeometry, BoxGeometry, Color, Curve, Quaternion, RepeatWrapping, DoubleSide,
    TextureLoader, Vector2, PlaneGeometry, PCFShadowMap, AmbientLight
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**********************************************
 * S I M U L A T I O N  E N V I R O N M E N T *
 **********************************************/

export class ThreeSim {
    static Background = Object.freeze({
        PLAIN: "Plain",
        FOG: "Fog",
        TRANSPARENT: "Transparent"
    });

    constructor({
        canvas,
        overlay = null, // If overlay is not defined, the simulation won't wait for a mouse click
        scale = 1,
        background = ThreeSim.Background.TRANSPARENT,
        backgroundColor = 0x0088ff,
        controls = true,
        light = true,
        resetFunction = null,
        cameraPosition = new Vector3(3, 3, 3),
        shadowsEnabled = false,
        fieldOfView = 50
    }) {
        this._canvas = canvas;
        this._overlay = overlay;

        this._autoRotate = false;
        this._autoRotateTheta = Math.PI / 2;
        this._autoRotatePhi = 0;

        this._transform = new Transform(scale);
        this._staticObjects = [];  // Are static during the whole simulation hence do NOT need to be synchronized
        this._dynamicObjects = []; // Need to be synchronized every update
        this._scene = new Scene();
        this._running = false;
        this._onReset = resetFunction;

        this._world = new Group();
        this._scene.add(this._world);

        this._camera = new PerspectiveCamera(fieldOfView, canvas.clientWidth / canvas.clientHeight, 0.1, 1e6);
        this._camera.position.copy(cameraPosition);

        this._renderer = new WebGLRenderer({
            antialias: true,
            canvas: this._canvas,
            alpha: background === ThreeSim.Background.TRANSPARENT
        });
        this._resizeRendererToCanvas();
        if (shadowsEnabled) {
            this._renderer.shadowMap.enabled = true;
            this._renderer.shadowMap.type = PCFShadowMap;
        }

        if (controls) this._controls = new OrbitControls(this._camera, canvas);

        if (light) this._initLights(shadowsEnabled);

        this._initBackground(background, backgroundColor);
        this._initEventHandlers(overlay);
    }

    _initBackground(background, backgroundColor) {
        switch (background) {
            case ThreeSim.Background.PLAIN:
                this._scene.background = new Color(backgroundColor);
                break;
            case ThreeSim.Background.FOG:
                this._scene.background = new Color(backgroundColor);
                this._scene.fog = new Fog(backgroundColor, 1, 100);
                break;
            case ThreeSim.Background.TRANSPARENT:
            default:
                break;
        }
    }

    _initLights(shadowsEnabled) {
        const directionalLight = new DirectionalLight(0xffffff, shadowsEnabled ? 2 : 1);
        directionalLight.position.set(0, this._camera.position.y, 0);
        this._scene.add(directionalLight);
        this._scene.add(new AmbientLight(0xffffff, 0.8));

        if (shadowsEnabled) {
            // Adjust shadow camera settings
            directionalLight.shadow.camera.near = 0.5; // Default is 0.5
            directionalLight.shadow.camera.far = 50; // Default is 500
            directionalLight.shadow.camera.top = 20;
            directionalLight.shadow.camera.right = 20;
            directionalLight.shadow.camera.bottom = -20;
            directionalLight.shadow.camera.left = -20;
            directionalLight.castShadow = true;

            // Adjust shadow map settings
            directionalLight.shadow.mapSize.width = 2048; // Default is 512
            directionalLight.shadow.mapSize.height = 2048; // Default is 512

        }
    }

    _doAutoRotate(distance) {
        this._autoRotateTheta += -Math.PI / (7.5 * 100);
        this._autoRotatePhi +=  Math.PI / (7.5 * 100) * 2;

        this._camera.position.set(
            distance * Math.sin(this._autoRotateTheta) * Math.sin(this._autoRotatePhi),
            distance * Math.cos(this._autoRotateTheta),
            distance * Math.sin(this._autoRotateTheta) * Math.cos(this._autoRotatePhi)
        );

        this._camera.lookAt(0, 0, 0);
    }

    _initEventHandlers(overlay) {
        window.addEventListener("resize", () => this._resizeRendererToCanvas());

        if (overlay)
            this._canvas.addEventListener("click", () => {
                if (!this._running) {
                    this.showOverlayMessage("Started");
                    this._running = true;
                } else {
                    this.showOverlayMessage("Reset");
                    this._running = false;
                    this.reset();
                }
            });
        else
            this._running = true;
    }

    showOverlayMessage(message, duration = 1000) {
        this._overlay.textContent = message;
        this._overlay.style.display = "block";

        setTimeout(() => {
            this._overlay.style.display = "none";
        }, duration);
    }

    _resizeRendererToCanvas() {
        const canvas = this._renderer.domElement;
        const canvasWidth = canvas.clientWidth;
        const canvasHeight = canvas.clientHeight;

        if (!canvasWidth || !canvasHeight)
            return;

        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        const width = Math.floor(canvasWidth * pixelRatio);
        const height = Math.floor(canvasHeight * pixelRatio);

        if (canvas.width === width || canvas.height === height)
            return;

        this._renderer.setPixelRatio(pixelRatio);
        this._renderer.setSize(canvasWidth, canvasHeight, false);
        this._camera.aspect = canvasWidth / canvasHeight;
        this._camera.updateProjectionMatrix();
    }

    _sync() {
        for (const anObject of this._dynamicObjects)
            if (anObject.render)
                anObject.render(this._transform);
    }

    addThreeJsObject(anObject, dynamic=false) {
        this._world.add(anObject);
        if (dynamic)
            this._dynamicObjects.push(anObject);
        else
            this._staticObjects.push(anObject);
    }

    attach(bodyAndView) {
        const viewObject = bodyAndView.view;
        this.addThreeJsObject(viewObject, true);
        viewObject.body = bodyAndView.body;

        // Initial render before entering render loop
        viewObject.render?.(this._transform);
    }

    attachStatically(bodyAndView) {
        const viewObject = bodyAndView.view;
        this.addThreeJsObject(viewObject, true);
        viewObject.body = bodyAndView.body;

        this.addThreeJsObject(bodyAndView.view, false);
    }

    _animationStep(time) {
        if (this._running && this._updateFunction)
            this._updateFunction(time);

        this._sync();
        this._renderer.render(this._scene, this._camera);
        this._controls?.update();

        if (this._autoRotate)
            this._doAutoRotate(this._camera.position.length());
    }

    run(updateFunction = null) {
        this._updateFunction = updateFunction;
        this._renderer.setAnimationLoop((time) => this._animationStep(time));
    }

    reset() {
        for (const anObject of this._dynamicObjects)
            if (anObject.reset)
                anObject.reset();

        if ( this._onReset)
            this._onReset();
    }

    set autoRotate(autoRotate) { this._autoRotate = autoRotate; }
    set onReset(resetFunction) { this._onReset = resetFunction; }
}

class Transform {
    constructor(scale) {
        this._scale = scale;
    }

    physicsToRender(vector) {
        return vector.clone().multiplyScalar(this._scale);
    }

    renderToPhysics(vector) {
        return vector.clone().multiplyScalar(1 / this._scale);
    }

    scaleRadius(radius) {
        return radius * this._scale;
    }
}

/*****************
 * P H Y S I C S *
 *****************/

//
// Constants
//
export const G = 6.67e-11; // Gravitational constant
export const EC = 1.6e-19; // Coulomb charge

//
// Functions
//
export function gravitationalForceBetween(twoBodies) {
    const radius = twoBodies.body1.positionVectorTo(twoBodies.body2);
    const rSquared = twoBodies.body1.distanceToSquared(twoBodies.body2);
    return radius.normalize().multiplyScalar(G * twoBodies.body1.mass * twoBodies.body2.mass / rSquared);
}

//
// Bodies to do physics with
//
class Body {  // INTENTIONALLY NOT EXPORTED TO THE OUTSIDE WORLD !!!
    static integrationStep = (body, force, dt = 0.01, integrator = Integrators.symplecticEulerStep) => {
        const accelerationFn = (bodyParam) => force.clone().multiplyScalar(1 / bodyParam.mass);
        const updatedBody = integrator(body, dt, accelerationFn);
        body.position = updatedBody.position;
        body.velocity = updatedBody.velocity;
        body.acceleration = updatedBody.acceleration;
    }

    constructor({
                    position = new Vector3(),
                    velocity = new Vector3()
                } = {}) {
        this.acceleration = new Vector3();  // Intentionally public
        this.position = position.clone();   // Intentionally public
        this.velocity = velocity.clone();   // Intentionally public
        this.velocityVector = new VelocityVector(this);
        this.accelerationVector = new AccelerationVector(this);
    }

    clone() {
        return new Body({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            velocityVector: this.velocityVector.clone(),
            accelerationVector: this.accelerationVector.clone()
        });
    }

    and(otherBody) { return new TwoBodies(this, otherBody) };

    to(view) { return { body: this, view: view}; };

    positionVectorTo(other) { return other.position.clone().sub(this.position); }
    distanceToSquared(other) { return this.positionVectorTo(other).dot(this.positionVectorTo(other)); }
    distanceTo(other) { return this.positionVectorTo(other).length() }
}

export class MasslessBody extends Body {
    constructor({
        position = new Vector3(),
        velocity = new Vector3()
    } = {}) {
        super({position, velocity});
    }

    timeStep(acceleration, dt = 0.01, integrator = Integrators.symplecticEulerStep) {
        const updatedBody = integrator(this, dt, () => acceleration);
        this.position = updatedBody.position;
        this.velocity = updatedBody.velocity;
        this.acceleration = updatedBody.acceleration;
    }
}

export class AxisVector extends Body {
    constructor({position = new Vector(), axis = new Vector()} = {}) {
        super({ position });
        this.axis = axis.clone();
    }

    clone() {
        return new AxisVector({
            position: this.position.clone(),
            axis: this.axis.clone()
        });
    }
}

class AccelerationVector {
    constructor(parent) {
        this._parent = parent;
    }

    clone() { return new AccelerationVector(this._parent); }

    to(view) { return { body: this, view: view}; };

    get position() { return this._parent.position; }
    get velocity() { return this._parent.velocity; }
    get acceleration() { return this._parent.acceleration; }
    get axis() { return this._parent.acceleration; }
    set axis(newAxis) { this._parent.acceleration.copy(newAxis); }
}

class VelocityVector {
    constructor(parent) {
        this._parent = parent;
    }

    clone() { return new VelocityVector(this._parent); }

    to(view) { return { body: this, view: view}; };

    get position() { return this._parent.position; }
    get velocity() { return this._parent.velocity; }
    get acceleration() { return this._parent.acceleration; }
    get axis() { return this._parent.velocity; }
    set axis(newAxis) { this._parent.velocity.copy(newAxis); }
}

export class VectorField {
    constructor() { }

    to(view) { return { body: this, view: view}; };

    range(positions) {
        let min = Infinity;
        let max = -Infinity;

        for (const position of positions) {
            const mag = this.sampleAt(position).length();
            min = Math.min(min, mag);
            max = Math.max(max, mag);
        }

        return { min, max };
    }

    sampleAt(positionVector) {
        throw new Error("You invoked the method of an abstract base class. Please create a subclass first.");
    }

    #centralDifferences(position, h) {
        const dx = new Vector3(h, 0, 0);
        const dy = new Vector3(0, h, 0);
        const dz = new Vector3(0, 0, h);

        const Fx1 = this.sampleAt(position.clone().add(dx));
        const Fx0 = this.sampleAt(position.clone().sub(dx));

        const Fy1 = this.sampleAt(position.clone().add(dy));
        const Fy0 = this.sampleAt(position.clone().sub(dy));

        const Fz1 = this.sampleAt(position.clone().add(dz));
        const Fz0 = this.sampleAt(position.clone().sub(dz));
        return { Fx0, Fy0, Fz0, Fx1, Fy1, Fz1 };
    }

    divergence(position, h = 1e-2) {
        const { Fx0, Fy0, Fz0, Fx1, Fy1, Fz1 } = this.#centralDifferences(position, h);

        return (
            (Fx1.x - Fx0.x) +
            (Fy1.y - Fy0.y) +
            (Fz1.z - Fz0.z)
        ) / (2 * h);
    }

    curl(position, h = 1e-2) {
        const { Fx0, Fy0, Fz0, Fx1, Fy1, Fz1 } = this.#centralDifferences(position, h);

        return new Vector3(
            (Fy1.z - Fy0.z - (Fz1.y - Fz0.y)) / (2 * h),
            (Fz1.x - Fz0.x - (Fx1.z - Fx0.z)) / (2 * h),
            (Fx1.y - Fx0.y - (Fy1.x - Fy0.x)) / (2 * h)
        );
    }

    curlMagnitude(position, h = 1e-2) {
        return this.curl(position, h).length();
    }
}

export class Ball extends Body {
    constructor({
        position = new Vector3(0, 0, 0),
        velocity = new Vector3(0, 0, 0),
        mass = 1,
        radius = 1,
        elasticity = 1
    } = {}) {
        super( {position, velocity})
        this.mass = mass;
        this.radius = radius;
        this.elasticity = elasticity;
    }

    clone() {
        return new Ball({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            radius: this.radius,
            mass: this.mass
        });
    }

    apply(force, dt = 0.01, integrator = Integrators.symplecticEulerStep) {
        Body.integrationStep(this, force, dt, integrator);
    }

    get kineticEnergy() { return 0.5 * this.mass * this.velocity.dot(this.velocity); }
    get potentialEnergy() { return this.mass * G * this.position.y; }
    get momentum() { return this.mass * this.velocity; }
}

export class Block extends Body {
    constructor({
        position = new Vector3(0, 0, 0),
        velocity = new Vector3(0, 0, 0),
        size = new Vector3(1, 1, 1),
        mass = 1,
    } = {}) {
        super({position, velocity});
        this.size = size;
        this.mass = mass;
    }

    clone() {
        return new Block({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            size: this.size.clone(),
            mass: this.mass
        });
    }

    apply(force, dt = 0.01, integrator = Integrators.symplecticEulerStep) {
        Body.integrationStep(this, force, dt, integrator);
    }
}

export class Particle extends Body {
    static fieldAt(body, point) {
        const rVec = point.clone().sub(body.position);
        const distanceSquared = rVec.dot(rVec);

        return distanceSquared < 1e-40 ?
            new Vector3(0, 0, 0) :
            rVec.normalize().multiplyScalar(body.charge / distanceSquared);
    }

    constructor({
        position = new Vector3(0, 0, 0),
        velocity = new Vector3(0, 0, 0),
        mass = 1,
        radius = 1,
        charge = 0
    } = {}) {
        super( {position, velocity})
        this.charge = charge;
        this.mass = mass;
        this.radius = radius;
    }

    clone() {
        return new Particle({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            radius: this.radius,
            mass: this.mass,
            char: this.charge
        });
    }

    apply(force, dt = 0.01, integrator = Integrators.symplecticEulerStep) {
        Body.integrationStep(this, force, dt, integrator);
    }

    fieldAt(point) { return Particle.fieldAt(this, point); }

    get kineticEnergy() { return 0.5 * this.mass * this.velocity.dot(this.velocity); }
    get momentum() { return this.mass * this.velocity; }
}

class VectorFieldVector extends Body {
    constructor({position, vectorField} = {}) {
        super({ position });
        this._vectorField = vectorField;
    }

    get axis() { return this._vectorField.sampleAt(this.position); }
}

export class Spring extends Body {
    static between(twoBodies, k = 200) {
        const axis = twoBodies.body1.positionVectorTo(twoBodies.body2);
        const position = twoBodies.body1.position;
        return new Spring({position, axis, k});
    }

    constructor({position = new Vector3(), axis = new Vector3(0, 1, 0), k=100} = {}) {
        super({ position });
        this.axis = axis;
        this.restLength = axis.length();
        this.k = k; // spring constant
    }

    clone() {
        return new Spring({
            position: this.position.clone(),
            axis: this.axis.clone(),
            k: this.k
        });
    }

    get direction() { return this.axis; }
    get potentialEnergy() { return 0.5 * this.k * this.displacement * this.displacement; }
    get force() { return this.axis.clone().normalize().multiplyScalar(-this.k * this.displacement); }
    get displacement() { return  this.axis.length() - this.restLength; }
    get isCompressed() { return this.axis.length() < this.restLength; }
    get endPosition() { return this.position.clone().add(this.axis); }
}

class TwoBodies {
    constructor(body1, body2) {
        this.body1 = body1;
        this.body2 = body2;
    }
}

export class HarmonicOscillator {
    static between = (twoBodies, k=200, damping=0.2) => {
        return new HarmonicOscillator(twoBodies.body1, twoBodies.body2, k, damping);
    }

    constructor(body1, body2, k, damping) {
        this.bond = Spring.between(body1.and(body2), k);
        this.body1 = body1;
        this.body2 = body2;
        this._damping = damping;
    }

    to(view) { return { body: this.bond, view: view}; };

    oscillate(dt, integrator = Integrators.symplecticEulerStep) {
        const delta = this.body1.positionVectorTo(this.body2);
        const length = delta.length();
        const direction = delta.clone().normalize();

        const forceMagnitude = -this.bond.k * (length - this.bond.restLength);
        const force = direction.multiplyScalar(forceMagnitude);

        const relativeVelocity = this.body1.velocity.clone().sub(this.body2.velocity);
        const dampingForce = relativeVelocity
            .projectOnVector(direction)
            .multiplyScalar(this._damping);
        force.add(dampingForce);

        this.body1.apply(force.clone().negate(), dt, integrator);
        this.body2.apply(force, dt, integrator);

        this.bond.position.copy(this.body1.position);
        this.bond.axis = delta;
    }

    decompress(amount) { this.compress(-amount); }

    compress(amount) {
        this.body1.position.add(new Vector3(amount, 0, 0));
        this.body2.position.sub(new Vector3(amount, 0, 0));
        this.bond.position.copy(this.body1.position);
        this.bond.axis = this.body1.positionVectorTo(this.body2);
    }
}

/*************************
 * M A T H E M A T I C S *
 *************************/

export class Integrators {
    static eulerStep(body, dt, accelerationFn) {
        const acceleration = accelerationFn(body);
        const newBody = body.clone();

        newBody.velocity.addScaledVector(acceleration, dt);
        newBody.position.addScaledVector(body.velocity, dt);
        newBody.acceleration = acceleration;

        return newBody;
    }

    static symplecticEulerStep(body, dt, accelerationFn) {
        const acceleration = accelerationFn(body);
        const newBody = body.clone();

        newBody.velocity.addScaledVector(acceleration, dt);
        newBody.position.addScaledVector(newBody.velocity, dt);
        newBody.acceleration = acceleration;

        return newBody;
    }

    static rk2Step(body, dt, accelerationFn) {
        const acceleration = accelerationFn(body);

        const derivative = (body) => ({
            dx: body.velocity.clone(),
            dv: acceleration
        });

        const k1 = derivative(body);

        const mid = body.clone();
        mid.position.addScaledVector(k1.dx, dt);
        mid.velocity.addScaledVector(k1.dv, dt);

        const k2 = derivative(mid);

        const newBody = body.clone();
        newBody.position.addScaledVector(k1.dx.clone().add(k2.dx), dt / 2);
        newBody.velocity.addScaledVector(k1.dv.clone().add(k2.dv), dt / 2);
        newBody.acceleration = acceleration;

        return newBody;
    }

    static rk4Step(body, dt, accelerationFn) {
        const acceleration = accelerationFn(body);

        const derivative = (body) => ({
            dx: body.velocity.clone(),
            dv: acceleration
        });

        const k1 = derivative(body);

        const s2 = body.clone();
        s2.position.addScaledVector(k1.dx, dt / 2);
        s2.velocity.addScaledVector(k1.dv, dt / 2);
        const k2 = derivative(s2);

        const s3 = body.clone();
        s3.position.addScaledVector(k2.dx, dt / 2);
        s3.velocity.addScaledVector(k2.dv, dt / 2);
        const k3 = derivative(s3);

        const s4 = body.clone();
        s4.position.addScaledVector(k3.dx, dt);
        s4.velocity.addScaledVector(k3.dv, dt);
        const k4 = derivative(s4);

        const newBody = body.clone();

        newBody.position
            .addScaledVector(k1.dx, dt / 6)
            .addScaledVector(k2.dx, dt / 3)
            .addScaledVector(k3.dx, dt / 3)
            .addScaledVector(k4.dx, dt / 6);

        newBody.velocity
            .addScaledVector(k1.dv, dt / 6)
            .addScaledVector(k2.dv, dt / 3)
            .addScaledVector(k3.dv, dt / 3)
            .addScaledVector(k4.dv, dt / 6);

        newBody.acceleration = acceleration;

        return newBody;
    }
}

export class Range {
    constructor(from, to, stepSize) {
        this.from = from;
        this.to = to;
        this.stepSize = stepSize || 0.1;
    }

    /**
     * Use:
     *   for (const x of range)
     *     console.log(x);
     *
     * @returns {Generator<*, void, *>}
     */
    *[Symbol.iterator]() {
        if (!isFinite(this.from) || !isFinite(this.to))
            throw new Error("Cannot iterate over an infinite interval.");
        if (this.stepSize <= 0)
            throw new Error("stepSize must be > 0");

        const n = Math.floor((this.to - this.from) / this.stepSize);
        for (let i = 0; i <= n; i++)
            yield this.from + i * this.stepSize;
    }
}

/*************
 * V I E W S *
 *************/

//
// T R A I L
//
class TrailLine {
    constructor({
                    maxPoints = 200,
                    color = 0xffffff,
                    linewidth = 1,
                } = {}) {
        this._maxPoints = maxPoints;
        this._positions = [];
        this._geometry = new BufferGeometry();
        this._material = new LineBasicMaterial({ color, linewidth });
        this._line = new Line(this._geometry, this._material);
    }

    addPoint(position) {
        this._positions.push(position.clone());

        if (this._positions.length > this._maxPoints)
            this._positions.shift();

        const array = new Float32Array(this._positions.length * 3);
        this._positions.forEach((pos, i) => {
            array[3 * i] = pos.x;
            array[3 * i + 1] = pos.y;
            array[3 * i + 2] = pos.z;
        });

        this._geometry.setAttribute('position', new BufferAttribute(array, 3));
        this._geometry.computeBoundingSphere();
    }

    clear() {
        this._positions.length = 0;
        this._geometry.setAttribute('position', new BufferAttribute(new Float32Array(0), 3));
    }
}

export class Trail extends Group {
    constructor({
        maxPoints = 200,
        trailStep = 1,
        lineWidth = 1,
        color = 0xffff00
    } = {}) {
        super();
        this._color = color;
        this._maxPoints = maxPoints;
        this._lineWidth = lineWidth;
        this._trailAccumulator = 0;
        this._trailStep = trailStep;
        this._body = null;
        this._initialState = null;
        this._previousPosition = null;
    }

    set body(body) {
        this._body = body;
        this._initialState = body.clone();
        this._previousPosition = body.position.clone();
        this._renew();
    }

    reset() {
        this.dispose();
        this._renew();
    }

    render(transform, increment = 1) {
        const newPosition = transform.physicsToRender(this._body.position);
        if (this._previousPosition.x === newPosition.x &&
            this._previousPosition.y === newPosition.y &&
            this._previousPosition.z === newPosition.z)
            return; // When body's position remains unchanged, do NOT update the trail

        this._trailAccumulator += increment;
        if (this._trailAccumulator >= this._trailStep) {
            this._trail.addPoint(newPosition);
            this._previousPosition = newPosition;
            this._trailAccumulator = 0;
        }
    }

    _renew() {
        this._trail = new TrailLine({
            maxPoints: this._maxPoints,
            color: this._color,
            linewidth: this._lineWidth
        });
        this.add(this._trail._line);
    }

    dispose() {
        if (!this._trail) return;

        if (this._trail._line) {
            if (this._trail._line.geometry)
                this._trail._line.geometry.dispose();
            if (this._trail._line.material)
                this._trail._line.material.dispose();
        }
        this.remove(this._trail._line);
        this._trail = null;
    }
}

//
// Sphere
//
export class Sphere extends Mesh {
    constructor({
        color = 0xffff00,
        visible = true,
        segments = 24,
        opacity = 1,
        castShadow = false,
        wireframe = false
    } = {}) {
        const material = new MeshStandardMaterial({
            color: color,
            opacity: opacity,
            transparent: true,
            wireframe: wireframe,
            visible: visible,
            roughness: 0.2,
            metalness: 0.8
        })

        super(new SphereGeometry(1, segments, segments), material);
        this._body = null;
        this._initialState = null;
        this.visible = visible;
        this.castShadow = castShadow;
    }

    set body(body) {
        // Sanity checks
        if (!body.radius)
            throw new Error("This body type does not have a radius, hence it cannot be attached to this view.");

        this._body = body;
        this._initialState = body.clone(body);
    }

    reset() {
        this._body.position = this._initialState.position;
        this._body.velocity = this._initialState.velocity;
        this._body.radius = this._initialState.radius;
    }

    render(transform) {
        const renderPosition = transform.physicsToRender(this._body.position);
        this.position.copy(renderPosition);

        const renderRadius = transform.scaleRadius(this._body.radius);
        this.scale.setScalar(renderRadius);

        this._trail?.render(transform);
    }

    get radius() { return this._radius; }
    get color() { return this.material.color; }

    set radius(newRadius) { this._radius = newRadius; }
    set color(newColor) { this.material.color.set(newColor); }
}

//
// Arrow
//
export class Arrow extends Group {
    static HEAD_RATIO = 0.35;   // part of total length
    static SHAFT_RATIO = 1 - Arrow.HEAD_RATIO;
    static UP = new Vector3(0, 1, 0);
    static ShaftGeometryRound = new CylinderGeometry(1, 1, 1, 16);
    static ShaftGeometrySquare = new BoxGeometry(1, 1, 1);
    static HeadGeometryRound = new ConeGeometry(1, 1, 16);
    static HeadGeometrySquare = new ConeGeometry(1, 1, 4);
    constructor({
        color = 0xff0000,
        size = 1,
        opacity = 1,
        round = false,
        visible = true,
        castShadow = false,
        magnitudeMap = magnitude => magnitude, // identity mapping by default
        colorMap = null  // use the unmodified base color by default
    } = {}) {
        super();

        const shaftGeometry = round ? Arrow.ShaftGeometryRound : Arrow.ShaftGeometrySquare;
        const headGeometry = round ? Arrow.HeadGeometryRound : Arrow.HeadGeometrySquare;
        const material = new MeshStandardMaterial({
            color: color,
            opacity: opacity,
            transparent: true
        });

        this._shaft = new Mesh(shaftGeometry, material);
        this._shaft.castShadow = castShadow;
        this._head = new Mesh(headGeometry, material);
        this._head.castShadow = castShadow;
        if (!round)
            this._head.rotation.y = Math.PI / 4; // By default, the rotation of square-shaped head is 45 degrees off

        this.add(this._shaft, this._head);
        this._initialState = null;
        this.visible = visible;
        this._body = null;
        this._size = size;
        this._colorMap = colorMap;
        this._magnitudeMap = magnitudeMap;
        this._baseColor = color;
    }

    reset() {
        this._body.position.copy(this._initialState.position);
        this._body.axis.copy(this._initialState.axis);
    }

    set body(body) {
        // Sanity checks
        if (!body.axis)
            throw new Error("This body type does not have an axis, hence it cannot be attached to this view.");

        this._body = body;
        this._initialState = body.clone();
    }

    dispose() {
        // DO NOT dispose shared geometries
        if (this._shaft) {
            if (this._shaft.material)
                this._shaft.material.dispose();
            this.remove(this._shaft);
            this._shaft = null;
        }

        if (this._head) { // head.material is the same object as share.material, so has already been disposed
            this.remove(this._head);
            this._head = null;
        }

        this.clear();
    }

    render(transform) {
        this.position.copy(transform.physicsToRender(this._body.position));

        const axis = this._body.axis.clone();
        const rawMagnitude = axis.length();
        const visualMagnitude = this._magnitudeMap(rawMagnitude);
        const length = visualMagnitude * this._size;

        if (this._colorMap) {
            const color = this._colorMap(length);
            this._shaft.material.color.copy(color);
            this._head.material.color.copy(color);
        }

        this.quaternion.setFromUnitVectors(Arrow.UP, axis.normalize());

        const shaftLength = length * Arrow.SHAFT_RATIO;
        const headLength = length * Arrow.HEAD_RATIO;
        const shaftRadius = length * 0.075;

        this._shaft.scale.set(shaftRadius, shaftLength, shaftRadius);
        this._shaft.position.y = shaftLength * 0.5;

        this._head.scale.set(shaftRadius * 2, headLength, shaftRadius * 2);
        this._head.position.y = shaftLength + headLength * 0.5;
    }

    set opacity(opacity) {
        this._shaft.material.opacity = opacity;
        this._head.material.opacity = opacity;
    }
    set color(color) { this._shaft.material.color = color; }
}

//
// ArrowField
//
export class ArrowField extends Group{
    constructor({
        xRange,
        yRange,
        zRange,
        scaleFactor = 1,
        round = false,
        magnitudeMap = magnitude => Math.log(1 + magnitude),
        colorMap = magnitude => new Color().setHSL(Math.log(1 + magnitude), 2, 0.5)

} = {}) {
        super();
        this._xRange = xRange;
        this._yRange = yRange;
        this._zRange = zRange;
        this._scaleFactor = scaleFactor;
        this._magnitudeMap = magnitudeMap;
        this._colorMap = colorMap;
        this._round = round;
        this._fieldArrows = [];
    }

    _createArrowAt(x, y, z, vectorField) {
        const position = new Vector3(x, y, z);
        const fieldVector = new VectorFieldVector({position, vectorField});
        const fieldArrow = new Arrow({
            color: 0x00ffff,
            size: this._scaleFactor,
            round: this._round,
            magnitudeMap: this._magnitudeMap,
            colorMap: this._colorMap,
        });
        fieldArrow.body = fieldVector;
        this._fieldArrows.push(fieldArrow);
        this.add(fieldArrow);
    }

    set body(vectorField) {
        for (let x of this._xRange)
            for (let y of this._yRange)
                for (let z of this._zRange)
                    this._createArrowAt(x, y, z, vectorField);
    }

    render(transform) {
        for (let fieldArrow of this._fieldArrows)
            fieldArrow.render(transform);
    }
}

//
// Cylinder
//
export class Cylinder extends Mesh {
    constructor({
        radius = 1,
        color = 0xffff00,
        opacity = 1,
        castShadow = false
    } = {}) {

        const geometry = new CylinderGeometry(radius, radius, 1, 24);
        const material = new MeshStandardMaterial({
            color,
            opacity,
            transparent: opacity < 1
        });
        super(geometry, material);
        this.castShadow = castShadow;

        this._body = null;
        this._initialState = null;
    }

    set body(body) {
        // Sanity checks
        if (!body.axis)
            throw new Error("This body type does not have an axis, hence it cannot be attached to this view.");

        this._body = body;
        this._initialState = body.clone();
    }

    render(transform) {
        const pos = transform.physicsToRender(this._body.position);
        this.position.copy(pos);

        const axis = transform.physicsToRender(this._body.axis.clone());
        const length = axis.length();
        if (length < 1e-6)
            return;

        this.scale.set(1, length, 1);

        const direction = axis.normalize();
        this.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction);

        this.position.add(direction.multiplyScalar(length / 2));
    }
}

//
// Box
//
export class Box extends Mesh {
    constructor({
            color = 0xff0000,
            opacity = 1,
            visible = true,
            castShadow = false
        } = {}) {
        super(
            new BoxGeometry(1, 1, 1),
            new MeshStandardMaterial({
                color: color,
                transparent: true,
                opacity: opacity,
                depthTest: false
            }));
        this.visible = visible;
        this.castShadow = castShadow;
        this._initialState = null;
        this._body = null;
    }

    reset() {
        this._body.position.copy(this._initialState.position);
    }

    set body(body) {
        // Sanity checks
        if (!body.size || !body.size.x)
            throw new Error("This body type does not have size vector, hence it cannot be attached to this view.");

        this._body = body;
        this._initialState = body.clone();
        this.scale.set(body.size.x, body.size.y, body.size.z);
    }

    render(transform) {
        this.position.copy(transform.physicsToRender(this._body.position));
    }
}

//
// Spring
//
class Coils extends Curve {
    constructor(position, axis, coils = 25, radius = 0.4, waveAmp = 0.05, wavePhase = 0) {
        super();
        this.start = position.clone();
        this.coils = coils;
        this._axis = axis;
        this.radius = radius;
        this.waveAmp = waveAmp;
        this.wavePhase = wavePhase;
    }

    updateAxis = (newAxis) => this._axis.copy(newAxis);

    getPoint(t) {
        const length = this._axis.length();
        const angle = t * this.coils * Math.PI * 2;
        const x = Math.cos(angle) * this.radius;
        const y = Math.sin(angle) * this.radius;

        // Longitudinal wave across spring
        const z = t * length + this.waveAmp * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * t * 3 - this.wavePhase);

        const point = new Vector3(x, y, z);
        const quaternion = new Quaternion();
        quaternion.setFromUnitVectors(new Vector3(0, 0, 1), this._axis.clone().normalize());
        point.applyQuaternion(quaternion);

        return point.add(this.start);
    }
}

export class Helix extends Mesh {
    constructor({
        color = 0x00ffff,
        coils = 20,
        longitudinalOscillation = false,
        tubularSegments = 400,
        radialSegments = 16,
        radius = 0.125,
        thickness = 0.01,
        visible = true,
        castShadow = false
    } = {}) {
        const curve = new Coils(new Vector3(), new Vector3(), coils, radius, longitudinalOscillation ? 0.05 : 0);
        const geometry = new TubeGeometry(curve, tubularSegments, thickness, radialSegments, false);
        const material = new MeshStandardMaterial({
            color: color,
            visible: visible,
            metalness: 0.3,
            roughness: 0.4,
        });
        super(geometry, material);
        this._curve = curve;
        this._longitudinalOscillation = longitudinalOscillation;
        this._radius = radius;
        this._tubularSegments = tubularSegments;
        this._radialSegments = radialSegments;
        this._thickness = thickness;
        this.castShadow = castShadow;

        this._body = null;
        this._initialState = null;
    }

    reset() {
        this._body.position.copy(this._initialState.position);
        this._body.axis.copy(this._initialState.axis);
    }

    set body(body) {
        // Sanity checks
        if (!body.axis)
            throw new Error("This body type does not have an axis, hence it cannot be attached to this view.");

        this._body = body;
        this._initialState = body.clone();
    }

    #regenerateTube() {
        this.geometry.dispose();
        this.geometry = new TubeGeometry(
            this._curve, this._tubularSegments, this._thickness, this._radialSegments, false
        );
    }

    update(time) {
        if (this._longitudinalOscillation)
            this._curve.wavePhase = time * 4;
    }

    #updateWithoutLongitudinal() {
        this.#regenerateTube();
    }

    #updateWithLongitudinal(time) {
        // Longitudinal wave amplitude coupled to spring elongation
        const displacement = this._axis.y - this._curve.start.y;
        this._curve.waveAmp = Math.min(Math.abs(displacement) / 10, 0.3); // max amplitude 0.3
        this.#regenerateTube();
    }

    render(transform) {
        const pos = transform.physicsToRender(this._body.position);
        this.position.copy(pos);

        const axis = transform.physicsToRender(this._body.axis.clone());
        if (axis.length() < 1e-6)
            return;

        this._curve.updateAxis(axis);
        this._longitudinalOscillation ?
            this.#updateWithLongitudinal() :
            this.#updateWithoutLongitudinal();
    }
}

//
// Floor and ceiling
//
class Grid extends Group {
    constructor({
        size = 1,
        granularity = 20,
        y = 0,
        color = 0x00ff00
    } = {}) {
        super();

        const step = (size * 2) / granularity;
        const material = new LineBasicMaterial({ color: color });
        for (let i = 0; i <= granularity; i++) {
            const x = -size + i * step;
            this.add(new Line(this.#verticalLine(x, y, size), material));
            this.add(new Line(this.#horizontalLine(x, y, size), material));
        }
    }

    #verticalLine(x, y, size) {
        return new BufferGeometry().setFromPoints([new Vector3(x, y, -size), new Vector3(x, y, size)]);
    }

    #horizontalLine(x, y, size) {
        return new BufferGeometry().setFromPoints([new Vector3(-size, y, x), new Vector3(size, y, x)]);
    }
}

export class Floor extends Group {
    static Type = Object.freeze({
        PLAIN: "PLAIN",
        GRID: "Grid",
        PAVING: "Paving",
        WOOD_WICKER: "WoodWicker"  // https://3dtextures.me/2024/06/22/wood-wicker-011/
    });
    constructor({
        type= Floor.Type.PLAIN,
        position = new Vector3(),
        planeSizeXy = new Vector2(2, 2),
        granularity = 1,
        color = 0x00ff00,
        opacity = null,
        receiveShadow = true
    } = {}) {
        super();
        const planeGeometry = new PlaneGeometry(planeSizeXy.x, planeSizeXy.y);
        const planeMaterial = new MeshStandardMaterial({
            normalScale: planeSizeXy,
            roughness: 1,
            transparent: opacity !== null,
            opacity: opacity ? opacity : 1,
            side: DoubleSide
            //occlusionMap: textureAmbientOcclusion,
            //alphaMap: textureOpacity,
            //aoMap: textureAmbientOcclusion,
            //aoMapIntensity: 0,
        });
        this._mesh = new Mesh(planeGeometry, planeMaterial);
        this._mesh.receiveShadow = receiveShadow;
        this._mesh.rotation.x = -Math.PI / 2;

        this.position.copy(position);
        this.add(this._mesh);

        const loader = new TextureLoader();
        const path = '../js/textures/';
        switch (type) {
            case Floor.Type.PLAIN:
                this._mesh.material.color.set(color);
                break;
            case Floor.Type.GRID:
                this.add(new Grid({
                    color,
                    size: planeSizeXy.x * .5, // TODO enable rectangular formats
                    granularity: granularity
                }));
                break;
            case Floor.Type.PAVING:
                this._mesh.material.map = this._loadTexture(loader, path + '/paving_color.jpg', granularity);
                this._mesh.material.roughnessMap = this._loadTexture(loader, path + '/paving_roughness.jpg', granularity);
                this._mesh.material.normalMap = this._loadTexture(loader, path + '/paving_normal.jpg', granularity);
                break;
            case Floor.Type.WOOD_WICKER:
                this._mesh.material.map = this._loadTexture(loader, path + '/Wood_Wicker_011_color.png', granularity);
                this._mesh.material.roughnessMap = this._loadTexture(loader, path + '/Wood_Wicker_011_roughness.png', granularity);
                this._mesh.material.normalMap = this._loadTexture(loader, path + '/Wood_Wicker_011_normal.png', granularity);
                break;
        }
    }

    _loadTexture(loader, url, granularity) {
        const texture = loader.load(url);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(granularity, granularity);
        return texture;
    }

    get level() { return this.position.y; }
}

export class Ceiling extends Mesh {
    constructor({
        position = new Vector3(0, 0, 0),
        size = 12,
        thickness = 0.75,
        color = 0x8a8a8a
    } = {}) {
        const ceilingGeometry = new BoxGeometry(size, size, thickness);
        const ceilingMaterial = new MeshStandardMaterial({
            color: color,
            metalness: 0.05,
            roughness: 0.95,
            side: DoubleSide
        });
        ceilingMaterial.bumpScale = 0.05;
        super(ceilingGeometry, ceilingMaterial);
        this.rotation.x = Math.PI / 2;
        this.position.copy(position);
    }
}

/*******************************************
 * G R A P H  ( u P L O T )  L I B R A R Y *
 *******************************************/

export class UPlotGraph {
    constructor({
        plotDiv,
        dataDefinition,
        width = 600,
        height = 300,
        title="",
        xLabel="",
        yLabel="",
        maxPoints = 500,
        labelColor = "green",
    } = {}) {
        this._maxPoints = maxPoints;
        this._graphData = [];
        dataDefinition.forEach(() => this._graphData.push([]));

        const series = [];
        dataDefinition.forEach(dataPoint => series.push({label: dataPoint.label, stroke: dataPoint.color}));

        const uPlotOptions = this._uplotOptions(title, width, height, labelColor, xLabel, yLabel, series);
        this._uplotChart = new uPlot(uPlotOptions, this._graphData, plotDiv);
    }

    _uplotOptions(title, width, height, labelColor, xLabel, yLabel, series) {
        return { title, width, height,
            bg: "transparent",
            scales: { x: { auto: true }, y: { auto: true } },
            axes: [{
                    stroke: labelColor,
                    font: "12px Arial",
                    grid: { stroke: "rgba(255, 255, 255, 0.2)", width: 1 },
                    label: xLabel,
                }, {
                    stroke: labelColor,
                    font: "12px Arial",
                    grid: { stroke: "rgba(255, 255, 255, 0.2)", width: 1 },
                    label: yLabel
                }],
            series
        };
    }

    get graphData() { return this._graphData; }

    update() {
        if (this._graphData[0].length > this._maxPoints)
            this._graphData.forEach(arr => arr.shift());
        this._uplotChart.setData(this._graphData);
    }
}
