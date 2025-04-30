const c = 1.0; // Speed of light
const G = 2e-3; // Gravitational constant
const blackHoleCanvasWidth = 650;
const blackHoleCanvasHeight = 325;

function isString(value) {
    return typeof value === 'string';
}

class HtmlCanvasImage {
    constructor(width, height) {
        const Array2D = (r, c) => Array.from({length: r}, () => Array.from({length: c}, () => [0, 0, 0]));
        this.colours = Array2D(width, height);
    }

    setColour(pixelX, pixelY, colour) {
        this.colours[pixelX][pixelY] = colour;
    }
}

class BlackHole {
    constructor(position, mass) {
        this.position = new Vector(position.x, position.y, position.z);
        this.mass = mass;
        this.radius = 2 *  mass * G / c**2;
    }
}

class Vector {
    constructor(x=0, y=0, z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    mag() {
        return Math.sqrt(this.dot(this));
    }

    normalize() {
        const norm = this.mag();
        return new Vector(this.x / norm, this.y / norm, this.z / norm);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross(other) {
        return new Vector(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    multiplyScalar(scalar) {
        return new Vector(scalar * this.x, scalar * this.y, scalar * this.z);
    }

    subtract(other) {
        return new Vector(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    dist(other){
        return this.subtract(other).mag();
    }

    rotateAroundZ(angleDegrees) {
        const angle = angleDegrees * Math.PI / 180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        return new Vector(
            cosA * this.x - sinA * this.y,
            sinA * this.x + cosA * this.y,
            this.z
        );
    }
}

class Color {
    constructor(value = [0, 0, 0]) {
        if (isString(value)) {
            this.r = parseInt(value.slice(1, 3), 16);
            this.g = parseInt(value.slice(3, 5), 16);
            this.b = parseInt(value.slice(5, 7), 16);
        } else {
            this.r = value[0];
            this.g = value[1];
            this.b = value[2];
        }
        this.value = [this.r, this.g, this.b];
    }
}

class Texture {
    constructor(im_file, width, height) {
        this.pixels = np.array(pil.Image.open(im_file))
        this.width = width
        this.height = height
        this.im_width = this.pixels.shape[0]
        this.im_height = this.pixels.shape[1]
    }

    get_color(x, y) {
        x = Math.min(Math.trunc(Math.round(x*(this.im_width-1)/this.width)), this.im_width-1);
        y = Math.min(Math.trunc(Math.round(y*(this.im_height-1)/this.height)), this.im_height-1);
        return new Color(this.pixels[x, y]);
    }
}

class Disk {
    constructor(origin, inner_r, outer_r, color=new Color([0.75, 0.15, 0.15]), texture=null) {
        this.origin = origin
        this.inner_r = inner_r
        this.outer_r = outer_r
        this.color = color
        this.texture = texture === null ? null : new Texture(texture, 2 * this.outer_r, 2 * this.outer_r);
    }

    is_in(point) {
        const r = point.subtract(this.origin).mag();
        return r <= this.outer_r && r >= this.inner_r
    }

    color_at(point) {
        if (this.texture !== null)
            return this.texture.get_color(point.x + this.outer_r, point.z + this.outer_r);
        else
            return this.color
    }
}

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.position = origin;
        this.direction = direction.normalize();
        this.velocity = this.direction.multiplyScalar(c);
        this.acceleration = new Vector(0, 0, 0);
        this.total_time = 0;
        this.crossed_xz = false;
        this.cross_point = null;
    }

    point(dist) {
        return this.origin.add(this.direction.multiplyScalar(dist));
    }

    accelerate(a) {
        this.acceleration = a
    }

    step(t) {
        this.prev_pos = this.position;
        this.velocity = this.velocity.add(this.acceleration.multiplyScalar(t));
        this.velocity = this.velocity.normalize().multiplyScalar(c);
        this.position = this.position
            .add(this.velocity.multiplyScalar(t))
            .add(this.acceleration.multiplyScalar(0.5 * t * t));
        this.total_time += t;

        this.crossed_xz = (0 <= Math.max(this.prev_pos.y, this.position.y) && 0 >= Math.min(this.prev_pos.y, this.position.y));

        if (this.crossed_xz) {
            const a = this.prev_pos;
            const b = this.position;
            const l = b.subtract(a);
            this.cross_point = new Vector(a.x - (a.y / l.y) * l.x, 0, a.z - (a.y / l.y) * l.z);
        }
    }
}

class Camera {
    constructor(origin, direction, focal_length) {
        this.origin = origin;
        this.direction = direction.normalize();
        this.focal_length = focal_length;
        this.normal = origin.add(direction.multiplyScalar(focal_length));
        this.right = new Vector(1, 0, 0);
        this.up = this.normal.cross(this.right).normalize();
        this.rotateZ();
    }

    rotateZ(angle=20) {
        this.right = this.right.rotateAroundZ(angle);
        this.up = this.up.rotateAroundZ(angle);
    }

    ray(x, y) {
        const point = this.normal.add(this.right.multiplyScalar(x)).add(this.up.multiplyScalar(y));
        return new Ray(this.origin, point.subtract(this.origin));
    }
}

class Image {
    constructor(width, height){
        this.width = width
        this.height = height
        this.pixels = new HtmlCanvasImage(width, height);
    }
}

class Scene {
    constructor(camera, blackhole, disk, width, height) {
        this.camera = camera;
        this.width = width;
        this.height = height;
        this.image = new HtmlCanvasImage(width, height);
        this.blackhole = blackhole;
        this.disk = disk;
    }
}

class Engine {
    constructor(scene, n_iter=200, dt=0.002) {
        this.scene = scene;
        this.n_iter = n_iter;
        this.dt = dt;
    }

    renderToImageData(canvasWidth, canvasHeight) {
        this.render(); // fill the array this.scene.image.colours with colours representing the final image

        const imgData = new ImageData(canvasWidth, canvasHeight);

        for (let x = 0 ; x < canvasWidth; x++) {
            for (let y = 0 ; y < canvasHeight; y++) {
                const coord = y * (canvasWidth * 4) + x * 4;
                const color = this.scene.image.colours[x][y];

                imgData.data[coord + 0] = color[0];
                imgData.data[coord + 1] = color[1];
                imgData.data[coord + 2] = color[2];
                imgData.data[coord + 3] = 255;
            }
        }

        return imgData;
    }

    render() {
        const ratio = this.scene.width / this.scene.height
        // NOTE:
        // In the original VPython version, the rendering canvas uses a wide field of view
        // due to implicit scene scaling (center and range parameters).
        // To match the same visual output in this raw JavaScript version,
        // we need to manually increase the size of the image plane window.
        //
        // The values below (e.g., x0 = -8, x1 = 8) effectively simulate that wide view.
        // This compensates for the lack of automatic scene scaling in JavaScript.
        const x0 = -9.0,
            x1 = 9.0,
            y0 = -9.0 / ratio,
            y1 = 9.0 / ratio,
            xstep = (x1 - x0) / (this.scene.width - 1),
            ystep = (y1 - y0) / (this.scene.height - 1);

        for (let j = 0; j < this.scene.height; j++) {
            const y = y0 + j * ystep;
            // if ((j+1) % 10 === 0) {
            //     console.log('line ' + (j+1) + '/' + this.scene.height);
            //     this.scene.image.render();
            // }

            for (let i = 0; i < this.scene.width; i++) {
                const x = x0 + i * xstep;
                const ray = this.scene.camera.ray(x, y);
                this.scene.image.setColour(i, j, this.trace(ray));
            }
        }

        //this.scene.image.render();
        // TODO ?
        //this.output = Image.fromarray(this.scene.image.pixels.astype(np.uint8))
    }

    trace(ray) {
        let color = null; // Start with null to detect if set later

        for (let t = 0; t < this.n_iter; t++) {
            const r = this.scene.blackhole.position.subtract(ray.position);
            // NOTE: The theoretical gravitational acceleration for the falloff goes as 1 / |r|⁵,
            // i.e., a = r̂ * (7e-3 * M / |r|⁵). This creates a strong lensing effect near the black hole.
            // However, in this version we approximate it using 1 / |r|² by writing:
            //     a = r̂ * (7e-3 * M / r.dot(r))
            // This is done for stability and performance:
            // - Computing |r|⁵ requires a sqrt and multiple powers, which is slow
            // - Dividing by |r|⁵ can explode near the black hole, causing NaNs or erratic behavior
            // - The 1 / |r|² approximation, with tuned constants, still gives a strong lensing effect
            //   while avoiding the risk of numerical instability
            const a = r.normalize().multiplyScalar(7.0e-3 * this.scene.blackhole.mass / r.dot(r));
            ray.accelerate(a);
            ray.step(t * this.dt);

            const rayBlackHoleDistance = ray.position.subtract(this.scene.blackhole.position).mag();

            if (ray.crossed_xz && ray.cross_point && this.scene.disk.is_in(ray.cross_point)) {
                color = this.calculateRayColor(ray);
                break;
            } else if (rayBlackHoleDistance <= this.scene.blackhole.radius) {
                break;
            } else if (rayBlackHoleDistance >= 15.0) {
                break;
            }
        }

        return (color && Array.isArray(color)) ? color : [13, 13, 13];
    }

    calculateRayColor(ray) {
        const point = ray.cross_point;
        const distance = point.subtract(this.scene.blackhole.position).mag();
        let brightness = this.calculateBrightness(distance);

        const red = 255;
        const green = brightness < 0.5 ? Math.round(255 * brightness * 2) : 255;
        const blue = brightness < 0.5 ? 0 : Math.round(255 * (brightness - .5) * 2);
        return [red, green, blue];
    }

    calculateBrightness(distance) {
        const inner = this.scene.disk.inner_r;
        const outer = this.scene.disk.outer_r;
        let brightness = 1.0 - (distance - inner) / (outer - inner);
        brightness = Math.max(0.0, Math.min(1.0, brightness));
        return brightness ** 2.5;  // nonlinear falloff
    }
}

self.onmessage = (event) => {
    if (event.data.type === "start") {
        const c_origin = new Vector(0, -.75, -9.0);
        const c_focus = new Vector(0, 0, 0.0);
        const bh = new BlackHole(c_focus, 85);
        const disk = new Disk(c_focus, 4.5 * bh.radius, 16.2 * bh.radius);
        const scene = new Scene(
            new Camera(c_origin, c_focus.subtract(c_origin), 1.2),
            bh,
            disk,
            blackHoleCanvasWidth,
            blackHoleCanvasHeight
        );

        const engine = new Engine(scene);
        const imageData = engine.renderToImageData(blackHoleCanvasWidth, blackHoleCanvasHeight);
        //engine.save('images/blackhole.png');

        self.postMessage(imageData);
    }
};
