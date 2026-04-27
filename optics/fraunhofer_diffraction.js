import { hsvToRgb, PixelImage } from "../js/canvas-extensions.js"

const diameterSlider = document.getElementById("diameterSlider");
const diameterLabel = document.getElementById("diameterValue");
const popFactorSlider = document.getElementById("popFactorSlider");
const wavelengthSlider = document.getElementById("wavelengthSlider");
const wavelengthValue = document.getElementById("wavelengthValue");
const wavelengthProbe = document.getElementById("wavelengthProbe");
const screenContext = document.getElementById("screen").getContext("2d");

const resolution = 100;
const R = 1.0;

let popFactor = 1;
const intensityImage = new PixelImage(resolution, resolution);

function linspace(start, stop, num) {
    const linSpace = [];
    const step = (stop - start) / (num - 1);
    for (let i = 0; i < num; i++)
        linSpace.push(start + i * step);
    return linSpace;
}

function meshgrid(x, y) {
    const X = [];
    const Y = [];

    for (let i = 0; i < y.length; i++) {
        X.push(x.slice());
        Y.push(Array(x.length).fill(y[i]));
    }

    return [X, Y];
}

class Aperture {
    static circularAperture = (x, y, diameter) => x * x + y * y < (.5 * diameter) * (.5 * diameter);
    static squareAperture = (x, y, size) => Math.abs(x) <= size * .5 && Math.abs(y) <= size * .5;

    static circleMask = (X, Y, diameter, N) => Array.from({length: N}, (_, i) =>
        Array.from({length: N}, (_, j) => Aperture.circularAperture(X[i][j], Y[i][j], diameter)));
    static squareMask = (X, Y, diameter, N) => Array.from({length: N}, (_, i) =>
        Array.from({length: N}, (_, j) => Aperture.squareAperture(X[i][j], Y[i][j], diameter)));

    constructor(diameterInMicroMeter, N) {
        const side = linspace(-0.01 * Math.PI, 0.01 * Math.PI, N);
        const [x, y] = meshgrid(side, side);
        this._x = x;
        this._y = y;
        this._N = N;
        this._isCircular = true;
        this._diameter = diameterInMicroMeter * 1e-6;
    }

    get diameter() { return this._diameter; }
    set diameter(newDiameter) { this._diameter = newDiameter * 1e-6; }
    set isCircular(circularBoolean) { this._isCircular = circularBoolean; }
    get isCircular() { return this._isCircular; }

    //
    // De facto, this amounts to a numerical version of the Fraunhofer diffraction integral
    //
    sumRaysAt(k, mask, i, j, X, Y) {
        let field = 0;
        const dx = this._diameter / this._N;
        const dy = this._diameter / this._N;

        for (let m = 0; m < this._N; m++)
            for (let n = 0; n < this._N; n++) {
                const phase = Math.cos(k * (this._x[i][j] * X[m][n] + this._y[i][j] * Y[m][n]));
                if (mask[m][n]) field += phase * dx * dy;
            }

        return field;
    }
}

class ElectricField {
    constructor(N) {
        this._field = Array.from({length:N}, () => Array(N).fill(0));
        this._N = N;
        this._intensity = null;
        this._maxIntensity = 0;
        this._update();
    }

    get intensity() { return this._intensity; }
    get maxIntensity() { return this._maxIntensity;}

    _update() {
        this._intensity = this._field.map(row => row.map(v => v * v));
        this._maxIntensity = Math.max(...this._intensity.flat());
    }

    recompute(aperture, lambdaInNanoMeter) {
        this._computeElectricField(aperture, lambdaInNanoMeter);
        this._update();
    }

    _computeElectricField(aperture, lambdaInNanoMeter) {
        const k = 2 * Math.PI / (lambdaInNanoMeter * 1e-9);
        const side_ap = linspace(-aperture.diameter *.5, aperture.diameter *.5, this._N);
        const [X, Y] = meshgrid(side_ap, side_ap);
        const mask = aperture.isCircular ?
            Aperture.circleMask(X, Y, aperture.diameter, this._N) :
            Aperture.squareMask(X, Y, aperture.diameter, this._N);
        for (let i = 0; i < this._N; i++)
            for (let j = 0; j < this._N; j++)
                this._field[i][j] = aperture.sumRaysAt(k, mask, i, j, X, Y) / R;
    }
}

function wavelengthColor(value) {
    const wavelength = Number(wavelengthSlider.value);
    const base = wavelengthToRGBNormalized(wavelength);

    // intensity → brightness modulation only
    return [
        base.r,
        base.g,
        base.b,
        Math.pow(value, 0.5)
    ];
}

function drawToImage(image, data, useSpectralColor=true) {
    for (let i = 0; i < resolution; i++)
        for (let j = 0; j < resolution; j++) {
            const value = Math.pow(data[i][j] / electricField.maxIntensity, popFactor);
            image.setColourAt(i, j, useSpectralColor ? wavelengthColor(value) : [1, 1, 1, Math.pow(value, 0.5)]);
        }
}

function wavelengthToRGBNormalized(wavelength) {
    let R = 0, G = 0, B = 0;

    if (wavelength >= 380 && wavelength < 440) {
        R = -(wavelength - 440) / (440 - 380);
        G = 0;
        B = 1;
    } else if (wavelength < 490) {
        R = 0;
        G = (wavelength - 440) / (490 - 440);
        B = 1;
    } else if (wavelength < 510) {
        R = 0;
        G = 1;
        B = -(wavelength - 510) / (510 - 490);
    } else if (wavelength < 580) {
        R = (wavelength - 510) / (580 - 510);
        G = 1;
        B = 0;
    } else if (wavelength < 645) {
        R = 1;
        G = -(wavelength - 645) / (645 - 580);
        B = 0;
    } else if (wavelength <= 700) {
        R = 1;
        G = 0;
        B = 0;
    }

    let factor = 1;
    if (wavelength < 420)
        factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    else if (wavelength > 645)
        factor = 0.3 + 0.7 * (700 - wavelength) / (700 - 645);

    const gamma = 0.8;

    return {
        r: Math.pow(R * factor, gamma),
        g: Math.pow(G * factor, gamma),
        b: Math.pow(B * factor, gamma)
    };
}

async function recomputeAndRender(aperture) {
    document.body.style.cursor = "wait";

    await new Promise(requestAnimationFrame);

    electricField.recompute(aperture, Number(wavelengthSlider.value));
    render();

    document.body.style.cursor = "default";
}

function render() {
    const spectralColor = document.getElementById("laserColor").checked;
    drawToImage(intensityImage, electricField.intensity, spectralColor);
    intensityImage.renderToCanvas(screenContext);
}

//
// Event listeners
//
document.getElementById("laserColor").addEventListener("change", render);

document.getElementById("squareButton").addEventListener("click", () => {
    aperture.isCircular = false;
    recomputeAndRender(aperture);
});

document.getElementById("circleButton").addEventListener("click", () => {
    aperture.isCircular = true;
    recomputeAndRender(aperture);
});

function updateWavelengthUI() {
    const wavelength = Number(wavelengthSlider.value);
    const color = wavelengthToRGBNormalized(wavelength);

    const intensity = 1;

    wavelengthProbe.style.backgroundColor =
        `rgb(${color.r * intensity * 255},
             ${color.g * intensity * 255},
             ${color.b * intensity * 255})`;

    wavelengthValue.textContent = `${wavelength} nm`;
}
wavelengthSlider.addEventListener("input", updateWavelengthUI);
wavelengthSlider.addEventListener("change", () => recomputeAndRender(aperture));


diameterSlider.addEventListener("change", () => {
    const diameter = Number(diameterSlider.value);
    diameterLabel.textContent = `${diameter} µm`;
    aperture.diameter = diameter;
    recomputeAndRender(aperture);
});

popFactorSlider.addEventListener("input", () => {
    popFactor = Number(1 - popFactorSlider.value + .3);
    render();
})

const aperture = new Aperture(Number(diameterSlider.value), resolution);
const electricField = new ElectricField(resolution);
updateWavelengthUI();
recomputeAndRender(aperture);
