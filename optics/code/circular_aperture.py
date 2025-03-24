#Web VPython 3.2

# For the Glowscript version:
# 0. Comment in the Web VPython 3.2 statement
# 1. Comment in the get_library in the vpython import statement
# 2. Comment out the numpy code section
# 3. Comment in the numjs code section
# 4. Comment in the MathJax LaTex rendering

from vpython import canvas, vector, color, pi, box, rate, points, arange#, get_library

title = """&#x2022; Based on code shown in <a href="https://www.youtube.com/watch?v=TZhMeYcDCyo">this video</a> by Jordan Huang
&#x2022; Refactored by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/thermodynamics/code/circular_aperture.py">circular_aperture.py</a>
&#x2022; <span style="color: red">Rendering may be <em>slow</em>, so please be patient!</span>

"""

N = 100  # N^2 grids on the aperture
R = 1.0  # distance to the screen
lambda_ = 500E-9
k = 2 * pi / lambda_

diameter = 100E-6
dx, dy = diameter / N, diameter / N

scene0 = canvas(align="top", height=0, width=625, title=title, resizable=False)
scene1 = canvas(align="left", height=300, width=300, center=vector(N * dx / 2, N * dy / 2, 0),
                background=color.gray(0.075), forward=vector(-.45, 0, -.9))
scene2 = canvas(align="right", height=300, width=300, center=vector(N * dx / 2, N * dy / 2, 0),
                background=color.gray(0.075), forward=vector(-.45, 0, -.9))

scene1.lights, scene2.lights = [], []
scene1.ambient = scene2.ambient = color.gray(0.99)
points(canvas=scene0)


def linspace(start, stop, num):
    return [x for x in arange(start, stop, (stop - start) / (num - 1))] + [stop]


def meshgrid(x, y):
    # Create empty lists to hold the grid arrays
    X = []
    Y = []

    # Create the 2D grid arrays
    for i in range(len(y)):
        X.append(x)  # Repeat x for each row (to get the same x values)

    for j in range(len(x)):
        Y.append([y[i] for i in range(len(y))])  # Repeat y for each column (to get the same y values)

    # Transpose Y to match the structure of numpy's meshgrid
    Y = list(map(list, zip(*Y)))

    return X, Y


side = linspace(-0.01 * pi, 0.01 * pi, N)
x, y = meshgrid(side, side)

side_aperture = linspace(-diameter / 2, diameter / 2, N)
X, Y = meshgrid(side_aperture, side_aperture)

in_aperture = [[0 for _ in range(N)] for _ in range(N)]
for i in range(N):
    for j in range(N):
        in_aperture[i][j] = 1 if (X[i][j] * X[i][j] + Y[i][j] * Y[i][j] <= (diameter / 2) * (diameter / 2)) else 0

electric_field = [[0. for _ in range(N)] for _ in range(N)]
dx_dy = dx * dy

# NUMJS FUNCTIONALITY
#
# get_library('https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js')
#
# x, y, X, Y, electric_field, in_aperture = nj.array(x), nj.array(y), nj.array(X), nj.array(Y), nj.array(electric_field), nj.array(in_aperture)
#
# for i in range(N):
#   for j in range(N):
#      argument = nj.add(nj.multiply(X, x.get(i, j)), nj.multiply(Y, y.get(i, j)))
#      argument = nj.multiply(argument, k)
#      array_ = nj.multiply(nj.multiply(nj.cos(argument), dx_dy), in_aperture)
#      electric_field.set(i, j, array_.sum() / R)
#
# field_intensity = nj.multiply(nj.abs(electric_field), nj.abs(electric_field))
# fake_field_intensity = nj.abs(electric_field)
#
# def colour(intensity, i, j):
#   max_intensity = nj.max(intensity)
#   return color.gray(intensity.get(i, j) / max_intensity)
#
# TILL HERE

# NUMPY FUNCTIONALITY
#
import numpy as np

x, y, X, Y, electric_field, in_aperture = np.array(x), np.array(y), np.array(X), np.array(Y), np.array(electric_field), np.array(in_aperture)

dx_dy = dx * dy
for i in range(N):
   for j in range(N):
       electric_field[i, j] = np.sum(np.cos(k * (x[i, j] * X + y[i, j] * Y)) * dx_dy * in_aperture) / R

field_intensity = np.abs(electric_field) * np.abs(electric_field)
fake_field_intensity = np.abs(electric_field)

def colour(intensity, i, j):
   max_intensity = np.amax(intensity)
   return color.gray(intensity[i, j] / max_intensity)
#
# TILL HERE

for i in range(N):
    for j in range(N):
        box(canvas=scene1, pos=vector(i * dx, j * dy, 0), length=dx, height=dy, width=dx, color=colour(field_intensity, i, j))
        box(canvas=scene2, pos=vector(i * dx, j * dy, 0), length=dx, height=dy, width=dx, color=colour(fake_field_intensity, i, j))

# Find the position of the first dark ring
# Moving along an axis, from the center of the pattern, find theta_x = x / R, or theta_y = y / R
# first_dark_index = 50
# for i in range(50, 100):
#     if field_intensity[i][50] <= field_intensity[first_dark_index][50]:
#         first_dark_index = i
#     else:
#         break
# print("Estimated theta: ", (first_dark_index - 49.5) * 0.02 * pi / N)
# print("Rayleigh criterion theta: ", 1.22 * lambda_ / diameter)

#MathJax.Hub.Queue(["Typeset", MathJax.Hub])
while True:
    rate(10)


