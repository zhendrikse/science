import * as THREE from 'three';

import { OrbitControls } from 'jsm/controls/OrbitControls.js';

function loadTexture(loader, url) {
    const texture = loader.load(url);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 10);
    return texture;
}

function createGround() {
    const loader = new THREE.TextureLoader();

    /*
    const textureColor = loadTexture(loader, './public/paving_color.jpg');
    const textureRoughness = loadTexture(loader, './public/paving_roughness.jpg');
    const textureNormal = loadTexture(loader, './public/paving_normal.jpg');
    const textureAmbientOcclusion = loadTexture(loader, './public/paving_ambient_occlusion.jpg');
    */
    ///*
    //https://3dtextures.me/2024/06/22/wood-wicker-011/
    const textureColor = loadTexture(loader, './textures/Wood_Wicker_011_basecolor.png');
    const textureRoughness = loadTexture(loader, './textures/Wood_Wicker_011_roughness.png');
    const textureNormal = loadTexture(loader, './textures/Wood_Wicker_011_normal.png');
    //*/

    const planeGeometry = new THREE.PlaneGeometry(1000, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: textureColor,
        normalMap: textureNormal,
        normalScale: new THREE.Vector2(3, 3),
        roughness: 1,
        roughnessMap: textureRoughness,
        //alphaMap: textureOpacity,
        //aoMap: textureAmbientOcclusion,
        //aoMapIntensity: 0,
    });
    const mesh = new THREE.Mesh(planeGeometry, planeMaterial);

    mesh.receiveShadow = true;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -5;

    return mesh;
}

function createStringMesh(scene) {
    const geometry = new THREE.CylinderGeometry(0.025, 0.025, 8);
    const material = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0,
        metalness: 0.2
    });
    const string = new THREE.Mesh(geometry, material);
    scene.add(string);
    return string;
}

function createBallMesh(scene, hue) {
    // Generate color from HSV using THREE.Color
    const color = new THREE.Color();
    color.setHSL(hue, 1, 0.5); // HSV with full saturation and 50% lightness

    const geometry = new THREE.SphereGeometry(0.5);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.8,
        //emissive: 'rgba(200,200,200, 1)'
    });
    /*
    const loader = new THREE.TextureLoader();
    //const loader = new THREE.DDSLoader();
  
    const marbleTextureColor = loader.load('./matcaps/3.png');
    //const marbleTextureColor = loader.load('./public/disturb_dx10_bc6h_signed_nomip.dds');
    //const marbleTextureRoughness = loader.load('./public/marble_roughness.jpg');
  
    const geometry = new THREE.SphereGeometry(0.5);
    //const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
    const material = new THREE.MeshMatcapMaterial({
      //map: marbleTextureColor,
      matcap: marbleTextureColor,
      //roughness: 1,
      //roughnessMap: marbleTextureRoughness,
      //metalness: 0.1,
    });
    */
    const ball = new THREE.Mesh(geometry, material);
    ball.castShadow = true;
    scene.add(ball);
    return ball;
}

class Pendulum {

    constructor(stringMesh, ballMesh, frequency, amplitude) {
        this.string = stringMesh;
        this.ball = ballMesh;
        this.frequency = frequency;
        this.amplitude = amplitude;
        //this.damping = 1;
    }

    update(totalTime) {
        let speed = 750;
        this.string.rotation.z = this.amplitude * Math.cos((this.frequency * totalTime) / speed);
        this.ball.rotation.z = this.amplitude * Math.cos((this.frequency * totalTime) / speed);
        //let damping = 1;
        //if (this.damping > 0) {
        //this.string.rotation.z = this.amplitude * Math.cos((this.frequency * totalTime) / speed) * this.damping;
        //this.ball.rotation.z = this.amplitude * Math.cos((this.frequency * totalTime) / speed) * this.damping;
        //}

        //this.damping -= 0.0001;
        //console.log(this.damping)
    }
}

function createPendulum(
    scene,
    origin,
    frequency = 1,
    amplitude = 0.5,
    hue = 0
) {
    const stringMesh = createStringMesh(scene);
    stringMesh.position.add(origin);
    stringMesh.translateY(6);
    stringMesh.geometry.translate(0, -4, 0);

    const ballMesh = createBallMesh(scene, hue);
    ballMesh.position.add(origin);
    ballMesh.translateY(6);
    ballMesh.geometry.translate(0, -8.5, 0);

    const pendulum = new Pendulum(stringMesh, ballMesh, frequency, amplitude);
    return pendulum;
}

init();

function init() {
    const sceneCanvas = document.getElementById('sceneCanvas');
    sceneCanvas.width = window.innerWidth;
    sceneCanvas.height = window.innerHeight;

    const scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = Math.max(7 / aspect, 5);
    camera.position.y = 1;
    camera.lookAt(0, -1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: sceneCanvas, antialias: true });
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement); // Initialize OrbitControls
    controls.enableDamping = true; // Optional: Enable damping (smooth panning and zooming)
    controls.dampingFactor = 0.1; // Optional: Set damping factor


    window.addEventListener('resize', () => {
        sceneCanvas.width = window.innerWidth;
        sceneCanvas.height = window.innerHeight;
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        camera.position.z = Math.max(8 / aspect, 6);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let colorBack = 0x0a0a0a;
    scene.background = new THREE.Color(colorBack);

    const light = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(4, 10, 4);

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

    // Set shadow map type
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // or THREE.PCFShadowMap

    scene.add(directionalLight);

    const ground = createGround();
    scene.add(ground);

    scene.fog = new THREE.Fog(colorBack, 1, 60);

    const pendulums = [];
    for (let i = 0; i < 12; i++) {
        const pendulum = createPendulum(scene, new THREE.Vector3(0, 0, -i * 1.2), 1.2 + i * 0.05, 0.5, i / 11);
        pendulums.push(pendulum);
    }

    let startTime = null;
    let lastFrameTime = null;
    function animationFrame(time) {
        if (startTime == null) {
            startTime = time;
        }
        if (lastFrameTime == null) {
            lastFrameTime = time;
        }
        const deltaTime = time - lastFrameTime;
        lastFrameTime = time;
        const totalTime = time - startTime;
        update(deltaTime, totalTime);

        controls.update(); // Update controls in animation loop

        //scene.rotation.y += 0.001 * Math.cos(time * 0.0005)

        renderer.render(scene, camera);
        window.requestAnimationFrame(animationFrame);
    }


    function update(deltaTime, totalTime) {
        pendulums.forEach((p) => {
            p.update(totalTime);
        });
    }

    window.requestAnimationFrame(animationFrame);
}
