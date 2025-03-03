#Web VPython 3.2
from vpython import vector, canvas, box, arrow, text, sphere, cylinder, rate, color, sin, cos, local_light, button

title="""&#x2022; Original <a href="https://www.mso.anu.edu.au/pfrancis/simulations/barges_light.py">barges_light.py</a> by <a href="http://www.mso.anu.edu.au/pfrancis/simulations/">Paul Francis</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/relativity/code/inertial_observers.py">inertial_observers.py</a>
&#x2022; Slow speeds with respect to the speed of light, so no time dilation

"""

display = canvas(title=title, range=3, width=650, height=400, forward=vector(0.2, -0.3, -1.0), background=color.gray(0.075))

class Water:
    def __init__(self):
        box(pos=vector(0, -0.1, 0.0), length=10, width=3, height=0.1, color=vector(0.1, 0.2, 1.0))

class ReferenceFrame:
    def __init__(self, position):
        self._x1 = arrow(pos=position, axis=vector(1, 0, 0), color=color.white, shaftwidth=0.03)
        self._tex1 = text(text="x", pos=self._x1.pos + self._x1.axis, height=0.1, depth=0.02)
        self._y1 = arrow(pos=position, axis=vector(0, 0, 1), color=color.white, shaftwidth=0.03)
        self._tey1 = text(text="y", pos=self._y1.pos + self._y1.axis, height=0.1, depth=0.02)
        self._z1 = arrow(pos=position, axis=vector(0, 1, 0), color=color.white, shaftwidth=0.03)
        self._tez1 = text(text="z", pos=self._z1.pos + self._z1.axis, height=0.1, depth=0.02)

    def update(self, dx):
        self._x1.pos += dx
        self._tex1.pos += dx
        self._y1.pos += dx
        self._tey1.pos += dx
        self._z1.pos += dx
        self._tez1.pos += dx

class Clock:
    def __init__(self, position, theta=.1):
        self._clock1 = cylinder(pos=position + vector(-0.2, 0.2, 0.0), axis=vector(0, 0, 0.02),
                          radius=0.1, color=vector(0.8, 0.8, 0.2))
        self._hand1a = cylinder(pos=self._clock1.pos + vector(0, 0, 0.01),
                          axis=0.1 * vector(cos(theta), sin(theta), 0.0),
                          color=vector(0.2, 0.3, 0.1), radius=0.015)
        self._hand1b = cylinder(pos=self._clock1.pos + vector(0, 0, 0.005),
                          axis=0.06 * vector(cos(theta / 60.0), sin(theta / 60.0), 0.0),
                          color=vector(0.2, 0.3, 0.1), radius=0.02)
        self._theta = theta

    def update(self, dx, dt):
        self._theta += dt
        self._clock1.pos += dx
        self._hand1a.pos += dx
        self._hand1a.axis = 0.1 * vector(sin(self._theta), cos(self._theta), 0.0)
        self._hand1b.pos += dx
        self._hand1b.axis = 0.06 * vector(sin(self._theta / 60.0), cos(self._theta / 60.0), 0.0)


class Person:
    def __init__(self, position, colour=color.green):
        self._head1 = sphere(pos=position + vector(-0.1, 0.5, 0.0), radius=0.07, color=colour)
        self._body1 = cylinder(pos=self._head1.pos, axis=vector(0, -0.3, 0), radius=0.03, color=colour)
        self._arm1a = cylinder(pos=self._head1.pos + vector(0, -0.1, 0), axis=vector(-0.15, -0.15, 0),
                        radius=0.02, color=colour)
        self._arm1b = cylinder(pos=self._head1.pos + vector(0, -0.1, 0), axis=vector(0.15, -0.15, 0),
                        radius=0.02, color=colour)
        self._leg1a = cylinder(pos=self._head1.pos + self._body1.axis, axis=vector(0.1, -0.15, 0),
                        radius=0.02, color=colour)
        self._leg1b = cylinder(pos=self._head1.pos + self._body1.axis, axis=vector(-0.1, -0.15, 0),
                        radius=0.02, color=colour)

    def arm_position(self):
        return self._arm1b.pos + self._arm1b.axis

    def update(self, dx):
        self._head1.pos += dx
        self._body1.pos += dx
        self._arm1a.pos += dx
        self._arm1b.pos += dx
        self._leg1a.pos += dx
        self._leg1b.pos += dx


class Barge:
    def __init__(self, position, person_colour=color.green):
        self._barge = box(pos=position, length=2, width=0.5, height=0.1, color=vector(0.6, 0.4, 0.2))
        self._position = position
        self._clock = Clock(position)
        self._person = Person(position, person_colour)
        self._reference_frame = ReferenceFrame(position)
        self._detector = cylinder(pos=self._person.arm_position() + vector(0.9, 0.0, 0.0),
                                  axis=vector(-0.1, 0.0, 0.0), radius=0.03, color=color.red)
        self._support = cylinder(pos=self._detector.pos, axis=vector(0.0, -0.3, 0.0),
                                radius=0.01, color=vector(0.3, 0.3, 0.3))
        self._light = sphere(pos=self._person.arm_position(), radius=0.03, color=vector(0.2, 0.2, 0.2), emissive=True)
        self._light_light = local_light(pos=self._light.pos, color=color.yellow, visible=False)
        self._light_direction = 1

    def switch_light(self):
        self._light_light.visible = not self._light_light.visible
        self._light.color = color.white if self._light_light.visible else vector(0.2, 0.2, 0.2)

    def _update_photon(self):
        if self._light.pos.x - self._barge.pos.x >= .9 or self._light.pos.x - self._barge.pos.x < 0:
            self._light_direction *= -1

        self._light.pos += self._light_direction * 5 * v1
        self._light_light.pos += self._light_direction * 5 * v1

    def _move_barge(self, dx, dt):
        self._barge.pos += dx
        self._reference_frame.update(dx)
        self._clock.update(dx, dt)
        self._person.update(dx)
        self._support.pos += dx
        self._detector.pos += dx
        self._light.pos += dx
        self._light_light.pos += dx

    def update(self, dx, dt):
        self._move_barge(dx, dt)
        if self._light_light.visible:
            self._update_photon()


pos1 = vector(-1.0, 0, 0.6)
pos2 = vector(0, 0, -0.6)
barge1 = Barge(pos1)
barge2 = Barge(pos2, color.orange)
_ = Water()

# def reset():
#     global display, pos1, pos2, barge1, barge2, t
#     for obj in display.objects:
#         obj.visible = False
#         obj.delete()
#     barge1 = Barge(pos1)
#     barge2 = Barge(pos2, color.orange)
#     _ = Water()
#     t = 0

_ = button(text="Light barge 1", bind=barge1.switch_light)
_ = button(text="Light barge 2", bind=barge2.switch_light)
#_ = button(text="Reset", bind=reset)

v1 = vector(0.001, 0.0, 0.0)
v2 = vector(-0.001, 0.0, 0.0)
dt1 = 0.01
dt2 = 0.01
t = 0
while 1:
    t += 1
    rate(100)
    barge1.update(v1, dt1)
    barge2.update(v2, dt2)
