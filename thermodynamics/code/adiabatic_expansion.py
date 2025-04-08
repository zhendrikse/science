#Web VPython 3.2

from vpython import simple_sphere, vector, sphere, color, graph, canvas, gcurve, rate, random, cos, mag, sqrt, log, pi, norm, arrow

title="""&#x2022; Based on <a href="https://trinket.io/glowscript/67ab1d3d88">this code on Trinket</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/thermodynamics/code/adiabatic_expansion.py">adiabatic_expansion.py</a>

"""

display = canvas(title=title, width=600, height=600, background=color.gray(0.075), forward=vector(-.75, -.15, -.75))

R = 1  # meter
m = 1  # kg
k = 10000  # Modeling Wall as a Powerful Spring

shell = sphere(pos=vector(0, 0, 0), radius=R, opacity=0.3, color=color.purple)
ishell = sphere(pos=vector(0, 0, 0), radius=R, opacity=0.1, color=color.red)
expansion_x = arrow(pos=vector(R, 0, 0), axis=vector(0, 0, 0), color=color.yellow, shaftwidth=.025)
expansion_y = arrow(pos=vector(0, R, 0), axis=vector(0, 0, 0), color=color.yellow, shaftwidth=.025)
expansion_z = arrow(pos=vector(0, 0, R), axis=vector(0, 0, 0), color=color.yellow, shaftwidth=.025)

display.append_to_caption("\n\n")
g1 = graph(xtitle="Time (s)", ytitle="KE (J)", background=color.black)
fK = gcurve(color=color.purple)
g2 = graph(xtitle="Time (s)", ytitle="Pressure (Pa)", background=color.black)
fP = gcurve(color=color.red)
g3 = graph(xtitle="Time(s)", ytitle="PV/KE", background=color.black)
fk = gcurve(color=color.green)

# Box-Muller Transform To Create a Normal Distribution
def normal(average, standard_deviation):
    u1 = random()
    u2 = random()
    vt = sqrt(-2 * log(u1)) * cos(2 * pi * u2)
    vt = vt * standard_deviation + average
    return vt

class Gas:
    def __init__(self, total_atoms=3000, initial_velocity=2):
        self._atoms = []

        for _ in range(total_atoms):
            rt = R * vector(2 * random() - 1, 2 * random() - 1, 2 * random() - 1)
            if mag(rt) < R:
                self._atoms += [simple_sphere(pos=rt, radius=R / 50, color=color.green)]

        for atom in self._atoms:
            atom.m = m
            v = normal(initial_velocity, 0.3)
            atom.p = atom.m * v * norm(vector(2 * random() - 1, 2 * random() - 1, 2 * random() - 1))
            atom.F = vector(0, 0, 0)


    def average_kinetic_energy(self):
        total_kinetic_energy = 0
        for atom in self._atoms:
            total_kinetic_energy += mag(atom.p) * mag(atom.p) / (2 * m)
        return total_kinetic_energy / len(self._atoms)


    def net_pressure(self, radius):
        net_force = 0
        for atom in self._atoms:
            net_force += mag(atom.F)
        surface_area = 4 * pi * radius * radius
        return net_force / surface_area

    def time_lapse(self, dt):
        for ball in self._atoms:
            r = ball.pos
            ball.F = -k * (mag(r) - R) * norm(r) if mag(r) > R else vector(0, 0, 0)
            ball.p += ball.F * dt
            ball.pos += ball.p / ball.m * dt


gas = Gas()
dv = 0.001  # change in volume (m^3)
t = 0
dt = 0.001
one_third = 1 / 3.
while t < 1000:
    rate(5000)
    print(display.forward)
    volume = 4 * pi * R * R * R / 3
    volume += dv
    R = ((0.75 * volume) / pi) ** one_third
    shell.radius = R

    gas.time_lapse(dt)
    expansion_x.axis, expansion_y.axis, expansion_z.axis = vector(R - 1, 0, 0), vector(0, R - 1, 0), vector(0, 0, R - 1)

    t += dt

    pressure = gas.net_pressure(R)
    kinetic_energy = gas.average_kinetic_energy()
    fK.plot(t, kinetic_energy)
    fP.plot(t, pressure)
    fk.plot(t, pressure * volume / kinetic_energy)


