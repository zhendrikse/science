# Fern IFS fractal
# FB - 201003217
from vpython import *
import random

title = """&#x2022; Based on <a href="https://code.activestate.com/recipes/577134-fern-ifs-fractal">Fern IFS Fractal</a> code 
&#x2022; See also this <a href="https://www.youtube.com/watch?v=km-ctEk8-lE">video</a> on integrated function systems (IFS)
&#x2022; Adapted to <a href="https://vpython.org/">VPython</a> by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/nature/code/fern.py">fern.py</a>

"""

imgx = 512
imgy = 512
display = canvas(title=title, background=color.gray(0.075), width=600, center=vector(imgx // 2, -imgy // 2, 0), forward=vector(0, 0, -1), range=imgx //2)

#image = Image.new("L", (imgx, imgy))

pixels = points(radius=.85)
def set_color_for_pixel_at(x, y, colour):
    pixels.append(pos=vector(x, y, 0), color=colour)

# Fractint IFS definition of Fern
mat=[[0.0,0.0,0.0,0.16,0.0,0.0,0.01],
    [0.85,0.04,-0.04,0.85,0.0,1.6,0.85],
    [0.2,-0.26,0.23,0.22,0.0,1.6,0.07],
    [-0.15,0.28,0.26,0.24,0.0,0.44,0.07]]

xa = -5.5
xb = 6.5
ya = -0.5
yb = 10.5

x=0.0
y=0.0
for k in range(imgx * imgy):

    p=random.random()
    if p <= mat[0][6]:
        i=0
    elif p <= mat[0][6] + mat[1][6]:
        i=1
    elif p <= mat[0][6] + mat[1][6] + mat[2][6]:
        i=2
    else:
        i=3

    x0 = x * mat[i][0] + y * mat[i][1] + mat[i][4]
    y  = x * mat[i][2] + y * mat[i][3] + mat[i][5]
    x = x0
    jx = int((x - xa) / (xb - xa) * (imgx - 1))
    jy = (imgy - 1) - int((y - ya) / (yb - ya) * (imgy - 1))
    #image.putpixel((jx, jy), 255)
    set_color_for_pixel_at(jx, -jy, color.green)

while True:
    rate(5)
