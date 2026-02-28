// DOM elements:
var canvasDiv = document.getElementById("canvasDiv");
var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
var pauseButton = document.getElementById("pauseButton");
var speedSlider = document.getElementById("speedSlider");
var realImag = document.getElementById("realImag");
var gridCheck = document.getElementById("gridCheck");
var posSlider = document.getElementById("posSlider");
var heightSlider = document.getElementById("heightSlider");
var widthSlider = document.getElementById("widthSlider");
var momentumSlider = document.getElementById("momentumSlider");
//var debug = document.getElementById("debug");

// Other global variables:
var xMax = Number(theCanvas.width);
var cHeight = Number(theCanvas.height);
var psi = {re:(new Array(xMax+1)), im:(new Array(xMax+1))}
var psiLast = {re:(new Array(xMax+1)), im:(new Array(xMax+1))}
var psiNext = {re:(new Array(xMax+1)), im:(new Array(xMax+1))}
var psiTemp = {re:(new Array(xMax+1)), im:(new Array(xMax+1))}	// for potential next wavepacket
var nColors = 360;
var phaseColor = new Array(nColors+1);

for (var c=0; c<=nColors; c++) {
    phaseColor[c] = colorString(c/nColors);		// initialize array of colors
}

var dt = 0.45;		// anything less than 0.50 seems to be stable
var running = false;
var psiTempAlpha = 0.0;		// transparency level for drawing the potential next wavepacket
var psiTempTimer;			// timer to hide the potential next wavepacket
var psiTempParams = {};		// parameters of wavepacket being drawn by mouse/touch
var psiPixPerUnit = cHeight/3;	// scale for plotting psi (real and imag parts)
var plotMarginHeight = cHeight * 0.07;	// margin at bottom of density/phase plot
var psi2PixPerUnit = (cHeight - plotMarginHeight) * 0.55;	// scale for plotting psi squared

// Add mouse/touch handlers:
theCanvas.addEventListener('mousedown', mouseDown, false);
theCanvas.addEventListener('touchstart', touchStart, false);

// Start up the physics:
clearPsi();
setPsiTemp();
addPacket();
startStop();

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
        psiNext.re[x] = psiLast.re[x] + dt * (-psi.im[x+1] - psi.im[x-1] + 2*psi.im[x]);
        psiNext.im[x] = psiLast.im[x] - dt * (-psi.re[x+1] - psi.re[x-1] + 2*psi.re[x]);
    }
    for (var x=1; x<xMax; x++) {	// now copy current to past, future to current
        psiLast.re[x] = psi.re[x];
        psiLast.im[x] = psi.im[x];
        psi.re[x] = psiNext.re[x];
        psi.im[x] = psiNext.im[x];
    }
}

// Construct a new wavepacket, using either passed parameters or GUI settings:
function setPsiTemp(center, pHeight, pWidth, k) {
    if (center == undefined) {
    center = Number(posSlider.value);
    pHeight = Number(heightSlider.value);
    pWidth = Number(widthSlider.value);
    k = Number(momentumSlider.value);
}
    for (var x=1; x<xMax; x++) {
    var scaledX = (x - center) / pWidth;
    var envelope = pHeight * Math.exp(-scaledX*scaledX);
    psiTemp.re[x] = envelope * Math.cos(k*(x-center));	// add new wavepacket to existing wavefunction
    psiTemp.im[x] = envelope * Math.sin(k*(x-center));
}
    psiTemp.re[0] = psiTemp.im[0] = psiTemp.re[xMax] = psiTemp.im[xMax] = 0.0;
    psiTempAlpha = 0.5;
    window.clearTimeout(psiTempTimer);
    psiTempTimer = window.setTimeout(fadePsiTemp, 2000);
    paintCanvas();
}

    // Hide the potential next wavepacket (called from timer):
    function fadePsiTemp() {
    psiTempAlpha -= 0.005;
    if (psiTempAlpha < 0.005) {
    psiTempAlpha = 0.0;
} else {
    psiTempTimer = window.setTimeout(fadePsiTemp, 40);
}
    paintCanvas();
}

    // Add a new Gaussian wavepacket:
    function addPacket() {
    for (var x=0; x<=xMax; x++) {
    psi.re[x] += psiTemp.re[x];
    psi.im[x] += psiTemp.im[x];
}
    for (var x=1; x<xMax; x++) {	// integrate backwards to get previous wavefunction values
    psiLast.re[x] = psi.re[x] - 0.5*dt * (-psi.im[x+1] - psi.im[x-1] + 2*psi.im[x]);
    psiLast.im[x] = psi.im[x] + 0.5*dt * (-psi.re[x+1] - psi.re[x-1] + 2*psi.re[x]);
}
    psiTempAlpha = 0.0;
    paintCanvas();
    if (!running) pauseButton.innerHTML = "Run";
}

    // Set the wavefunction to zero:
    function clearPsi() {
    for (var x=0; x<=xMax; x++) {
    psi.re[x] = 0.0;
    psi.im[x] = 0.0;
    psiLast.re[x] = 0.0;
    psiLast.im[x] = 0.0;
}
    paintCanvas();
}

    // Mouse/touch interaction code:
    function mouseDown(e) {
    mouseOrTouchStart(e.pageX, e.pageY, e, false);
}
    function touchStart(e) {
    mouseOrTouchStart(e.targetTouches[0].pageX, e.targetTouches[0].pageY, e, true);
}
    function mouseMove(e) {
    mouseOrTouchMove(e.pageX, e.pageY, e);
}
    function touchMove(e) {
    mouseOrTouchMove(e.targetTouches[0].pageX, e.targetTouches[0].pageY, e);
}
    function mouseUp(e) {
    document.body.onmousemove = null;	// quit listening for mousemove events until next mousedown
    document.body.onmouseup = null;
    addPacket();
    //mouseOrTouchEnd(e.pageX, e.pageY, e);
}
    function touchEnd(e) {
    document.body.ontouchmove = null;	// quit listening for touchmove events until next touchstart
    document.body.ontouchend = null;
    addPacket();
    //mouseOrTouchEnd(e.changedTouches[0].pageX, e.changedTouches[0].pageY, e);
}

    function mouseOrTouchStart(pageX, pageY, e, touch) {
    var canvasX = pageX-theCanvas.offsetLeft-canvasDiv.offsetLeft;
    var canvasY = pageY-theCanvas.offsetTop-canvasDiv.offsetTop;
    if ((canvasX < Number(posSlider.min)) || (canvasX > Number(posSlider.max))) return;
    var pxAboveAxis = cHeight - plotMarginHeight - canvasY;
    if (realImag.checked) pxAboveAxis = cHeight/2 - canvasY;
    if (pxAboveAxis <= 0) return;
    e.preventDefault();
    if (touch) {
    document.body.ontouchmove = touchMove;
    document.body.ontouchend = touchEnd;
} else {
    document.body.onmousemove = mouseMove;
    document.body.onmouseup = mouseUp;
}
    psiTempParams.position = canvasX;
    psiTempParams.momentum = 0;
    if (realImag.checked) {
    psiTempParams.height = pxAboveAxis / psiPixPerUnit;
} else {
    psiTempParams.height = Math.sqrt(pxAboveAxis / psi2PixPerUnit);
}
    psiTempParams.width = 40;
    setPsiTemp(psiTempParams.position, psiTempParams.height, psiTempParams.width, psiTempParams.momentum);
}

    function mouseOrTouchMove(pageX, pageY, e) {
    var canvasX = pageX-theCanvas.offsetLeft-canvasDiv.offsetLeft;
    var canvasY = pageY-theCanvas.offsetTop-canvasDiv.offsetTop;
    var maxk = Number(momentumSlider.max);
    psiTempParams.momentum = (canvasX - psiTempParams.position) * maxk / 100;
    if (psiTempParams.momentum > maxk) psiTempParams.momentum = maxk;
    if (psiTempParams.momentum < -maxk) psiTempParams.momentum = -maxk;
    var pxAboveAxis = cHeight - plotMarginHeight - canvasY;
    if (realImag.checked) pxAboveAxis = cHeight/2 - canvasY;
    if (pxAboveAxis == 0) return;
    var packetArea = psiTempParams.height * psiTempParams.width;
    if (realImag.checked) {
    psiTempParams.height = pxAboveAxis / psiPixPerUnit;
} else {
    if (pxAboveAxis < 0) return;
    psiTempParams.height = Math.sqrt(pxAboveAxis / psi2PixPerUnit);
}
    psiTempParams.width = packetArea / psiTempParams.height;
    setPsiTemp(psiTempParams.position, psiTempParams.height, psiTempParams.width, psiTempParams.momentum);
}



    // Draw the canvas:
function paintCanvas() {
    theContext.fillStyle = "black";
    theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

    theContext.lineWidth = 2;
    var baselineY, pxPerY, gridBase, gridOffset;
    var delta = 20;		// grid spacing in pixels

    if (realImag.checked) {
    baselineY = cHeight * 0.5;
    gridBase = cHeight;
    gridOffset = (cHeight/2) % delta;	// lowest horizontal grid line is this far above bottom
    pxPerY = psiPixPerUnit;

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

    // Now draw the wavepacket we might add next, with transparency:
    if (psiTempAlpha > 0.001) {
    theContext.globalAlpha = psiTempAlpha;
    theContext.beginPath();
    theContext.moveTo(0, baselineY - psiTemp.re[0]*pxPerY);
    for (var x=1; x<=xMax; x++) {
    theContext.lineTo(x, baselineY - psiTemp.re[x]*pxPerY);
}
    theContext.strokeStyle = "#ffc000";
    theContext.stroke();
    theContext.beginPath();
    theContext.moveTo(0, baselineY - psiTemp.im[0]*pxPerY);
    for (var x=1; x<=xMax; x++) {
    theContext.lineTo(x, baselineY - psiTemp.im[x]*pxPerY);
}
    theContext.strokeStyle = "#00d0ff";
    theContext.stroke();
    theContext.globalAlpha = 1.0;
}

} else {	// "Density/phase" is checked

    // Plot the probability distribution with phase as color:
    baselineY = cHeight - plotMarginHeight;
    gridBase = baselineY;
    gridOffset = delta;
    pxPerY = psi2PixPerUnit;

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
    // Now draw the wavepacket we might add next, with transparency:
    if (psiTempAlpha > 0.001) {
    theContext.globalAlpha = psiTempAlpha;
    for (var x=0; x<=xMax; x++) {
    theContext.beginPath();
    theContext.moveTo(x, baselineY);
    theContext.lineTo(x, baselineY - pxPerY*(psiTemp.re[x]*psiTemp.re[x] + psiTemp.im[x]*psiTemp.im[x]));
    var localPhase = Math.atan2(psiTemp.im[x], psiTemp.re[x]);
    if (localPhase < 0) localPhase += 2*Math.PI;
    theContext.strokeStyle = phaseColor[Math.round(localPhase * nColors / (2*Math.PI))];
    theContext.stroke();
}
    theContext.globalAlpha = 1.0;
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

}

// Utility function to convert a number to a two-digit hex string (from stackoverflow):
function twoDigitHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// Utility function to create a hex color string for a given hue (between 0 and 1):
function toColorString(hue) {
    let r, g, b;
    if (hue < 1/6) { // red to yellow
        r = 255; g = Math.round(hue * 6 * 255);
        b = 0;
    } else if (hue < 1/3) { // yellow to green
        r = Math.round((1/3 - hue) * 6 * 255);
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
