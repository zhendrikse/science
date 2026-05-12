import { Color, Vector3, BoxGeometry, MeshStandardMaterial, Mesh } from "three";
import {ThreeJsUtils} from "../js/three-js-extensions.js";
import {UPlotGraph, Box, Block, ThreeSim} from "../js/threesim.js";

const overlay = document.getElementById('floatingBlockOverlayText');
const canvas = document.getElementById('floatingBlockCanvas');

const liquidDensity = 1000;
const g = -9.8;

class WoodenBlock extends Block {
    constructor({ density = 500, size = new Vector3(1, 1, 1) } = {}) {
        super({size: size, mass: density * size.x * size.y * size.z});
        this._force = new Vector3();
    }

    submergedVolume(water) {
        const topFluid = water.position.y + water.size.y / 2;
        const topBlock = this.position.y + this.size.y / 2;
        const bottomBlock = this.position.y - this.size.y / 2;

        let hSubmerged = 0;
        if (topBlock <= topFluid)
            hSubmerged = this.size.y;
        else if (bottomBlock >= topFluid)
            hSubmerged = 0;
        else
            hSubmerged = topFluid - bottomBlock;

        return this.size.x * hSubmerged * this.size.z;
    }

    buoyancyForce(water) {
        return liquidDensity * -g * this.submergedVolume(water);
    }

    dragForce() {
        const dragCoefficient = -5.0;
        return dragCoefficient * this.velocity.y;
    }

    netForce(water) {
        const Fg = this.mass * g;
        this._force.y = Fg + this.buoyancyForce(water) + this.dragForce();
        return this._force;
    }
}

const water = new Block({size: new Vector3(2, 2, 0.75) });
const woodenBlock = new WoodenBlock( {size: new Vector3(0.4, 0.4, 0.1) });

const simulation = new ThreeSim({
    canvas,
    overlay
})

simulation.attachStatically(water.to(new Box({ color: 0x1e90ff, transparent: true, opacity: 0.4 })));
simulation.attach(woodenBlock.to(new Box({ color: 0xdeb887 })));

//
// Graph
//
const plot = new UPlotGraph({
    plotDiv: document.getElementById("forceChart"),
    dataDefinition: [
        { label: "t [s]", color: "yellow" },
        { label: "buoyancy", color: "magenta" },
        { label: "drag", color: "blue" }
    ],
    width: canvas.clientWidth,
    height: canvas.clientHeight * 0.5,
    title: "Buoyancy & drag forces",
    xLabel: "Simulation time",
    yLabel: "y [m]"
});

plot.graphData[0] = [0]; // time
plot.graphData[1] = [woodenBlock.buoyancyForce(water)];
plot.graphData[2] = [woodenBlock.dragForce()];

let running = false;
canvas.addEventListener("click", () => {
    if (!running) {
        ThreeJsUtils.showOverlayMessage(overlay, "Started");
        running = true;
    }
});

let t = 0;
const dt = 0.001;
simulation.run( () => {
    for (let subStep = 0; subStep < 20; subStep++) {
        woodenBlock.apply(woodenBlock.netForce(water), dt);
        t += dt;
    }

    plot.graphData[0].push(t);
    plot.graphData[1].push(woodenBlock.buoyancyForce(water));
    plot.graphData[2].push(woodenBlock.dragForce());
    plot.update();
});
