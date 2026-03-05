const canvas = document.getElementById("blackHoleCanvas");
const context = canvas.getContext("2d");

// While the ray tracing takes place, show a black canvas
context.fillStyle = "black";
context.fillRect(0, 0, canvas.width, canvas.height);

// Prepare the worker with the ray tracing logic
const worker = new Worker("black-hole-raytrace-webworker.js");

// Receive the image data to be displayed
worker.onmessage = (event) => {
    const imageData = event.data;
    context.putImageData(imageData, 0, 0);
};

// Start the ray tracing
worker.postMessage({
    type: "start",
    width: canvas.width,
    height: canvas.height
});