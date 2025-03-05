from vpython import log, canvas, rate, curve, vector, color
import random

title = """&#x2022; Based on <a href="https://github.com/ragnraok/RandomFractalTerrain-Vpython">RandomFractalTerrain-Vpython</a>
&#x2022; Refactored and extended by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/fractal_terrain.py">fractal_terrain.py</a>

"""

display = canvas(width=600, title=title, background=color.gray(0.075))

class Diamond:
    """
    a -- b -- c
    |    |    |
    d -- e -- f
    |    |    |
    g -- h -- i
    """
    def __init__(self, x, y, span, height, random_value):
        half = span >> 1
        self.a = vector(x, y, height[y][x])
        self.c = vector(x + span, y, height[y][x + span])
        self.g = vector(x, y + span, height[y + span][x])
        self.i = vector(x + span, y + span, height[y + span][x + span])

        average_height = .25 *  (self.a.z + self.c.z + self.g.z + self.i.z)
        self.e = vector(x + half, y + half, average_height + random_value)
        height[int(self.e.y)][int(self.e.x)] = self.e.z


class Square:
    """
    a -- b -- c
    |    |    |
    d -- e -- f
    |    |    |
    g -- h -- i
    """
    def __init__(self, x, y, span, height):
        self.half = half = span >> 1
        self.a = vector(x, y, height[y][x])
        self.b = vector(x + half, y, height[y][x + half])
        self.c = vector(x + span, y, height[y][x + span])
        self.d = vector(x, y + half, height[y + half][x])
        self.e = vector(x + half, y + half, height[y + half][x + half])
        self.f = vector(x + span, y + half, height[y + half][x + span])
        self.g = vector(x, y + span, height[y + span][x])
        self.h = vector(x + half, y + span, height[y + span][x + half])
        self.i = vector(x + span, y + span, height[y + span][x + span])

    def set_random_heights(self, random_values, terrain_size, height):
        x, y = self.a.x, self.a.y
        half = self.half
        above_b = vector(x + half, y - half >= 0 and y - half or terrain_size - half, 0)
        left_d = vector(x - half >= 0 and x - half or terrain_size - half, y + half, 0)
        right_f = vector(x + half * 3 <= terrain_size and x + half * 3 or half, y + half, 0)
        below_h = vector(x + half, y + half * 3 <= terrain_size and y + half * 3 or half, 0)

        # the four diamonds
        self._square_height_calculator(height, random_values[0], self.a, self.e, self.g, left_d, self.d)
        self._square_height_calculator(height, random_values[1], self.a, self.e, self.c, above_b, self.b)
        self._square_height_calculator(height, random_values[2], self.c, self.e, self.i, right_f, self.f)
        self._square_height_calculator(height, random_values[3], self.g, self.e, self.i, below_h, self.h)

    def _square_height_calculator(self, height, random_value, a, b, c, d, center_point):
        tmp = [height[int(point.y)][int(point.x)] for point in [a, b, c, d]]
        average = sum(tmp) / len(tmp)
        center_point.z = average + random_value
        height[int(center_point.y)][int(center_point.x)] = center_point.z


def random_fractal(size, smoothness=1, z_scale=50):
    final_size = 1
    while final_size < size:
        final_size <<= 1
    tmp_result = [[0 for i in range(final_size  + 1)] for i in range(final_size + 1)]
    iterate(tmp_result, smoothness, z_scale)
    final_result = [0 for i in range(size)]
    for row in range(size):
        final_result[row] = tmp_result[row][:size] 
    
    return final_result

def iterate(height, smoothness, z_scale):
    count = 0
    iter_num = log(len(height) - 1, 2)
    while count < iter_num:
        count += 1
        diamond(height, count, generate_random_num(count, smoothness, z_scale))
        square(height, count, smoothness, z_scale)

def diamond(height, count, random_value):
    terrain_size = len(height) - 1
    num_seg = 1 << (count - 1)
    span = terrain_size // num_seg
    for x in range(0, terrain_size, span):
        for y in range(0, terrain_size, span):
            _ = Diamond(x, y, span, height, random_value)


def square(height, count, smoothness, z_scale):
    terrain_size = len(height) - 1
    num_seg = 1 << (count - 1)
    span = terrain_size // num_seg
    for x in range(0, terrain_size, span):
        for y in range(0, terrain_size, span):
            square_ = Square(x, y, span, height)
            square_.set_random_heights([generate_random_num(count, smoothness, z_scale) for i in range(4)], terrain_size, height)

    for y in range(0, terrain_size, span):
        height[y][terrain_size] = height[y][0]

    for x in range(0, terrain_size, span):
        height[terrain_size][x] = height[0][x]


def generate_random_num(count, smoothness, z_scale):
    _reduce = 1
    for i in range(count):
        _reduce *= pow(2, -smoothness)
    return _reduce * random.randint(-z_scale, z_scale)

# from -GRID_SIZE to GRID_SIZE
GRID_SIZE = 200 # The size of the grid itself in pixels
SIZE = 60 # The higher, the more lines are drawn in the grid
Z_SCALE = 200
SMOOTHNESS = 1

class Grid:
    def __init__(self, size, height):
        has_height = (height is not None and len(height) != 0)
        row_step = (GRID_SIZE - (-GRID_SIZE)) / float(size - 1)
        col_step = (GRID_SIZE - (-GRID_SIZE)) / float(size - 1)

        # first calculate all points
        points = [vector(GRID_SIZE - col * col_step, has_height and height[row][col] or 0, GRID_SIZE - row * row_step) for
                row in range(size) for col in range(size)]

        # horizontal lines
        self._horizontal_curves = []
        for i in range(0, len(points), size):
            for j in range(size - 1):
                self._horizontal_curves.append(curve(pos=[points[i + j], points[i + j + 1]]))
                hue =1.5 + .5 * (points[i + j].y +  points[i + j + 1].y) / Z_SCALE
                self._horizontal_curves[-1].color = color.hsv_to_rgb(vector(hue, .9, 1.0))

        # vertical lines
        self._vertical_curves = []
        for i in range(0, size):
            for j in range(0, len(points) - size, size):
                if i + j < len(points) and i + j + size < len(points):
                    self._vertical_curves.append(curve(pos=[points[i + j], points[i + j + size]]))
                    hue =1.5 + .5 * (points[i + j].y +  points[i + j + 1].y) / Z_SCALE
                    self._vertical_curves[-1].color = color.hsv_to_rgb(vector(hue, .9, 1.0))

def refresh_screen(evt):
    for obj in display.objects:
        obj.visible = False
        obj.clear()

    height = random_fractal(SIZE, z_scale=Z_SCALE, smoothness=SMOOTHNESS)
    _ = Grid(SIZE, height)

def main_loop():
    display.forward = vector(-100, -60, -100)
    display.bind("click", refresh_screen)
    refresh_screen(None)
    while True:
        rate(10)


if __name__ == '__main__':
    main_loop()
