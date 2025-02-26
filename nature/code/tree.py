title = """&#x2022; Based on <a href="http://rosettacode.org/wiki/Fractal_tree#Python">Fractal_tree</a> via <a href="https://prettymathpics.com/fractal-tree/">prettymathpics.com</a> 
&#x2022; Original authors: Alan Richmond, Python3.codes, and others at <a href="http://rosettacode.org/">rosettacode.org</a>
&#x2022; Adapted to <a href="https://vpython.org/">VPython</a> by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/nature/code/tree.py">tree.py</a>

"""

from vpython import curve, cos, radians, color, vec, sin, rate, canvas

display = canvas(title=title, width=600, height=400, range=380, center=vec(300, -18, -70), forward=vec(-.45, -.2, -.87), background=color.gray(0.075))

spread = 17  # how much branches spread apart
width, height = 512, 400  # window size
max_recursion_depth = 12  # maximum recursion depth
branch_length = 8.0  # branch length factor

lines = [curve(pos=vec(width / 2, height * 0.9, 0))]  # , radius=0.1, visible=False)]


# This function calls itself to add sub-trees
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


#   Start drawing!
draw_tree(width / 2, height * 0.9, -90, max_recursion_depth)

while True:
    rate(10)
