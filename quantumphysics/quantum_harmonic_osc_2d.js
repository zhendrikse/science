import { Display, Wave2D, Mouse } from "./2d-quantum-extensions.js"

const theCanvas = document.getElementById("shoCanvas2D");
const theContext = theCanvas.getContext("2d");
theContext.fillStyle = "transparent";
theCanvas.style.touchAction = "none";

export class HarmonicOscillatorWave2D extends Wave2D{
    constructor(iMax) {
        super(iMax, 25);
    }

    _initEigenStates() {
        for (let n = 0; n <= this._nMax; n++)
            this._eigenPsi[n] = new Array(this._iMax + 1);

        for (let i = 0; i <= this._iMax; i++) {
            const x = (i - this._iMax / 2) / this._pxPerX;

            // --- Build Hermite polynomials recursively ---
            const H = new Array(this._nMax + 1);

            H[0] = 1;
            if (this._nMax > 0)
                H[1] = 2 * x;

            for (let n = 1; n < this._nMax; n++)
                H[n+1] = 2 * x * H[n] - 2 * n * H[n-1];

            const gaussian = Math.exp(-x * x / 2);
            let nFact = 1;
            for (let n = 0; n <= this._nMax; n++) {
                if (n > 0) nFact *= n;

                const norm = 1 / Math.sqrt(Math.pow(2,n) * nFact * Math.sqrt(Math.PI));
                this._eigenPsi[n][i] = norm * H[n] * gaussian;
            }
        }
    }

    updatePhase(speed) {
        for (let n = 0; n <= this._nMax; n++) {
            this._phase[n] -= (n + 0.5) * speed;
            if (this._phase[n] < 0)
                this._phase[n] += 2 * Math.PI;
        }
    }

    coherent(alphaMag) {
        let nFact = 1;
        const prefactor = Math.exp(-alphaMag * alphaMag / 2);

        for (let n = 0; n <= this._nMax; n++) {
            if (n > 0) nFact *= n;
            this._amplitude[n] =
                prefactor * Math.pow(alphaMag, n) / Math.sqrt(nFact);
            this._phase[n] = 0;
        }

        this.normalise();
    }
}

const display = new Display(theCanvas, theContext);
const mouse = new Mouse(theCanvas, display);
let psi = new HarmonicOscillatorWave2D(theCanvas.clientWidth);
let running = true;

// Add mouse/touch handlers; down/start must be inside the canvas but drag can go outside it:
theCanvas.addEventListener('mousedown', mouseDown, false);
document.body.addEventListener('mousemove', mouseMove, false);
document.body.addEventListener('mouseup', mouseUp, false);
theCanvas.addEventListener('touchstart', touchStart, false);
document.body.addEventListener('touchmove', touchMove, false);
document.body.addEventListener('touchend', mouseUp, false);

function nextFrame() {
    psi.updatePhase(Number(speedSlider.value));
    psi.build();
    display.paintCanvas(psi, mouse.mouseIsDown, mouse.mouseClock);
    if (running) requestAnimationFrame(nextFrame);
}

function mouseUp(e) { mouse.mouseUp(); display.paintCanvas(psi, mouse.mouseIsDown, mouse.mouseClock); }
function mouseDown(e) { mouse.mouseOrTouchStart(e.clientX, e.clientY, e, psi); }
function touchStart(e) { mouse.mouseOrTouchStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY, e, psi); }
function mouseMove(e) { mouse.mouseOrTouchMove(e.clientX, e.clientY, e, psi); }
function touchMove(e) { mouse.mouseOrTouchMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY, e, psi); }

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    const width  = theCanvas.clientWidth;
    const height = theCanvas.clientHeight;

    theCanvas.style.width  = width + "px";
    theCanvas.style.height = height + "px";

    theCanvas.width  = Math.floor(width * dpr);
    theCanvas.height = Math.floor(height * dpr);

    theContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    psi = new HarmonicOscillatorWave2D(theCanvas.clientWidth);
    display.paintCanvas(psi, mouse.mouseIsDown, mouse.mouseClock);
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
    display.paintCanvas(psi, mouse.mouseIsDown, mouse.mouseClock);
}

function normalizePsi() {
    psi.normalise();
    psi.build();
    display.paintCanvas(psi, mouse.mouseIsDown, mouse.mouseClock);
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
realImag.addEventListener("change", () => display.paintCanvas(psi, mouse.mouseIsDown, mouse.mouseClock));
densityPhase.addEventListener("change", () => display.paintCanvas(psi, mouse.mouseIsDown, mouse.mouseClock));
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