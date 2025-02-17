#Web VPython 3.2
from vpython import vector, canvas, points, color, rate

# Pixel plotting, Bruce Sherwood, Jan. 1, 2008
# https://vpython.org/contents/contributed/pixelplot.py

title = """&#x2022; Based on the original <a href="https://vpython.org/contents/contributed/pixelplot.py">pixelplot.py</a> by Bruce Sherwood, Jan. 1, 2008
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/mandelbrot.py">mandelbrot.py</a>

"""

resolution = 700  # x and y range over 0 to XMAX

animation = canvas(title=title, width=resolution, fov=0.01, center=vector(resolution / 2, resolution / 2, 0), range=resolution / 2, background=color.gray(0.075))
animation.height = resolution + 60  # titlebar plus toolbar 60 pixels high

pixels = points()

def set_color_for_pixel_at(nx, ny, colour):
    pixels.append(pos=vector(nx, ny, 0), color=colour)

### Simple example: Give every pixel a random color:
##from random import random
##for y in range(XMAX):
##    for x in range(XMAX):
##        randomcolor = (random(),random(),random())
##        plot(x,y,randomcolor)

# Mandelbrot set (see Wikipedia, for example):
max_iteration = 100
for ny in range(resolution):  # range over all pixel positions
    for nx in range(resolution):
        x = x0 = -2 + nx * 3 / resolution  # from -2 to 1
        y = y0 = -1.5 + ny * 3 / resolution
        iteration = 0
        while (x * x + y * y) < 4 and iteration < max_iteration:
            x_temp = x * x - y * y + x0
            y_temp = 2 * x * y + y0
            x = x_temp
            y = y_temp
            iteration += 1
        # Leave points black if the iteration quickly escapes:
        if .1 < iteration / max_iteration < 1:
            colour = color.hsv_to_rgb(vector(iteration / max_iteration - .1, 1, 1))
            set_color_for_pixel_at(nx, ny, colour)

while True:
    rate(20)