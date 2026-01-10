import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export class ThreeJsUtils {
    static scaleBox3(box, factor) {
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

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
        const sourceSize = new THREE.Vector3();
        const targetSize = new THREE.Vector3();
        const sourceCenter = new THREE.Vector3();
        const targetCenter = new THREE.Vector3();

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

export class Plot3D {
    constructor(canvas, scene, axes) {
        this.scene = scene;
        this.axes = axes;
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

        // Resizing for mobile devices
        ThreeJsUtils.resizeRendererToCanvas(this.renderer, this.camera);
        window.addEventListener('resize', () => {
            ThreeJsUtils.resizeRendererToCanvas(this.renderer, this.camera);
        });

        this.#createLights();
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;

        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI * 0.95;
    }

    #createLights() {
        const hemiLight = new THREE.HemisphereLight(
            0xffffff, // sky
            0xeeeeee, // ground
            0.6
        );
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(3, 5, 4);
        dirLight.target.position.set(0, 0, 0);
        this.scene.add(dirLight);
        this.scene.add(dirLight.target);
    }

    #calculateCenter(boundingBox) {
        const size = new THREE.Vector3();
        let center = new THREE.Vector3();
        boundingBox.getSize(size);
        boundingBox.getCenter(center);
        return {center, size};
    }

    fitToBoundingBox(boundingBox, {
        padding = 1.5,
        translationY = 0,
        minDistance = 2,
        viewDirection = new THREE.Vector3(1, 1, 1)
    } = {}) {
        const {center, size} = this.#calculateCenter(boundingBox);

        // distance so that bounding box is always in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const verticalFieldOfView = THREE.MathUtils.degToRad(this.camera.fov);
        let distance = maxDim / Math.tan(verticalFieldOfView / 2);
        distance = Math.max(distance * padding, minDistance);

        const direction = viewDirection.clone().normalize();
        this.camera.position
            .copy(new THREE.Vector3(center.x, center.y + translationY, center.z))
            .addScaledVector(direction, distance);
        this.camera.near = distance / 100;
        this.camera.far  = distance * 10;
        this.camera.updateProjectionMatrix();

        this.controls.target.copy(center);
        this.controls.update();
    }

    render() {
        this.controls.update();
        this.axes.render(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);
    }
}