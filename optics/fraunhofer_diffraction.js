import { hsvToRgb, PixelImage } from "../js/canvas-extensions.js"

const diameterSlider = document.getElementById("diameterSlider");
const diameterLabel = document.getElementById("diameterValue");
const popFactorSlider = document.getElementById("popFactorSlider");
const wavelengthSlider = document.getElementById("wavelengthSlider");
const wavelengthValue = document.getElementById("wavelengthValue");
const wavelengthProbe = document.getElementById("wavelengthProbe");
const circularCheckBox = document.getElementById("circle");
const squareCheckBox = document.getElementById("square");
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

function colorMap(val, useColor) {
    return [val, val, val, Math.pow(val, 0.6)];
}

const side = linspace(-0.01 * Math.PI, 0.01 * Math.PI, resolution);
const [x, y] = meshgrid(side, side);
const circularAperture = (x, y, diameter) => x * x + y * y < (.5 * diameter) * (.5 * diameter);
const squareAperture = (x, y, size) => Math.abs(x) <= size * .5 && Math.abs(y) <= size *.5;

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

    recompute(diameterValue, lambdaInNanoMeter) {
        const diameter = diameterValue * 1e-6;
        const dx = diameter / this._N;
        const dy = diameter / this._N;

        this._computeElectricField(diameter, lambdaInNanoMeter,dx * dy);
        this._update();
    }

    //
    // De facto, this amounts to a numerical version of the Fraunhofer diffraction integral
    //
    _sumRaysAt(k, circleMask, squareMask, x, y, X, Y, dx_dy) {
        let Ec = 0;
        let Es = 0;

        for (let m = 0; m < this._N; m++)
            for (let n = 0; n < this._N; n++) {
                const phase = Math.cos(k * (x * X[m][n] + y * Y[m][n]));

                if (circularCheckBox.checked && circleMask[m][n])
                    Ec += phase * dx_dy;

                if (squareCheckBox.checked && squareMask[m][n])
                    Es += phase * dx_dy;
            }

        return Ec + Es;
    }

    _computeElectricField(diameter, lambdaInNanoMeter, dx_dy) {
        const side_ap = linspace(-diameter *.5, diameter *.5, this._N);
        const [X, Y] = meshgrid(side_ap, side_ap);

        const circleMask = Array.from({length: this._N}, (_, i) =>
            Array.from({length: this._N}, (_, j) => circularAperture(X[i][j], Y[i][j], diameter)));

        const squareMask = Array.from({length: this._N}, (_, i) =>
            Array.from({length: this._N}, (_, j) => squareAperture(X[i][j], Y[i][j], diameter)));

        const k = 2 * Math.PI / (lambdaInNanoMeter * 1e-9);
        for (let i = 0; i < this._N; i++)
            for (let j = 0; j < this._N; j++)
                this._field[i][j] = this._sumRaysAt(k, circleMask, squareMask, x[i][j], y[i][j], X, Y, dx_dy) / R;
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

function render() {
    const spectralColor = document.getElementById("laserColor").checked;
    drawToImage(intensityImage, electricField.intensity, spectralColor);
    intensityImage.renderToCanvas(screenContext);
}

//
// Event listeners
//
document.getElementById("laserColor").addEventListener("change", render);

function updateWavelengthUI() {
    const wl = Number(wavelengthSlider.value);
    const c = wavelengthToRGBNormalized(wl);

    const intensity = 1;

    wavelengthProbe.style.backgroundColor =
        `rgb(${c.r * intensity * 255},
             ${c.g * intensity * 255},
             ${c.b * intensity * 255})`;

    wavelengthValue.textContent = `${wl} nm`;
}
wavelengthSlider.addEventListener("input", updateWavelengthUI);

const apertureGroup = document.querySelectorAll('input[name="aperture"]');
apertureGroup.forEach(cb => {
    cb.addEventListener('change', function() {
        const checked = document.querySelectorAll('input[name="aperture"]:checked');
        if (checked.length === 0)
            this.checked = true; // At least one aperture type needs to be selected

        electricField.recompute(Number(diameterSlider.value), Number(wavelengthSlider.value));
        render();
    });
});

diameterSlider.addEventListener("change", () => {
    diameterLabel.textContent = diameterSlider.value;
    electricField.recompute(Number(diameterSlider.value), Number(wavelengthSlider.value));
    render();
});

wavelengthSlider.addEventListener("change", () => {
    electricField.recompute(Number(diameterSlider.value), Number(wavelengthSlider.value));
    render();
});

popFactorSlider.addEventListener("input", () => {
    popFactor = Number(1 - popFactorSlider.value + .3);
    render();
})

const electricField = new ElectricField(resolution);
electricField.recompute(Number(diameterSlider.value), Number(wavelengthSlider.value));
updateWavelengthUI();
render();
