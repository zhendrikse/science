import { toColorString } from "./2d-quantum-extensions.js";

const theCanvas = document.getElementById("freeWavePacketCanvas");
const theContext = theCanvas.getContext("2d");
theContext.fillStyle = "transparent";
const pauseButton = document.getElementById("pauseButton");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const realImag = document.getElementById("realImag");
const gridCheck = document.getElementById("gridCheck");
const posSlider = document.getElementById("posSlider");
const heightSlider = document.getElementById("heightSlider");
const widthSlider = document.getElementById("widthSlider");
const momentumSlider = document.getElementById("momentumSlider");

class Display {
    constructor(context) {
        this._context = context;
    }

    _drawGrid(delta, gridBase, gridOffset) {
        if (!gridCheck.checked) return;
        this._context.strokeStyle = "hsl(0,0%,60%)";
        this._context.lineWidth = 1;

        for (let x = delta; x < xMax; x += delta) {	// draw vertical grid lines
            this._context.beginPath();
            this._context.moveTo(x, 0);
            this._context.lineTo(x, gridBase);
            this._context.stroke();
        }

        for (let y = gridBase - gridOffset; y > 0; y -= delta) {	// draw horizontal grid lines
            this._context.beginPath();
            this._context.moveTo(0, y);
            this._context.lineTo(xMax, y);
            this._context.stroke();
        }
    }

    _drawHorizontalAxis(baselineY) {
        this._context.strokeStyle = "#c0c0c0";
        this._context.lineWidth = 1;
        this._context.beginPath();
        this._context.moveTo(0, baselineY);
        this._context.lineTo(xMax, baselineY);
        this._context.stroke();
        this._context.lineWidth = 2;
    }

    _plotRealImaginary(psi, baselineY) {
        const pxPerY = psiPixPerUnit;
        this._drawHorizontalAxis(baselineY);

        // Plot the real part of psi:
        this._context.beginPath();
        this._context.moveTo(0, baselineY - psi.re[0] * pxPerY);
        for (let x=1; x<=xMax; x++)
            this._context.lineTo(x, baselineY - psi.re[x] * pxPerY);

        this._context.strokeStyle = "#ffc000";
        this._context.stroke();

        // Plot the imaginary part of psi:
        this._context.beginPath();
        this._context.moveTo(0, baselineY - psi.im[0] * pxPerY);
        for (let x=1; x<=xMax; x++)
            theContext.lineTo(x, baselineY - psi.im[x] * pxPerY);

        this._context.strokeStyle = "#00d0ff";
        this._context.stroke();

        // Now draw the wavepacket we might add next, with transparency:
        if (psiTempAlpha <= 0.001) return;
        this._context.globalAlpha = psiTempAlpha;
        this._context.beginPath();
        this._context.moveTo(0, baselineY - psiTemp.re[0]*pxPerY);
        for (let x=1; x<=xMax; x++)
            this._context.lineTo(x, baselineY - psiTemp.re[x]*pxPerY);

        this._context.strokeStyle = "#ffc000";
        this._context.stroke();
        this._context.beginPath();
        this._context.moveTo(0, baselineY - psiTemp.im[0]*pxPerY);
        for (let x=1; x<=xMax; x++)
            this._context.lineTo(x, baselineY - psiTemp.im[x]*pxPerY);

        this._context.strokeStyle = "#00d0ff";
        this._context.stroke();
        this._context.globalAlpha = 1.0;
    }

    _plotDensityPhase(psi, baselineY) {
        const pxPerY = psi2PixPerUnit;
        this._drawHorizontalAxis(baselineY);

        for (let x = 0; x <= xMax; x++) {
            theContext.beginPath();
            theContext.moveTo(x, baselineY);
            theContext.lineTo(x, baselineY - pxPerY*(psi.re[x]*psi.re[x] + psi.im[x]*psi.im[x]));
            let localPhase = Math.atan2(psi.im[x], psi.re[x]);
            if (localPhase < 0) localPhase += 2 * Math.PI;
            theContext.strokeStyle = phaseColor[Math.round(localPhase * nColors / (2 * Math.PI))];
            theContext.stroke();
        }

        // Now draw the wavepacket we might add next, with transparency:
        if (psiTempAlpha <= 0.001) return;

        theContext.globalAlpha = psiTempAlpha;
        for (let x = 0; x <= xMax; x++) {
            theContext.beginPath();
            theContext.moveTo(x, baselineY);
            theContext.lineTo(x, baselineY - pxPerY*(psiTemp.re[x]*psiTemp.re[x] + psiTemp.im[x]*psiTemp.im[x]));
            let localPhase = Math.atan2(psiTemp.im[x], psiTemp.re[x]);
            if (localPhase < 0) localPhase += 2 * Math.PI;
            theContext.strokeStyle = phaseColor[Math.round(localPhase * nColors / (2*Math.PI))];
            theContext.stroke();
        }
        theContext.globalAlpha = 1.0;
    }

    paintCanvas(psi, realImagChecked) {
        this._context.clearRect(0, 0, xMax, cHeight);
        this._context.lineWidth = 2;

        const baselineY = realImag.checked ? cHeight * 0.5 : cHeight - plotMarginHeight;
        if (realImagChecked)
            this._plotRealImaginary(psi, baselineY);
        else
            this._plotDensityPhase(psi, baselineY);

        const delta = 20;		// grid spacing in pixels
        const gridBase = realImag.checked ? cHeight : baselineY;
        const gridOffset = realImag.checked ? (cHeight / 2) % delta : delta;
        this._drawGrid(delta, gridBase, gridOffset);
    }
}

const display = new Display(theContext);

pauseButton.addEventListener("click", () => startStop());
document.getElementById("clearButton").addEventListener("click", () => clearPsi());
gridCheck.addEventListener("click",  () => display.paintCanvas(psi, realImag.checked));
posSlider.addEventListener("input", () => setPsiTemp());
heightSlider.addEventListener("input", () => setPsiTemp());
widthSlider.addEventListener("input", () => setPsiTemp());
momentumSlider.addEventListener("input", () => setPsiTemp());
function updateSpeedDisplay() {
    speedValue.textContent = Number(speedSlider.value).toFixed(3);
}
speedSlider.addEventListener("input", updateSpeedDisplay);
document.getElementById("addButton")
    .addEventListener("click", () => { setPsiTemp(); addPacket(); });


let xMax = theCanvas.clientWidth;
let cHeight = theCanvas.clientHeight;

class FreeWavePacket2D {
    constructor(iMax, dt=0.2) {
        this._iMax = iMax;
        this._psi = { re: new Array(iMax + 1), im: new Array(iMax + 1) };
        this._psiLast = { re: new Array(iMax + 1), im: new Array(iMax + 1) };
        this._psiNext = {re: new Array(iMax + 1), im: new Array(iMax + 1) };
    }

    get im() { return this._psi.im; }
    get re() { return this._psi.re; }

    clear() {
        for (let i = 0; i <= this._iMax; i++) {
            this._psi.re[i] = 0;
            this._psi.im[i] = 0;
            this._psiLast.re[i] = 0;
            this._psiLast.im[i] = 0;
        }
    }

    addPacket(psiTemp, dt) {
        for (let x=0; x <= this._iMax; x++) {
            this._psi.re[x] += psiTemp.re[x];
            this._psi.im[x] += psiTemp.im[x];
        }
        for (let x=1; x < this._iMax; x++) {	// integrate backwards to get previous wavefunction values
            this._psiLast.re[x] = this.re[x] - 0.5 * dt * (-this.im[x+1] - this.im[x-1] + 2 * this.im[x]);
            this._psiLast.im[x] = this.im[x] + 0.5 * dt * (-this.re[x+1] - this.re[x-1] + 2 * this.re[x]);
        }
    }

    step(dt) {
        for (let x = 1; x < this._iMax; x++) {
            this._psiNext.re[x] = this._psiLast.re[x] + dt * (-this.im[x+1] - this.im[x-1] + 2 * this.im[x]);
            this._psiNext.im[x] = this._psiLast.im[x] - dt * (-this.re[x+1] - this.re[x-1] + 2 * this.re[x]);
        }
        for (let x = 1; x < this._iMax; x++) {	// now copy current to past, future to current
            this._psiLast.re[x] = this.re[x];
            this._psiLast.im[x] = this.im[x];
            this._psi.re[x] = this._psiNext.re[x];
            this._psi.im[x] = this._psiNext.im[x];
        }
    }
}

const nColors = 360;
const phaseColor = new Array(nColors+1);
for (let c=0; c<=nColors; c++)
    phaseColor[c] = toColorString(c/nColors);		// initialize array of colors

const dt = 0.45;		// anything less than 0.50 seems to be stable
let running = false;
let psiTempAlpha = 0.0;		// transparency level for drawing the potential next wavepacket
const psiTempParams = {};		// parameters of wavepacket being drawn by mouse/touch
const psiPixPerUnit = cHeight/3;	// scale for plotting psi (real and imag parts)
const plotMarginHeight = cHeight * 0.07;	// margin at bottom of density/phase plot
const psi2PixPerUnit = (cHeight - plotMarginHeight) * 0.55;	// scale for plotting psi squared

// Add mouse/touch handlers:
theCanvas.addEventListener('mousedown', mouseDown, false);
theCanvas.addEventListener('touchstart', touchStart, false);

function startStop() {
    running = !running;
    if (running) {
        pauseButton.innerHTML = "Pause";
        nextFrame();
    } else
        pauseButton.innerHTML = "Resume";
}

function nextFrame() {
    if (!running) return;

    const stepsPerFrame = Number(speedSlider.value);
    for (let step= 0; step < stepsPerFrame; step++)
        psi.step(dt); //psi.step();
    display.paintCanvas(psi, realImag.checked);
    if (running) requestAnimationFrame(nextFrame);
}

let fading = false;
function startFadePsiTemp() {
    if (fading) return;
    fading = true;
    requestAnimationFrame(fadePsiTemp);
}

function fadePsiTemp() {
    psiTempAlpha -= 0.01;

    if (psiTempAlpha <= 0.005) {
        psiTempAlpha = 0.0;
        fading = false;
        display.paintCanvas(psi, realImag.checked);
        return;
    }

    display.paintCanvas(psi, realImag.checked);
    requestAnimationFrame(fadePsiTemp);
}

// Construct a new wavepacket, using either passed parameters or GUI settings:
function setPsiTemp(center, pHeight, pWidth, k) {
    if (center === undefined) {
        center = Number(posSlider.value);
        pHeight = Number(heightSlider.value);
        pWidth = Number(widthSlider.value);
        k = Number(momentumSlider.value);
    }
    for (let x = 1; x < xMax; x++) {
        const scaledX = (x - center) / pWidth;
        const envelope = pHeight * Math.exp(-scaledX * scaledX);
        psiTemp.re[x] = envelope * Math.cos(k * (x - center));	// add new wavepacket to existing wavefunction
        psiTemp.im[x] = envelope * Math.sin(k * (x - center));
    }
    psiTemp.re[0] = psiTemp.im[0] = psiTemp.re[xMax] = psiTemp.im[xMax] = 0.0;
    psiTempAlpha = 0.5;

    setTimeout(() => { startFadePsiTemp(); }, 2000);
    display.paintCanvas(psi, realImag.checked);
}

// Add a new Gaussian wavepacket:
function addPacket() {
    psi.addPacket(psiTemp, dt);
    psiTempAlpha = 0.0;
    display.paintCanvas(psi, realImag.checked);
    if (!running) pauseButton.innerHTML = "Run";
}

// Set the wavefunction to zero:
function clearPsi() {
    psi.clear();
    display.paintCanvas(psi, realImag.checked);
}

// Mouse/touch interaction code:
function mouseDown(e) {
    const pos = getCanvasCoordinates(e);
    mouseOrTouchStart(pos.x, pos.y, e, false);
}

function touchStart(e) {
    const pos = getCanvasCoordinates(e);
    mouseOrTouchStart(pos.x, pos.y, e, true);
}

function mouseMove(e) {
    const pos = getCanvasCoordinates(e);
    mouseOrTouchMove(pos.x, pos.y, e);
}

function touchMove(e) {
    const pos = getCanvasCoordinates(e);
    mouseOrTouchMove(pos.x, pos.y, e);
}

function mouseUp(e) {
    document.body.onmousemove = null;	// quit listening for mousemove events until next mousedown
    document.body.onmouseup = null;
    addPacket();
    //mouseOrTouchEnd(e.pageX, e.pageY, e);
}
function touchEnd(e) {
    document.body.ontouchmove = null;	// quit listening for touchmove events until next touchstart
    document.body.ontouchend = null;
    addPacket();
    //mouseOrTouchEnd(e.changedTouches[0].pageX, e.changedTouches[0].pageY, e);
}

function getCanvasCoordinates(event) {
    const rect = theCanvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function mouseOrTouchStart(canvasX, canvasY, e, touch) {
    if ((canvasX < Number(posSlider.min)) || (canvasX > Number(posSlider.max))) return;

    let pxAboveAxis = cHeight - plotMarginHeight - canvasY;
    if (realImag.checked) pxAboveAxis = cHeight/2 - canvasY;
    if (pxAboveAxis <= 0) return;

    e.preventDefault();
    if (touch) {
        document.body.ontouchmove = touchMove;
        document.body.ontouchend = touchEnd;
    } else {
        document.body.onmousemove = mouseMove;
        document.body.onmouseup = mouseUp;
    }
    psiTempParams.position = canvasX;
    psiTempParams.momentum = 0;
    if (realImag.checked)
        psiTempParams.height = pxAboveAxis / psiPixPerUnit;
    else
        psiTempParams.height = Math.sqrt(pxAboveAxis / psi2PixPerUnit);

    psiTempParams.width = 40;
    setPsiTemp(psiTempParams.position, psiTempParams.height, psiTempParams.width, psiTempParams.momentum);
}

function mouseOrTouchMove(canvasX, canvasY, e) {
    const maxK = Number(momentumSlider.max);
    psiTempParams.momentum = (canvasX - psiTempParams.position) * maxK / 100;
    if (psiTempParams.momentum > maxK) psiTempParams.momentum = maxK;
    if (psiTempParams.momentum < -maxK) psiTempParams.momentum = -maxK;
    let pxAboveAxis = cHeight - plotMarginHeight - canvasY;
    if (realImag.checked) pxAboveAxis = cHeight/2 - canvasY;
    if (pxAboveAxis === 0) return;
    const packetArea = psiTempParams.height * psiTempParams.width;
    if (realImag.checked) {
        psiTempParams.height = pxAboveAxis / psiPixPerUnit;
    } else {
        if (pxAboveAxis < 0) return;
        psiTempParams.height = Math.sqrt(pxAboveAxis / psi2PixPerUnit);
    }
    psiTempParams.width = packetArea / psiTempParams.height;
    setPsiTemp(psiTempParams.position, psiTempParams.height, psiTempParams.width, psiTempParams.momentum);
}

let psi;
let psiTemp;
function initPhysics() {
    psi = new FreeWavePacket2D(xMax);
    psiTemp = { re: new Array(xMax + 1), im: new Array(xMax + 1) };

    clearPsi();
    setPsiTemp();
    addPacket();
}

function resizeCanvas() {
    const rect = theCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    theCanvas.width  = rect.width  * dpr;
    theCanvas.height = rect.height * dpr;
    theContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Update globals
    xMax = Math.floor(rect.width);
    cHeight = Math.floor(rect.height);

    initPhysics();
    display.paintCanvas(psi, realImag.checked);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
startStop();


