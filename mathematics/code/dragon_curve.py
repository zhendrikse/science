#Web VPython 3.2
from vpython import canvas, vec, color, rate, points

title = """&#x2022; Based on <a href="https://github.com/jeffvun/fractals/blob/main/DragonCurve.py">DragonCurve.py</a> code 
&#x2022; Ported to <a href="https://vpython.org/">VPython</a> by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/dragon_curve.py">dragon_curve.py</a>

"""

display = canvas(background=color.gray(0.075), range=.54, center=vec(0.42, -.173, 0), title=title)

def dragon_curve(n):
    if n == 0:
        return [(0, 0), (1, 0)]
    else:
        prev_points = dragon_curve(n-1)
        new_points = []
        for i in range(len(prev_points)-1):
            x1, y1 = prev_points[i]
            x2, y2 = prev_points[i+1]
            dx, dy = x2 - x1, y2 - y1
            if i % 2 == 0:
                new_dx = dy
                new_dy = -dx
            else:
                new_dx = -dy
                new_dy = dx
            new_x, new_y = x1 + dx/2 + new_dx/2, y1 + dy/2 + new_dy/2
            new_points.extend([(x1, y1), (new_x, new_y)])
        new_points.append((1, 0))
        return new_points

# Generate the Dragon Curve fractal
n = 15
points_ = dragon_curve(n)

pixels = points(radius=2)
def set_color_for_pixel_at(x, y, colour):
    pixels.append(pos=vec(x, y, 0), color=colour)

x, y = zip(*points_)
for i in range(len(x)):
    set_color_for_pixel_at(x[i], y[i], color.hsv_to_rgb(vec(i/len(x), 1, 1)))

while True:
    rate(10)
