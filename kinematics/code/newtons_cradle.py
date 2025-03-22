from vpython import sphere, canvas, rate, color, vec, cylinder, dot, tan, acos, mag, graph, gcurve, textures, box

title="""&#x2022; Original code taken from <a href="https://www.youtube.com/watch?v=eEb3seVrJHQ/">this video</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/kinematics/code/newtons_cradle.py">newtons_cradle.py</a>

&#x2022; $\\theta(t)=\\theta_0 \\cos \\bigg( \\sqrt{  \\dfrac {g} {L}} t \\bigg)$

"""

display = canvas(title=title, width=600, height=600, background=color.gray(0.075), range=1.6, center=vec(.5, -1, .4), forward=vec(-.6, -.2, -.75))

ball_count = 5
lift_count = 3

k = 150000
g = 9.8

pivot_size = 0.06
rope_length = 2.

class Pendulum:
    def __init__(self, position, mass=1, radius=.2, trail=False):
        self._pivot = sphere(radius=pivot_size, color=color.orange, pos=position)
        self._ball = sphere(radius=radius, color=color.yellow, pos=position + vec(0, -2. - mass * g / k, 0), make_trail=trail)
        self._rope = cylinder(radius=0.05, pos=self._pivot.pos, axis=self._ball.pos - self._pivot.pos, texture=textures.wood)
        self._velocity = vec(0, 0, 0)
        self._mass = mass

    def lift(self, displacement):
        self._ball.pos.y = (-2. - self._mass * g * displacement / k) * displacement
        self._ball.pos.x -= abs(self._ball.pos.y) * tan(acos(displacement))
        self._rope.axis = self._ball.pos - self._pivot.pos

    def update(self, dt):
        # analyze external forces: tension from the rope(spring with large k) and gravity
        self._rope.axis = self._ball.pos - self._rope.pos
        tension = -k * (mag(self._rope.axis) - rope_length) * self._rope.axis.norm()
        acceleration = vec(0, -g, 0) + tension / self._mass
        self._velocity += acceleration * dt
        self._ball.pos += self._velocity * dt

    def pos(self):
        return self._ball.pos

    def velocity(self):
        return self._velocity

    def mass(self):
        return self._mass

    def radius(self):
        return self._ball.radius


ceiling = box(pos=vec(-0.125, 0.1, 0), size=vec(3, .1, 1), color=color.green)
pendulums = []
for i in range(ball_count):
    pendulums.append(Pendulum(vec(-.4 * (ball_count / 2) + i * .4, 0, 0)))


# Lift balls
amplitude = 1.90 # The smaller, the larger the amplitude!
amplitude /= 2.0
for i in range(lift_count):
    pendulums[i].lift(amplitude)

def after_collision_velocities(pendulum_1, pendulum_2):
    m1, m2 = pendulum_1.mass(), pendulum_2.mass()
    x1, x2 = pendulum_1.pos(), pendulum_2.pos()
    v1, v2 = pendulum_1.velocity(), pendulum_2.velocity()
    v1_prime = v1 + 2 * (m2 / (m1 + m2)) * (x1 - x2) * dot(v2 - v1, x1 - x2) / dot(x1 - x2, x1 - x2)
    v2_prime = v2 + 2 * (m1 / (m1 + m2)) * (x2 - x1) * dot(v1 - v2, x2 - x1) / dot(x2 - x1, x2 - x1)
    return v1_prime, v2_prime

def collision_happen(pendulum_1,  pendulum_2):
    size1, size2 = pendulum_1.radius(), pendulum_2.radius()
    pos1, pos2 = pendulum_1.pos(), pendulum_2.pos()
    v1, v2 = pendulum_1.velocity(), pendulum_2.velocity()
    return mag(pos1 - pos2) <= size1 + size2 and dot(pos1 - pos2, v1 - v2) <= 0

h = -2. - pendulums[0].mass() * g / k # gravitational potential = 0
KE, GP = [], [] # Gravitational potential and kinetic energy

display.append_to_caption("\n")
energy = graph(width=600, background=color.black, title="Kinetic and potential energy")
kinetic_energy = gcurve(graph=energy, color=color.blue, width=4)
gravitational_potential = gcurve(graph=energy, color=color.red, width=4)

averaged_energy = graph(width=600, background=color.black, title="Average kinetic and potential energy")
avg_kinetic_energy = gcurve(graph=averaged_energy, color=color.blue, width=4)
avg_gravitational_potential = gcurve(graph=averaged_energy, color=color.red, width=4)

#MathJax.Hub.Queue(["Typeset", MathJax.Hub])

t= 0
dt = 0.001
while True:
    rate(250)
    t += dt

    pendulums[0].update(dt)
    if collision_happen(pendulums[0], pendulums[1]):
        pendulums[0]._velocity, pendulums[1]._velocity = after_collision_velocities(pendulums[0], pendulums[1])

    for i in range(1, ball_count - 1):
        pendulums[i].update(dt)
        if collision_happen(pendulums[i], pendulums[i + 1]):
            pendulums[i]._velocity, pendulums[i + 1]._velocity = after_collision_velocities(pendulums[i], pendulums[i + 1])
        elif collision_happen(pendulums[i], pendulums[i - 1]):
            pendulums[i]._velocity, pendulums[i - 1]._velocity = after_collision_velocities(pendulums[i], pendulums[i - 1])

    pendulums[-1].update(dt)
    if collision_happen(pendulums[ball_count - 1], pendulums[ball_count - 2]):
        pendulums[ball_count - 1]._velocity, pendulums[ball_count - 2]._velocity = after_collision_velocities(pendulums[ball_count - 1], pendulums[ball_count - 2])

    ke_total = 0
    gp_total = 0
    for i in range(ball_count):
        ke_total += .5 * pendulums[i].mass() * dot(pendulums[i].velocity(), pendulums[i].velocity())
        gp_total += pendulums[i].mass() * g * (pendulums[i].pos().y - h)

    KE.append(ke_total)
    GP.append(gp_total)
    ke_avg = sum(KE) / len(KE)
    gp_avg = sum(GP) / len(GP)

    kinetic_energy.plot(t, ke_total)
    gravitational_potential.plot(t, gp_total)

    avg_kinetic_energy.plot(t, ke_avg)
    avg_gravitational_potential.plot(t, gp_avg)
