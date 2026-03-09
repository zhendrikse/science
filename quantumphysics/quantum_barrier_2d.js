import { toColorString, WavePacket, WavePacketDisplay, Complex } from "./2d-quantum-extensions.js";

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

gridCheck.addEventListener("change", paintCanvas);
realImag.addEventListener("change", paintCanvas);
document.getElementById("resetButton").addEventListener("click", reset);
wpEnergySlider.addEventListener("input", wpEnergyAdjust);
barrierEnergySlider.addEventListener("input", barrierAdjust);
barrierRampSlider.addEventListener("input", barrierAdjust);
barrierWidthSlider.addEventListener("input", barrierAdjust);

// Other global variables:
let xMax = Number(theCanvas.clientWidth);
let cHeight = Number(theCanvas.clientHeight);

const display = new WavePacketDisplay();

const pWidth = 49;	// initial wavepacket width (chosen so uncertainty in energy always rounds to at least 0.001)
const v = new Float32Array(xMax + 1);
const nColors = 360;
const phaseColor = new Array(nColors + 1);
for (let c = 0; c <= nColors; c++)
	phaseColor[c] = toColorString(c / nColors);		// initialize array of colors

const nBarrierShades = 100;
const plusBarrierShade = new Array(nBarrierShades + 1);
const minusBarrierShade = new Array(nBarrierShades + 1);
for (let c = 0; c <= nBarrierShades; c++) {
	plusBarrierShade[c] = "hsl(0,0%," + Math.round(12 + 40 * c / nBarrierShades) + "%)";
	minusBarrierShade[c] = "hsl(240,15%," + Math.round(14 + 40 * c / nBarrierShades) + "%)";
}
let bEmax = Number(barrierEnergySlider.max);
let bEmin = Number(barrierEnergySlider.min);
const dt = 0.45;		// anything less than 0.50 seems to be stable
let running = false;

const psi = new WavePacket(xMax, pWidth);

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
	const energy = Number(wpEnergySlider.value);
	const a = 1 / (pWidth * pWidth);						// so envelope is exp(-ax^2)
	const sigma = Math.sqrt(2 * energy * a + a * a / 2) + a / 2;	// uncertainty in energy (more or less)
	// The square root term is the actual sigma and dominates for most energy values; 
	// the a/2 term is the offset between the k^2/2 and the actual average energy.
	wpEnergyReadout.innerHTML = Number(energy).toFixed(3) + " &plusmn; " + Number(sigma).toFixed(3);
	if (!running) reset();
}

// Respond to user adjusting barrier energy or width:
function barrierAdjust() {
	const bEnergy = Number(barrierEnergySlider.value);
	const bWidth = Number(barrierWidthSlider.value);
	const bRamp = Number(barrierRampSlider.value);
	barrierEnergyReadout.innerHTML = bEnergy.toFixed(3).replace("-", "&minus;");
	barrierRampReadout.innerHTML = bRamp;
	for (let x = 0; x <= xMax; x++)
		v[x] = 0.0;

	if (bWidth < 51) {
		widthOrStep.innerHTML = "Width =";
		barrierWidthReadout.innerHTML = bWidth;
		const barrierLeft = Math.round((xMax - bWidth) / 2);
		for (let x = barrierLeft; x < barrierLeft + bWidth; x++)
			v[x] = bEnergy;

		for (let dx = 1; dx <= bRamp; dx++) {
			v[barrierLeft - dx] = bEnergy * (1 - dx / (bRamp + 1));
			v[barrierLeft + bWidth + dx - 1] = bEnergy * (1 - dx / (bRamp + 1));
		}
	} else {
		widthOrStep.innerHTML = "Step";
		barrierWidthReadout.innerHTML = "";
		const barrierLeft = Math.round((xMax + bRamp) / 2);
		for (let x = barrierLeft; x <= xMax; x++)
			v[x] = bEnergy;
		for (let dx = 1; dx <= bRamp; dx++)
			v[barrierLeft - dx] = bEnergy * (1 - dx / (bRamp + 1));
	}
	paintCanvas(psi);
}

// Calculate and draw the next animation frame:
function nextFrame() {
	if (!running) return;

	const stepsPerFrame = Number(speedSlider.value);
	for (let step = 0; step < stepsPerFrame; step++) 
		psi.step(dt, v);
	paintCanvas(psi);
	requestAnimationFrame(nextFrame);
}


// Initialize the wavefunction to a Gaussian wavepacket:
function reset() {
	psi.reset(Number(wpEnergySlider.value), dt, v);
	paintCanvas(psi);
	if (!running) pauseButton.innerHTML = "Run";
}

// Draw the canvas:
function paintCanvas(psi) {
	theContext.fillRect(0, 0, xMax, cHeight);
	theContext.lineWidth = 2;

	for (let x = 1; x < xMax; x++) {
		if (v[x] === 0) continue;

		if (v[x] > 0)
			theContext.strokeStyle = plusBarrierShade[Math.round(nBarrierShades * v[x] / bEmax)];
		else
			theContext.strokeStyle = minusBarrierShade[Math.round(nBarrierShades * v[x] / bEmin)];

		theContext.beginPath();
		theContext.moveTo(x, 0);
		theContext.lineTo(x, cHeight);		// not optimized
		theContext.stroke();
	}

	var baselineY, pxPerY, gridBase, gridOffset;
	const delta = 20;		// grid spacing in pixels

	if (realImag.checked) {
		baselineY = cHeight * 0.5;
		gridBase = cHeight;
		gridOffset = (cHeight / 2) % delta;	// lowest horizontal grid line is this far above bottom
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
		theContext.moveTo(0, baselineY - psi.re[0] * pxPerY);
		for (let x = 1; x <= xMax; x++)
			theContext.lineTo(x, baselineY - psi.re[x] * pxPerY);

		theContext.strokeStyle = "#ffc000";
		theContext.stroke();

		// Plot the imaginary part of psi:
		theContext.beginPath();
		theContext.moveTo(0, baselineY - psi.im[0] * pxPerY);
		for (let x = 1; x <= xMax; x++)
			theContext.lineTo(x, baselineY - psi.im[x] * pxPerY);

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
		for (let x = 0; x <= xMax; x++) {
			theContext.beginPath();
			theContext.moveTo(x, baselineY);
			theContext.lineTo(x, baselineY - pxPerY * psi.squaredAt(x));
			let localPhase = psi.phaseAt(x);
			if (localPhase < 0) localPhase += 2 * Math.PI;
			theContext.strokeStyle = phaseColor[Math.round(localPhase * nColors / (2 * Math.PI))];
			theContext.stroke();
		}
	}

	if (gridCheck.checked) {
		theContext.strokeStyle = "hsl(0,0%,60%)";
		theContext.lineWidth = 1;
		for (let x = delta; x < xMax; x += delta) {	// draw vertical grid lines
			theContext.beginPath();
			theContext.moveTo(x, 0);
			theContext.lineTo(x, gridBase);
			theContext.stroke();
		}
		for (let y = gridBase - gridOffset; y > 0; y -= delta) {	// draw horizontal grid lines
			theContext.beginPath();
			theContext.moveTo(0, y);
			theContext.lineTo(xMax, y);
			theContext.stroke();
		}
	}

	// Calculate and show left/right percentages:
	let leftIntegral = 0.0;
	let rightIntegral = 0.0;
	for (let x = 0; x < xMax / 2; x++) leftIntegral += psi.re[x] * psi.re[x] + psi.im[x] * psi.im[x];
	for (let x = (xMax / 2) + 1; x <= xMax; x++) rightIntegral += psi.re[x] * psi.re[x] + psi.im[x] * psi.im[x];
	const mid = psi.re[xMax / 2] * psi.re[xMax / 2] + psi.im[xMax / 2] * psi.im[xMax / 2];
	leftIntegral += mid / 2;
	rightIntegral += mid / 2;	// middle value gets split 50-50 between left and right
	leftPercent.innerHTML = Number(100 * leftIntegral / (leftIntegral + rightIntegral)).toFixed(1) + "%";
	rightPercent.innerHTML = Number(100 * rightIntegral / (leftIntegral + rightIntegral)).toFixed(1) + "%";
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

	// initPhysics();
	//display.paintCanvas(psi, realImag.checked);
	paintCanvas(psi);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
