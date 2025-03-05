from vpython import log, canvas, rate, curve, vector, color
import random

title = """&#x2022; Based on <a href="https://github.com/ragnraok/RandomFractalTerrain-Vpython">RandomFractalTerrain-Vpython</a>
&#x2022; Updated and extended by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/fractal_terrain.py">fractal_terrain.py</a>

"""

display = canvas(width=600, title=title, background=color.gray(0.075))

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
        diamond(height, count, smoothness, z_scale)
        square(height, count, smoothness, z_scale)

def diamond(height, count, smoothness, z_scale):
    """
        a -- b -- c
        |    |    |
        d -- e -- f
        |    |    |
        g -- h -- i
    """
    terrain_size = len(height) - 1
    num_seg = 1 << (count - 1)
    span = terrain_size // num_seg
    half = span >> 1
    for x in range(0, terrain_size, span):
        for y in range(0, terrain_size, span):
            a = [x, y]
            c = [x + span, y]
            g = [x, y + span]
            i = [x + span, y + span]
            e = [x + half, y + half]

            tmp = [height[v[1]][v[0]] for v in [a, c, g, i] ]
            avg = sum(tmp) / len(tmp)

            random_val = generate_random_num(count, smoothness, z_scale)
            height[e[1]][e[0]] = avg + random_val

def square(height, count, smoothness, z_scale):
    """
        a -- b -- c
        |    |    |
        d -- e -- f
        |    |    |
        g -- h -- i
    """
    terrain_size = len(height) - 1
    num_seg = 1 << (count - 1)
    span = terrain_size // num_seg
    half = span >> 1
    for x in range(0, terrain_size, span):
        for y in range(0, terrain_size, span):
            a = [x, y]
            b = [x + half, y]
            c = [x + span, y]
            d = [x, y + half]
            e = [x + half, y + half]
            f = [x + span, y + half]
            g = [x, y + span]
            h = [x + half, y + span]
            i = [x + span, y + span]

            above_b = [x + half, y - half >= 0 and y - half or terrain_size - half]
            left_d = [x - half >= 0 and x - half or terrain_size - half, y + half]
            right_f = [x + half * 3 <= terrain_size and x + half * 3 or half, y + half]
            below_h = [x + half, y + half * 3 <= terrain_size and y + half * 3 or half]

            # the four diamonds
            _square_calculator(height, count, smoothness, z_scale, a, e, g, left_d, d)
            _square_calculator(height, count, smoothness, z_scale, a, e, c, above_b, b)
            _square_calculator(height, count, smoothness, z_scale, c, e, i, right_f, f)
            _square_calculator(height, count, smoothness, z_scale, g, e, i, below_h, h)

    for y in range(0, terrain_size, span):
        height[y][terrain_size] = height[y][0]

    for x in range(0, terrain_size, span):
        height[terrain_size][x] = height[0][x]

def _square_calculator(height, count, smoothness, z_scale, a, b, c, d, center_point):
    tmp = [height[v[1]][v[0]] for v in [a, b, c, d]]
    avg = sum(tmp) / len(tmp)
    random_val = generate_random_num(count, smoothness, z_scale)
    height[center_point[1]][center_point[0]] = avg + random_val


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

def create_grid(size, height):
    has_height = (height is not None and len(height) != 0)
    row_step = (GRID_SIZE - (-GRID_SIZE)) / float(size - 1)
    col_step = (GRID_SIZE - (-GRID_SIZE)) / float(size - 1)

    # first calculate all points
    points = [(GRID_SIZE - col * col_step, has_height and height[row][col] or 0, GRID_SIZE - row * row_step) for
            row in range(size) for col in range(size)]

    horizontal_curves = []
    vertical_curves = []
    # horizontal lines
    for i in range(0, len(points), size):
        for j in range(size - 1):
            horizontal_curves.append(curve(pos=[
                points[i + j],
                points[i + j + 1]
                ], color=color.green))

    # vertical lines
    for i in range(0, size):
        #print "i=%d" % i
        for j in range(0, len(points) - size, size):
            #print "j=%d" % j
            #print "i+j=%d" % (i+j)
            #print "i+j+size=%d" % (i+j+size)
            if i + j < len(points) and i + j + size < len(points):
                vertical_curves.append(curve(pos=[
                    points[i + j],
                    points[i + j + size]
                    ], color=color.green))
    
    return horizontal_curves, vertical_curves

def update_curves_height(horizontal_curves, vertical_curves, size, height):
    # first calculate all points
    points = [elem for row in height for elem in row]

    # horizontal lines
    index = 0
    for i in range(0, len(points), size):
        for j in range(size - 1):
            horizontal_curves[index].y = [points[i + j], points[i + j + 1]]
            index += 1

    # vertical lines
    index = 0
    for i in range(0, size):
        for j in range(0, len(points) - size, size):
            if i + j < len(points) and i + j + size < len(points):
                vertical_curves[index].y = [points[i + j], points[i + j + size]]
                index += 1

def refresh_screen(evt):
    for obj in display.objects:
        obj.visible = False
        obj.clear()

    height = random_fractal(SIZE, z_scale=Z_SCALE, smoothness=SMOOTHNESS)
    horizontal_curves, vertical_curves = create_grid(SIZE, height)
    update_curves_height(horizontal_curves, vertical_curves, SIZE, height)

def main_loop():
    display.width = display.height = 700
    display.forward = vector(-100, -60, -100)
    display.bind("click", refresh_screen)
    refresh_screen(None)
    while True:
        rate(10)


if __name__ == '__main__':
    main_loop()
