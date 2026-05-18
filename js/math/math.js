/*************************
 * M A T H E M A T I C S *
 *************************/

import { Vector3 } from "three";

export class Integrators {
    static eulerStep(body, dt, accelerationFn) {
        const acceleration = accelerationFn(body);
        const newBody = body.clone();

        newBody.velocity.addScaledVector(acceleration, dt);
        newBody.position.addScaledVector(body.velocity, dt);
        newBody.acceleration = acceleration;

        return newBody;
    }

    static symplecticEulerStep(body, dt, accelerationFn) {
        const acceleration = accelerationFn(body);
        const newBody = body.clone();

        newBody.velocity.addScaledVector(acceleration, dt);
        newBody.position.addScaledVector(newBody.velocity, dt);
        newBody.acceleration = acceleration;

        return newBody;
    }

    static rk2Step(body, dt, accelerationFn) {
        const acceleration = accelerationFn(body);

        const derivative = (body) => ({
            dx: body.velocity.clone(),
            dv: acceleration
        });

        const k1 = derivative(body);

        const mid = body.clone();
        mid.position.addScaledVector(k1.dx, dt);
        mid.velocity.addScaledVector(k1.dv, dt);

        const k2 = derivative(mid);

        const newBody = body.clone();
        newBody.position.addScaledVector(k1.dx.clone().add(k2.dx), dt / 2);
        newBody.velocity.addScaledVector(k1.dv.clone().add(k2.dv), dt / 2);
        newBody.acceleration = acceleration;

        return newBody;
    }

    static rk4Step(body, dt, accelerationFn) {
        const acceleration = accelerationFn(body);

        const derivative = (body) => ({
            dx: body.velocity.clone(),
            dv: acceleration
        });

        const k1 = derivative(body);

        const s2 = body.clone();
        s2.position.addScaledVector(k1.dx, dt / 2);
        s2.velocity.addScaledVector(k1.dv, dt / 2);
        const k2 = derivative(s2);

        const s3 = body.clone();
        s3.position.addScaledVector(k2.dx, dt / 2);
        s3.velocity.addScaledVector(k2.dv, dt / 2);
        const k3 = derivative(s3);

        const s4 = body.clone();
        s4.position.addScaledVector(k3.dx, dt);
        s4.velocity.addScaledVector(k3.dv, dt);
        const k4 = derivative(s4);

        const newBody = body.clone();

        newBody.position
            .addScaledVector(k1.dx, dt / 6)
            .addScaledVector(k2.dx, dt / 3)
            .addScaledVector(k3.dx, dt / 3)
            .addScaledVector(k4.dx, dt / 6);

        newBody.velocity
            .addScaledVector(k1.dv, dt / 6)
            .addScaledVector(k2.dv, dt / 3)
            .addScaledVector(k3.dv, dt / 3)
            .addScaledVector(k4.dv, dt / 6);

        newBody.acceleration = acceleration;

        return newBody;
    }
}

export class Range {
    constructor(from, to, stepSize) {
        this.from = from;
        this.to = to;
        this.stepSize = stepSize || 0.1;
    }

    /**
     * Use:
     *   for (const x of range)
     *     console.log(x);
     *
     * @returns {Generator<*, void, *>}
     */
    *[Symbol.iterator]() {
        if (!isFinite(this.from) || !isFinite(this.to))
            throw new Error("Cannot iterate over an infinite interval.");
        if (this.stepSize <= 0)
            throw new Error("stepSize must be > 0");

        const n = Math.floor((this.to - this.from) / this.stepSize);
        for (let i = 0; i <= n; i++)
            yield this.from + i * this.stepSize;
    }
}

export class VectorFieldVector {
    constructor({
                    position = new Vector3(),
                    axis = new Vector3()
                } = {})  {
        this.position = position.clone();
        this.axis = axis.clone();
    }

    clone() {
        return new VectorFieldVector({
            position: this.position.clone(),
            axis: this.axis.clone(),
        });
    }

    to(view) { return { body: this, view: view}; };
}

class ScalarFieldValue {
    constructor({
                    position = new Vector3(),
                    value = 0
                } = {})  {
        this.position = position.clone();
        this.value = value;
    }

    clone() {
        return new VectorFieldVector({
            position: this.position.clone(),
            value: this.value,
        });
    }

    to(view) { return { body: this, view: view}; };
}

export class ComplexScalarFieldValue {
    constructor({
                    position = new Vector3(),
                    value = new Complex(0, 0)
                } = {})  {
        this.position = position.clone();
        this.value = value;
    }

    clone() {
        return new VectorFieldVector({
            position: this.position.clone(),
            value: this.value.clone(),
        });
    }

    get axis() { return new Vector3(0, this.value.re, this.value.im); }
}

export class VectorField {
    constructor() { }

    to(view) { return { body: this, view: view}; };

    vectorAt(positionVector) {
        throw new Error("You invoked the method of an abstract base class. Please create a subclass first.");
    }

    #centralDifferences(position, h) {
        const dx = new Vector3(h, 0, 0);
        const dy = new Vector3(0, h, 0);
        const dz = new Vector3(0, 0, h);

        const Fx1 = this.vectorAt(position.clone().add(dx));
        const Fx0 = this.vectorAt(position.clone().sub(dx));

        const Fy1 = this.vectorAt(position.clone().add(dy));
        const Fy0 = this.vectorAt(position.clone().sub(dy));

        const Fz1 = this.vectorAt(position.clone().add(dz));
        const Fz0 = this.vectorAt(position.clone().sub(dz));
        return { Fx0, Fy0, Fz0, Fx1, Fy1, Fz1 };
    }

    divergence(position, h = 1e-2) {
        const { Fx0, Fy0, Fz0, Fx1, Fy1, Fz1 } = this.#centralDifferences(position, h);

        return (
            (Fx1.x - Fx0.x) +
            (Fy1.y - Fy0.y) +
            (Fz1.z - Fz0.z)
        ) / (2 * h);
    }

    curl(position, h = 1e-2) {
        const { Fx0, Fy0, Fz0, Fx1, Fy1, Fz1 } = this.#centralDifferences(position, h);

        return new Vector3(
            (Fy1.z - Fy0.z - (Fz1.y - Fz0.y)) / (2 * h),
            (Fz1.x - Fz0.x - (Fx1.z - Fx0.z)) / (2 * h),
            (Fx1.y - Fx0.y - (Fy1.x - Fy0.x)) / (2 * h)
        );
    }

    curlMagnitude(position, h = 1e-2) {
        return this.curl(position, h).length();
    }
}

export class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    clone() { return new Complex(this.re, this.im); }

    absSquared() { return Complex.absSquared(this); }
    abs() { return Complex.abs(this); }
    phase = () => Math.atan2(this.im, this.re);

    static multiplyScalar = (a, scalar) => new Complex(a.re * scalar, a.im * scalar);
    static fromPhase = (theta) => new Complex(Math.cos(theta), Math.sin(theta));
    static absSquared(z_) { return z_.re * z_.re + z_.im * z_.im; }
    static abs = (z) => Math.sqrt(Complex.absSquared(z));
    static add = (a, b) => new Complex(a.re + b.re, a.im + b.im);
    static subtract = (a, b) => new Complex(a.re - b.re, a.im - b.im);
    static multiply = (a, b) => new Complex(
        a.re * b.re - a.im * b.im,
        a.re * b.im + a.im * b.re
    );
    static log = (z) => new Complex(Math.log(Complex.abs(z)), Math.atan2(z.im, z.re));
    static exp = (z) => new Complex(Math.exp(z.re) * Math.cos(z.im), Math.exp(z.re) * Math.sin(z.im))
    static sin(z) {
        const a = Complex.exp(new Complex(-z.im, z.re));
        const b = Complex.exp(new Complex(z.im, -z.re));
        return new Complex((a.im - b.im) / 2, (b.re - a.re) / 2);
    }
    static divide = (z1, z2) => {
        const denominator = z2.re * z2.re + z2.im * z2.im;
        const re = z1.re * z2.re + z1.im * z2.im;
        const im = z1.im * z2.re - z1.re * z2.im;
        return new Complex(re / denominator, im / denominator);
    }
    static sqrt(z) {
        const r = Complex.abs(z);
        const real = Math.sqrt((r + z.re) / 2);
        const imag = Math.sign(z.im || 1) * Math.sqrt((r - z.re) / 2);
        return new Complex(real, imag);
    }
}

/**
 * This class contains a function F(u, v) => (x, y, z) used to create a parametric surface instance.
 */
export class ParametricSurfaceDefinition {
    sample(u, v, target) {
        throw new Error("Abstract class: sample() not implemented!");
    }
}