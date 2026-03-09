import { toColorString, WavePacket, WavePacketDisplay, Complex } from "./2d-quantum-extensions.js";

// DOM elements:
const theCanvas = document.getElementById("barrierCanvas2D");
const theContext = theCanvas.getContext("2d");
theContext.fillStyle = "transparent";
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

// Other global variables:
let xMax = Number(theCanvas.clientWidth);
let cHeight = Number(theCanvas.clientHeight);

let bEmax = Number(barrierEnergySlider.max);
let bEmin = Number(barrierEnergySlider.min);
const dt = 0.45;		// anything less than 0.50 seems to be stable
let running = false;

const pWidth = 49;	// initial wavepacket width (chosen so uncertainty in energy always rounds to at least 0.001)
const v = new Float32Array(xMax + 1);
const psi = new WavePacket(xMax, pWidth);

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

class Display extends WavePacketDisplay {
	constructor(context, xMax, cHeight) {
		super(context, xMax, cHeight);
		this._nBarrierShades = 100;
		this._plusBarrierShade = new Array(this._nBarrierShades + 1);
		this._minusBarrierShade = new Array(this._nBarrierShades + 1);
		for (let c = 0; c <= this._nBarrierShades; c++) {
			this._plusBarrierShade[c] = "hsl(0,0%," + Math.round(12 + 40 * c / this._nBarrierShades) + "%)";
			this._minusBarrierShade[c] = "hsl(240,15%," + Math.round(14 + 40 * c / this._nBarrierShades) + "%)";
		}
	}

	_drawBarrier(v) {
		for (let x = 1; x < this._xMax; x++) {
			if (v[x] === 0) continue;

			if (v[x] > 0)
				this._context.strokeStyle = this._plusBarrierShade[Math.round(this._nBarrierShades * v[x] / bEmax)];
			else
				this._context.strokeStyle = this._minusBarrierShade[Math.round(this._nBarrierShades * v[x] / bEmin)];

			this._context.beginPath();
			this._context.moveTo(x, 0);
			this._context.lineTo(x, this._canvasHeight);		// not optimized
			this._context.stroke();
		}
	}

	_showLeftRightPercentages(psi) {
		let leftIntegral = 0.0;
		let rightIntegral = 0.0;
		for (let x = 0; x < this._xMax / 2; x++)
			leftIntegral += psi.squaredAt(x);
		for (let x = (this._xMax / 2) + 1; x <= this._xMax; x++)
			rightIntegral += psi.squaredAt(x);
		const mid = psi.squaredAt(this._xMax / 2);
		leftIntegral += mid / 2;
		rightIntegral += mid / 2;	// middle value gets split 50-50 between left and right
		leftPercent.innerHTML = Number(100 * leftIntegral / (leftIntegral + rightIntegral)).toFixed(1) + "%";
		rightPercent.innerHTML = Number(100 * rightIntegral / (leftIntegral + rightIntegral)).toFixed(1) + "%";
	}

	paintCanvas(psi, v) {
		this._context.fillRect(0, 0, this._xMax, this._canvasHeight);
		this._context.lineWidth = 2;
		this._drawBarrier(v);

		const delta = 20;		// grid spacing in pixels
		const baselineY = realImag.checked ? cHeight * 0.5 : cHeight * 0.93;
		const gridBase = realImag.checked ? cHeight : baselineY;
		const gridOffset = realImag.checked ? (cHeight / 2) % delta : delta;

		display._drawHorizontalAxis(this._xMax, baselineY);
		if (realImag.checked)
			display._plotRealImaginary(psi, baselineY);
		else
			display._plotDensityPhase(psi, baselineY);

		if (gridCheck.checked)
			display._drawGrid(this._xMax, delta, gridBase, gridOffset);

		this._showLeftRightPercentages(psi);
	}
}
const display = new Display(theContext, xMax, cHeight);

// Calculate and draw the next animation frame:
function nextFrame() {
	if (!running) return;

	const stepsPerFrame = Number(speedSlider.value);
	for (let step = 0; step < stepsPerFrame; step++)
		psi.step(dt, v);
	display.paintCanvas(psi, v);
	requestAnimationFrame(nextFrame);
}


// Initialize the wavefunction to a Gaussian wavepacket:
function reset() {
	psi.reset(Number(wpEnergySlider.value), dt, v);
	display.paintCanvas(psi, v);
	if (!running) pauseButton.innerHTML = "Run";
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
	display.paintCanvas(psi, v);
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
	display.paintCanvas(psi, v);
}

gridCheck.addEventListener("change", () => display.paintCanvas(psi, v));
realImag.addEventListener("change", () => display.paintCanvas(psi, v));
document.getElementById("resetButton").addEventListener("click", reset);
wpEnergySlider.addEventListener("input", wpEnergyAdjust);
barrierEnergySlider.addEventListener("input", barrierAdjust);
barrierRampSlider.addEventListener("input", barrierAdjust);
barrierWidthSlider.addEventListener("input", barrierAdjust);
window.addEventListener("resize", resizeCanvas);
barrierAdjust();
reset();
resizeCanvas();
