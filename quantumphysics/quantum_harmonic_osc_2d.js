import { Display, HarmonicOscillatorWave2D } from "./2d-quantum-extensions.js"

const theCanvas = document.getElementById("shoCanvas2D");
const theContext = theCanvas.getContext("2d");
theContext.fillStyle = "transparent";
theCanvas.style.touchAction = "none";

let running = true;
let mouseIsDown = false;
let mouseClock;

// Add mouse/touch handlers; down/start must be inside the canvas but drag can go outside it:
theCanvas.addEventListener('mousedown', mouseDown, false);
document.body.addEventListener('mousemove', mouseMove, false);
document.body.addEventListener('mouseup', mouseUp, false);
theCanvas.addEventListener('touchstart', touchStart, false);
document.body.addEventListener('touchmove', touchMove, false);
document.body.addEventListener('touchend', mouseUp, false);

const getCanvasWidth = () => theCanvas.clientWidth;
const getCanvasHeight = () => theCanvas.clientHeight;

function nextFrame() {
    psi.updatePhase(Number(speedSlider.value));
    psi.build();
    display.paintCanvas(psi, mouseIsDown, mouseClock);
    if (running) requestAnimationFrame(nextFrame);
}

function setMouseClock(relX, relY) {	// parameters are x,y in pixels, relative to clock center
    mouseIsDown = true;
    psi.setAmplitudeTo(mouseClock, relX, relY, display.clockPixelRadius);
    psi.build();
    display.paintCanvas(psi, mouseIsDown, mouseClock);
}

function mouseOrTouchStart(pageX, pageY, e) {
    const pos = getMousePos(theCanvas, pageX, pageY);
    const x = pos.x;
    const y = pos.y;

    if (y > getCanvasHeight() - display.clockSpaceHeight) {
        mouseClock = Math.floor(x / display.phasorSpace);

        const clockCenterX = display.phasorSpace * (mouseClock + 0.5);
        const clockCenterY = getCanvasHeight() - display.clockSpaceHeight * 0.5;
        const relX = x - clockCenterX;
        const relY = clockCenterY - y;

        if (relX*relX + relY*relY <= display.clockPixelRadius * display.clockPixelRadius) {
            setMouseClock(relX, relY);
            e.preventDefault();
        }
    }
}

function getMousePos(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function mouseOrTouchMove(pageX, pageY, event) {
    if (!mouseIsDown) return;

    const pos = getMousePos(theCanvas, pageX, pageY);
    const x = pos.x;
    const y = pos.y;

    const clockCenterX = display.phasorSpace * (mouseClock + 0.5);
    const clockCenterY = getCanvasHeight() - display.clockSpaceHeight * 0.5;

    const relX = x - clockCenterX;
    const relY = clockCenterY - y;

    setMouseClock(relX, relY);
    event.preventDefault();
}

function mouseDown(e) { mouseOrTouchStart(e.clientX, e.clientY, e); }
function touchStart(e) { mouseOrTouchStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY, e); }
function mouseMove(e) { mouseOrTouchMove(e.clientX, e.clientY, e); }
function touchMove(e) { mouseOrTouchMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY, e); }

function mouseUp(e) {
    mouseIsDown = false;
    display.paintCanvas(psi, mouseIsDown, mouseClock);
}

const display = new Display(theCanvas, theContext);
let psi = new HarmonicOscillatorWave2D(getCanvasWidth());

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    const width  = theCanvas.clientWidth;
    const height = theCanvas.clientHeight;

    theCanvas.style.width  = width + "px";
    theCanvas.style.height = height + "px";

    theCanvas.width  = Math.floor(width * dpr);
    theCanvas.height = Math.floor(height * dpr);

    theContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    psi = new HarmonicOscillatorWave2D(getCanvasWidth());
    display.paintCanvas(psi, mouseIsDown, mouseClock);
}
window.addEventListener("resize", () => resizeCanvas());

// --- GUI wiring ---
function startStop() {
    running = !running;
    if (running) {
        pauseButton.innerHTML = "Pause";
        nextFrame();
    } else
        pauseButton.innerHTML = "Resume";
}

function zero() {
    psi.setAmplitudesTo(0);
    psi.build();
    display.paintCanvas(psi, mouseIsDown, mouseClock);
}

function normalizePsi() {
    psi.normalise();
    psi.build();
    display.paintCanvas(psi, mouseIsDown, mouseClock);
}

function coherent() {
    psi.coherent(Number(alphaSlider.value));
}

const alphaReadout = document.getElementById("alphaReadout");
function adjustAlpha() {
    alphaReadout.innerHTML = Number(alphaSlider.value).toFixed(1);
}

const zeroButton = document.getElementById("zeroButton");
const normalizeButton = document.getElementById("normalizeButton");
const densityPhase = document.getElementById("densityPhase");
const pauseButton = document.getElementById("pauseButton");
const speedSlider = document.getElementById("speedSlider");
const realImag = document.getElementById("realImag");
const alphaSlider = document.getElementById("alphaSlider");
const alphaButton = document.getElementById("alphaButton");

alphaButton.addEventListener("click", () => coherent());
alphaSlider.addEventListener("change", e => adjustAlpha());
pauseButton.addEventListener("click", e => startStop());
realImag.addEventListener("change", () => display.paintCanvas(psi, mouseIsDown, mouseClock));
densityPhase.addEventListener("change", () => display.paintCanvas(psi, mouseIsDown, mouseClock));
zeroButton.addEventListener("click", () => zero());
normalizeButton.addEventListener("click", () => normalizePsi());

const speedValueReadout = document.getElementById("speedValueReadout");
function updateSpeedDisplay() {
    speedValueReadout.textContent = Number(speedSlider.value).toFixed(3);
}
speedSlider.addEventListener("input", updateSpeedDisplay);
updateSpeedDisplay(); // Initial display sync
resizeCanvas();
nextFrame();