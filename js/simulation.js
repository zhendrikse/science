/**
 * Simulation environment for educational and scientific visualizations.
 *
 * Simulation state and rendering are decoupled and synchronized by the engine.
 *
 * Design goals:
 * - lightweight ECS-inspired architecture
 * - low cognitive overhead
 * - code expresses scientific intent directly
 *
 * Example:
 *   simulation = Simulation.on(canvas).with(renderer);
 *   renderer.add(body.to(view))
 */

/**********************************************
 * S I M U L A T I O N  E N V I R O N M E N T *
 **********************************************/

export class Overlay {
    constructor(elementId) {
        this._overlay = document.getElementById(elementId);
    }

    get overlay() { return this._overlay; }
}

export class Canvas {
    constructor(elementId) {
        this._canvas = document.getElementById(elementId);
        this._overlay = null;
    }

    with(overlay) {
        this._overlay = overlay.overlay;
        return this;
    }

    get overlay() { return this._overlay; }
    get canvas() { return this._canvas; }
    get clientHeight() { return this._canvas.clientHeight; }
    get clientWidth() { return this._canvas.clientWidth; }
}

export class Renderer {
    add(object) {}
    asyncAdd(object) {}
    initialize() {}
    render(transform) {}
    resize() {}
    reset() {}
}

export class Simulation {
    static on = (canvas) => {
        return new Simulation({
            canvas: canvas.canvas,
            overlay: canvas.overlay
        });
    }

    constructor({
        canvas,
        renderer,
        overlay = null, // If overlay is not defined, the simulation won't wait for a mouse click
        scale = 1,
        resetFunction = null
    }) {
        this._overlay = overlay;
        this._renderer = renderer;
        this._onReset = resetFunction;

        this._transform = new Transform(scale);
        this._running = false;
        this._initEventHandlers(canvas, overlay);
    }

    set scale(scale) { this._transform = new Transform(scale); }

    _initEventHandlers(canvas, overlay) {
        if (!overlay) {
            this._running = true;
            return;
        }

        canvas.addEventListener("click", () => {
            if (!this._running) {
                this.showOverlayMessage("Started");
                this._running = true;
            } else {
                this.showOverlayMessage("Reset");
                this._running = false;
                this.reset();
            }
        });
    }

    showOverlayMessage(message, duration = 1000) {
        this._overlay.textContent = message;
        this._overlay.style.display = "block";

        setTimeout(() => {
            this._overlay.style.display = "none";
        }, duration);
    }

    with(renderer) {
        this._renderer = renderer;
        return this;
    }

    run(updateFunction = null) {
        this._updateFunction = updateFunction;

        // For rendering static objects once
        this._renderer.initialize(this._transform);

        const animate = (time) => {
            // Physics update
            if (this._running && this._updateFunction)
                this._updateFunction(time);

            this._renderer.render(this._transform);

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    reset() {
        this._renderer.reset();

        if (this._onReset)
            this._onReset();
    }

    set onReset(resetFunction) { this._onReset = resetFunction; }
}

class Transform {
    constructor(scale) {
        this._scale = scale;
    }

    physicsToRender(vector) {
        return vector.clone().multiplyScalar(this._scale);
    }

    renderToPhysics(vector) {
        return vector.clone().multiplyScalar(1 / this._scale);
    }

    scaleRadius(radius) {
        return radius * this._scale;
    }
}

/*******************************************
 * G R A P H  ( u P L O T )  L I B R A R Y *
 *******************************************/

export class UPlotGraph {
    constructor({
        plotDiv,
        dataDefinition,
        width = 600,
        height = 300,
        title="",
        xLabel="",
        yLabel="",
        maxPoints = 500,
        labelColor = "green",
    } = {}) {
        this._maxPoints = maxPoints;
        this._graphData = [];
        dataDefinition.forEach(() => this._graphData.push([]));

        const series = [];
        dataDefinition.forEach(dataPoint => series.push({label: dataPoint.label, stroke: dataPoint.color}));

        const uPlotOptions = this._uplotOptions(title, width, height, labelColor, xLabel, yLabel, series);
        this._uplotChart = new uPlot(uPlotOptions, this._graphData, plotDiv);
    }

    _uplotOptions(title, width, height, labelColor, xLabel, yLabel, series) {
        return { title, width, height,
            bg: "transparent",
            scales: { x: { auto: true }, y: { auto: true } },
            axes: [{
                    stroke: labelColor,
                    font: "12px Arial",
                    grid: { stroke: "rgba(255, 255, 255, 0.2)", width: 1 },
                    label: xLabel,
                }, {
                    stroke: labelColor,
                    font: "12px Arial",
                    grid: { stroke: "rgba(255, 255, 255, 0.2)", width: 1 },
                    label: yLabel
                }],
            series
        };
    }

    get graphData() { return this._graphData; }

    update() {
        if (this._graphData[0].length > this._maxPoints)
            this._graphData.forEach(arr => arr.shift());
        this._uplotChart.setData(this._graphData);
    }
}
