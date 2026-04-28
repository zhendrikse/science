import {PixelImage, hsvToRgb} from "../js/canvas-extensions.js"
import {FFT} from "../js/math-utils.js"

const diameterSlider = document.getElementById("diameterSlider");
const diameterLabel = document.getElementById("diameterValue");
const screenContext = document.getElementById("screen").getContext("2d");
const canvas = document.createElement("screen");

const resolution = 512;
const intensityImage = new PixelImage(resolution, resolution);
canvas.width = resolution;
canvas.height = resolution;

class Aperture {
    constructor(diameterInMicroMeter, N) {
        this._isCircular = true;
        this._N = N;
        this.setDiameter(diameterInMicroMeter);
    }

    setDiameter(diameter) {
        this._diameter = diameter;
    }

    set isCircular(circularBoolean) {
        this._isCircular = circularBoolean;
        this.setDiameter(this._diameter);
    }

    buildField() {
        const N = this._N;
        const field = Array.from({ length: N }, () => new Array(N).fill(0));

        const cx = N / 2;
        const cy = N / 2;
        const radius = this._diameter / 2;

        for (let i = 0; i < N; i++)
            for (let j = 0; j < N; j++) {
                const x = i - cx;
                const y = j - cy;

                const inside = this._isCircular
                    ? (x * x + y * y <= radius * radius)
                    : (Math.abs(x) <= radius && Math.abs(y) <= radius);

                field[i][j] = inside ? 1 : 0;
            }

        return field;
    }
}

class FourierTransform {
    constructor(N) {
        this._N = N;
        this._fft = new FFT(N);
    }

    compute(field) {
        const N = this._N;

        // create copy (FFT works in-place)
        const real = field.map(row => row.slice());
        const imag = Array.from({ length: N }, () => new Array(N).fill(0));

        this._fft.fft2D(real, imag);

        const intensity = Array.from({ length: N }, () => new Array(N));
        const phaseArray = Array.from({ length: N }, () => new Array(N));

        let max = 0;
        for (let i = 0; i < N; i++)
            for (let j = 0; j < N; j++) {
                const re = real[i][j];
                const im = imag[i][j];
                const value = re * re + im * im;
                const phase = Math.atan2(im, re); // [-π, π]
                intensity[i][j] = value;
                phaseArray[i][j] = phase;
                if (value > max) max = value;
            }

        return {
            magnitude: fftShift2D(intensity),
            phase: fftShift2D(phaseArray),
            max
        };
    }
}

function fftShift2D(arr) {
    const N = arr.length;
    const half = N >> 1;

    const out = Array.from({ length: N }, () => new Array(N));
    for (let i = 0; i < N; i++)
        for (let j = 0; j < N; j++)
            out[i][j] = arr[(i + half) % N][(j + half) % N];

    return out;
}

function drawToImage(image, magnitude, phase, max) {
    image.clear();
    for (let i = 0; i < resolution; i++)
        for (let j = 0; j < resolution; j++) {
            const mag = magnitude[i][j] / max;
            if (mag < 1e-3) {
                image.setColourAt(i, j, [0, 0, 0, 0]);
                continue;
            }
            const ph = phase[i][j];
            const hue = (ph + Math.PI) / (2 * Math.PI);
            const {r, g, b} = hsvToRgb(hue, 1, 1);
            const brightness = Math.pow(mag, 0.3);
            const alpha = Math.log(1 + 100 * mag);
            image.setColourAt(i, j,[r * brightness, g * brightness, b * brightness, alpha]);
        }
}

function render() {
    const currentResult = fourier.compute(aperture.buildField());
    drawToImage(
        intensityImage,
        currentResult.magnitude,
        currentResult.phase,
        currentResult.max
    );
    intensityImage.renderToCanvas(screenContext);
}

//
// Event listeners
//

document.getElementById("squareButton").addEventListener("click", () => {
    aperture.isCircular = false;
    render();
});

document.getElementById("circleButton").addEventListener("click", () => {
    aperture.isCircular = true;
    render();
});

diameterSlider.addEventListener("change", () => {
    const diameter = Number(diameterSlider.value);
    diameterLabel.textContent = `${diameter} pixels`;
    aperture.setDiameter(diameter);
    render();
});

const aperture = new Aperture(Number(diameterSlider.value), resolution);
const fourier = new FourierTransform(resolution);
render();
