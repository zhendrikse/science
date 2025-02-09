#Web VPython 3.2

from vpython import sphere, vector, rate, cylinder, mag, norm, color, canvas, box, gcurve

title = """ 
&#x2022; Original by <a href="https://trinket.io/glowscript/e5cf69a641">code</a> by Rhett Allain
&#x2022; See also his accompanying <a href="https://trinket.io/glowscript/e5cf69a641">video</a>
&#x2022; Refactored by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a>

"""

animation = canvas(align="top", background=color.gray(0.075), title=title, range=0.15, forward=vector(0.46, -0.05, -0.9), center=vector(0.11, -0.12, 0.09))


g = vector(0, -9.8, 0)
# Fdrag=-C*p
C = 1.2 # Drag coefficient

class Ball:
    def __init__(self, position, mass, radius):
        self._ball = sphere(pos=position, radius=radius, color=color.yellow)
        self._current_force = vector(0, 0, 0)
        self._momentum = vector(0, 0, 0)
        self._mass = mass

    def update_force(self, left_spring, right_spring, k, ds):
        self._current_force = self._mass * g - C * self._momentum - k * (mag(left_spring.axis) - ds) * norm(
            left_spring.axis) + k * (mag(right_spring.axis) - ds) * norm(right_spring.axis)

    def update_by(self, dt):
        self._momentum += self._current_force * dt
        self._ball.pos += self._momentum * dt / self._mass

    def distance_to(self, other_ball):
        return other_ball.position() - self._ball.pos

    def position(self):
        return self._ball.pos

class String:
    def __init__(self, ball_amount=20, mass=0.1, length=0.2, left_end=vector(0, 0, 0)):
        self._springs, self._balls = [], []
        self._K = 2
        self._length = length
        radius = length / ball_amount

        ds = vector(1, 0, 0) * length / (ball_amount - 1)
        for i in range(ball_amount - 1):
            self._springs += [cylinder(pos=left_end + i * ds, axis=ds, radius=radius / 5, color=color.yellow)]
        for i in range(ball_amount):
            self._balls += [Ball(left_end + i * ds, mass / ball_amount, .75 * radius)]

    def _update_ball_forces(self):
        # balls[0].F=-k*(mag(r11)-s)*norm(r11)+vector(-0.01,.002,0)
        # balls[-1].F=balls[-1].m*g-C*balls[-1].p-k*(mag(springs[-1].axis)-s)*norm(springs[-1].axis)
        ball_amount = len(self._balls) - 1 # First and last ball are fixed
        k = self._K * ball_amount
        ds = self._length / ball_amount
        for i in range(1, ball_amount):
            self._balls[i].update_force(self._springs[i - 1], self._springs[i], k, ds)

    def _increment_ball_positions_by(self, dt):
        for ball in self._balls:
            ball.update_by(dt)

    def _update_spring_positions(self):
        for i in range(1, len(self._balls)):
            self._springs[i - 1].axis = self._balls[i - 1].distance_to(self._balls[i])
            self._springs[i - 1].pos = self._balls[i - 1].position()

    def update_by(self, dt):
        #r11 = -springs[0].axis
        self._update_ball_forces()
        self._increment_ball_positions_by(dt)
        self._update_spring_positions()

    def length(self):
        chord_length = 0
        for i in range(1, len(self._balls)):
            chord_length += mag(self._balls[i].distance_to(self._balls[i - 1]))

        return chord_length

left_pole = cylinder(pos=vector(-0.02, -.275, 0), axis=vector(0, .3, 0), radius=0.0075, color=color.gray(0.4))
cylinder(pos=vector(-.05, .011, 0), axis=vector(0.06, 0, 0), radius=0.004, color=color.gray(0.5))

second_pole = cylinder(pos=vector(0.2 + 0.02, -.275, 0), axis=vector(0, .3, 0), radius=0.0075, color=color.gray(0.4))
cylinder(pos=vector(.19, .011, 0), axis=vector(0.06, 0, 0), radius=0.004, color=color.gray(0.5))
chord_1 = String()

third_pole = cylinder(pos=vector(0.460, -.275, 0), axis=vector(0, .3, 0), radius=0.0075, color=color.gray(0.4))
cylinder(pos=vector(.428, .011, 0), axis=vector(0.06, 0, 0), radius=0.004, color=color.gray(0.5))
chord_2 = String(left_end=vector(0.242, 0, 0))

grass = box(pos=vector(.5, -.3, -.5), color=color.green, height=0.01, length=2, width=2)
animation.append_to_caption("\n\n")

graph_ = graph(title="Chord length as function of time", xtitle="Time", ytitle="Length",  background=color.black)
length_curve = gcurve(color=color.yellow, width=1.5)


time = 0
delta_t = 0.001
while time < 10:
    rate(200)
    chord_1.update_by(delta_t)
    chord_2.update_by(delta_t)
    length_curve.plot(time, chord_2.length())
    time += delta_t


