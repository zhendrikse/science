import { Pixel, PixelImage } from '../js/canvas-extensions.js';
import { FireColorMap } from '../js/color-maps.js';
import { Complex } from "../js/math-utils.js";

const mandelbrotCanvas = document.getElementById("mandelbrotCanvas");
const display = mandelbrotCanvas.getContext("2d");
mandelbrotCanvas.focus();

const juliaButtons = new Map();
juliaButtons.set("juliaToggle0", new Complex(0.325, .417));
juliaButtons.set("juliaToggle1", new Complex(0.4, .4));
juliaButtons.set("juliaToggle2", new Complex(-0.4, 0.6));
juliaButtons.set("juliaToggle3", new Complex(-0.5251993, -0.5251993));
juliaButtons.set("juliaToggle4", new Complex(0.285, 0.001));
juliaButtons.set("juliaToggle5", new Complex(-0.8, .156));
juliaButtons.set("juliaToggle6", new Complex(0, 0.8));
juliaButtons.set("juliaToggle7", new Complex(-0.70176, -0.3842));

function hsv2rgb(h,s,v) {
    let f= (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k , 1), 0);
    return [f(5), f(3), f(1)];
}

function hueColor(brightness) {
    return hsv2rgb(brightness * 5 * 360, 1, 1);
}

function rgbColor(brightness) {
    return [brightness, Math.sqrt(brightness), brightness ** 0.2];
}

function colorPalette(z, i, maxIterations) {
    let mu = i + 1 - Math.log(Math.log(absSquared(z))) / Math.log(2);
    if (mu < 0)
        mu = 0;
    else if (mu > maxIterations || isNaN(mu))
        mu = 11 * maxIterations / 12;
    const colourMapIndex = 255 - Math.floor((mu) * 255 / maxIterations);
    return [FireColorMap[colourMapIndex][0] / 255, FireColorMap[colourMapIndex][1] / 255, FireColorMap[colourMapIndex][2] / 255];
}

// Utility functions
function absSquaredPlusC(z_, c_) {
    return new Complex(z_.re * z_.re - z_.im * z_.im + c_.re, Math.abs(2 * z_.re * z_.im) + c_.im);
}
function squaredPlusC(z_, c_) {
    return new Complex(z_.re * z_.re - z_.im * z_.im + c_.re, 2 * z_.re * z_.im + c_.im);
}

class FractalRange {
    constructor(re_min, re_max, im_min, im_max) {
        this.re_min = re_min;
        this.re_max = re_max;
        this.im_min = im_min;
        this.im_max = im_max;
    }

    scale(scale) {
        const realRange = this.realRange(),
            imaginaryRange = this.imaginaryRange(),
            centerX = this.re_min + .5 * this.realRange(),
            centerY = this.im_min + .5 * this.imaginaryRange();
        this.re_min = centerX - .5 * realRange * scale;
        this.re_max = centerX + .5 * realRange * scale;
        this.im_min = centerY - .5 * imaginaryRange * scale;
        this.im_max = centerY + .5 * imaginaryRange * scale;
    }

    realRange() {
        return this.re_max - this.re_min;
    }

    imaginaryRange() {
        return this.im_max - this.im_min;
    }
}

class Fractal {
    constructor(maxIter, range, constantC, colorFunction) {
        this.constantC = constantC;
        this.maxIter = maxIter;
        this.range = range;
        this.colorFunction = colorFunction;

        this.canvas = display.canvas;
        this.ctx = display;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.image = new PixelImage(this.width, this.height);
        this.initialRange = range.clone?.() ?? range;
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.image = new PixelImage(this.width, this.height);
    }

    render() {
        for (let x = 0; x < this.width; x++)
            for (let y = 0; y < this.height; y++)
                this.setPixelColorAt(x, y);

        this.image.render(this.ctx);
    }

    reset() {
        this.range = new FractalRange(
            this.initialRange.re_min,
            this.initialRange.re_max,
            this.initialRange.im_min,
            this.initialRange.im_max
        );
        this.render();
    }

    mapXyToComplexPlane(x, y) {
        return new Complex(
            this.range.re_min + (x / (this.width - 1)) * this.range.realRange(),
            this.range.im_min + (y / (this.height - 1)) * this.range.imaginaryRange()
        );
    }

    setPixelColorAt(x, y) {
        throw new Error('You have invoked setPixelColorAt() in the Fractal abstract base class!');
    }

    zoom(zoomOut) {
        this.range.scale(zoomOut ? 1.1 : .8);
        this.render();
    }

    zoomOut() {
        this.zoom(true);
    }

    zoomIn() {
        this.zoom(false);
    }

    recenter(x, y) {
        const c = this.mapXyToComplexPlane(x, y);
        this.range = new FractalRange(
            c.re - .5 * this.range.realRange(),
            c.re + .5 * this.range.realRange(),
            c.im - .5 * this.range.imaginaryRange(),
            c.im + .5 * this.range.imaginaryRange());
        this.render();
    }

    setColorFunctionTo(newColorFunction) {
        this.colorFunction = newColorFunction;
        this.render();
    }
}

class Mandelbrot extends Fractal {
    constructor(maxIter=500, colorFunction=rgbColor) {
        super(maxIter, new FractalRange(-2, 1, -1, 1), 0, colorFunction);
    }

    setPixelColorAt(x, y) {
        const c = this.mapXyToComplexPlane(x, y);
        let z = new Complex(0, 0);

        let n = 0;
        while (z.absSquared() <= 4 && n < this.maxIter) {
            z = squaredPlusC(z, c);
            n += 1;
        }

        const brightness = n / this.maxIter;
        this.image.setColourAt(x, y, this.colorFunction(brightness));
    }
}

class Julia extends Fractal {
    constructor(cConstant, maxIter=500, colorFunction=rgbColor) {
        const aspect = display.canvas.width / display.canvas.height;
        const range = new FractalRange(
            -1.5 * aspect,
            1.5 * aspect,
            -1.5,
            1.5
        );
        super(maxIter, range, cConstant, colorFunction);
    }

    setPixelColorAt(x, y) {
        const c = this.constantC;
        let z = this.mapXyToComplexPlane(x, y);

        let n = 0;
        while (z.absSquared() <= 4 && n < this.maxIter) {
            z = squaredPlusC(z, c);
            n += 1;
        }

        const brightness = n / this.maxIter;
        if (brightness < 1)
            this.image.setColour(new Pixel(x, y, this.colorFunction(brightness)));
    }
}

class BurningShip extends Fractal {
    constructor(maxIter=100, colorFunction=rgbColor) {
        super(maxIter, new FractalRange(-2.5, 1.5, -2, 2), 0, colorFunction);
    }

    setPixelColorAt(x, y) {
        const c = this.mapXyToComplexPlane(x, y);
        let z = new Complex(0, 0);

        let n = 0;
        while (z.absSquared() <= 16 && n < this.maxIter) {
            z = absSquaredPlusC(z, c);
            n += 1;
        }

        this.image.setColour(new Pixel(x, y, colorPalette(z, n, this.maxIter)));
    }
}

let fractal = new Mandelbrot();
fractal.render();
document.getElementById("mandelbrotToggle").checked = true;

mandelbrotCanvas.addEventListener("mousedown", function(event) {
    const rect = mandelbrotCanvas.getBoundingClientRect();
    fractal.recenter(event.clientX - rect.left, event.clientY - rect.top);
});

document.getElementById("zoomInButton").addEventListener("click", () => {
    fractal.zoomIn();
});

document.getElementById("zoomOutButton").addEventListener("click", () => {
    fractal.zoomOut();
});

document.getElementById("resetViewButton").addEventListener("click", () => {
    fractal.reset();
});

document.getElementById("colorSchemeButton1").addEventListener("click", () => {
    fractal.setColorFunctionTo(rgbColor);
});

document.getElementById("colorSchemeButton2").addEventListener("click", () => {
    fractal.setColorFunctionTo(hueColor);
});

document.getElementById("canvasSizeButton1").addEventListener("click", () => {
    mandelbrotCanvas.width = 600;
    mandelbrotCanvas.height = 400;
    fractal.render();
});

document.getElementById("canvasSizeButton2").addEventListener("click", () => {
    mandelbrotCanvas.width = 1200;
    mandelbrotCanvas.height = 800;
    fractal.render();
});

document.getElementById("canvasSizeButton3").addEventListener("click", () => {
    mandelbrotCanvas.width = 1800;
    mandelbrotCanvas.height = 1200;
    fractal.render();
});

function resizeCanvasToWrapper() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const canvas = document.getElementById('mandelbrotCanvas');

    canvas.width = canvasWrapper.clientWidth;
    canvas.height = canvasWrapper.clientHeight;

    fractal.resize();
    fractal.render();
}

resizeCanvasToWrapper();
window.addEventListener('resize', () => resizeCanvasToWrapper());

for (const [key, value] of juliaButtons)
    document.getElementById(key).onclick = function() {
        document.getElementById(key).checked = true;
        fractal = new Julia(value);
        fractal.render();
    }

document.getElementById("burningShipToggle").addEventListener("click", function(event) {
    document.getElementById("burningShipToggle").checked = true;
    fractal = new BurningShip();
    fractal.render();
});

document.getElementById("mandelbrotToggle").addEventListener("click", function(event) {
    document.getElementById("mandelbrotToggle").checked = true;
    fractal = new Mandelbrot();
    fractal.render();
});
