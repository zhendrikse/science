#Web VPython 3.2
from vpython import *

from random import uniform

title = """&#x2022; Based on <a href="https://rosettacode.org/wiki/Barnsley_fern#Python">this example</a> (an alternative <a href="https://code.activestate.com/recipes/577134-fern-ifs-fractal">here</a>) 
&#x2022; See also this <a href="https://www.youtube.com/watch?v=km-ctEk8-lE">video</a> on integrated function systems (IFS)
&#x2022; Adapted to <a href="https://vpython.org/">VPython</a> by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/nature/code/fern.py">fern.py</a>

"""

img_x = 512
img_y = 512
display = canvas(title=title, background=color.gray(0.075), height=600, center=vector(0, +5, 0), fov=0.01)

pixels = points(radius=.85)


def set_color_for_pixel_at(x, y, colour):
    pixels.append(pos=vector(x, y, 0), color=colour)


class BarnsleyFern:
    def __init__(self, img_width, img_height, paint_color=vec(0, .8, 0)):
        self.img_width, self.img_height = img_width, img_height
        self.paint_color = paint_color
        self.x, self.y = 0, 0
        self.age = 0

    def scale(self, x, y):
        h = (x + 2.182) * (self.img_width - 1) / 4.8378
        k = (9.9983 - y) * (self.img_height - 1) / 9.9983
        return h, k

    def transform(self, x, y):
        rand = uniform(0, 100)
        if rand < 1:
            return 0, 0.16 * y
        elif 1 <= rand < 86:
            return 0.85 * x + 0.04 * y, -0.04 * x + 0.85 * y + 1.6
        elif 86 <= rand < 93:
            return 0.2 * x - 0.26 * y, 0.23 * x + 0.22 * y + 1.6
        else:
            return -0.15 * x + 0.28 * y, 0.26 * x + 0.24 * y + 0.44

    def iterate(self, iterations):
        for _ in range(iterations):
            self.x, self.y = self.transform(self.x, self.y)
            set_color_for_pixel_at(self.x, self.y, self.paint_color)
        self.age += iterations


fern = BarnsleyFern(img_x, img_y)
fern.iterate(100000)
