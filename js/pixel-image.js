export const Colors = Object.freeze({
    RED: [1, 0, 0],
    GREEN: [0, 1, 0],
    BLUE: [0, 0, 1],
    CYAN: [0, 1, 1],
    MAGENTA: [1, 0, 1],
    YELLOW: [1, 1, 0],
    ORANGE: [1, .6, 0],
    PURPLE: [0.4, 0.2, 0.6],
    GRAY: [.5, .5, .5],
    WHITE: [1, 1, 1],
    BLACK: [0, 0, 0],
});

export class Pixel {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

export class PixelImage {
    constructor(width, height, pixelSize = 1, backgroundColor = null) {
        const Array2D = (r, c) =>
            [...Array(r)].map(_ => Array(c).fill(backgroundColor));

        this.pixelSize = pixelSize;
        this.width = width;
        this.height = height;
        this.colours = Array2D(this.dimX(), this.dimY());
    }

    #asCanvasImageData(context) {
        const imageData = context.createImageData(this.width, this.height);
        for (let x = 0 ; x < this.width; x++)
            for (let y = 0 ; y < this.height; y++)
                this.#setPixelColor(imageData.data, new Pixel(x, y, this.colours[x][y], this.pixelSize));
        return imageData;
    }

    #setPixelColor(imageData, pixel) {
        let coordinate = pixel.y * (this.width * 4) + pixel.x * 4;

        if (pixel.color === null) {
            imageData[coordinate + 3] = 0; // completely transparant
            return;
        }

        imageData[coordinate++] = pixel.color[0] * 255;
        imageData[coordinate++] = pixel.color[1] * 255;
        imageData[coordinate++] = pixel.color[2] * 255;
        imageData[coordinate++] = 255;
    }


    setColour = (pixel) => {
        if (pixel.x < 0 || pixel.y < 0 || pixel.x >= this.dimX() || pixel.y >= this.dimY()) return;
        this.colours[pixel.x][pixel.y] = pixel.color;
    }

    dimX = () => this.width / this.pixelSize;
    dimY = () => this.height / this.pixelSize;

    drawLine(fromPixel, toPixel) {
        // Bresenham with color interpolation
        let x0 = fromPixel.x | 0,
            y0 = fromPixel.y | 0,
            x1 = toPixel.x | 0,
            y1 = toPixel.y | 0;

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        // Interpolate color
        const steps = Math.max(dx, dy) || 1;
        const dr = (toPixel.color[0] - fromPixel.color[0]) / steps;
        const dg = (toPixel.color[1] - fromPixel.color[1]) / steps;
        const db = (toPixel.color[2] - fromPixel.color[2]) / steps;

        let step = 0;

        while (true) {
            const r = fromPixel.color[0] + dr * step;
            const g = fromPixel.color[1] + dg * step;
            const b = fromPixel.color[2] + db * step;
            this.setColour(new Pixel(x0, y0, [r, g, b]));

            if (x0 === x1 && y0 === y1) break;

            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }

            step++;
        }
    }


    render(context) {
        context.clearRect(0, 0, this.width, this.height);
        context.putImageData(this.#asCanvasImageData(context), 0, 0);
    }
}