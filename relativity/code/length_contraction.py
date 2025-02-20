#Web VPython 3.2

from vpython import canvas, rate, box, sphere, vector, gcurve, graph, color, sqrt, mag


title="""&#x2022; <a href="https://www.glowscript.org/#/user/wlane/folder/AAPT-visual/program/length-contraction">Original code</a> by <a href="https://www.youtube.com/@LetsCodePhysics">Let&apos;s code physics</a>
&#x2022; See also <a href="https://www.youtube.com/watch?v=yuECZzO0ZAE">his accompanying video</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/quantumphysics/code/length_contraction.py">length_contraction.py</a>

"""


display = canvas(title=title, background=color.gray(0.075), width=650, height=650, forward=vector(-0.7, 0, -.75))

c = 1

class SpaceTime:
    def __init__(self):
        self._scenery = []
        for x in range(-30, 30, 2):
            for y in range(5, 30, 5):
                for z in range(-10, 10, 5):
                    self._create_box(vector(1, 1, 1), vector(x, y, z), color.yellow)
                    self._create_box(vector(1, 1, 1), vector(x, -y, z), color.yellow)


    def _create_box(self, size, pos, col):
        self._scenery.append(box(pos=pos, size=size, color=col, restPos=pos, restSiz=size, opacity=0.5))

    def transform_with(self, gamma):
        for box_ in self._scenery:
            box_.size.x = box_.restSiz.x / gamma.x
            box_.size.y = box_.restSiz.y / gamma.y
            box_.size.z = box_.restSiz.z / gamma.z
            box_.pos.x = box_.restPos.x / gamma.x
            box_.pos.y = box_.restPos.y / gamma.y
            box_.pos.z = box_.restPos.z / gamma.z

class Particle:
    def __init__(self):
        self._sphere = sphere(radius=0.5, pos=vector(0, 3, 0), color=color.red, make_trail=True, retain=100)
        self._momentum = vector(-1, 0, 0)
        self._mass = 1.0

    def _relativity_factor(self):
        return 1.0 / sqrt(1.0 + (mag(self._momentum) ** 2 / (self._mass * self._mass * c *c)))

    def update_by(self, dt):
        k = 0.2  # spring stiffness
        force = -k * self._sphere.pos
        self._momentum += force * dt
        self._sphere.pos += self._relativity_factor() * self._momentum / self._mass * dt

    def velocity(self):
        return self._momentum / self._mass * self._relativity_factor()

    def gamma(self):
        velocity = self.velocity()
        gamma_ = vector(1 / sqrt(1 - (velocity.x / c) ** 2), 1 / sqrt(1 - (velocity.y / c) ** 2),
                       1 / sqrt(1 - (velocity.z / c) ** 2))
        return gamma_

    def position(self):
        return self._sphere.pos


space_time = SpaceTime()
relativistic_particle = Particle()

display.camera.follow(relativistic_particle._sphere)

display.append_to_caption("\n")
graph_ = graph(title="Particle position (red) and velocity (magenta)", width="650", height="2", background=color.black, xtitle="x-direction", ytitle="time")
pos_graph = gcurve(color=color.red)
vel_graph = gcurve(color=color.magenta)
MathJax.Hub.Queue(["Typeset", MathJax.Hub])

delta_t = 0.01
time = 0
while True:
    rate(250)
    relativistic_particle.update_by(delta_t)
    space_time.transform_with(relativistic_particle.gamma())
    time += delta_t
    pos_graph.plot(pos=(time, relativistic_particle.position().x))
    vel_graph.plot(pos=(time, relativistic_particle.velocity().x))

