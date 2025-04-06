#Web VPython 3.2
from vpython import simple_sphere, color, vector, cylinder, mag, norm, dot, cross, rate, sqrt, vec, box, canvas, graph, gcurve, random

title = """&#x2022; Based on code shown in <a href="https://www.youtube.com/watch?v=tP5u-V-BLQo">this video</a> by Jordan Huang
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
        self._oxygen = simple_sphere(pos=pos, radius=size, color=color.red)
        self._oxygen.m = oxygen_mass / 6E23
        self._oxygen.v = vector(initial_v * random(), initial_v * random(), initial_v * random())

        self._carbon = simple_sphere(pos=pos + axis, radius=size, color=color.blue)
        self._carbon.m = carbon_mass / 6E23
        self._carbon.v = vector(initial_v * random(), initial_v * random(), initial_v * random())

        self.bond = cylinder(pos=pos, axis=axis, radius=size / 2., color=color.white)
        self.bond.k = k_bond

    def bond_force_on_oxygen(self):
        return self.bond.k * (mag(self.bond.axis) - d) * norm(self.bond.axis)

    def time_lapse(self, dt):
        acceleration_carbon = -self.bond_force_on_oxygen() / self._carbon.m
        self._carbon.v += acceleration_carbon * dt
        self._carbon.pos += self._carbon.v * dt

        acceleration_oxygen = self.bond_force_on_oxygen() / self._oxygen.m
        self._oxygen.v += acceleration_oxygen * dt
        self._oxygen.pos += self._oxygen.v * dt

        self.bond.axis = self._carbon.pos - self._oxygen.pos
        self.bond.pos = self._oxygen.pos

    def com(self):  # center of mass
        return (self._carbon.pos * self._carbon.m + self._oxygen.pos * self._oxygen.m) / self.mass()

    def com_v(self):
        return (self._carbon.v * self._carbon.m + self._oxygen.v * self._oxygen.m) / self.mass()

    def v_P(self):
        return self.bond.k * (mag(self.bond.axis) - d) * (mag(self.bond.axis) - d) / 2

    def v_K(self):
        C = self._carbon.m * (dot(self._carbon.v - self.com_v(), self.bond.axis) / mag(self.bond.axis)) ** 2 / 2
        O = self._oxygen.m * (dot(self._oxygen.v - self.com_v(), self.bond.axis) / mag(self.bond.axis)) ** 2 / 2
        return C + O

    def r_K(self):
        C = self._carbon.m * (mag(cross(self._carbon.v - self.com_v(), self.bond.axis)) / mag(self.bond.axis)) ** 2 / 2
        O = self._oxygen.m * (mag(cross(self._oxygen.v - self.com_v(), self.bond.axis)) / mag(self.bond.axis)) ** 2 / 2
        return C + O

    def com_K(self):
        return .5 * self.mass() * dot(self.com_v(), self.com_v())

    def mass(self):
        return self._carbon.m + self._oxygen.m


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
energies = graph(width=600, align="left", ymin=0, background=color.black, title="Average energies")
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
    rate(300)
    for molecule in co_molecules:
        molecule.time_lapse(dt)

    for i in range(N - 1):  # The first N - 1 molecules
        for j in range(i + 1, N):  # From i + 1 to the last molecules, to avoid double checking
            carbon_1, oxygen_1, carbon_2, oxygen_2 = co_molecules[i]._carbon, co_molecules[i]._oxygen, co_molecules[j]._carbon, co_molecules[j]._oxygen
            if mag(carbon_1.pos - carbon_2.pos) <= 2 * size and dot(carbon_1.pos - carbon_2.pos, carbon_1.v - carbon_2.v) <= 0:
                carbon_1.v, carbon_2.v = collision(carbon_1, carbon_2)
            if mag(oxygen_1.pos - carbon_2.pos) <= 2 * size and dot(oxygen_1.pos - carbon_2.pos, oxygen_1.v - carbon_2.v) <= 0:
                oxygen_1.v, carbon_2.v = collision(oxygen_1, carbon_2)
            if mag(carbon_1.pos - oxygen_2.pos) <= 2 * size and dot(carbon_1.pos - oxygen_2.pos, carbon_1.v - oxygen_2.v) <= 0:
                carbon_1.v, oxygen_2.v = collision(carbon_1, oxygen_2)
            if mag(oxygen_1.pos - oxygen_2.pos) <= 2 * size and dot(oxygen_1.pos - oxygen_2.pos, oxygen_1.v - oxygen_2.v) <= 0:
                oxygen_1.v, oxygen_2.v = collision(oxygen_1, oxygen_2)

    for co_molecule in co_molecules:
        carbon_position = co_molecule._carbon.pos
        carbon_velocity = co_molecule._carbon.v
        if abs(carbon_position.x) >= L - size and carbon_position.x * carbon_velocity.x >= 0:
            co_molecule._carbon.v.x = -carbon_velocity.x
        if abs(carbon_position.y) >= L - size and carbon_position.y * carbon_velocity.y >= 0:
            co_molecule._carbon.v.y = -carbon_velocity.y
        if abs(carbon_position.z) >= L - size and carbon_position.z * carbon_velocity.z >= 0:
            co_molecule._carbon.v.z = -carbon_velocity.z

        oxygen_position = co_molecule._oxygen.pos
        oxygen_velocity = co_molecule._oxygen.v
        if abs(oxygen_position.x) >= L - size and oxygen_position.x * oxygen_velocity.x >= 0:
            co_molecule._oxygen.v.x = -oxygen_velocity.x
        if abs(oxygen_position.y) >= L - size and oxygen_position.y * oxygen_velocity.y >= 0:
            co_molecule._oxygen.v.y = -oxygen_velocity.y
        if abs(oxygen_position.z) >= L - size and oxygen_position.z * oxygen_velocity.z >= 0:
            co_molecule._oxygen.v.z = -oxygen_velocity.z

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
