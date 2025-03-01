from vpython import canvas, helix, sphere, color, mag, norm, cos, sin, pi, rate, arrow, acos, dot, vector, radio, button

# https://www.mso.anu.edu.au/pfrancis/simulations/co2.py

spacing = 1.0E-10
k = 8.0E-4  # Tension compression constant
kt = 3.0E-5  # Torsion constant
u = 1.660E-27
ioncharge = 1.0 * 1.602E-19
rad = 3.0E-11

scale = 2.0 * spacing
display = canvas(range=scale * .65, width=600, height=400, background=color.gray(0.075), center=vector(scale * .2, 0, 0))

theta = 30. * pi / 180.0

class Carbon:
    def __init__(self):
        self._oxy1 = sphere()
        self._oxy1.pos = vector(spacing * cos(theta), spacing * sin(theta), 0.)
        self._oxy1.mass = 16.0 * u
        self._oxy1.charge = ioncharge
        self._oxy1.p = vector(0., 0., 0.)
        self._oxy1.color = color.green
        self._oxy1.radius = rad
        #self._oxy1pos0 = self._oxy1.pos.y

        self._oxy2 = sphere()
        self._oxy2.pos = -1.0 * self._oxy1.pos
        self._oxy2.mass = 16.0 * u
        self._oxy2.charge = ioncharge
        self._oxy2.p = vector(0., 0., 0.)
        self._oxy2.color = color.green
        self._oxy2.radius = rad

        self._carb1 = sphere()
        self._carb1.pos = vector(0., 0.0 * spacing, 0.)
        self._carb1.mass = 12.0 * u
        self._carb1.charge = -2.0 * ioncharge
        self._carb1.p = vector(0., 0., 0.)
        self._carb1.color = color.red
        self._carb1.radius = 0.8 * rad

        self._spring1 = helix(pos=self._carb1.pos, axis=self._oxy1.pos - self._carb1.pos, radius=0.3 * rad,
                        thickness=0.1 * rad, color=color.yellow, coils=10)

        self._spring2 = helix(pos=self._carb1.pos, axis=self._oxy2.pos - self._carb1.pos, radius=0.3 * rad,
                        thickness=0.1 * rad, color=color.yellow, coils=10)

    def reset(self):
        self._oxy1.pos = vector(spacing * cos(theta), spacing * sin(theta), 0.)
        self._oxy2.pos = -1.0 * self._oxy1.pos
        self._carb1.pos = vector(0., 0.0 * spacing, 0.)

        self._carb1.p = vector(0., 0., 0.)
        self._oxy1.p = vector(0., 0., 0.)
        self._oxy2.p = vector(0., 0., 0.)

        #self._oxy1pos0 = self._oxy1.pos.y

    def update(self, E):
        v1 = self._oxy1.pos - self._carb1.pos
        v2 = self._oxy2.pos - self._carb1.pos

        angle = acos(dot(v1, -1.0 * v2) / (v1.mag * v2.mag))

        # Oxy1 forces
        coulomb_force = self._oxy1.charge * E
        stretch_force = -1.0 * k * (mag(v1) - spacing) * norm(v1)
        torque_force = -1.0 * kt * spacing * angle * norm(v1 + v2)

        self._oxy1.p += timestep * (coulomb_force + stretch_force + torque_force)
        self._oxy1.pos += timestep * self._oxy1.p / self._oxy1.mass

        # Oxy2 forces
        coulomb_force = self._oxy2.charge * E
        stretch_force = -1.0 * k * (mag(v2) - spacing) * norm(v2)
        torque_force = -1.0 * kt * spacing * angle * norm(v1 + v2)

        self._oxy2.p += timestep * (coulomb_force + stretch_force + torque_force)
        self._oxy2.pos += timestep * self._oxy2.p / self._oxy2.mass

        # Carb1 forces
        coulomb_force = self._carb1.charge * E
        stretch_force = k * (mag(v1) - spacing) * norm(v1) + k * (mag(v2) - spacing) * norm(v2)
        torque_force = 2.0 * kt * spacing * angle * norm(v1 + v2)

        self._carb1.p += timestep * (coulomb_force + stretch_force + torque_force)
        self._carb1.pos += timestep * self._carb1.p / self._carb1.mass

        # Update springs
        self._spring1.pos = self._carb1.pos
        self._spring1.axis = v1

        self._spring2.pos = self._carb1.pos
        self._spring2.axis = v2

carbon_atom = Carbon()

evector = arrow(pos=vector(1.7 * spacing, 0., 0.), axis=vector(0., 0., 0.), shaftwidth=0.1 * spacing, color=color.magenta)

E0 = 200.0  # 200

frequency = 8.0
frequency *= (2.0 * pi) * 1.00001E10

timestep = 1.0E-13

def toggle_frequency(event):
    global frequency
    if event.name == "8": # Nothing happens
        frequency = 8.0
        radio_2.checked = radio_3.checked = radio_4.checked = False
    if event.name == "5.291": # Linear vibrations
        frequency = 5.291
        radio_1.checked = radio_3.checked = radio_4.checked = False
    if event.name == "1.5": # Bending
        frequency = 1.5
        radio_1.checked = radio_2.checked = radio_4.checked = False
    if event.name == "2.76": # non-active sym
        frequency = 2.76
        radio_1.checked = radio_2.checked = radio_3.checked = False
    frequency *= (2.0 * pi) * 1.00001E10


display.append_to_caption("Frequency: ")
radio_1 = radio(text="8  ", name="8", bind=toggle_frequency, checked=True)
radio_2 = radio(text="5.291  ", name="5.291", bind=toggle_frequency)
radio_3 = radio(text="1.5  ", name="1.5", bind=toggle_frequency)
radio_4 = radio(text="2.76  ", name="2.76", bind=toggle_frequency)
_ = button(text="Reset", bind=carbon_atom.reset)

time = 0
flag = True
old = 0.
while 1:
    rate(500)

    time += timestep
    E = E0 * cos(time * frequency) * vector(0., 1., 0.)
    evector.axis = 0.5 * spacing * E / E0

    if flag and (carbon_atom._carb1.pos.y < 0):
        new_ = time
        flag = 0
        # print 1.0e-10/(new-old)
    elif not flag and (carbon_atom._carb1.pos.y > 0):
        flag = 1
        old = new_

    carbon_atom.update(E)
