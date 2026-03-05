import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene,camera,renderer,controls;
let cloud;

init();
setOrbital("1s");
animate();

function init(){
    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z=12;

    renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls=new OrbitControls(camera,renderer.domElement);

    window.addEventListener("resize",resize);

}

function resize(){
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
}

function setOrbital(type){
    if(cloud) scene.remove(cloud);

    let pts;
    if(type==="1s") pts=generatePoints(sample1s,60000);
    if(type==="2p") pts=generatePoints(sample2p,60000);
    if(type==="3d") pts=generatePoints(sample3d,60000);

    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pts, 3));

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
    requestAnimationFrame(animate);

    if(cloud) cloud.rotation.y+=0.002;

    controls.update();
    renderer.render(scene,camera);
}
