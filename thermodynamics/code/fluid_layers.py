#Web VPython 3.2

from vpython import rate, sphere, vec, vector, box, canvas, color, random, sqrt, log, cos, pi, mag, norm

title = """ &#x2022; Based on original <a href="https://trinket.io/glowscript/d2383d5473?e=1">code on Trinket</a> and <a href="https://www.youtube.com/watch?v=62bcHdgz7xs">this video</a>
 &#x2022; Refactored by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/thermodynamics/code/fluid_layers.py">fluid_layers.py</a>

"""

animation = canvas(background=color.gray(0.075), range=10, title=title, forward=vec(0.5, 0.2, -.9), center=vec(0, 1, 0))

hollow = box(pos=vector(0, 0, 0), size=vector(5, 12, .01), opacity=0.1)
bowl = box(pos=vector(0, 0, 0), size=vector(22, 12, 7), opacity=0.1)
permeable_layer = box(pos=vector(0, 0, 0), size=vector(0.2, 12, 1), opacity=0.1, color=color.red)

box_size = .5 * vec(hollow.size.x, hollow.size.y, hollow.size.z)
K = 100000
drag = 800
E = vector(0, 0, 0)
k = 9e9
g = vector(0, -5000, 0)

# Box-Muller Transform To Create a Normal Distribution
def normal_distribution(average, standard_deviation):
    u1 = random()
    u2 = random()
    vt = sqrt(-2 * log(u1)) * cos(2 * pi * u2)
    vt *= standard_deviation + average
    return vt

class Particle:
    def __init__(self, position, radius, colour, mass=0.3):
        self._sphere = sphere(pos=position, radius=radius, color=colour)
        self._q0 = 1e-4
        self._mass = mass
        self._momentum = vec(0, 0, 0)
        self._force = vector(0, 0, 0)

    def initialize(self, v0):
        v = normal_distribution(v0, 1)
        if self._sphere.radius == 0.5:
            self._mass = 0.13
        elif self._sphere.radius == 0.4:
            self._mass = 0.08

        self._momentum = v * norm(vector(2 * random() - 1, 2 * random() - 1, 2 * random() - 1)) * self._mass
        self._sphere.radius = self._sphere.radius / 1.5

    def initialize_force(self):
        self._force = -self._momentum * drag + self._q0 * E + self._mass * g

    def update(self, dt):
        self._momentum += self._force * dt
        self._sphere.pos += self._momentum / self._mass * dt
        self._force = vector(0, 0, 0)

    def distance_to(self, other_ball):
        return other_ball._sphere.pos - self._sphere.pos

    def collide_with(self, other_ball):
        rt = self.distance_to(other_ball)
        if mag(rt) < 0.01:
            self._force = vector(0, 0, 0)
            return
        elif mag(rt) < 1.5:
            mag_rt_squared = mag(rt) * mag(rt)
            mag_rt_cubed = mag_rt_squared * mag(rt)
            self._force += k * self._q0 * other_ball._q0 * norm(rt) / mag_rt_squared
            self._force += -3 * k * self._q0 * other_ball._q0 * norm(rt) / mag_rt_cubed

    def process_box_collisions(self, dt):
        r = self._sphere.pos
        if r.x > box_size.x:
            self._force += -K * (abs(r.x) - box_size.x) * vector(1, 0, 0)
        if r.x < -box_size.x:
            self._force += K * (abs(r.x) - box_size.x) * vector(1, 0, 0)
        if r.y > box_size.y:
            self._force += -K * (abs(r.y) - box_size.y) * vector(0, 1, 0)
        if r.y < -box_size.y:
            self._force += K * (abs(r.y) - box_size.y) * vector(0, 1, 0)
        if r.z > box_size.z:
            self._force += -K * (abs(r.z) - box_size.z) * vector(0, 0, 1)
        if r.z < -box_size.z:
            self._force += K * (abs(r.z) - box_size.z) * vector(0, 0, 1)

        self._momentum += 7 * vector(2 * random() - 1, 2 * random() - 1, 2 * random() - 1)
        left_count = 0
        right_count = 0

        if self._sphere.size.x == 0.7 and r.x < permeable_layer.size.x:
            self._force += -K * (r.x - permeable_layer.size.x) * vector(1, 0, 0)

        if self._sphere.pos.x > permeable_layer.size.x:
            right_count += 1
        else:
            left_count += 1

        self._momentum += self._force * dt
        self._sphere.pos += self._momentum / self._mass * dt


class Jar:
    def __init__(self, total_balls=40, v0=0):
        self._balls = []
        self._create_balls(total_balls)
        self._initialize_ball_movements(v0)

    def _initialize_ball_movements(self, v0):
        for particle in self._balls:
            particle.initialize(v0)

    def _create_balls(self, total_balls):
        while len(self._balls) < total_balls:
            rt = 10 * vector(2 * random() - 1, 2 * random() - 1, 0)
            decider = random()
            if decider < 0.0 and rt.x > permeable_layer.size.x and abs(rt.x) <= box_size.x and abs(rt.y) <= box_size.y and abs(rt.z) <= box_size.z:
                self._balls += [box(pos=rt, size=vector(0.7, 0.7, 0.7), color=color.red)]
            elif abs(rt.x) <= box_size.x and abs(rt.y) <= box_size.y and abs(rt.z) <= box_size.z:
                self._balls += [Particle(position=rt, radius=0.6, colour=color.blue)]

        extra_balls = 30
        for _ in range(extra_balls):
            position = vector(2 * random() - 1, 2 * random() - 1, 0)
            self._balls += [Particle(position=position, radius=0.5, colour=color.yellow, mass=0.03)]
            position = vector(2 * random() - 1, 2 * random() - 1, 0)
            self._balls += [Particle(position=position, radius=0.4, colour=color.green, mass=0.01)]

    def update(self, dt):
        for i in range(len(self._balls)):
            self._balls[i].initialize_force()
            for j in range(len(self._balls)):
                if i == j: continue
                self._balls[i].collide_with(self._balls[j])

            self._balls[i].update(dt)

        for particle in self._balls:
            particle.process_box_collisions(dt)

jar = Jar()

time = 0
delta_t = 0.001
while time < 300:
    rate(10000)
    jar.update(delta_t)
    time += delta_t





