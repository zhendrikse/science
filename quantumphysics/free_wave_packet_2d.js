import { WavePacket, WavePacketDisplay } from "./2d-quantum-extensions.js";

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

let xMax;
let canvasHeight;
let display;

pauseButton.addEventListener("click", () => startStop());
document.getElementById("clearButton").addEventListener("click", () => clearPsi());
gridCheck.addEventListener("click",  () => display.plotPsi(psi, realImag.checked, gridCheck.checked));
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
    display.plotPsi(psi, realImag.checked, gridCheck.checked);
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
        display.plotPsi(psi, realImag.checked, gridCheck.checked);
        return;
    }

    display.plotPsi(psi, realImag.checked, gridCheck.checked);
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
    display.plotPsi(psi, realImag.checked, gridCheck.checked);
}

// Add a new Gaussian wavepacket:
function addPacket() {
    psi.addPacket(psiTemp, dt);
    psiTempAlpha = 0.0;
    display.plotPsi(psi, realImag.checked, gridCheck.checked);
    if (!running) pauseButton.innerHTML = "Run";
}

// Set the wavefunction to zero:
function clearPsi() {
    psi.clear();
    display.plotPsi(psi, realImag.checked, gridCheck.checked);
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

    let pxAboveAxis = canvasHeight - display.plotMarginHeight - canvasY;
    if (realImag.checked) pxAboveAxis = canvasHeight/2 - canvasY;
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
        psiTempParams.height = pxAboveAxis / display.psiPixPerUnit;
    else
        psiTempParams.height = Math.sqrt(pxAboveAxis / display.psi2PixPerUnit);

    psiTempParams.width = 40;
    setPsiTemp(psiTempParams.position, psiTempParams.height, psiTempParams.width, psiTempParams.momentum);
}

function mouseOrTouchMove(canvasX, canvasY, e) {
    const maxK = Number(momentumSlider.max);
    psiTempParams.momentum = (canvasX - psiTempParams.position) * maxK / 100;
    if (psiTempParams.momentum > maxK) psiTempParams.momentum = maxK;
    if (psiTempParams.momentum < -maxK) psiTempParams.momentum = -maxK;
    let pxAboveAxis = canvasHeight - display.plotMarginHeight - canvasY;
    if (realImag.checked) pxAboveAxis = canvasHeight/2 - canvasY;
    if (pxAboveAxis === 0) return;
    const packetArea = psiTempParams.height * psiTempParams.width;
    if (realImag.checked)
        psiTempParams.height = pxAboveAxis / display.psiPixPerUnit;
    else {
        if (pxAboveAxis < 0) return;
        psiTempParams.height = Math.sqrt(pxAboveAxis / display.psi2PixPerUnit);
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
    canvasHeight = Math.floor(rect.height);
    display = new WavePacketDisplay(theContext, xMax, canvasHeight)
    initPhysics();
    display.plotPsi(psi, realImag.checked, gridCheck.checked);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
startStop();


