#Web VPython 3.2
from vpython import simple_sphere, color, vector, cylinder, mag, norm, dot, cross, rate, sqrt, vec, box, canvas, graph, gcurve, random

title = """&#x2022; Based on code shown in <a href="https://www.youtube.com/watch?v=tP5u-V-BLQo">this video</a>
&#x2022; Refactored by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/thermodynamics/code/energy_equipartition.py">energy_equipartition.py</a>
&#x2022; The <span style="color: green">green curve</span> is the averaged kinetic energy of the center of mass
&#x2022; The <span style="color: red">red curve</span> is the averaged vibrational potential energy
&#x2022; The <span style="color: purple">purple curve</span> is the averaged vibrational kinetic energy
&#x2022; The <span style="color: blue">blue curve</span> is the averaged rotational kinetic energy

"""

display = canvas(title=title, width=600, height=600, background=color.gray(0.075), forward=vec(-.55, -.42, -.75), range=3.75E-10)

size, k_bond = 31E-12, 18600.0
d = 2.5 * size
N = 20
one_third = 1. / 3.
L = ((24.4E-3 / 6E23) * N) ** one_third / 50.  # 2L is the length of the cubic container box, the numer is made up
m = 14E-3 / 6E23  # Average mass of O and C
k, T = 1.38E-23, 298.0


class CarbonMonoxide:
    def __init__(self, oxygen_mass=16, carbon_mass=12, initial_v=sqrt(3 * k * T / m)):
        pos = vector(random() - .5, random() - .5, random() - .5) * L
        axis = vector(1. * d, 0, 0)
        self.O = simple_sphere(pos=pos, radius=size, color=color.red)
        self.C = simple_sphere(pos=pos + axis, radius=size, color=color.blue)
        self.bond = cylinder(pos=pos, axis=axis, radius=size / 2., color=color.white)
        self.O.m = oxygen_mass / 6E23
        self.C.m = carbon_mass / 6E23
        self.O.v = vector(initial_v * random(), initial_v * random(), initial_v * random())
        self.C.v = vector(initial_v * random(), initial_v * random(), initial_v * random())
        self.bond.k = k_bond

    def bond_force_on_oxygen(self):
        return self.bond.k * (mag(self.bond.axis) - d) * norm(self.bond.axis)

    def time_lapse(self, dt):
        self.C.a = -self.bond_force_on_oxygen() / self.C.m
        self.O.a = self.bond_force_on_oxygen() / self.O.m
        self.C.v += self.C.a * dt
        self.O.v += self.O.a * dt
        self.O.pos += self.O.v * dt
        self.C.pos += self.C.v * dt
        self.bond.axis = self.C.pos - self.O.pos
        self.bond.pos = self.O.pos

    def com(self):  # center of mass
        return (self.C.pos * self.C.m + self.O.pos * self.O.m) / self.mass()

    def com_v(self):
        return (self.C.v * self.C.m + self.O.v * self.O.m) / self.mass()

    def v_P(self):
        return self.bond.k * (mag(self.bond.axis) - d) * (mag(self.bond.axis) - d) / 2

    def v_K(self):
        C = self.C.m * (dot(self.C.v - self.com_v(), self.bond.axis) / mag(self.bond.axis)) ** 2 / 2
        O = self.O.m * (dot(self.O.v - self.com_v(), self.bond.axis) / mag(self.bond.axis)) ** 2 / 2
        return C + O

    def r_K(self):
        C = self.C.m * (mag(cross(self.C.v - self.com_v(), self.bond.axis)) / mag(self.bond.axis)) ** 2 / 2
        O = self.O.m * (mag(cross(self.O.v - self.com_v(), self.bond.axis)) / mag(self.bond.axis)) ** 2 / 2
        return C + O

    def com_K(self):
        return .5 * self.mass() * dot(self.com_v(), self.com_v())

    def mass(self):
        return self.C.m + self.O.m


def collision(a1, a2):
    distance = a2.pos - a1.pos
    distance_squared = dot(distance, distance)
    v1prime = a1.v - 2 * a2.m / (a1.m + a2.m) * -distance * dot(a1.v - a2.v, -distance) / distance_squared
    v2prime = a2.v - 2 * a1.m / (a1.m + a2.m) * distance * dot(a2.v - a1.v, distance) / distance_squared
    return v1prime, v2prime


# if __name__ == "__main__":
#     a = CarbonMonoxide(pos=vector(0, 0, 0), axis = vector(2.6 * size, 0, 0))
#     a.O.v = vector(1, 1, 0)
#     a.C.v = vector(2, -1, 0)
#     a.time_lapse(dt)
#     print(a.bond_force_on_O(), a.com(), a.v_P(), a.v_K(), a.r_K(), a.com_K())

container = box(length=2 * L, height=2 * L, width=2 * L, opacity=.4, color=vec(.5, 1, .5))
display.append_to_caption("\n")
energies = graph(width=600, align="left", ymin=0, background=color.black, xtitle="Average energies")
c_avg_com_K = gcurve(color=color.green)
c_avg_v_P = gcurve(color=color.red)
c_avg_v_K = gcurve(color=color.purple)
c_avg_r_K = gcurve(color=color.blue)

co_molecules = []
for _ in range(N):
    co_molecules += [CarbonMonoxide()]

#MathJax.Hub.Queue(["Typeset", MathJax.Hub])

times = 0  # number of loops that has been run
dt = 5E-16
t = 0
total_com_K, total_v_K, total_v_P, total_r_K = 0, 0, 0, 0
while True:
    rate(3000)
    for molecule in co_molecules:
        molecule.time_lapse(dt)

    for i in range(N - 1):  # The first N - 1 molecules
        for j in range(i + 1, N):  # From i + 1 to the last molecules, to avoid double checking
            carbon_1, oxygen_1, carbon_2, oxygen_2 = co_molecules[i].C, co_molecules[i].O, co_molecules[j].C, co_molecules[j].O
            if mag(carbon_1.pos - carbon_2.pos) <= 2 * size and dot(carbon_1.pos - carbon_2.pos, carbon_1.v - carbon_2.v) <= 0:
                carbon_1.v, carbon_2.v = collision(carbon_1, carbon_2)
            if mag(oxygen_1.pos - carbon_2.pos) <= 2 * size and dot(oxygen_1.pos - carbon_2.pos, oxygen_1.v - carbon_2.v) <= 0:
                oxygen_1.v, carbon_2.v = collision(oxygen_1, carbon_2)
            if mag(carbon_1.pos - oxygen_2.pos) <= 2 * size and dot(carbon_1.pos - oxygen_2.pos, carbon_1.v - oxygen_2.v) <= 0:
                carbon_1.v, oxygen_2.v = collision(carbon_1, oxygen_2)
            if mag(oxygen_1.pos - oxygen_2.pos) <= 2 * size and dot(oxygen_1.pos - oxygen_2.pos, oxygen_1.v - oxygen_2.v) <= 0:
                oxygen_1.v, oxygen_2.v = collision(oxygen_1, oxygen_2)

    for co_molecule in co_molecules:
        if abs(co_molecule.C.pos.x) >= L - size and co_molecule.C.pos.x * co_molecule.C.v.x >= 0:
            co_molecule.C.v.x = -co_molecule.C.v.x
        if abs(co_molecule.C.pos.y) >= L - size and co_molecule.C.pos.y * co_molecule.C.v.y >= 0:
            co_molecule.C.v.y = -co_molecule.C.v.y
        if abs(co_molecule.C.pos.z) >= L - size and co_molecule.C.pos.z * co_molecule.C.v.z >= 0:
            co_molecule.C.v.z = -co_molecule.C.v.z
        if abs(co_molecule.O.pos.x) >= L - size and co_molecule.O.pos.x * co_molecule.O.v.x >= 0:
            co_molecule.O.v.x = -co_molecule.O.v.x
        if abs(co_molecule.O.pos.y) >= L - size and co_molecule.O.pos.y * co_molecule.O.v.y >= 0:
            co_molecule.O.v.y = -co_molecule.O.v.y
        if abs(co_molecule.O.pos.z) >= L - size and co_molecule.O.pos.z * co_molecule.O.v.z >= 0:
            co_molecule.O.v.z = -co_molecule.O.v.z

    for co_molecule in co_molecules:
        total_com_K += co_molecule.com_K()
        total_v_K += co_molecule.v_K()
        total_v_P += co_molecule.v_P()
        total_r_K += co_molecule.r_K()

    t += dt
    times += 1
    c_avg_com_K.plot(times, total_com_K / times)
    c_avg_v_P.plot(times, total_v_P / times)
    c_avg_v_K.plot(times, total_v_K / times)
    c_avg_r_K.plot(times, total_r_K / times)
