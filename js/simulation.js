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
 *     // 1. Define your renderer of choice
 *     const renderer = ThreeJsRenderer
 *         .on(HtmlDiv.withElementId("canvasWrapper").contains(Canvas.withElementId("canvas")))
 *         .with(threeJsRendererOptions);
 *
 *     // 2. Attach view to physics
 *     renderer.add(body.to(view))
 *
 *     // 3. Run simulation
 *     Simulation
 *         .with(renderer)
 *         .onScale(1e-10)
 *         .run((realTime, simulatedTime) => {
 *         // ...
 *     });
 *
 */

/**********************************************
 * S I M U L A T I O N  E N V I R O N M E N T *
 **********************************************/

export class HtmlDiv {
    static withElementId = (elementId) => new HtmlDiv(elementId);

    constructor(elementId) {
        this._htmlDiv = document.getElementById(elementId);
        if (!this._htmlDiv)
            throw new Error("HTML <div> with elementId '" + elementId + "' not found => check HTML page!");
        this._canvas = null;
        this._overlay = null;
    }

    contains(canvas) {
        this._canvas = canvas;
        return this;
    }

    containsBoth(canvasAndOverlay) {
        this._canvas = canvasAndOverlay.canvas;
        this._overlay = canvasAndOverlay.overlay;
        return this;
    }

    get overlay() { return this._overlay; }
    get canvas() { return this._canvas; }
}

export class Canvas {
    static withElementId = (elementId) => new Canvas(elementId);

    constructor(elementId) {
        this._htmlCanvas = document.getElementById(elementId);
        this._overlay = null;
        if (!this._htmlCanvas)
            throw new Error("Canvas with elementId '" + elementId + "' not found => check HTML page!");
    }

    and(overlay) {
        this._overlay = overlay;
        return {canvas: this, overlay: this._overlay  };
    }

    get overlay() { return this._overlay; }
    get htmlCanvas() { return this._htmlCanvas; }
    get clientHeight() { return this._htmlCanvas.clientHeight; }
    get clientWidth() { return this._htmlCanvas.clientWidth; }
}

export class Overlay {
    static withElementId = (elementId) => new Overlay(elementId);

    constructor(elementId) {
        this._overlay = document.getElementById(elementId);
        if (!this._overlay)
            throw new Error("Overlay with elementId '" + elementId + "' not found => check HTML page!");
    }
    get htmlOverlay() { return this._overlay; }
}

export class HtmlControl {
    static withElementId = (elementId) => new HtmlControl(elementId);

    constructor(elementId) {
        this.htmlElement = document.getElementById(elementId);
        if (!this.htmlElement)
            throw new Error("Control with elementId '" + elementId + "' not found => check HTML page!");

        this.actionType = "Uninitialized";
        this.objectToModify = null;
        this.objectPropertyName = "Uninitialized";
        this.callbackFunction = null;
        this.htmlSpanElement = null;
    }

    withValueSpanId(htmlSpanElementId) {
        this.htmlSpanElement = document.getElementById(htmlSpanElementId);
        if (!this.htmlSpanElement)
            throw new Error("HTML <span> with elementId '" + htmlSpanElementId + "' not found => check HTML page!");
        return this;
    }

    forType(actionType) {
        this.actionType = actionType;
        return this;
    }

    to(object) {
        this.objectToModify = object;
        return this;
    }

    withProperty(propertyName) {
        this.objectPropertyName = propertyName;
        return this;
    }
}

// TODO
class Vec3 {
    constructor(x=0, y=0, z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    lengthSq() {
        return this.x*this.x +
            this.y*this.y +
            this.z*this.z;
    }

    normalize() {
        const inv = 1 / Math.sqrt(this.lengthSq());

        this.x *= inv;
        this.y *= inv;
        this.z *= inv;

        return this;
    }
}

export class CallbackFunction {
    constructor(callback) {
        this._callbackFunction = callback;
    }

    to(control) {
        control.callbackFunction = this._callbackFunction;
        return control;
    }
}

export class EventController {
    constructor(simulation = null) {
        this._simulation = simulation;
    }

    addClickEventListenerTo(canvas) {
        canvas.htmlCanvas.addEventListener("click", (event) => this._simulation.onCanvasClicked())
    }

    // Adds a custom event listener (callback function) to a control
    add(control) {
        control.htmlElement.addEventListener(control.actionType, (event) => control.callbackFunction(event));
    }

    // Sets a value from the control for a property an any type of object, as long as it exposes the property name
    attach(control) {
        control.htmlElement.addEventListener(control.actionType, (event) => {
            const target = event.target;
            const value = target.type === 'checkbox' ? target.checked : target.value;
            control.objectToModify[control.objectPropertyName] = value;

            if (!control.htmlSpanElement)
                return;

            // Here we know we have an additional <span> element that displays the current value
            const numberValue = Number(value);
            if (typeof value === 'boolean')
                control.htmlSpanElement.innerText = value ? 'true' : 'false';
            else if (Number.isNaN(numberValue))
                control.htmlSpanElement.innerText = value;
            else
                control.htmlSpanElement.innerText = numberValue.toFixed(2);
        });
    }
}

export class Renderer {
    constructor(canvasWrapperDiv) {
        this._canvasWrapperDiv = canvasWrapperDiv;
    }
    /**
     * Add objects to simulation with synchronization of the physics state.
     */
    add(object) {}

    /**
     * Add objects to simulation _without_ synchronization of the physics state.
     */
    asyncAdd(object) {}

    /**
     * A renderer gets notified from the simulation when the user has clicked on the canvas.
     * The renderer may then need to display certain information about what has happened to the user.
     */
    onCanvasClicked() {}
    initialize() {}
    render(transform) {}
    resize() {}
    reset() {}
}

export class CompositeRenderer extends Renderer {
    constructor(renderers = [] = {}) {
        super();
        this._renderers = renderers; // array van Renderer-instanties
    }

    initialize(transform) {
        for (const renderer of this._renderers)
            renderer.initialize?.(transform);
    }

    add(viewObject) {
        for (const renderer of this._renderers)
            renderer.add?.(viewObject);
    }

    asyncAdd(viewObject) {
        for (const renderer of this._renderers)
            renderer.asyncAdd?.(viewObject);
    }

    render(transform) {
        for (const renderer of this._renderers)
            renderer.render?.(transform);
    }

    reset() {
        for (const renderer of this._renderers)
            renderer.reset?.();
    }
}

export class Simulation {
    static with = (renderer) => new Simulation(renderer);
    constructor(renderer) {
        this._renderer = renderer;
        this._onReset = (dummy) => (dummy);
        this._transform = new Transform(1);
        this._running = false;
        this._simulatedTime = 0;
        this._dt = 0.01;
    }

    onScale(scale) { this._transform = new Transform(scale); return this; }

    incrementsTimeBy(dt) {
        this._dt = dt;
        return this;
    }

    _updatePhysics(substepsCount, time) {
        if (!this._running || !this._updateFunction)
            return;

        for (let substeps = 0; substeps < substepsCount; substeps++) {
            this._updateFunction(time, this._simulatedTime);
            this._simulatedTime += this._dt;
        }
    }

    run(updateFunction = null, substepsCount = 1) {
        this._updateFunction = updateFunction;

        // For rendering static objects once
        this._renderer.initialize(this._transform);

        const animate = (time) => {
            this._updatePhysics(substepsCount, time);
            this._renderer.render(this._transform);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        return this;
    }

    reset() {
        this._simulatedTime = 0;
        this._renderer.reset();
        this._onReset?.();
    }

    onCanvasClicked() {
        this._renderer.onCanvasClicked(this._running);

        if (this._running)
            this.reset(); // Canvas clicked during execution ==> we need to reset the simulation

        this._running = !this._running;
    }

    start() { this._running = true; }
    stop() { this._running = false; }
    get isRunning() { return this._running; }

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
