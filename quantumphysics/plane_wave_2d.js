import { toColorString } from "./2d-quantum-extensions.js";

var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
var pauseButton = document.getElementById("pauseButton");
var pSlider = document.getElementById("pSlider");
var realImag = document.getElementById("realImag");

var xMax = theCanvas.width;
var nColors = 360;
var phaseColor = new Array(nColors+1);
var running = true;
var phaseOffset = Math.ceil((pSlider.max*theCanvas.width) / (2*Math.PI)) * 2*Math.PI;
var t = 0;	// time

init();
nextFrame();

function init() {
    // Initialize array of colors to represent phases:
    for (let c=0; c<=nColors; c++) {
        phaseColor[c] = toColorString(c/nColors);
    }
}

function nextFrame() {
    t += 30;
    paintCanvas();
    if (running) window.setTimeout(nextFrame, 1000/30);
}

function paintCanvas() {
    theContext.fillStyle = "black";
    theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

    var baselineY
    var k = Number(pSlider.value);
    var omega = k*k/2;
    if (t > 0) {
        if (omega === 0) {
            t = -100;		// arbitrary negative value
         } else {
             t -= 20*Math.PI/omega;	// arbitrary number of full cycles
         }
    }

    var omegat = omega * t;

    //theContext.fillStyle = "gray";
    //theContext.font = "14px monospace";
    //theContext.fillText(Number(omegat).toFixed(2), 5, theCanvas.height-5);

    if (realImag.checked) {
        baselineY = Number(theCanvas.height) / 2;
        var pxPerY = baselineY * 0.6;

        // Draw the horizontal axis:
        theContext.strokeStyle = "gray";
        theContext.lineWidth = 1;
        theContext.beginPath();
        theContext.moveTo(0, baselineY);
        theContext.lineTo(xMax, baselineY);
        theContext.stroke();

        theContext.lineWidth = 2;

        // Plot the real part of psi:
        theContext.beginPath();
        theContext.moveTo(0, baselineY - Math.cos(0-omegat)*pxPerY);
        for (var x=1; x<=xMax; x++) {
            theContext.lineTo(x, baselineY - Math.cos(k*x-omegat)*pxPerY);
        }

        theContext.strokeStyle = "#ffc000";
        theContext.stroke();

        // Plot the imaginary part of psi:
        theContext.beginPath();
        theContext.moveTo(0, baselineY - Math.sin(0-omegat)*pxPerY);
        for (var x=1; x<=xMax; x++) {
            theContext.lineTo(x, baselineY - Math.sin(k*x-omegat)*pxPerY);
        }
        theContext.strokeStyle = "#00d0ff";
        theContext.stroke();

        } else {	// "Density/phase" is checked
            // Plot the probability distribution with phase as color:
            baselineY = Number(theCanvas.height) / 3;
            theContext.lineWidth = 2;
            for (var x=0; x<=xMax; x++) {
            theContext.beginPath();
            theContext.moveTo(x, baselineY);
            theContext.lineTo(x, 2*baselineY);
            var localPhase = (k*x - omegat + phaseOffset) % (2*Math.PI);
            theContext.strokeStyle = phaseColor[Math.round(localPhase * nColors / (2*Math.PI))];
            theContext.stroke();
        }
    }
}

function startStop() {
    running = !running;
    if (running) {
        pauseButton.innerHTML = "Pause";
        nextFrame();
    } else {
        pauseButton.innerHTML = "Resume";
    }
}
