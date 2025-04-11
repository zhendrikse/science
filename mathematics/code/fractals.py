#Web VPython 3.2
from vpython import canvas, vec, color, rate, sphere, curve, radio

title = """&#x2022; Fractals inspired by <a href="https://github.com/jeffvun/fractals/">github.com/jeffvun/fractals</a> 
&#x2022; Ported to <a href="https://vpython.org/">VPython</a> by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/fractals.py">fractals.py</a>

"""

display = canvas(width=600, height=400, title=title)

def clear_canvas(range_, center):
    for obj in display.objects:
        obj.visible = False
        del obj
    display.range = range_
    display.center = center

def t_square(n, x, y, w):
    if n == 0:
        return
    else:
        curve(pos=[vec(x, y, 0), vec(x+w, y, 0), vec(x+w, y+w, 0), vec(x, y+w, 0), vec(x, y, 0)], color=color.yellow)
        new_w = w/3
        t_square(n-1, x+new_w, y+new_w, new_w)
        t_square(n-1, x+new_w, y+new_w*4, new_w)
        t_square(n-1, x+new_w*4, y+new_w*4, new_w)
        t_square(n-1, x+new_w*4, y+new_w, new_w)

def generate_t_square_fractal(n=5):
    clear_canvas(35, vec(30, 30, 0))
    w = 2**n
    t_square(n, 0, 0, w)

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



def generate_dragon_curve(n=15):
    global display
    clear_canvas(140, vec(110, -40, 0))

    points_ = dragon_curve(n)

    x, y = zip(*points_)
    for i in range(len(x)):
        sphere(pos=250 * vec(x[i], y[i], 0), radius=1, shininess=0, color=color.hsv_to_rgb(vec(i/len(x), 2, 1)))

def dragon_fractal(event):
    t_square_radio.checked = False
    generate_dragon_curve()

def t_square_fractal(event):
    dragon_radio.checked = False
    generate_t_square_fractal()

display.append_to_caption("\n")
dragon_radio = radio(text="Dragon curve ", checked=True, bind=dragon_fractal)
t_square_radio = radio(text="T-square fractal ", checked=False, bind=t_square_fractal)

generate_dragon_curve()
while True:
    rate(10)
