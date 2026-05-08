/**
 * An educational/scientific simulation environment with clear separation between model and visualization.
 *
 * Core ideas:
 *
 * - clear separation of responsibilities
 * - low cognitive load
 * - code reveals (scientific) intention
 */

import {
    Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, Group, Vector3, BufferAttribute,
    MeshStandardMaterial, SphereGeometry, Mesh, BufferGeometry, LineBasicMaterial, Line, Quaternion,
    CylinderGeometry, ConeGeometry, BoxGeometry
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const G = 6.67e-11; // Gravitational constant

export const to = (view) => view;

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
        this._transform = new Transform(scale);
        this._objects = [];
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
        }

        this._resizeRendererToCanvas();
        this._initEventHandlers(overlay);
    }

    _initEventHandlers(overlay) {
        window.addEventListener("resize", () => this._resizeRendererToCanvas());

        if (overlay)
            window.addEventListener("click", () => {
                if (!this._running) {
                    this._showOverlayMessage(overlay, "Started");
                    this._running = true;
                }
            });
        else
            this._running = true;
    }

    _showOverlayMessage(overlay, message, duration = 1000) {
        overlay.textContent = message;
        overlay.style.display = "block";

        setTimeout(() => {
            overlay.style.display = "none";
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
        for (const anObject of this._objects)
            if (anObject.syncVisual)
                anObject.syncVisual(this._transform);
    }

    _add(...objects) {
        for (const anObject of objects) {
            this._objects.push(anObject);
            this._world.add(anObject);

            anObject.syncVisual?.(this._transform); // Initial sync before render loop
        }
    }

    attach(body, toView) {
        toView.body = body;
        this._add(toView);
    }

    run(updateFunction = null) {
        console.clear();
        this._renderer.setAnimationLoop((time) => {
            if (this._running && updateFunction)
                updateFunction(time);

            this._sync();
            this._renderer.render(this._scene, this._camera);
            this._controls?.update();
        });
    }
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

export class Integrators {
    static eulerStep(state, dt, accelerationFn) {
        const acceleration = accelerationFn(state);
        const newState = state.clone();

        newState.velocity.addScaledVector(acceleration, dt);
        newState.position.addScaledVector(state.velocity, dt);

        return newState;
    }

    static symplecticEulerStep(state, dt, accelerationFn) {
        const acceleration = accelerationFn(state);
        const newState = state.clone();

        newState.velocity.addScaledVector(acceleration, dt);
        newState.position.addScaledVector(newState.velocity, dt);

        return newState;
    }

    static rk2Step(state, dt, accelerationFn) {
        const derivative = (state) => ({
            dx: state.velocity.clone(),
            dv: accelerationFn(state)
        });

        const k1 = derivative(state);

        const mid = state.clone();
        mid.position.addScaledVector(k1.dx, dt);
        mid.velocity.addScaledVector(k1.dv, dt);

        const k2 = derivative(mid);

        const newState = state.clone();
        newState.position.addScaledVector(k1.dx.clone().add(k2.dx), dt / 2);
        newState.velocity.addScaledVector(k1.dv.clone().add(k2.dv), dt / 2);

        return newState;
    }

    static rk4Step(state, dt, accelerationFn) {
        const derivative = (state) => ({
            dx: state.velocity.clone(),
            dv: accelerationFn(state)
        });

        const k1 = derivative(state);

        const s2 = state.clone();
        s2.position.addScaledVector(k1.dx, dt / 2);
        s2.velocity.addScaledVector(k1.dv, dt / 2);
        const k2 = derivative(s2);

        const s3 = state.clone();
        s3.position.addScaledVector(k2.dx, dt / 2);
        s3.velocity.addScaledVector(k2.dv, dt / 2);
        const k3 = derivative(s3);

        const s4 = state.clone();
        s4.position.addScaledVector(k3.dx, dt);
        s4.velocity.addScaledVector(k3.dv, dt);
        const k4 = derivative(s4);

        const newState = state.clone();

        newState.position
            .addScaledVector(k1.dx, dt / 6)
            .addScaledVector(k2.dx, dt / 3)
            .addScaledVector(k3.dx, dt / 3)
            .addScaledVector(k4.dx, dt / 6);

        newState.velocity
            .addScaledVector(k1.dv, dt / 6)
            .addScaledVector(k2.dv, dt / 3)
            .addScaledVector(k3.dv, dt / 3)
            .addScaledVector(k4.dv, dt / 6);

        return newState;
    }
}

export class Body {
    static gravitationalForceBetween(self, other) {
        const radius = self.positionVectorTo(other);
        const rSquared = self.distanceToSquared(other);
        return radius.normalize().multiplyScalar(G * self.mass * other.mass / rSquared);
    }

    constructor({
                    position = new Vector3(0, 0, 0),
                    velocity = new Vector3(0, 0, 0),
                    mass = 1,
                    charge = 0
    } = {}) {
        this.position = position.clone(); // Intentionally public
        this.velocity = velocity.clone(); // Intentionally public
        this.mass = mass;                 // Intentionally public
        this.charge = charge;             // Intentionally public
    }

    clone() {
        return new Body({
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            mass: this.mass,
            charge: this.charge
        });
    }

    shiftBy(displacement) { this.physicsPosition = this.physicsPosition.clone().add(displacement); }

    step(force, dt = 0.01, integrator = Integrators.symplecticEulerStep) {
        const accelerationFn = (body) => force.clone().multiplyScalar(1 / body.mass);
        const updatedBody = integrator(this, dt, accelerationFn);
        this.position = updatedBody.position;
        this.velocity = updatedBody.velocity;
    }

    fieldAt(point) {
        const rVec = point.clone().sub(this.position);
        const distanceSquared = rVec.dot(rVec);

        return distanceSquared < 1e-40 ?
            new Vector3(0, 0, 0) :
            rVec.normalize().multiplyScalar(this.charge / distanceSquared);
    }

    get kineticEnergy() { return 0.5 * this.mass * this.velocity.dot(this.velocity); }

    positionVectorTo(other) { return other.position.clone().sub(this.position); }
    distanceToSquared(other) { return this.positionVectorTo(other).dot(this.positionVectorTo(other)); }
    distanceTo(other) { return this.positionVectorTo(other).length() }
}

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

export class Sphere extends Mesh {
    constructor({
        radius = 1,
        color = 0xffff00,
        visible = true,
        segments = 24,
        opacity = 1,
        castShadow = false,
        wireframe = false,
        trailProperties = new TrailProperties()
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
        this._radius = radius;
        this._trail = null;
        this._trailProperties = trailProperties;
        this.addEventListener('added', this._newTrail);
    }

    set body(body) {
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
        this._body = this._initialState.clone();
        this._newTrail();
    }

    syncVisual(transform) {
        const renderPosition = transform.physicsToRender(this._body.position);
        this.position.copy(renderPosition);

        const renderRadius = transform.scaleRadius(this._radius);
        this.scale.setScalar(renderRadius);

        this._trail?.update(renderPosition);
    }

    get radius() { return this._radius; }
    get color() { return this.material.color; }

    set trail(newTrail) { this._trail = newTrail; }
    set radius(newRadius) { this._radius = newRadius; }
    set color(newColor) { return this.material.color.set(newColor); }
}

const shaftGeometryRound = new CylinderGeometry(1, 1, 1, 16);
const shaftGeometrySquare = new BoxGeometry(1, 1, 1);
const headGeometryRound = new ConeGeometry(1, 1, 16);
const headGeometrySquare = new ConeGeometry(1, 1, 4);
export class Arrow extends Group {
    static HEAD_RATIO = 0.35;   // part of total length
    static SHAFT_RATIO = 1 - Arrow.HEAD_RATIO;
    static UP = new Vector3(0, 1, 0);
    constructor({
        color = 0xff0000,
        size = 1,
        opacity = 1,
        round = false,
        visible = true
    } = {}) {
        super();

        const shaftGeometry = round ? shaftGeometryRound : shaftGeometrySquare;
        const headGeometry = round ? headGeometryRound : headGeometrySquare;
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
    }

    set body(body) {
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

    syncVisual(transform) {
        const pos = transform.physicsToRender(this._body.position);
        this.position.copy(pos);

        const axis = this._body.velocity;
        const length = axis.length() * this._size;
        if (length < 1e-6) return;

        this.quaternion.setFromUnitVectors(Arrow.UP, axis.clone().normalize());

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
