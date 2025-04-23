#Web VPython 3.2

from vpython import vector, rotate, color, vec, sphere, cylinder, canvas, textures, pi, rate, curve, cos, sin, radians, radio

title = """&#x2022; Pythagoras tree based on <a href="http://rosettacode.org/wiki/Fractal_tree#Python">Fractal_tree</a> via <a href="https://prettymathpics.com/fractal-tree/">prettymathpics.com</a> 
    &#x2022; (Alan Richmond, Python3.codes, and others at <a href="http://rosettacode.org/">rosettacode.org</a>)
&#x2022; Nature-like tree based on <a href="https://trinket.io/glowscript/9d17ee2036">this example</a> 
&#x2022; Modified by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/nature/code/tree.py">tree.py</a>

"""

display = canvas(background=color.gray(0.15), center=vector(0, 50, 0), height=500, title=title)

def clear_canvas(range_, center):
    for obj in display.objects:
        obj.visible = False
    display.range = range_
    display.center = center

spread = 17
branch_length = 8.
max_recursion_depth = 12
lines = []
def pythagoras_tree(x1, y1, angle, depth):
    if depth <= 0:
        return

    x2 = x1 + int(cos(radians(angle)) * depth * branch_length)
    y2 = y1 + int(sin(radians(angle)) * depth * branch_length)

    colour = color.hsv_to_rgb(vec(float(depth) / max_recursion_depth, 1.0, 1.0))
    lines.append(curve(pos=[vec(x1, -y1, 0), vec(x2, -y2, 0)], color=colour))

    pythagoras_tree(x2, y2, angle - spread, depth - 1)
    pythagoras_tree(x2, y2, angle + spread, depth - 1)


def tree(branch_length, branch_pos, branch_vector):
    theta_0 = 30 * pi / 180 # theta is the "bend angle" for each branching
    short = 14.5  # this is the amount each branch is decreased by

    # repeat the branching until the length is shorter than 5
    if branch_length > 5:
        theta = theta_0 # + (random() - .5) * pi / 10

        if branch_length < 20:
            sphere(pos=branch_pos, axis=branch_vector * branch_length, radius=1.5 * branch_length, color=vec(0, .5, 0))
        else:
            cylinder(pos=branch_pos, axis=branch_vector * branch_length, radius=.1 * branch_length, texture=textures.wood)
        branch_pos += branch_vector * branch_length
        # rotate turns the pointing direction
        branch_vector = rotate(branch_vector, angle=theta, axis=vector(0, 0, 1))
        # here is the recursive magic
        tree(branch_length - short, branch_pos, branch_vector)

        # now you have to go back to where you were
        branch_vector = rotate(branch_vector, angle=-2 * theta, axis=vector(0, 0, 1))

        # this does the other side (also recursively)
        tree(branch_length - short, branch_pos, branch_vector)
        branch_vector = rotate(branch_vector, angle=theta, axis=vector(0, 0, 1))
        branch_pos -= branch_length * branch_vector


def toggle_fractal(event):
    if event.name == "nature":
        pythagoras_radio.checked = False
        clear_canvas(475, vector(0, 50, 0))
        stem = cylinder(pos=vec(0, -300, 0), radius=12.5, axis=vec(0, 175, 0), texture=textures.wood)
        tree(branch_length=125, branch_pos=vector(0, -125, 0), branch_vector=vector(0, 1, 0))
    else:
        global lines, display
        img_x, img_y = 512, 400
        nature_radio.checked = False
        clear_canvas(370, vec(300, -18, 80))
        lines = [curve(pos=vec(img_x / 2, img_y * 0.9, 0))]  # , radius=0.1, visible=False)]
        pythagoras_tree(img_x / 2, img_y * 0.9, -90, max_recursion_depth)

frame_rate = 15000
def change_speed(event):
    global frame_rate
    frame_rate = event.value

display.append_to_caption("\n")
nature_radio = radio(text="Nature tree ", checked=True, name="nature", bind=toggle_fractal)
pythagoras_radio = radio(text="Pythagoras tree ", checked=False, name="pythagoras", bind=toggle_fractal)


# Artificially elongate the stem
stem = cylinder(pos=vec(0, -300, 0), radius=12.5, axis=vec(0, 175, 0), texture=textures.wood)
tree(branch_length=125, branch_pos=vector(0, -125, 0), branch_vector=vector(0, 1, 0))
while True:
    rate(2)