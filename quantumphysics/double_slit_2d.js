import { hsvToRgb } from "../js/canvas-extensions.js";

const theCanvas = document.getElementById("theCanvas");
const theContext = theCanvas.getContext("2d");
const vCanvas = document.getElementById("vCanvas");
const pauseButton = document.getElementById("pauseButton");
const speedSlider = document.getElementById("speedSlider");
const brightnessSlider = document.getElementById("brightnessSlider");
const eSlider = document.getElementById("eSlider");
const eReadout = document.getElementById("eReadout");
const spsReadout = document.getElementById("spsReadout");
document.getElementById("resetButton").addEventListener("click", () => reset());
document.getElementById("pauseButton").addEventListener("click", () => startStop());
document.getElementById("barrierType").addEventListener("click", () => barrier.adjust());
speedSlider.addEventListener("input", () => resetTimer());
brightnessSlider.addEventListener("input", () => paintCanvas());
eSlider.addEventListener("input", () => wpEnergyAdjust());
document.getElementById("bEnergySlider").addEventListener("input", () => barrier.adjust());
document.getElementById("bSizeSlider").addEventListener("input", () => barrier.adjust());
document.getElementById("bSoftnessSlider").addEventListener("input", () => barrier.adjust());

let xMax = Number(theCanvas.width);
let xMaxm1 = xMax - 1;
let image = theContext.createImageData(xMax, xMax);		// for pixel manipulation


const pWidth = 48;	// initial wavepacket width
// Here are the wavefunction arrays.  Note that times are staggered, with the imaginary parts always
// one time step behind the corresponding real parts.  This is admittedly confusing.
// Also note that these are 1D arrays, with index i = y*xMax + x, for efficiency.
const psi = {re:(new Array(xMax*xMax)), im:(new Array(xMax*xMax))};
const psiNext = {re:(new Array(xMax*xMax)), im:(new Array(xMax*xMax))};	// psiNext is actually 2*dt later than psi
const dt = 0.24;		// anything less than 0.25 seems to be stable
let running = false;
let startTime, stepCount;

class Barrier {
    constructor(size, context) {
        this._xMax = size;
        this._context = context;
        this._v = new Array(size * size).fill(0);
        this._vImage = context.createImageData(size, size);
    }

    at = (i) => this._v[i];
    _clear = () => this._v.fill(0);

    _setPotentialFor(barrierType, bSize, bEnergy) {
        const max = this._xMax;
        switch (barrierType) {
            case "circle":
                const rSquared = bSize*bSize/4.0;
                for (let y=0; y<max; y++)
                    for (let x=0; x<max; x++)
                        if ((x-max/2)**2 + (y-max/2)**2 < rSquared)
                            this._v[y*max+x] = bEnergy;
                break;
            case "square":
                const edge = Math.round(max/2 - bSize/2);
                for (let y=edge; y<edge+bSize; y++)
                    for (let x=edge; x<edge+bSize; x++)
                        this._v[y*max+x] = bEnergy;
                break;
            case "line":
                for (let y=0; y<max; y++)
                    for (let x=Math.floor(max/2); x<Math.floor(max/2)+bSize; x++)
                        this._v[y*max+x] = bEnergy;
                break;
            case "step":
                for (let y=0; y<max; y++)
                    for (let x=Math.floor(max/2); x<max; x++)
                        this._v[y*max+x] = bEnergy;
                break;
            case "singleHole":
                const holeEdge = Math.round(max/2 - bSize/2);
                for (let y=0; y<max; y++)
                    for (let x=Math.floor(max/2)-5; x<Math.floor(max/2)+5; x++)
                        if (y <= holeEdge || y > holeEdge+bSize)
                            this._v[y*max+x] = bEnergy;
                break;
            case "doubleHole":
                const dhEdge = Math.round(max/2 - bSize/2);
                for (let y=0; y<max; y++)
                    for (let x=Math.floor(max/2)-5; x<Math.floor(max/2)+5; x++)
                        if (y <= dhEdge-10 || y > dhEdge+bSize+10 || (y>dhEdge && y<=dhEdge+bSize))
                            this._v[y*max+x] = bEnergy;
                break;
            case "grating":
                for (let y=Math.floor(max/4); y<Math.floor(3*max/4); y++)
                    for (let x=Math.floor(max/2)-5; x<Math.floor(max/2)+5; x++)
                        if (y % bSize < bSize/2)
                            this._v[y*max+x] = bEnergy;
                break;
        }
    }

    _softenEdges(softness) {
        const max = this._xMax;
        for (let s=0; s<softness; s++) {
            const oldV = this._v.slice();
            for (let y=1; y<max-1; y++)
                for (let x=1; x<max-1; x++) {
                    const i = y*max + x;
                    this._v[i] = (oldV[i + 1] + oldV[i - 1] + oldV[i + max] + oldV[i - max]) * .25;
                }
        }
    }

    _draw() {
        const max = this._xMax;
        for (let y=0; y<max; y++)
            for (let x=0; x<max; x++) {
                const i = y*max+x;
                const imageIndex = (x + (max-y-1)*max)*4;
                this._vImage.data[imageIndex] = 255;
                this._vImage.data[imageIndex+1] = 255;
                this._vImage.data[imageIndex+2] = 255;
                this._vImage.data[imageIndex+3] = Math.round(Math.abs(128 * this.at(i) * 10));
            }
        this._context.putImageData(this._vImage, 0, 0);
    }

    adjust() {
        const barrierType = document.getElementById("barrierType").value;
        const bEnergy = Number(document.getElementById("bEnergySlider").value);
        const bSize = Number(document.getElementById("bSizeSlider").value);
        const softness = Number(document.getElementById("bSoftnessSlider").value);

        document.getElementById("bSoftnessReadout").innerText = softness;
        document.getElementById("bEnergyReadout").innerText = bEnergy.toFixed(3).replace("-", "−");
        document.getElementById("bSizeReadout").innerText = bSize;

        this._clear();
        this._setPotentialFor(barrierType, bSize, bEnergy);
        this._softenEdges(softness);
        this._draw();
    }
}
let barrier;

function startStop() {
    running = !running;
    if (running) {
        resetTimer();
        pauseButton.innerHTML = "Pause";
        nextFrame();
    } else
        pauseButton.innerHTML = "Resume";
}

function resetTimer() {
    stepCount = 0;
    startTime = (new Date()).getTime();
}

// Respond to user adjusting wavepacket energy:
// (Uncertainty code is left over from 1D version and is commented out for now.)
function wpEnergyAdjust() {
    const e = Number(eSlider.value);
    //const a = 1 / (pWidth * pWidth);						// so envelope is exp(-ax^2)
    //const sigma = Math.sqrt(2*energy*a + a*a/2) + a/2;	// uncertainty in energy (more or less)
    // The square root term is the actual sigma and dominates for most energy values;
    // the a/2 term is the offset between the k^2/2 and the actual average energy.
    eReadout.innerHTML = Number(e).toFixed(3);
    //+ " &plusmn; " + Number(sigma).toFixed(3);
    if (!running) reset();
}


// Calculate and draw the next animation frame:
function nextFrame() {
    if (!running) return;

    const stepsPerFrame = Number(speedSlider.value);
    for (let step=0; step < stepsPerFrame; step++)
        doStep(dt);
    stepCount += stepsPerFrame;
    paintCanvas();
    const currentTime = (new Date()).getTime();
    spsReadout.innerHTML = "" + Math.round(1000 * stepCount / (currentTime-startTime));
    requestAnimationFrame(nextFrame);
}

// Integrate the TDSE for a double time step (centered-difference time integration):
// (Remember that psi.im is one time step earlier than psi.re; same for psiNext.im and psiNext.re.)
function doStep(dt) {
    for (let y=1; y<xMaxm1; y++)
        for (let x=1; x<xMaxm1; x++) {
            const i = y*xMax + x;
            psiNext.im[i] = psi.im[i] - dt * (-psi.re[i+1] - psi.re[i-1] - psi.re[i+xMax] - psi.re[i-xMax] + 2*(2+barrier.at(i))*psi.re[i]);
        }

    for (let y=1; y<xMaxm1; y++)
        for (let x=1; x<xMaxm1; x++) {
            const i = y*xMax + x;
            psiNext.re[i] = psi.re[i] + dt * (-psiNext.im[i+1] - psiNext.im[i-1] - psiNext.im[i+xMax] - psiNext.im[i-xMax] + 2*(2+barrier.at(i))*psiNext.im[i]);
    }

    for (let y=1; y<xMax-1; y++)			// now copy next to current
        for (let x=1; x<xMaxm1; x++) {
            const i = y*xMax + x;
            psi.re[i] = psiNext.re[i];
            psi.im[i] = psiNext.im[i];
    }
}

// Initialize the wavefunction to a Gaussian wavepacket:
function reset() {
    for (let x=0; x<xMax; x++) {
        const centerX = Math.floor(xMax*0.22);
        const centerY = xMax/2;
        const e = Number(eSlider.value);
        const kx = Math.sqrt(2*e);
        const ky = 0;
        for (let y=0; y<xMax; y++)
            for (let x=0; x<xMax; x++) {
                const i = y*xMax + x;
                const envelope = Math.exp(-(x-centerX)*(x-centerX)/(pWidth*pWidth)) *
                Math.exp(-(y-centerY)*(y-centerY)/(pWidth*pWidth));
                psi.re[i] = envelope * (Math.cos(kx*x)*Math.cos(ky*y) - Math.sin(kx*x)*Math.sin(ky*y));
                psi.im[i] = envelope * (Math.cos(kx*x)*Math.sin(ky*y) + Math.sin(kx*x)*Math.cos(ky*y));
                psiNext.re[i] = 0.0;
                psiNext.im[i] = 0.0;	// These lines may not be needed but edges must be zero
        }

        // Now bump the imaginary part of psi back by one time step:
        for (let y=1; y<xMax-1; y++) 
            for (let x=1; x<xMax-1; x++) {
                const i = y*xMax + x;
                psi.im[i] = psi.im[i] + 0.5*dt * (-psi.re[i+1] - psi.re[i-1] - psi.re[i+xMax] - psi.re[i-xMax] + 2*(2+barrier.at(i))*psi.re[i]);
            }
        }
    paintCanvas();
    if (!running) pauseButton.innerHTML = "Run";
}

function paintCanvas() {
    const brightSetting = Number(brightnessSlider.value);
    const size = xMax; // gebruik de actuele canvasgrootte
    const imgData = theContext.createImageData(size, size);

    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const i = y * size + x;
            const psi2 = psi.re[i] * psi.re[i] + psi.im[i] * psi.im[i];
            let brightness = Math.sqrt(psi2) * brightSetting;
            if (brightness > 1.0) brightness = 1.0;

            let phase = Math.atan2(psi.im[i], psi.re[i]) / (2 * Math.PI);
            if (phase < 0) phase += 1.0;

            const rgb = hsvToRgb(phase, 1.0, brightness);
            const imageIndex = (x + (size - y - 1) * size) * 4;
            imgData.data[imageIndex] = rgb.r;
            imgData.data[imageIndex + 1] = rgb.g;
            imgData.data[imageIndex + 2] = rgb.b;
            imgData.data[imageIndex + 3] = Math.round(brightness * 255); // alpha op basis van brightness
        }

    theContext.putImageData(imgData, 0, 0);
}

function setupArrays() {
    image = theContext.createImageData(xMax, xMax);

    psi.re = new Array(xMax * xMax);
    psi.im = new Array(xMax * xMax);
    psiNext.re = new Array(xMax * xMax);
    psiNext.im = new Array(xMax * xMax);
}

function initSimulation(size) {
    xMax = size;
    xMaxm1 = xMax - 1;

    setupArrays();
    barrier = new Barrier(xMax, vCanvas.getContext("2d"));
    barrier.adjust();
    reset();
}

function resizeCanvas() {
    const rect = theCanvas.getBoundingClientRect();
    const size = Math.floor(rect.width);

    theCanvas.width = size;
    theCanvas.height = size;
    vCanvas.width = size;
    vCanvas.height = size;

    initSimulation(size);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
