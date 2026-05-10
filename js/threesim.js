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
    Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, Group, Vector3, BufferAttribute,
    MeshStandardMaterial, SphereGeometry, Mesh, BufferGeometry, LineBasicMaterial, Line, TubeGeometry,
    CylinderGeometry, ConeGeometry, BoxGeometry, Color, Curve, Quaternion, RepeatWrapping, DoubleSide,
    TextureLoader, Vector2, PlaneGeometry
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**********************************************
 * S I M U L A T I O N  E N V I R O N M E N T *
 **********************************************/

export class ThreeSim {
    constructor({
        canvas,
        overlay = null, // If overlay is not defined, the simulation won't wait for a mouse click
        scale = 1,
        background = null, // If background is not defined, it defaults to transparent
        controls = true,
        light = true,
        cameraPosition = new Vector3(30, 30, 30),
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

        this._world = new Group();
        this._scene.add(this._world);

        this._camera = new PerspectiveCamera(fieldOfView, canvas.clientWidth / canvas.clientHeight, 0.1, 1e6);
        this._camera.position.copy(cameraPosition);

        this._renderer = new WebGLRenderer({antialias: true, canvas, alpha: background === null});

        if (background)
            this._scene.background = background;

        if (controls)
            this._controls = new OrbitControls(this._camera, canvas);

        if (light) {
            const directionalLight = new DirectionalLight(0xffffff, 1);
            directionalLight.position.copy(cameraPosition);
            this._scene.add(directionalLight);
            const directionalLight2 = new DirectionalLight(0xffffff, 1);
            directionalLight2.position.copy(cameraPosition.clone().multiplyScalar(-1));
            this._scene.add(directionalLight2);
        }

        this._resizeRendererToCanvas();
        this._initEventHandlers(overlay);
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
        anObject.render?.(this._transform); // Initial sync before render loop
        if (dynamic)
            this._dynamicObjects.push(anObject);
        else
            this._staticObjects.push(anObject);
    }

    attach(bodyAndView) {
        bodyAndView.view.body = bodyAndView.body;
        this.addThreeJsObject(bodyAndView.view, true);
    }

    attachStatically(bodyAndView) {
        bodyAndView.view.body = bodyAndView.body;
        this.addThreeJsObject(bodyAndView.view, false);
    }

    run(updateFunction = null) {
        this._renderer.setAnimationLoop((time) => {
            if (this._running && updateFunction)
                updateFunction(time);

            this._sync();
            this._renderer.render(this._scene, this._camera);
            this._controls?.update();

            if (this._autoRotate)
                this._doAutoRotate(this._camera.position.length());
        });
    }

    reset() {
        for (const anObject of this._dynamicObjects)
            if (anObject.reset)
                anObject.reset();
    }

    set autoRotate(autoRotate) { this._autoRotate = autoRotate; }
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
    const radius = twoBodies[0].positionVectorTo(twoBodies[1]);
    const rSquared = twoBodies[0].distanceToSquared(twoBodies[1]);
    return radius.normalize().multiplyScalar(G * twoBodies[0].mass * twoBodies[1].mass / rSquared);
}

//
// Bodies to do physics with
//
class Body {  // INTENTIONALLY NOT EXPORTED TO THE OUTSIDE WORLD !!!
    constructor({
                    position = new Vector3(0, 0, 0),
                    velocity = new Vector3(0, 0, 0)
                } = {}) {
        this.position = position.clone(); // Intentionally public
        this.velocity = velocity.clone(); // Intentionally public
    }

    clone() {
        return new Body({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
        });
    }

    and(otherBody) { return [this, otherBody] };

    to(view) { return { body: this, view: view}; };

    shiftBy(displacement) { this.position.add(displacement); }

    positionVectorTo(other) { return other.position.clone().sub(this.position); }
    distanceToSquared(other) { return this.positionVectorTo(other).dot(this.positionVectorTo(other)); }
    distanceTo(other) { return this.positionVectorTo(other).length() }
}

export class PlainVector extends Body {
    constructor({position = new Vector(), direction = new Vector()} = {}) {
        super({ position });
        this.direction = direction.clone();
    }
}

export class VelocityVector extends Body {
    constructor({position = new Vector(), velocity = new Vector()} = {}) {
        super({ position, velocity });
    }

    get direction() { return this.velocity; }
}

export class VectorField {
    constructor() { }

    to(view) { return { body: this, view: view}; };

    range(positions) {
        let min = Infinity;
        let max = -Infinity;

        for (const position of positions) {
            const mag = this.sample(position).length();
            min = Math.min(min, mag);
            max = Math.max(max, mag);
        }

        return { min, max };
    }

    sample(positionVector) {
        throw new Error("You invoked the method of an abstract base class. Please create a subclass first.");
    }

    #centralDifferences(position, h) {
        const dx = new Vector3(h, 0, 0);
        const dy = new Vector3(0, h, 0);
        const dz = new Vector3(0, 0, h);

        const Fx1 = this.sample(position.clone().add(dx));
        const Fx0 = this.sample(position.clone().sub(dx));

        const Fy1 = this.sample(position.clone().add(dy));
        const Fy0 = this.sample(position.clone().sub(dy));

        const Fz1 = this.sample(position.clone().add(dz));
        const Fz0 = this.sample(position.clone().sub(dz));
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
        radius = 1
    } = {}) {
        super( {position, velocity})
        this.mass = mass;
        this.radius = radius;
    }

    clone() {
        return new Body({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            radius: this.radius,
            mass: this.mass
        });
    }

    apply(force, dt = 0.01, integrator = Integrators.symplecticEulerStep) {
        const accelerationFn = (body) => force.clone().multiplyScalar(1 / body.mass);
        const updatedBody = integrator(this, dt, accelerationFn);
        this.position = updatedBody.position;
        this.velocity = updatedBody.velocity;
    }

    get direction() { return this.velocity; }
    get kineticEnergy() { return 0.5 * this.mass * this.velocity.dot(this.velocity); }
    get momentum() { return this.mass * this.velocity; }
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
        return new Body({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            radius: this.radius,
            mass: this.mass,
            char: this.charge
        });
    }

    apply(force, dt = 0.01, integrator = Integrators.symplecticEulerStep) {
        const accelerationFn = (body) => force.clone().multiplyScalar(1 / body.mass);
        const updatedBody = integrator(this, dt, accelerationFn);
        this.position = updatedBody.position;
        this.velocity = updatedBody.velocity;
    }

    fieldAt(point) { return Particle.fieldAt(this, point); }

    get direction() { return this.velocity; }
    get kineticEnergy() { return 0.5 * this.mass * this.velocity.dot(this.velocity); }
    get momentum() { return this.mass * this.velocity; }
}

class VectorFieldVector extends Body {
    constructor({position, vectorField} = {}) {
        super({ position });
        this._vectorField = vectorField;
    }

    get direction() { return this._vectorField.sample(this.position); }
}

export class Spring extends Body {
    constructor({position = new Vector3(), axis = new Vector3(0, 1, 0), k=100} = {}) {
        super({ position });
        this.axis = axis;
        this.restLength = axis.length();
        this.k = k; // spring constant
    }

    get direction() { return this.axis; }
    get potentialEnergy() { return 0.5 * this.k * this.displacement * this.displacement; }
    get force() { return this.axis.clone().normalize().multiplyScalar(-this.k * this.displacement); }
    get displacement() { return  this.axis.length() - this.restLength; }
    get isCompressed() { return this.axis.length() < this.restLength; }
    get endPosition() { return this.position.clone().add(this.axis); }
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

        return newBody;
    }

    static symplecticEulerStep(body, dt, accelerationFn) {
        const acceleration = accelerationFn(body);
        const newBody = body.clone();

        newBody.velocity.addScaledVector(acceleration, dt);
        newBody.position.addScaledVector(newBody.velocity, dt);

        return newBody;
    }

    static rk2Step(body, dt, accelerationFn) {
        const derivative = (body) => ({
            dx: body.velocity.clone(),
            dv: accelerationFn(body)
        });

        const k1 = derivative(body);

        const mid = body.clone();
        mid.position.addScaledVector(k1.dx, dt);
        mid.velocity.addScaledVector(k1.dv, dt);

        const k2 = derivative(mid);

        const newBody = body.clone();
        newBody.position.addScaledVector(k1.dx.clone().add(k2.dx), dt / 2);
        newBody.velocity.addScaledVector(k1.dv.clone().add(k2.dv), dt / 2);

        return newBody;
    }

    static rk4Step(body, dt, accelerationFn) {
        const derivative = (body) => ({
            dx: body.velocity.clone(),
            dv: accelerationFn(body)
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
export class TrailProperties {
    constructor({
                    maxPoints = 200,
                    trailStep = 1,
                    lineWidth = 1,
                    color = null // By default, try to obtain the color from the object that is followed
                } = {}) {
        this.maxPoints = maxPoints;
        this.lineWidth = lineWidth;
        this.color = color;
        this.trailStep = trailStep;
    }
}

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

export class Trail {
    constructor(parentGroup, trailProperties) {
        this._parentGroup = parentGroup; // Parent group of the object that is followed
        this._color = trailProperties.color ? trailProperties.color : null;
        this._maxPoints = trailProperties.maxPoints;
        this._lineWidth = trailProperties.lineWidth;
        this._trail = null;
        this._trailAccumulator = 0;
        this._trailStep = trailProperties.trailStep;
    }

    update(position, increment = 1) {
        if (!this._trail) return;
        this._trailAccumulator += increment;
        if (this._trailAccumulator >= this._trailStep) {
            this._trail.addPoint(position);
            this._trailAccumulator = 0;
        }
    }

    attachTo(object) {
        object.trail = this; // <== pass in trail to object so that it can update it
        this._color = this._color ? this._color : object.material.color;
        this._trail = new TrailLine({
            maxPoints: this._maxPoints,
            color: this._color ? this._color: object.color,
            linewidth: this._lineWidth
        });
        this._parentGroup.add(this._trail._line);
    }

    dispose() {
        if (!this._trail) return;

        if (this._trail._line) {
            if (this._trail._line.geometry)
                this._trail._line.geometry.dispose();
            if (this._trail._line.material)
                this._trail._line.material.dispose();
        }
        this._parentGroup.remove(this._trail._line);
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
        wireframe = false,
        trailProperties = null
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
        this._trail = null;
        this._trailProperties = trailProperties;
        this.addEventListener('added', this._newTrail);
    }

    set body(body) {
        // Sanity checks
        if (!body.radius)
            throw new Error("This body type does not have a radius, hence it cannot be attached to this view.");

        this._body = body;
        this._initialState = body.clone();
    }

    _newTrail() {
        this._trail?.dispose();
        if (this._trailProperties) {
            this._trail = new Trail(this.parent, this._trailProperties);
            this._trail.attachTo(this);
        }
    }

    reset() {
        this._body.position = this._initialState.position;
        this._body.velocity = this._initialState.velocity;
        this._newTrail();
    }

    render(transform) {
        const renderPosition = transform.physicsToRender(this._body.position);
        this.position.copy(renderPosition);

        const renderRadius = transform.scaleRadius(this._body.radius);
        this.scale.setScalar(renderRadius);

        this._trail?.update(renderPosition);
    }

    get radius() { return this._radius; }
    get color() { return this.material.color; }

    set trail(newTrail) { this._trail = newTrail; }
    set radius(newRadius) { this._radius = newRadius; }
    set color(newColor) { return this.material.color.set(newColor); }
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
        this._head = new Mesh(headGeometry, material);
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

    set body(body) {
        // Sanity checks
        if (!body.direction)
            throw new Error("This body type does not have a direction, hence it cannot be attached to this view.");

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

        const axis = this._body.direction.clone();
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
        opacity = 1
    } = {}) {

        const geometry = new CylinderGeometry(radius, radius, 1, 24);
        const material = new MeshStandardMaterial({
            color,
            opacity,
            transparent: opacity < 1
        });
        super(geometry, material);

        this._body = null;
        this._initialState = null;
    }

    set body(body) {
        // Sanity checks
        if (!body.direction)
            throw new Error("This body type does not have a direction, hence it cannot be attached to this view.");

        this._body = body;
        this._initialState = body.clone();
    }

    render(transform) {
        const pos = transform.physicsToRender(this._body.position);
        this.position.copy(pos);

        const axis = transform.physicsToRender(this._body.direction.clone());
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

    set body(body) {
        // Sanity checks
        if (!body.direction)
            throw new Error("This body type does not have a direction, hence it cannot be attached to this view.");

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

        const axis = transform.physicsToRender(this._body.direction.clone());
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
export class Floor extends Mesh {
    static Type = Object.freeze({
        NONE: "None",
        PAVING: "paving",
        WOOD_WICKER: "Wood_Wicker_011"  // https://3dtextures.me/2024/06/22/wood-wicker-011/
    });
    constructor({
        type= Floor.Type.NONE,
        position = new Vector3(),
        planeSizeXy = new Vector2(2, 2),
        granularity = .5,
        color = null
    } = {}) {
        const planeGeometry = new PlaneGeometry(planeSizeXy.x, planeSizeXy.y);
        const planeMaterial = new MeshStandardMaterial({
            normalScale: planeSizeXy,
            roughness: 1,
            //occlusionMap: textureAmbientOcclusion,
            //alphaMap: textureOpacity,
            //aoMap: textureAmbientOcclusion,
            //aoMapIntensity: 0,
        });
        super(planeGeometry, planeMaterial);
        this.receiveShadow = true;
        this.rotation.x = -Math.PI / 2;
        this.position.copy(position);
        this._granularity = granularity;

        if (color)
            this.material.color.set(color);
        if (type === Floor.Type.NONE)
            return;

        const loader = new TextureLoader();
        const imageType = type === Floor.Type.PAVING ? "jpg" : "png";
        this.material.map = this._loadTexture(loader, '../js/textures/' + type + '_color.' + imageType);
        this.material.roughnessMap = this._loadTexture(loader, '../js/textures/' + type + '_roughness.' + imageType);
        this.material.normalMap = this._loadTexture(loader, '../js/textures/' + type + '_normal.' + imageType);
    }

    _loadTexture(loader, url) {
        const texture = loader.load(url);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(this._granularity, this._granularity);
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