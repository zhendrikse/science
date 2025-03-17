from vpython import canvas, simple_sphere, sqrt, rate, pi, color, arrow, label, box, vec, vector, random, log, slider, hat, graph, gcurve

title = """&#x2022; Based on this <a href="https://trinket.io/glowscript/22601b616b">original code</a>.
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/electronics/code/resistor_2.py">resistor_2.py</a>
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
wire_width = (volume / aspectRatio) ** (1 / 3)  # width of wire in meters
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
spacing = (1 / density) ** (1 / 3)

electronSpeed = 1.6e6  # room temperature metal
coreSpeed = electronSpeed / sqrt(a * 1800)  # vibrational speed in m/s
fermiEnergy = 7 * 1.6e-19  # fermi energy for Copper about 7 eV
kT = 1.38e-23 * 300  # room temperature


# visible boxes
box_size = vec(wire_width, wire_width, (wire_length - resistor_length) / 2)
left = box(pos=vec(0, 0, (-resistor_length / 2) - ((wire_length - resistor_length) / 4)), size=box_size, opacity=0.15)
right = box(pos=vec(0, 0, (resistor_length / 2) + ((wire_length - resistor_length) / 4)), size=box_size, opacity=0.15)
resistor = box(pos=vec(0, 0, 0), size=vec(resistor_width, resistor_width, resistor_length), opacity=0.15)

# voltage applied
voltage_across_wire = 250.0  # voltage across wire in V

# create cores
core = []

volWire = left.size.x * left.size.y * left.size.z + right.size.x * right.size.y * right.size.z
volResist = resistor.size.x * resistor.size.y * resistor.size.z
resistFrac = volResist / (volWire + volResist)

for i in range(N):
    core.append(simple_sphere())

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

    core[i].pos = vec(x, y, z)
    core[i].radius = datom / 2
    core[i].vel = coreSpeed * vector.random()
    core[i].mass = a * 1.7e-27  # mass in kg (atomic weight of copper is 63)
    core[i].force = vec(0, 0, 0)  # force on core in N
    core[i].k = (kCore / 2) + (kCore) * random()
    core[i].startPos = core[i].pos
    core[i].ke = 0
    core[i].pe = 0
    core[i].tote = 0

# create electrons
electron = []
for i in range(N):
    electron.append(simple_sphere(pos=core[i].pos + 1.0 * spacing * vector.random().norm(), radius=datom / 6, color=color.yellow,
                         make_trail=False, retain=10))
    # distribute energies as fermions
    electron[i].energy = fermiEnergy + kT * log(1 / (random()) - 1)
    electron[i].mass = 9.11e-31  # mass in kg
    electronSpeed = sqrt(2 * electron[i].energy / electron[i].mass)
    electron[i].vel = electronSpeed * vector.random()
    electron[i].force = vec(0, 0, 0)  # force on electron in N
    electron[i].ke = 0
    electron[i].pe = 0
    electron[i].tote = 0

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
        Ewire = (voltage_across_wire / wire_length) * vec(0, 0, 1)  # electric field in wire in V/m
        electron[i].force = - qe * Ewire
        core[i].force = - core[i].k * (core[i].pos - core[i].startPos)

    # attraction of electrons to cores
    for i in range(N):
        for j in range(N):
            r = electron[i].pos - core[j].pos
            electron[i].force += - k_elec * qe_2 * hat(r)
            core[j].force += k_elec * qe_2 * hat(r)

    for i in range(N):
        for j in range(i):
            # repulsion of free electrons from each other
            r = electron[i].pos - electron[j].pos
            electron[i].force += k_elec * qe_2 * hat(r)
            electron[j].force += - k_elec * qe_2 * hat(r)

            # repulsion of cores from each other
            r = core[i].pos - core[j].pos
            core[i].force += k_elec * qe_2 * hat(r)
            core[j].force += - k_elec * qe_2 * hat(r)

    # Larmor radiation
    for i in range(N):
        if electron[i].vel.mag > 0.1 * c:
            electron[i].vel = 0.1 * c * electron[i].vel.norm()

        # calculate energies
        core[i].ke = (1 / 2) * core[i].mass * core[i].vel.mag2
        core[i].pe = (1 / 2) * kCore * (core[i].pos - core[i].startPos).mag2
        core[i].tote = core[i].ke + core[i].pe

        electron[i].ke = (1 / 2) * electron[i].mass * electron[i].vel.mag2
        electron[i].tote = electron[i].ke

        # let's radiate using Larmor's equation
        beta = (1 / c) * electron[i].vel
        gamma = 1.0 / sqrt(1 - beta.mag2)
        betaDot = (electron[i].force / electron[i].mass) / c
        larmorPower = larmorScale * (2 / (6 * pi * epsilon * c)) * qe_2 * (gamma ** 6) * (
                    betaDot.mag ** 2 - beta.cross(betaDot).mag2)
        electron[i].ke = max(0, electron[i].ke - larmorPower * dt)
        electron[i].vel = electron[i].vel.norm() * sqrt(2 * electron[i].ke / electron[i].mass)
        electron[i].emit = larmorPower
        totalEmission = totalEmission + larmorPower * dt

        # let's radiate using Larmor's equation
        beta = (1 / c) * core[i].vel
        gamma = 1.0 / sqrt(1 - beta.mag2)
        betaDot = (core[i].force / core[i].mass) / c
        larmorPower = larmorScale * (2 / (6 * pi * epsilon * c)) * qe_2 * (gamma ** 6) * (
                    betaDot.mag ** 2 - beta.cross(betaDot).mag2)
        core[i].ke = max(0, core[i].ke - larmorPower * dt)
        core[i].vel = core[i].vel.norm() * sqrt(2 * core[i].ke / core[i].mass)
        core[i].emit = larmorPower
        totalEmission = totalEmission + larmorPower * dt

    # update velocities and positions
    totalEnergy = 0
    for i in range(N):

        core[i].vel = core[i].vel + (core[i].force * dt) / core[i].mass
        core[i].pos = core[i].pos + core[i].vel * dt

        electron[i].vel = electron[i].vel + (electron[i].force * dt) / electron[i].mass
        electron[i].newpos = electron[i].pos + electron[i].vel * dt

        # deal with stray electrons outside of resistor (sigh)
        if (electron[i].pos.z > -(resistor_length / 2)) and (electron[i].pos.z < (resistor_length / 2)):
            if abs(electron[i].pos.x) > (resistor_width / 2):
                if electron[i].vel.z > 0:
                    electron[i].newpos.z = -(resistor_length / 2)
                    electron[i].vel.z = - damping * electron[i].vel.z
                else:
                    electron[i].newpos.z = (resistor_length / 2)
                    electron[i].vel.z = - damping * electron[i].vel.z

        if electron[i].pos.z < -(resistor_length / 2) and electron[i].newpos.z < (-resistor_length / 2):
            # we are to left of the resistor and not moving into the resistor
            # check x and y boundaries in wire
            if electron[i].newpos.x < -(wire_width / 2) or electron[i].newpos.x > (wire_width / 2):
                electron[i].vel.x = -damping * electron[i].vel.x  # swap vel
                if electron[i].pos.x < -(wire_width / 2): electron[i].newpos.x = -wire_width / 2
                if electron[i].pos.x > (wire_width / 2): electron[i].newpos.x = wire_width / 2
            if electron[i].newpos.y < -(wire_width / 2) or electron[i].newpos.y > (wire_width / 2):
                electron[i].vel.y = -damping * electron[i].vel.y  # swap vel
                if electron[i].pos.y < -(wire_width / 2): electron[i].newpos.y = -wire_width / 2
                if electron[i].pos.y > (wire_width / 2): electron[i].newpos.y = wire_width / 2
            # check far left end of system - pass through to right
            if electron[i].newpos.z < -(wire_length / 2):
                # electron[i].vel.z = - damping*electron[i].vel.z
                electron[i].newpos.z = (wire_length / 2)
                # electron[trailIndex].make_trail = false

        elif electron[i].pos.z > (resistor_length / 2) and electron[i].newpos.z > (resistor_length / 2):
            # we are to right of the resistor and not moving into the resistor
            # check x and y boundaries in wire
            if electron[i].newpos.x < -(wire_width / 2) or electron[i].newpos.x > (wire_width / 2):
                electron[i].vel.x = -damping * electron[i].vel.x  # swap vel
                if electron[i].pos.x < -(wire_width / 2): electron[i].newpos.x = -wire_width / 2
                if electron[i].pos.x > (wire_width / 2): electron[i].newpos.x = wire_width / 2
            if electron[i].newpos.y < -(wire_width / 2) or electron[i].newpos.y > (wire_width / 2):
                electron[i].vel.y = -damping * electron[i].vel.y  # swap vel
                if electron[i].pos.y < -(wire_width / 2): electron[i].newpos.y = -wire_width / 2
                if electron[i].pos.y > (wire_width / 2): electron[i].newpos.y = wire_width / 2
            # check far right end of system - pass through to left side
            if electron[i].newpos.z > (wire_length / 2):
                # electron[i].vel.z = - damping*electron[i].vel.z
                electron[i].newpos.z = -(wire_length / 2)
                # electron[trailIndex].make_trail = false

        if (resistor_length / 2) > electron[i].pos.z > -(resistor_length / 2):
            if (resistor_length / 2) > electron[i].newpos.z > -(resistor_length / 2):
                # we are in the resistor and not moving out of it
                # check x and y boundaries in resistor
                if electron[i].newpos.x < -(resistor_width / 2) or electron[i].newpos.x > (resistor_width / 2):
                    electron[i].vel.x = -damping * electron[i].vel.x  # swap vel
                    if electron[i].pos.x < -(resistor_width / 2): electron[i].newpos.x = -resistor_width / 2
                    if electron[i].pos.x > (resistor_width / 2): electron[i].newpos.x = resistor_width / 2
                if electron[i].newpos.y < -(resistor_width / 2) or electron[i].newpos.y > (resistor_width / 2):
                    electron[i].vel.y = -damping * electron[i].vel.y  # swap vel
                    if electron[i].pos.y < -(resistor_width / 2): electron[i].newpos.y = -resistor_width / 2
                    if electron[i].pos.y > (resistor_width / 2): electron[i].newpos.y = resistor_width / 2

        if electron[i].pos.z < -(resistor_length / 2) and electron[i].newpos.z >= (-resistor_length / 2):
            # we are to left of resistor and moving rightward - do we enter?
            if (abs(electron[i].pos.x) > resistor_length / 2) or (abs(electron[i].pos.y) > resistor_length / 2):
                # no we didn't fit
                electron[i].vel.z = -damping * electron[i].vel.z
                electron[i].newpos = vector(electron[i].pos.x, electron[i].pos.y, -resistor_length / 2)

        if electron[i].pos.z > (resistor_length / 2) >= electron[i].newpos.z:
            # we are to right of resistor and moving leftward - do we enter?
            if (abs(electron[i].pos.x) > resistor_length / 2) or (abs(electron[i].pos.y) > resistor_length / 2):
                # no we didn't fit
                electron[i].vel.z = -damping * electron[i].vel.z
                electron[i].newpos = vector(electron[i].pos.x, electron[i].pos.y, resistor_length / 2)


        # now update position with new position
        electron[i].pos = electron[i].newpos
        totalEnergy = totalEnergy + electron[i].tote + core[i].tote
    # if (electron[trailIndex].make_trail == false):
    # trailIndex = random(N)
    # electron[trailIndex].make_trail = true
    # electron[trailIndex].retain = 10

    if not measureOnce:
        measureOnce = True
        initialEnergy = totalEnergy

    # color code by radiation
    coreScale = larmorScale * 0.10 * (1 / 2) * core[0].mass * coreSpeed ** 2
    electronScale = larmorScale * 2e6 * (voltage_across_wire / 20) * k_elec * qe ** 2 / spacing

    for i in range(N):
        core[i].color = vec(core[i].emit / coreScale, 0.05, 0.05)
        electron[i].color = vec(0.05, electron[i].emit / electronScale, electron[i].emit / electronScale)

        # calculate current in resistor
    avgVel = 0
    numInR = 0
    for i in range(N):
        if abs(electron[i].pos.z < resistor_length / 2):
            avgVel = avgVel + electron[i].vel.z
            numInR = numInR + 1
    avgVel = avgVel / numInR
    current = - (qe * avgVel)
    currentArrow.axis.z = current * 4e4

    voltageText.text = 'Potential: ' + str(round(voltage_across_wire)) + ' V'
    currentText.text = 'Current: ' + str(round(current * 1e15)) + ' fA'

    #print(totalEmission / initialEnergy)
