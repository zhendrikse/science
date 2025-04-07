# Web VPython 3.2

from vpython import rate, canvas, box, color, vector, graph, gcurve, textures

title = """&#x2022; Based on original <a href="https://github.com/gcschmit/vpython-physics/blob/master/buoyancy/buoyancy.py">buoyancy.py</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/kinematics/code/floating_block">floating_block.py</a>

"""

animation = canvas(title=title, background=color.gray(0.075), forward=vector(-0.52, -0.67, -0.52), range=2.)


def submerged_volume(wooden_block:box, water:box):
    top_of_fluid = water.pos.y + water.size.y / 2
    top_of_object = wooden_block.pos.y + wooden_block.size.y / 2
    bottom_of_object = wooden_block.pos.y - wooden_block.size.y / 2

    if top_of_object <= top_of_fluid:
        height_submerged = wooden_block.size.y
    elif bottom_of_object >= top_of_fluid:
        height_submerged = 0
    else:
        height_submerged = (top_of_fluid - bottom_of_object)

    return wooden_block.size.x * height_submerged * wooden_block.size.z


fluid = box(size=vector(2, 2, 0.75), color=color.blue, opacity=0.3, density=1000)
floating_object = box(pos=vector(0, 0, 0), v=vector(0, 0, 0), texture=textures.wood, density=500, size=vector(0.4, 0.4, 0.1))

graphs = graph(title="Buyoancy")
buoyance_curve = gcurve(color=color.magenta)
drag_force_curve = gcurve(color=color.blue)

dragCoefficient = vector(0, -5.0, 0)
g = vector(0, -9.8, 0)

t = 0
dt = 0.001
while t < 20 and floating_object.pos.y > (fluid.pos.y - fluid.size.y / 2):
    rate(1 / dt)

    mass = floating_object.density * floating_object.size.x * floating_object.size.y * floating_object.size.z

    gravitational_force = mass * g
    drag_force = dragCoefficient * floating_object.v.y
    buoyancy_force = fluid.density * -g * submerged_volume(floating_object, fluid)

    net_force = buoyancy_force + gravitational_force + drag_force
    acceleration = net_force / mass
    floating_object.v += + acceleration * dt
    floating_object.pos += floating_object.v * dt

    buoyance_curve.plot(t, buoyancy_force.y)
    drag_force_curve.plot(t, drag_force.y)

    t += dt
