const theCanvas = document.getElementById("infiniteSquareWellCanvas2D");
const theCanvasWrapper = document.getElementById("infiniteSquareWellWrapper2D");
const theContext = theCanvas.getContext("2d");
theContext.fillStyle = "transparent";
theCanvas.style.touchAction = "none";

const pauseButton = document.getElementById("pauseButton");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const realImag = document.getElementById("realImag");

const iMax = theCanvas.width;	// max index in function arrays (so array size is iMax+1)
//const pxPerX = 60;			// number of pixels per conventional x unit
const clockSpaceFraction = 0.25;	// fraction of vertical space taken up by clocks
const clockRadiusFraction = 0.45;	// as fraction of width or height of clock space
const nMax = 7;				// maximum energy quantum number (starting from zero)
const nColors = 360;
const phaseColor = new Array(nColors+1);
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

function getClockSpaceHeight() {
    return theCanvas.height * clockSpaceFraction;
}

function getClockPixelRadius() {
    return getClockSpaceHeight() * clockRadiusFraction;
}

class Psi {
    constructor(iMax=theCanvas.width) {
        this._iMax = iMax;
        this._psi = {
            re: new Array(iMax + 1),
            im: new Array(iMax + 1)
        };
        this._eigenPsi = new Array(nMax + 1);
        this._amplitude = new Array(nMax + 1);		// amplitudes of the eigenfunctions in psi
        this._phase = new Array(nMax + 1);			// phases of the eigenfunctions in psi
        this.init();
        this.build(iMax);
    }

    get amplitude() { return this._amplitude; }
    get phase() { return this._phase; }

    init() {
        // Initialize eigenfunctions (sine waves):
        for (let n=0; n<=nMax; n++)
            this._eigenPsi[n] = new Array(iMax+1);

        for (let i = 0; i <= iMax; i++)
            for (let n = 0; n <= nMax; n++)
                this._eigenPsi[n][i] = Math.sin((n + 1) * Math.PI * i / iMax);

        // Initialize amplitudes and phases:
        for (let n = 0; n <= nMax; n++) {
            this._amplitude[n] = 0;
            this._phase[n] = 0;
        }
        this._amplitude[0] = 1/Math.sqrt(2);
        this._amplitude[1] = 1/Math.sqrt(2);

        // Initialize array of colors to represent phases
        for (let c = 0; c <= nColors; c++)
            phaseColor[c] = toColorString(c / nColors);
    }

    setAmplitudesTo(amplitude) {
        for (let n = 0; n <= nMax; n++)
            this._amplitude[n] = amplitude;
    }

    updatePhase() {
        for (let n = 0; n <= nMax; n++) {
            this._phase[n] -= (n + 1) * (n + 1) * Number(speedSlider.value);	// energies proportional to n^2
            if (this._phase[n] < 0)
                this._phase[n] += 2 * Math.PI;
        }
    }

    normalise() {
        let norm2 = 0;
        for (let n = 0; n <= nMax; n++)
            norm2 += this._amplitude[n] * this._amplitude[n];

        if (norm2 <= 0) return;

        for (let n = 0; n <= nMax; n++)
            this._amplitude[n] /= Math.sqrt(norm2);
    }

    setAmplitudeTo(index, relX, relY) {
        const pixelDistance = Math.sqrt(relX*relX + relY*relY);
        this._amplitude[mouseClock] = Math.min(pixelDistance / getClockPixelRadius(), 1);
        this._phase[mouseClock] = Math.atan2(relY, relX);
        if (this._phase[mouseClock] < 0) this._phase[mouseClock] += 2 * Math.PI;
    }

    build() {
        for (let i = 0; i <= this._iMax; i++) {
            this._psi.re[i] = 0;
            this._psi.im[i] = 0;
        }
        for (let n = 0; n <= nMax; n++) {
            const realPart = this._amplitude[n] * Math.cos(this._phase[n]);
            const imagPart = this._amplitude[n] * Math.sin(this._phase[n]);
            for (let i = 0; i <= this._iMax; i++) {
                this._psi.re[i] += realPart * this._eigenPsi[n][i];
                this._psi.im[i] += imagPart * this._eigenPsi[n][i];
            }
        }
    }

    render(baselineY, context) {
        let pxPerY = baselineY * 0.6;
        // Plot the real part of psi:
        context.beginPath();
        context.moveTo(0, baselineY - this._psi.re[0] * pxPerY);
        for (let i = 1; i <= iMax; i++)
            context.lineTo(i, baselineY - this._psi.re[i] * pxPerY);

        context.strokeStyle = "#ffc000";
        context.stroke();

        // Plot the imaginary part of psi:
        context.beginPath();
        context.moveTo(0, baselineY - this._psi.im[0] * pxPerY);
        for (let i = 1; i <= iMax; i++)
            context.lineTo(i, baselineY - this._psi.im[i] * pxPerY);

        context.strokeStyle = "#00d0ff";
        context.stroke();
    }

    plotRealImaginary(context) {
        const baselineY = theCanvas.height * (1 - clockSpaceFraction) / 2;
        drawHorizontalAxis(baselineY);
        this.render(baselineY, context);
    }

    plotDensityPhase(context) {
        const baselineY = theCanvas.height * (1 - clockSpaceFraction);
        const pxPerY = baselineY * 0.4;
        context.lineWidth = 2;
        for (let i = 0; i <= iMax; i++) {
            context.beginPath();
            context.moveTo(i, baselineY);
            context.lineTo(i, baselineY - pxPerY*(this._psi.re[i]*this._psi.re[i] + this._psi.im[i]*this._psi.im[i]));
            let localPhase = Math.atan2(this._psi.im[i], this._psi.re[i]);
            if (localPhase < 0) localPhase += 2 * Math.PI;
            context.strokeStyle = phaseColor[Math.round(localPhase * nColors / (2 * Math.PI))];
            context.stroke();
        }
    }
}

function nextFrame() {
    psi.updatePhase();
    psi.build();
    paintCanvas();
    if (running) requestAnimationFrame(nextFrame);
}

function setMouseClock(relX, relY) {	// parameters are x,y in pixels, relative to clock center
    mouseIsDown = true;
    psi.setAmplitudeTo(mouseClock, relX, relY)
    psi.build();
    paintCanvas();
}

function mouseOrTouchStart(pageX, pageY, e) {
    const pos = getMousePos(theCanvas, pageX, pageY);
    const x = pos.x;
    const y = pos.y;

    if (y > theCanvas.height - getClockSpaceHeigt()) {
        mouseClock = Math.floor(x / getClockSpaceHeigt());

        const clockCenterX = getClockSpaceHeigt() * (mouseClock + 0.5);
        const clockCenterY = theCanvas.height - getClockSpaceHeigt() * 0.5;
        const relX = x - clockCenterX;
        const relY = clockCenterY - y;

        if (relX*relX + relY*relY <= getClockPixelRadius()*getClockPixelRadius()) {
            setMouseClock(relX, relY);
            e.preventDefault();
        }
    }
}

function getMousePos(canvas, pageX, pageY) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: pageX - rect.left - window.scrollX,
        y: pageY - rect.top  - window.scrollY
    };
}

function mouseOrTouchMove(pageX, pageY, event) {
    if (!mouseIsDown) return;

    const pos = getMousePos(theCanvas, pageX, pageY);
    const x = pos.x;
    const y = pos.y;

    const clockCenterX = getClockSpaceHeigt() * (mouseClock + 0.5);
    const clockCenterY = theCanvas.height - getClockSpaceHeigt() * 0.5;

    const relX = x - clockCenterX;
    const relY = clockCenterY - y;

    setMouseClock(relX, relY);
    event.preventDefault();
}

function mouseDown(e) {mouseOrTouchStart(e.pageX, e.pageY, e);}
function touchStart(e) {mouseOrTouchStart(e.targetTouches[0].pageX, e.targetTouches[0].pageY, e);}
function mouseMove(e) {mouseOrTouchMove(e.pageX, e.pageY, e);}
function touchMove(e) {mouseOrTouchMove(e.targetTouches[0].pageX, e.targetTouches[0].pageY, e);}

function mouseUp(e) {
    mouseIsDown = false;
    paintCanvas();
}

function drawHorizontalAxis(baselineY) {
    theContext.strokeStyle = "gray";
    theContext.lineWidth = 1;
    theContext.beginPath();
    theContext.moveTo(0, baselineY);
    theContext.lineTo(theCanvas.width, baselineY);
    theContext.stroke();
    theContext.lineWidth = 2;
}

function paintCanvas() {
    theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);

    if (realImag.checked)
        psi.plotRealImaginary(theContext);
    else
        psi.plotDensityPhase(theContext);

    // Draw the eigen-phasor diagrams:
    const phasorSpace = theCanvas.height * clockSpaceFraction;
    const clockRadius = phasorSpace * clockRadiusFraction;
    for (let n = 0; n <= nMax; n++) {
        theContext.strokeStyle = "gray";
        theContext.lineWidth = 1;
        theContext.beginPath();
        const centerX = (n+0.5)*phasorSpace;
        const centerY = theCanvas.height - 0.5*phasorSpace;
        theContext.arc(centerX, centerY, clockRadius, 0, 2*Math.PI);
        theContext.stroke();
        theContext.beginPath();
        theContext.moveTo(centerX, centerY);
        const clockHandX = centerX + clockRadius * psi.amplitude[n] * Math.cos(psi.phase[n]);
        const clockHandY = centerY - clockRadius * psi.amplitude[n] * Math.sin(psi.phase[n]);
        theContext.lineTo(clockHandX, clockHandY);
        theContext.strokeStyle = phaseColor[Math.round(psi.phase[n] * nColors / (2 * Math.PI))];
        theContext.lineWidth = 3;
        theContext.stroke();
    }

    // Provide feedback when setting an amplitude:
    if (mouseIsDown) {
        theContext.fillStyle = "#a0a0a0";
        theContext.font = "20px monospace";
        theContext.fillText("n = " + (mouseClock+1), 100, 30);
        const amp = psi.amplitude[mouseClock];
        const ph = psi.phase[mouseClock];
        theContext.fillText("Mag = " + Number(amp).toFixed(3), 195, 30);
        const deg = String.fromCharCode(parseInt('00b0',16));		// degree symbol
        theContext.fillText("Phase = " + Math.round(ph * 180 / Math.PI) + deg, 360, 30);
        //theContext.fillText("Re = " + Number(amp*Math.cos[ph]).toFixed(3), 180, 30);
    }
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const wrapperWidth = theCanvasWrapper.clientWidth;
    const wrapperHeight = theCanvasWrapper.clientHeight;

    theCanvas.style.width  = wrapperWidth + "px";
    theCanvas.style.height = wrapperHeight + "px";

    theCanvas.width  = Math.floor(wrapperWidth * dpr);
    theCanvas.height = Math.floor(wrapperHeight * dpr);

    theContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", () => resizeCanvas());

const psi = new Psi();
nextFrame();

function numberToTwoDigitHexString(numberToConvert) {
    const hex = numberToConvert.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function toColorString(hue) {
    let r, g, b;
    if (hue < 1/6) { // red to yellow
        r = 255; g = Math.round(hue*6*255);
        b = 0;
    } else if (hue < 1/3) { // yellow to green
        r = Math.round((1/3 - hue)*6*255);
        g = 255;
        b = 0;
    } else if (hue < 1/2) { // green to cyan
        r = 0;
        g = 255;
        b = Math.round((hue - 1/3) * 6 * 255);
    } else if (hue < 2/3) { // cyan to blue
        r = 0;
        g = Math.round((2/3 - hue) * 6 * 255);
        b = 255;
    } else if (hue < 5/6) { // blue to magenta
        r = Math.round((hue - 2/3) * 6 * 255);
        g = 0;
        b = 255;
    } else { // magenta to red
        r = 255;
        g = 0;
        b = Math.round((1 - hue) * 6 * 255);
    }
    return "#" + numberToTwoDigitHexString(r) + numberToTwoDigitHexString(g) + numberToTwoDigitHexString(b);
}

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
    paintCanvas();
}

function normalizePsi() {
    psi.normalise();
    psi.build();
    paintCanvas();
}

const zeroButton = document.getElementById("zeroButton");
const normalizeButton = document.getElementById("normalizeButton");
const densityPhase = document.getElementById("densityPhase");

pauseButton.addEventListener("click", () => startStop());
realImag.addEventListener("change", paintCanvas);
densityPhase.addEventListener("change", paintCanvas);
zeroButton.addEventListener("click", () => zero());
normalizeButton.addEventListener("click", () => normalizePsi());

function updateSpeedDisplay() {
    speedValue.textContent = Number(speedSlider.value).toFixed(3);
}
speedSlider.addEventListener("input", updateSpeedDisplay);
updateSpeedDisplay(); // Initial display sync
