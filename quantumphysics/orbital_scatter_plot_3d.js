import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {Axes, ThreeJsUtils} from "../js/three-js-extensions.js";

const canvasContainer = document.getElementById("orbitalCanvasContainer");
const canvas = document.getElementById("orbitalCanvas");
let scene, camera, renderer, controls, cloud;

init();
setOrbital(sample3d);
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
        blending: THREE.AdditiveBlending,
        depthWrite:false,
        color: 0x66ccff,
        transparent: true,
        opacity: 0.7
    });

    cloud=new THREE.Points(geometry,material);
    scene.add(cloud);
}

function generatePoints(fn, n){
    const vertices=[];
    while(vertices.length < n * 3) {
        const p = fn();
        if(!p) continue;
        vertices.push(p[0], p[1], p[2]);
    }

    return new Float32Array(vertices);
}

function sample1s() {
    const radius=-Math.log(Math.random()) * 4;
    const theta=Math.acos(2 * Math.random()-1);
    const phi=2 * Math.PI * Math.random();

    const xyz = Axes.toCartesian(radius, theta, phi);
    return [xyz.x, xyz.y, xyz.z];
}

function sample2p(){
    const radius = Math.pow(-Math.log(Math.random()),0.5) * 4;
    const theta=Math.acos(2 * Math.random() - 1);
    const phi=2 * Math.PI * Math.random();

    const weight=Math.cos(theta)**2;

    if(Math.random() > weight) return null;

    const xyz = Axes.toCartesian(radius, theta, phi);
    return [xyz.x, xyz.y, xyz.z];
}

function sample3d(){
    const radius=-Math.log(Math.random())*5;
    const theta=Math.acos(2 * Math.random() - 1);
    const phi=2 * Math.PI * Math.random();

    const weight=(Math.sin(theta)**4) * (Math.cos(2 * phi)**2);

    if(Math.random()>weight) return null;

    const xyz = Axes.toCartesian(radius, theta, phi);
    return [xyz.x, xyz.y, xyz.z];
}

function sampleSp3(){
    const radius = -Math.log(Math.random()) * 6;
    const theta = Math.acos(2*Math.random()-1);
    const phi = 2*Math.PI*Math.random();

    const psi =
        (2-radius)*Math.exp(-radius/2) +
        0.8*radius*Math.exp(-radius/2)*(Math.sin(theta)*Math.cos(phi) + Math.cos(theta));

    const weight = psi*psi;

    if(Math.random() > weight/5) return null;

    const xyz = Axes.toCartesian(radius,theta,phi);
    return [xyz.x, xyz.y, xyz.z];
}

function sampleSp2(){
    const radius = -Math.log(Math.random()) * 6;
    const theta = Math.acos(2*Math.random()-1);
    const phi = 2*Math.PI*Math.random();

    const psi =
        (2-radius)*Math.exp(-radius/2) +
        0.7*radius*Math.exp(-radius/2)*Math.sin(theta)*Math.cos(phi);

    const weight = psi*psi;

    if(Math.random() > weight/5) return null;

    const xyz = Axes.toCartesian(radius,theta,phi);
    return [xyz.x, xyz.y, xyz.z];
}

function sampleSp(){
    const radius = -Math.log(Math.random()) * 6;
    const theta = Math.acos(2*Math.random()-1);
    const phi = 2*Math.PI*Math.random();

    const psi =
        (2-radius)*Math.exp(-radius/2) +
        radius*Math.exp(-radius/2)*Math.cos(theta);

    const weight = psi*psi;

    if(Math.random() > weight/5) return null;

    const xyz = Axes.toCartesian(radius,theta,phi);
    return [xyz.x, xyz.y, xyz.z];
}

function sample3p(){
    const radius = -Math.log(Math.random()) * 8;
    const theta = Math.acos(2*Math.random()-1);
    const phi = 2*Math.PI*Math.random();

    const weight =
        (radius*radius) * (6-radius)*(6-radius) *
        Math.exp(-2*radius/3) *
        Math.cos(theta)**2;

    if(Math.random() > weight/50) return null;

    const xyz = Axes.toCartesian(radius,theta,phi);
    return [xyz.x, xyz.y, xyz.z];
}

function sample3s(){
    const radius = -Math.log(Math.random()) * 9;
    const theta = Math.acos(2*Math.random()-1);
    const phi = 2*Math.PI*Math.random();

    const psi = (27 - 18*radius + 2*radius*radius) * Math.exp(-radius/3);
    const weight = psi*psi;

    if(Math.random() > weight/1000) return null;

    const xyz = Axes.toCartesian(radius,theta,phi);
    return [xyz.x, xyz.y, xyz.z];
}

function sample2py(){
    const radius = -Math.log(Math.random()) * 5;
    const theta = Math.acos(2*Math.random()-1);
    const phi = 2*Math.PI*Math.random();

    const weight = (radius*radius) * Math.exp(-radius) *
        (Math.sin(theta)**2) *
        (Math.sin(phi)**2);

    if(Math.random() > weight) return null;

    const xyz = Axes.toCartesian(radius,theta,phi);
    return [xyz.x, xyz.y, xyz.z];
}

function sample2s(){
    const radius = -Math.log(Math.random()) * 6;
    const theta = Math.acos(2*Math.random()-1);
    const phi = 2*Math.PI*Math.random();

    const weight = (2-radius)*(2-radius) * Math.exp(-radius);
    if(Math.random() > weight) return null;

    const xyz = Axes.toCartesian(radius,theta,phi);
    return [xyz.x, xyz.y, xyz.z];
}

function animate(){
    if(cloud) cloud.rotation.y += 0.002;
    controls.update();
    renderer.render(scene,camera);
}

// --- Example buttons ---
[
    { name:'1s_3d', func: sample1s },
    { name:'2s_3d', func: sample2s },
    { name:'2p_3d', func: sample2p },
    { name:'2py_3d', func: sample2py },
    { name:'3s_3d', func: sample3s },
    { name:'3p_3d', func: sample3p },
    { name:'3d_3d', func: sample3d },
    { name:'sp_3d', func: sampleSp },
    { name:'sp2_3d', func: sampleSp2 },
    { name:'sp3_3d', func: sampleSp3 }
].forEach(action=> {
    const button = document.getElementById(action.name);
    button.onclick = ()=> setOrbital(action.func);
    controls.update();
});
