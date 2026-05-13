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
    TextureLoader, Vector2, PlaneGeometry, PCFShadowMap, AmbientLight, EdgesGeometry, LineSegments
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**********************************************
 * S I M U L A T I O N  E N V I R O N M E N T *
 **********************************************/

export class Simulation {
    static Background = Object.freeze({
        PLAIN: "Plain",
        FOG: "Fog",
        TRANSPARENT: "Transparent"
    });

    constructor({
        canvas,
        overlay = null, // If overlay is not defined, the simulation won't wait for a mouse click
        scale = 1,
        background = Simulation.Background.TRANSPARENT,
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
            alpha: background === Simulation.Background.TRANSPARENT
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
            case Simulation.Background.PLAIN:
                this._scene.background = new Color(backgroundColor);
                break;
            case Simulation.Background.FOG:
                this._scene.background = new Color(backgroundColor);
                this._scene.fog = new Fog(backgroundColor, 1, 100);
                break;
            case Simulation.Background.TRANSPARENT:
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

    _synchronizePhysicsAndView() {
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
        viewObject.attachTo(bodyAndView.body);

        // Initial render before entering render loop
        viewObject.render?.(this._transform);
    }

    attachStatically(bodyAndView) {
        const viewObject = bodyAndView.view;
        this.addThreeJsObject(viewObject, true);
        viewObject.attachTo(bodyAndView.body);

        this.addThreeJsObject(bodyAndView.view, false);
    }

    _animationStep(time) {
        if (this._running && this._updateFunction)
            this._updateFunction(time);

        this._synchronizePhysicsAndView();
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

class TwoBodies {
    constructor(body1, body2) {
        this.body1 = body1;
        this.body2 = body2;
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

export class Body {
    constructor({
        position = new Vector3(),
        velocity = new Vector3(),
        mass = 1
    } = {}) {
        this.acceleration = new Vector3();  // Intentionally public
        this.position = position.clone();   // Intentionally public
        this.velocity = velocity.clone();   // Intentionally public
        this.mass = mass;                   // Intentionally public
        this.velocityVector = new VelocityVector(this);
        this.accelerationVector = new AccelerationVector(this);
    }

    apply(force, dt = 0.01, integrator = Integrators.symplecticEulerStep) {
        const accelerationFn = (bodyParam) => force.clone().multiplyScalar(1 / bodyParam.mass);
        const updatedBody = integrator(this, dt, accelerationFn);
        this.position = updatedBody.position;
        this.velocity = updatedBody.velocity;
        this.acceleration = updatedBody.acceleration;
    }

    clone() {
        return new Body({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            acceleration: this.acceleration.clone(),
            mass: this.mass,
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

export class AxialSymmetricBody extends Body {
    constructor({
        position = new Vector3(),
        velocity = new Vector3(),
        axis = new Vector3(),
        radius = 1,
        mass = 1
    } = {})  {
        super({ position, velocity, mass });
        this.radius = radius;
        this.axis = axis.clone();
    }

    clone() {
        return new AxialSymmetricBody({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            axis: this.axis.clone(),
            radius: this.radius,
            mass: this.mass
        });
    }
}

export class RadialSymmetricBody extends Body {
    constructor({
        position = new Vector3(0, 0, 0),
        velocity = new Vector3(0, 0, 0),
        mass = 1,
        radius = 1,
        elasticity = 1
    } = {}) {
        super( {position, velocity, mass})
        this.radius = radius;
    }

    clone() {
        return new RadialSymmetricBody({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            radius: this.radius,
            mass: this.mass,
        });
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
        super({position, velocity, mass});
        this.size = size;
    }

    clone() {
        return new Block({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            size: this.size.clone(),
            mass: this.mass
        });
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
        super( {position, velocity, mass})
        this.charge = charge;
        this.radius = radius;
    }

    clone() {
        return new Particle({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            radius: this.radius,
            mass: this.mass,
            charge: this.charge
        });
    }

    fieldAt(point) { return Particle.fieldAt(this, point); }

    get kineticEnergy() { return 0.5 * this.mass * this.velocity.dot(this.velocity); }
    get momentum() { return this.mass * this.velocity; }
}

export class Spring extends Body {
    static between(twoBodies, k = 200, radius = 1) {
        const axis = twoBodies.body1.positionVectorTo(twoBodies.body2);
        const position = twoBodies.body1.position;
        return new Spring({position, axis, k, radius});
    }

    constructor({
        position = new Vector3(),
        velocity = new Vector3(),
        axis = new Vector3(0, 1, 0),
        mass = 1,
        radius = 1,
        k=100
    } = {}) {
        super({ position, velocity, mass });
        this.axis = axis;
        this.radius = radius;
        this.restLength = axis.length();
        this.k = k; // spring constant
    }

    clone() {
        return new Spring({
            position: this.position.clone(),
            axis: this.axis.clone(),
            k: this.k,
            radius: this.radius,
            mass: this.mass
        });
    }

    get direction() { return this.axis; }
    get potentialEnergy() { return 0.5 * this.k * this.displacement * this.displacement; }
    get force() { return this.axis.clone().normalize().multiplyScalar(-this.k * this.displacement); }
    get displacement() { return  this.axis.length() - this.restLength; }
    get isCompressed() { return this.axis.length() < this.restLength; }
    get endPosition() { return this.position.clone().add(this.axis); }
}

export class HarmonicOscillator {
    static between = (twoBodies, k=200, radius=1, damping=0.2) => {
        return new HarmonicOscillator(twoBodies.body1, twoBodies.body2, k, radius, damping);
    }

    constructor(body1, body2, k, radius, damping) {
        this.body1 = body1;
        this.body2 = body2;
        this.bond = Spring.between(body1.and(body2), k, radius);
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

export class OneDimensionalPlaneWave {
    static c = 3e8;

    constructor({
        position = new Vector3(),
        amplitude = 1,
        lambda = 2,
        omega = 2 * Math.PI * OneDimensionalPlaneWave.c / lambda
    } = {}) {
        this.position = position.clone();
        this.amplitude = amplitude;
        this.omega = omega;
        this._lambda = lambda;
        this._time = 0;
        this._k = 2 * Math.PI / lambda;
    }

    set lambda(lambdaValue) { this._lambda = lambdaValue; this._k = 2 * Math.PI / lambdaValue; }
    set k(kValue) { this._k = kValue; this._lambda = kValue / 2 * Math.PI; }
    get lambda() { return this._lambda; }
    get k() { return this._k; }

    to(view) { return { body: this, view: view}; };

    propagate(t) { this._time = t; }

    valueAt(x) {
        return this.amplitude * Math.cos(this.k * x - this.omega * this._time);
    }
}

export class OneDimensionalComplexPlaneWave extends OneDimensionalPlaneWave {
    constructor({
        position = new Vector3(),
        amplitude = 1,
        lambda = 2,
        omega = 3 * Math.PI
    } = {}) {
        super({position, amplitude, lambda, omega });
    }

    valueAt(x) {
        const phase = this.k * x - this.omega * this._time;
        return new Complex( Math.cos(phase) * this.amplitude, Math.sin(phase) * this.amplitude);
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

class VectorFieldVector {
    constructor({
                    position = new Vector3(),
                    axis = new Vector3()
                } = {})  {
        this.position = position.clone();
        this.axis = axis.clone();
    }

    clone() {
        return new VectorFieldVector({
            position: this.position.clone(),
            axis: this.axis.clone(),
        });
    }

    to(view) { return { body: this, view: view}; };
}

class ScalarFieldValue {
    constructor({
        position = new Vector3(),
        value = 0
    } = {})  {
        this.position = position.clone();
        this.value = value;
    }

    clone() {
        return new VectorFieldVector({
            position: this.position.clone(),
            value: this.value,
        });
    }

    to(view) { return { body: this, view: view}; };
}

class ComplexScalarFieldValue {
    constructor({
        position = new Vector3(),
        value = new Complex(0, 0)
    } = {})  {
        this.position = position.clone();
        this.value = value;
    }

    clone() {
        return new VectorFieldVector({
            position: this.position.clone(),
            value: this.value.clone(),
        });
    }

    get axis() { return new Vector3(0, this.value.re, this.value.im); }
}

export class VectorField {
    constructor() { }

    to(view) { return { body: this, view: view}; };

    range(positions) {
        let min = Infinity;
        let max = -Infinity;

        for (const position of positions) {
            const mag = this.vectorAt(position).length();
            min = Math.min(min, mag);
            max = Math.max(max, mag);
        }

        return { min, max };
    }

    vectorAt(positionVector) {
        throw new Error("You invoked the method of an abstract base class. Please create a subclass first.");
    }

    #centralDifferences(position, h) {
        const dx = new Vector3(h, 0, 0);
        const dy = new Vector3(0, h, 0);
        const dz = new Vector3(0, 0, h);

        const Fx1 = this.vectorAt(position.clone().add(dx));
        const Fx0 = this.vectorAt(position.clone().sub(dx));

        const Fy1 = this.vectorAt(position.clone().add(dy));
        const Fy0 = this.vectorAt(position.clone().sub(dy));

        const Fz1 = this.vectorAt(position.clone().add(dz));
        const Fz0 = this.vectorAt(position.clone().sub(dz));
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

export class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    clone() { return new Complex(this.re, this.im); }

    absSquared() { return Complex.absSquared(this); }
    abs() { return Complex.abs(this); }
    phase = () => Math.atan2(this.im, this.re);

    static multiplyScalar = (a, scalar) => new Complex(a.re * scalar, a.im * scalar);
    static fromPhase = (theta) => new Complex(Math.cos(theta), Math.sin(theta));
    static absSquared(z_) { return z_.re * z_.re + z_.im * z_.im; }
    static abs = (z) => Math.sqrt(Complex.absSquared(z));
    static add = (a, b) => new Complex(a.re + b.re, a.im + b.im);
    static subtract = (a, b) => new Complex(a.re - b.re, a.im - b.im);
    static multiply = (a, b) => new Complex(
        a.re * b.re - a.im * b.im,
        a.re * b.im + a.im * b.re
    );
    static log = (z) => new Complex(Math.log(Complex.abs(z)), Math.atan2(z.im, z.re));
    static exp = (z) => new Complex(Math.exp(z.re) * Math.cos(z.im), Math.exp(z.re) * Math.sin(z.im))
    static sin(z) {
        const a = Complex.exp(new Complex(-z.im, z.re));
        const b = Complex.exp(new Complex(z.im, -z.re));
        return new Complex((a.im - b.im) / 2, (b.re - a.re) / 2);
    }
    static divide = (z1, z2) => {
        const denominator = z2.re * z2.re + z2.im * z2.im;
        const re = z1.re * z2.re + z1.im * z2.im;
        const im = z1.im * z2.re - z1.re * z2.im;
        return new Complex(re / denominator, im / denominator);
    }
    static sqrt(z) {
        const r = Complex.abs(z);
        const real = Math.sqrt((r + z.re) / 2);
        const imag = Math.sign(z.im || 1) * Math.sqrt((r - z.re) / 2);
        return new Complex(real, imag);
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

    attachTo(body) {
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

    attachTo(body) {
        // Sanity checks
        if (!body.radius)
            throw new Error("Body does not have a radius, hence it cannot be attached to this view.");

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
        this._tempAxisVector = new Vector3();
    }

    reset() {
        this._body.position.copy(this._initialState.position);
        this._body.axis.copy(this._initialState.axis);
    }

    attachTo(body) {
        // Sanity checks
        if (!body.axis)
            throw new Error("Body does not have an axis, hence it cannot be attached to this view.");

        this._body = body;
        this._initialState = body.clone();
    }
    get body() { return this._body; }

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

        this._tempAxisVector.copy(this._body.axis);
        const visualMagnitude = this._magnitudeMap(this._tempAxisVector.length());
        const length = visualMagnitude * this._size;

        if (this._colorMap) {
            const color = this._colorMap(this._tempAxisVector);
            this._shaft.material.color.copy(color);
            this._head.material.color.copy(color);
        }

        this.quaternion.setFromUnitVectors(Arrow.UP, this._tempAxisVector.normalize());

        const shaftLength = length * Arrow.SHAFT_RATIO;
        const headLength = length * Arrow.HEAD_RATIO;
        const shaftRadius = length * 0.075;

        this._shaft.scale.set(shaftRadius, shaftLength, shaftRadius);
        this._shaft.position.y = shaftLength * 0.5;

        this._head.scale.set(shaftRadius * 2, headLength, shaftRadius * 2);
        this._head.position.y = shaftLength + headLength * 0.5;
    }

    set opacity(opacity) { this._shaft.material.opacity = opacity; }
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
        colorMap = axis => new Color().setHSL(Math.log(1 + axis.length()), 2, 0.5)

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
        const arrow = new Arrow({
            color: 0x00ffff,
            size: this._scaleFactor,
            round: this._round,
            magnitudeMap: this._magnitudeMap,
            colorMap: this._colorMap,
        });
        const position = new Vector3(x, y, z);
        arrow.attachTo(new VectorFieldVector({ position, axis: vectorField.vectorAt(position) }));
        this._fieldArrows.push(arrow);
        this.add(arrow);
    }

    // TODO implement reset()

    attachTo(vectorField) {
        // Sanity checks
        if (!vectorField.vectorAt)
            throw new Error("Body does not implement vectorAt(), hence it cannot be attached to this view.");

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
        color = 0xffff00,
        opacity = 1,
        segments = 24,
        castShadow = false
    } = {}) {

        const geometry = new CylinderGeometry(1, 1, 1, segments);
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

    reset() {
        this._body.position.copy(this._initialState.position);
        this._body.axis.copy(this._initialState.axis);
        this._body.radius = this._initialState.radius;
    }

    attachTo(body) {
        // Sanity checks
        if (!body.axis)
            throw new Error("Body does not have an axis, hence it cannot be attached to this view.");
        if (!body.radius)
            throw new Error("Body does not have a radius, hence it cannot be attached to this view.");

        this._body = body;
        this._initialState = body.clone();
    }

    render(transform) {
        const pos = transform.physicsToRender(this._body.position);
        this.position.copy(pos);

        const axis = transform.physicsToRender(this._body.axis);
        const radius = transform.scaleRadius(this._body.radius);
        const length = axis.length();
        this.scale.set(radius, length, radius);

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

    attachTo(body) {
        // Sanity checks
        if (!body.size || !body.size.x)
            throw new Error("Body does not have size (vector), hence it cannot be attached to this view.");

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
        this._body.radius = this._initialState.radius;
    }

    attachTo(body) {
        // Sanity checks
        if (!body.axis)
            throw new Error("Body does not have an axis, hence it cannot be attached to this view.");
        if (!body.radius)
            throw new Error("Body does not have a radius, hence it cannot be attached to this view.");

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

        this._curve.radius = transform.scaleRadius(this._body.radius);

        const axis = transform.physicsToRender(this._body.axis.clone());
        this._curve.updateAxis(axis);
        this._longitudinalOscillation ?
            this.#updateWithLongitudinal() :
            this.#updateWithoutLongitudinal();
    }
}

//
// Plane waves
//
export class ElectromagneticWave extends Group {
    constructor({
        electricFieldColor = new Color("orange"),
        magneticFieldColor = new Color("cyan"),
        arrowSize = 1,
        numArrows = 100,
        scalingFunction = (position, lambda) => .5, // default: fixed scaling with increasing distance
    } = {}) {
        super();
        this._electricFieldArrows = [];
        this._magneticFieldArrows = [];
        this._numArrows = numArrows;
        this._eletricFieldColor = electricFieldColor;
        this._magneticFieldColor = magneticFieldColor;
        this._arrowSize = arrowSize;
        this._scalingFunction = scalingFunction;

        // Optimization for vector calculations
        this._tempPosition = new Vector3();
        this._tempAxis = new Vector3();
        this._tempPosition = new Vector3();
        this._i_hat = new Vector3(1, 0, 0);

        this._planeWave = null;
    }

    attachTo(planeWave) {
        // Sanity checks
        if (!planeWave.valueAt)
            throw new Error("Body does not implement valueAt(), hence it cannot be attached to this view.");

        this._planeWave = planeWave;
        this._createEmWaveFor(planeWave);
    }

    _updateFieldVectorAt(index) {
        const fieldVector = this._electricFieldArrows[index].body;

        // x = distance along wave
        const x = this._tempPosition.copy(fieldVector.position)
            .sub(this._planeWave.position)
            .length();

        const scaling = this._scalingFunction(fieldVector.position);
        fieldVector.axis.y = scaling * this._planeWave.valueAt(x);

        // Magnetic field (orthogonal)
        this._magneticFieldArrows[index].body.axis.copy(
            this._tempAxis.copy(fieldVector.axis).cross(this._i_hat)
        );
    }

    render(transform) {
        for (let index = 0; index < this._electricFieldArrows.length; index++)
            this._updateFieldVectorAt(index);
        for (let arrow of this._electricFieldArrows)
            arrow.render(transform);
        for (let arrow of this._magneticFieldArrows)
            arrow.render(transform);
    }

    _createEmWaveFor(planeWave) {
        const ds = planeWave.lambda / 10.0;
        const dr1 = planeWave.position.clone().normalize().multiplyScalar(ds);
        const position = planeWave.position.clone();
        for (let ct = 0; ct < this._numArrows; ct++) {
            const electricFieldArrow = new Arrow({
                color: this._eletricFieldColor,
                size: this._arrowSize,
                round: true
            });
            const magneticFieldArrow = new Arrow({
                color: this._magneticFieldColor,
                size: this._arrowSize,
                round: true
            });
            electricFieldArrow.attachTo(new VectorFieldVector({position}));
            magneticFieldArrow.attachTo(new VectorFieldVector({position}));
            this._magneticFieldArrows.push(magneticFieldArrow);
            this._electricFieldArrows.push(electricFieldArrow);
            this.add(electricFieldArrow, magneticFieldArrow);

            position.add(dr1);
        }
    }
}

export class OneDimensionalComplexPlaneWave3D extends Group {
    constructor({
        size = 1,
        numArrows = 70,
        round = false
    } = {}) {
        super();
        this._arrows = [];

        this._numArrows = numArrows;
        this._round = round;
        this._size = size;
        this._complexPlaneWave = null;
    }
    
    attachTo(complexPlaneWave) {
        // Sanity checks
        if (!complexPlaneWave.valueAt)
            throw new Error("Body does not implement valueAt(), hence it cannot be attached to this view.");

        this._complexPlaneWave = complexPlaneWave;

        const position = new Vector3().copy(complexPlaneWave.position);
        for (let i = 0; i < this._numArrows; i++)
            this._createArrowAt(position, i);
    }

    _createArrowAt(position, index) {
        const x = position.x + index * 0.5;
        const arrow = new Arrow({
            round: this._round,
            size: this._size,
            colorMap: (axis) => new Color().setHSL(1.0 - new Complex(axis.z, axis.y).phase() / (2 * Math.PI), 1.0, 0.5)
        });

        arrow.attachTo(new ComplexScalarFieldValue({ position: new Vector3(x, position.y, position.z) }));
        this._arrows.push(arrow);
        this.add(arrow);
    }

    render(transform) {
        for (let arrow of this._arrows)
            arrow.body.value = this._complexPlaneWave.valueAt(arrow.body.position.x);

        for (let arrow of this._arrows)
            arrow.render(transform);
    }
}

/*******************************************
 * Floor, Grid, Ceiling, Aquarium          *
 *******************************************/

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

export class Aquarium extends Mesh {
    constructor({
        position = new Vector3(0, 0, 0),
        size = new Vector3(1, 1, 1),
        opacity = 0.35,
        contentColor = new Color(.1, .3, .78),
        frameColor = 0xaa9900,
        frameWidth = 1
    } = {}) {
        const geometry = new BoxGeometry(size.x, size.y, size.z);
        const material = new MeshStandardMaterial({
            color: contentColor,
            transparent: true,
            opacity: opacity,
            depthWrite: false
        });

        super(geometry, material);
        this.position.copy(position);
        this._size = size;

        // --- Edges ---
        const edges = new EdgesGeometry(geometry);
        const lineMaterial = new LineBasicMaterial({
            color: frameColor,
            linewidth: frameWidth
        });

        const wireframe = new LineSegments(edges, lineMaterial);
        this.add(wireframe); // make it an integral part of the cube
    }

    get size() { return this._size;}
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
