#Web VPython 3.2

from vpython import canvas, simple_sphere, sqrt, rate, pi, color, arrow, label, box, vec, vector, random, log, slider, hat, graph, gcurve

title = """&#x2022; Based on this <a href="https://trinket.io/glowscript/22601b616b">original code</a>.
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/electronics/code/larmor_resistor.py">larmor_resistor.py</a>
&#x2022; Includes <a href="https://en.wikipedia.org/wiki/Larmor_formula">calculation of Larmor radiation</a>
&#x2022; Use the slider below to adjust the voltage.
"""

N = 150  # number of electrons (& # of cores) in wire segment
dt = 1e-16  # time step in seconds
loop_rate = 1e4
a = 63  # atomic weight of copper
aspectRatio = 8
density = 8.0e23  # electrons / m^3 in copper is 8.5e22
volume = N / density

one_over_three = 1. / 3.
wire_width = (volume / aspectRatio) ** one_over_three  # width of wire in meters
wire_length = aspectRatio * wire_width  # length of wire in meters
resistor_length = wire_length / 2
resistor_width = wire_width / 4

display = canvas(range=8.5e-8, title=title, background=color.gray(0.075), width=600, height=300, forward=vec(1.25, -.45, -.15), center=vec(0, -3.5e-8, 0))
display.append_to_title("&#x2022; Time slowed down by factor of " + str(round(loop_rate / dt / 1e18)) + "x10^18.\n")
display.append_to_title("&#x2022; Wire length: " + str(round(1e9 * wire_width)) + " nm\n")
display.append_to_title("&#x2022; Nominal resistance: " + str(round(a * 1.7e-27 * density * resistor_length / (resistor_width**2) / 1e6)) + " Mohms\n\n")

k_elec = 9e9  # coloumbic force constant
epsilon = 1 / (4 * pi * k_elec)
c = 3e8  # speed of light
totalEmission = 0
larmorScale = 1e6

#  attributes
kCore = 40  # elastic constant holding core in place
qe = 1.6e-19  # fundamental charge in coulombs
damping = 0.9  # fraction of velocity lost in collisions (radiated)

z = 29  # atomic number of material
datom = 10 * 140e-12  # diameter of Cu is 140e-12
spacing = (1 / density) ** one_over_three

electronSpeed = 1.6e6  # room temperature metal
coreSpeed = electronSpeed / sqrt(a * 1800)  # vibrational speed in m/s
fermiEnergy = 7 * 1.6e-19  # fermi energy for Copper about 7 eV
kT = 1.38e-23 * 300  # room temperature


# visible boxes
box_size = vec(wire_width, wire_width, (wire_length - resistor_length) / 2)
left = box(pos=vec(0, 0, (-resistor_length / 2) - ((wire_length - resistor_length) / 4)), size=box_size, opacity=0.15)
right = box(pos=vec(0, 0, (resistor_length / 2) + ((wire_length - resistor_length) / 4)), size=box_size, opacity=0.15)
resistor = box(pos=vec(0, 0, 0), size=vec(resistor_width, resistor_width, resistor_length), opacity=0.15)

voltage_across_wire = 250.0  # voltage across wire in V
volWire = left.size.x * left.size.y * left.size.z + right.size.x * right.size.y * right.size.z
volResist = resistor.size.x * resistor.size.y * resistor.size.z
resistFrac = volResist / (volWire + volResist)

class Core:
    def __init__(self, position, radius):
        self._core = simple_sphere(pos=position, radius=radius)
        self._vel = coreSpeed * vector.random()
        self._mass = a * 1.7e-27  # mass in kg (atomic weight of copper is 63)
        self._force = vec(0, 0, 0)  # force on core in N
        self._k = (kCore / 2) + kCore * random()
        self._startPos = position
        self._ke = 0
        self._pe = 0
        self._tote = 0
        self._emit = 0

    def pos(self):
        return self._core.pos

    def reset_force(self):
        self._force = -self._k * (self._core.pos - self._startPos)

    def update_force_with_electron_at(self, position):
        self._force += k_elec * qe_2 * hat(position - self._core.pos)

    def update_force_with_core_at(self, position):
        self._force += -k_elec * qe_2 * hat(position - self._core.pos)

    def update_energy(self):
        self._ke = .5 * self._mass * self._vel.mag2
        self._pe = .5 * kCore * (self._core.pos - self._startPos).mag2
        self._tote = self._ke + self._pe

    def larmor_power(self):
        beta = (1 / c) * self._vel
        gamma = 1.0 / sqrt(1 - beta.mag2)
        beta_dot = (self._force / self._mass) / c
        larmor_power = larmorScale * (2 / (6 * pi * epsilon * c)) * qe_2 * (gamma ** 6) * (
                    beta_dot.mag * beta_dot.mag - beta.cross(beta_dot).mag2)
        self._ke = max(0, self._ke - larmor_power * dt)
        self._vel = self._vel.norm() * sqrt(2 * self._ke / self._mass)
        self._emit = larmor_power
        return larmor_power

    def update(self, dt):
        self._vel += (self._force * dt) / self._mass
        self._core.pos += self._vel * dt

    def total_energy(self):
        return self._tote


class Electron:
    def __init__(self, position, radius):
        self._electron = simple_sphere(pos=position, radius=radius, color=color.yellow, make_trail=False, retain=10)
        # distribute energies as fermions
        self._energy = fermiEnergy + kT * log(1 / (random()) - 1)
        self._mass = 9.11e-31  # mass in kg
        electron_speed = sqrt(2 * self._energy / self._mass)
        self._vel = electron_speed * vector.random()
        self._force = vec(0, 0, 0)  # force on electron in N
        self._ke = 0
        self._pe = 0
        self._tote = 0
        self._emit = 0

    def reset_force(self, electric_field_in_wire_in_volt_per_m):
        self._force = - qe * electric_field_in_wire_in_volt_per_m

    def pos(self):
        return self._electron.pos

    def update_force_with_core_at(self, position):
        self._force += k_elec * qe_2 * hat(position - self._electron.pos)

    def update_force_with_electron_at(self, position):
        self._force += -k_elec * qe_2 * hat(position - self._electron.pos)

    def larmor_power(self):
        beta = (1 / c) * self._vel
        gamma = 1.0 / sqrt(1 - beta.mag2)
        beta_dot = (self._force / self._mass) / c
        larmor_power = larmorScale * (2 / (6 * pi * epsilon * c)) * qe_2 * (gamma ** 6) * (
                    beta_dot.mag ** 2 - beta.cross(beta_dot).mag2)
        self._ke = max(0, self._ke - larmor_power * dt)
        self._vel = self._vel.norm() * sqrt(2 * self._ke / self._mass)
        self._emit = larmor_power
        return larmor_power

    def update(self, dt):
        self._vel += (self._force * dt) / self._mass
        new_pos = self._electron.pos + self._vel * dt

        # deal with stray electrons outside of resistor (sigh)
        if (self.pos().z > -(resistor_length / 2)) and (self.pos().z < (resistor_length / 2)):
            if abs(self.pos().x) > (resistor_width / 2):
                if self._vel.z > 0:
                    new_pos.z = -(resistor_length / 2)
                    self._vel.z = - damping * self._vel.z
                else:
                    new_pos.z = (resistor_length / 2)
                    self._vel.z = - damping * self._vel.z

        if self.pos().z < -(resistor_length / 2) and new_pos.z < (-resistor_length / 2):
            # we are to left of the resistor and not moving into the resistor
            # check x and y boundaries in wire
            if new_pos.x < -(wire_width / 2) or new_pos.x > (wire_width / 2):
                self._vel.x = -damping * self._vel.x  # swap vel
                if self.pos().x < -(wire_width / 2): new_pos.x = -wire_width / 2
                if self.pos().x > (wire_width / 2): new_pos.x = wire_width / 2
            if new_pos.y < -(wire_width / 2) or new_pos.y > (wire_width / 2):
                self._vel.y = -damping * self._vel.y  # swap vel
                if self.pos().y < -(wire_width / 2): new_pos.y = -wire_width / 2
                if self.pos().y > (wire_width / 2): new_pos.y = wire_width / 2
            # check far left end of system - pass through to right
            if new_pos.z < -(wire_length / 2):
                # self._vel.z = - damping*self._vel.z
                new_pos.z = (wire_length / 2)
                # electron[trailIndex].make_trail = false

        elif self.pos().z > (resistor_length / 2) and new_pos.z > (resistor_length / 2):
            # we are to right of the resistor and not moving into the resistor
            # check x and y boundaries in wire
            if new_pos.x < -(wire_width / 2) or new_pos.x > (wire_width / 2):
                self._vel.x = -damping * self._vel.x  # swap vel
                if self.pos().x < -(wire_width / 2): new_pos.x = -wire_width / 2
                if self.pos().x > (wire_width / 2): new_pos.x = wire_width / 2
            if new_pos.y < -(wire_width / 2) or new_pos.y > (wire_width / 2):
                self._vel.y = -damping * self._vel.y  # swap vel
                if self.pos().y < -(wire_width / 2): new_pos.y = -wire_width / 2
                if self.pos().y > (wire_width / 2): new_pos.y = wire_width / 2
            # check far right end of system - pass through to left side
            if new_pos.z > (wire_length / 2):
                # self._vel.z = - damping*self._vel.z
                new_pos.z = -(wire_length / 2)
                # electron[trailIndex].make_trail = false

        if (resistor_length / 2) > self.pos().z > -(resistor_length / 2):
            if (resistor_length / 2) > new_pos.z > -(resistor_length / 2):
                # we are in the resistor and not moving out of it
                # check x and y boundaries in resistor
                if new_pos.x < -(resistor_width / 2) or new_pos.x > (resistor_width / 2):
                    self._vel.x = -damping * self._vel.x  # swap vel
                    if self.pos().x < -(resistor_width / 2): new_pos.x = -resistor_width / 2
                    if self.pos().x > (resistor_width / 2): new_pos.x = resistor_width / 2
                if new_pos.y < -(resistor_width / 2) or new_pos.y > (resistor_width / 2):
                    self._vel.y = -damping * self._vel.y  # swap vel
                    if self.pos().y < -(resistor_width / 2): new_pos.y = -resistor_width / 2
                    if self.pos().y > (resistor_width / 2): new_pos.y = resistor_width / 2

        if self.pos().z < -(resistor_length / 2) and new_pos.z >= (-resistor_length / 2):
            # we are to left of resistor and moving rightward - do we enter?
            if (abs(self.pos().x) > resistor_length / 2) or (abs(self.pos().y) > resistor_length / 2):
                # no we didn't fit
                self._vel.z = -damping * self._vel.z
                new_pos = vector(self.pos().x, self.pos().y, -resistor_length / 2)

        if self.pos().z > (resistor_length / 2) >= new_pos.z:
            # we are to right of resistor and moving leftward - do we enter?
            if (abs(self.pos().x) > resistor_length / 2) or (abs(self.pos().y) > resistor_length / 2):
                # no we didn't fit
                self._vel.z = -damping * self._vel.z
                new_pos = vector(self.pos().x, self.pos().y, resistor_length / 2)


        # now update position with new position
        self._electron.pos = new_pos

    def total_energy(self):
        return self._tote

    def update_energy(self):
        self._ke = .5 * self._mass * self._vel.mag2
        self._tote = self._ke


core = []
electron = []
for i in range(N):
    # distribute uniformly in density
    if random() < resistFrac:
        z = -(resistor_length / 2) + resistor_length * random()
        x = -(resistor_width / 2) + resistor_width * random()
        y = -(resistor_width / 2) + resistor_width * random()
    else:
        if random() < 0.5:
            z = -(wire_length / 2) + (wire_length / 4) * random()
        else:
            z = (wire_length / 2) - (wire_length / 4) * random()
        x = -(wire_width / 2) + wire_width * random()
        y = -(wire_width / 2) + wire_width * random()

    core.append(Core(vec(x, y, z), datom / 2))
    electron.append(Electron(core[i].pos() + 1.0 * spacing * vector.random().norm(), datom / 3))

measureOnce = False
initialEnergy = 0

# vector representing electric current
currentArrow = arrow(pos=vec(-5 * resistor_width, -5 * resistor_width, 0), axis=vec(0, 0, 0), color=color.yellow, opacity=0.5)

# text box representing voltage and current
voltageText = label(text='Potential: ' + str(voltage_across_wire), pos=vec(-10 * resistor_width, -5 * resistor_width, 0), box=False)
currentText = label(text='Current: ' + str(voltage_across_wire), pos=vec(-10 * resistor_width, -7 * resistor_width, 0), box=False)


def change_voltage(event):
    global voltage_across_wire
    voltage_across_wire = event.value

display.append_to_caption("\nElectric Potential:")
_ = slider(bind=change_voltage, min=0, value=voltage_across_wire, max=10 * voltage_across_wire)


# def change_resistor_width(event):
#  global resistor_width, resistor
#  resistor_width = event.value
#  resistor.size.x = resistor_width
#  resistor.size.y = resistor_width
#
# scene.append_to_caption("\n\nWire Width:")
# _ = slider(bind=change_resistor_width, min=0, value=resistor_width, max=5 * resistor_width)

qe_2 = qe * qe
while True:
    rate(loop_rate)

    # initialize and calculate forces acting on each
    for i in range(N):
        electron[i].reset_force((voltage_across_wire / wire_length) * vec(0, 0, 1))
        core[i].reset_force()

    for i in range(N):
        for j in range(i):
            # attraction of electrons to cores
            electron[i].update_force_with_core_at(core[j].pos())
            electron[j].update_force_with_core_at(core[i].pos())

            core[i].update_force_with_electron_at(electron[j].pos())
            core[j].update_force_with_electron_at(electron[i].pos())

            # repulsion of free electrons from each other
            electron[i].update_force_with_electron_at(electron[j].pos())
            electron[j].update_force_with_electron_at(electron[i].pos())

            # repulsion of cores from each other
            core[i].update_force_with_core_at(core[j].pos())
            core[j].update_force_with_core_at(core[i].pos())

    # Larmor radiation
    for i in range(N):
        if electron[i]._vel.mag > 0.1 * c:
            electron[i]._vel = 0.1 * c * electron[i]._vel.norm()

        core[i].update_energy()
        electron[i].update_energy()

        # let's radiate using Larmor's equation
        totalEmission += electron[i].larmor_power() * dt
        totalEmission += core[i].larmor_power() * dt

    # update velocities and positions
    totalEnergy = 0
    for i in range(N):
        core[i].update(dt)
        electron[i].update(dt)
        totalEnergy = totalEnergy + electron[i].total_energy() + core[i].total_energy()

    if not measureOnce:
        measureOnce = True
        initialEnergy = totalEnergy

    # color code by radiation
    coreScale = larmorScale * 0.10 * (1 / 2) * core[0]._mass * coreSpeed ** 2
    electronScale = larmorScale * 2e6 * (voltage_across_wire / 20) * k_elec * qe * qe / spacing

    for i in range(N):
        core[i]._core.color = vec(core[i]._emit / coreScale, 0.05, 0.05)
        electron[i]._electron.color = vec(0.05, electron[i]._emit / electronScale, electron[i]._emit / electronScale)

    # calculate current in resistor
    avgVel = 0
    numInR = 0
    for i in range(N):
        if abs(electron[i].pos().z < resistor_length / 2):
            avgVel = avgVel + electron[i]._vel.z
            numInR = numInR + 1
    avgVel = avgVel / numInR
    current = - (qe * avgVel)
    currentArrow.axis.z = current * 4e4

    voltageText.text = 'Potential: ' + str(round(voltage_across_wire)) + ' V'
    currentText.text = 'Current: ' + str(round(current * 1e15)) + ' fA'

    #print(totalEmission / initialEnergy)
