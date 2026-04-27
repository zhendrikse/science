import { hsvToRgb, PixelImage } from "../js/canvas-extensions.js"

const diameterSlider = document.getElementById("diameterSlider");
const diameterLabel = document.getElementById("diameterValue");
const popFactorSlider = document.getElementById("popFactorSlider");
const circularCheckBox = document.getElementById("circle");
const squareCheckBox = document.getElementById("square");

const N = 100;
const R = 1.0;
const lambda = 500e-9;
const k = 2 * Math.PI / lambda;

let popFactor = 1;
const intensityImage = new PixelImage(N, N);
const amplitudeImage = new PixelImage(N, N);

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

const side = linspace(-0.01 * Math.PI, 0.01 * Math.PI, N);
const [x, y] = meshgrid(side, side);
const electricField = Array.from({length:N}, () => Array(N).fill(0));

function recompute(diameterValue) {
    const diameter = diameterValue * 1e-6;
    const dx = diameter / N;
    const dy = diameter / N;

    computeElectricField(diameter, dx * dy);

    const intensity = electricField.map(row => row.map(v => v * v));
    const amplitude = electricField.map(row => row.map(v => Math.abs(v)));

    return {
        intensity: intensity,
        amplitude: amplitude,
        maxIntensity: Math.max(...intensity.flat()),
        maxAmplitude: Math.max(...amplitude.flat())
    };
}

//
// De facto, this amounts to a numerical version of the Fraunhofer diffraction integral
//
function sumRaysAt(i, j, inAperture, X, Y, dx_dy) {
    let sum = 0;

    for (let m = 0; m < N; m++)
        for (let n = 0; n < N; n++)
            if (inAperture[m][n])
                sum += Math.cos(k * (x[i][j] * X[m][n] + y[i][j] * Y[m][n])) * dx_dy;
    return sum;
}

const circularAperture = (x, y, diameter) => x * x + y * y < (.5 * diameter) * (.5 * diameter);
const squareAperture = (x, y, size) => Math.abs(x) <= size * .5 && Math.abs(y) <= size *.5;

function computeElectricField(diameter, dx_dy) {
    const side_ap = linspace(-diameter *.5, diameter *.5, N);
    const [X, Y] = meshgrid(side_ap, side_ap);
    const inAperture = Array.from({length:N}, (_,i) =>
        Array.from({length:N}, (_,j) => {
            const inCircle = circularAperture(X[i][j], Y[i][j], diameter) && circularCheckBox.checked;
            const inSquare = squareAperture(X[i][j], Y[i][j], diameter) && squareCheckBox.checked;
            return inCircle || inSquare;
        })
    );

    for (let i = 0; i < N; i++)
        for (let j = 0; j < N; j++)
            electricField[i][j] = sumRaysAt(i, j, inAperture, X, Y, dx_dy) / R;
}

const scaleFactor = 1000;
function toColorValue(dataValue, useLogScale, isAmplitude) {
    const maxValue =  isAmplitude ? maxAmplitude : maxIntensity;
    let val = useLogScale ?
        Math.log(1 + scaleFactor * dataValue) / Math.log(1 + scaleFactor * maxValue) :
        2 * dataValue / maxValue;

    // clamp (safe)
    val = isAmplitude ? val : Math.pow(val, popFactor);
    val = Math.max(0, Math.min(1, val));
    return val;
}

function drawToImage(image, data, isAmplitude, useLog=false, useColor=false) {
    for (let i = 0; i < N; i++)
        for (let j = 0; j < N; j++)
            image.setColourAt(i, j, colorMap(toColorValue(data[i][j], useLog, isAmplitude), useColor));
}

const context1 = document.getElementById("canvas1").getContext("2d");
const context2 = document.getElementById("canvas2").getContext("2d");

let { intensity, amplitude, maxIntensity, maxAmplitude } = recompute(Number(diameterSlider.value));
function render() {
    const useLog = document.getElementById("logScale").checked;
    const useColor = document.getElementById("color").checked;

    drawToImage(intensityImage, intensity, false, useLog, useColor);
    drawToImage(amplitudeImage, amplitude, true, useLog, useColor);

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

        ({ intensity, amplitude, maxIntensity, maxAmplitude } = recompute(Number(diameterSlider.value)));
        render();
    });
});

diameterSlider.addEventListener("change", () => {
    diameterLabel.textContent = diameterSlider.value;
    ({ intensity, amplitude, maxIntensity, maxAmplitude } = recompute(Number(diameterSlider.value)));
    render();
});

popFactorSlider.addEventListener("input", () => {
    // .3 ... 1 => 1 ... .3
    popFactor = Number(1 - popFactorSlider.value + .3);
    render();
})

render();
