/**
 * Pick a number from a normal distribution using Box-Muller transform.
 *
 * @param mu Average.
 * @param sigma Standard deviation
 * @returns A normally distributed number.
 */
export function normalDistribution(mu, sigma) {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * sigma + mu;
}


/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function randomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    static multiplyScalar = (a, scalar) => new Complex(a.re * scalar, a.im * scalar);
    static fromPhase = (theta) => new Complex(Math.cos(theta), Math.sin(theta));
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

    static absSquaredPlusC(z_, c_) {
        return new Complex(z_.re * z_.re - z_.im * z_.im + c_.re, Math.abs(2 * z_.re * z_.im) + c_.im);
    }
    static squaredPlusC(z_, c_) {
        return new Complex(z_.re * z_.re - z_.im * z_.im + c_.re, 2 * z_.re * z_.im + c_.im);
    }
    static absSquared(z_) { return z_.re * z_.re + z_.im * z_.im; }
}

// js/fft-esm.js
// ESM-versie van fft.js suitable for browser
export class FFT {
    constructor(size) {
        this._size = size | 0;
        if (this._size <= 1) throw new Error("Size must be > 1");

        this._twiddles = new Array(this._size);
        for (let i = 0; i < this._size; i++) {
            const phase = -2 * Math.PI * i / this._size;
            this._twiddles[i] = [Math.cos(phase), Math.sin(phase)];
        }

        this._bitReverse = new Array(this._size);
        const n = this._size;
        const bits = Math.floor(Math.log2(n));
        for (let i = 0; i < n; i++) {
            let x = i;
            let y = 0;
            for (let j = 0; j < bits; j++) {
                y = (y << 1) | (x & 1);
                x >>= 1;
            }
            this._bitReverse[i] = y;
        }
    }

    transform(outRe, outIm, inRe, inIm) {
        const n = this._size;
        for (let i = 0; i < n; i++) {
            outRe[i] = inRe[this._bitReverse[i]];
            outIm[i] = inIm[this._bitReverse[i]];
        }

        for (let size = 2; size <= n; size <<= 1) {
            const half = size >> 1;
            const step = n / size;
            for (let i = 0; i < n; i += size) {
                for (let j = 0; j < half; j++) {
                    const k = j * step;
                    const [twRe, twIm] = this._twiddles[k];
                    const l = i + j;
                    const r = i + j + half;

                    const tRe = outRe[r] * twRe - outIm[r] * twIm;
                    const tIm = outRe[r] * twIm + outIm[r] * twRe;

                    outRe[r] = outRe[l] - tRe;
                    outIm[r] = outIm[l] - tIm;
                    outRe[l] += tRe;
                    outIm[l] += tIm;
                }
            }
        }
    }

    inverseTransform(outRe, outIm, inRe, inIm) {
        const n = this._size;
        // conjugate
        const tempRe = inRe.slice();
        const tempIm = inIm.map(x => -x);
        this.transform(outRe, outIm, tempRe, tempIm);
        // normalize and conjugate back
        for (let i = 0; i < n; i++) {
            outRe[i] /= n;
            outIm[i] = -outIm[i] / n;
        }
    }

    fft2D(real, imag) {
        // rows
        for (let i = 0; i < this._size; i++)
            this.transform(real[i], imag[i], real[i].slice(), imag[i].slice());

        // columns
        for (let j = 0; j < this._size; j++) {
            const colRe = new Array(this._size);
            const colIm = new Array(this._size);

            for (let i = 0; i < this._size; i++) {
                colRe[i] = real[i][j];
                colIm[i] = imag[i][j];
            }

            const outRe = new Array(this._size);
            const outIm = new Array(this._size);

            this.transform(outRe, outIm, colRe, colIm);

            for (let i = 0; i < this._size; i++) {
                real[i][j] = outRe[i];
                imag[i][j] = outIm[i];
            }
        }
    }
}
