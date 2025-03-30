# Web VPython 3.2

from vpython import vertex, quad, triangle, radians, rate, vec, color, tan, cos, sin, canvas, mag, gdots, textures, graph, button, winput, box, sphere
title = """Ball rolling from sliding ramp with friction

&#x2022; Based on original <a href="https://github.com/Physics-Morris/Physics-Vpython/blob/master/1_Moving_Wedge.py">1_Moving_Wedge.py</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

"""

ball_mass, grav_constant, theta, friction_constant = 1.0, 9.8, 45, 0.0


class Wedge:
    def __init__(self, mass=3.0, ball_mass=1.0, theta=45, friction_constant=0.0):
        self._mass = mass
        self._theta = radians(theta)
        self._ball_mass = ball_mass
        self._friction = friction_constant

        A = vertex(pos=vec(0, 0, 0), color=color.orange, v=vec(0, 0, 0), a=vec(self._acceleration_x(), 0, 0))
        B = vertex(pos=vec(10 / tan(radians(theta)), 0, 0), color=color.purple, v=vec(0, 0, 0),
                   a=vec(self._acceleration_x(), 0, 0))
        C = vertex(pos=vec(10 / tan(radians(theta)), 0, 10), color=color.green, v=vec(0, 0, 0),
                   a=vec(self._acceleration_x(), 0, 0))
        D = vertex(pos=vec(0, 0, 10), color=color.blue, v=vec(0, 0, 0), a=vec(self._acceleration_x(), 0, 0))
        E = vertex(pos=vec(0, 10, 10), color=color.cyan, v=vec(0, 0, 0), a=vec(self._acceleration_x(), 0, 0))
        F = vertex(pos=vec(0, 10, 0), color=color.red, v=vec(0, 0, 0), a=vec(self._acceleration_x(), 0, 0))

        self._apex = [A, B, C, D, E, F]

        T1 = triangle(v0=E, v1=D, v2=C)
        T2 = triangle(v0=F, v1=A, v2=B)
        Q1 = quad(v0=F, v1=E, v2=D, v3=A)
        Q2 = quad(v0=F, v1=E, v2=C, v3=B)
        Q3 = quad(v0=A, v1=B, v2=C, v3=D)

    def update(self, dt):
        for i in range(0, len(self._apex)):
            self._apex[i].v.x += self._apex[i].atom.x * dt
            self._apex[i].pos.x += self._apex[i].v.x * dt

    def zero_acceleration(self):
        for i in range(0, len(self._apex)):
            self._apex[i].atom = vec(0, 0, 0)

    def acceleration_ball(self):
        acceleration_ball_x = self._acceleration_ball() * cos(self._theta) + self._acceleration_x()
        acceleration_ball_y = -self._acceleration_ball() * sin(self._theta)

        return vec(acceleration_ball_x, acceleration_ball_y, 0)

    def _acceleration_ball(self):
        theta = self._theta
        total_mass = self._ball_mass + self._mass
        net_mass = self._mass * (cos(theta) * cos(theta) + self._friction * sin(theta) * cos(theta)) / (total_mass) / (
                    sin(theta) - self._friction * cos(theta)) + sin(theta)
        return grav_constant / net_mass

    def _acceleration_x(self):
        total_mass = self._ball_mass + self._mass

        if self._friction >= tan(self._theta):
            return 0.0

        force_on_wedge = -self._acceleration_ball() * self._ball_mass * cos(self._theta)
        return force_on_wedge / total_mass

    def with_new_parameters(self, theta, friction, mass_wedge, mass_ball):
        self._friction = friction
        self._ball_mass = mass_ball
        self._mass = mass_wedge
        self._theta = radians(theta)
        self._apex[0].pos, self._apex[1].pos, self._apex[2].pos, self._apex[3].pos, self._apex[4].pos, self._apex[
            5].pos = vec(0, 0, 0), vec(10 / tan(radians(theta)), 0, 0), vec(10 / tan(radians(theta)), 0, 10), vec(0, 0,
                                                                                                                  10), vec(
            0, 10, 10), vec(0, 10, 0)

        for i in range(0, len(self._apex)):
            self._apex[i].atom.x = self._acceleration_x()
            self._apex[i].v = vec(0, 0, 0)

    def velocity(self):
        return self._apex[0].v.x  # all points of wedge move at equal velocity

    def kinetic_energy(self):
        return 0.5 * self._mass * self.velocity() * self.velocity()

    def mass(self):
        return self._mass


def set_scene():
    global scene
    scene = canvas(background=color.gray(0.075))
    scene.camera.pos = vec(30, 10, 40)
    scene.camera.axis = vec(-5, -10, -30)


def Run(r):
    global running
    running = not running
    if running:
        r.text = "Pause"
    else:
        r.text = "Run"


def restart():
    theta_tmp, friction_tmp, M_tmp, m_tmp = theta_input_field.number, friction_input_field.number, wedge_mass_input_field.number, ball_mass_input_field.number
    if theta_tmp is None: theta_tmp = theta
    if friction_tmp is None: friction_tmp = friction_constant
    if M_tmp is None: M_tmp = wedge.mass()
    if m_tmp is None: m_tmp = ball_mass

    global running
    global t
    running = False
    b1.text = "Run"
    t = 0
    plot_ball_velocity_x.delete()
    plot_wedge_velocity_x.delete()
    # m_p.delete()
    # M_p.delete()
    plot_energy_total.delete()
    plot_energy_ball.delete()
    plot_energy_wedge.delete()

    wedge.with_new_parameters(theta_tmp, friction_tmp, M_tmp, m_tmp)
    ball.v, ball.pos, ball.atom.x, ball.atom.y = vec(0, 0, 0), vec(1.5 / sin(radians(theta_tmp)), 10,
                                                                   5), wedge.acceleration_ball().x, wedge.acceleration_ball().y


def get_parameter_values():
    theta_tmp, friction_tmp, M_tmp, m_tmp = theta_input_field.number, friction_input_field.number, wedge_mass_input_field.number, ball_mass_input_field.number
    if theta_tmp is None: theta_tmp = theta
    if friction_tmp is None: friction_tmp = friction_constant
    if M_tmp is None: M_tmp = wedge.mass()
    if m_tmp is None: m_tmp = ball_mass
    if theta_tmp > 80 or theta_tmp < 10: theta_tmp = theta
    return theta_tmp, friction_tmp, M_tmp, m_tmp


def new_parameter_value():
    theta_tmp, friction_tmp, M_tmp, m_tmp = get_parameter_values()
    wedge.with_new_parameters(theta_tmp, friction_tmp, M_tmp, m_tmp)
    ball.pos.x = 1.5 / sin(radians(theta_tmp))
    ball.atom.x, ball.atom.y = wedge.acceleration_ball().x, wedge.acceleration_ball().y


set_scene()

running = False
wedge = Wedge()

scene.append_to_caption('      ')
b1 = button(text="Run", bind=Run, background=color.cyan)

scene.append_to_caption('      ')
b2 = button(text="Restart", bind=restart, background=color.cyan)

scene.append_to_caption('\n\nM =     ')
wedge_mass_input_field = winput(bind=new_parameter_value, type='numeric')

scene.append_to_caption('\n\nm =     ')
ball_mass_input_field = winput(bind=new_parameter_value, type='numeric')

scene.append_to_caption('\n\nAngle of wedge(10~80):')
theta_input_field = winput(bind=new_parameter_value, type='numeric')

scene.append_to_caption(' Degree\n')

scene.append_to_caption('\n\nCoefficient of friction on the slope: ')
friction_input_field = winput(bind=new_parameter_value, type='numeric')

scene.append_to_caption(
    '<i>\n\n(Please press enter after setting each parameter, otherwise \n it will run on default parameter)</i>')
scene.append_to_caption('\n\n\n\n\n')

floor = box(pos=vec(0, 0, 0), size=vec(300, 1, 30), color=color.blue, v=vec(0, 0, 0),
            a=vec(0, 0, 0))

ball = sphere(pos=vec(1.5 / sin(radians(theta)), 10, 5), radius=1.5, v=vec(0, 0, 0),
              a=wedge.acceleration_ball(),
              texture=textures.wood)

g1 = graph(title='<b>Velocity (x direction), ball=red, wedge=green</b>',
           xtitle='<b>time</b>', ytitle='<b>P</b>',
           align='left', width=500, height=300)

g2 = graph(title='<b>Energy, ball=blue, wedge=red, total=green<b>', xtitle='<b>time</b>',
           ytitle='<b>E</b>', align='left', width=500, height=300)

plot_ball_velocity_x = gdots(graph=g1, color=color.red)
plot_wedge_velocity_x = gdots(graph=g1, color=color.green)
plot_energy_ball = gdots(graph=g2, color=color.blue)
plot_energy_wedge = gdots(graph=g2, color=color.red)
plot_energy_total = gdots(graph=g2, color=color.green)

dt = 0.01
t = 0
while True:
    rate(1 / dt)
    running = running if ball.pos.x < 50 else False

    if running:
        ball.v += ball.atom * dt
        ball.pos += ball.v * dt
        wedge.update(dt)

        if ball.pos.y <= ball.radius + floor.size.y / 2:
            # Ball has left ramp
            ball.v = vec(mag(ball.v), 0, 0)
            ball.atom = vec(0, 0, 0)
            ball.up = vec(0, 1, 0)
            ball.pos += ball.v * dt

            wedge.zero_acceleration()
            wedge.update(dt)

        if wedge_mass_input_field.number is None:
            tmp_M = wedge.mass()
        else:
            tmp_M = wedge_mass_input_field.number
        if ball_mass_input_field.number is None:
            tmp_m = ball_mass
        else:
            tmp_m = ball_mass_input_field.number

        plot_ball_velocity_x.plot(pos=(t, ball.v.x))
        plot_wedge_velocity_x.plot(pos=(t, wedge.velocity()))

        K = 0.5 * tmp_m * (ball.v.x ** 2 + ball.v.y ** 2) + wedge.kinetic_energy()
        U = tmp_m * grav_constant * (ball.pos.y - (ball.radius + floor.size.y / 2))

        plot_energy_ball.plot(pos=(t, K))
        plot_energy_wedge.plot(pos=(t, U))
        plot_energy_total.plot(pos=(t, K + U))

        t += dt
