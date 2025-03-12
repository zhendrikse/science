#Web VPython 3.2
from vpython import *

title="""Implementation of Reiter's cellular model for <a href="https://patarnott.com/pdf/SnowCrystalGrowth.pdf">snow crystal growth</a>
&#x2022; Original <a href="https://github.com/zdeager/flake">code</a> by <a href="https://github.com/zdeager">zdeager</a> 
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/nature/code/snowflake.py">snowflake.py</a>
&#x2022; Also based on <a href="https://stackoverflow.com/questions/9982458/creating-a-sphere-packing-nearest-neighbor-list-from-integers">Creating a sphere packing nearest neighbor list from integers</a>

"""

display = canvas(title=title, width=600, height=600, background = color.gray(0.075), range=30)
number_of_neighbors = 12

def get_pos(idx, width, height, depth, radius=1):
    k = int(idx / (width * height))
    idx -= (k * width * height)
    j = int(idx / width)
    i = idx % width
    x = 2 * i + ((j + k) % 2)
    y = sqrt(3) * (j + (1 / 3) * (k % 2))
    z = ((2 * sqrt(6)) / 3) * k

    return vector(x, y, z) * radius

class Cell:
    def __init__(self, pos, radius, beta, neighbors, colour=vector(204/255, 1, 1)):
        self._sphere = simple_sphere(pos=pos, shininess=0, visible=False, radius=radius, color=colour)
        self._beta = beta
        self._neighbors = neighbors
        self._A2 = beta
        self._A2n = self._A2
        self._A1 = 0

    def render(self, a_min, a_max):
        norm = (self._beta - a_min) * (1 / (a_max - a_min))
        self._sphere.color *= norm
        self._sphere.opacity = norm - .1
        if norm > .5:
            self._sphere.visible = True

    def neighbors(self):
        return self._neighbors

    def update(self, gamma, receptive):
        self._A1 = self.beta() + gamma if receptive else 0
        self._A2 = 0 if receptive else self.beta()

    def beta(self):
        return self._beta

    def add_updated_water_and_ice_together(self):
        self._beta = self._A1 + self._A2n  # add updated water and ice
        self._A2 = self._A2n  # update water for next step


class Snowflake:
    def __init__(self, width=60, height=60, depth=60, radius=1, alpha=1, beta=.9, gamma=.05):
        self._width, self._height, self._depth = width, height, depth
        self._alpha, self._beta, self._gamma = alpha, beta, gamma
        self._cells = []

        # initialize
        for idx in range(width * height * depth):
            cell = Cell(get_pos(idx, width, height, depth), radius, beta, self._get_neighbors(idx))
            self._cells.append(cell)
        self._cells[self.center_index()]._beta = alpha

    def center_index(self):
        width, height, depth = self._width, self._height, self._depth
        return (depth // 2) * (height * width) + (height // 2) * width + (width // 2)

    def _get_neighbors(self, idx):
        width, height, depth = self._width, self._height, self._depth
        area = width * height

        plane = (idx // area)
        plane_index = idx % area
        row = (plane_index // width)
        col = plane_index % width

        r = -1 if row % 2 else 1  # (-1)**row
        p = -1 if plane % 2 else 1  # (-1)**plane

        neighbors = []

        # first include neighbors in same plane
        if col != width - 1: neighbors.append(idx + 1)
        if col != 0:   neighbors.append(idx - 1)
        if row != height - 1: neighbors.append(idx + width)
        if row != 0:   neighbors.append(idx - width)
        if (col != 0 or r > 0) and (col != width - 1 or r < 0):
            if row != height - 1: neighbors.append(idx + width + r)
            if row != 0:   neighbors.append(idx - width + r)

        # now add neighbors from other planes
        if plane != depth - 1: neighbors.append(idx + area)
        if plane != 0:   neighbors.append(idx - area)

        if (col != 0 or p < 0) and (col != width - 1 or p > 0):
            if plane != depth - 1: neighbors.append(idx + area - p)
            if plane != 0:   neighbors.append(idx - area - p)

        if (col != width - 1 or p > 0 or r < 0) and (col != 0 or p < 0 or r > 0) and (row != height - 1 or p < 0) and (row != 0 or p > 0):
            if plane != depth - 1:
                neighbors.append(idx + area + p * width + int((r - p) / 2))  # 10
            if plane != 0:
                neighbors.append(idx - area + p * width + int((r - p) / 2))  # 11

        return neighbors

    def _diffuse(self, cell):
        if len(cell.neighbors()) != number_of_neighbors:
            return
        average = sum([self._cells[neighbor]._A2 for neighbor in cell.neighbors()]) / number_of_neighbors
        cell._A2n = .5 * (cell._A2 + average)

    def _determine_receptive(self, cell):
        if len(cell.neighbors()) != number_of_neighbors:
            return
        # determine receptive
        receptive = False
        for neighbor in cell.neighbors():
            if self._cells[neighbor].beta() >= self._alpha or cell.beta() >= self._alpha:
                receptive = True
                break
        cell.update(self._gamma, receptive)

    def grow(self):
        for cell in self._cells:
            self._determine_receptive(cell)

        for cell in self._cells:
            self._diffuse(cell)

        for cell in self._cells:
            cell.add_updated_water_and_ice_together()

    def render(self):
        a_max = -1e30  # -float("inf")
        a_min = +1e30  # float("inf")
        for cell in self._cells:
            if cell.beta() > a_max:
                a_max = cell.beta()
            if cell.beta() < a_min:
                a_min = cell.beta()
        for cell in self._cells:
            cell.render(a_min, a_max)


snowflake = Snowflake()
for _ in range(15):
    snowflake.grow()

snowflake.render()
display.center = get_pos(snowflake.center_index(), 60, 60, 60)

while True:
    rate(10)
