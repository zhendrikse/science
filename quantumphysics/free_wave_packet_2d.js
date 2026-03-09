import {toColorString, WavePacket, WavePacketDisplay} from "./2d-quantum-extensions.js";

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

let xMax = theCanvas.clientWidth;
let cHeight = theCanvas.clientHeight;

class Display extends WavePacketDisplay {
    constructor(theContext, xMax, cHeight) {
        super(theContext, xMax, cHeight);
    }

    _plotRealImaginary(psi, baselineY) {
        super._plotRealImaginary(psi, baselineY);

        // Now draw the wavepacket we might add next, with transparency:
        if (psiTempAlpha <= 0.001) return;
        this._context.globalAlpha = psiTempAlpha;
        super._plotRealImaginary(psiTemp, baselineY);
        this._context.globalAlpha = 1.0;
    }

    _plotDensityPhase(psi, baselineY) {
        super._plotDensityPhase(psi, baselineY);

        // Now draw the wavepacket we might add next, with transparency:
        if (psiTempAlpha <= 0.001) return;
        theContext.globalAlpha = psiTempAlpha;
        super._plotDensityPhase(psiTemp, baselineY);
        theContext.globalAlpha = 1.0;
    }

    paintCanvas(psi, realImagChecked) {
        this._context.clearRect(0, 0, xMax, cHeight);
        this._context.lineWidth = 2;

        const delta = 20;		// grid spacing in pixels
        const baselineY = realImag.checked ? cHeight * 0.5 : cHeight - plotMarginHeight;
        const gridBase = realImag.checked ? cHeight : baselineY;
        const gridOffset = realImag.checked ? (cHeight / 2) % delta : delta;
        this._drawHorizontalAxis(xMax, baselineY);
        if (realImagChecked)
            this._plotRealImaginary(psi, baselineY);
        else
            this._plotDensityPhase(psi, baselineY);

        if (gridCheck.checked)
            this._drawGrid(xMax, delta, gridBase, gridOffset);
    }
}

const display = new Display(theContext, xMax, cHeight);

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
    psiTemp = new WavePacket(xMax).with(center, pHeight, pWidth, k);
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
    if (realImag.checked)
        psiTempParams.height = pxAboveAxis / psiPixPerUnit;
    else {
        if (pxAboveAxis < 0) return;
        psiTempParams.height = Math.sqrt(pxAboveAxis / psi2PixPerUnit);
    }
    psiTempParams.width = packetArea / psiTempParams.height;
    setPsiTemp(psiTempParams.position, psiTempParams.height, psiTempParams.width, psiTempParams.momentum);
}

let psi;
let psiTemp;
function initPhysics() {
    psi = new WavePacket(xMax);
    psiTemp = new WavePacket(xMax);

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


