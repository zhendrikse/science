import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {ThreeJsUtils} from "../js/three-js-extensions.js";

const canvasContainer = document.getElementById("orbitalCanvasContainer");
const canvas = document.getElementById("orbitalCanvas");
let scene, camera, renderer, controls, cloud;

init();
setOrbital(sample1s);
animate();

function init(){
    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 40;

    renderer=new THREE.WebGLRenderer({ canvas: canvas, antialias:true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setAnimationLoop( animate );
    ThreeJsUtils.resizeRendererToCanvas(renderer, camera);

    controls=new OrbitControls(camera, renderer.domElement);

    window.addEventListener("resize", resize);
}

function resize(){
    ThreeJsUtils.resizeRendererToCanvas(renderer, camera);
}

function setOrbital(func){
    if(cloud) scene.remove(cloud);

    const points = generatePoints(func, 60000);
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));

    const material=new THREE.PointsMaterial({
        size: 0.05,
        color: 0x66ccff,
        transparent: true,
        opacity: 0.7
    });

    cloud=new THREE.Points(geometry,material);
    scene.add(cloud);
}

function generatePoints(fn,n){
    const verts=[];
    while(verts.length<n*3) {
        const p=fn();
        if(!p) continue;
        verts.push(p[0],p[1],p[2]);
    }

    return new Float32Array(verts);
}

function sample1s() {
    const r=-Math.log(Math.random())*4;

    const theta=Math.acos(2*Math.random()-1);
    const phi=2*Math.PI*Math.random();

    const x=r*Math.sin(theta)*Math.cos(phi);
    const y=r*Math.sin(theta)*Math.sin(phi);
    const z=r*Math.cos(theta);

    return [x,y,z];
}

function sample2p(){
    //const r=-Math.log(Math.random())*4;
    const r = Math.pow(-Math.log(Math.random()),0.5)*4;

    const theta=Math.acos(2*Math.random()-1);
    const phi=2*Math.PI*Math.random();

    const weight=Math.cos(theta)**2;

    if(Math.random()>weight) return null;

    const x=r*Math.sin(theta)*Math.cos(phi);
    const y=r*Math.sin(theta)*Math.sin(phi);
    const z=r*Math.cos(theta);

    return[x,y,z];

}

function sample3d(){
    const r=-Math.log(Math.random())*5;

    const theta=Math.acos(2*Math.random()-1);
    const phi=2*Math.PI*Math.random();

    const weight=(Math.sin(theta)**4)*(Math.cos(2*phi)**2);

    if(Math.random()>weight) return null;

    const x=r*Math.sin(theta)*Math.cos(phi);
    const y=r*Math.sin(theta)*Math.sin(phi);
    const z=r*Math.cos(theta);

    return[x,y,z];
}

function animate(){
    if(cloud) cloud.rotation.y += 0.002;

    controls.update();
    renderer.render(scene,camera);
}


// --- Example buttons ---
[
    { 'name': '1s_3d', 'func': sample1s },
    { 'name': '2s_3d', 'func': sample2p },
    { 'name': '2p_3d', 'func': sample3d },
    { 'name': '2py_3d', 'func': sample1s },
    { 'name': '3s_3d', 'func': sample1s },
    { 'name': '3p_3d', 'func': sample1s },
    { 'name': '3d_3d', 'func': sample1s },
    { 'name': 'sp_3d', 'func': sample1s },
    { 'name': 'sp2_3d', 'func': sample1s },
    { 'name': 'sp3_3d', 'func': sample1s }
].forEach(action=> {
    const button = document.getElementById(action.name);
    button.innerText = name;
    button.onclick = ()=> setOrbital(action.func);
    controls.update();
});
