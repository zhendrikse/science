# Web VPython 3.2

from vpython import sphere, vector, cos, sin, pi, rate, simple_sphere, canvas, sqrt, log, local_light, color, slider, canvas
from random import uniform, random

title = """&#x2022; <a href="https://github.com/zhendrikse/science/blob/main/astrophysics/code/saturn_rings.py">saturn_rings.py</a> by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>
&#x2022; Visualization concept inspired by <a href="https://www.youtube.com/watch?v=5In_-KuDgL4">this video</a>
&#x2022; Rotational speed ratios are in accordance with <a href="https://www.hendrikse.name/science/astrophysics/keplers_law.html">Kepler&apos;s third law</a>

"""

display = canvas(title=title, range=3.5, width=650, height=400, forward=vector(-.52, -0.57, .9), center=vector(0, -1, 0))
saturn = sphere(pos=vector(0, 0, 0), radius=1.5,
                texture="https://www.hendrikse.name/science/astrophysics/images/textures/saturn.jpg")
stars = sphere(pos=vector(0, 0, 0),
              texture="https://www.hendrikse.name/science/astrophysics/images/textures/universe.jpg", radius=10,
              shininess=0, opacity=0.5)
display.lights = []
display.ambient = color.gray(0.9)
display.fov = 0.8
lamp = local_light(pos=vector(0, 0, 0), color=color.white)

# Box-Muller transform to create a normal distribution
def normal_distribution(average, standard_deviation):
    u1 = random()
    u2 = random()
    vt = sqrt(-2 * log(u1)) * cos(2 * pi * u2)
    vt *= standard_deviation + average
    return vt


class Ring:
    def __init__(self, inner_radius, outer_radius, colour):
        self._debris = []
        self._omega = pi
        self._inner_radius = inner_radius
        self._outer_radius = outer_radius
        for _ in range(2500):
            rad = uniform(inner_radius, outer_radius)
            angle = uniform(0, 2 * pi)
            self._debris.append(simple_sphere(pos=rad * vector(cos(angle), 0, sin(angle)), radius=0.01, color=colour))

    def update_by(self, t, radius_inner_ring):
        kepler = (radius_inner_ring / self.radius()) * sqrt(radius_inner_ring / self.radius())
        cos_ = cos(self._omega * dt * kepler)
        sin_ = sin(self._omega * dt * kepler)
        for body in self._debris:
            body.pos = vector(body.pos.x * cos_ - body.pos.z * sin_, 0, body.pos.x * sin_ + body.pos.z * cos_)

    def radius(self):
        return .5 * (self._inner_radius + self._outer_radius)

    def set_omega_to(self, value):
        self._omega = value


rings = []
for i in range(4):
    rings.append(Ring(2.1 + 0.5 * i, 2.5 + 0.5 * i, vector(116 / 255, 80 / 255, 60 / 255)))


def modify_omega(event):
    for ring in rings:
        ring.set_omega_to(event.value)


display.append_to_caption("\nRotation speed")
_ = slider(value=pi, min=0, max=2 * pi, bind=modify_omega)

dt = .001
while True:
    rate(60)
    for ring in rings:
        ring.update_by(dt, rings[0].radius())
