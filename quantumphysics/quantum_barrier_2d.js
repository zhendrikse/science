import { toColorString } from "./2d-quantum-extensions.js";

// DOM elements:
const theCanvas = document.getElementById("barrierCanvas2D");
const theContext = theCanvas.getContext("2d");
const leftPercent = document.getElementById("leftPercent");
const rightPercent = document.getElementById("rightPercent");
const pauseButton = document.getElementById("pauseButton");
const speedSlider = document.getElementById("speedSlider");
const realImag = document.getElementById("realImag");
const gridCheck = document.getElementById("gridCheck");
const wpEnergySlider = document.getElementById("wpEnergySlider");
const wpEnergyReadout = document.getElementById("wpEnergyReadout");
const barrierEnergySlider = document.getElementById("barrierEnergySlider");
const barrierEnergyReadout = document.getElementById("barrierEnergyReadout");
const barrierWidthSlider = document.getElementById("barrierWidthSlider");
const barrierWidthReadout = document.getElementById("barrierWidthReadout");
const widthOrStep = document.getElementById("widthOrStep");
const barrierRampSlider = document.getElementById("barrierRampSlider");
const barrierRampReadout = document.getElementById("barrierRampReadout");
//var debug = document.getElementById("debug");

gridCheck.addEventListener("change", paintCanvas);
realImag.addEventListener("change", paintCanvas);
document.getElementById("resetButton").addEventListener("click", reset);
wpEnergySlider.addEventListener("input", wpEnergyAdjust);
barrierEnergySlider.addEventListener("input", barrierAdjust);
barrierRampSlider.addEventListener("input", barrierAdjust);
barrierWidthSlider.addEventListener("input", barrierAdjust);

// Other global variables:
var xMax = Number(theCanvas.width);
var cHeight = Number(theCanvas.height);
var pWidth = 49;	// initial wavepacket width (chosen so uncertainty in energy always rounds to at least 0.001)
var psi = {re:(new Array(xMax+1)), im:(new Array(xMax+1))}
var psiLast = {re:(new Array(xMax+1)), im:(new Array(xMax+1))}
var psiNext = {re:(new Array(xMax+1)), im:(new Array(xMax+1))}
psiNext.re[0] = psiNext.re[xMax] = psiNext.im[0] = psiNext.im[xMax] = 0.0;
var v = new Array(xMax+1);
var nColors = 360;
var phaseColor = new Array(nColors+1);
for (let c=0; c<=nColors; c++) {
	phaseColor[c] = toColorString(c/nColors);		// initialize array of colors
}
var nBarrierShades = 100;
var plusBarrierShade = new Array(nBarrierShades+1);
var minusBarrierShade = new Array(nBarrierShades+1);
for (let c=0; c<=nBarrierShades; c++) {
	plusBarrierShade[c] = "hsl(0,0%," + Math.round(12 + 40*c/nBarrierShades) + "%)";
	minusBarrierShade[c] = "hsl(240,15%," + Math.round(14 + 40*c/nBarrierShades) + "%)";
}
let bEmax = Number(barrierEnergySlider.max);
let bEmin = Number(barrierEnergySlider.min);
const dt = 0.45;		// anything less than 0.50 seems to be stable
let running = false;
barrierAdjust();
reset();

// Respond to user clicking Run/Pause/Resume button:
pauseButton.addEventListener("click", () => {
	running = !running;
	console.log("running:", running);
	if (running) {
		pauseButton.innerHTML = "Pause";
		nextFrame();
	} else 
		pauseButton.innerHTML = "Resume";
});

// Respond to user adjusting wavepacket energy:
function wpEnergyAdjust() {
	var energy = Number(wpEnergySlider.value);
	var a = 1 / (pWidth * pWidth);						// so envelope is exp(-ax^2)
	var sigma = Math.sqrt(2*energy*a + a*a/2) + a/2;	// uncertainty in energy (more or less)
	// The square root term is the actual sigma and dominates for most energy values; 
	// the a/2 term is the offset between the k^2/2 and the actual average energy.
	wpEnergyReadout.innerHTML = Number(energy).toFixed(3) + " &plusmn; " + Number(sigma).toFixed(3);
	if (!running) reset();
}

// Respond to user adjusting barrier energy or width:
function barrierAdjust() {
	var bEnergy = Number(barrierEnergySlider.value);
	var bWidth = Number(barrierWidthSlider.value);
	var bRamp = Number(barrierRampSlider.value);
	barrierEnergyReadout.innerHTML = bEnergy.toFixed(3).replace("-","&minus;");
	barrierRampReadout.innerHTML = bRamp;
	for (var x=0; x<=xMax; x++) {
		v[x] = 0.0;
	}
	if (bWidth < 51) {
		widthOrStep.innerHTML = "Width =";
		barrierWidthReadout.innerHTML = bWidth;
		var barrierLeft = Math.round((xMax-bWidth)/2);
		for (var x=barrierLeft; x<barrierLeft+bWidth; x++)
			v[x] = bEnergy;
		
		for (var dx=1; dx<=bRamp; dx++) {
			v[barrierLeft-dx] = bEnergy * (1 - dx / (bRamp+1));
			v[barrierLeft+bWidth+dx-1] = bEnergy * (1 - dx / (bRamp+1));
		}
	} else {
		widthOrStep.innerHTML = "Step";
		barrierWidthReadout.innerHTML = "";
		var barrierLeft = Math.round((xMax+bRamp)/2);
		for (var x=barrierLeft; x<=xMax; x++) {
			v[x] = bEnergy;
		}
		for (var dx=1; dx<=bRamp; dx++) {
			v[barrierLeft-dx] = bEnergy * (1 - dx / (bRamp+1));
		}
	}
	paintCanvas();
}

// Calculate and draw the next animation frame:
function nextFrame() {
	if (!running) return;

	const stepsPerFrame = Number(speedSlider.value);
	for (var step=0; step<stepsPerFrame; step++) doStep();
	paintCanvas();
	requestAnimationFrame(nextFrame);
}

// Integrate the TDSE for a single time step (leapfrog algorithm):
function doStep() {
	for (var x=1; x<xMax; x++) {
		psiNext.re[x] = psiLast.re[x] + dt * (-psi.im[x+1] - psi.im[x-1] + 2*(1+v[x])*psi.im[x]);
		psiNext.im[x] = psiLast.im[x] - dt * (-psi.re[x+1] - psi.re[x-1] + 2*(1+v[x])*psi.re[x]);
	}
	for (var x=1; x<xMax; x++) {	// now copy current to past, future to current
		psiLast.re[x] = psi.re[x];
		psiLast.im[x] = psi.im[x];
		psi.re[x] = psiNext.re[x];
		psi.im[x] = psiNext.im[x];
	}
}

// Initialize the wavefunction to a Gaussian wavepacket:
function reset() {
	for (var x=0; x<=xMax; x++) {
		var center = 150;
		var packetE = Number(wpEnergySlider.value);
		var k = Math.sqrt(2*packetE);
		for (var x=0; x<=xMax; x++) {
			var envelope = Math.exp(-(x-center)*(x-center)/(pWidth*pWidth));
			psi.re[x] = envelope * Math.cos(k*x);	// set current wavefunction values
			psi.im[x] = envelope * Math.sin(k*x);
		}
		for (var x=1; x<xMax; x++) {	// integrate backwards to get past wavefunction values
			psiLast.re[x] = psi.re[x] - 0.5*dt * (-psi.im[x+1] - psi.im[x-1] + 2*(1+v[x])*psi.im[x]);
			psiLast.im[x] = psi.im[x] + 0.5*dt * (-psi.re[x+1] - psi.re[x-1] + 2*(1+v[x])*psi.re[x]);
		}
	}
	paintCanvas();
	if (!running) pauseButton.innerHTML = "Run";
}

// Draw the canvas:
function paintCanvas() {
	theContext.fillStyle = "black";
	theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

	theContext.lineWidth = 2;
	for (var x=1; x<xMax; x++) {
		if (v[x] != 0) {
			if (v[x] > 0) 
				theContext.strokeStyle = plusBarrierShade[Math.round(nBarrierShades*v[x]/bEmax)];
			else
				theContext.strokeStyle = minusBarrierShade[Math.round(nBarrierShades*v[x]/bEmin)];

			theContext.beginPath();
			theContext.moveTo(x, 0);
			theContext.lineTo(x, theCanvas.height);		// not optimized
			theContext.stroke();
		}
	}
	
	var baselineY, pxPerY, gridBase, gridOffset;
	var delta = 20;		// grid spacing in pixels

	if (realImag.checked) {
		baselineY = cHeight * 0.5;
		gridBase = cHeight;
		gridOffset = (cHeight/2) % delta;	// lowest horizontal grid line is this far above bottom
		pxPerY = baselineY * 0.8;

		// Draw the horizontal axis:
		theContext.strokeStyle = "#c0c0c0";
		theContext.lineWidth = 1;
		theContext.beginPath();
		theContext.moveTo(0, baselineY);
		theContext.lineTo(xMax, baselineY);
		theContext.stroke();

		theContext.lineWidth = 2;

		// Plot the real part of psi:
		theContext.beginPath();
		theContext.moveTo(0, baselineY - psi.re[0]*pxPerY);
		for (var x=1; x<=xMax; x++) 
			theContext.lineTo(x, baselineY - psi.re[x]*pxPerY);
		
		theContext.strokeStyle = "#ffc000";
		theContext.stroke();

		// Plot the imaginary part of psi:
		theContext.beginPath();
		theContext.moveTo(0, baselineY - psi.im[0]*pxPerY);
		for (var x=1; x<=xMax; x++) 
			theContext.lineTo(x, baselineY - psi.im[x]*pxPerY);
		
		theContext.strokeStyle = "#00d0ff";
		theContext.stroke();

	} else {	// "Density/phase" is checked

		// Plot the probability distribution with phase as color:
		baselineY = cHeight * 0.93;
		gridBase = baselineY;
		gridOffset = delta;
		pxPerY = baselineY * 0.55;

		// Draw the horizontal axis:
		theContext.strokeStyle = "#c0c0c0";
		theContext.lineWidth = 1;
		theContext.beginPath();
		theContext.moveTo(0, baselineY);
		theContext.lineTo(xMax, baselineY);
		theContext.stroke();

		theContext.lineWidth = 2;
		for (var x=0; x<=xMax; x++) {
			theContext.beginPath();
			theContext.moveTo(x, baselineY);
			theContext.lineTo(x, baselineY - pxPerY*(psi.re[x]*psi.re[x] + psi.im[x]*psi.im[x]));
			var localPhase = Math.atan2(psi.im[x], psi.re[x]);
			if (localPhase < 0) localPhase += 2*Math.PI;
			theContext.strokeStyle = phaseColor[Math.round(localPhase * nColors / (2*Math.PI))];
			theContext.stroke();
		}
	}

	if (gridCheck.checked) {
		theContext.strokeStyle = "hsl(0,0%,60%)";
		theContext.lineWidth = 1;
		for (var x=delta; x<xMax; x+=delta) {	// draw vertical grid lines
			theContext.beginPath();
			theContext.moveTo(x, 0);
			theContext.lineTo(x, gridBase);
			theContext.stroke();
		}
		for (var y=gridBase-gridOffset; y>0; y-=delta) {	// draw horizontal grid lines
			theContext.beginPath();
			theContext.moveTo(0, y);
			theContext.lineTo(xMax, y);
			theContext.stroke();
		}
	}

	// Calculate and show left/right percentages:
	var leftIntegral = 0.0;
	var rightIntegral = 0.0;
	for (var x=0; x<xMax/2; x++) leftIntegral += psi.re[x]*psi.re[x] + psi.im[x]*psi.im[x];
	for (var x=(xMax/2)+1; x<=xMax; x++) rightIntegral += psi.re[x]*psi.re[x] + psi.im[x]*psi.im[x];
	var mid = psi.re[xMax/2]*psi.re[xMax/2] + psi.im[xMax/2]*psi.im[xMax/2];
	leftIntegral += mid/2;
	rightIntegral += mid/2;	// middle value gets split 50-50 between left and right
	leftPercent.innerHTML = Number(100*leftIntegral/(leftIntegral+rightIntegral)).toFixed(1) + "%";
	rightPercent.innerHTML = Number(100*rightIntegral/(leftIntegral+rightIntegral)).toFixed(1) + "%";
}
