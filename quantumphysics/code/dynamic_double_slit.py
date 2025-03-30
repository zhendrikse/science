#Web VPython 3.2
from vpython import ceil, pi, cos, rate, box, vec, canvas, color, arange, simple_sphere

title = """&#x2022; Original <a href="https://github.com/NelsonHackerman/Random_python_ideas/blob/main/double%20slit%20experiment.py">double slit experiment.py</a> by <a href="https://github.com/NelsonHackerman">Nelson Hackerman</a>
&#x2022; Ported from PyGame to Glowscript by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>, see <a href="https://github.com/zhendrikse/science/blob/main/quantumphysics/code/dynamic_double_slit.py">dynamic_double_slit.py</a>

"""

display = canvas(title=title, background=color.gray(0.075), center=vec(700, 350, 0))

slit_size = 6
slit_distance = 10
inter1 = 50 - slit_distance - slit_size
mid_up = 50 - slit_distance
mid_down = 50 + slit_distance
inter2 = 50 + slit_distance + slit_size - 1

wall_x = 70
dx = 0.07
dy = dx

dt = 1 / 50
velocity_source = 0.065 / dt / 1.5
colorrange = 3
floor = -0.5


# Equivalent of NumPy outer
def outer_product(v1, v2):
    return [[v1[i] * v2[j] for j in range(len(v2))] for i in range(len(v1))]


def colour(x, range_):
    red = max(0, min(510 / range_ * x, 255))
    blue = max(0, min(510 - 510 / range_ * x, 255))
    return vec(red, 50, blue) / 255


def initialize_simulation():
    x = arange(0, 13, dx)
    y = arange(0, 7, dy)
    const1 = [1 for _ in range(len(x))]
    const2 = [1 for _ in range(len(y))]
    xmesh = outer_product(const2, x)
    ymesh = outer_product(y, const1)

    pixels = []
    for i in range(len(x)):
        temp = []
        for j in range(len(y)):
            # temp.append(box(pos=vec(xmesh[j][i] * 100 + 50, ymesh[j][i] * 100 + 50, 0), size=vec(ceil(100 * dx), ceil(100 * dy), 0)))
            temp.append(
                simple_sphere(pos=vec(xmesh[j][i] * 100 + 50, ymesh[j][i] * 100 + 50, 0), radius=ceil(100 * dx)))
        pixels.append(temp)

    return pixels


pixels = initialize_simulation()
umesh = outer_product([0 for _ in range(len(pixels[0]))], arange(0, 13, dx))
utmesh = [[0. for _ in range(len(pixels))] for _ in range(len(pixels[0]))]
uttmesh = [[0. for _ in range(len(pixels))] for _ in range(len(pixels[0]))]

t = 0
velocity_source_2 = velocity_source * velocity_source
dx_2 = dx * dx
dy_2 = dy * dy
pi_2 = pi / 2
while True:
    t += dt
    rate(100)

    for n in range(1, len(pixels) - 1):
        for m in range(1, len(pixels[0]) - 1):
            uttmesh[m][n] = velocity_source_2 * ((umesh[m][n - 1] + umesh[m][n + 1] - 2 * umesh[m][n]) / dx_2 + (
                        umesh[m - 1][n] + umesh[m + 1][n] - 2 * umesh[m][n]) / dy_2)

    for n in range(1, len(pixels) - 1):
        for m in range(1, len(pixels[0]) - 1):
            utmesh[m][n] += uttmesh[m][n] * dt
            umesh[m][n] += utmesh[m][n] * dt

    # boundary conditions
    umesh[:][0] = umesh[:][1]
    umesh[:][-1] = umesh[:][-2]
    umesh[0][:] = umesh[1][:]
    umesh[-1][:] = umesh[-2][:]

    if t < pi_2:
        for n in range(len(pixels[0])):
            umesh[n][0] = -cos(t * 20) + 1

    umesh[0][0] = umesh[1][1]
    umesh[0][-1] = umesh[1][-2]
    umesh[-1][0] = umesh[-2][1]
    umesh[-1][-1] = umesh[-2][-2]

    for n in range(inter1):
        umesh[n][wall_x] = 69
        umesh[n][wall_x - 1] = umesh[n][wall_x - 2]
        umesh[n][wall_x + 1] = umesh[n][wall_x + 2]
    umesh[inter1][wall_x] = (umesh[inter1][wall_x - 1] + umesh[inter1][wall_x + 1] + umesh[inter1 + 1][wall_x]) / 3

    for n in range(mid_up, mid_down):
        umesh[n][wall_x] = 69
        umesh[n][wall_x - 1] = umesh[n][wall_x - 2]
        umesh[n][wall_x + 1] = umesh[n][wall_x + 2]
    umesh[mid_up - 1][wall_x] = (umesh[mid_up - 1][wall_x - 1] + umesh[mid_up - 1][wall_x + 1] + umesh[mid_up - 2][
        wall_x]) / 3
    umesh[mid_down][wall_x] = (umesh[mid_down][wall_x - 1] + umesh[mid_down][wall_x + 1] + umesh[mid_down + 1][
        wall_x]) / 3

    for n in range(inter2, len(pixels[0])):
        umesh[n][wall_x] = 69
        umesh[n][wall_x - 1] = umesh[n][wall_x - 2]
        umesh[n][wall_x + 1] = umesh[n][wall_x + 2]
    umesh[-1][wall_x] = 69
    umesh[-1][wall_x - 1] = umesh[-1][wall_x - 2]
    umesh[-1][wall_x + 1] = umesh[-1][wall_x + 2]
    umesh[inter2][wall_x] = (umesh[inter2][wall_x - 1] + umesh[inter2][wall_x + 1] + umesh[inter2 - 1][wall_x]) / 3

    for i in range(len(pixels)):
        for j in range(len(pixels[0])):
            pixels[i][j].color = vec(0, 0, 0) if umesh[j][i] == 69 else colour(umesh[j][i] - floor, colorrange)
