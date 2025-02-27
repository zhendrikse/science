#Web VPython 3.2
from vpython import canvas, vec, color, rate, points, sin, cos, radians, curve, radio

title = """&#x2022; Tree based on <a href="http://rosettacode.org/wiki/Fractal_tree#Python">Fractal_tree</a> via <a href="https://prettymathpics.com/fractal-tree/">prettymathpics.com</a> (Alan Richmond, Python3.codes, and others at <a href="http://rosettacode.org/">rosettacode.org</a>)
&#x2022; Dragon curve based on <a href="https://github.com/jeffvun/fractals/blob/main/DragonCurve.py">DragonCurve.py</a> code 
&#x2022; Ported to <a href="https://vpython.org/">VPython</a> by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/fractals.py">fractals.py</a>

"""

display = canvas(background=color.gray(0.075), title=title)

def clear_canvas():
    for obj in display.objects:
        obj.visible = False

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

spread = 17
branch_length = 8.
max_recursion_depth = 12
lines = []
def draw_tree(x1, y1, angle, depth):
    if depth <= 0:
        return

    # compute this branch's next endpoint
    x2 = x1 + int(cos(radians(angle)) * depth * branch_length)
    y2 = y1 + int(sin(radians(angle)) * depth * branch_length)

    # https://docs.python.org/2/library/colorsys.html
    colour = color.hsv_to_rgb(vec(float(depth) / max_recursion_depth, 1.0, 1.0))

    # draw the branch
    lines.append(curve(pos=[vec(x1, -y1, 0), vec(x2, -y2, 0)], color=colour))

    # and append 2 trees by recursion
    draw_tree(x2, y2, angle - spread, depth - 1)
    draw_tree(x2, y2, angle + spread, depth - 1)


def generate_tree(img_x=512, img_y=400):
    global lines, display
    clear_canvas()
    display.width = 600
    display.height = 400
    display.range = 370
    display.center = vec(300, -18, 80)
    lines = [curve(pos=vec(img_x / 2, img_y * 0.9, 0))]  # , radius=0.1, visible=False)]
    draw_tree(img_x / 2, img_y * 0.9, -90, max_recursion_depth)


def generate_dragon_curve(n=15):
    global display
    clear_canvas()
    display.width = 600
    display.height = 400
    display.range = .54
    display.center = vec(0.42, -.173, 0)

    points_ = dragon_curve(n)
    pixels = points(radius=2)
    def set_color_for_pixel_at(x, y, colour):
        pixels.append(pos=vec(x, y, 0), color=colour)

    x, y = zip(*points_)
    for i in range(len(x)):
        set_color_for_pixel_at(x[i], y[i], color.hsv_to_rgb(vec(i/len(x), 1, 1)))


def toggle_fractal(event):
    clear_canvas()
    if event.name == "dragon":
        generate_dragon_curve()
        tree_radio.checked = False
    else:
        generate_tree()


display.append_to_caption("\n")
tree_radio = radio(text="Tree ", checked=True, name="tree", bind=toggle_fractal)
dragon_radio = radio(text="Dragon curve ", checked=False, name="dragon", bind=toggle_fractal)

generate_tree()
while True:
    rate(10)
