import { Group, WebGLRenderer, BoxGeometry, MeshStandardMaterial, Mesh, Vector3 } from "three";

export class Pool extends Group {
    constructor(length, width) {
        super();

        const wallMaterial = new MeshStandardMaterial({ color: 0xffff00 });
        const waterMaterial = new MeshStandardMaterial({
            color: 0x0099ff,
            transparent: true,
            opacity: .5
        });

        const depth = .3;
        const thickness = .05;
        this._wallThickness = thickness;
        this._width = width;
        this._length = length;

        const water = new Mesh(new BoxGeometry(length, depth, width), waterMaterial);
        water.position.y = -depth / 2;
        this.add(water);

        const back = new Mesh(new BoxGeometry(length, .65, thickness), wallMaterial);
        back.position.set(0, -.15, -width / 2);
        this.add(back);

        const left = new Mesh(new BoxGeometry(thickness, .65, width), wallMaterial);
        left.position.set(-length / 2, -0.15, 0);
        this.add(left);

        const right = left.clone();
        right.position.x = length / 2;
        this.add(right);

        const bottom = new Mesh(new BoxGeometry(length, thickness, width), wallMaterial);
        bottom.position.y = -depth;
        this.add(bottom);
    }

    get wallThickness() { return this._wallThickness; }
    get length() { return this._length; }
    get width() { return this._width; }
}

export class Wave {
    constructor(nx, ny, size, obstacle=null) {
        this._numVerticesX = nx;
        this._numVerticesY = ny;
        this.vertexDistance = size;
        this._obstacle = obstacle;
        this._size = size;

        this._dx = size / (nx - 1);
        this._dy = size / (ny - 1);

        const c = 1.5;
        const dt = 0.4 * this._dx / c;

        this._r = (c * dt / this._dx) * (c * dt / this._dy);

        this.minHeight = -0.2;
        this.maxHeight = 0.2;

        this._old = [];
        this._next = [];
        this._current = [];
        this.reset();
    }

    reset() {
        this._old = Array.from({ length: this._numVerticesX }, () => new Float32Array(this._numVerticesY));
        this._current = Array.from({ length: this._numVerticesX }, () => new Float32Array(this._numVerticesY));
        this._next = Array.from({ length: this._numVerticesX }, () => new Float32Array(this._numVerticesY));
    }

    get amplitudes() { return this._current }
    get numVerticesX() { return this._numVerticesX; }
    get numVerticesY() { return this._numVerticesY; }

    _shiftBuffers() {
        let temp = this._old;
        this._old = this._current;
        this._current = this._next;
        this._next = temp;
    }

    _finiteDifferenceStep(i, j, damping) {
        const x = (i / (this._numVerticesX - 1) - 0.5) * this._size;
        const y = (j / (this._numVerticesY - 1) - 0.5) * this._size;

        if (this._obstacle) {
            const b = this._obstacle.boundaries();
            const insideObstacle = x >= b.start && x <= b.start + b.width && y >= b.yStart && y <= b.yEnd;
            if (insideObstacle) {
                this._next[i][j] = 0;   // water cannot move inside obstacle
                this._current[i][j] = 0;
                this._old[i][j] = 0;
                return;
            }

            const front = b.start + b.width; // right side of box
            if (Math.abs(x - front) < 5 * this._dx && y >= b.yStart && y <= b.yEnd && this._obstacle.isMoving()) {
                const dist = x - front;
                const sigma = 0.1 * this._size;  // aan te passen
                const amplitude = 0.25 * this._obstacle.speed;
                const waveShape = Math.exp(-0.05 * (dist / sigma) * (dist / sigma));  // Gaussian
                this._next[i][j] = amplitude * waveShape;
                return;
            }
        }

        this._next[i][j] = 2 * this._current[i][j] - this._old[i][j] +
            this._r * (
                this._current[i+1][j] +
                this._current[i-1][j] +
                this._current[i][j+1] +
                this._current[i][j-1] -
                4 * this._current[i][j]
            ) * damping;
    }

    update(damping = 0.9995) {
        for (let i = 1; i < this._numVerticesX - 1; i++)
            for (let j = 1; j < this._numVerticesY - 1; j++)
                this._finiteDifferenceStep(i, j, damping);

        this._shiftBuffers();
    }

    disturbAt(xFrac, yFrac) {
        const x = Math.floor(xFrac * this._numVerticesX);
        const y = Math.floor(yFrac * this._numVerticesY);

        this._current[x][y] += 0.95;
    }

    normalAt(i, j) {
        const clampX = (x) => Math.max(0, Math.min(x, this._numVerticesX - 1));
        const clampY = (y) => Math.max(0, Math.min(y, this._numVerticesY - 1));

        const hL = this._current[clampX(i - 1)][j];
        const hR = this._current[clampX(i + 1)][j];
        const hD = this._current[i][clampY(j - 1)];
        const hU = this._current[i][clampY(j + 1)];

        const dHx = (hR - hL) / (2 * this._dx);
        const dHy = (hU - hD) / (2 * this._dy);

        return new Vector3(-dHx, 1.0, -dHy).normalize();
    }
}

export class Obstacle extends Group {
    constructor({
                    pool = null,
                    speed = 0,
                    opacity = 0.8,
                    start = -1 / 6,
                    color = 0x00ff00
                } = {}) {
        super();

        this._pool = pool;
        this._width = pool.width / 3;
        this._yStart = -pool.width / 6;
        this._yEnd = pool.width / 6;

        this._start = start * pool.width + pool.wallThickness;
        this._initialStart = this._start;

        this._speed = speed;
        this._reachedEnd = false;

        const geometry = new BoxGeometry(this._width, 0.6, this._yEnd - this._yStart);
        const material = new MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });

        this.mesh = new Mesh(geometry, material);
        this.mesh.position.set(this._start + this._width / 2, 0.3, (this._yStart + this._yEnd) / 2);
        this.add(this.mesh);
    }

    get speed() { return this._speed; }

    boundaries(){
        return {
            start: this._start,
            width: this._width,
            yStart: this._yStart,
            yEnd: this._yEnd
        }
    }

    move(dt=0.01){
        if(this._reachedEnd) return;

        this._start += this._speed * dt;
        this.mesh.position.x = this._start + this._width / 2;

        this._reachedEnd = this._start + this._width + this._pool.wallThickness * .5 >= this._pool.width / 2;
    }

    isMoving() {
        return !this._reachedEnd && Math.abs(this._speed) > 0;
    }

    reset(){
        this._start = this._initialStart;
        this._reachedEnd = false;
        this.mesh.position.set(this._start + this._width / 2, 0.3, (this._yStart + this._yEnd) / 2);
    }
}
