from random import Random

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

    def center_point(self):
        return self.e


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
        self._set_height_for_square(height, random_values[0], self.a, self.e, self.g, left_d, self.d)
        self._set_height_for_square(height, random_values[1], self.a, self.e, self.c, above_b, self.b)
        self._set_height_for_square(height, random_values[2], self.c, self.e, self.i, right_f, self.f)
        self._set_height_for_square(height, random_values[3], self.g, self.e, self.i, below_h, self.h)

    def _set_height_for_square(self, height, random_value, a, b, c, d, center_point):
        tmp = [height[int(point.y)][int(point.x)] for point in [a, b, c, d]]
        average = sum(tmp) / len(tmp)
        center_point.z = average + random_value
        height[int(center_point.y)][int(center_point.x)] = center_point.z

class FractalTerrain:
    def __init__(self, num_grid_lines, smoothness, z_scale):
        final_size = 1
        while final_size < num_grid_lines:
            final_size <<= 1

        self._height = [[0 for i in range(final_size  + 1)] for i in range(final_size + 1)]
        self._iterate(smoothness, z_scale)
        self._z_scale = z_scale
        self._num_grid_lines = num_grid_lines

    def _iterate(self, smoothness, z_scale):
        count = 0
        iter_num = log(len(self._height) - 1, 2)
        while count < iter_num:
            count += 1
            self._diamond(count, self._generate_random_num(count, smoothness, z_scale))
            self._square(count, smoothness, z_scale)

    def _diamond(self, count, random_value):
        terrain_size = len(self._height) - 1
        num_seg = 1 << (count - 1)
        span = terrain_size // num_seg
        for x in range(0, terrain_size, span):
            for y in range(0, terrain_size, span):
                center_point = Diamond(x, y, span, self._height, random_value).center_point()
                self._height[int(center_point.y)][int(center_point.x)] = center_point.z


    def _square(self, count, smoothness, z_scale):
        terrain_size = len(self._height) - 1
        num_seg = 1 << (count - 1)
        span = terrain_size // num_seg
        for x in range(0, terrain_size, span):
            for y in range(0, terrain_size, span):
                square_ = Square(x, y, span, self._height)
                square_.set_random_heights([self._generate_random_num(count, smoothness, z_scale) for i in range(4)], terrain_size, self._height)

        for y in range(0, terrain_size, span):
            self._height[y][terrain_size] = self._height[y][0]

        for x in range(0, terrain_size, span):
            self._height[terrain_size][x] = self._height[0][x]


    def _generate_random_num(self, count, smoothness, z_scale):
        _reduce = 1
        for i in range(count):
            _reduce *= pow(2, -smoothness)
        return _reduce * random.randint(-z_scale, z_scale)

    def height(self):
        return self._height

    def z_scale(self):
        return self._z_scale

    def num_grid_lines(self):
        return self._num_grid_lines


class Grid:
    def __init__(self, terrain, size=200):
        self._resolution = terrain.num_grid_lines()
        self._points = []
        self._z_scale = terrain.z_scale()

        height = terrain.height()
        has_height = (height is not None and len(height) != 0)
        row_step = col_step = (size - (-size)) / float(self._resolution - 1)
        for row in range(self._resolution):
            for col in range(self._resolution):
                self._points.append(vector(size - col * col_step, has_height and height[row][col] or 0, size - row * row_step))

    def render(self):
        num_points = len(self._points)

        # horizontal lines
        horizontal_curves = []
        for i in range(0, num_points, self._resolution):
            for j in range(self._resolution - 1):
                horizontal_curves.append(curve(pos=[self._points[i + j], self._points[i + j + 1]]))
                hue =1.5 + .5 * (self._points[i + j].y +  self._points[i + j + 1].y) / self._z_scale
                horizontal_curves[-1].color = color.hsv_to_rgb(vector(hue, .9, 1.0))

        # vertical lines
        vertical_curves = []
        for i in range(0, self._resolution):
            for j in range(0, num_points - self._resolution, self._resolution):
                if i + j < num_points: #and i + j + self._size < num_points:
                    vertical_curves.append(curve(pos=[self._points[i + j], self._points[i + j + self._resolution]]))
                    hue =1.5 + .5 * (self._points[i + j].y +  self._points[i + j + 1].y) / self._z_scale
                    vertical_curves[-1].color = color.hsv_to_rgb(vector(hue, .9, 1.0))

def refresh_screen(evt):
    for obj in display.objects:
        obj.visible = False
        obj.clear()

    terrain = FractalTerrain(num_grid_lines=60, z_scale=200, smoothness=1)
    Grid(terrain, size=200).render()


def main_loop():
    display.forward = vector(-100, -60, -100)
    display.bind("click", refresh_screen)
    refresh_screen(None)
    while True:
        rate(10)


if __name__ == '__main__':
    main_loop()
