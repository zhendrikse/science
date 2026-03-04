const theCanvas = document.getElementById("theCanvas");
const theContext = theCanvas.getContext("2d");
const vCanvas = document.getElementById("vCanvas");
const vContext = vCanvas.getContext("2d");
const pauseButton = document.getElementById("pauseButton");
const speedSlider = document.getElementById("speedSlider");
const brightnessSlider = document.getElementById("brightnessSlider");
const eSlider = document.getElementById("eSlider");
const eReadout = document.getElementById("eReadout");
const spsReadout = document.getElementById("spsReadout");
document.getElementById("resetButton").addEventListener("click", () => reset());
document.getElementById("pauseButton").addEventListener("click", () => startStop());
document.getElementById("barrierType").addEventListener("click", () => barrierAdjust());
speedSlider.addEventListener("input", () => resetTimer());
brightnessSlider.addEventListener("input", () => paintCanvas());
eSlider.addEventListener("input", () => wpEnergyAdjust());
document.getElementById("bEnergySlider").addEventListener("input", () => barrierAdjust());
document.getElementById("bSizeSlider").addEventListener("input", () => barrierAdjust());
document.getElementById("bSoftnessSlider").addEventListener("input", () => barrierAdjust());

const xMax = Number(theCanvas.width);
const xMaxm1 = xMax - 1;
const image = theContext.createImageData(xMax, xMax);		// for pixel manipulation
for (let i=0; i<image.data.length; i+=4)
    image.data[i+3] = 255;      // set all alpha values to "opaque"


const vImage = vContext.createImageData(xMax, xMax);		// overlaid image of potential function
const pWidth = 48;	// initial wavepacket width
// Here are the wavefunction arrays.  Note that times are staggered, with the imaginary parts always
// one time step behind the corresponding real parts.  This is admittedly confusing.
// Also note that these are 1D arrays, with index i = y*xMax + x, for efficiency.
const psi = {re:(new Array(xMax*xMax)), im:(new Array(xMax*xMax))};
const psiNext = {re:(new Array(xMax*xMax)), im:(new Array(xMax*xMax))};	// psiNext is actually 2*dt later than psi
const v = new Array(xMax*xMax);
for (let index=0; index<xMax*xMax; index++)
    v[index] = 0.0;
const dt = 0.24;		// anything less than 0.25 seems to be stable
let running = false;
let startTime, stepCount;
barrierAdjust();
reset();

function startStop() {
    running = !running;
    if (running) {
        resetTimer();
        pauseButton.innerHTML = "Pause";
        nextFrame();
    } else
        pauseButton.innerHTML = "Resume";
}

function resetTimer() {
    stepCount = 0;
    startTime = (new Date()).getTime();
}

// Respond to user adjusting wavepacket energy:
// (Uncertainty code is left over from 1D version and is commented out for now.)
function wpEnergyAdjust() {
    const e = Number(eSlider.value);
    //const a = 1 / (pWidth * pWidth);						// so envelope is exp(-ax^2)
    //const sigma = Math.sqrt(2*energy*a + a*a/2) + a/2;	// uncertainty in energy (more or less)
    // The square root term is the actual sigma and dominates for most energy values;
    // the a/2 term is the offset between the k^2/2 and the actual average energy.
    eReadout.innerHTML = Number(e).toFixed(3);
    //+ " &plusmn; " + Number(sigma).toFixed(3);
    if (!running) reset();
}

function barrierAdjust() {
    const bEnergy = Number(document.getElementById("bEnergySlider").value);
    const bSize = Number(document.getElementById("bSizeSlider").value);
    document.getElementById("bEnergyReadout").innerHTML = bEnergy.toFixed(3).replace("-","&minus;");
    document.getElementById("bSizeReadout").innerHTML = "" + bSize;
    for (let y=0; y<xMax; y++)
        for (let x=0; x<xMax; x++)
            v[y * xMax + x] = 0.0;		// erase old barrier

    switch (document.getElementById("barrierType").value) {
        case "circle":
            console.log("MATCH")
            const rSquared = bSize*bSize/4.0;
            for (let y=0; y<xMax; y++)
                for (let x=0; x<xMax; x++) {
                    const dx = x - xMax/2;
                    const dy = y - xMax/2;
                    if (dx*dx + dy*dy < rSquared) v[y*xMax+x] = bEnergy;
                }
            break;
        case "square":
            const edge = Math.round(xMax / 2 - bSize / 2);
            for (let y = edge; y < edge + bSize; y++)
                for (let x = edge; x < edge + bSize; x++)
                    v[y * xMax + x] = bEnergy;
            break;
        case "line":
            for (let y=0; y<xMax; y++)
                for (let x=xMax/2; x<xMax/2+bSize; x++)
                    v[y*xMax + x] = bEnergy;
            break;
        case "step":
            for (let y=0; y<xMax; y++)
                for (let x=xMax/2; x<xMax; x++)
                    v[y*xMax + x] = bEnergy;
            break;
        case "singleHole":
            for (let y=0; y<xMax; y++)
                for (let x=xMax/2-5; x<xMax/2+5; x++) {
                    const holeEdge = Math.round(xMax/2 - bSize/2);
                    if ((y <= holeEdge) || (y > holeEdge+bSize)) v[y*xMax + x] = bEnergy;
                }
            break;
        case "doubleHole":
            for (let y=0; y<xMax; y++)
                for (let x=xMax/2-5; x<xMax/2+5; x++) {
                    const holeEdge = Math.round(xMax/2 - bSize/2);
                    if ((y <= holeEdge-10) || (y > holeEdge+bSize+10) || ((y > holeEdge) && (y <= holeEdge+bSize))) v[y*xMax + x] = bEnergy;
                }
            break;
        case "grating":
            for (let y=xMax/4; y<3*xMax/4; y++)
                for (let x=xMax/2-5; x<xMax/2+5; x++)
                    if (y % bSize < bSize/2)
                        v[y*xMax + x] = bEnergy;

            break;
    }

    // Soften the barrier edges if softness is nonzero:
    const softness = Number(document.getElementById("bSoftnessSlider").value);
    document.getElementById("bSoftnessReadout").innerHTML = "" + softness;
    for (let s = 0; s < softness; s++) {
        const oldV = [];
        for (let i=0; i<xMax*xMax; i++)
            oldV[i] = v[i];

        for (let y=1; y<xMax-1; y++)
            for (let x=1; x<xMax-1; x++) {
                const i = y*xMax + x;
                v[i] = (oldV[i+1] + oldV[i-1] + oldV[i+xMax] + oldV[i-xMax]) / 4;
            }
    }

    // Now paint the potential on vImage:
    for (let y=0; y<xMax; y++)
        for (let x=0; x<xMax; x++) {
            const i = y*xMax + x;
            const imageIndex = (x + (xMax-y-1)*xMax) * 4;
            vImage.data[imageIndex] = 255;
            vImage.data[imageIndex+1] = 255;
            vImage.data[imageIndex+2] = 255;
            vImage.data[imageIndex+3] = Math.round(Math.abs(128*v[i]/0.1));		// max v is drawn as 50% opaque
        }
    vContext.putImageData(vImage, 0, 0);   // blast barrier image to the screen
}

// Calculate and draw the next animation frame:
function nextFrame() {
    if (!running) return;

    const stepsPerFrame = Number(speedSlider.value);
    for (let step=0; step < stepsPerFrame; step++)
        doStep();
    stepCount += stepsPerFrame;
    paintCanvas();
    const currentTime = (new Date()).getTime();
    spsReadout.innerHTML = "" + Math.round(1000 * stepCount / (currentTime-startTime));
    requestAnimationFrame(nextFrame);
}

// Integrate the TDSE for a double time step (centered-difference time integration):
// (Remember that psi.im is one time step earlier than psi.re; same for psiNext.im and psiNext.re.)
function doStep() {
    for (let y=1; y<xMaxm1; y++)
        for (let x=1; x<xMaxm1; x++) {
            const i = y*xMax + x;
            psiNext.im[i] = psi.im[i] - dt * (-psi.re[i+1] - psi.re[i-1] - psi.re[i+xMax] - psi.re[i-xMax] + 2*(2+v[i])*psi.re[i]);
        }

    for (let y=1; y<xMaxm1; y++)
        for (let x=1; x<xMaxm1; x++) {
            const i = y*xMax + x;
            psiNext.re[i] = psi.re[i] + dt * (-psiNext.im[i+1] - psiNext.im[i-1] - psiNext.im[i+xMax] - psiNext.im[i-xMax] + 2*(2+v[i])*psiNext.im[i]);
    }

    for (let y=1; y<xMax-1; y++)			// now copy next to current
        for (let x=1; x<xMaxm1; x++) {
            const i = y*xMax + x;
            psi.re[i] = psiNext.re[i];
            psi.im[i] = psiNext.im[i];
    }
}

// Initialize the wavefunction to a Gaussian wavepacket:
function reset() {
    for (let x=0; x<xMax; x++) {
        const centerX = Math.floor(xMax*0.22);
        const centerY = xMax/2;
        const e = Number(eSlider.value);
        const kx = Math.sqrt(2*e);
        const ky = 0;
        for (let y=0; y<xMax; y++)
            for (let x=0; x<xMax; x++) {
                const i = y*xMax + x;
                const envelope = Math.exp(-(x-centerX)*(x-centerX)/(pWidth*pWidth)) *
                Math.exp(-(y-centerY)*(y-centerY)/(pWidth*pWidth));
                psi.re[i] = envelope * (Math.cos(kx*x)*Math.cos(ky*y) - Math.sin(kx*x)*Math.sin(ky*y));
                psi.im[i] = envelope * (Math.cos(kx*x)*Math.sin(ky*y) + Math.sin(kx*x)*Math.cos(ky*y));
                psiNext.re[i] = 0.0;
                psiNext.im[i] = 0.0;	// These lines may not be needed but edges must be zero
        }

        // Now bump the imaginary part of psi back by one time step:
        for (let y=1; y<xMax-1; y++) 
            for (let x=1; x<xMax-1; x++) {
                const i = y*xMax + x;
                psi.im[i] = psi.im[i] + 0.5*dt * (-psi.re[i+1] - psi.re[i-1] - psi.re[i+xMax] - psi.re[i-xMax] + 2*(2+v[i])*psi.re[i]);
            }
        }
    paintCanvas();
    if (!running) pauseButton.innerHTML = "Run";
}

// Draw the canvas:
// (Could probably speed it up a little by using a lookup table for colors.)
function paintCanvas() {
    const brightSetting = brightnessSlider.value;
    for (let y=0; y<xMax; y++)
        for (let x=0; x<xMax; x++) {
            const psiIndex = x + y*xMax;
            const imageIndex = (x + (xMax-y-1)*xMax) * 4;
            const psi2 = psi.re[psiIndex]*psi.re[psiIndex] + psi.im[psiIndex]*psi.im[psiIndex];
            let brightness = Math.sqrt(psi2) * brightSetting;
            if (brightness > 1.0) brightness = 1.0;
            let localPhase = Math.atan2(psi.im[psiIndex], psi.re[psiIndex]) / (2*Math.PI);
            if (localPhase < 0) localPhase += 1.0;
            const rgb = HSVtoRGB(localPhase, 1.0, brightness);
            image.data[imageIndex] = rgb.r;
            image.data[imageIndex+1] = rgb.g;
            image.data[imageIndex+2] = rgb.b;
        }
    theContext.putImageData(image, 0, 0);   // blast the image to the screen
}

// From http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
// h, s, and v must all be in the range 0 to 1
function HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
