import {toColorString} from "./2d-quantum-extensions.js";

const theCanvas = document.getElementById("theCanvas");
const theContext = theCanvas.getContext("2d");
const pauseButton = document.getElementById("pauseButton");
const momentumSlider = document.getElementById("momentumSlider");
const realImag = document.getElementById("realImag");

const xMax = theCanvas.width;
const nColors = 360;
const phaseColor = new Array(nColors+1);
let running = true;
const phaseOffset = Math.ceil((momentumSlider.max * theCanvas.width) / (2 * Math.PI)) * 2 * Math.PI;

// Initialize array of colors to represent phases:
for (let c = 0; c <= nColors; c++)
    phaseColor[c] = toColorString(c / nColors);

let t = 0;
const dt = 30;
function animate() {
    t += dt;
    paintCanvas();
    if (running) requestAnimationFrame(animate);
}
animate();

function plotReal(k, omega, t, baselineY) {
    const pxPerY = baselineY * 0.6;
    theContext.beginPath();
    theContext.moveTo(0, baselineY - Math.cos(0 - omega * t) * pxPerY);
    for (let x = 1; x <= xMax; x++)
        theContext.lineTo(x, baselineY - Math.cos(k * x - omega * t) * pxPerY);

    theContext.strokeStyle = "#ffc000";
    theContext.stroke();
}

function plotImag(k, omega, t, baselineY) {
    const pxPerY = baselineY * 0.6;
    theContext.beginPath();
    theContext.moveTo(0, baselineY - Math.sin(0 - omega * t) * pxPerY);
    for (let x = 1; x <= xMax; x++)
        theContext.lineTo(x, baselineY - Math.sin(k * x - omega * t) * pxPerY);

    theContext.strokeStyle = "#00d0ff";
    theContext.stroke();
}

function plotAxis(baselineY) {
    theContext.strokeStyle = "gray";
    theContext.lineWidth = 1;
    theContext.beginPath();
    theContext.moveTo(0, baselineY);
    theContext.lineTo(xMax, baselineY);
    theContext.stroke();
    theContext.lineWidth = 2;
}

function plotRealImag(k, omega, t) {
    const baselineY = Number(theCanvas.height) / 2;
    plotAxis(baselineY);
    plotReal(k, omega, t, baselineY);
    plotImag(k, omega, t, baselineY);
}

function plotDensityPhase(k, omega, t) {
    // Plot the probability distribution with phase as color:
    const baselineY = Number(theCanvas.height) / 3;
    theContext.lineWidth = 2;
    for (let x=0; x<=xMax; x++) {
        theContext.beginPath();
        theContext.moveTo(x, baselineY);
        theContext.lineTo(x, 2 * baselineY);
        const localPhase = (k*x - omega * t + phaseOffset) % (2 * Math.PI);
        theContext.strokeStyle = phaseColor[Math.round(localPhase * nColors / (2 * Math.PI))];
        theContext.stroke();
    }
}

function paintCanvas() {
    theContext.fillStyle = "black";
    theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

    const k = Number(momentumSlider.value);
    const omega = k * k / 2;
    if (t > 0)
        t = omega === 0 ? 100 : -t * 20 * Math.PI / omega;	// arbitrary number of full cycles

    theContext.fillStyle = "gray";
    theContext.font = "14px monospace";
    theContext.fillText("ωt = " + Number(omega * -t).toFixed(2), 5, theCanvas.height-5);

    if (realImag.checked)
        plotRealImag(k, omega, t);
    else
        plotDensityPhase(k, omega, t);
}

document.getElementById("pauseButton").addEventListener("click", () => {
    running = !running;
    if (running)
        pauseButton.innerHTML = "Pause";
    else
        pauseButton.innerHTML = "Resume";
    animate();
});


