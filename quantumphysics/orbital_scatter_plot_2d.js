import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.getElementById('atomCanvas');

// --- Three.js setup ---
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-12.5, 12.5, 12.5, -12.5, 0.1, 100);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ canvas, alpha:true });
renderer.setSize(canvas.width, canvas.height);
renderer.setAnimationLoop( animate );

// --- OrbitControls voor pan/zoom ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false; // only pan/zoom
controls.zoomSpeed = 1.2;
controls.panSpeed = 1.0;
controls.enableDamping = true; // for smoother motion
controls.dampingFactor = 0.1;

// --- Parameters ---
const ntrpRails = 100;
const tableSize = ntrpRails + 1;
const radius = new Float32Array(tableSize);
const prob_r = new Float32Array(tableSize);
const angle = new Float32Array(tableSize);
const prob_a = new Float32Array(tableSize);

const blotMax = 50000;
const rIdx = { value:0 };
const aIdx = { value:0 };
let doingOrbital = '1s';

// --- Initialize common table ---
function init_table_common(){
    const aStep = 2 * Math.PI / ntrpRails;
    const rStep = 10 / ntrpRails;
    for(let ii = 0; ii <= ntrpRails; ii++){
        angle[ii] = aStep * ii;
        radius[ii] = rStep * ii;
    }
}

// --- Orbitals ---
function init_1s_table(){
    init_table_common();
    for (let ii = 0; ii < tableSize; ii++) {
        // The 1s orbital wavefunction is proportional to exp(-r)
        // The probability per unit volume is therefore exp(-2*r)
        // And we integrate that w.r.t rdr (not just dr) to get:
        prob_r[ii] = 1. - (2.*radius[ii] + 1.)*Math.exp(-2.*radius[ii]);
    }

    for (let ii = 0; ii < angle.length; ii++)
        prob_a[ii] =  angle[ii]/2.0/Math.PI;
}

function init_2s_table(){
    init_table_common();
    for (let ii = 0; ii < tableSize; ii++) {
        const rr = radius[ii];
        // The 2s orbital wavefunction is proportional to
        //   (2-r) exp(-r/2)
        // and the square of that is
        //    (2-r)*(2-r)* exp(-r)
        // so the integral (rdr) of the probability density is:
        prob_r[ii] = 1. + (-0.5*rr*rr*rr + 0.5*rr*rr - rr -1)*Math.exp(-rr);
    }

    for (let ii = 0; ii < angle.length; ii++)
        prob_a[ii] =  angle[ii]/2.0/Math.PI;
}

// The 2p orbital wavefunction is r exp(-r/2) cos(theta).
// The probability density is proportional to r^2 exp(-r) cos^2 (theta)
// and the integral (rdr) of the radial piece is (rr*rr*rr/-6. - 0.5*rr*rr - rr - 1)*exp(-rr)
function init_2p_table() {
    init_table_common();

    for (let ii = 0; ii < tableSize; ii++) {
        const rr = radius[ii];
        prob_r[ii] = 1. + (rr*rr*rr/-6. - 0.5*rr*rr - rr - 1)*Math.exp(-rr);
    }

    for (let ii = 0; ii < angle.length; ii++)
        prob_a[ii] = (.5*Math.sin(2.*angle[ii]) + angle[ii])/2.0/Math.PI;
}

function init_2py_table(){
    init_table_common();

    for (let ii = 0; ii < tableSize; ii++) {
        const rr = radius[ii];
        prob_r[ii] = 1 + (rr*rr*rr/-6 - 0.5*rr*rr - rr - 1)*Math.exp(-rr);
    }

    for (let ii = 0; ii < angle.length; ii++)
        prob_a[ii] = (angle[ii] - 0.5*Math.sin(2*angle[ii])) / (2*Math.PI);
}

function init_3s_table(){
    init_table_common();

    let cumulative = 0;
    for (let ii = 0; ii < tableSize; ii++) {
        const r = radius[ii];
        const psi = (27 - 18*r + 2*r*r) * Math.exp(-r/3);
        const density = psi*psi * r;
        cumulative += density;
        prob_r[ii] = cumulative;
    }

    const norm = prob_r[tableSize-1];
    for (let ii = 0; ii < tableSize; ii++)
        prob_r[ii] /= norm;

    for (let ii = 0; ii < angle.length; ii++)
        prob_a[ii] = angle[ii] / (2*Math.PI);
}

function init_3p_table(){
    init_table_common();

    let cumulative = 0;
    for (let ii = 0; ii < tableSize; ii++) {
        const r = radius[ii];
        const density = r*r*r * (6-r)*(6-r) * Math.exp(-2*r/3);
        cumulative += density;
        prob_r[ii] = cumulative;
    }

    const norm = prob_r[tableSize-1];
    for (let ii=0; ii<tableSize; ii++)
        prob_r[ii] /= norm;

    for (let ii=0; ii<angle.length; ii++)
        prob_a[ii] =
            (angle[ii] + Math.sin(angle[ii])*Math.cos(angle[ii]))/(2*Math.PI);
}

function init_3d_table(){
    init_table_common();

    let cumulative = 0;
    for (let ii = 0; ii < tableSize; ii++) {
        const r = radius[ii];
        const density = Math.pow(r,5) * Math.exp(-2*r/3);
        cumulative += density;
        prob_r[ii] = cumulative;
    }

    const norm = prob_r[tableSize-1];
    for (let ii=0; ii<tableSize; ii++)
        prob_r[ii] /= norm;

    for (let ii=0; ii<angle.length; ii++)
        prob_a[ii] =
            (angle[ii] + 0.5*Math.sin(4*angle[ii]))/(2*Math.PI);
}

function init_sp_table(){
    init_table_common();

    let cumulative = 0;
    for (let ii=0; ii<tableSize; ii++) {
        const r = radius[ii];
        const psi = (2-r)*Math.exp(-r/2) + r*Math.exp(-r/2);
        const density = psi*psi * r;
        cumulative += density;
        prob_r[ii] = cumulative;
    }

    const norm = prob_r[tableSize-1];
    for (let ii=0; ii<tableSize; ii++)
        prob_r[ii] /= norm;

    for (let ii=0; ii<angle.length; ii++){
        const a = angle[ii];
        prob_a[ii] = (a + 0.6*Math.sin(a))/(2*Math.PI);
    }
}

function init_sp2_table(){
    init_table_common();

    let cumulative = 0;
    for (let ii=0; ii<tableSize; ii++){
        const r = radius[ii];
        const psi = (2 - r) * Math.exp(-r / 2) + 0.7 * r * Math.exp(-r / 2);
        const density = psi*psi * r;
        cumulative += density;
        prob_r[ii] = cumulative;
    }

    const norm = prob_r[tableSize-1];
    for (let ii=0; ii<tableSize; ii++)
        prob_r[ii] /= norm;

    for (let ii=0; ii<angle.length; ii++) {
        const a = angle[ii];
        prob_a[ii] = (a + 0.4 * Math.sin(3 * a))/(2 * Math.PI);
    }
}

function init_sp3_table(){
    init_table_common();

    let cumulative = 0;
    for (let ii=0; ii<tableSize; ii++) {
        const r = radius[ii];
        const psi = (2 - r) * Math.exp(-r / 2) + 0.8 * r * Math.exp(-r / 2);
        const density = psi*psi * r;
        cumulative += density;
        prob_r[ii] = cumulative;
    }

    const norm = prob_r[tableSize-1];
    for (let ii=0; ii<tableSize; ii++)
        prob_r[ii] /= norm;

    for (let ii=0; ii<angle.length; ii++) {
        const a = angle[ii];
        prob_a[ii] = (a + 0.3 * Math.sin(4 * a))/(2 * Math.PI);
    }
}

// --- Interpolation ---
const interp = (xx, aa, AA, bb, BB) => ((xx - aa) * BB + (AA - xx) * bb) / (AA - aa);

function fastSearch(x, arr, lastIdxRef){
    let i = lastIdxRef.value;
    const max = arr.length-2;
    if(x >= arr[i])
        while(i < max && x > arr[i+1]) i++;
    else
        while(i>0 && x < arr[i]) i--;
    lastIdxRef.value = i;
    return i;
}

function interpolate_r(xx){ return interp(xx, prob_r[fastSearch(xx,prob_r,rIdx)], prob_r[rIdx.value+1], radius[rIdx.value], radius[rIdx.value+1]); }
function interpolate_a(xx){ return interp(xx, prob_a[fastSearch(xx,prob_a,aIdx)], prob_a[aIdx.value+1], angle[aIdx.value], angle[aIdx.value+1]); }

// --- Colors per orbital ---
const orbitalColors = {
    '1s': [1, 0, 0],      // red
    '2s': [0, 1, 0],      // green
    '2p': [0, 0, 1],      // blue
    '2py':[1, 0.5, 0],    // orange
    '3s': [0, 1, 1],      // cyan
    '3p': [1, 0, 1],      // magenta
    '3d': [1, 1, 0],      // yellow
    'sp': [0.6, 0.3, 0],
    'sp2':[0.3, 0.6, 0.3],
    'sp3':[0.3, 0.3, 0.6]
};

const colorsArray = new Float32Array(blotMax * 3);
const pointsArray = new Float32Array(blotMax * 3); // x,y,z
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(pointsArray, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true });

// --- Pas generatePoints aan om kleuren in te vullen ---
function generatePoints(){
    const col = orbitalColors[doingOrbital] || [1,1,1];
    for(let i = 0; i < blotMax; i++){
        const pr = Math.random();
        const pa = Math.random();
        const rr = interpolate_r(pr);
        const aa = interpolate_a(pa);
        const x = rr * Math.cos(aa);
        const y = rr * Math.sin(aa);
        pointsArray[i * 3]     = x;
        pointsArray[i * 3 + 1] = y;
        pointsArray[i * 3 + 2] = 0;

        colorsArray[i*3 +0] = col[0];
        colorsArray[i*3 +1] = col[1];
        colorsArray[i*3 +2] = col[2];
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
}

// --- Three.js cloud ---
const cloud = new THREE.Points(geometry, material);
scene.add(cloud);

// --- Render loop ---
function animate(){
    controls.update();
    renderer.render(scene, camera);
}

// --- Orbital switcher ---
function switchOrbital(orb){
    doingOrbital = orb;
    rIdx.value = aIdx.value = 0;
    if(orb==='1s') init_1s_table();
    if(orb==='2s') init_2s_table();
    if(orb==='2p') init_2p_table();
    if(orb==='2py') init_2py_table();
    if(orb==='3s') init_3s_table();
    if(orb==='3p') init_3p_table();
    if(orb==='3d') init_3d_table();
    if(orb==='sp') init_sp_table();
    if(orb==='sp2') init_sp2_table();
    if(orb==='sp3') init_sp3_table();
    generatePoints();
    geometry.attributes.position.needsUpdate = true;
}

// --- Start ---
switchOrbital('1s');

// --- Example buttons ---
['1s', '2s', '2p', '2py', '3s', '3p', '3d', 'sp', 'sp2', 'sp3'].forEach(name=>{
    const button = document.createElement('button');
    button.innerText = name;
    button.onclick = ()=> switchOrbital(name);
    document.body.appendChild(button);
    controls.update();
});
