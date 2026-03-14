import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {ThreeJsUtils} from "../js/three-js-extensions.js";
import {SpheresSurface, SurfaceColorMapper, PlaneSurface, PointsSurface, ShaderSurface} from "../js/3d-surface-components.js";

const canvas = document.getElementById("canvas")
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight,0.1,100)
camera.position.set(1.75, 1.5, 4.0)

const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha: true})
ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
renderer.setAnimationLoop(animate);

const controls = new OrbitControls(camera,renderer.domElement)

window.addEventListener("resize",()=>{
    camera.aspect = innerWidth/innerHeight
    camera.updateProjectionMatrix()
})

scene.add(new THREE.AmbientLight(0xffffff,.4))
const light = new THREE.DirectionalLight(0xffffff,1)
light.position.set(5,5,5)
scene.add(light)

class Wave {
    constructor(nx,ny,size){
        this._numVerticesX = nx
        this._numVerticesY = ny
        this.vertexDistance = size

        this._dx = size / (nx - 1);
        this._dy = size / (ny - 1);

        const c = 1.5
        const dt = 0.4 * this._dx / c

        this._r = (c * dt / this._dx) * (c * dt / this._dy)

        this.minHeight = -0.2
        this.maxHeight = 0.2

        this._old = Array.from({length: nx}, () => new Float32Array(ny));
        this._current = Array.from({length: nx}, () => new Float32Array(ny));
        this._next = Array.from({length: nx}, () => new Float32Array(ny));
    }

    get amplitudes() { return this._current}
    get numVerticesX() { return this._numVerticesX; }
    get numVerticesY() { return this._numVerticesY; }

    _shiftBuffers() {
        let temp = this._old;
        this._old = this._current;
        this._current = this._next;
        this._next = temp;
    }

    update(damping=0.9995){
        for(let i=1;i< this._numVerticesX-1;i++)
            for(let j=1;j< this._numVerticesY-1;j++)
                this._next[i][j] = 2 * this._current[i][j] - this._old[i][j] + this._r * (
                    this._current[i + 1][j] + this._current[i - 1][j] + this._current[i][j + 1] + this._current[i][j - 1] - 4 * this._current[i][j]
                ) * damping;

        this._shiftBuffers();
    }

    disturb(){
        const x=Math.floor(this._numVerticesX/2)
        const y=Math.floor(this._numVerticesY/2)

        this._current[x][y]+=0.75
    }
}

class Pool extends THREE.Group{
    constructor(Lx,Ly){
        super();

        const wallMaterial=new THREE.MeshStandardMaterial({color:0xffff00});
        const waterMaterial=new THREE.MeshStandardMaterial({
            color:0x0099ff,
            transparent:true,
            opacity:.5
        });

        const depth=.3;
        const thickness=.05;

        const water=new THREE.Mesh(new THREE.BoxGeometry(Lx, depth, Ly), waterMaterial);
        water.position.y=-depth/2;
        this.add(water);

        const back=new THREE.Mesh(new THREE.BoxGeometry(Lx, .65, thickness), wallMaterial);
        back.position.set(0, -.15, -Ly / 2);
        this.add(back);

        const left=new THREE.Mesh(new THREE.BoxGeometry(thickness, .65, Ly), wallMaterial);
        left.position.set(-Lx/2,-0.15,0);
        this.add(left);

        const right=left.clone();
        right.position.x=Lx/2;
        this.add(right);

        const bottom=new THREE.Mesh(new THREE.BoxGeometry(Lx,thickness,Ly), wallMaterial);
        bottom.position.y=-depth;
        this.add(bottom);
    }
}

const wave=new Wave(250,250,4);
const colorMapper = new SurfaceColorMapper(SurfaceColorMapper.Mode.VIRIDIS_COLOR_MAP);
const surface=new PointsSurface(wave, colorMapper, {radius: 0.035});
//const surface=new SpheresSurface(wave, colorMapper, {radius: 0.02});
//const surface=new PlaneSurface(wave, colorMapper);
//const surface=new ShaderSurface(wave, colorMapper);
scene.add(surface)

const pool=new Pool(4,4)
scene.add(pool)

let time = 0;
function animate(){
    wave.update();
    wave.update();
    wave.update();

    if(Math.abs(time-.25)<.01)
        wave.disturb();

    surface.update();
    time+=.01
    renderer.render(scene,camera)
}
