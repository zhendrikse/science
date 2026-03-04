/** Utility function to convert a number to a two-digit hex string (from stackoverflow): */
function numberToTwoDigitHexString(numberToConvert) {
    const hex = numberToConvert.toString(16); // 16 is necessary for conversion to hex string!
    return hex.length === 1 ? "0" + hex : hex;
}

/** Utility function to create a hex color string for a given hue (between 0 and 1): */
export function toColorString(hue) {
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

export class Display {
    constructor(canvas, context, totalClocks=8, nColors=360) {
        this._canvas = canvas;
        this._context = context;
        this._totalClocks = totalClocks;
        this._clockSpaceFraction = 0.25;	// fraction of vertical space taken up by clocks
        this._clockRadiusFraction = 0.45;	// as fraction of width or height of clock space
        this._nColors = nColors;
        this._phaseColor = new Array(nColors+1);
        for (let c = 0; c <= nColors; c++)
            this._phaseColor[c] = toColorString(c / nColors);
    }

    drawHorizontalAxis(baselineY) {
        this._context.strokeStyle = "gray";
        this._context.lineWidth = 1;
        this._context.beginPath();
        this._context.moveTo(0, baselineY);
        this._context.lineTo(this._canvas.clientWidth, baselineY);
        this._context.stroke();
        this._context.lineWidth = 2;
    }

    drawPhasorClockWithIndex(n, psi) {
        const clockRadius = Math.min(this.phasorSpace * 0.4, this.clockSpaceHeight * this._clockRadiusFraction);
        this._context.strokeStyle = "gray";
        this._context.lineWidth = 1;
        this._context.beginPath();
        const centerX = (n + 0.5) * this.phasorSpace;
        const centerY = this._canvas.clientHeight - this.clockSpaceHeight * 0.5;
        this._context.arc(centerX, centerY, clockRadius, 0, 2 * Math.PI);
        this._context.stroke();
        this._context.beginPath();
        this._context.moveTo(centerX, centerY);
        const clockHandX = centerX + clockRadius * psi.amplitude[n] * Math.cos(psi.phase[n]);
        const clockHandY = centerY - clockRadius * psi.amplitude[n] * Math.sin(psi.phase[n]);
        this._context.lineTo(clockHandX, clockHandY);
        this._context.strokeStyle = this._phaseColor[Math.round(psi.phase[n] * this._nColors / (2 * Math.PI))];
        this._context.lineWidth = 3;
        this._context.stroke();
    }

    get phasorSpace() { return this._canvas.clientWidth / (this._totalClocks + 1); }
    get clockSpaceHeight() { return this._canvas.clientHeight * this._clockSpaceFraction; }
    get clockPixelRadius() { return this.clockSpaceHeight * this._clockRadiusFraction; }

    paintCanvas(psi, realImagChecked, mouseIsDown, mouseClock) {
        this._context.clearRect(0, 0, this._canvas.clientWidth, this._canvas.clientHeight);

        if (realImagChecked)
            this.plotRealImaginary(psi);
        else
            this.plotDensityPhase(psi);

        // Draw the eigen-phasor "clocks":
        for (let n = 0; n <= this._totalClocks; n++)
            this.drawPhasorClockWithIndex(n, psi);

        if (!mouseIsDown) return;

        // Provide feedback when setting an amplitude:
        this._context.fillStyle = "#a0a0a0";
        this._context.font = "20px monospace";
        this._context.fillText("n = " + (mouseClock + 1), 100, 30);
        const amp = psi.amplitude[mouseClock];
        const ph = psi.phase[mouseClock];
        this._context.fillText("Mag = " + Number(amp).toFixed(3), 195, 30);
        const deg = String.fromCharCode(parseInt('00b0',16));		// degree symbol
        this._context.fillText("Phase = " + Math.round(ph * 180 / Math.PI) + deg, 360, 30);
        //this._context.fillText("Re = " + Number(amp*Math.cos[ph]).toFixed(3), 180, 30);
    }

    render(baselineY, psi) {
        let pxPerY = baselineY * 0.6;
        // Plot the real part of psi:
        this._context.beginPath();
        this._context.moveTo(0, baselineY - psi.re[0] * pxPerY);
        for (let i = 1; i <= psi.iMax; i++)
            this._context.lineTo(i, baselineY - psi.re[i] * pxPerY);

        this._context.strokeStyle = "#ffc000";
        this._context.stroke();

        // Plot the imaginary part of psi:
        this._context.beginPath();
        this._context.moveTo(0, baselineY - psi.im[0] * pxPerY);
        for (let i = 1; i <=  psi.iMax; i++)
            this._context.lineTo(i, baselineY - psi.im[i] * pxPerY);

        this._context.strokeStyle = "#00d0ff";
        this._context.stroke();
    }

    plotRealImaginary(psi) {
        const baselineY = this._canvas.clientHeight * (1 - this._clockSpaceFraction) / 2;
        this.drawHorizontalAxis(baselineY);
        this.render(baselineY, psi);
    }

    plotDensityPhase(psi) {
        const baselineY = this._canvas.clientHeight * (1 - this._clockSpaceFraction);
        const pxPerY = baselineY * 0.4;
        this._context.lineWidth = 2;
        for (let i = 0; i <= psi.iMax; i++) {
            this._context.beginPath();
            this._context.moveTo(i, baselineY);
            this._context.lineTo(i, baselineY - pxPerY*(psi.re[i] * psi.re[i] + psi.im[i] * psi.im[i]));
            let localPhase = Math.atan2(psi.im[i], psi.re[i]);
            if (localPhase < 0) localPhase += 2 * Math.PI;
            this._context.strokeStyle = this._phaseColor[Math.round(localPhase * this._nColors / (2 * Math.PI))];
            this._context.stroke();
        }
    }
}

export class Wave2D {
    constructor(iMax, nMax) {
        this._iMax = iMax;
        this._nMax = nMax; // maximum energy quantum number (starting from zero)
        this._pxPerX = 60; // number of pixels per conventional x unit

        this._psi = {
            re: new Array(iMax + 1),
            im: new Array(iMax + 1)
        };
        this._eigenPsi = new Array(this._nMax + 1);
        this._amplitude = new Array(this._nMax + 1);		// amplitudes of the eigenfunctions in psi
        this._phase = new Array(this._nMax + 1);			// phases of the eigenfunctions in psi
        this.init();
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

    get re() { return this._psi.re; }
    get im() { return this._psi.im; }
    get iMax() { return this._iMax; }
    get amplitude() { return this._amplitude; }
    get phase() { return this._phase; }

    init() {
        this._initEigenStates();
        this._initAmplitudes();
        this.build();
    }

    _initEigenStates() { throw new Error("Implement this in concrete subclass"); }

    _initAmplitudes() {
        for (let n = 0; n <= this._nMax; n++) {
            this._amplitude[n] = 0;
            this._phase[n] = 0;
        }
        this._amplitude[0] = 1 / Math.sqrt(2);
        this._amplitude[1] = 1 / Math.sqrt(2);
    }

    normalise() {
        let norm2 = 0;
        for (let n = 0; n <= this._nMax; n++)
            norm2 += this._amplitude[n] * this._amplitude[n];

        if (norm2 <= 0) return;

        for (let n = 0; n <= this._nMax; n++)
            this._amplitude[n] /= Math.sqrt(norm2);
    }

    setAmplitudeTo(index, relX, relY, clockPixelRadius) {
        const pixelDistance = Math.sqrt(relX*relX + relY*relY);

        this._amplitude[index] = Math.min(pixelDistance / clockPixelRadius, 1);
        this._phase[index] = Math.atan2(relY, relX);

        if (this._phase[index] < 0)
            this._phase[index] += 2 * Math.PI;
    }

    setAmplitudesTo(amplitude) {
        for (let n = 0; n <= this._nMax; n++)
            this._amplitude[n] = amplitude;
    }
}

export class Mouse {
    constructor(canvas, display) {
        this._canvas = canvas;
        this._display = display;
        this._mouseIsDown = false;
        this._mouseClock = 0;
    }

    get mouseIsDown() { return this._mouseIsDown; }
    get mouseClock() { return this._mouseClock; }

    getMousePos(clientX, clientY) {
        const rect = this._canvas.getBoundingClientRect();

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    setMouseClock(relX, relY, psi) {	// parameters are x,y in pixels, relative to clock center
        this._mouseIsDown = true;
        psi.setAmplitudeTo(this._mouseClock, relX, relY, this._display.clockPixelRadius);
        psi.build();
        this._display.paintCanvas(psi, this._mouseIsDown, this._mouseClock);
    }

    mouseOrTouchStart(pageX, pageY, event, psi) {
        const pos = this.getMousePos(pageX, pageY);
        const x = pos.x;
        const y = pos.y;

        if (y <= this._canvas.clientHeight - this._display.clockSpaceHeight) return;

        this._mouseClock = Math.floor(x / this._display.phasorSpace);
        const clockCenterX = this._display.phasorSpace * (this._mouseClock + 0.5);
        const clockCenterY = this._canvas.clientHeight - this._display.clockSpaceHeight * 0.5;
        const relX = x - clockCenterX;
        const relY = clockCenterY - y;

        if (relX*relX + relY*relY <= this._display.clockPixelRadius * this._display.clockPixelRadius) {
            this.setMouseClock(relX, relY, psi);
            event.preventDefault();
        }
    }

    mouseOrTouchMove(pageX, pageY, event, psi) {
        if (!this._mouseIsDown) return;

        const pos = this.getMousePos(pageX, pageY);
        const x = pos.x;
        const y = pos.y;

        const clockCenterX = this._display.phasorSpace * (this._mouseClock + 0.5);
        const clockCenterY = this._canvas.clientHeight - this._display.clockSpaceHeight * 0.5;

        const relX = x - clockCenterX;
        const relY = clockCenterY - y;

        this.setMouseClock(relX, relY, psi);
        event.preventDefault();
    }

    mouseUp() { this._mouseIsDown = false; }
}
