#Web VPython 3.2

from vpython import curve, color, vec, canvas, rate

title = """&#x2022; Inspired by <a href="https://isoptera.lcsc.edu/~seth/cs111/project5.pdf">a student assignment</a> by <a href="https://isoptera.lcsc.edu/~seth/">S. Seth Long</a> 
&#x2022; Written by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/sierpinski.py">sierpinski.py</a>

"""

display = canvas(title=title, width=600, height=600, forward=vec(-.4, .25, -.85), center=vec(.07, -.23, -.05),
                 background=color.gray(0.075), range=1.25)


def colour(vertex_):
    return color.hsv_to_rgb(vec(.25 * (1 + vertex_.y), 1, 1))


def sierpinski(vertices, level):
    if level == 0:
        tetrahedron(vertices)
    else:
        midpoints = [
            (vertices[0] + vertices[1]) / 2,
            (vertices[1] + vertices[2]) / 2,
            (vertices[2] + vertices[0]) / 2,
            (vertices[0] + vertices[3]) / 2,
            (vertices[1] + vertices[3]) / 2,
            (vertices[2] + vertices[3]) / 2
        ]

        sierpinski([vertices[0], midpoints[0], midpoints[2], midpoints[3]], level - 1)
        sierpinski([midpoints[0], vertices[1], midpoints[1], midpoints[4]], level - 1)
        sierpinski([midpoints[2], midpoints[1], vertices[2], midpoints[5]], level - 1)
        sierpinski([midpoints[3], midpoints[4], midpoints[5], vertices[3]], level - 1)


def tetrahedron(vertices):
    curve(pos=[vertices[0], vertices[1]], color=colour(vertices[0]), radius=0.0055)
    curve(pos=[vertices[0], vertices[2]], color=colour(vertices[0]), radius=0.0055)
    curve(pos=[vertices[0], vertices[3]], color=colour(vertices[0]), radius=0.0055)
    curve(pos=[vertices[1], vertices[2], vertices[3], vertices[1]], color=colour(vertices[0]), radius=0.0055)


initial_vertices = [
    vec(0, 1, 0),
    vec(-1, -1, -1),
    vec(1, -1, -1),
    vec(0, -1, 1)
]

sierpinski(initial_vertices, 5)

while True:
    rate(1)

