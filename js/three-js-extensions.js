import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer";

export const Vector = THREE.Vector3;
export const ZeroVector = new Vector();
export const UnitVectorE1 = new Vector(1, 0, 0);
export const UnitVectorE2 = new Vector(0, 1, 0);
export const UnitVectorE3 = new Vector(0, 0, 1);

export class ThreeJsUtils {
    static scaleBox3(box, factor) {
        const center = new Vector();
        const size = new Vector();

        box.getCenter(center);
        box.getSize(size);

        size.multiplyScalar(factor).multiplyScalar(0.5);

        box.min.copy(center).sub(size);
        box.max.copy(center).add(size);

        return box;
    }

    static fitGroupToBox(
        group,     // 👈 This object moves
        sourceBox,
        targetBox,
        { alignY = "min", padding = 1.0 } = {}
    ) {
        const sourceSize = new Vector();
        const targetSize = new Vector();
        const sourceCenter = new Vector();
        const targetCenter = new Vector();

        sourceBox.getSize(sourceSize);
        targetBox.getSize(targetSize);
        sourceBox.getCenter(sourceCenter);
        targetBox.getCenter(targetCenter);

        const scale = Math.min(
            targetSize.x / sourceSize.x,
            targetSize.y / sourceSize.y,
            targetSize.z / sourceSize.z
        ) / padding;

        group.scale.setScalar(scale);

        sourceCenter.multiplyScalar(scale);
        group.position.copy(targetCenter).sub(sourceCenter);

        if (alignY === "min") {
            group.updateMatrixWorld(true);
            const scaledBox = new THREE.Box3().setFromObject(group);
            const deltaY = targetBox.min.y - scaledBox.min.y;
            group.position.y += deltaY;
        }
    }

    static resizeRendererToCanvas(renderer, camera) {
        const canvas = renderer.domElement;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        if (!w || !h) return;

        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        const width  = Math.floor(w * pixelRatio);
        const height = Math.floor(h * pixelRatio);

        if (canvas.width !== width || canvas.height !== height) {
            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
    }
}

export class Axes extends THREE.Group {
    constructor() {
        super();
        this.layout = null;
        this.annotations = null;
    }

    static toCartesian(radius, theta, phi) {
        return new Vector(
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(theta)
        );
    }

    setLayout(layout) {
        this.layout?.dispose?.();
        this.layout = layout;
        this.add(layout);
    }

    setAnnotations(annotations) {
        this.annotations?.dispose?.();
        this.annotations = annotations;
        this.add(annotations);
    }

    render(scene, camera) {
        this.annotations.render(scene, camera);
    }

    boundingBox() {
        const axesBoundingBox = new THREE.Box3();
        axesBoundingBox.setFromObject(this);
        return axesBoundingBox;
    }
}

export class AxesParameters {
    constructor({
                    axesLines = true,
                    axesLabels = true,
                    xyPlane = true,
                    xzPlane = true,
                    yzPlane = true
                } = {}) {
        this.axesLines = axesLines;
        this.axesLabels = axesLabels;
        this.xyPlane = xyPlane;
        this.xzPlane = xzPlane;
        this.yzPlane = yzPlane;
    }
}

export class AxesAnnotation extends THREE.Group {
    constructor(container) {
        super();

        this.renderer = new CSS2DRenderer();
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.top = "0";
        this.renderer.domElement.style.pointerEvents = "none";

        container.appendChild(this.renderer.domElement);
        this.#resize(container);
    }

    #resize(container) {
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    label(text, pos, color = "yellow") {
        const div = document.createElement("div");
        div.textContent = text;
        div.style.color = color;
        div.style.fontSize = "16px";

        const obj = new CSS2DObject(div);
        obj.position.copy(pos);
        return obj;
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }
}

export class AxesLayout extends THREE.Group {
    constructor(size=5, divisions=10) {
        super();
        this.size = size;
        this.divisions = divisions;
    }

    createPlane(color, rotate, gridPos, planePos) {
        const grid = new THREE.GridHelper(
            this.size,
            this.divisions,
            0x333333,
            0x333333
        );

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(this.size, this.size),
            new THREE.MeshPhongMaterial({
                color,
                transparent: true,
                opacity: 0.1,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );

        grid.position.set(
            gridPos[0] * 0.5 * this.size, gridPos[1] * 0.5 * this.size, gridPos[2] * 0.5 * this.size);
        plane.position.set(
            planePos[0] * 0.5 * this.size, planePos[1] * 0.5 * this.size, planePos[2] * 0.5 * this.size);

        rotate(grid);
        rotate(plane);

        return [grid, plane];
    }

    showAxes() { this.axes.visible = true; }
    hideAxes() { this.axes.visible = false; }
    showXY() { this.xyGrid.visible = true; this.xyPlane.visible = true; }
    hideXY() { this.xyGrid.visible = false; this.xyPlane.visible = false; }
    showXZ() { this.xzGrid.visible = true; this.xzPlane.visible = true; }
    hideXZ() { this.xzGrid.visible = false; this.xzPlane.visible = false; }
    showYZ() { this.yzGrid.visible = true; this.yzPlane.visible = true; }
    hideYZ() { this.yzGrid.visible = false; this.yzPlane.visible = false; }
}

export class ClassicalAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        const eps = 0.025;
        this.axes = new THREE.AxesHelper(size * .5);
        this.axes.position.set(eps, eps, eps);

        const [xyGrid, xzPlane] = this.createPlane(0x4444ff, v => v.rotateX(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        const [xzGrid, yzPlane] = this.createPlane(0x44ff44, v => v.rotateY(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        const [yzGrid, xyPlane] = this.createPlane(0xff4444, v => v.rotateZ(Math.PI / 2), [0, 0, 0], [0, 0, 0]);
        this.xyGrid = xyGrid;
        this.xyPlane = xyPlane;
        this.yzGrid = yzGrid;
        this.yzPlane = yzPlane;
        this.xzGrid = xzGrid;
        this.xzPlane = xzPlane;
        this.add(this.axes, this.xyGrid, this.xyPlane, this.xzGrid, this.xzPlane, this.yzPlane, this.yzGrid);
    }
}

export class MatlabAxesLayout extends AxesLayout {
    constructor(size, divisions) {
        super(size, divisions);

        const eps = 0.025;
        this.axes = new THREE.AxesHelper(size);
        this.axes.position.set(-0.5 * size + eps, eps, -0.5 * size + eps);

        const [xyGrid, xzPlane] = this.createPlane(0x4444ff, v => v.rotateX(Math.PI / 2), [0, 1, -1], [0, 0, 0]);
        const [xzGrid, yzPlane] = this.createPlane(0x44ff44, v => v.rotateY(Math.PI / 2), [0, 0, 0], [-1, 1, 0]);
        const [yzGrid, xyPlane] = this.createPlane(0xff4444, v => v.rotateZ(Math.PI / 2), [-1, 1, 0], [0, 1, -1]);
        this.xyGrid = xyGrid;
        this.xyPlane = xyPlane;
        this.yzGrid = yzGrid;
        this.yzPlane = yzPlane;
        this.xzGrid = xzGrid;
        this.xzPlane = xzPlane;
        this.add(this.axes, this.xyGrid, this.xyPlane, this.xzGrid, this.xzPlane, this.yzPlane, this.yzGrid);
    }
}

export class ClassicalAnnotations extends AxesAnnotation {
    constructor(container, size=5, divisions=10) {
        super(container);

        const step = size / divisions;
        for (let v = -size * .5 ; v <= size * .5; v += step)
            this.add(
                this.label(v.toFixed(1), new Vector(v, 0, 0.525 * size)),
                this.label(v.toFixed(1), new Vector(0, v, 0)),
                this.label(v.toFixed(1), new Vector(0.525 * size, 0, v)));

        this.add(
            this.label("X", new Vector(0.55 * size, 0, 0), "red"),
            this.label("Y", new Vector(0, 0.55 * size, 0), "green"),
            this.label("Z", new Vector(0, 0, 0.55 * size), "blue"));
    }
}

export class MatlabAnnotations extends AxesAnnotation {
    constructor(container, size=5, divisions=10) {
        super(container);

        const step = (2 * size) / divisions;
        for (let v = 0 ; v <= size; v += step)
            this.add(
                this.label(v.toFixed(1), new Vector(v - 0.5 * size, 0, 0.525 * size)),
                this.label(v.toFixed(1), new Vector(-0.525 * size, v, 0.5 * size)),
                this.label(v.toFixed(1), new Vector(0.525 * size, 0, v - 0.5 * size)));

        this.add(
            this.label("X", new Vector(0.6 * size, 0, -0.5 * size), "red"),
            this.label("Y", new Vector(-0.5 * size, 1.05 * size, -0.5 * size), "green"),
            this.label("Z", new Vector(-0.5 * size, 0, 0.6 * size), "blue"));
    }
}

export class Arrow extends THREE.Group {
    constructor(origin, axis, {
        color = 0xff0000,
        shaftRadius = 0.03,
        headRadius = 0.08,
        headLength = 0.18,
        visible = true
    } = {}) {
        super();

        this.axis = axis;
        this.shaftLength = axis.length() - headLength;

        this.shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(shaftRadius, shaftRadius, this.shaftLength, 16),
            new THREE.MeshStandardMaterial({ color })
        );

        this.head = new THREE.Mesh(
            new THREE.ConeGeometry(headRadius, headLength, 16),
            new THREE.MeshStandardMaterial({ color })
        );

        this.shaft.position.y = this.shaftLength *.5;
        this.head.position.y = this.shaftLength + headLength * .5;

        this.add(this.shaft, this.head);

        this.position.copy(origin);
        this.updateAxis(axis);
        this.visible = visible;
    }

    updateAxis(newAxis) {
        if (newAxis.length() < 1e-6) {
            return;
        }

        const quaternion = new THREE.Quaternion().setFromUnitVectors(
            UnitVectorE2,
            newAxis.clone().normalize()
        );
        this.setRotationFromQuaternion(quaternion);
        this.scale.set(1, newAxis.length() / this.shaftLength, 1);
    }

    moveTo(newPositionVector) {
        this.position.copy(newPositionVector);
    }

    positionVectorTo(other) {
        return new Vector().copy(other.position).sub(this.position);
    }

    distanceToSquared(other) {
        return this.position.distanceToSquared(other.position);
    }
}

export class Ball {
    constructor(parent, position, mass=10, color=0xffff00) {
        const massRadius = 1;
        const massMaterial = new THREE.MeshStandardMaterial({color: color, metalness:0.7, roughness:0.2});
        this.sphere = new THREE.Mesh(new THREE.SphereGeometry(massRadius,24,24), massMaterial);
        this.sphere.position.copy(position);
        this.sphere.castShadow = true;
        this.mass = mass;
        this.velocity = new Vector(0, 0, 0);
        parent.add(this.sphere);
    }

    // updateWith(force, dt) {
    //     this.velocity += force / this.mass * dt;
    //     this.velocity *= .999; // damping
    //     this.sphere.position.y += this.velocity * dt;
    // }

    updateWith(force, dt) {
        this.velocity.addScaledVector(force, dt / this.mass);
        this.velocity.multiplyScalar(0.998); // damping
        this.sphere.position.addScaledVector(this.velocity, dt);
    }

    damp = (dampingFactor=0.998) => this.velocity.multiplyScalar(dampingFactor);
    position = () => this.sphere.position.clone();
    shiftTo(newPosition) {
        this.sphere.position.copy(newPosition);
        this.velocity = new Vector(0, 0, 0);
    }

    kineticEnergy = () => 0.5 * this.mass * this.velocity.y * this.velocity.y;
}

// --- Curve for slinky spring ---
class SpringCurve extends THREE.Curve {
    constructor(position, axis, coils=25, radius=0.4, waveAmp=0.05, wavePhase=0){
        super();
        this.start = position.clone();
        this.coils = coils;
        this.axis = axis;
        this.radius = radius;
        this.waveAmp = waveAmp;
        this.wavePhase = wavePhase;
    }

    updateAxis = (newAxis) => this.axis.copy(newAxis);

    getPoint(t){
        const length = this.axis.length();
        const angle = t * this.coils * Math.PI * 2;
        const x = Math.cos(angle) * this.radius;
        const y = Math.sin(angle) * this.radius;

        // Longitudinal wave across spring
        const z = t * length + this.waveAmp * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * t * 3 - this.wavePhase);

        const point = new Vector(x, y, z);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new Vector(0, 0, 1), this.axis.clone().normalize());
        point.applyQuaternion(quaternion);

        return point.add(this.start);
    }
}

export class Spring {
    constructor(parent, position, axis, {
        k=200,
        color=0x00ffff,
        coils=30,
        longitudinalOscillation=false,
        tubularSegments=400,
        radialSegments=12,
        radius=0.5,
        coilRadius=0.075
    } = {}) {
        this.longtudinalOscillation = longitudinalOscillation;
        this.radius = radius;
        this.curve = new SpringCurve(position, axis, coils, radius);
        this.tubularSegments = tubularSegments;
        this.radialSegments = radialSegments;
        this.coilRadius = coilRadius;
        this.restLength = axis.length();
        this.k = k;
        this.position = position;
        this.axis = axis;

        this.geometry = new THREE.TubeGeometry(this.curve, tubularSegments, coilRadius, radialSegments, false);
        const material = new THREE.MeshStandardMaterial({color: color, metalness:0.3, roughness:0.4});
        this.spring = new THREE.Mesh(this.geometry, material);
        parent.add(this.spring);
    }

    #regenerateTube() {
        this.spring.geometry.dispose();
        this.spring.geometry = new THREE.TubeGeometry(
            this.curve, this.tubularSegments, this.coilRadius, this.radialSegments, false
        );
    }

    updateAxis(newAxis) {
        this.axis = newAxis;
        this.curve.updateAxis(this.axis);
        this.longtudinalOscillation ?
            this.#updateWithLongitudinal() :
            this.#updateWithoutLongitudinal();
    }

    update = (time) => this.curve.wavePhase = time * 4;

    #updateWithoutLongitudinal() {
        this.#regenerateTube();
    }

    #updateWithLongitudinal(time) {
        // Longitudinal wave amplitude coupled to spring elongation
        const displacement = this.axis.y - this.curve.start.y;
        this.curve.waveAmp = Math.min(Math.abs(displacement) / 10, 0.3); // max amplitude 0.3
        this.#regenerateTube();
    }

    force = () => -this.k * this.displacement();
    displacement = () => this.restLength - this.axis.length();
}
