import { Display } from "./2d-quantum-extensions.js"

const theCanvas = document.getElementById("infiniteSquareWellCanvas2D");
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

class Psi {
    constructor(iMax = getCanvasWidth()) {
        this._iMax = iMax;
        this._nMax = 7; // maximum energy quantum number (starting from zero)

        this._psi = {
            re: new Array(iMax + 1),
            im: new Array(iMax + 1)
        };
        this._eigenPsi = new Array(this._nMax + 1);
        this._amplitude = new Array(this._nMax + 1);		// amplitudes of the eigenfunctions in psi
        this._phase = new Array(this._nMax + 1);			// phases of the eigenfunctions in psi
        this.init();
        this.build(iMax);
    }

    get re() { return this._psi.re; }
    get im() { return this._psi.im; }
    get iMax() { return this._iMax; }
    get amplitude() { return this._amplitude; }
    get phase() { return this._phase; }

    init() {
        // Initialize eigenfunctions (sine waves):
        for (let n=0; n <= this._nMax; n++)
            this._eigenPsi[n] = new Array(this._iMax+1);

        for (let i = 0; i <= this._iMax; i++)
            for (let n = 0; n <= this._nMax; n++)
                this._eigenPsi[n][i] = Math.sin((n + 1) * Math.PI * i / this._iMax);

        // Initialize amplitudes and phases:
        for (let n = 0; n <= this._nMax; n++) {
            this._amplitude[n] = 0;
            this._phase[n] = 0;
        }
        this._amplitude[0] = 1 / Math.sqrt(2);
        this._amplitude[1] = 1 / Math.sqrt(2);
    }

    setAmplitudesTo(amplitude) {
        for (let n = 0; n <= this._nMax; n++)
            this._amplitude[n] = amplitude;
    }

    updatePhase() {
        for (let n = 0; n <= this._nMax; n++) {
            this._phase[n] -= (n + 1) * (n + 1) * Number(speedSlider.value);	// energies proportional to n^2
            if (this._phase[n] < 0)
                this._phase[n] += 2 * Math.PI;
        }
    }

    normalise() {
        let norm2 = 0;
        for (let n = 0; n <= this._nMax; n++)
            norm2 += this._amplitude[n] * this._amplitude[n];

        if (norm2 <= 0) return;

        for (let n = 0; n <= this._nMax; n++)
            this._amplitude[n] /= Math.sqrt(norm2);
    }

    setAmplitudeTo(index, relX, relY) {
        const pixelDistance = Math.sqrt(relX*relX + relY*relY);

        this._amplitude[index] = Math.min(pixelDistance / display.clockPixelRadius, 1);
        this._phase[index] = Math.atan2(relY, relX);

        if (this._phase[index] < 0)
            this._phase[index] += 2 * Math.PI;
    }

    build() {
        for (let i = 0; i <= this._iMax; i++) {
            this._psi.re[i] = 0;
            this._psi.im[i] = 0;
        }
        for (let n = 0; n <= this._nMax; n++) {
            const realPart = this._amplitude[n] * Math.cos(this._phase[n]);
            const imagPart = this._amplitude[n] * Math.sin(this._phase[n]);
            for (let i = 0; i <= this._iMax; i++) {
                this._psi.re[i] += realPart * this._eigenPsi[n][i];
                this._psi.im[i] += imagPart * this._eigenPsi[n][i];
            }
        }
    }
}

function nextFrame() {
    psi.updatePhase();
    psi.build();
    display.paintCanvas(psi, mouseIsDown, mouseClock);
    if (running) requestAnimationFrame(nextFrame);
}

function setMouseClock(relX, relY) {	// parameters are x,y in pixels, relative to clock center
    mouseIsDown = true;
    psi.setAmplitudeTo(mouseClock, relX, relY);
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
let psi = new Psi();

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    const width  = theCanvas.clientWidth;
    const height = theCanvas.clientHeight;

    theCanvas.style.width  = width + "px";
    theCanvas.style.height = height + "px";

    theCanvas.width  = Math.floor(width * dpr);
    theCanvas.height = Math.floor(height * dpr);

    theContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    psi = new Psi();
    display.paintCanvas(psi, mouseIsDown, mouseClock);
}
window.addEventListener("resize", () => resizeCanvas());

// --- GUI wiring ---
const pauseButton = document.getElementById("pauseButton");
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

const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const realImag = document.getElementById("realImag");
const zeroButton = document.getElementById("zeroButton");
const normalizeButton = document.getElementById("normalizeButton");
const densityPhase = document.getElementById("densityPhase");

pauseButton.addEventListener("click", () => startStop());
realImag.addEventListener("change", () => display.paintCanvas(psi, mouseIsDown, mouseClock));
densityPhase.addEventListener("change", () => display.paintCanvas(psi, mouseIsDown, mouseClock));
zeroButton.addEventListener("click", () => zero());
normalizeButton.addEventListener("click", () => normalizePsi());

function updateSpeedDisplay() {
    speedValue.textContent = Number(speedSlider.value).toFixed(3);
}
speedSlider.addEventListener("input", updateSpeedDisplay);
updateSpeedDisplay(); // Initial display sync
resizeCanvas();
nextFrame();