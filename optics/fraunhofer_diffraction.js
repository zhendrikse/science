import { hsvToRgb, PixelImage } from "../js/canvas-extensions.js"

const diameterSlider = document.getElementById("diameterSlider");
const diameterLabel = document.getElementById("diameterValue");
const popFactorSlider = document.getElementById("popFactorSlider");
const wavelengthSlider = document.getElementById("wavelengthSlider");
const wavelengthValue = document.getElementById("wavelengthValue");
const wavelengthProbe = document.getElementById("wavelengthProbe");
const circularCheckBox = document.getElementById("circle");
const squareCheckBox = document.getElementById("square");
const context1 = document.getElementById("canvas1").getContext("2d");
const context2 = document.getElementById("canvas2").getContext("2d");

const resolution = 100;
const R = 1.0;

let popFactor = 1;
const intensityImage = new PixelImage(resolution, resolution);
const amplitudeImage = new PixelImage(resolution, resolution);

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
        this._amplitude = null;
        this._maxIntensity = 0;
        this._maxAmplitude = 0;
        this._update();
    }

    get intensity() { return this._intensity; }
    get amplitude() { return this._amplitude; }
    get maxIntensity() { return this._maxIntensity;}
    get maxAmplitude() { return this._maxAmplitude; }

    _update() {
        this._intensity = this._field.map(row => row.map(v => v * v));
        this._amplitude = this._field.map(row => row.map(v => Math.abs(v)));
        this._maxIntensity = Math.max(...this._intensity.flat());
        this._maxAmplitude = Math.max(...this._amplitude.flat());
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

const scaleFactor = 1000;
function toColorValue(dataValue, useLogScale, isAmplitude) {
    const maxValue =  isAmplitude ? electricField.maxAmplitude : electricField.maxIntensity;
    let val = useLogScale ?
        Math.log(1 + scaleFactor * dataValue) / Math.log(1 + scaleFactor * maxValue) :
        dataValue / maxValue;

    // clamp (safe)
    val = Math.max(0, Math.min(1, val));
    return val;
}

function wavelengthColor(value) {
    const wl = Number(wavelengthSlider.value);
    const base = wavelengthToRGBNormalized(wl);

    // intensity → brightness modulation only
    return [
        base.r * value,
        base.g * value,
        base.b * value
    ];
}

function drawToImage(image, data, isAmplitude, useLog=false, useSpectralColor=true) {
    for (let i = 0; i < resolution; i++)
        for (let j = 0; j < resolution; j++) {
            const colorValue = toColorValue(data[i][j], useLog, isAmplitude);
            const value = Math.pow(colorValue, popFactor);
            image.setColourAt(i, j, useSpectralColor ? wavelengthColor(value) : [value, value, value]);
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
    const useLog = document.getElementById("logScale").checked;
    const spectralColor = document.getElementById("laserColor").checked;

    drawToImage(intensityImage, electricField.intensity, false, useLog, spectralColor);
    drawToImage(amplitudeImage, electricField.amplitude, true, useLog, spectralColor);

    intensityImage.renderToCanvas(context1);
    amplitudeImage.renderToCanvas(context2);
}

// Event listeners
document.getElementById("logScale").addEventListener("change", render);
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
    popFactor = Number(1 - popFactorSlider.value + .4);
    render();
})

const electricField = new ElectricField(resolution);
electricField.recompute(Number(diameterSlider.value), Number(wavelengthSlider.value));
updateWavelengthUI();
render();
