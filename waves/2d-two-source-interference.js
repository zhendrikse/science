import { Pixel, PixelImage } from '../js/canvas-extensions.js';

const theCanvas = document.getElementById("2dInterferenceCanvas");
const wrapper = document.getElementById("interferenceCanvasWrapper");
const display = theCanvas.getContext("2d");
const separationSlider = document.getElementById("separationSlider");
const pauseButton = document.getElementById("pauseButton");
const kSlider = document.getElementById("kSlider");
const omegaSlider = document.getElementById("omegaSlider");
const kReadout = document.getElementById("kReadout");
const omegaReadout = document.getElementById("omegaReadout");

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    const width  = wrapper.clientWidth;
    const height = wrapper.clientHeight;

    theCanvas.style.width  = width + "px";
    theCanvas.style.height = height + "px";

    theCanvas.width  = Math.floor(width * dpr);
    theCanvas.height = Math.floor(height * dpr);

    display.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function updateParameters(t) {
    k = Number(kSlider.value);
    omega = Number(omegaSlider.value);

    kReadout.textContent = k.toFixed(3);
    omegaReadout.textContent = omega.toFixed(2);

    updateImage(t);
    image.render(display);
}

// Event listeners
pauseButton.addEventListener("click", startStop);
separationSlider.addEventListener("input", () => {
    updateImage(t);
    image.render(display);
});
kSlider.addEventListener("input", updateParameters);
omegaSlider.addEventListener("input", updateParameters);
window.addEventListener("resize", () => {
    resizeCanvas();
});

let image = new PixelImage(theCanvas.width, theCanvas.height);
let k = 2 * Math.PI / (theCanvas.width / 8); // angular wavenumber
let omega = Math.PI                        // angular frequency
kSlider.value = k;
omegaSlider.value = omega;

function updateImage(t) {
    const tPhase = omega * t;
    const sourceOffset = Number(separationSlider.value) * display.canvas.width / 4;
    const xMid = theCanvas.width / 2;
    const yMid = theCanvas.height / 2;
    for (let y = 0; y < theCanvas.height; y++)
        for (let x = 0; x < theCanvas.width; x++) {
            const dy = y - yMid;

            let dx = x - (xMid - sourceOffset);
            let r = Math.sqrt(dx*dx + dy*dy);       // distance from left source
            const wave1 = Math.sin(k * r - tPhase);     // local amplitude of first wave

            dx = x - (xMid + sourceOffset);
            r = Math.sqrt(dx*dx + dy*dy);           // distance from right source
            const wave2 = Math.sin(k * r - tPhase);     // local amplitude of second wave

            const waveTotal = .5 * (wave1 + wave2);    // value to plot (will be between -1 and 1)
            if (waveTotal > 0)
                image.setColour(new Pixel(x, y, [0, waveTotal, 0]));
            else
                image.setColour(new Pixel(x, y, [-waveTotal * .5, 0, waveTotal]));
        }
}

function startStop() {
    running = !running;
    pauseButton.textContent = running ? " Pause " : "Resume";

    if (running)
        requestAnimationFrame(animate);
}

requestAnimationFrame(() => {
    updateParameters(0);
    resizeCanvas();
    image = new PixelImage(theCanvas.width, theCanvas.height, 1, [0,0,1]);
    updateImage(t);
    image.render(display);
});

let t = 0;
let running = false;
function animate(now) {
    if (!running) return;

    t = now / 1000; // in seconds
    updateImage(t);
    image.render(display);

    requestAnimationFrame(animate);
}
