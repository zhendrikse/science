import { Vector3, Color } from "three";
import {AxialSymmetricBody, ThreeSim, Arrow, Cylinder} from "../js/threesim.js";

const canvas = document.getElementById("antennaCanvas");

const show_decrease = true;
const lambda_ = 2.0;  // 1e-10
const c = 3e8;
const omega = 2 * Math.PI * c / lambda_;
const d = 2 * lambda_;
const L = 2 * lambda_;
const i_hat = new Vector3(1, 0, 0);

//antenna = cylinder(pos=vector(0, -L / 2, 0), axis=vector(0, L, 0), color=vector(.7, .7, .7), radius=0.5)

const ds = lambda_ / 10.0;
const dt = lambda_ / c / 100.0;
const dist_to_screen = 4.0 * lambda_;

const slit1 = new Vector3(0, 0, -d / 2);

class ElectromagneticWave {
    constructor(E0= lambda_ * 5) {
        this._E0 = E0;
        this._electric_field = [];
        this._magnetic_field = [];

        const dtheta = Math.PI / 3;
        const range = [];
        const R = dist_to_screen;
        for (let theta = 0; theta < 2 * Math.PI; theta += dtheta)
            range.push(new Vector3(R * Math.cos(theta), 0, R * Math.sin(theta)));

        for (let r1 of range) 
            this._createEmWave(r1);
    }

    _createEmWave(r1) {
        const dr1 = r1.normalize().multiplyScalar(ds);
        let rr1 = slit1.clone().add(dr1.clone().multiplyScalar(10)); //vector(0,0,0) ## current loc along wave 1
        for (let ct = 0; ct < 120; ct++) {
            const y = this._E0 * Math.cos(rr1.clone().sub(slit1).length() * 2 * Math.PI) / lambda_;
            const axis = new Vector3(0, y, 0);
            const electric_arrow = new AxialSymmetricBody({
                position: rr1.clone(),
                axis: axis
            });
            const magnetic_arrow = new AxialSymmetricBody({
                position: rr1.clone(),
                axis: new Vector3()
            });
            this._magnetic_field.push(magnetic_arrow);
            this._electric_field.push(electric_arrow);
            rr1.add(dr1);
        }
    }

    update(t) {
        for (let index = 0; index < this._electric_field.length; index++) {
            const field_arrow = this._electric_field[index];
            const decrease = show_decrease ? 1 / (field_arrow.position.length()+ lambda_ / 20) : 1.0;
            field_arrow.axis.y = decrease * this._E0 * Math.cos(
                omega * t - 2 * Math.PI * (field_arrow.position.clone().sub(slit1).length()) / lambda_);
            this._magnetic_field[index].axis.copy(field_arrow.axis.clone().cross(i_hat).multiplyScalar(-.7));
        }
    }

    set fieldStrength(strength) { this._E0 = strength; }
    get electricField() { return this._electric_field; }
    get magneticField() { return this._magnetic_field; }
}

const emWave = new ElectromagneticWave();

const simulation = new ThreeSim({
    canvas,
    cameraPosition: new Vector3(-1, 4, -9).multiplyScalar(1.4),
});

for (let axialBody of emWave.electricField)
    simulation.attachStatically(axialBody.to(new Arrow({
        color: new Color("orange"),
        size: .5
    })));

for (let axialBody of emWave.magneticField)
    simulation.attachStatically(axialBody.to(new Arrow({
        color: new Color("cyan"),
        size: .5
    })));

const antenna = new AxialSymmetricBody({
    position: new Vector3(0, -L / 2, 0),
    axis: new Vector3(0, L, 0),
    radius: 0.5
});
simulation.attachStatically(antenna.to(new Cylinder({color: new Color(0.7, 0.7, 0.7)})));

let time = 0;
simulation.run(() => {
    emWave.update(time);
    time += dt;
});