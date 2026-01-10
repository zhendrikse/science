import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer";

export class Axes extends THREE.Group {
    constructor() {
        super();
        this.layout = null;
        this.annotations = null;
    }

    static toCartesian(radius, theta, phi) {
        return new THREE.Vector3(
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
                this.label(v.toFixed(1), new THREE.Vector3(v, 0, 0.525 * size)),
                this.label(v.toFixed(1), new THREE.Vector3(0, v, 0)),
                this.label(v.toFixed(1), new THREE.Vector3(0.525 * size, 0, v)));

        this.add(
            this.label("X", new THREE.Vector3(0.55 * size, 0, 0), "red"),
            this.label("Y", new THREE.Vector3(0, 0.55 * size, 0), "green"),
            this.label("Z", new THREE.Vector3(0, 0, 0.55 * size), "blue"));
    }
}

export class MatlabAxesAnnotations extends AxesAnnotation {
    constructor(container, size=5, divisions=10) {
        super(container);

        const step = (2 * size) / divisions;
        for (let v = 0 ; v <= size; v += step)
            this.add(
                this.label(v.toFixed(1), new THREE.Vector3(v - 0.5 * size, 0, 0.525 * size)),
                this.label(v.toFixed(1), new THREE.Vector3(-0.525 * size, v, 0.5 * size)),
                this.label(v.toFixed(1), new THREE.Vector3(0.525 * size, 0, v - 0.5 * size)));

        this.add(
            this.label("X", new THREE.Vector3(0.6 * size, 0, -0.5 * size), "red"),
            this.label("Y", new THREE.Vector3(-0.5 * size, 1.05 * size, -0.5 * size), "green"),
            this.label("Z", new THREE.Vector3(-0.5 * size, 0, 0.6 * size), "blue"));
    }
}

export class Arrow extends THREE.Group {
    constructor(origin, direction, {
        length = 0.6,
        color = 0xff0000,
        shaftRadius = 0.03,
        headRadius = 0.08,
        headLength = 0.18} = {}
    ) {
        super();

        this.length = length;
        const shaftLength = length - headLength;

        this.shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLength, 16),
            new THREE.MeshStandardMaterial({ color })
        );

        this.head = new THREE.Mesh(
            new THREE.ConeGeometry(headRadius, headLength, 16),
            new THREE.MeshStandardMaterial({ color })
        );

        this.shaft.position.y = shaftLength / 2;
        this.head.position.y = shaftLength + headLength / 2;

        this.add(this.shaft, this.head);

        this.position.copy(origin);
        this.setDirection(direction);
    }

    setDirection(dir) {
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
            up,
            dir.clone().normalize()
        );
        this.setRotationFromQuaternion(quaternion);
    }

    setPosition(pos) {
        this.position.copy(pos);
    }
}

export class TangentVectors extends THREE.Group {
    constructor(radius, theta, phi) {
        super();
        this.center = new THREE.Vector3(0, 0, 0);

        const pos = this.#positionOnSphere(radius, theta, phi);
        const er  = this.#radialDirection(radius, theta, phi);

        this.radialArrow = new Arrow(pos, er, {length: 0.8, color: 0x00ff00});
        this.thetaArrow  = new Arrow(pos, this.#thetaDirection(er), {length: 0.6, color: 0xff0000});
        this.phiArrow    = new Arrow(pos, this.#phiDirection(er), {length: 0.6, color: 0x00ffff});

        this.radialLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([this.center, pos]),
            new THREE.LineBasicMaterial({ color: 0xffffff })
        );

        this.tangentPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0x8888ff,
                side: THREE.DoubleSide,
                transparent: true,
                wireframe: true,
                opacity: 0.5
            })
        );

        this.add(this.radialArrow, this.thetaArrow, this.phiArrow, this.radialLine, this.tangentPlane);
    }

    #toRad(thetaDeg, phiDeg) {
        return [
            THREE.MathUtils.degToRad(thetaDeg),
            THREE.MathUtils.degToRad(phiDeg)
        ];
    }

    #positionOnSphere(radius, thetaDeg, phiDeg) {
        const [theta, phi] = this.#toRad(thetaDeg, phiDeg);
        return Axes.toCartesian(radius, theta, phi).add(this.center);
    }

    #radialDirection(radius, thetaDeg, phiDeg) {
        const [theta, phi] = this.#toRad(thetaDeg, phiDeg);
        return Axes.toCartesian(radius, theta, phi).normalize();
    }

    #thetaDirection(er) { return new THREE.Vector3(er.z, 0, -er.x).normalize(); }

    #phiDirection(er) { return this.#thetaDirection(er).clone().cross(er).normalize(); }

    update(radius, theta, phi) {
        const pos = this.#positionOnSphere(radius, phi, theta);
        const er  = this.#radialDirection(radius, phi, theta);
        const et  = this.#thetaDirection(er);
        const ep  = this.#phiDirection(er);

        this.radialArrow.setPosition(pos);
        this.radialArrow.setDirection(er);

        this.thetaArrow.setPosition(pos);
        this.thetaArrow.setDirection(et);

        this.phiArrow.setPosition(pos);
        this.phiArrow.setDirection(ep);

        this.tangentPlane.position.copy(pos);
        const normal = er.clone().normalize();
        this.tangentPlane.lookAt(pos.clone().add(normal));

        this.radialLine.geometry.setFromPoints([this.center, pos]);
    }
}