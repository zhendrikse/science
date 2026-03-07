<!DOCTYPE html>

<!--
	Quantum Barrier Scattering, copyright 2014, Daniel V. Schroeder
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of 
	this software and associated data and documentation (the "Software"), to deal in 
	the Software without restriction, including without limitation the rights to 
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
	of the Software, and to permit persons to whom the Software is furnished to do 
	so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all 
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
	INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
	PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR 
	ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
	OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
	OTHER DEALINGS IN THE SOFTWARE.

	Except as contained in this notice, the name of the author shall not be used in 
	advertising or otherwise to promote the sale, use or other dealings in this 
	Software without prior written authorization.

	10 December 2014: Original version (based on earlier versions in Java and Pascal)
	13 December 2014: Added percentage readouts, energy uncertainty, and variable barrier color
	20 December 2014: Added step and ramp features
	24 December 2014: Added grid
-->

<html>

<head>
	<meta charset="utf-8">
	<title>Quantum Barrier Scattering</title>
	<style>
	.custombutton {		/* this class turns an ordinary link into a nice attractive push-button */
		display: inline-block; 
		width:92px; 
		height:24px; 
		line-height:24px; 
		font-size:15px; 
		font-family:Arial, sans-serif; 
		text-align:center;
		color:black; 
		background:-webkit-linear-gradient(white,#eeeeee,#eeeeee,#e0e0e0);
		background:linear-gradient(white,#eeeeee,#eeeeee,#e0e0e0);
		text-decoration:none; 
		border:1px solid gray; 
		border-radius: 5px;
		-webkit-user-select: none;
		-moz-user-select: -moz-none;
		-ms-user-select: none;
		user-select: none;
		cursor: pointer;
		-webkit-tap-highlight-color: rgba(0,0,0,0);
	}
	.custombutton:active {
		background:-webkit-linear-gradient(#909090,#808080,#808080,#707070);
		background:linear-gradient(#909090,#808080,#808080,#707070);
	}
	input[type="range"] {
	  width: 140px;
	  padding: 0px;
	  -webkit-user-select: none;
	  user-select: none;
	}
	input[type="range"]::-ms-tooltip {
	  display: none;       /* hide readout in IE */
	}
	input[type="range"]::-ms-track {
	  color: transparent;  /* hide tick marks in IE */
	}	
	sup {position:relative; vertical-align:bottom; bottom:0.4em; font-size:0.75em;}
	</style>
</head>

<body style="background-color:#d0d0d0; font-family:sans-serif; font-size:15px; line-height:18px;">

<div style="width:720px; margin-left:auto; margin-right:auto;">

	<h1 style="font-size:18pt; text-align:center; margin-bottom:10px;">Quantum Barrier Scattering</h1>

	<div style="position:relative;">
		<div id="leftPercent" style="position:absolute; bottom:0; z-index:2; color:#b8b8b8; margin:5px; font-family:monospace">100.0%</div>
		<div id="rightPercent" style="position:absolute; bottom:0; right:0; z-index:2; color:#b8b8b8; margin:5px; font-family:monospace;">0.0%</div>
		<canvas id="theCanvas" width="720" height="300" style="position:relative; z-index:1;">Canvas not supported! Please update your browser.</canvas>
	</div>

	<div style="text-align:center; -webkit-text-size-adjust: 100%;">
		<a href="javascript:void(0)" class="custombutton" id="pauseButton" 
				onclick="startStop();" ontouchstart="">Run</a>
		&nbsp;Speed:
		<input type="range" id="speedSlider" min="1" max="100" step="1" value="20">
		&nbsp
		<input type="radio" name="plotType" id="realImag" onclick="paintCanvas();">Real/imag&nbsp;
		<input type="radio" name="plotType" checked onclick="paintCanvas();">Density/phase&nbsp;&nbsp;
		<input type="checkbox" id="gridCheck" onclick="paintCanvas();">Grid
	</div>
	<div style="text-align:center; margin-top:3px; -webkit-text-size-adjust: 100%;">
		<a href="javascript:void(0)" class="custombutton" id="resetButton"
				onclick="reset();" ontouchstart="">Reset</a>
		&nbsp;Wavepacket energy = <span id="wpEnergyReadout">0.030 &plusmn; 0.005</span>
		<input type="range" id="wpEnergySlider" min="0" max="0.100" step="0.001" value="0.030"
				onchange="wpEnergyAdjust();" oninput="wpEnergyAdjust();">
	</div>
	<div style="text-align:center; margin-top:3px; -webkit-text-size-adjust: 100%;">
		Barrier energy = 
		<span id="barrierEnergyReadout" style="display:inline-block; width:3.1em; text-align:right;">0.030</span>
		<input type="range" id="barrierEnergySlider" min="-0.1" max="0.1" step="0.001" value="0.040"
				onchange="barrierAdjust();" oninput="barrierAdjust();">
		&nbsp;&nbsp;
		<span id="widthOrStep" style="display:inline-block; width:3.5em; text-align:right;">Width =</span>
		<span id="barrierWidthReadout" style="display:inline-block; width:1.1em; text-align:right;">20</span>
		<input type="range" id="barrierWidthSlider" min="0" max="51" step="1" value="10"
				style="width:80px;" onchange="barrierAdjust();" oninput="barrierAdjust();">
		&nbsp;&nbsp;Ramp = 
		<span id="barrierRampReadout" style="display:inline-block; width:1.1em; text-align:right;">0</span>
		<input type="range" id="barrierRampSlider" min="0" max="50" step="1" value="0"
				style="width:80px;" onchange="barrierAdjust();" oninput="barrierAdjust();">
	</div>
	<div id="debug"></div>

	<p>This simulation shows a quantum mechanical wavepacket hitting a barrier. You can adjust
	the wavepacket&rsquo;s nominal energy, the barrier energy, the barrier width, and the width
	of a &ldquo;ramp&rdquo; on either side of the barrier, to see how these affect
	the amount of the wavepacket that gets through (i.e., the tunneling probability). Drag the
	width slider all the way to the right to make a step instead of a barrier.</p>
	
	<p>The wavefunction is always zero at the edges of the image, so the quantum particle is
	effectively trapped in an infinitely deep potential well. Thus, when the wavepacket hits
	the edges, it will reflect off of them.</p>
	
	<p>You can plot either the real and imaginary parts of
	the wavefunction (shown in orange and blue, respectively), or the probability density and phase, 
	with the phase represented by hues going from
	red (pure real and positive) to light green (pure imaginary and positive) to cyan (pure real
	and negative) to purple (pure imaginary and negative) and finally back to red.</p>

	<p>Play with the simulation for a while, then try to predict what will happen when you change
	the various settings. How does the wavepacket behave when there is no barrier at all? How can
	you tell, when the simulation is paused, whether the wavepacket is moving to the left or right?
	How does the wavelength within the packet vary as you change its energy? Under what conditions
	will most of the wavepacket make it through the barrier? In what ways does the wavepacket behave
	like a classical particle?</p>

	<p>Technical details: The simulation works by solving a discretized version of the time-dependent 
	Schr&ouml;dinger equation, as you can see by looking at the source code.
	Distances are measured in units of nominal screen pixels, and the grid
	spacing is 20 pixels. Other units
	are determined by setting h-bar and the particle mass to 1. This is a nonrelativistic particle,
	so its kinetic energy is <i>p</i><sup>2</sup>/2<i>m</i>. From this formula and the 
	<a href="http://en.wikipedia.org/wiki/Matter_wave">de Broglie 
	relation</a> you can figure out how the energy of a wavefunction is related to its wavelength.
	A wavepacket is actually a mixture that includes a range of energies, so the uncertainty
	(standard deviation) in the energy is displayed next to the energy slider.
	Notice also that the phase velocity (of the individual waves within the wavepacket) differs
	from the group velocity (of the packet as a whole).
	</p>

	<p>By <a href="http://physics.weber.edu/schroeder/">Daniel V. Schroeder</a>, 
	<a href="http://physics.weber.edu/">Physics Dept.</a>, 
	<a href="http://weber.edu">Weber State University</a></p>

	<p>See PhET&rsquo;s <a href="http://phet.colorado.edu/en/simulation/quantum-tunneling">Quantum
	Tunneling and Wave Packets</a> for a similar simulation with some more useful features.</p>

	<p><a href="http://physics.weber.edu/schroeder/software/">More physics software</a></p>
</div>

<script>

	// DOM elements:
	var theCanvas = document.getElementById("theCanvas");
	var theContext = theCanvas.getContext("2d");
	var leftPercent = document.getElementById("leftPercent");
	var rightPercent = document.getElementById("rightPercent");
	var pauseButton = document.getElementById("pauseButton");
	var speedSlider = document.getElementById("speedSlider");
	var realImag = document.getElementById("realImag");
	var gridCheck = document.getElementById("gridCheck");
	var wpEnergySlider = document.getElementById("wpEnergySlider");
	var wpEnergyReadout = document.getElementById("wpEnergyReadout");
	var barrierEnergySlider = document.getElementById("barrierEnergySlider");
	var barrierEnergyReadout = document.getElementById("barrierEnergyReadout");
	var barrierWidthSlider = document.getElementById("barrierWidthSlider");
	var barrierWidthReadout = document.getElementById("barrierWidthReadout");
	var widthOrStep = document.getElementById("widthOrStep");
	var barrierRampSlider = document.getElementById("barrierRampSlider");
	var barrierRampReadout = document.getElementById("barrierRampReadout");
	//var debug = document.getElementById("debug");

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
	for (var c=0; c<=nColors; c++) {
		phaseColor[c] = colorString(c/nColors);		// initialize array of colors
	}
	var nBarrierShades = 100;
	var plusBarrierShade = new Array(nBarrierShades+1);
	var minusBarrierShade = new Array(nBarrierShades+1);
	for (var c=0; c<=nBarrierShades; c++) {
		plusBarrierShade[c] = "hsl(0,0%," + Math.round(12 + 40*c/nBarrierShades) + "%)";
		minusBarrierShade[c] = "hsl(240,15%," + Math.round(14 + 40*c/nBarrierShades) + "%)";
	}
	var bEmax = Number(barrierEnergySlider.max);
	var bEmin = Number(barrierEnergySlider.min);
	var dt = 0.45;		// anything less than 0.50 seems to be stable
	var running = false;
	barrierAdjust();
	reset();

	// Respond to user clicking Run/Pause/Resume button:
	function startStop() {
		running = !running;
		if (running) {
			pauseButton.innerHTML = "Pause";
			nextFrame();
		} else {
			pauseButton.innerHTML = "Resume";
		}
	}

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
			for (var x=barrierLeft; x<barrierLeft+bWidth; x++) {
				v[x] = bEnergy;
			}
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
		debug.innerHTML = "";	// better test it
		/*for (var x=(xMax/2)-80; x<(xMax/2)+80; x++) {
			debug.innerHTML += Number(v[x]).toFixed(4) + " ";
		}*/
	}

	// Calculate and draw the next animation frame:
	function nextFrame() {
		if (running) {
			stepsPerFrame = Number(speedSlider.value);
			for (var step=0; step<stepsPerFrame; step++) doStep();
			paintCanvas();
			window.setTimeout(nextFrame, 1000/40);	// schedule the next frame, 40 fps
		}
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
				if (v[x] > 0) {
					theContext.strokeStyle = plusBarrierShade[Math.round(nBarrierShades*v[x]/bEmax)];
				} else {
					theContext.strokeStyle = minusBarrierShade[Math.round(nBarrierShades*v[x]/bEmin)];
				}
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
			for (var x=1; x<=xMax; x++) {
				theContext.lineTo(x, baselineY - psi.re[x]*pxPerY);
			}
			theContext.strokeStyle = "#ffc000";
			theContext.stroke();

			// Plot the imaginary part of psi:
			theContext.beginPath();
			theContext.moveTo(0, baselineY - psi.im[0]*pxPerY);
			for (var x=1; x<=xMax; x++) {
				theContext.lineTo(x, baselineY - psi.im[x]*pxPerY);
			}
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

	// Utility function to convert a number to a two-digit hex string (from stackoverflow):
	function twoDigitHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	// Utility function to create a hex color string for a given hue (between 0 and 1):
	function colorString(hue) {
		var r, g, b;
		if (hue < 1/6) {
			r = 255; g = Math.round(hue*6*255); b = 0;			// red to yellow
		} else if (hue < 1/3) {
			r = Math.round((1/3 - hue)*6*255); g = 255; b = 0;	// yellow to green
		} else if (hue < 1/2) {
			r = 0; g = 255; b = Math.round((hue - 1/3)*6*255);	// green to cyan
		} else if (hue < 2/3) {
			r = 0; g = Math.round((2/3 - hue)*6*255); b = 255;	// cyan to blue
		} else if (hue < 5/6) {
			r = Math.round((hue - 2/3)*6*255); g = 0; b = 255;	// blue to magenta
		} else {
			r = 255; g = 0; b = Math.round((1 - hue)*6*255);	// magenta to red
		}
		return "#" + twoDigitHex(r) + twoDigitHex(g) + twoDigitHex(b);
	}

</script>

</body>

</html>