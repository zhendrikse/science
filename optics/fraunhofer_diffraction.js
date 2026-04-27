import { hsvToRgb, PixelImage } from "../js/canvas-extensions.js"

const diameterSlider = document.getElementById("diameterSlider");
const diameterLabel = document.getElementById("diameterValue");
const popFactorSlider = document.getElementById("popFactorSlider");
const circularCheckBox = document.getElementById("circle");
const squareCheckBox = document.getElementById("square");

const resolution = 100;
const R = 1.0;
const lambda = 500e-9;
const k = 2 * Math.PI / lambda;

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
    // blue → red scale
    const hue = (1 - val) * 0.7; // 0.7 ~ blue, 0 ~ red
    const {r, g, b} = hsvToRgb(hue, 1, val * 1.25);
    return useColor ? [r/255, g/255, b/255] : [val, val, val];
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

    recompute(diameterValue) {
        const diameter = diameterValue * 1e-6;
        const dx = diameter / this._N;
        const dy = diameter / this._N;

        this._computeElectricField(diameter, dx * dy);
        this._update();
    }

    //
    // De facto, this amounts to a numerical version of the Fraunhofer diffraction integral
    //
    _sumRaysAt(i, j, circleMask, squareMask, X, Y, dx_dy) {
        let Ec = 0;
        let Es = 0;

        for (let m = 0; m < this._N; m++)
            for (let n = 0; n < this._N; n++) {
                const phase = Math.cos(k * (x[i][j] * X[m][n] + y[i][j] * Y[m][n]));

                if (circularCheckBox.checked && circleMask[m][n])
                    Ec += phase * dx_dy;

                if (squareCheckBox.checked && squareMask[m][n])
                    Es += phase * dx_dy;
            }

        return Ec + Es;
    }

    _computeElectricField(diameter, dx_dy) {
        const side_ap = linspace(-diameter *.5, diameter *.5, this._N);
        const [X, Y] = meshgrid(side_ap, side_ap);

        const circleMask = Array.from({length: this._N}, (_, i) =>
            Array.from({length: this._N}, (_, j) => circularAperture(X[i][j], Y[i][j], diameter)));

        const squareMask = Array.from({length: this._N}, (_, i) =>
            Array.from({length: this._N}, (_, j) => squareAperture(X[i][j], Y[i][j], diameter)));

        for (let i = 0; i < this._N; i++)
            for (let j = 0; j < this._N; j++)
                this._field[i][j] = this._sumRaysAt(i, j, circleMask, squareMask, X, Y, dx_dy) / R;
    }
}

const scaleFactor = 1000;
function toColorValue(dataValue, useLogScale, isAmplitude) {
    const maxValue =  isAmplitude ? electricField.maxAmplitude : electricField.maxIntensity;
    let val = useLogScale ?
        Math.log(1 + scaleFactor * dataValue) / Math.log(1 + scaleFactor * maxValue) :
        2 * dataValue / maxValue;

    // clamp (safe)
    val = isAmplitude ? val : Math.pow(val, popFactor);
    val = Math.max(0, Math.min(1, val));
    return val;
}

function drawToImage(image, data, isAmplitude, useLog=false, useColor=false) {
    for (let i = 0; i < resolution; i++)
        for (let j = 0; j < resolution; j++)
            image.setColourAt(i, j, colorMap(toColorValue(data[i][j], useLog, isAmplitude), useColor));
}

const context1 = document.getElementById("canvas1").getContext("2d");
const context2 = document.getElementById("canvas2").getContext("2d");

const electricField = new ElectricField(resolution);
electricField.recompute(Number(diameterSlider.value));

function render() {
    const useLog = document.getElementById("logScale").checked;
    const useColor = document.getElementById("color").checked;

    drawToImage(intensityImage, electricField.intensity, false, useLog, useColor);
    drawToImage(amplitudeImage, electricField.amplitude, true, useLog, useColor);

    intensityImage.renderToCanvas(context1);
    amplitudeImage.renderToCanvas(context2);
}

// Event listeners
document.getElementById("logScale").addEventListener("change", render);
document.getElementById("color").addEventListener("change", render);

const apertureGroup = document.querySelectorAll('input[name="aperture"]');
apertureGroup.forEach(cb => {
    cb.addEventListener('change', function() {
        const checked = document.querySelectorAll('input[name="aperture"]:checked');
        if (checked.length === 0)
            this.checked = true; // At least one aperture type needs to be selected

        electricField.recompute(Number(diameterSlider.value));
        render();
    });
});

diameterSlider.addEventListener("change", () => {
    diameterLabel.textContent = diameterSlider.value;
    electricField.recompute(Number(diameterSlider.value));
    render();
});

popFactorSlider.addEventListener("input", () => {
    // .3 ... 1 => 1 ... .3
    popFactor = Number(1 - popFactorSlider.value + .3);
    render();
})

render();
