#Web VPython 3.2

from vpython import vector, rotate, color, vec, sphere, cylinder, canvas, textures, pi, rate, random

title = """&#x2022; Based on <a href="https://trinket.io/glowscript/9d17ee2036">this example</a> 
&#x2022; Modified by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/nature/code/tree.py">tree.py</a>

"""

display = canvas(background=color.gray(0.075), center=vector(0, 50, 0), height=500, title=title)

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

# Artificially elongate the stem
stem = cylinder(pos=vec(0, -300, 0), radius=12.5, axis=vec(0, 175, 0), texture=textures.wood)

tree(branch_length=125, branch_pos=vector(0, -125, 0), branch_vector=vector(0, 1, 0))

while True:
    rate(2)